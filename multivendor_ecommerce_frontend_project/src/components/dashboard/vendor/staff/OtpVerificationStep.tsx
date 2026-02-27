"use client";
import React, { useState, useRef, useEffect } from "react";
import { ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStaffOnboardingStore } from "@/store/staffOnboardingStore";
import { staffOnboardingApi } from "@/app/api/staffOnboardingApi";

export const OtpVerificationStep: React.FC = () => {
  const router = useRouter();
  const {
    email,
    setOtp,
    setIsLoading,
    setError,
    nextStep,
    previousStep,
    isLoading,
    error,
  } = useStaffOnboardingStore();

  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value.slice(-1);
    setOtpValues(newOtpValues);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const digits = pastedData.match(/\d/g) || [];

    const newOtpValues = [...otpValues];
    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtpValues[index] = digit;
      }
    });
    setOtpValues(newOtpValues);

    const lastIndex = Math.min(digits.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpCode = otpValues.join("");

    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await staffOnboardingApi.verifyOtp({
        email,
        otp: otpCode,
      });
      // console.log("OTP verified successfully:", result);
      setOtp(otpCode);
      nextStep();
      router.push("/dashboard/vendor/staff/add?step=3");
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      setError(err.message || "Invalid verification code");
      setOtpValues(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await staffOnboardingApi.sendOtp({ email });
      setOtpValues(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    previousStep();
    router.push("/dashboard/vendor/staff/add?step=1");
  };

  return (
    <div className="space-y-6">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        disabled={isLoading}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8 text-orange-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Verify Your Email
        </h3>
        <p className="text-sm text-gray-600">Enter the 6-digit code sent to</p>
        <p className="text-sm font-medium text-gray-900 mt-1">{email}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2">
          {otpValues.map((value, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={value}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-14 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              disabled={isLoading}
            />
          ))}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || otpValues.some((v) => !v)}
          className="w-full py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify Code"
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isLoading}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors disabled:opacity-50"
          >
            Didn't receive code? Resend
          </button>
        </div>
      </form>
    </div>
  );
};
