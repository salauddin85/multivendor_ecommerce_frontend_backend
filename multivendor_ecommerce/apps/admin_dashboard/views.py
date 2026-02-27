from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny,IsAdminUser
from rest_framework import status
import logging
from apps.activity_log.utils.functions import log_request
from . import serializers
from .models import *
from config.utils.pagination import CustomPageNumberPagination
from apps.authentication.models import Customer
from apps.products.models import Product,ProductVariant
logger = logging.getLogger("myapp")
           
from datetime import datetime, timedelta
from decimal import Decimal

from django.db.models import Sum, Count, Avg, Q, F, OuterRef, Prefetch
from django.utils import timezone
from rest_framework import status

from apps.orders.models import Order, OrderItem
from apps.products.models import Product, ProductAnalytics
from apps.stores.models import Store
from apps.authentication.models import CustomUser
from apps.payments.models import Payment, WithdrawalRequest, RefundRequest
from apps.orders.models import ShippingAddress
from .serializers import (
    DashboardStatsSerializer, RevenueDataSerializer,
    TopProductSerializer, RecentOrderSerializer,
    StockAlertSerializer, PendingActionSerializer,
    CustomerAcquisitionSerializer, SalesByRegionSerializer
)
from apps.products.utils.permissions import ProductManagementPermission


