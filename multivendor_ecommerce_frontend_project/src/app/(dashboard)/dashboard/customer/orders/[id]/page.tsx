import { getOrderDetails } from "@/actions/order.action";
import OrderDetailsClient from "@/components/dashboard/customer/orders/OrderDetailsClient";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const orderId = parseInt(id);

  if (isNaN(orderId)) {
    return notFound();
  }

  const response = await getOrderDetails(orderId);

  if (!response.success || !response.data) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Order</h2>
        <p className="text-gray-600">{response.message || "Order not found."}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <OrderDetailsClient order={response.data} />
    </div>
  );
}
