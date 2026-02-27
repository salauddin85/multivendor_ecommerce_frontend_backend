"use client";

import React, { useState, useRef, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";
import { useRegUserStore } from "@/store/register_store";
import { MailCheck, ArrowLeft, ArrowRight } from "lucide-react";

// ---------------- Form Type ----------------
interface OtpFormInputs {
  otp: string;
}

// ---------------- Backend Error Type ----------------
interface BackendErrorResponse {
  message?: string;
  errors?: {
    [key: string]: string[];
  };
}

// ---------------- Validation Schema ----------------
const validationSchema: Yup.ObjectSchema<OtpFormInputs> = Yup.object().shape({
  otp: Yup.string()
    .matches(/^\d{4}$/, "OTP must be 4 digits")
    .required("OTP is required"),
});

const OnboardingStep2: React.FC = () => {
  const { email, setOtpPass } = useRegUserStore();
  const router = useRouter();

  const [otp, setOtp] = useState<string[]>(Array(4).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<OtpFormInputs>({
    resolver: yupResolver(validationSchema),
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    if (!email) {
      router.replace("/dashboard/admin/registration/email");
    }
  }, [email, router]);

  const onSubmit: SubmitHandler<OtpFormInputs> = async (data) => {
    const otpValue = data.otp.replace(/\D/g, "");

    if (otpValue.length !== 4) {
      toast.error("Please enter a valid 4-digit OTP.");
      return;
    }

    try {
      const response = await axiosInstance.post(
        "/api/authorization/v1/onboarding/employee/verify/",
        { email, otp: parseInt(otpValue, 10) }
      );

      if (response.data?.status === "success") {
        setOtpPass(true);
        toast.success(response.data.message || "OTP verified successfully.");
        router.push("/dashboard/admin/registration/add");
      } else {
        toast.error(response.data.message || "OTP verification failed.");
      }
    } catch (error) {
      const err = error as AxiosError<BackendErrorResponse>;

      if (err.response?.data?.errors) {
        const backendErrors = err.response.data.errors;

        Object.keys(backendErrors).forEach((field) => {
          setError(field as keyof OtpFormInputs, {
            type: "server",
            message: backendErrors[field][0],
          });

          toast.error(`${field}: ${backendErrors[field][0]}`);
        });
      } else {
        toast.error(
          err.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      }
    }
  };

  // ---------------- OTP Input Handlers ----------------
  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { value } = e.target;

    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setValue("otp", newOtp.join(""));

      if (value && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleBack = () => {
    setOtp(Array(4).fill(""));
    router.push("/dashboard/registration/email");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-white sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border-t-4 border-orange-500 transform transition-all hover:shadow-xl">
        <div className="flex flex-col items-center space-y-4 mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-200 rounded-full blur-md opacity-50"></div>
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg">
              <MailCheck className="w-12 h-12 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-800">
              Verification Code
            </h2>
            <p className="text-sm text-gray-600">
              We've sent a 4-digit code to
            </p>
          </div>
          <p className="text-sm px-4 py-2 text-orange-700 font-medium border rounded-lg bg-orange-50 border-orange-200 shadow-sm">
            {email}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  className={`w-14 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                    errors.otp 
                      ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                      : "border-gray-200 focus:border-orange-500 focus:ring-orange-200"
                  }`}
                />
              ))}
            </div>

            {errors.otp && (
              <p className="text-red-500 text-xs text-center flex items-center justify-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.otp.message}
              </p>
            )}

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline transition"
              >
                Resend Code
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 py-3 px-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 text-gray-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition flex items-center justify-center gap-2 shadow-md font-medium"
            >
              Verify
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingStep2;