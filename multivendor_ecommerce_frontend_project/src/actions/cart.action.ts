"use server";

import { updateTag } from "next/cache";
import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

/**
 * Fetch all items in the cart
 */
export async function get_cart_items() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(`${BASE_URL}/api/cart/v1/cart/items/`, {
      method: "GET",
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      next: { tags: ["cart-items"] },
      cache: "no-store",
    });

    const response = await res.json();
    if (response) {
      return {
        error: false,
        data: response.data || [],
        total_price: response.data?.total_amount || 0,
        total_items: response.data?.items_count || 0,
      };
    } else {
      return {
        error: true,
        message: "Failed to fetch cart items",
        data: [],
      };
    }
  } catch (err: any) {
    return {
      error: true,
      message: err?.message || "Network error",
      data: [],
    };
  }
}

/**
 * Add a product to the cart
 */
export async function add_to_cart(productId: number, variantId?: number, quantity: number = 1) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(`${BASE_URL}/api/cart/v1/cart/items/`, {
      method: "POST",
      headers: {
        Cookie: `access_token=${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product: productId,
        variant: variantId || null,
        quantity: quantity,
      }),
    });

    const response = await res.json();

    if (res.ok) {
      updateTag("cart-items");
      return {
        success: true,
        message: "Item added to cart",
        data: response,
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to add item to cart",
        data: response,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error",
    };
  }
}

/**
 * Update the quantity of a cart item
 */
export async function update_cart_quantity(itemId: number, quantity: number) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(`${BASE_URL}/api/cart/v1/cart/items/${itemId}/`, {
      method: "PATCH", // Based on user request: "{ "quantity": 5 } with send this trough post req make update cart quantity"
      headers: {
        Cookie: `access_token=${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity: quantity,
      }),
    });

    const response = await res.json();

    if (res.ok) {
      updateTag("cart-items");
      return {
        success: true,
        message: "Cart updated successfully",
        data: response,
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to update cart",
        data: response,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error",
    };
  }
}

/**
 * Delete a single item from the cart
 */
export async function delete_cart_item(itemId: number) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(`${BASE_URL}/api/cart/v1/cart/items/${itemId}/`, {
      method: "DELETE",
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
    });

    if (res.ok) {
      updateTag("cart-items");
      return {
        success: true,
        message: "Item removed from cart",
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
}

/**
 * Clear all items from the cart
 */
export async function clear_entire_cart() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(`${BASE_URL}/api/cart/v1/cart/items/clear/`, {
      method: "DELETE",
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
    });

    if (res.ok) {
      updateTag("cart-items");
      return {
        success: true,
        message: "Cart cleared successfully",
      };
    } else {
      const response = await res.json();
      return {
        success: false,
        message: response.message || "Failed to clear cart",
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error",
    };
  }
}
