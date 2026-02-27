import api from "@/lib/axios";

export async function login(payload: { email: string; password: string }) {
  return await api.post("/authentication/v1/login/", payload);
}

export async function logout() {
  return await api.delete("/authentication/v1/logout/");
}

export async function verifyEmail(payload: { email: string; otp: number }) {
  return await api.post("/authentication/v1/register/email/verify/", payload);
}

export async function sendOtp(payload: { email: string }) {
  return await api.post("/authentication/v1/register/email/", payload);
}

interface registerCustomerPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

export async function registerCustomer(payload: registerCustomerPayload) {
  return await api.post("/authentication/v1/register/customer/", payload);
}

export async function registerVendor(payload: FormData) {
  return await api.post("/authentication/v1/register/vendor/", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function registerStoreOwner(payload: FormData) {
  return await api.post("/authentication/v1/register/store_owner/", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

// Forgot Password Flow
export async function requestPasswordReset(payload: { email: string }) {
  return await api.post("/authentication/v1/forget_password/", payload);
}

export type VerifyPasswordResetOtpResponse = {
  code: number;
  message: string;
  status: string;
  can_change_pass: boolean;
  details: string;
  token: string;
};

export async function verifyPasswordResetOtp(payload: {
  email: string;
  otp: number;
}) {
  return await api.post<VerifyPasswordResetOtpResponse>(
    "/authentication/v1/verify_otp/",
    payload
  );
}

export async function performPasswordReset(payload: {
  email: string;
  password: string;
  token: string;
}) {
  return await api.post("/authentication/v1/reset_password/", payload);
}
