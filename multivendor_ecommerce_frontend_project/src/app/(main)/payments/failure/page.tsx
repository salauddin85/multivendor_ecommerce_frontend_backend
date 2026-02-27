import PaymentFailure from "@/components/payments/PaymentFailure";

type PageProps = {
  searchParams?: Promise<{
    order_id?: string;
    status?: string;
    payment_id?: string;
    transaction_id?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  const {
    order_id,
    status,
    payment_id,
    transaction_id,
  } = params || {};

  return (
    <PaymentFailure
      orderId={order_id}
      status={status}
      paymentId={payment_id}
      transactionId={transaction_id}
    />
  );
}
