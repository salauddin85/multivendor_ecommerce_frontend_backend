import { create } from "zustand";

// ---------------- Forget Password Store ----------------
interface ForgetPassState {
  email: string;
  otp: string;
  token: string;
  setEmail: (email: string) => void;
  setOtp: (otp: string) => void;
  setToken: (token: string) => void;
  reset: () => void;
}

export const useForgetPassStore = create<ForgetPassState>((set) => ({
  email: "",
  otp: "",
  token: "",

  setEmail: (email: string) => set({ email }),
  setOtp: (otp: string) => set({ otp }),
  setToken: (token: string) => set({ token }),

  reset: () =>
    set({
      email: "",
      otp: "",
      token: "",
    }),
}));

// ---------------- Registration Store ----------------
interface RegUserState {
  email: string;
  isOtpPass: boolean;
  setEmail: (email: string) => void;
  setOtpPass: (otp: boolean) => void;
  reset: () => void;
}

export const useRegUserStore = create<RegUserState>((set) => ({
  email: "",
  isOtpPass: false,

  setEmail: (email: string) => set({ email }),
  setOtpPass: (otp: boolean) => set({ isOtpPass: otp }),

  reset: () =>
    set({
      email: "",
      isOtpPass: false,
    }),
}));