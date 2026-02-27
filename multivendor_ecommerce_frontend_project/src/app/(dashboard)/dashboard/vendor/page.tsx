// app/dashboard/page.tsx
import DashboardHeader from '@/components/dashboard/vendor/dashboard_data/DashboardHeader';
import StatsCards from '@/components/dashboard/vendor/dashboard_data/StatsCards';
import RecentOrders from '@/components/dashboard/vendor/dashboard_data/RecentOrders';
import TopProducts from '@/components/dashboard/vendor/dashboard_data/TopProducts';
import SalesChart from '@/components/dashboard/vendor/dashboard_data/SalesChart';

export default function VendorDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        {/* <SidebarMenu /> */}
        
        {/* Main Content */}
        <div className="flex-1 p-6">
          <DashboardHeader />
          
          {/* Stats Overview */}
          <StatsCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Sales Chart */}
            <div className="lg:col-span-2">
              <SalesChart />
            </div>
            
            {/* Top Products */}
            <div className="lg:col-span-1">
              <TopProducts />
            </div>
          </div>
          
          {/* Recent Orders */}
          <div className="mt-6">
            <RecentOrders />
          </div>
        </div>
      </div>
    </div>
  );
}