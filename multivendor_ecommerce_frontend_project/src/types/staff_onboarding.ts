export interface StaffOnboardingState {
  currentStep: number;
  email: string;
  otp: string;
  formData: RegistrationFormData;
  isLoading: boolean;
  error: string | null;
}

export interface RegistrationFormData {
  password: string;
  first_name: string;
  last_name: string;
  nid_card_image: File | null;
  phone_number: string;
}

export interface EmailStepData {
  email: string;
}

export interface OtpVerificationData {
  email: string;
  otp: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  nid_card_image: File;
}

export interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
  detail?: string;
}