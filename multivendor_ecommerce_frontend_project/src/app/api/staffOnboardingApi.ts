import axios from "@/lib/axios";
import {
  EmailStepData,
  OtpVerificationData,
  RegistrationData,
  ApiErrorResponse,
} from "@/types/staff_onboarding";

export interface VerifyOtpError {
  otp?: string;
  email?: string;
  message?: string;
}

export const staffOnboardingApi = {
  // Step 1: Send OTP to email
  sendOtp: async (data: EmailStepData) => {
    try {
      const response = await axios.post(
        "/api/authorization/v1/onboarding/staff/",
        data
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorData: ApiErrorResponse = error.response?.data;
      // show filed error message
      if (errorData?.errors) {
        const firstError = Object.values(errorData.errors)[0];
        const errorMessage = Array.isArray(firstError)
          ? firstError[0]
          : String(firstError);
        throw new Error(errorMessage);
      }

      // Handle different error formats from backend
      let errorMessage = "Failed to send OTP. Please try again.";

      if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.errors) {
        // Handle validation errors object
        const firstError = Object.values(errorData.errors)[0];
        errorMessage = Array.isArray(firstError)
          ? firstError[0]
          : String(firstError);
      } else if (errorData?.detail) {
        errorMessage = errorData.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  },

  // Step 2: Verify OTP
  verifyOtp: async (data: OtpVerificationData) => {
    try {
      const response = await axios.post(
        "/api/authorization/v1/onboarding/staff/verify/",
        data
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (err: any) {
      const errorData = err?.response?.data;
      console.log("error data",errorData)

      const fieldErrors: VerifyOtpError = {};
      // console.log("field errors",fieldErrors)

      // backend field-wise errors
      if (errorData?.errors) {
        if (errorData.errors.otp) {
          fieldErrors.otp = errorData.errors.otp[0];
        }

        if (errorData.errors.email) {
          fieldErrors.email = errorData.errors.email[0];
        }
      }

      // fallback message
      if (!fieldErrors.otp && !fieldErrors.email) {
        fieldErrors.message =
          errorData?.message || errorData?.detail || "OTP verification failed";
      }

      throw new Error(fieldErrors.message);
    }
  },

  // Step 3: Register staff member
  registerStaff: async (data: RegistrationData) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("first_name", data.first_name);
      formData.append("last_name", data.last_name);
      formData.append("phone_number", data.phone_number);
      formData.append("nid_card_image", data.nid_card_image);

      const response = await axios.post(
        "/api/authorization/v1/onboarding/staff/register/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      const errorData: ApiErrorResponse = error.response?.data;

      let errorMessage = "Failed to register staff. Please try again.";

      if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.errors) {
        // For registration, we might want to show all errors
        const errors = errorData.errors;
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => {
            const msgArray = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${msgArray.join(", ")}`;
          })
          .join("; ");
        errorMessage = errorMessages || errorMessage;
      } else if (errorData?.detail) {
        errorMessage = errorData.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  },
};
