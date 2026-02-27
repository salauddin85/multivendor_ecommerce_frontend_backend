// components/payments/AllPaymentsList.tsx
"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/pagination/Pagination";
import {
  CalendarIcon,
  CreditCardIcon,
  DollarSignIcon,
  TrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  RefreshCwIcon,
} from "lucide-react";

type Payment = {
  id: number;
  transaction_id: string;
  method: string;
  amount: string;
  currency: string;
  status: "completed" | "pending" | "cancelled" | "failed";
  paid_at: string | null;
  created_at: string;
};

type PaginationData = {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | boolean | null;
  previous: string | boolean | null;
  page_size: number;
};

type AllPaymentsListProps = {
  all_payments_list: {
    code: number;
    status: string;
    message: string;
    data: Payment[];
    pagination: PaginationData;
  };
};

export default function AllPaymentsList({ all_payments_list }: AllPaymentsListProps) {
  const { data: payments, pagination } = all_payments_list;

  const getStatusBadge = (status: Payment["status"]) => {
    const statusConfig = {
      completed: {
        label: "Completed",
        icon: CheckCircleIcon,
        className: "bg-green-100 text-green-800 border-green-200",
      },
      pending: {
        label: "Pending",
        icon: ClockIcon,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      cancelled: {
        label: "Cancelled",
        icon: XCircleIcon,
        className: "bg-red-100 text-red-800 border-red-200",
      },
      failed: {
        label: "Failed",
        icon: AlertCircleIcon,
        className: "bg-red-100 text-red-800 border-red-200",
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.className} px-3 py-1 font-medium`}>
        <Icon className="w-3.5 h-3.5 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: string, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  const totalAmount = payments.reduce((sum, payment) => {
    if (payment.status === "completed") {
      return sum + parseFloat(payment.amount);
    }
    return sum;
  }, 0);

  const completedPayments = payments.filter((p) => p.status === "completed").length;
  const pendingPayments = payments.filter((p) => p.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Payments
            </CardTitle>
            <CreditCardIcon className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{payments.length}</div>
            <p className="text-xs text-gray-500 mt-1">All transactions</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
            <DollarSignIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatAmount(totalAmount.toString(), "BDT")}
            </div>
            <p className="text-xs text-gray-500 mt-1">From completed payments</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Completed
            </CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{completedPayments}</div>
            <p className="text-xs text-gray-500 mt-1">
              {((completedPayments / payments.length) * 100).toFixed(1)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending
            </CardTitle>
            <RefreshCwIcon className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{pendingPayments}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting confirmation</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5 text-orange-500" />
            Payment Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-700">
                      Transaction ID
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Method
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Amount
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        Paid At
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        Created At
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow
                      key={payment.id}
                      className="hover:bg-orange-50 transition-colors duration-200"
                    >
                      <TableCell className="font-medium">
                        <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded-md text-sm">
                          {payment.transaction_id}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCardIcon className="h-4 w-4 text-gray-400" />
                          <span className="capitalize">{payment.method}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-gray-900">
                          {formatAmount(payment.amount, payment.currency)}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-gray-600">
                        {formatDate(payment.paid_at)}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatDate(payment.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-8">
        <Pagination paginationData={pagination} />
      </div>
    </div>
  );
}