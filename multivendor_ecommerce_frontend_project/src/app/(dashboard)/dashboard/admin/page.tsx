"use client";

import DashboardHomePage from "@/components/dashboard/admin/HomePage";
import { dashboardAPI } from "@/lib/dashboard";
import { DashboardSkeleton } from "@/components/dashboard/admin/DashboardSkeleton";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any>(null);
  const [stockAlerts, setStockAlerts] = useState<any>(null);
  const [customerAcquisition, setCustomerAcquisition] = useState<any>(null);
  const [salesByRegion, setSalesByRegion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // Each API call handled separately with fallback
    dashboardAPI.getStats().then(setStats).catch((err) => console.error(err));
    dashboardAPI.getRevenueData("weekly").then(setRevenueData).catch(console.error);
    dashboardAPI.getTopProducts().then(setTopProducts).catch(console.error);
    dashboardAPI.getRecentOrders().then(setRecentOrders).catch(console.error);
    dashboardAPI.getStockAlerts().then(setStockAlerts).catch(console.error);
    dashboardAPI.getCustomerAcquisition().then(setCustomerAcquisition).catch(console.error);
    dashboardAPI.getSalesByRegion().then(setSalesByRegion).catch(console.error);

    // Stop showing full page skeleton once first API resolves
    Promise.allSettled([
      dashboardAPI.getStats(),
      dashboardAPI.getRevenueData("weekly"),
      dashboardAPI.getTopProducts(),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <DashboardHomePage
      initialStats={stats}
      initialRevenueData={revenueData}
      initialTopProducts={topProducts}
      initialRecentOrders={recentOrders}
      initialStockAlerts={stockAlerts}
      initialCustomerAcquisition={customerAcquisition}
      initialSalesByRegion={salesByRegion}
    />
  );
}