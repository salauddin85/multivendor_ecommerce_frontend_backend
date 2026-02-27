"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Subscriber = {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  email: string;
  is_active: boolean;
};

type AllSubscribersListProps = {
  all_subscribers_list: {
    data: Subscriber[];
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

function getInitials(firstName: string, lastName: string, email: string) {
  if (firstName || lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || email.charAt(0).toUpperCase();
  }
  return email.charAt(0).toUpperCase();
}

function getFullName(firstName: string, lastName: string) {
  const name = `${firstName} ${lastName}`.trim();
  return name || null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AllSubscribersList({ all_subscribers_list }: AllSubscribersListProps) {
  const subscribers: Subscriber[] = all_subscribers_list?.data ?? [];

  return (
    <div className="px-6 py-8 min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Subscribers
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            All newsletter subscribers
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 text-sm font-semibold text-orange-600">
          Total: {subscribers.length}
        </div>
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
                  Subscriber
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-5">
                  Subscribed Email
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-5">
                  User ID
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-5">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 px-5">
                  Subscribed At
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {subscribers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-16 text-gray-400 text-sm"
                  >
                    <Users className="mx-auto mb-2 w-8 h-8 text-gray-300" />
                    No subscribers found.
                  </TableCell>
                </TableRow>
              ) : (
                subscribers.map((sub, index) => {
                  const fullName = getFullName(sub.user.first_name, sub.user.last_name);
                  const initials = getInitials(sub.user.first_name, sub.user.last_name, sub.user.email);

                  return (
                    <TableRow
                      key={sub.id}
                      className="border-b border-gray-100 hover:bg-orange-50/40 transition-colors duration-150"
                    >
                      {/* # */}
                      <TableCell className="py-4 px-5 text-sm text-gray-400 font-medium">
                        {index + 1}
                      </TableCell>

                      {/* Subscriber */}
                      <TableCell className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
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
                            <span className="text-xs text-gray-400">{sub.user.email}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Subscribed Email */}
                      <TableCell className="py-4 px-5 text-sm text-gray-700">
                        {sub.email}
                      </TableCell>

                      {/* User ID */}
                      <TableCell className="py-4 px-5">
                        <Badge className="bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-100 font-semibold text-xs">
                          #{sub.user.id}
                        </Badge>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-4 px-5">
                        {sub.is_active ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-semibold">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-100 font-semibold">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>

                      {/* Subscribed At */}
                      <TableCell className="py-4 px-5 text-sm text-gray-500">
                        {formatDateTime(sub.created_at)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Footer ── */}
        {subscribers.length > 0 && (
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 font-medium">
            {subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""} total
          </div>
        )}
      </div>
    </div>
  );
}