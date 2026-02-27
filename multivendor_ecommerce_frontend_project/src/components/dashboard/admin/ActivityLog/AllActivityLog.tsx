"use client";
import React, { useState, useEffect } from "react";
import Pagination from "@/components/pagination/Pagination";

// Type definitions
interface ActivityLog {
  id: number;
  user: string | null;
  timestamp: string;
  ip_address: string;
  location: string;
  user_agent: string;
  request_method: string;
  referrer_url: string;
  device: string;
  path: string;
  verb: string;
  severity_level: "info" | "warning" | "error";
  description: string;
  response_status_code: number;
}

interface ApiResponse {
  code: number;
  status: string;
  message: string;
  data: ActivityLog[];
  pagination: {
    count: number;
    total_pages: number;
    current_page: number;
    next: string | null;
    previous: string | null;
    page_size: number;
  };
}

interface AllActivityLogProps {
  all_activity_log: ApiResponse;
}

// Helper functions
const getStatusColor = (statusCode: number) => {
  if (statusCode >= 200 && statusCode < 300)
    return "bg-green-100 text-green-800";
  if (statusCode >= 300 && statusCode < 400) return "bg-blue-100 text-blue-800";
  if (statusCode >= 400 && statusCode < 500)
    return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case "info":
      return "bg-blue-100 text-blue-800 border border-blue-200";
    case "warning":
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    case "error":
      return "bg-red-100 text-red-800 border border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200";
  }
};

const getMethodColor = (method: string) => {
  switch (method.toUpperCase()) {
    case "GET":
      return "bg-blue-100 text-blue-700 border border-blue-200";
    case "POST":
      return "bg-green-100 text-green-700 border border-green-200";
    case "PUT":
    case "PATCH":
      return "bg-yellow-100 text-yellow-700 border border-yellow-200";
    case "DELETE":
      return "bg-red-100 text-red-700 border border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-200";
  }
};

