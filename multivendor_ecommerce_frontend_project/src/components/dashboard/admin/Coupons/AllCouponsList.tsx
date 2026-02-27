"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/pagination/Pagination";
import axiosInstance from "@/lib/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Eye, Tag, Calendar, Hash, Percent, DollarSign, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import CouponEditForm from "./CouponEditForm"; // You'll need to create this component

// ─── Types ────────────────────────────────────────────────────────────────────

type Coupon = {
  id: number;
  code: string;
  type: "percentage" | "fixed";
  value: string;
  min_order_amount: string;
  usage_limit: number | null;
  usage_count: number;
  valid_from: string;
  valid_to: string;
  status: string;
  created_at: string;
};

type PaginationData = {
  count: number;
  current_page: number;
  total_pages: number;
  next: string | boolean | null;
  previous: string | boolean | null;
  page_size?: number;
};

type AllCouponsListProps = {
  all_coupons_list: {
    data: Coupon[];
    pagination: PaginationData;
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold hover:bg-emerald-100">
          Active
        </Badge>
      );
    case "inactive":
      return (
        <Badge className="bg-gray-100 text-gray-600 border border-gray-200 font-semibold hover:bg-gray-100">
          Inactive
        </Badge>
      );
    case "expired":
      return (
        <Badge className="bg-red-100 text-red-600 border border-red-200 font-semibold hover:bg-red-100">
          Expired
        </Badge>
      );
    default:
      return (
        <Badge className="bg-orange-100 text-orange-600 border border-orange-200 font-semibold hover:bg-orange-100">
          {status}
        </Badge>
      );
  }
}

