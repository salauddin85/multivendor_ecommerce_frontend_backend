"use server";

import { cookies } from "next/headers";
import { revalidateTag, updateTag } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

// Create order from items (Buy Now / Cart Checkout)
export async function createOrderFromItems(items: Array<{
  product: number;
  variant?: number;
  quantity: number;
}>) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(`${BASE_URL}/api/orders/v1/orders/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `access_token=${accessToken}`,
      },
      body: JSON.stringify({ items }),
    });

    const response = await res.json();

    if (res.ok) {
      return {
        success: true,
        message: response.message || "Order created successfully",
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to create order",
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

// Get order details by ID
export async function getOrderDetails(orderId: number) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(`${BASE_URL}/api/orders/v1/orders/${orderId}/`, {
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
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to fetch order details",
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error",
    };
  }
}

// Apply coupon to order
export async function applyCoupon(code: string, orderId: number) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(`${BASE_URL}/api/coupons/v1/coupons/apply/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `access_token=${accessToken}`,
      },
      body: JSON.stringify({ code, order: orderId }),
    });

    const response = await res.json();

    if (res.ok) {
      return {
        success: true,
        message: response.message || "Coupon applied successfully",
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to apply coupon",
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error",
    };
  }
}

// Confirm order (COD)
export async function confirmOrder(
  orderId: number,
  paymentMethod: string,
  customerNote: string
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(
      `${BASE_URL}/api/orders/v1/orders/${orderId}/confirm/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `access_token=${accessToken}`,
        },
        body: JSON.stringify({
          payment_method: paymentMethod,
          customer_note: customerNote,
        }),
      }
    );

    const response = await res.json();

    if (res.ok) {
      updateTag("cart-items");
      return {
        success: true,
        message: response.message || "Order confirmed successfully",
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to confirm order",
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error",
    };
  }
}

// Legacy function - kept for backward compatibility
export async function createOrder(data: any) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(`${BASE_URL}/api/orders/v1/orders/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `access_token=${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    const response = await res.json();

    if (res.ok) {
      updateTag("cart-items");
      return {
        success: true,
        message: response.message || "Order created successfully",
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to create order",
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

// Updated to include customer_note
export async function initiatePayment(
  orderId: string | number,
  customerNote?: string
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(`${BASE_URL}/api/payments/v1/payments/initiate/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `access_token=${accessToken}`,
      },
      body: JSON.stringify({
        order_id: orderId.toString(),
        ...(customerNote && { customer_note: customerNote }),
      }),
    });

    const response = await res.json();
    console.log("Payment initiation response:", response);

    if (res.ok) {
      return {
        success: true,
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to initiate payment",
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
// Update existing address for order
export async function addExistingAddressToOrder(
  orderId: number,
  shippingAddressId: number
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(
      `${BASE_URL}/api/orders/v1/orders/${orderId}/existing_address/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `access_token=${accessToken}`,
        },
        body: JSON.stringify({ shipping_address: shippingAddressId }),
      }
    );

    const response = await res.json();

    if (res.ok) {
      return {
        success: true,
        message: response.message || "Address updated successfully",
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to update address",
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error",
    };
  }
}

// Get customer orders
export async function getCustomerOrders(page: number = 1, searchQuery: string = "") {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      ...(searchQuery && { search: searchQuery }),
    });

    const res = await fetch(
      `${BASE_URL}/api/orders/v1/orders/list/me/?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `access_token=${accessToken}`,
        },
      }
    );

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
        message: response.message || "Failed to fetch orders",
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error",
    };
  }
}
// Get customer cancelled orders
export async function getCancelledOrders(page: number = 1, searchQuery: string = "") {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      ...(searchQuery && { search: searchQuery }),
    });

    const res = await fetch(
      `${BASE_URL}/api/orders/v1/orders/cancelled/list/?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `access_token=${accessToken}`,
        },
      }
    );

    const response = await res.json();

    if (res.ok) {
      return {
        success: true,
        data: response.data,
        pagination: response.pagination,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error",
    };
  }
}

// Cancel order
export async function cancelOrder(orderId: number) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(`${BASE_URL}/api/orders/v1/orders/${orderId}/cancel/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `access_token=${accessToken}`,
      },
    });

    const response = await res.json();

    if (res.ok) {
      updateTag(`order-${orderId}`);
      updateTag("orders");
      return {
        success: true,
        message: response.message || "Order cancelled successfully",
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to cancel order",
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error",
    };
  }
}

// Get customer delivered orders
export async function getDeliveredOrders(page: number = 1, searchQuery: string = "") {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      ...(searchQuery && { search: searchQuery }),
    });

    const res = await fetch(
      `${BASE_URL}/api/orders/v1/orders/delivered/list/?${queryParams.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `access_token=${accessToken}`,
        },
      }
    );

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
        message: response.message || "Failed to fetch delivered orders",
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error",
    };
  }
}