export default function AllActivityLog({
  all_activity_log,
}: AllActivityLogProps) {
  const { data: logs, pagination } = all_activity_log;
  const [filteredLogs, setFilteredLogs] = useState(logs);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");

  // Get unique users for filter
  const uniqueUsers = Array.from(
    new Set(logs.map((log) => log.user).filter(Boolean)),
  ) as string[];

  // Calculate statistics
  const calculateStatistics = (logs: ActivityLog[]) => {
    return {
      totalActivities: logs.length,
      successful: logs.filter(
        (log) =>
          log.response_status_code >= 200 && log.response_status_code < 300,
      ).length,
      infoLogs: logs.filter((log) => log.severity_level === "info").length,
      warnings: logs.filter((log) => log.severity_level === "warning").length,
      errors: logs.filter((log) => log.severity_level === "error").length,
      uniqueUsers: new Set(logs.map((log) => log.user).filter(Boolean)).size,
      uniqueIPs: new Set(logs.map((log) => log.ip_address)).size,
    };
  };

  const statistics = calculateStatistics(filteredLogs);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return "N/A";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Apply filters
  useEffect(() => {
    let result = logs;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (log) =>
          (log.user && log.user.toLowerCase().includes(term)) ||
          log.description.toLowerCase().includes(term) ||
          log.path.toLowerCase().includes(term) ||
          log.verb.toLowerCase().includes(term) ||
          log.ip_address.includes(term),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      const statusNum = parseInt(statusFilter);
      result = result.filter((log) => {
        if (statusNum >= 200 && statusNum < 300) {
          return (
            log.response_status_code >= 200 && log.response_status_code < 300
          );
        }
        if (statusNum >= 400 && statusNum < 500) {
          return (
            log.response_status_code >= 400 && log.response_status_code < 500
          );
        }
        if (statusNum >= 500) {
          return log.response_status_code >= 500;
        }
        return log.response_status_code.toString().startsWith(statusFilter);
      });
    }

    // Severity filter
    if (severityFilter !== "all") {
      result = result.filter((log) => log.severity_level === severityFilter);
    }

    // User filter
    if (userFilter !== "all") {
      result = result.filter((log) => log.user === userFilter);
    }

    setFilteredLogs(result);
  }, [searchTerm, statusFilter, severityFilter, userFilter, logs]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSeverityFilter("all");
    setUserFilter("all");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              All Activity Logs
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor all system activities across all users
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 bg-gray-100 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-xl font-bold text-gray-900">
                {pagination.count.toLocaleString()}
              </p>
            </div>
            <div className="px-4 py-2 bg-gray-100 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Current Page</p>
              <p className="text-xl font-bold text-gray-900">
                {filteredLogs.length} of {logs.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Users</option>
              {uniqueUsers.map((user) => (
                <option key={user} value={user}>
                  {truncateText(user, 20)}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="2">2xx Success</option>
              <option value="4">4xx Client Errors</option>
              <option value="5">5xx Server Errors</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Severity</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>

          {(searchTerm ||
            statusFilter !== "all" ||
            severityFilter !== "all" ||
            userFilter !== "all") && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {filteredLogs.length} results found
              </span>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">
                Total Activities
              </p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {pagination.count.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Successful</p>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {statistics.successful}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {logs.length > 0
                  ? `${Math.round((statistics.successful / logs.length) * 100)}%`
                  : "0%"}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">Info Logs</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">
                {statistics.infoLogs}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                {logs.length > 0
                  ? `${Math.round((statistics.infoLogs / logs.length) * 100)}%`
                  : "0%"}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Errors</p>
              <p className="text-2xl font-bold text-red-900 mt-1">
                {statistics.errors}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {logs.length > 0
                  ? `${Math.round((statistics.errors / logs.length) * 100)}%`
                  : "0%"}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">
                Unique Users
              </p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {statistics.uniqueUsers}
              </p>
              <p className="text-xs text-purple-600 mt-1">Active users</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 1.198a6 6 0 00-9-5.197"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Timestamp
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    IP Address
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Method & Path
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Description
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
                    Severity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        #{log.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {formatDate(log.timestamp)}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            {log.device}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span
                            className={`text-sm font-medium ${!log.user ? "text-gray-400" : "text-gray-900"}`}
                          >
                            {log.user || "Anonymous"}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            {log.location}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.ip_address}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-start gap-2 flex-wrap">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold shrink-0 ${getMethodColor(log.request_method)}`}
                            >
                              {log.request_method}
                            </span>

                            {/* break-all ব্যবহার করা হয়েছে যাতে URL ভেঙে নিচের লাইনে আসে */}
                            <span className="text-xs font-mono text-gray-700 break-all">
                              {log.path}
                            </span>
                          </div>

                          <span className="text-xs text-gray-600">
                            {truncateText(log.verb, 40)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-sm text-gray-900">
                          {truncateText(log.description, 60)}
                        </p>
                        {log.referrer_url !== "None" && log.referrer_url && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            From: {log.referrer_url}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(log.response_status_code)}`}
                        >
                          {log.response_status_code}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getSeverityBadge(log.severity_level)}`}
                        >
                          {log.severity_level.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 mb-4 text-gray-400">
                          <svg
                            className="w-full h-full"
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
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No activity logs found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Try adjusting your search or filters
                        </p>
                        <button
                          onClick={clearFilters}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Clear All Filters
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

      {/* Pagination Info */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-gray-600">
        <div>
          Showing <span className="font-medium">{filteredLogs.length}</span> of{" "}
          <span className="font-medium">
            {pagination.count.toLocaleString()}
          </span>{" "}
          total records
          {filteredLogs.length !== logs.length && (
            <span className="ml-2">
              (<span className="font-medium">{logs.length}</span> on this page)
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div>
            Page <span className="font-medium">{pagination.current_page}</span>{" "}
            of <span className="font-medium">{pagination.total_pages}</span>
          </div>
          <div className="text-xs text-gray-500">
            {pagination.page_size} per page
          </div>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="mt-6">
          <Pagination paginationData={pagination} />
        </div>
      )}

      {/* Summary Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Summary:</span> Showing activities
              from all users
            </div>
          </div>
          <div className="text-sm text-gray-500 text-right">
            <div>Data loaded at: {new Date().toLocaleTimeString()}</div>
            <div className="text-xs">
              Database contains {pagination.count.toLocaleString()} activity
              records
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
