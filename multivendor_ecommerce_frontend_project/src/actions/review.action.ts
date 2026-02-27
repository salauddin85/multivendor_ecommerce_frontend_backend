"use server";

import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export async function createReview(data: {
  product_id: number;
  variant_id?: number;
  rating: number;
  comment: string;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(`${BASE_URL}/api/reviews/v1/reviews/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `access_token=${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    const response = await res.json();

    if (res.ok) {
      return {
        success: true,
        message: response.message || "Review submitted successfully",
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to submit review",
        errors: response.errors,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error",
    };
  }
}

// Get customer reviews
export async function getReviews(page: number = 1) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(`${BASE_URL}/api/reviews/v1/reviews/?page=${page}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `access_token=${accessToken}`,
      },
    });

    const response = await res.json();

    if (res.ok) {
      return {
        success: true,
        data: response.data,
        pagination: response.pagination,
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to fetch reviews",
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error",
    };
  }
}