class AllProductsView(APIView):
    """
        Get all products requests view
    """

    permission_classes = [IsAuthenticated,ProductManagementPermission]

    def get(self, request):
        try:
            instances = Product.objects.select_related('brand','category','store').all().order_by("id")
            paginator = CustomPageNumberPagination()
            result_page = paginator.paginate_queryset(instances, request)
            serializer = serializers.AllProductSerializer(
                result_page, many=True)
            return paginator.get_paginated_response({
                "code": 200,
                "status": "success",
                "message": "All products fetched successfully",
                "data": serializer.data
            }, status=200)
        except Exception as e:
            logging.exception(str(e))
            log_request(request, "operation failed due to server error",
                        "error", "operation failed due to server error", response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response({'errors': {
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'status': "failed",
                'message': "Error occurred",
                'errors': {
                    "server_error": [str(e)]
                }
            }}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
            
class AllVariantsView(APIView):
    """
        Get all variants requests view
    """

    permission_classes = [IsAuthenticated,IsAdminUser]

    def get(self, request):
        try:
            instances = ProductVariant.objects.select_related('product').all().order_by("id")
            paginator = CustomPageNumberPagination()
            result_page = paginator.paginate_queryset(instances, request)
            serializer = serializers.AllProductVariantSerializer(
                result_page, many=True)
            return paginator.get_paginated_response({
                "code": 200,
                "status": "success",
                "message": "All product variants fetched successfully",
                "data": serializer.data
            }, status=200)
        except Exception as e:
            logging.exception(str(e))
            log_request(request, "operation failed due to server error",
                        "error", "operation failed due to server error", response_status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response({'errors': {
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'status': "failed",
                'message': "Error occurred",
                'errors': {
                    "server_error": [str(e)]
                }
            }}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            
            
 


class AdminDashboardStatsView(APIView):
    """
    Get main dashboard statistics
    """
    
    def get(self, request):
        try:
            today = timezone.now().date()
            last_month = today - timedelta(days=30)
            
            # Calculate totals
            total_revenue = Order.objects.filter(
                payment_status='paid',
                created_at__date__gte=last_month
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            
            total_orders = Order.objects.filter(
                created_at__date__gte=last_month
            ).count()
            
            active_vendors = Store.objects.filter(
                status='active',
                created_at__date__gte=last_month
            ).count()
            
            low_stock_items = Product.objects.filter(
                stock__lte=10,
                status='published'
            ).count()
            
            # Calculate changes
            previous_month = last_month - timedelta(days=30)
            prev_revenue = Order.objects.filter(
                payment_status='paid',
                created_at__date__gte=previous_month,
                created_at__date__lt=last_month
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            
            prev_orders = Order.objects.filter(
                created_at__date__gte=previous_month,
                created_at__date__lt=last_month
            ).count()
            
            prev_vendors = Store.objects.filter(
                status='active',
                created_at__date__gte=previous_month,
                created_at__date__lt=last_month
            ).count()
            
            prev_low_stock = Product.objects.filter(
                stock__lte=10,
                status='active',
                updated_at__date__gte=previous_month,
                updated_at__date__lt=last_month
            ).count()
            
            stats_data = {
                'total_revenue': float(total_revenue),
                'total_orders': total_orders,
                'active_vendors': active_vendors,
                'low_stock_items': low_stock_items,
                'revenue_change': self._calculate_change(prev_revenue, total_revenue),
                'orders_change': self._calculate_change(prev_orders, total_orders),
                'vendors_change': self._calculate_change(prev_vendors, active_vendors),
                'stock_change': self._calculate_change(prev_low_stock, low_stock_items, reverse=True)
            }
            
            serializer = DashboardStatsSerializer(stats_data)
            
            return Response({
                "code": status.HTTP_200_OK,
                "status": "success",
                "message": "Dashboard statistics fetched successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.exception(str(e))
            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "status": "error",
                "message": "Failed to fetch dashboard statistics",
                "errors": {"server_error": [str(e)]}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _calculate_change(self, previous, current, reverse=False):
        if previous == 0:
            return '+100%' if current > 0 else '0%'
        
        change = ((current - previous) / previous) * 100
        if reverse:
            change = -change
        
        return f"{'+' if change >= 0 else ''}{change:.1f}%"


class AdminRevenueDataView(APIView):
    """
    Get revenue data for charts
    """
    
    def get(self, request):
        try:
            period = request.query_params.get('period', 'weekly')
            
            today = timezone.now().date()
            
            if period == 'daily':
                start_date = today
                data = self._get_hourly_revenue(start_date)
            elif period == 'weekly':
                start_date = today - timedelta(days=6)
                data = self._get_daily_revenue(start_date, 7)
            else:  # monthly
                start_date = today - timedelta(days=29)
                data = self._get_daily_revenue(start_date, 30)
            
            serializer = RevenueDataSerializer(data, many=True)
            
            return Response({
                "code": status.HTTP_200_OK,
                "status": "success",
                "message": "Revenue data fetched successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.exception(str(e))
            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "status": "error",
                "message": "Failed to fetch revenue data",
                "errors": {"server_error": [str(e)]}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_hourly_revenue(self, date):
        data = []
        for hour in range(24):
            start_time = timezone.make_aware(datetime.combine(date, datetime.min.time())) + timedelta(hours=hour)
            end_time = start_time + timedelta(hours=1)
            
            revenue = Order.objects.filter(
                created_at__range=(start_time, end_time),
                payment_status='paid'
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            
            orders = Order.objects.filter(
                created_at__range=(start_time, end_time)
            ).count()
            
            data.append({
                'date': f'{hour}:00',
                'revenue': float(revenue),
                'orders': orders
            })
        return data
    
    def _get_daily_revenue(self, start_date, days):
        data = []
        for i in range(days):
            current_date = start_date + timedelta(days=i)
            
            revenue = Order.objects.filter(
                created_at__date=current_date,
                payment_status='paid'
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            
            orders = Order.objects.filter(
                created_at__date=current_date
            ).count()
            
            data.append({
                'date': current_date.strftime('%a' if days <= 7 else '%d %b'),
                'revenue': float(revenue),
                'orders': orders
            })
        return data


class AdminTopProductsView(APIView):
    """
    Get top selling products
    """
    
    def get(self, request):
        try:
            today = timezone.now().date()
            start_date = today - timedelta(days=30)
            
            top_products = OrderItem.objects.filter(
                order__created_at__date__gte=start_date,
                order__status='delivered'
            ).values(
                'product__id', 'product__title', 'product__category__name'
            ).annotate(
                total_sales=Sum('quantity'),
                total_revenue=Sum('subtotal'),
                current_stock=models.Avg('product__stock'),
                growth=models.Avg('product__analytics__sales_count')
            ).order_by('-total_revenue')[:5]
            
            serializer = TopProductSerializer(top_products, many=True)
            
            return Response({
                "code": status.HTTP_200_OK,
                "status": "success",
                "message": "Top products fetched successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.exception(str(e))
            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "status": "error",
                "message": "Failed to fetch top products",
                "errors": {"server_error": [str(e)]}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminRecentOrdersView(APIView):
    """
    Get recent orders
    """
    
    def get(self, request):
        try:
            recent_orders = Order.objects.select_related(
                'user', 'shipping_address'
            ).prefetch_related(
                'items', 'items__store'
            ).order_by('-created_at')[:5]
            
            serializer = RecentOrderSerializer(recent_orders, many=True)
            
            return Response({
                "code": status.HTTP_200_OK,
                "status": "success",
                "message": "Recent orders fetched successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.exception(str(e))
            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "status": "error",
                "message": "Failed to fetch recent orders",
                "errors": {"server_error": [str(e)]}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminStockAlertsView(APIView):
    """
    Get products with low stock
    """
    
    def get(self, request):
        try:
            low_stock_products = Product.objects.filter(
                Q(stock__lte=models.F('stock')) | Q(stock__lte=10),
                status='published'
            ).select_related('store')[:5]
            
            serializer = StockAlertSerializer(low_stock_products, many=True)
            
            return Response({
                "code": status.HTTP_200_OK,
                "status": "success",
                "message": "Stock alerts fetched successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.exception(str(e))
            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "status": "error",
                "message": "Failed to fetch stock alerts",
                "errors": {"server_error": [str(e)]}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class AdminPendingActionsView(APIView):
#     """
#     Get pending admin actions
#     """
    
#     def get(self, request):
#         try:
#             pending_actions = []
            
#             # Pending vendor approvals
#             pending_vendors = Store.objects.filter(
#                 status='pending'
#             )[:2]
#             for vendor in pending_vendors:
#                 pending_actions.append({
#                     'id': f'vendor_{vendor.id}',
#                     'type': 'vendor_approval',
#                     'title': 'New Vendor Application',
#                     'description': f'{vendor.owner.get_full_name()} - {vendor.store_name}',
#                     'priority': 'high',
#                     'created_at': vendor.created_at
#                 })
            
#             # Pending refund requests
#             pending_refunds = RefundRequest.objects.filter(
#                 status='pending'
#             )[:2]
#             for refund in pending_refunds:
#                 pending_actions.append({
#                     'id': f'refund_{refund.id}',
#                     'type': 'order_refund',
#                     'title': 'Refund Request',
#                     'description': f'Order #{refund.order.order_number} - ${refund.refund_amount}',
#                     'priority': 'medium',
#                     'created_at': refund.created_at
#                 })
            
#             # Pending withdrawal requests
#             pending_withdrawals = WithdrawalRequest.objects.filter(
#                 status='pending'
#             )[:2]
#             for withdrawal in pending_withdrawals:
#                 pending_actions.append({
#                     'id': f'withdrawal_{withdrawal.id}',
#                     'type': 'vendor_approval',
#                     'title': 'Withdrawal Request',
#                     'description': f'{withdrawal.store.store_name} - ${withdrawal.amount}',
#                     'priority': 'medium',
#                     'created_at': withdrawal.created_at
#                 })
            
#             # Sort by priority and date
#             pending_actions.sort(key=lambda x: (
#                 {'high': 0, 'medium': 1, 'low': 2}[x['priority']],
#                 -x['created_at'].timestamp()
#             ))
            
#             serializer = PendingActionSerializer(pending_actions[:4], many=True)
            
#             return Response({
#                 "code": status.HTTP_200_OK,
#                 "status": "success",
#                 "message": "Pending actions fetched successfully",
#                 "data": serializer.data
#             }, status=status.HTTP_200_OK)
            
#         except Exception as e:
#             logger.exception(str(e))
#             return Response({
#                 "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
#                 "status": "error",
#                 "message": "Failed to fetch pending actions",
#                 "errors": {"server_error": [str(e)]}
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminCustomerAcquisitionView(APIView):
    """
    Get customer acquisition data
    """
    
    def get(self, request):
        try:
            today = timezone.now().date()
            data = []
            
            for i in range(5, -1, -1):
                month_start = today.replace(day=1) - timedelta(days=30*i)
                month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
                
                new_customers = CustomUser.objects.filter(
                    date_joined__date__gte=month_start,
                    date_joined__date__lte=month_end
                ).count()
                
                returning_customers = Order.objects.filter(
                    created_at__date__gte=month_start,
                    created_at__date__lte=month_end
                ).values('user').distinct().count()
                
                data.append({
                    'month': month_start.strftime('%b'),
                    'new_customers': new_customers,
                    'returning_customers': max(0, returning_customers - new_customers)
                })
            
            serializer = CustomerAcquisitionSerializer(data, many=True)
            
            return Response({
                "code": status.HTTP_200_OK,
                "status": "success",
                "message": "Customer acquisition data fetched successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.exception(str(e))
            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "status": "error",
                "message": "Failed to fetch customer acquisition data",
                "errors": {"server_error": [str(e)]}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminSalesByRegionView(APIView):
    """
    Get sales distribution by region
    """
    
    def get(self, request):
        try:
            today = timezone.now().date()
            start_date = today - timedelta(days=30)
            
            region_sales = ShippingAddress.objects.filter(
                orders__created_at__date__gte=start_date,
                orders__payment_status='paid'
            ).values('city', 'state').annotate(
                total_sales=Sum('orders__total_amount')
            ).order_by('-total_sales')[:4]
            
            total = sum(item['total_sales'] for item in region_sales)
            
            colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042']
            data = []
            for i, region in enumerate(region_sales):
                location = region['city'] or region['state'] or 'Other'
                data.append({
                    'region': location,
                    'sales': float(region['total_sales']),
                    'percentage': round((region['total_sales'] / total) * 100, 1) if total > 0 else 0,
                    'color': colors[i % len(colors)]
                })
            
            serializer = SalesByRegionSerializer(data, many=True)
            
            return Response({
                "code": status.HTTP_200_OK,
                "status": "success",
                "message": "Sales by region data fetched successfully",
                "data": serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.exception(str(e))
            return Response({
                "code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "status": "error",
                "message": "Failed to fetch sales by region data",
                "errors": {"server_error": [str(e)]}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)