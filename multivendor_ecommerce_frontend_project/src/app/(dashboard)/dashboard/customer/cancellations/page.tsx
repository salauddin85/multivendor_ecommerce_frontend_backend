import React from "react";
import { getCancelledOrders } from "@/actions/order.action";
import CancelList from "@/components/dashboard/customer/cancellations/CancelList";

interface CancellationsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CancellationsPage({
  searchParams,
}: CancellationsPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;
  const search = (resolvedSearchParams?.search as string) || "";

  const response = await getCancelledOrders(page, search);

  if (!response || !response.success) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        Failed to load cancellations. Please try again later.
      </div>
    );
  }

  const { data: orders, pagination: paginationData } = response;

  return (
    <div className="container mx-auto px-4 py-6">
      <CancelList orders={orders || []} paginationData={paginationData} />
    </div>
  );
}
