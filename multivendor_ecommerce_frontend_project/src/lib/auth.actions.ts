"use server";

import { cookies } from "next/headers";
import axiosInstance from "./axios";
import { revalidateTag } from "next/cache";

interface AuthResponse {
  success: boolean;
  message: string;
  data?: any;
}

export async function verifyEmailOTP(
  email: string,
  otp: string
): Promise<AuthResponse> {
  try {
    const res = await axiosInstance.post(
      `/api/authentication/v1/register/email/verify/`,
      { email, otp }
    );

    const data = res.data;

    if (data.code === 200 && data.status === "success") {
      return {
        success: true,
        message: "Verification successful",
        data,
      };
    } else {
      return {
        success: false,
        message: data.message || "Verification failed",
        data,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.response?.data?.message || err?.message || "Network Error",
      data: err?.response?.data || null,
    };
  }
}
export async function forget_verifyEmailOTP(
  email: string,
  otp: string
): Promise<AuthResponse> {
  try {
    const res = await axiosInstance.post(`/api/authentication/v1/verify_otp/`, {
      email,
      otp,
    });

    const data = res.data;

    if (data.code === 200 && data.status === "success") {
      return {
        success: true,
        message: "Verification successful",
        data,
      };
    } else {
      return {
        success: false,
        message: data.message || "Verification failed",
        data,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.response?.data?.message || err?.message || "Network Error",
      data: err?.response?.data || null,
    };
  }
}

export async function sendOTPEmail(email: string): Promise<AuthResponse> {
  try {
    const res = await axiosInstance.post(
      `/api/authentication/v1/register/email/`,
      { email }
    );

    const data = res.data;
    if (data.code === 201 && data.status === "success") {
      return {
        success: true,
        message: "OTP sent successfully",
        data,
      };
    } else {
      return {
        success: false,
        message: data.message || "Verification failed",
        data,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.response?.data?.message || err?.message || "Network Error",
      data: err?.response?.data || null,
    };
  }
}
export async function forget_sendOtp(email: string): Promise<AuthResponse> {
  try {
    const res = await axiosInstance.post(
      `/api/authentication/v1/forget_password/`,
      { email }
    );

    const data = res.data;
    if (data.code === 200 && data.status === "success") {
      return {
        success: true,
        message: "OTP sent successfully",
        data,
      };
    } else {
      return {
        success: false,
        message: data.message || "Verification failed",
        data,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.response?.data?.message || err?.message || "Network Error",
      data: err?.response?.data || null,
    };
  }
}

export async function loginUser(
  email: string,
  password: string,
  rememberMe: boolean
): Promise<AuthResponse> {
  const cookieStore = await cookies();
  try {
    const res = await axiosInstance.post(`/api/authentication/v1/login/`, {
      email,
      password,
    });

    const data = res.data;

    if (data.code === 200 && data.status === "success") {
      cookieStore.set({ name: "access_token", value: data.access_token });
      cookieStore.set({ name: "user_type", value: data.user_type });
      return {
        success: true,
        message: "Login successful",
        data,
      };
    } else {
      return {
        success: false,
        message: data.message || "Login failed",
        data,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.response?.data?.message || err?.message || "Network Error",
      data: err?.response?.data || null,
    };
  }
}

export async function logoutUser() {
  try {
    const res = await axiosInstance.delete(`/api/authentication/v1/logout/`);
    const data = res.data;

    if (data.code === 200 && data.status === "success") {
      const cookieStore = await cookies();
      cookieStore.delete("access_token");
      cookieStore.delete("user_type");

      return {
        success: true,
        message: "Log Out successful",
        data,
      };
    } else {
      return { error: true, message: data.message || "Log Out failed", data };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.response?.data?.message || err?.message || "Network Error",
      data: err?.response?.data || null,
    };
  }
}

export async function resetPassword(
  email: string,
  newPassword: string,
  token: string
): Promise<AuthResponse> {
  try {
    // console.log("[AUTH ACTION] Reset password for:", email);
    // console.log("[AUTH ACTION] New password:", newPassword);

    if (!email || !newPassword || !token) {
      return {
        success: false,
        message: "Email and password are required",
      };
    }
    const res = await axiosInstance.post(
      `/api/authentication/v1/reset_password/`,
      { email, password: newPassword, token }
    );

    const data = res.data;

    if (data.code === 200 && data.status === "success") {
      return {
      success: true,
      message: "Password reset successfully",
      data,
    };
    
    } 
    return {
      success: false,
      message: data.message || "Password reset failed",
      data,
    };
    
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Password reset failed",
      data: error?.response?.data || null,
    };
  }
}

export async function registerUser(
  role: string,
  formData: any
): Promise<AuthResponse> {
  try {
    if (role === "customer") {
      const res = await axiosInstance.post(
        `/api/authentication/v1/register/customer/`,
        formData
      );

      const data = res.data;

      if (data.code === 201 && data.status === "success") {
        return {
          success: true,
          message: "Registration successful",
          data,
        };
      } else {
        return {
          success: false,
          message: data.message || "Registration failed",
          data,
        };
      }
    }

    if (role === "vendor") {
      const res = await axiosInstance.post(
        `/api/authentication/v1/register/vendor/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = res.data;

      if (data.code === 201 && data.status === "success") {
        return {
          success: true,
          message: "Registration successful",
          data,
        };
      } else {
        return {
          success: false,
          message: data.message || "Registration failed",
          data,
        };
      }
    }

    if (role === "company") {
      const res = await axiosInstance.post(
        `/api/authentication/v1/register/store_owner/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = res.data;

      if (data.code === 201 && data.status === "success") {
        return {
          success: true,
          message: "Registration successful",
          data,
        };
      } else {
        return {
          success: false,
          message: data.message || "Registration failed",
          data,
        };
      }
    }

    return {
      success: false,
      message: `Invalid role: ${role} provided.`,
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || error.message || "Registration failed",
      data: error.response?.data,
    };
  }
}

export async function updatePassword(formData:{ current_password: string, new_password: string, confirm_password: string }) {
  const { current_password, new_password, confirm_password } = formData;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  try {
    const res = await axiosInstance.patch(
      `/api/authentication/v1/reset_password/`,
      { current_password, new_password, confirm_password },
      {
        headers: { Cookie: `access_token=${accessToken}` },
      }
    );

    const data = res.data;

    if (data.code === 200 && data.status === "success") {
      return data;
    } else {
      return {
        error: true,
        message: data.message || "Verification failed",
        data,
      };
    }
  } catch (err: any) {
    return {
      error: true,
      message: err?.response?.data?.message || err?.message || "Network Error",
      data: err?.response?.data || null,
    };
  }
}

export async function get_me() {
  const cookiestore = await cookies();
  const accessToken = cookiestore.get("access_token")?.value;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/authorization/v1/me/`,
      {
        credentials: "include",
        headers: { Cookie: `access_token=${accessToken}` },
        next: { tags: ["get-me"] },
      }
    );
    const response = await res.json();
    if (response.code === 200 && response.status === "success") {
      return {
        error: false,
        data: response.data,
      };
    } else {
      return {
        error: true,
        message: response.data.message || "Verification failed",
        data: response.data,
      };
    }
  } catch (err: any) {
    return {
      error: true,
      message: err?.response?.data?.message || err?.message || "Network Error",
      data: err?.response?.data || null,
    };
  }
}