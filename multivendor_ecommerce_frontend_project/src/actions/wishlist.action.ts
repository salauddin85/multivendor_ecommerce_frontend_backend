"use server";

import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export async function getWishlistItems() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  try {
    const res = await fetch(`${BASE_URL}/api/wishlist/v1/wishlists/items/`, {
      method: "GET",
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      cache: "no-store",
    });

    const response = await res.json();

    if (res.ok) {
      return {
        success: true,
        data: response.data || [],
        message: response.message || "Wishlist items fetched",
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to fetch wishlist items",
        data: [],
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error",
      data: [],
    };
  }
}
export async function delete_wishlist_item(itemId: number) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  try {
    const res = await fetch(`${BASE_URL}/api/wishlist/v1/wishlists/items/${itemId}/`, {
      method: "DELETE",
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
    });

    if (res.ok) {
      return {
        success: true,
        message: "Item removed from wishlist",
      };
    } else {
      const response = await res.json();
      return {
        success: false,
        message: response.message || "Failed to remove item",
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error",
    };
  }
}export async function add_to_wishlist(productId: number, variantId: number | null) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  try {
    const res = await fetch(`${BASE_URL}/api/wishlist/v1/wishlists/items/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `access_token=${accessToken}`,
      },
      body: JSON.stringify({
        product_id: productId,
        variant_id: variantId,
      }),
    });

    const response = await res.json();

    if (res.ok) {
      return {
        success: true,
        message: response.message || "Item added to wishlist",
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to add item to wishlist",
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error",
    };
  }
}
