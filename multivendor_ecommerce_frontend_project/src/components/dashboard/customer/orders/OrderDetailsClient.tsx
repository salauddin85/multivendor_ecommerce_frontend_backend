"use client";

import { useTransition, useState } from "react";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertCircle,
  ShoppingBag,
  Star
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { initiatePayment, cancelOrder } from "@/actions/order.action";
import { createReview } from "@/actions/review.action";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface OrderItem {
  id: number;
  product: {
    id: number;
    title: string;
    slug: string;
    main_image: string;
  };
  product_name: string;
  variant_name: string;
  variant: number | null;
  quantity: number;
  price: string;
  subtotal: string;
}

interface OrderDetails {
  id: number;
  order_number: string;
  created_at: string;
  status: string;
  payment_status: string;
  payment_method: string;
  customer_note: string | null;
  subtotal: string;
  shipping_fee: string;
  discount: string;
  total_amount: string;
  items: OrderItem[];
  tax: string;
  shipping_address: any;
  coupon: {
    id: number;
    code: string;
    type: string;
    value: string;
    min_order_amount: string;
  } | null;
}

interface OrderDetailsClientProps {
  order: OrderDetails;
}

export default function OrderDetailsClient({ order }: OrderDetailsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [isCancelPending, startCancelTransition] = useTransition();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedItemForReview, setSelectedItemForReview] = useState<OrderItem | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isReviewPending, startReviewTransition] = useTransition();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "packed": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "processing": return "bg-blue-50 text-blue-600 border-blue-200";
      case "shipped": return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      case "refunded": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return <Clock size={16} />;
      case "delivered": return <CheckCircle size={16} />;
      case "cancelled": return <XCircle size={16} />;
      case "shipped": return <Truck size={16} />;
      default: return <Package size={16} />;
    }
  };

  const handlePayNow = () => {
    startTransition(async () => {
      const res = await initiatePayment(order.id);
      if (res.success && res.data?.payment_url) {
        window.location.replace(res.data.payment_url);
      } else {
        toast.error(res.message || "Failed to initiate payment");
      }
    });
  };

  const handleCancelOrder = () => {
    setIsCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    startCancelTransition(async () => {
      const res = await cancelOrder(order.id);
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
      setIsCancelDialogOpen(false);
    });
  };

  const openReviewModal = (item: OrderItem) => {
    setSelectedItemForReview(item);
    setReviewRating(5);
    setReviewComment("");
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = () => {
    if (!selectedItemForReview) return;
    if (reviewRating < 1 || reviewRating > 5) {
      toast.error("Please provide a rating between 1 and 5");
      return;
    }

    startReviewTransition(async () => {
      const res = await createReview({
        product_id: selectedItemForReview.product.id,
        variant_id: selectedItemForReview.variant || undefined,
        rating: reviewRating,
        comment: reviewComment,
      });

      if (res.success) {
        toast.success(res.message);
        setIsReviewModalOpen(false);
        router.refresh();
      } else {
        console.log(res);
        const firstError = res?.errors && typeof res.errors === "object" 
          ? Object.values(res.errors).flat()[0] 
          : null;
        toast.error(firstError || res.message || "Failed to submit review");
      }
    });
  };

  const canPayNow = 
    (order.payment_method === "online_payment" || order.payment_method === "") && 
    order.payment_status === "unpaid" &&
    order.status !== "cancelled";

  const nonCancellableStatus = ["cancelled", "delivered", "refunded"];
  const canCancel = !nonCancellableStatus.includes(order.status.toLowerCase());

  const canReview = order.status === "delivered";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header / Back Button */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/customer/orders"
          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <p className="text-sm text-gray-500">
            Order{" "}
            <span className="font-mono font-medium text-gray-700">
              #{order.order_number}
            </span>
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Ordered on</p>
                <p className="font-semibold text-gray-900">
                  {format(
                    new Date(order.created_at),
                    "MMMM d, yyyy 'at' h:mm a",
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {canPayNow && (
                  <Button
                    onClick={handlePayNow}
                    disabled={isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isPending ? "Processing..." : "Pay Now"}
                  </Button>
                )}
                {canCancel && (
                  <Button
                    variant="outline"
                    onClick={handleCancelOrder}
                    disabled={isCancelPending}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                  >
                    {isCancelPending ? "Cancelling..." : "Cancel Order"}
                  </Button>
                )}
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(order.status)}`}
                >
                  {getStatusIcon(order.status)}
                  <span className="text-sm font-semibold capitalize">
                    {order.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper / Timeline could go here in v2 */}
          </div>

          {/* Items List */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingBag size={18} className="text-orange-500" />
                Items Ordered ({order.items.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="p-6 flex gap-4 md:gap-6 items-start"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                    {/* Access main_image safely */}
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${item.product.main_image}`}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                      width={80}
                      height={80}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:justify-between mb-2">
                      <div>
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="font-semibold text-gray-900 line-clamp-2 hover:text-orange-600 transition-colors"
                        >
                          {item.product_name}
                        </Link>
                        {item.variant_name && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            Variant: {item.variant_name}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-gray-900 mt-2 md:mt-0">
                        ৳{parseFloat(item.subtotal).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <p>
                        Qty: {item.quantity} × ৳
                        {parseFloat(item.price).toFixed(2)}
                      </p>

                      {canReview && (
                        <button
                          onClick={() => openReviewModal(item)}
                          className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 text-xs sm:text-sm transition-colors"
                        >
                          <Star size={14} />
                          Write a Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Info */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs h-fit">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>৳{parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee</span>
                <span>৳{parseFloat(order.shipping_fee).toFixed(2)}</span>
              </div>
              {/* Conditional rendering for Tax and Discount if they are > 0 would be nice, but following design strictness */}
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>৳{parseFloat(order?.tax || "0").toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-৳{parseFloat(order.discount).toFixed(2)}</span>
              </div>

              {order.coupon && (
                <div className="bg-green-50 rounded-lg p-3 mt-2 border border-green-100 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Coupon Applied</span>
                    <Badge variant="outline" className="bg-white text-green-700 border-green-200 text-[10px] font-bold">
                      {order.coupon.code}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-green-600 font-medium">
                    You saved {order.coupon.type === 'percentage' ? `${parseFloat(order.coupon.value).toFixed(0)}%` : `৳${parseFloat(order.coupon.value).toFixed(2)}`} on this order
                  </p>
                </div>
              )}

              <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between items-center font-bold text-gray-900 text-lg">
                <span>Total</span>
                <span className="text-orange-600">
                  ৳{parseFloat(order.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-gray-400" />
              Shipping Address
            </h3>
            {/* The example JSON didn't fully expand shipping_address, assuming we handle ID or object */}
            {/* If shipping_address is just an ID in some responses, we might need to handle that, 
                but usually detail API expands it. Based on previous turns, address object has items. 
                I will code defensively assuming it might be an object or we display fallback. */}

            {typeof order.shipping_address === "object" &&
            order.shipping_address !== null ? (
              <div className="text-sm text-gray-600 space-y-1">
                {/* Assuming address structure based on previous context */}
                {/* Provide fail-safe generic display if structure varies */}
                <p className="font-medium text-gray-900">
                  {order.shipping_address.name || "Customer"}
                </p>
                <p>{order.shipping_address.address_line}</p>
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state}{" "}
                  - {order.shipping_address.postal_code}
                </p>
                <p>{order.shipping_address.country}</p>
                <p className="mt-2">{order.shipping_address.phone}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <MapPin size={24} className="text-gray-400" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">No Shipping Address</h4>
                <p className="text-xs text-gray-500 max-w-[200px]">
                  It seems you haven&apos;t added any shipping address for this order yet.
                </p>
              </div>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-gray-400" />
              Payment Info
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                <p className="font-medium text-gray-900 capitalize flex items-center gap-2">
                  {order.payment_method
                    ? order.payment_method.replace(/_/g, " ")
                    : "Not selected"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                <Badge
                  variant="outline"
                  className={`${
                    order.payment_status === "paid"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {order.payment_status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Customer Note */}
          {order.customer_note && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Note</h3>
              <p className="text-sm text-gray-600 italic">
                &quot;{order.customer_note}&quot;
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <p className="text-sm text-gray-500 mt-1">
              Share your experience with {selectedItemForReview?.product_name}
            </p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Rating</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={24}
                      className={
                        star <= reviewRating
                          ? "fill-orange-400 text-orange-400"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment" className="text-sm font-semibold">
                Comment
              </Label>
              <Textarea
                id="comment"
                placeholder="How was the product? Quality, sizing, etc."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReviewModalOpen(false)}
              disabled={isReviewPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReviewSubmit}
              disabled={isReviewPending}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isReviewPending ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Cancellation Confirmation Dialog */}
      <AlertDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently cancel your
              order
              <span className="font-bold text-gray-900">
                {" "}
                #{order.order_number}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelPending}>
              No, Keep Order
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmCancel();
              }}
              disabled={isCancelPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isCancelPending ? "Cancelling..." : "Yes, Cancel Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
