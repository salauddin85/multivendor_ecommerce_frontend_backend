"use client";
import React, { useState, useEffect } from "react";
import Pagination from "@/components/pagination/Pagination";
import axiosInstance from "@/lib/axios";
import { toast } from "react-toastify";

// Type definitions
interface Order {
  id: number;
  created_at: string;
  updated_at: string;
  order_number: string;
  subtotal: string;
  shipping_fee: string;
  tax: string;
  discount: string;
  total_amount: string;
  status:
    | "pending"
    | "confirmed"
    | "packed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  payment_status: "unpaid" | "paid" | "partial" | "refunded" | "failed";
  customer_note: string;
  payment_type: string;
  payment_method: string;
  user: number;
  parent: number | null;
  coupon: number | null;
  shipping_address: number;
}

interface OrderDetailResponse {
  code: number;
  status: string;
  message: string;
  data: OrderDetail;
}

interface Coupon {
  id: number;
  created_at: string;
  updated_at: string;
  code: string;
  type: string;
  value: string;
  min_order_amount: string;
  usage_limit: number;
  usage_count: number;
  valid_from: string;
  valid_to: string;
  status: string;
}

interface OrderDetail {
  id: number;
  order_number: string;
  created_at: string;
  updated_at: string;
  subtotal: string;
  shipping_fee: string;
  tax: string;
  discount: string;
  total_amount: string;
  status: string;
  payment_status: string;
  customer_note: string | null;
  payment_type: string;
  payment_method: string;
  user: number;
  parent: number | null;
  coupon?: Coupon | null; // Optional coupon field
  items: OrderItem[];
  shipping_address: ShippingAddress;
}

interface OrderItem {
  id: number;
  product: {
    id: number;
    title: string;
    slug: string;
    base_price: string;
    main_image: string;
  };
  product_name: string;
  variant_name: string;
  quantity: number;
  price: string;
  discount: string;
  subtotal: string;
}

interface ShippingAddress {
  id: number;
  name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  type: string;
  is_default: boolean;
}

interface ApiResponse {
  code: number;
  status: string;
  message: string;
  data: Order[];
  pagination: {
    count: number;
    total_pages: number;
    current_page: number;
    next: string | null;
    previous: string | null;
    page_size: number;
  };
}

interface OrdersListProps {
  orders_list: ApiResponse;
}

// Status choices for dropdown
const STATUS_CHOICES = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "packed", label: "Packed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];
const PAYMENT_STATUS_CHOICES = [
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
];

