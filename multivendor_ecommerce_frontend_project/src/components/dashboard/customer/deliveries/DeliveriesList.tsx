"use client";

import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/pagination/Pagination";
import { format } from "date-fns";
import { Eye, PackageCheck } from "lucide-react";
import Link from "next/link";

interface Order {
  id: number;
  order_number: string;
  created_at: string;
  total_amount: string;
  status: string;
  payment_status: string;
  payment_method: string;
}

interface PaginationData {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  page_size: number;
}

interface DeliveriesListProps {
  orders: Order[];
  paginationData: PaginationData;
}

export default function DeliveriesList({ orders, paginationData }: DeliveriesListProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "unpaid":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="bg-green-50 p-6 rounded-full mb-4">
          <PackageCheck className="h-10 w-10 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Delivered Orders</h3>
        <p className="text-gray-500 text-center mb-6 max-w-sm">
          You don't have any delivered orders yet. Once your orders are delivered, they will appear here.
        </p>
        <Link 
          href="/dashboard/customer/orders" 
          className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition"
        >
          Check Active Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">My Deliveries</h2>
        <span className="text-sm text-gray-500">
          Total {paginationData.count} orders
        </span>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Order Info
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-sm">
                      #{order.order_number}
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5 capitalize">
                      {order.payment_method.replace(/_/g, " ")}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">
                    {format(new Date(order.created_at), "MMM d, yyyy")}
                  </span>
                  <p className="text-xs text-gray-400">
                    {format(new Date(order.created_at), "h:mm a")}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col items-center gap-1.5">
                    <Badge className={`${getStatusColor(order.status)} border-0 hover:${getStatusColor(order.status)}`}>
                      {order.status}
                    </Badge>
                    <Badge variant="outline" className={`${getPaymentStatusColor(order.payment_status)} border-0 text-[10px]`}>
                      {order.payment_status}
                    </Badge>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-bold text-gray-900">
                    ৳{parseFloat(order.total_amount).toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <Link
                    href={`/dashboard/customer/orders/${order.id}`}
                    className="inline-flex items-center justify-center p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile ListView */}
      <div className="md:hidden space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="font-bold text-gray-900">#{order.order_number}</span>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(order.created_at), "MMM d, yyyy • h:mm a")}
                </p>
              </div>
              <Badge className={`${getStatusColor(order.status)} border-0`}>
                {order.status}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center py-3 border-t  border-gray-100 my-3">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Total Amount</span>
                <span className="font-bold text-gray-900">
                  ৳{parseFloat(order.total_amount).toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 mb-1">Method</span>
                 <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded capitalize">
                {order.payment_method.replace(/_/g, " ")}
              </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500 mb-1">Payment</span>
                <Badge variant="outline" className={`${getPaymentStatusColor(order.payment_status)} border-0`}>
                  {order.payment_status}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 w-full">
              <Link
                href={`/dashboard/customer/orders/${order.id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Eye size={16} />
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {paginationData && paginationData.total_pages > 1 && (
        <Pagination paginationData={paginationData} className="mt-8" />
      )}
    </div>
  );
}
