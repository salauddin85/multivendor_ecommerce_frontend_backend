// components/dashboard/admin/HomePage.tsx
"use client";
import Link from "next/link";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { dashboardAPI } from "@/lib/dashboard";
import type {
  DashboardStats,
  RevenueDataPoint,
  TopProduct,
  RecentOrder,
  StockAlert,
  CustomerAcquisition,
  SalesByRegion,
} from "@/lib/dashboard";

// Props interface
interface DashboardHomePageProps {
  initialStats: DashboardStats;
  initialRevenueData: RevenueDataPoint[];
  initialTopProducts: TopProduct[];
  initialRecentOrders: RecentOrder[];
  initialStockAlerts: StockAlert[];
  initialCustomerAcquisition: CustomerAcquisition[];
  initialSalesByRegion: SalesByRegion[];
}

// ==================== HELPER COMPONENTS ====================
const StatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, { label: string; className: string }> = {
    pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    },
    processing: {
      label: "Processing",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    },
    confirmed: {
      label: "Confirmed",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    },
    shipped: {
      label: "Shipped",
      className: "bg-purple-100 text-purple-800 hover:bg-purple-100",
    },
    delivered: {
      label: "Delivered",
      className: "bg-green-100 text-green-800 hover:bg-green-100",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-100 text-red-800 hover:bg-red-100",
    },
  };

  const config = statusMap[status.toLowerCase()] || {
    label: status,
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  };

  return <Badge className={config.className}>{config.label}</Badge>;
};

const AlertLevelBadge = ({ level }: { level: StockAlert["alertLevel"] }) => {
  const config = {
    critical: {
      label: "Critical",
      className: "bg-red-100 text-red-800 hover:bg-red-100",
    },
    warning: {
      label: "Warning",
      className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
    },
    low: {
      label: "Low",
      className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    },
  };

  return (
    <Badge className={config[level].className}>{config[level].label}</Badge>
  );
};

