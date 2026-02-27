import React from "react";
import CustomerOrder from "@/components/dashboard/customer/orders/CustomerOrder";
import { getCustomerOrders } from "@/actions/order.action";
import { Loader2 } from "lucide-react";

interface OrdersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrdersPage({
  searchParams,
}: OrdersPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;
  const search = (resolvedSearchParams?.search as string) || "";

  const response = await getCustomerOrders(page, search);
  
  if (!response.success) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        Failed to load orders. Please try again later.
      </div>
    );
  }

  const { data: orders, pagination: paginationData } = response;

  return (
    <div className="container mx-auto px-4 py-6">
      <CustomerOrder orders={orders || []} paginationData={paginationData} />
    </div>
  );
}
