"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForgotPasswordStore } from "@/lib/store";
import {
  sendOTPEmail,
  verifyEmailOTP,
  resetPassword,
  forget_sendOtp,
  forget_verifyEmailOTP,
} from "@/lib/auth.actions";
import { toast } from "react-toastify";
import { EmailOTPInput } from "@/components/auth/email-otp-input";
import { PasswordInput } from "@/components/auth/password-input";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const stepInfo = {
  1: { title: "Verify Email", desc: "We'll send you an OTP" },
  2: { title: "Confirm OTP", desc: "Check your email inbox" },
  3: { title: "New Password", desc: "Create a strong password" },
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const store = useForgotPasswordStore();
  const [loading, setLoading] = useState(false);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store.email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const response = await forget_sendOtp(store.email);
      if (response.success) {
        toast.success("OTP sent to your email");
        store.setStep(2);
      } else {
        const { errors } = response.data;
        // console.log(response.data);
        if (errors) {
          Object.entries(errors).forEach(([field, messages]) => {
            const errorMessage = Array.isArray(messages)
              ? messages[0]
              : messages;
            toast.error(errorMessage);
          });
        } else {
          toast.error(response.message);
        }
      }
    } catch (error: any) {
      console.log(error);
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store.otp || store.otp.length !== 6) {
      toast.error("Please enter a valid OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await forget_verifyEmailOTP(store.email, store.otp);
      if (response.success) {
        store.setToken(response.data.token);
        toast.success("OTP verified");
        store.setStep(3);
      } else {
        const { errors } = response.data;
        // console.log(response.data);
        if (errors) {
          Object.entries(errors).forEach(([field, messages]) => {
            const errorMessage = Array.isArray(messages)
              ? messages[0]
              : messages;
            toast.error(errorMessage);
          });
        } else {
          toast.error(response.message);
        }
      }
    } catch (error: any) {
      console.log(error);
      toast.error("Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!store.newPassword || !store.confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (store.newPassword !== store.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (store.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword(
        store.email,
        store.newPassword,
        store.token
      );
      if (response.success) {
        toast.success("Password reset successful!");
        store.reset();
        router.push(`/login?email=${store.email}`);
      } else {
        const { errors } = response.data;
        // console.log(response.data);
        if (errors) {
          Object.entries(errors).forEach(([field, messages]) => {
            const errorMessage = Array.isArray(messages)
              ? messages[0]
              : messages;
            toast.error(errorMessage);
          });
        } else {
          toast.error(response.message);
        }
      }
    } catch (error: any) {
      console.log(error);
      toast.error("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-container"
      style={{
        backgroundImage: "url('/assets/images/bg-header.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="auth-wrapper">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-card-content">
            <div className="flex justify-center mb-6">
              <Link href="/">
                <Image
                  src="/assets/images/color_logo.jpeg"
                  alt="E-Com logo"
                  width={260}
                  height={80}
                />
              </Link>
            </div>
            <motion.button
              onClick={() => {
                store.reset();
                router.push("/login");
              }}
              className="flex items-center gap-2 cursor-pointer text-primary hover:opacity-80 mb-6 transition"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              whileHover={{ x: -4 }}
            >
              <ArrowLeft size={18} />
              Back
            </motion.button>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="auth-header">Reset Password</h1>
              <p className="auth-subtext">
                Follow the steps to regain access to your account
              </p>
            </motion.div>

            <motion.div
              className="step-indicator-wrapper mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {[1, 2, 3].map((step) => (
                <motion.div
                  key={step}
                  className={`step-number ${
                    step > store.step ? "inactive" : ""
                  }`}
                  animate={{
                    scale: step === store.step ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {step}
                </motion.div>
              ))}
              <div className="step-info">
                <div className="step-badge">{store.step}/3</div>
                <div className="step-description">
                  {stepInfo[store.step as 1 | 2 | 3].title}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-center mb-6"
            >
              <p className="text-sm text-muted-foreground">
                <span className="text-primary font-semibold">
                  {stepInfo[store.step as 1 | 2 | 3].desc}
                </span>
              </p>
            </motion.div>

            {store.step === 1 && (
              <motion.form
                onSubmit={handleStep1Submit}
                className="space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    value={store.email}
                    onChange={(e) => store.setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="form-input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="auth-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </motion.form>
            )}

            {store.step === 2 && (
              <motion.form
                onSubmit={handleStep2Submit}
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div>
                  <label className="form-label text-center block mb-4">
                    Enter OTP sent to your email
                  </label>
                  <EmailOTPInput
                    value={store.otp}
                    onChange={(val) => store.setOtp(val)}
                    length={6}
                  />
                </div>
                <div className="flex justify-center gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="auth-button disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Verifying..." : "Verify"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      store.reset();
                      router.push("/forgot-password");
                    }}
                    className="auth-button-secondary"
                  >
                    Back
                  </button>
                </div>
              </motion.form>
            )}

            {store.step === 3 && (
              <motion.form
                onSubmit={handleStep3Submit}
                className="space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <PasswordInput
                  label="New Password"
                  value={store.newPassword}
                  onChange={(val) => store.setNewPassword(val)}
                  placeholder="Enter new password"
                />
                <PasswordInput
                  label="Confirm Password"
                  value={store.confirmPassword}
                  onChange={(val) => store.setConfirmPassword(val)}
                  placeholder="Confirm new password"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="auth-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </motion.form>
            )}

            <motion.p
              className="text-center text-sm text-muted-foreground mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Remember your password?{" "}
              <Link href="/login" className="auth-link font-medium">
                Sign in
              </Link>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
