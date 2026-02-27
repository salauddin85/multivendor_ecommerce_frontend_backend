"use server";

import { cookies } from "next/headers";
import {  updateTag } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export async function createAddress(data: any, orderId?: number) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  try {
    const payload = {
      ...data,
      ...(orderId && { order: orderId }),
    };

    const res = await fetch(`${BASE_URL}/api/orders/v1/orders/address/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `access_token=${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const response = await res.json();
    if (res.ok) {
      updateTag("addresses");
      return {
        success: true,
        message: "Address created successfully",
        data: response.data,
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to create address",
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

export async function getAllAddress() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(`${BASE_URL}/api/orders/v1/orders/address/`, {
      method: "GET",
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      next: { tags: ["addresses"] },
    });

    const response = await res.json();

    if (res.ok) {
      return {
        success: true,
        data: response.data || [],
      };
    } else {
      return {
        success: false,
        message: response.message || "Failed to fetch addresses",
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

// Delete address
export async function deleteAddress(addressId: number) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  try {
    const res = await fetch(
      `${BASE_URL}/api/orders/v1/orders/address/${addressId}/`,
      {
        method: "DELETE",
        headers: {
          Cookie: `access_token=${accessToken}`,
        },
      }
    );

    if (res.ok) {
        updateTag("addresses");
      return {
        success: true,
        message: "Address deleted successfully",
      };
    } else {
        const response = await res.json();
      return {
        success: false,
        message: response.message || "Failed to delete address",
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Network error",
    };
  }
}

