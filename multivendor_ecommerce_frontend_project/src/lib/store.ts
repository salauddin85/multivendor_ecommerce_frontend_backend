import { create } from "zustand"

export interface RegisterData {
  email: string
  password: string
  first_name?: string
  last_name?: string
  phone_number?: string
  remember_me?: boolean
  // Company fields
  store_name?: string
  store_details?: string
  nid_card_image?: File | null
  trade_license?: File | null
  // Vendor fields
  product_details?: string
  product_image?: File | null
  nid_card_pic?: File | null
  address?: string
}

interface ForgotPasswordStore {
  step: 1 | 2 | 3
  email: string
  otp: string
  token: string
  newPassword: string
  confirmPassword: string
  setStep: (step: 1 | 2 | 3) => void
  setEmail: (email: string) => void
  setOtp: (otp: string) => void
  setToken: (token: string) => void
  setNewPassword: (password: string) => void
  setConfirmPassword: (password: string) => void
  reset: () => void
}

interface RegisterStore {
  step: 1 | 2
  role: "customer" | "vendor" | "company" | null
  email: string
  otp: string
  formData: RegisterData
  setStep: (step: 1 | 2) => void
  setRole: (role: "customer" | "vendor" | "company") => void
  setEmail: (email: string) => void
  setOtp: (otp: string) => void
  setFormData: (data: Partial<RegisterData>) => void
  reset: () => void
}

export const useForgotPasswordStore = create<ForgotPasswordStore>((set) => ({
  step: 1,
  email: "",
  otp: "",
  token: "",
  newPassword: "",
  confirmPassword: "",
  setStep: (step) => set({ step }),
  setEmail: (email) => set({ email }),
  setOtp: (otp) => set({ otp }),
  setNewPassword: (newPassword) => set({ newPassword }),
  setConfirmPassword: (confirmPassword) => set({ confirmPassword }),
  setToken: (token: string) => set({ token }),
  reset: () =>
    set({
      step: 1,
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
      token: "",
    }),
}))

export const useRegisterStore = create<RegisterStore>((set) => ({
  step: 1,
  role: null,
  email: "",
  otp: "",
  formData: {
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    remember_me: false,
  },
  setStep: (step) => set({ step }),
  setRole: (role) => set({ role }),
  setEmail: (email) => set({ email }),
  setOtp: (otp) => set({ otp }),
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  reset: () =>
    set({
      step: 1,
      role: null,
      email: "",
      otp: "",
      formData: {
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        remember_me: false,
      },
    }),
}))
