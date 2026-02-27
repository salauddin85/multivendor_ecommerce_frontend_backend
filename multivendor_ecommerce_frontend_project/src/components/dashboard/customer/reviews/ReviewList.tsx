"use client";

import React from "react";
import { format } from "date-fns";
import { Star, ExternalLink, MessageSquare } from "lucide-react";
import Link from "next/link";
import Pagination from "@/components/pagination/Pagination";

interface Review {
  id: number;
  product: number;
  rating: number;
  comment: string;
  created_at: string;
  is_verified_purchase: boolean;
  status: string;
}

interface PaginationData {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  page_size: number;
}

interface ReviewListProps {
  reviews: Review[];
  paginationData: PaginationData;
}

export default function ReviewList({ reviews, paginationData }: ReviewListProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={`${
              star <= rating ? "fill-orange-400 text-orange-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-white border border-dashed border-gray-300 rounded-xl">
        <div className="bg-orange-50 p-6 rounded-full mb-4">
          <MessageSquare className="h-10 w-10 text-orange-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
        <p className="text-gray-500 text-center mb-6 max-w-sm">
          You haven&apos;t written any reviews yet. Shared your experience with
          products you&apos;ve purchased!
        </p>
        <Link
          href="/dashboard/customer/deliveries"
          className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition"
        >
          Review Delivered Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">My Reviews</h2>
        <span className="text-sm text-gray-500">
          Total {paginationData?.count} reviews
        </span>
      </div>

      <div className="grid gap-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:border-primary/20 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  {renderStars(review.rating)}
                  <span className="text-xs text-gray-400">
                    {format(new Date(review.created_at), "MMM d, yyyy")}
                  </span>
                  {review.is_verified_purchase && (
                    <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 uppercase tracking-tight">
                      Verified Purchase
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full border uppercase tracking-tight ${
                      review.status === "approved"
                        ? "text-blue-600 bg-blue-50 border-blue-100"
                        : "text-amber-600 bg-amber-50 border-amber-100"
                    }`}
                  >
                    {review.status}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed italic">
                  &quot;{review.comment}&quot;
                </p>
              </div>

              <div className="flex items-center justify-end">
                <Link
                  href={`/products/${review.product}`} // TODO: Add product slug
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <ExternalLink size={14} />
                  View Product
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {paginationData && paginationData.total_pages > 1 && (
        <Pagination paginationData={paginationData} className="mt-8" />
      )}
    </div>
  );
}
