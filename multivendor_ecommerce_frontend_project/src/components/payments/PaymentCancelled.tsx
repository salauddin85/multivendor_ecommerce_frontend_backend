"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

type Props = {
  orderId?: string;
  status?: string;
  paymentId?: string;
  transactionId?: string;
};

export default function PaymentCancelled({
  orderId,
  transactionId,
}: Props) {
  const router = useRouter();

  return (
    <section className="min-h-[60vh] flex items-center justify-center px-4 bg-white">
      <div className="bg-white border shadow-xl rounded-3xl p-10 text-center max-w-lg w-full">
        
        {/* Icon Circle */}
        <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100">
          <AlertTriangle className="text-yellow-500" size={48} />
        </div>

        <h1 className="mt-6 text-3xl font-bold text-gray-800">
          Payment Cancelled
        </h1>

        <p className="mt-3 text-gray-600">
          You cancelled the payment before it was completed.
        </p>

        {/* Info Box */}
        <div className="mt-6 bg-gray-50 rounded-xl p-4 text-sm text-gray-700 space-y-2 border">
          {orderId && (
            <p>
              <span className="font-semibold text-gray-800">
                Order ID:
              </span>{" "}
              {orderId}
            </p>
          )}

          {transactionId && (
            <p>
              <span className="font-semibold text-gray-800">
                Transaction ID:
              </span>{" "}
              {transactionId}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <button
            onClick={() =>
              router.push(`/dashboard/customer/orders/${orderId}`)
            }
            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition shadow-md"
          >
            Your Orders
          </button>

          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    </section>
  );
}