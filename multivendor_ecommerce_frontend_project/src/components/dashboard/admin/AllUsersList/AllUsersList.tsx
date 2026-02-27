"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Users, Search, ShieldBan, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────────

type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
};

type PaginationData = {
  count: number;
  current_page: number;
  total_pages: number;
  next: string | boolean | null;
  previous: string | boolean | null;
  page_size?: number;
};

type AllUsersListProps = {
  all_users_list: {
    data: User[];
    pagination: PaginationData;
  };
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",

  });
}

function getInitials(firstName: string, lastName: string, email: string) {
  const f = firstName?.charAt(0) ?? "";
  const l = lastName?.charAt(0) ?? "";
  return (f + l).toUpperCase() || email.charAt(0).toUpperCase();
}

function getFullName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim() || null;
}

const USER_TYPE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700 border-red-200",
  vendor: "bg-violet-100 text-violet-700 border-violet-200",
  store_owner: "bg-blue-100 text-blue-700 border-blue-200",
  customer: "bg-sky-100 text-sky-700 border-sky-200",
  staff: "bg-amber-100 text-amber-700 border-amber-200",
};

function getUserTypeBadge(type: string) {
  const cls = USER_TYPE_COLORS[type] ?? "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <Badge className={`${cls} border hover:${cls} font-semibold capitalize text-xs`}>
      {type.replace("_", " ")}
    </Badge>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AllUsersList({ all_users_list }: AllUsersListProps) {
  const router = useRouter();

  // local optimistic state for is_active
  const [usersState, setUsersState] = useState<User[]>(all_users_list?.data ?? []);
  const pagination: PaginationData = all_users_list?.pagination;

  // Sync local state when server fetches new page (pagination navigation)
  useEffect(() => {
    setUsersState(all_users_list?.data ?? []);
  }, [all_users_list]);

  // filters
  const [search, setSearch] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // ban/unban dialog
  const [actionTarget, setActionTarget] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Derived user types for filter dropdown ─────────────────────────────────
  const userTypes = useMemo(() => {
    const types = Array.from(new Set(usersState.map((u) => u.user_type)));
    return types.sort();
  }, [usersState]);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return usersState.filter((u) => {
      const fullName = getFullName(u.first_name, u.last_name) ?? "";
      const matchesSearch =
        search === "" ||
        fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesType = userTypeFilter === "all" || u.user_type === userTypeFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && u.is_active) ||
        (statusFilter === "banned" && !u.is_active);
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [usersState, search, userTypeFilter, statusFilter]);

  // ── Ban / Unban handler ────────────────────────────────────────────────────
  const handleBanUnban = async () => {
    if (!actionTarget) return;
    const isBanning = actionTarget.is_active;
    setActionLoading(true);

    try {
      if (isBanning) {
        // Ban → POST
        await axiosInstance.post(`/api/authorization/v1/ban/${actionTarget.id}/`);
        toast.success(`${actionTarget.email} has been banned.`);
      } else {
        // Unban → PATCH
        await axiosInstance.patch(`/api/authorization/v1/ban/${actionTarget.id}/`);
        toast.success(`${actionTarget.email} has been unbanned.`);
      }

      // Optimistic UI update
      setUsersState((prev) =>
        prev.map((u) =>
          u.id === actionTarget.id
            ? { ...u, is_active: !isBanning, is_staff: !isBanning }
            : u
        )
      );
    } catch (error: any) {
      const serverErrors = error?.response?.data?.errors;
      if (serverErrors) {
        const messages = Object.entries(serverErrors)
          .map(([field, errs]) => `${field}: ${(errs as string[]).join(", ")}`)
          .join(" | ");
        toast.error(messages);
      } else {
        toast.error(
          error?.response?.data?.message ??
            `Failed to ${isBanning ? "ban" : "unban"} user. Please try again.`
        );
      }
    } finally {
      setActionLoading(false);
      setActionTarget(null);
    }
  };

  return (
    <div className="px-6 py-8 min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all registered users
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 text-sm font-semibold text-orange-600">
          Total: {pagination?.count ?? usersState.length}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl border-gray-200 text-sm focus-visible:ring-orange-400"
          />
        </div>

        {/* User Type Filter */}
        <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
          <SelectTrigger className="w-[160px] rounded-xl border-gray-200 text-sm focus:ring-orange-400">
            <SelectValue placeholder="User Type" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All Types</SelectItem>
            {userTypes.map((t) => (
              <SelectItem key={t} value={t} className="capitalize">
                {t.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] rounded-xl border-gray-200 text-sm focus:ring-orange-400">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>

        {/* Result count */}
        <span className="text-xs text-gray-400 ml-auto">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
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
                  User
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-5">
                  Role
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-5">
                  Staff
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-5">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-5">
                  Joined
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-5 text-center">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-gray-400 text-sm">
                    <Users className="mx-auto mb-2 w-8 h-8 text-gray-300" />
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user, index) => {
                  const fullName = getFullName(user.first_name, user.last_name);
                  const initials = getInitials(user.first_name, user.last_name, user.email);

                  return (
                    <TableRow
                      key={user.id}
                      className={`border-b border-gray-100 transition-colors duration-150 ${
                        !user.is_active
                          ? "bg-red-50/40 hover:bg-red-50/60"
                          : "hover:bg-orange-50/40"
                      }`}
                    >
                      {/* # */}
                      <TableCell className="py-4 px-5 text-sm text-gray-400 font-medium">
                        {user.id}
                      </TableCell>

                      {/* User */}
                      <TableCell className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                              user.is_active
                                ? "bg-gradient-to-br from-orange-400 to-orange-600"
                                : "bg-gradient-to-br from-gray-300 to-gray-400"
                            }`}
                          >
                            {initials}
                          </div>
                          <div className="flex flex-col">
                            {fullName ? (
                              <span className="text-sm font-semibold text-gray-800">
                                {fullName}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400 italic">No name</span>
                            )}
                            <span className="text-xs text-gray-400">{user.email}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Role */}
                      <TableCell className="py-4 px-5">
                        {getUserTypeBadge(user.user_type)}
                      </TableCell>

                      {/* Staff */}
                      <TableCell className="py-4 px-5">
                        {user.is_staff ? (
                          <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 font-semibold text-xs">
                            Yes
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">No</span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-4 px-5">
                        {user.is_active ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-semibold">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-600 border border-red-200 hover:bg-red-100 font-semibold">
                            Banned
                          </Badge>
                        )}
                      </TableCell>

                      {/* Joined */}
                      <TableCell className="py-4 px-5 text-sm text-gray-500">
                        {formatDate(user.date_joined)}
                      </TableCell>

                      {/* Action */}
                      <TableCell className="py-4 px-5 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActionTarget(user)}
                          className={`h-8 px-3 rounded-lg font-semibold text-xs border transition-all duration-200 flex items-center gap-1.5 mx-auto ${
                            user.is_active
                              ? "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400"
                              : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400"
                          }`}
                        >
                          {user.is_active ? (
                            <>
                              <ShieldBan className="w-3.5 h-3.5" />
                              Ban User
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Unban User
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Footer ── */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 font-medium">
            Showing {filtered.length} of {pagination?.count ?? usersState.length} users
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {pagination && <Pagination paginationData={pagination} className="mt-4" />}

      {/* ── Ban / Unban Confirmation Dialog ── */}
      <AlertDialog
        open={actionTarget !== null}
        onOpenChange={(open) => !open && setActionTarget(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 text-lg font-bold flex items-center gap-2">
              {actionTarget?.is_active ? (
                <>
                  <ShieldBan className="w-5 h-5 text-red-500" />
                  Ban User?
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  Unban User?
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              {actionTarget?.is_active ? (
                <>
                  Are you sure you want to ban{" "}
                  <span className="font-semibold text-gray-700">
                    {actionTarget?.email}
                  </span>
                  ? They will lose access immediately.
                </>
              ) : (
                <>
                  Are you sure you want to unban{" "}
                  <span className="font-semibold text-gray-700">
                    {actionTarget?.email}
                  </span>
                  ? They will regain access.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
              disabled={actionLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBanUnban}
              disabled={actionLoading}
              className={`rounded-xl font-semibold text-white transition-all ${
                actionTarget?.is_active
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-emerald-500 hover:bg-emerald-600"
              }`}
            >
              {actionLoading
                ? actionTarget?.is_active
                  ? "Banning..."
                  : "Unbanning..."
                : actionTarget?.is_active
                ? "Yes, Ban"
                : "Yes, Unban"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}