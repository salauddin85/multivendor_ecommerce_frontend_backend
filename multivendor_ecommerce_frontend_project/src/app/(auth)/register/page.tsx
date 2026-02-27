"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useRegisterStore } from "@/lib/store"
import { sendOTPEmail, verifyEmailOTP } from "@/lib/auth.actions"
import { toast } from "react-toastify"
import { EmailOTPInput } from "@/components/auth/email-otp-input"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

export default function RegisterPage() {
  const router = useRouter()
  const store = useRegisterStore()
  const [loading, setLoading] = useState(false)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store.email) {
      toast.error("Please enter your email")
      return
    }

    setLoading(true)
    try {
      const response = await sendOTPEmail(store.email)
      // console.log(response);
      if (response.success) {
        toast.success("OTP sent to your email")
        store.setStep(2)
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
    } catch (error) {
      toast.error("Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!store.otp || store.otp.length !== 6) {
      toast.error("Please enter a valid OTP")
      return
    }

    setLoading(true)
    try {
      const response = await verifyEmailOTP(store.email, store.otp)
      if (response.success) {
        toast.success("Email verified!")
        router.push("/register/customer/")
      } else {
        const { errors } = response.data;
        console.log(response.data);
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
    } catch (error) {
      console.log(error);
      toast.error("Failed to verify OTP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container" style={{ backgroundImage: "url('/assets/images/bg-header.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="auth-header">Create Account</h1>
              <p className="auth-subtext">
                Join our community as a customer, vendor, or company
              </p>
            </motion.div>

            <motion.div
              className="step-indicator-wrapper mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {[1, 2].map((step) => (
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
                <div className="step-badge">{store.step}/2</div>
                <div className="step-description">
                  {store.step === 1 ? "Email Verification" : "Confirm Code"}
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
                {store.step === 1 ? (
                  <span className="text-primary font-semibold">
                    Enter your email to get started
                  </span>
                ) : (
                  <span className="text-primary font-semibold">
                    We sent a code to your email
                  </span>
                )}
              </p>
            </motion.div>

            {store.step === 1 && (
              <motion.form
                onSubmit={handleEmailSubmit}
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
                <div className="flex justify-center gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="auth-button disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      store.reset();
                      router.push("/");
                    }}
                    className="auth-button-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}

            {store.step === 2 && (
              <motion.form
                onSubmit={handleOTPSubmit}
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div>
                  <label className="form-label text-center block mb-4">
                    Enter OTP sent to {store.email}
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
                      router.push("/register");
                    }}
                    className="auth-button-secondary"
                  >
                    Back
                  </button>
                </div>
              </motion.form>
            )}

            <motion.p
              className="text-center text-sm text-muted-foreground mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Already have an account?{" "}
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
