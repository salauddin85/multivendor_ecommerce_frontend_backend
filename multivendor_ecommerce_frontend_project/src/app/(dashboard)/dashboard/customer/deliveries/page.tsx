import React from "react";
import { getDeliveredOrders } from "@/actions/order.action";
import DeliveriesList from "@/components/dashboard/customer/deliveries/DeliveriesList";

interface DeliveriesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DeliveriesPage({
  searchParams,
}: DeliveriesPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;
  const search = (resolvedSearchParams?.search as string) || "";

  const response = await getDeliveredOrders(page, search);

  if (!response.success) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        Failed to load deliveries. Please try again later.
      </div>
    );
  }

  const { data: orders, pagination: paginationData } = response;

  return (
    <div className="container mx-auto px-4 py-6">
      <DeliveriesList orders={orders || []} paginationData={paginationData} />
    </div>
  );
}
