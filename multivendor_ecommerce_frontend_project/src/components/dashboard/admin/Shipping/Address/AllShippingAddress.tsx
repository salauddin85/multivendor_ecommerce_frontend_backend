"use client";
import React, { useState } from "react";
import Pagination from "@/components/pagination/Pagination";

// Type definitions
interface ShippingAddress {
  id: number;
  user: string;
  created_at: string;
  updated_at: string;
  name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  type: "home" | "office" | "other";
  is_default: boolean;
  shipping_configuration: number | null;
}

interface ShippingAddressResponse {
  code: number;
  status: string;
  message: string;
  data: ShippingAddress[];
  pagination?: {
    count: number;
    total_pages: number;
    current_page: number;
    next: string | null;
    previous: string | null;
    page_size: number;
  };
}

interface AllShippingAddressProps {
  all_shipping_address: ShippingAddressResponse;
}

export default function AllShippingAddress({ all_shipping_address }: AllShippingAddressProps) {
  const { data: addresses, pagination } = all_shipping_address;
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [defaultFilter, setDefaultFilter] = useState<string>("all");

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

  // Filter addresses
  const filteredAddresses = addresses.filter((address) => {
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        address.name.toLowerCase().includes(term) ||
        address.phone.includes(term) ||
        address.user.toLowerCase().includes(term) ||
        address.address_line.toLowerCase().includes(term) ||
        address.city.toLowerCase().includes(term) ||
        address.state.toLowerCase().includes(term) ||
        address.postal_code.includes(term);
      
      if (!matchesSearch) return false;
    }

    // Type filter
    if (typeFilter !== "all" && address.type !== typeFilter) {
      return false;
    }

    // Default filter
    if (defaultFilter === "default" && !address.is_default) return false;
    if (defaultFilter === "non-default" && address.is_default) return false;

    return true;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setDefaultFilter("all");
  };

  // Get address type badge
  const getAddressTypeBadge = (type: string, isDefault: boolean) => {
    return (
      <div className="flex flex-col gap-1">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            type === "home"
              ? "bg-blue-100 text-blue-800"
              : type === "office"
              ? "bg-purple-100 text-purple-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
        {isDefault && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            <svg
              className="w-3 h-3 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Default
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Shipping Address Management
            </h1>
            <p className="text-gray-600 mt-2">Manage all customer shipping addresses</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-orange-50 rounded-lg border border-orange-100">
              <p className="text-sm text-orange-700">Total Addresses</p>
              <p className="text-xl font-bold text-orange-900">
                {addresses.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, phone, email, address..."
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:w-40"
          >
            <option value="all">All Types</option>
            <option value="home">Home</option>
            <option value="office">Office</option>
            <option value="other">Other</option>
          </select>

          <select
            value={defaultFilter}
            onChange={(e) => setDefaultFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:w-40"
          >
            <option value="all">All Addresses</option>
            <option value="default">Default Only</option>
            <option value="non-default">Non-Default</option>
          </select>

          {(searchTerm || typeFilter !== "all" || defaultFilter !== "all") && (
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
              Clear Filters
            </button>
          )}
        </div>

        {filteredAddresses.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            {filteredAddresses.length} addresses found
          </div>
        )}
      </div>

      {/* Addresses Table */}
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="inline-block min-w-full align-middle px-4 md:px-0">
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 hidden lg:table-header-group">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Recipient Info
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Address Details
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Type & Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    User
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAddresses.length > 0 ? (
                  filteredAddresses.map((address) => (
                    <tr
                      key={address.id}
                      className="hover:bg-gray-50 transition-colors duration-150 block lg:table-row border-b lg:border-0 mb-4 lg:mb-0"
                    >
                      {/* Recipient Info */}
                      <td className="px-4 py-4 lg:px-6 block lg:table-cell">
                        <div className="lg:hidden text-xs font-semibold text-gray-500 mb-1">
                          Recipient Info
                        </div>
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">
                            {address.name}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
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
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            {address.phone}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: #{address.id}
                          </div>
                        </div>
                      </td>

                      {/* Address Details */}
                      <td className="px-4 py-4 lg:px-6 block lg:table-cell">
                        <div className="lg:hidden text-xs font-semibold text-gray-500 mb-1">
                          Address Details
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900">
                            {address.address_line}
                          </div>
                          <div className="text-sm text-gray-600">
                            {address.city}, {address.state}
                          </div>
                          <div className="text-sm text-gray-600">
                            {address.country} - {address.postal_code}
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-4 lg:px-6 block lg:table-cell">
                        <div className="lg:hidden text-xs font-semibold text-gray-500 mb-1">
                          Location
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900">
                            <span className="text-gray-500">City:</span> {address.city}
                          </div>
                          <div className="text-sm text-gray-900">
                            <span className="text-gray-500">State:</span> {address.state}
                          </div>
                          <div className="text-sm text-gray-900">
                            <span className="text-gray-500">Postal:</span> {address.postal_code}
                          </div>
                        </div>
                      </td>

                      {/* Type & Status */}
                      <td className="px-4 py-4 lg:px-6 block lg:table-cell">
                        <div className="lg:hidden text-xs font-semibold text-gray-500 mb-1">
                          Type & Status
                        </div>
                        <div className="space-y-2">
                          {getAddressTypeBadge(address.type, address.is_default)}
                          <div className="text-xs text-gray-500">
                            Created: {formatDate(address.created_at)}
                          </div>
                          {address.updated_at !== address.created_at && (
                            <div className="text-xs text-gray-500">
                              Updated: {formatDate(address.updated_at)}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* User */}
                      <td className="px-4 py-4 lg:px-6 block lg:table-cell">
                        <div className="lg:hidden text-xs font-semibold text-gray-500 mb-1">
                          User
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900 break-all">
                            {address.user}
                          </div>
                          {address.shipping_configuration && (
                            <div className="text-xs text-gray-500">
                              Config ID: {address.shipping_configuration}
                            </div>
                          )}
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
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No addresses found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {addresses.length === 0
                            ? "No shipping addresses available."
                            : "No addresses match your current filters."}
                        </p>
                        {addresses.length > 0 && (
                          <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Clear Filters
                          </button>
                        )}
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
      {pagination && (
        <div className="mt-6 flex justify-center">
          <Pagination paginationData={pagination} />
        </div>
      )}
    </div>
  );
}