export default function OrdersList({ orders_list }: OrdersListProps) {
  const { data: orders, pagination } = orders_list;
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  // Add this with other state declarations
  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    useState<string>("");
  const [loadingDetailsForOrder, setLoadingDetailsForOrder] = useState<
    number | null
  >(null);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetail | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 2,
    }).format(Number(amount));
  };

  // Apply filters
  useEffect(() => {
    let result = [...orders];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (order) =>
          order.order_number.toLowerCase().includes(term) ||
          order.id.toString().includes(term),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(result);
  }, [searchTerm, statusFilter, orders]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const refreshPage = () => {
    window.location.reload();
  };

  // Handle edit - open modal
  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setSelectedStatus(order.status);
    setSelectedPaymentStatus(order.payment_status); // Add this line

    setIsEditModalOpen(true);
  };

  // Handle details - fetch and open modal
  const handleViewDetails = async (orderId: number) => {
    setLoadingDetailsForOrder(orderId);
    try {
      const response = await axiosInstance.get<OrderDetailResponse>(
        `/api/orders/v1/orders/detail/${orderId}`,
      );

      if (response.data.code === 200) {
        setOrderDetails(response.data.data);
        setIsDetailsModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      alert("Failed to fetch order details. Please try again.");
    } finally {
      setLoadingDetailsForOrder(null); // Clear loading state
    }
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;

    setIsUpdating(true);
    try {
      const response = await axiosInstance.patch(
        `/api/orders/v1/orders/detail/${selectedOrder.id}/`,
        {
          status: selectedStatus,
          payment_status: selectedPaymentStatus, // Add this line
        },
      );

      if (response.data.code === 200) {
        toast.success("Order status updated successfully!");
        setIsEditModalOpen(false);
        refreshPage(); // Refresh to show updated status
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <span className="w-2 h-2 mr-1 bg-yellow-500 rounded-full"></span>
            Pending
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <span className="w-2 h-2 mr-1 bg-blue-500 rounded-full"></span>
            Confirmed
          </span>
        );
      case "packed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <span className="w-2 h-2 mr-1 bg-purple-500 rounded-full"></span>
            Packed
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            <span className="w-2 h-2 mr-1 bg-indigo-500 rounded-full"></span>
            Processing
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <span className="w-2 h-2 mr-1 bg-purple-500 rounded-full"></span>
            Shipped
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
            Delivered
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <span className="w-2 h-2 mr-1 bg-red-500 rounded-full"></span>
            Cancelled
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <span className="w-2 h-2 mr-1 bg-gray-500 rounded-full"></span>
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
            Paid
          </span>
        );
      case "unpaid":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <span className="w-2 h-2 mr-1 bg-red-500 rounded-full"></span>
            Unpaid
          </span>
        );
      case "partial":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <span className="w-2 h-2 mr-1 bg-yellow-500 rounded-full"></span>
            Partial
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <span className="w-2 h-2 mr-1 bg-gray-500 rounded-full"></span>
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Order Management
            </h1>
            <p className="text-gray-600 mt-2">Manage all customer orders</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-orange-50 rounded-lg border border-orange-100">
              <p className="text-sm text-orange-700">Total Orders</p>
              <p className="text-xl font-bold text-orange-900">
                {pagination.count}
              </p>
            </div>
            <button
              onClick={refreshPage}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by order number or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:w-48"
          >
            <option value="all">All Status</option>
            {STATUS_CHOICES.map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>

          {(searchTerm || statusFilter !== "all") && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm flex items-center gap-2 whitespace-nowrap"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Clear
            </button>
          )}
        </div>

        {filteredOrders.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            {filteredOrders.length} orders found
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="inline-block min-w-full align-middle px-4 md:px-0">
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 hidden md:table-header-group">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Order Details
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Payment
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors duration-150 block md:table-row border-b md:border-0 mb-4 md:mb-0"
                    >
                      {/* Mobile View - Card Layout */}
                      <td className="px-4 py-4 md:px-6 block md:table-cell">
                        <div className="md:hidden text-xs font-semibold text-gray-500 mb-1">
                          Order Details
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 flex-shrink-0 hidden sm:block">
                            <div className="w-10 h-10 rounded-md bg-orange-100 flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-orange-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {order.order_number}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: #{order.id}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {formatDate(order.created_at)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-2 md:px-6 block md:table-cell">
                        <div className="md:hidden text-xs font-semibold text-gray-500 mb-1">
                          Amount
                        </div>
                        <div className="text-lg font-bold text-orange-600">
                          {formatCurrency(order.total_amount)}
                        </div>
                      </td>

                      <td className="px-4 py-2 md:px-6 block md:table-cell">
                        <div className="md:hidden text-xs font-semibold text-gray-500 mb-1">
                          Payment
                        </div>
                        <div className="flex flex-col space-y-2">
                          <div className="text-xs text-gray-600">
                            {order.payment_method.includes("cash_on_delivery")
                              ? "Cash on Delivery"
                              : order.payment_method.includes("sslcommerz")
                                ? "Online Payment"
                                : order.payment_method}
                          </div>
                          <div>
                            {getPaymentStatusBadge(order.payment_status)}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-2 md:px-6 block md:table-cell">
                        <div className="md:hidden text-xs font-semibold text-gray-500 mb-1">
                          Status
                        </div>
                        <div className="flex flex-col space-y-2">
                          {getStatusBadge(order.status)}
                        </div>
                      </td>

                      <td className="px-4 py-4 md:px-6 block md:table-cell">
                        <div className="md:hidden text-xs font-semibold text-gray-500 mb-2">
                          Actions
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Details Button */}
                          <button
                            onClick={() => handleViewDetails(order.id)}
                            className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors"
                            title="View Details"
                            disabled={loadingDetailsForOrder === order.id} // Only disable this specific button
                          >
                            {loadingDetailsForOrder === order.id ? ( // Only show spinner for this specific order
                              <svg
                                className="w-5 h-5 animate-spin"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            )}
                          </button>
                          {/* Edit Button */}
                          <button
                            onClick={() => handleEdit(order)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Order Status"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="w-16 h-16 text-gray-400 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No orders found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {orders.length === 0
                            ? "No orders available."
                            : "No orders match your current filters."}
                        </p>
                        <button
                          onClick={clearFilters}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center">
        <Pagination paginationData={pagination} />
      </div>

      {/* Edit Status Modal */}
      {isEditModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black opacity-50"
              onClick={() => setIsEditModalOpen(false)}
            ></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Update Order
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Order: {selectedOrder.order_number}
                </p>

                {/* Status Select */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {STATUS_CHOICES.map((choice) => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Status Select - Add this new section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Status
                  </label>
                  <select
                    value={selectedPaymentStatus}
                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {PAYMENT_STATUS_CHOICES.map((choice) => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={
                      isUpdating ||
                      (selectedStatus === selectedOrder.status &&
                        selectedPaymentStatus === selectedOrder.payment_status) // Update this condition
                    }
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isUpdating ? (
                      <>
                        <svg
                          className="w-4 h-4 animate-spin"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      "Update Order"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {isDetailsModalOpen && orderDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black opacity-50"
              onClick={() => setIsDetailsModalOpen(false)}
            ></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order Details - {orderDetails.order_number}
                  </h3>
                  <button
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Order Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-3">
                      Order Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-500">Order ID:</span> #
                        {orderDetails.id}
                      </p>
                      <p>
                        <span className="text-gray-500">Order Date:</span>{" "}
                        {formatDate(orderDetails.created_at)}
                      </p>
                      <p>
                        <span className="text-gray-500">Status:</span>{" "}
                        {getStatusBadge(orderDetails.status)}
                      </p>
                      <p>
                        <span className="text-gray-500">Payment Status:</span>{" "}
                        {getPaymentStatusBadge(orderDetails.payment_status)}
                      </p>
                      <p>
                        <span className="text-gray-500">Payment Method:</span>{" "}
                        {orderDetails.payment_method || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-3">
                      Shipping Address
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-500">Name:</span>{" "}
                        {orderDetails.shipping_address.name}
                      </p>
                      <p>
                        <span className="text-gray-500">Phone:</span>{" "}
                        {orderDetails.shipping_address.phone}
                      </p>
                      <p>
                        <span className="text-gray-500">Address:</span>{" "}
                        {orderDetails.shipping_address.address_line}
                      </p>
                      <p>
                        <span className="text-gray-500">City:</span>{" "}
                        {orderDetails.shipping_address.city},{" "}
                        {orderDetails.shipping_address.state}
                      </p>
                      <p>
                        <span className="text-gray-500">Country:</span>{" "}
                        {orderDetails.shipping_address.country} -{" "}
                        {orderDetails.shipping_address.postal_code}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">
                    Order Items
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Product
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Price
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Quantity
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {orderDetails.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {item.product?.main_image && (
                                  <img
                                    src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${item.product.main_image}`}
                                    alt={item.product_name}
                                    className="w-10 h-10 object-cover rounded"
                                  />
                                )}
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.product_name}
                                  </div>
                                  {item.variant_name && (
                                    <div className="text-xs text-gray-500">
                                      {item.variant_name}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {formatCurrency(item.price)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-orange-600">
                              {formatCurrency(item.subtotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Coupon Information - Only show if coupon exists */}
                {orderDetails.coupon && (
                  <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-5-5A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      Coupon Applied
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="text-gray-600">Code:</span>{" "}
                          <span className="font-medium text-green-800">
                            {orderDetails.coupon.code}
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-600">Type:</span>{" "}
                          <span className="font-medium">
                            {orderDetails.coupon.type === "percentage"
                              ? "Percentage Discount"
                              : "Fixed Amount"}
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-600">Value:</span>{" "}
                          <span className="font-medium">
                            {orderDetails.coupon.type === "percentage"
                              ? `${orderDetails.coupon.value}%`
                              : formatCurrency(orderDetails.coupon.value)}
                          </span>
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="text-gray-600">Min. Order:</span>{" "}
                          <span className="font-medium">
                            {formatCurrency(
                              orderDetails.coupon.min_order_amount,
                            )}
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-600">Valid From:</span>{" "}
                          <span className="font-medium">
                            {formatDate(orderDetails.coupon.valid_from)}
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-600">Valid To:</span>{" "}
                          <span className="font-medium">
                            {formatDate(orderDetails.coupon.valid_to)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Totals */}
                <div className="flex justify-end">
                  <div className="w-full md:w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">
                        {formatCurrency(orderDetails.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping Fee:</span>
                      <span className="font-medium">
                        {formatCurrency(orderDetails.shipping_fee)}
                      </span>
                    </div>
                    {parseFloat(orderDetails.discount) > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount:</span>
                        <span className="font-medium">
                          -{formatCurrency(orderDetails.discount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-orange-600 pt-2 border-t">
                      <span>Total:</span>
                      <span>{formatCurrency(orderDetails.total_amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Note */}
                {orderDetails.customer_note && (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">
                      Customer Note
                    </h4>
                    <p className="text-sm text-gray-600">
                      {orderDetails.customer_note}
                    </p>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simple Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={refreshPage}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-2 mx-auto"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh Page
        </button>
      </div>
    </div>
  );
}
