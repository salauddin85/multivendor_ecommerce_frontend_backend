"use client";

import React from "react";
import Pagination from "@/components/pagination/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tag, Store, ShoppingBag } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type CouponUsage = {
  id: number;
  coupon_code: string;
  user_email: string;
  store_name?: string;
  created_at: string;
  updated_at: string;
  discount_amount: string;
  coupon: number;
  user: number;
  store: number | null;
  order: number;
};

type PaginationData = {
  count: number;
  current_page: number;
  total_pages: number;
  next: string | boolean | null;
  previous: string | boolean | null;
  page_size?: number;
};

type CouponUsagesListProps = {
  all_coupons_list: {
    data: CouponUsage[];
    pagination: PaginationData;
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CouponUsagesList({ all_coupons_list }: CouponUsagesListProps) {
  const usages: CouponUsage[] = all_coupons_list?.data ?? [];
  const pagination: PaginationData = all_coupons_list?.pagination;

  return (
    <div className="px-6 py-8 min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Coupon Usages
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Track all coupon redemption history
        </p>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-5">
                  #
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-5">
                  Coupon Code
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-5">
                  User Email
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-5">
                  Store
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-5">
                  Order ID
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-5">
                  Discount
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-5">
                  Used At
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {usages.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-16 text-gray-400 text-sm"
                  >
                    <Tag className="mx-auto mb-2 w-8 h-8 text-gray-300" />
                    No coupon usages found.
                  </TableCell>
                </TableRow>
              ) : (
                usages.map((usage, index) => (
                  <TableRow
                    key={usage.id}
                    className="border-b border-gray-100 hover:bg-orange-50/40 transition-colors duration-150"
                  >
                    {/* # */}
                    <TableCell className="py-4 px-5 text-sm text-gray-400 font-medium">
                      {index + 1}
                    </TableCell>

                    {/* Coupon Code */}
                    <TableCell className="py-4 px-5">
                      <span className="font-mono font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg text-sm border border-orange-100">
                        {usage.coupon_code}
                      </span>
                    </TableCell>

                    {/* User Email */}
                    <TableCell className="py-4 px-5 text-sm text-gray-700">
                      {usage.user_email}
                    </TableCell>

                    {/* Store */}
                    <TableCell className="py-4 px-5">
                      {usage.store_name ? (
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                          <Store className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{usage.store_name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </TableCell>

                    {/* Order ID */}
                    <TableCell className="py-4 px-5">
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-gray-400" />
                        <Badge className="bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-100 font-semibold text-xs">
                          #{usage.order}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Discount Amount */}
                    <TableCell className="py-4 px-5">
                      <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                        ৳{parseFloat(usage.discount_amount).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </TableCell>

                    {/* Used At */}
                    <TableCell className="py-4 px-5 text-sm text-gray-500">
                      {formatDateTime(usage.created_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Footer Summary ── */}
        {usages.length > 0 && (
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 font-medium">
            Showing {usages.length} of {pagination?.count ?? usages.length} records
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {pagination && <Pagination paginationData={pagination} className="mt-4" />}
    </div>
  );
}