  
from django.urls import path
from .views import (
    AdminDashboardStatsView,
    AdminRevenueDataView,
    AdminTopProductsView,
    AdminRecentOrdersView,
    AdminStockAlertsView,
    # AdminPendingActionsView,
    AdminCustomerAcquisitionView,
    AdminSalesByRegionView,
    AllProductsView
)

urlpatterns = [
    path("v1/admin/products/", AllProductsView.as_view(), name="all_products_view"),

    path('v1/dashboard/stats/', AdminDashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('v1/dashboard/revenue_data/', AdminRevenueDataView.as_view(), name='admin-dashboard-revenue'),
    path('v1/dashboard/top_products/', AdminTopProductsView.as_view(), name='admin-dashboard-top-products'),
    path('v1/dashboard/recent_orders/', AdminRecentOrdersView.as_view(), name='admin-dashboard-recent-orders'),
    path('v1/dashboard/stock_alerts/', AdminStockAlertsView.as_view(), name='admin-dashboard-stock-alerts'),
    # path('v1/dashboard/pending_actions/', AdminPendingActionsView.as_view(), name='admin-dashboard-pending-actions'),
    path('v1/dashboard/customer_acquisition/', AdminCustomerAcquisitionView.as_view(), name='admin-dashboard-customer-acquisition'),
    path('v1/dashboard/sales_by_region/', AdminSalesByRegionView.as_view(), name='admin-dashboard-sales-region'),
]