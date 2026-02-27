"use client";

import { Star, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface Review {
  id: number;
  user: string;
  product: string;
  rating: number;
  comment: string;
  status: string;
  created_at: string;
  vendor: null | any;
  store_owner: null | any;
  order: null | any;
  is_verified_purchase: boolean;
}

interface PaginationData {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | boolean | null;
  previous: string | boolean | null;
  page_size?: number;
}

interface ReviewsTabProps {
  reviews: Review[];
  avgRating: number;
  totalReviews: number;
  pagination?: PaginationData;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
}

export default function ReviewsTab({
  reviews,
  avgRating,
  totalReviews,
  pagination,
  isLoading = false,
  onPageChange,
}: ReviewsTabProps) {

  // Calculate rating counts dynamically from current page reviews
  const ratingCounts = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Handle page change — no reload, just scroll to reviews
  const handlePageChange = (page: number) => {
    if (!onPageChange) return;
    onPageChange(page);
    setTimeout(() => {
      document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Build page number array with ellipsis logic
  const getPageNumbers = (current: number, total: number): (number | "...")[] => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [];
    if (current <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", total);
    } else if (current >= total - 3) {
      pages.push(1, "...", total - 4, total - 3, total - 2, total - 1, total);
    } else {
      pages.push(1, "...", current - 1, current, current + 1, "...", total);
    }
    return pages;
  };

  return (
    <div className="max-w-4xl space-y-8 border-t-2 border-primary pt-2 md:pt-4 px-2">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Reviews</h2>

      {/* ── Rating Summary ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Average Score */}
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900">
            {Number(avgRating).toFixed(1)}
          </div>
          <div className="flex justify-center gap-1 my-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={20}
                className={
                  i < Math.round(Number(avgRating))
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }
              />
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Rating Bars */}
        <div className="md:col-span-2 space-y-3">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingCounts[stars as keyof typeof ratingCounts];
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700 w-12">
                  {stars}★
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Reviews List ── */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Customer Reviews</h3>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 size={40} className="animate-spin text-primary" />
          </div>
        ) : reviews.length > 0 ? (
          <>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-gray-100 pb-6 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* User + Verified badge */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {review.user?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <p className="font-semibold text-gray-900">{review.user}</p>
                        {review.is_verified_purchase && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                            ✓ Verified Purchase
                          </span>
                        )}
                      </div>

                      {/* Stars + Date */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={15}
                              className={
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatDate(review.created_at)}
                        </span>
                      </div>

                      {/* Comment */}
                      <p className="text-gray-700 mt-3 text-sm leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Pagination ── */}
            {pagination && pagination.total_pages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
                {/* Previous */}
                <button
                  onClick={() =>
                    pagination.previous &&
                    handlePageChange(pagination.current_page - 1)
                  }
                  disabled={!pagination.previous}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300
                             text-gray-700 hover:bg-primary hover:text-white hover:border-primary
                             transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                {/* Page numbers with ellipsis */}
                {getPageNumbers(pagination.current_page, pagination.total_pages).map(
                  (page, idx) =>
                    page === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 select-none">
                        …
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page as number)}
                        className={`w-9 h-9 text-sm font-semibold rounded-lg border transition
                          ${
                            page === pagination.current_page
                              ? "bg-primary text-white border-primary shadow-sm"
                              : "border-gray-300 text-gray-700 hover:bg-primary hover:text-white hover:border-primary"
                          }`}
                      >
                        {page}
                      </button>
                    )
                )}

                {/* Next */}
                <button
                  onClick={() =>
                    pagination.next &&
                    handlePageChange(pagination.current_page + 1)
                  }
                  disabled={!pagination.next}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300
                             text-gray-700 hover:bg-primary hover:text-white hover:border-primary
                             transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Page info */}
            {pagination && pagination.total_pages > 1 && (
              <p className="text-center text-xs text-gray-400 mt-3">
                Page {pagination.current_page} of {pagination.total_pages} —{" "}
                {pagination.count} total reviews
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <Star size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold">
              Be the first to review this product
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Share your experience with others
            </p>
          </div>
        )}
      </div>
    </div>
  );
}