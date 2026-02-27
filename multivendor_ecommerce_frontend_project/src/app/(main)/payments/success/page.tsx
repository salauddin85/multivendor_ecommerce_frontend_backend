import PaymentSuccess from "@/components/payments/PaymentSuccess";
import axiosInstance from "@/lib/axios";
import { cookies } from "next/headers";

type PageProps = {
  searchParams?: Promise<{
    order_id?: string;
    status?: string;
    payment_id?: string;
    transaction_id?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("access_token")?.value;

  const params = await searchParams;

  const {
    order_id,
    status,
    payment_id,
    transaction_id,
  } = params || {};

  let verifyResponse = null;


  try {
    if (order_id && transaction_id) {
      const response = await axiosInstance.post(
        "/api/payments/v1/payments/verify/",
        {
          tran_id: transaction_id,
          val_id: payment_id, 
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      verifyResponse = response.data;
    }
  } catch (error) {
    console.error("Payment verification failed:", error);
  }

  return (
    <PaymentSuccess
      orderId={order_id}
      status={status}
      paymentId={payment_id}
      transactionId={transaction_id}
      verifyResponse={verifyResponse}
    />
  );
}