// ==================== MAIN COMPONENT ====================
export default function DashboardHomePage({
  initialStats,
  initialRevenueData,
  initialTopProducts,
  initialRecentOrders,
  initialStockAlerts,
  initialCustomerAcquisition,
  initialSalesByRegion,
}: DashboardHomePageProps) {
  const [revenuePeriod, setRevenuePeriod] = useState<
    "daily" | "weekly" | "monthly"
  >("weekly");
  const [revenueData, setRevenueData] =
    useState<RevenueDataPoint[]>(initialRevenueData);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch revenue data when period changes
  useEffect(() => {
    const fetchRevenueData = async () => {
      setIsLoading(true);
      try {
        const data = await dashboardAPI.getRevenueData(revenuePeriod);
        setRevenueData(data);
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevenueData();
  }, [revenuePeriod]);

  // Stats cards data from props
  const stats = [
    {
      title: "Total Revenue",
      value: `৳${initialStats.total_revenue.toLocaleString()}`,
      change: initialStats.revenue_change,
      icon: DollarSign,
      trend: initialStats.revenue_change.startsWith("+") ? "up" : "down",
    },
    {
      title: "Total Orders",
      value: initialStats.total_orders.toLocaleString(),
      change: initialStats.orders_change,
      icon: ShoppingCart,
      trend: initialStats.orders_change.startsWith("+") ? "up" : "down",
    },
    {
      title: "Active Vendors",
      value: initialStats.active_vendors.toLocaleString(),
      change: initialStats.vendors_change,
      icon: Users,
      trend: initialStats.vendors_change.startsWith("+") ? "up" : "down",
    },
    {
      title: "Low Stock Items",
      value: initialStats.low_stock_items.toLocaleString(),
      change: initialStats.stock_change,
      icon: Package,
      trend: initialStats.stock_change.startsWith("+") ? "down" : "up", // Inverse for low stock
    },
  ];

  // Process sales by region to remove duplicates
  const processedRegionData = React.useMemo(() => {
    const regionMap = new Map<string, { sales: number; color: string }>();

    initialSalesByRegion.forEach((item) => {
      const key = item.region.toLowerCase();
      if (regionMap.has(key)) {
        const existing = regionMap.get(key)!;
        regionMap.set(key, {
          sales: existing.sales + item.sales,
          color: existing.color,
        });
      } else {
        regionMap.set(key, {
          sales: item.sales,
          color: item.color,
        });
      }
    });

    const total = Array.from(regionMap.values()).reduce(
      (sum, item) => sum + item.sales,
      0,
    );

    return Array.from(regionMap.entries()).map(([region, data]) => ({
      region: region.charAt(0).toUpperCase() + region.slice(1),
      sales: data.sales,
      percentage:
        total > 0 ? parseFloat(((data.sales / total) * 100).toFixed(1)) : 0,
      color: data.color,
    }));
  }, [initialSalesByRegion]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="gap-2">
            <Package className="h-4 w-4" />
            {format(new Date(), "MMM dd, yyyy")}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={
                    stat.trend === "up" ? "text-green-500" : "text-red-500"
                  }
                >
                  {stat.change}
                </span>
                <span className="text-muted-foreground ml-1">
                  from last month
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Overview Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>
                  {revenuePeriod.charAt(0).toUpperCase() +
                    revenuePeriod.slice(1)}{" "}
                  revenue and orders
                </CardDescription>
              </div>
              <Select
                value={revenuePeriod}
                onValueChange={(value: "daily" | "weekly" | "monthly") =>
                  setRevenuePeriod(value)
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <p>Loading...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(value: any, name?: string) => {
                      if (name === "revenue")
                        return [
                          `৳${Number(value).toLocaleString()}`,
                          "Revenue",
                        ];
                      return [value, "Orders"];
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    name="Revenue"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke="#82ca9d"
                    name="Orders"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Customer Acquisition Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Customer Acquisition</CardTitle>
            <CardDescription>
              New vs Returning customers (Last 6 months)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={initialCustomerAcquisition}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="new_customers"
                  name="New Customers"
                  fill="#8884d8"
                />
                <Bar
                  dataKey="returning_customers"
                  name="Returning Customers"
                  fill="#82ca9d"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>
              Best performing products this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {initialTopProducts.length > 0 ? (
                initialTopProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">
                          ৳{product.revenue.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {product.sales} sales
                        </p>
                      </div>
                      {product.growth && (
                        <div
                          className={`flex items-center ${product.growth >= 0 ? "text-green-500" : "text-red-500"}`}
                        >
                          {product.growth >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span className="ml-1">
                            {Math.abs(product.growth)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No products found
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest orders from your store</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/admin/sales/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {initialRecentOrders.length > 0 ? (
                initialRecentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">#{order.id}</p>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>
                          {order.customer} •{" "}
                          {order.vendor === "N/A"
                            ? "Multiple Vendors"
                            : order.vendor}
                        </p>
                        <p>
                          {format(new Date(order.date), "MMM dd, yyyy")} •{" "}
                          {order.items} items
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">৳{order.amount}</p>
                     
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No orders found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Alerts & Geographical Sales */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stock Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Stock Alerts</CardTitle>
              <CardDescription>Products with low stock levels</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/admin/products">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {initialStockAlerts.length > 0 ? (
                initialStockAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{alert.product}</p>
                      <p className="text-sm text-muted-foreground">
                        {alert.vendor}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {alert.currentStock}
                          </span>
                          <span className="text-muted-foreground">/</span>
                          <span className="text-muted-foreground">
                            {alert.minStock} min
                          </span>
                        </div>
                        <Progress
                          value={(alert.currentStock / alert.minStock) * 100}
                          className="w-24"
                        />
                      </div>
                      <AlertLevelBadge level={alert.alertLevel} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No stock alerts
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Geographical Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Geographical Sales Distribution</CardTitle>
            <CardDescription>Sales by region (Last 30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={processedRegionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props) =>
                      `${props.payload.region}: ${props.payload.percentage}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="sales"
                  >
                    {processedRegionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `৳${Number(value).toLocaleString()}`,
                      "Sales",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {processedRegionData.map((region) => (
                  <div
                    key={region.region}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: region.color }}
                      />
                      <span className="text-sm">{region.region}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ৳{region.sales.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {region.percentage}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
