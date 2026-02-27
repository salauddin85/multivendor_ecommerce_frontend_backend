import React from "react";
import { getReviews } from "@/actions/review.action";
import ReviewList from "@/components/dashboard/customer/reviews/ReviewList";

interface ReviewsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;

  const response = await getReviews(page);

  if (!response.success) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        Failed to load reviews. Please try again later.
      </div>
    );
  }

  const { data: reviews, pagination: paginationData } = response;

  return (
    <div className="container mx-auto px-4 py-6">
      <ReviewList reviews={reviews || []} paginationData={paginationData} />
    </div>
  );
}
