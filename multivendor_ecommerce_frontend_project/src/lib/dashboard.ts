// lib/api/dashboard.ts
import axiosInstance from "@/lib/axios";

// API Response Types
interface ApiResponse<T> {
  code: number;
  status: string;
  message: string;
  data: T;
}

// Types
export interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  active_vendors: number;
  low_stock_items: number;
  revenue_change: string;
  orders_change: string;
  vendors_change: string;
  stock_change: string;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  stock: number;
  growth: number | null;
}

export interface RecentOrder {
  id: number;
  customer: string;
  vendor: string;
  amount: number;
  status: string;
  date: string;
  items: number;
}

export interface StockAlert {
  id: string;
  product: string;
  vendor: string;
  currentStock: number;
  minStock: number;
  alertLevel: 'critical' | 'warning' | 'low';
}

export interface CustomerAcquisition {
  month: string;
  new_customers: number;
  returning_customers: number;
}

export interface SalesByRegion {
  region: string;
  sales: number;
  percentage: number;
  color: string;
}

// API functions using axiosInstance
export const dashboardAPI = {
  // Get dashboard stats
  getStats: async () => {
    const response = await axiosInstance.get<ApiResponse<DashboardStats>>('/api/admin_dashboard/v1/dashboard/stats/');
    return response.data.data;
  },

  // Get revenue data
  getRevenueData: async (period: 'daily' | 'weekly' | 'monthly' = 'weekly') => {
    const response = await axiosInstance.get<ApiResponse<RevenueDataPoint[]>>(
      `/api/admin_dashboard/v1/dashboard/revenue_data/?period=${period}`
    );
    return response.data.data;
  },

  // Get top products
  getTopProducts: async () => {
    const response = await axiosInstance.get<ApiResponse<TopProduct[]>>('/api/admin_dashboard/v1/dashboard/top_products/');
    return response.data.data;
  },

  // Get recent orders
  getRecentOrders: async () => {
    const response = await axiosInstance.get<ApiResponse<RecentOrder[]>>('/api/admin_dashboard/v1/dashboard/recent_orders/');
    return response.data.data;
  },

  // Get stock alerts
  getStockAlerts: async () => {
    const response = await axiosInstance.get<ApiResponse<any[]>>('/api/admin_dashboard/v1/dashboard/stock_alerts/');
    // Transform the data to match our interface
    const transformedData = response.data.data.map((item: any) => ({
      id: item.id,
      product: item.product,
      vendor: item.vendor,
      currentStock: item.currentStock,
      minStock: item.minStock,
      alertLevel: item.alertLevel
    }));
    return transformedData;
  },

  // Get customer acquisition
  getCustomerAcquisition: async () => {
    const response = await axiosInstance.get<ApiResponse<CustomerAcquisition[]>>('/api/admin_dashboard/v1/dashboard/customer_acquisition/');
    return response.data.data;
  },

  // Get sales by region
  getSalesByRegion: async () => {
    const response = await axiosInstance.get<ApiResponse<SalesByRegion[]>>('/api/admin_dashboard/v1/dashboard/sales_by_region/');
    return response.data.data;
  },
};