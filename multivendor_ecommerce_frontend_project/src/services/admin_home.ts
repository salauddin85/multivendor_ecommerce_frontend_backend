const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

export const dashboardAPI = {
  // Revenue Data
  getRevenueData: async (period: 'daily' | 'weekly' | 'monthly') => {
    const response = await fetch(`${API_BASE_URL}/dashboard/revenue?period=${period}`);
    return response.json();
  },
  
  // Top Products
  getTopProducts: async (limit: number = 5) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/top-products?limit=${limit}`);
    return response.json();
  },
  
  // Vendor Performance
  getVendorPerformance: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/vendor-performance`);
    return response.json();
  },
  
  // Recent Orders
  getRecentOrders: async (limit: number = 5) => {
    const response = await fetch(`${API_BASE_URL}/dashboard/recent-orders?limit=${limit}`);
    return response.json();
  },
  
  // Stock Alerts
  getStockAlerts: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/stock-alerts`);
    return response.json();
  },
  
  // Pending Actions
  getPendingActions: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/pending-actions`);
    return response.json();
  },
  
  // Customer Acquisition
  getCustomerAcquisition: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/customer-acquisition`);
    return response.json();
  },
  
  // Geographical Sales
  getGeographicalSales: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/geographical-sales`);
    return response.json();
  },
  
  // Export Report
  exportReport: async (type: 'pdf' | 'excel' | 'csv') => {
    const response = await fetch(`${API_BASE_URL}/dashboard/export?type=${type}`);
    return response.blob();
  },
};