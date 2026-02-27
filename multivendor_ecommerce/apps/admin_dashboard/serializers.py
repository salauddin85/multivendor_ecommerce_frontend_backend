from rest_framework import serializers
from apps.products.models import Product, Brand, Category, Store
from apps.orders.models import Order


class AllProductSerializer(serializers.ModelSerializer):
    brand = serializers.StringRelatedField()
    category = serializers.StringRelatedField()
    store = serializers.StringRelatedField()

    class Meta:
        model = Product
        fields = ['id', 'store', 'category', 'brand', 'title', 'slug', 'type','status']
        
        
   

class DashboardStatsSerializer(serializers.Serializer):
    total_revenue = serializers.FloatField()
    total_orders = serializers.IntegerField()
    active_vendors = serializers.IntegerField()
    low_stock_items = serializers.IntegerField()
    revenue_change = serializers.CharField()
    orders_change = serializers.CharField()
    vendors_change = serializers.CharField()
    stock_change = serializers.CharField()

class RevenueDataSerializer(serializers.Serializer):
    date = serializers.CharField()
    revenue = serializers.FloatField()
    orders = serializers.IntegerField()

class TopProductSerializer(serializers.Serializer):
    id = serializers.CharField(source='product__id')
    name = serializers.CharField(source='product__title')
    category = serializers.CharField(source='product__category__name', default='Uncategorized')
    sales = serializers.IntegerField(source='total_sales')
    revenue = serializers.FloatField(source='total_revenue')
    stock = serializers.IntegerField(source='current_stock')
    growth = serializers.FloatField(default=0)

class RecentOrderSerializer(serializers.ModelSerializer):
    customer = serializers.SerializerMethodField()
    vendor = serializers.SerializerMethodField()
    amount = serializers.FloatField(source='total_amount')
    items = serializers.SerializerMethodField()
    date = serializers.DateTimeField(source='created_at')
    
    class Meta:
        model = Order
        fields = ['id', 'customer', 'vendor', 'amount', 'status', 'date', 'items']
    
    def get_vendor(self, obj):
        vendors = obj.items.values_list('store__store_name', flat=True).distinct()
        vendors = [v for v in vendors if v]  # remove None
        return ', '.join(vendors) if vendors else 'N/A'
    
    def get_items(self, obj):
        return obj.items.count()
    
    def get_customer(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

class StockAlertSerializer(serializers.ModelSerializer):
    product = serializers.CharField(source='slug')
    vendor = serializers.StringRelatedField()
    currentStock = serializers.IntegerField(source='stock')
    minStock = serializers.SerializerMethodField()
    alertLevel = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'product', 'vendor', 'currentStock', 'minStock', 'alertLevel']
    
    def get_alertLevel(self, obj):
        if obj.stock <= 5:
            return 'critical'
        elif obj.stock <= 10:
            return 'warning'
        return 'low'
    
    def get_minStock(self, obj):
        return 10  

class PendingActionSerializer(serializers.Serializer):
    id = serializers.CharField()
    type = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    priority = serializers.CharField()
    created_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M')

class CustomerAcquisitionSerializer(serializers.Serializer):
    month = serializers.CharField()
    new_customers = serializers.IntegerField()
    returning_customers = serializers.IntegerField()

class SalesByRegionSerializer(serializers.Serializer):
    region = serializers.CharField()
    sales = serializers.FloatField()
    percentage = serializers.FloatField()
    color = serializers.CharField()