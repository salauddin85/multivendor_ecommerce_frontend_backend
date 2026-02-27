"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type Props = {
  orderId?: string;
  status?: string;
  paymentId?: string;     
  transactionId?: string;
  verifyResponse?: any;
};

export default function PaymentSuccess({
  orderId,
  status,
  verifyResponse,
  
}: Props) {
  const router = useRouter();

  useEffect(() => {
    if (verifyResponse?.status === "success") {
      const timer = setTimeout(() => {
        router.push(`/dashboard/customer/orders/${orderId}`);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [verifyResponse, orderId, router]);

  // 🔄 Verifying State
  if (!verifyResponse) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center px-4 bg-white">
        <div className="bg-white border shadow-lg rounded-2xl p-8 text-center max-w-md w-full">
          <Loader2 className="mx-auto animate-spin text-orange-500" size={48} />
          <h2 className="mt-4 text-xl font-semibold text-gray-800">
            Verifying Payment...
          </h2>
          <p className="mt-2 text-gray-500 text-sm">
            Please wait while we confirm your transaction.
          </p>
        </div>
      </section>
    );
  }

  // ❌ Failed State
  if (verifyResponse.status !== "success") {
    return (
      <section className="min-h-[60vh] flex items-center justify-center px-4 bg-white">
        <div className="bg-white border shadow-lg rounded-2xl p-8 text-center max-w-md w-full">
          <XCircle className="mx-auto text-red-500" size={56} />
          <h2 className="mt-4 text-xl font-bold text-red-600">
            Payment Failed
          </h2>
          <p className="mt-2 text-gray-500 text-sm">
            Something went wrong while verifying your payment.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
          >
            Go Back Home
          </button>
        </div>
      </section>
    );
  }

  // ✅ Success State
  return (
    <section className="min-h-[60vh] flex items-center justify-center px-4 bg-white">
      <div className="bg-white border shadow-xl rounded-3xl p-10 text-center max-w-lg w-full">
        
        {/* Icon Circle */}
        <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-orange-100">
          <CheckCircle className="text-orange-500" size={48} />
        </div>

        <h1 className="mt-6 text-3xl font-bold text-gray-800">
          Payment Successful 🎉
        </h1>

        <p className="mt-3 text-gray-600">
          Your order has been successfully confirmed.
        </p>

        <div className="mt-6 bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-1 border">
          <p>
            <span className="font-semibold text-gray-800">Order ID:</span>{" "}
            {orderId}
          </p>
          <p>
            <span className="font-semibold text-gray-800">Status:</span>{" "}
            {status}
          </p>
        </div>

        <p className="mt-6 text-gray-500 text-sm">
          Redirecting to your order details in a few seconds...
        </p>

        <button
          onClick={() =>
            router.push(`/dashboard/customer/orders/${orderId}`)
          }
          className="mt-6 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition shadow-md"
        >
          View Order Now
        </button>
      </div>
    </section>
  );
}