// ─── Detail Row Helper ────────────────────────────────────────────────────────

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="mt-0.5 text-orange-500">{icon}</span>
      <div className="flex flex-col">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
          {label}
        </span>
        <span className="text-sm text-gray-800 font-semibold mt-0.5">{value}</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AllCouponsList({ all_coupons_list }: AllCouponsListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [detailCoupon, setDetailCoupon] = useState<Coupon | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const coupons: Coupon[] = all_coupons_list?.data ?? [];
  const pagination: PaginationData = all_coupons_list?.pagination;

  // ── Edit ────────────────────────────────────────────────────────────────
  const handleEdit = async (id: number) => {
    setEditLoading(true);
    setEditingCoupon(null);
    try {
      const response = await axiosInstance.get(`/api/coupons/v1/coupons/${id}/`);
      setEditingCoupon(response.data?.data ?? response.data);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ?? "Failed to fetch coupon details for editing."
      );
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await axiosInstance.delete(`/api/coupons/v1/coupons/${deletingId}/`);
      toast.success("Coupon deleted successfully.");
      router.refresh();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ?? "Failed to delete coupon. Please try again."
      );
    } finally {
      setDeleteLoading(false);
      setDeletingId(null);
    }
  };

  // ── Details ───────────────────────────────────────────────────────────────
  const handleDetails = async (id: number) => {
    setDetailLoading(true);
    setDetailCoupon(null);
    try {
      const response = await axiosInstance.get(`/api/coupons/v1/coupons/${id}/`);
      setDetailCoupon(response.data?.data ?? response.data);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ?? "Failed to fetch coupon details."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Handle Edit Success ──────────────────────────────────────────────────
  const handleEditSuccess = () => {
    setEditingCoupon(null);
    router.refresh();
    toast.success("Coupon updated successfully!");
  };

  return (
    <div className="px-6 py-8 min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Coupons
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all discount coupons
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/admin/coupons/add")}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl px-5 py-2 shadow-sm transition-all duration-200"
        >
          + New Coupon
        </Button>
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
                  Code
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-5">
                  Type
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-5">
                  Value
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-5">
                  Min. Order
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-5">
                  Usage
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-5">
                  Valid Period
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-5">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-5 text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-16 text-gray-400 text-sm"
                  >
                    <Tag className="mx-auto mb-2 w-8 h-8 text-gray-300" />
                    No coupons found.
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon, index) => (
                  <TableRow
                    key={coupon.id}
                    className="border-b border-gray-100 hover:bg-orange-50/40 transition-colors duration-150"
                  >
                    {/* # */}
                    <TableCell className="py-4 px-5 text-sm text-gray-400 font-medium">
                      {coupon.id}
                    </TableCell>

                    {/* Code */}
                    <TableCell className="py-4 px-5">
                      <span className="font-mono font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg text-sm border border-orange-100">
                        {coupon.code}
                      </span>
                    </TableCell>

                    {/* Type */}
                    <TableCell className="py-4 px-5">
                      <Badge
                        className={
                          coupon.type === "percentage"
                            ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50 font-semibold"
                            : "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-50 font-semibold"
                        }
                      >
                        {coupon.type === "percentage" ? "%" : "$"}{" "}
                        {coupon.type.charAt(0).toUpperCase() + coupon.type.slice(1)}
                      </Badge>
                    </TableCell>

                    {/* Value */}
                    <TableCell className="py-4 px-5 text-sm font-bold text-gray-800">
                      {coupon.type === "percentage"
                        ? `${parseFloat(coupon.value)}%`
                        : `৳${parseFloat(coupon.value).toFixed(2)}`}
                    </TableCell>

                    {/* Min Order */}
                    <TableCell className="py-4 px-5 text-sm text-gray-600">
                      {parseFloat(coupon.min_order_amount) === 0
                        ? <span className="text-gray-400">No min.</span>
                        : `৳${parseFloat(coupon.min_order_amount).toLocaleString()}`}
                    </TableCell>

                    {/* Usage */}
                    <TableCell className="py-4 px-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-700 font-medium">
                          {coupon.usage_count}{" "}
                          <span className="text-gray-400">
                            / {coupon.usage_limit ?? "∞"}
                          </span>
                        </span>
                        {coupon.usage_limit && (
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-400 rounded-full transition-all"
                              style={{
                                width: `${Math.min(
                                  (coupon.usage_count / coupon.usage_limit) * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Valid Period */}
                    <TableCell className="py-4 px-5 text-sm text-gray-600">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-gray-400">From</span>
                        <span>{formatDate(coupon.valid_from)}</span>
                        <span className="text-xs text-gray-400 mt-1">To</span>
                        <span>{formatDate(coupon.valid_to)}</span>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-4 px-5">
                      {getStatusBadge(coupon.status)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-4 px-5">
                      <div className="flex items-center justify-center gap-2">
                        {/* Details */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDetails(coupon.id)}
                          className="h-8 w-8 p-0 border border-gray-200 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 text-gray-500 rounded-lg transition-all duration-200"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>

                        {/* Edit */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(coupon.id)}
                          className="h-8 w-8 p-0 border border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 text-gray-500 rounded-lg transition-all duration-200"
                          title="Edit Coupon"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>

                        {/* Delete */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeletingId(coupon.id)}
                          className="h-8 w-8 p-0 border border-gray-200 hover:border-red-400 hover:bg-red-50 hover:text-red-600 text-gray-500 rounded-lg transition-all duration-200"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Footer Summary ── */}
        {coupons.length > 0 && (
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 font-medium">
            Showing {coupons.length} of {pagination?.count ?? coupons.length} coupons
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {pagination && <Pagination paginationData={pagination} className="mt-4" />}

      {/* ── Delete Confirmation Dialog ── */}
      <AlertDialog
        open={deletingId !== null}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 text-lg font-bold">
              Delete Coupon?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              This action cannot be undone. The coupon will be permanently
              removed from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
              disabled={deleteLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Details Dialog ── */}
      <Dialog
        open={detailCoupon !== null || detailLoading}
        onOpenChange={(open) => {
          if (!open) {
            setDetailCoupon(null);
            setDetailLoading(false);
          }
        }}
      >
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900 font-bold text-lg flex items-center gap-2">
              <Tag className="w-4 h-4 text-orange-500" />
              Coupon Details
            </DialogTitle>
          </DialogHeader>

          {detailLoading && (
            <div className="py-12 flex justify-center items-center">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {detailCoupon && !detailLoading && (
            <div className="mt-2">
              {/* Code Banner */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
                <span className="font-mono font-bold text-white text-lg tracking-widest">
                  {detailCoupon.code}
                </span>
                {getStatusBadge(detailCoupon.status)}
              </div>

              <div className="space-y-0.5">
                <DetailRow
                  icon={<Tag className="w-4 h-4" />}
                  label="Type"
                  value={
                    detailCoupon.type.charAt(0).toUpperCase() +
                    detailCoupon.type.slice(1)
                  }
                />
                <DetailRow
                  icon={
                    detailCoupon.type === "percentage" ? (
                      <Percent className="w-4 h-4" />
                    ) : (
                      <DollarSign className="w-4 h-4" />
                    )
                  }
                  label="Discount Value"
                  value={
                    detailCoupon.type === "percentage"
                      ? `${parseFloat(detailCoupon.value)}%`
                      : `৳${parseFloat(detailCoupon.value).toFixed(2)}`
                  }
                />
                <DetailRow
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Minimum Order Amount"
                  value={
                    parseFloat(detailCoupon.min_order_amount) === 0
                      ? "No minimum"
                      : `৳${parseFloat(detailCoupon.min_order_amount).toLocaleString()}`
                  }
                />
                <DetailRow
                  icon={<Hash className="w-4 h-4" />}
                  label="Usage"
                  value={`${detailCoupon.usage_count} used / ${
                    detailCoupon.usage_limit ?? "Unlimited"
                  } limit`}
                />
                <DetailRow
                  icon={<Calendar className="w-4 h-4" />}
                  label="Valid From"
                  value={formatDateTime(detailCoupon.valid_from)}
                />
                <DetailRow
                  icon={<Calendar className="w-4 h-4" />}
                  label="Valid To"
                  value={formatDateTime(detailCoupon.valid_to)}
                />
                <DetailRow
                  icon={<ShieldCheck className="w-4 h-4" />}
                  label="Created At"
                  value={formatDateTime(detailCoupon.created_at)}
                />
              </div>

              {/* Edit shortcut */}
              <Button
                className="w-full mt-5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all"
                onClick={() => {
                  setDetailCoupon(null);
                  handleEdit(detailCoupon.id);
                }}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit This Coupon
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Edit Coupon Dialog ── */}
      <Dialog
        open={editingCoupon !== null || editLoading}
        onOpenChange={(open) => {
          if (!open) {
            setEditingCoupon(null);
            setEditLoading(false);
          }
        }}
      >
        <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
            <DialogTitle className="text-gray-900 font-bold text-lg flex items-center gap-2">
              <Pencil className="w-4 h-4 text-blue-500" />
              Edit Coupon
            </DialogTitle>
          </DialogHeader>

          {editLoading && (
            <div className="py-12 flex justify-center items-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {editingCoupon && !editLoading && (
            <CouponEditForm
              coupon={editingCoupon}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingCoupon(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}