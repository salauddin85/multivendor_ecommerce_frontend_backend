"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { loginUser } from "@/lib/auth.actions";
import { toast } from "react-toastify";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, EyeOff, Eye } from "lucide-react";
import { EmailOTPInput } from "@/components/auth/email-otp-input";
import { PasswordInput } from "@/components/auth/password-input";
import {
  forget_sendOtp,
  forget_verifyEmailOTP,
  resetPassword,
} from "@/lib/auth.actions";
import { useForgotPasswordStore } from "@/lib/store";
import Link from "next/link";
import Image from "next/image";

const loginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  rememberMe: Yup.boolean(),
});

const stepInfo = {
  1: { title: "Verify Email", desc: "We'll send you an OTP" },
  2: { title: "Confirm OTP", desc: "Check your email inbox" },
  3: { title: "New Password", desc: "Create a strong password" },
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"login" | "forgot">("login");
  const store = useForgotPasswordStore();
  const [showPassword, setShowPassword] = useState(false);
  const handleLoginSubmit = async (values: any, { setFieldError }: any) => {
    setLoading(true);
    try {
      const response = await loginUser(
        values.email,
        values.password,
        values.rememberMe,
      );

      if (response.success) {
        toast.success("Login successful!");
        onClose();
        window.location.reload();
      } else {
        const { errors } = response.data;
        if (errors) {
          Object.entries(errors).forEach(([field, messages]) => {
            const errorMessage = Array.isArray(messages)
              ? messages[0]
              : messages;
            setFieldError(field, errorMessage as string);
          });
        }
        toast.error(response.message);
      }
    } catch (error: any) {
      console.error(error);
      toast.error("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

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
        store.token,
      );
      if (response.success) {
        toast.success("Password reset successful!");
        store.reset();
        setView("login");
        store.setStep(1);
      } else {
        const { errors } = response.data;
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
      toast.error("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setView("login");
      store.reset();
      store.setStep(1);
    }, 300);
  };

  const handleBackToLogin = () => {
    setView("login");
    store.reset();
    store.setStep(1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 "
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="auth-card max-h-[90vh] overflow-y-auto pointer-events-auto relative"
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition z-10"
              >
                <X size={24} />
              </button>

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
                {view === "login" ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                    >
                      <h1 className="auth-header">Welcome Back</h1>
                      <p className="auth-subtext">
                        Sign in to your account to continue shopping
                      </p>
                    </motion.div>

                    <Formik
                      initialValues={{
                        email: "",
                        password: "",
                        rememberMe: false,
                      }}
                      validationSchema={loginSchema}
                      onSubmit={handleLoginSubmit}
                    >
                      {({ errors, touched, values, setFieldValue }) => (
                        <Form className="space-y-4">
                          <motion.div
                            className="form-group"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                          >
                            <label className="form-label">Email Address</label>
                            <Field
                              name="email"
                              type="email"
                              placeholder="your@email.com"
                              className={`form-input ${
                                errors.email && touched.email
                                  ? "border-destructive"
                                  : ""
                              }`}
                            />
                            {errors.email && touched.email && (
                              <p className="form-error">{errors.email}</p>
                            )}
                          </motion.div>

                          <motion.div
                            className="form-group"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                          >
                            <label className="form-label">Password</label>
                            <div className="relative">
                              <Field
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className={`form-input pr-10 ${
                                  errors.password && touched.password
                                    ? "border-destructive"
                                    : ""
                                }`}
                              />

                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                              >
                                {showPassword ? (
                                  <EyeOff size={18} />
                                ) : (
                                  <Eye size={18} />
                                )}
                              </button>
                            </div>
                            {errors.password && touched.password && (
                              <p className="form-error">{errors.password}</p>
                            )}
                          </motion.div>

                          <motion.div
                            className="flex items-center justify-between"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id="remember"
                                checked={values.rememberMe}
                                onCheckedChange={(checked) =>
                                  setFieldValue("rememberMe", checked)
                                }
                              />
                              <label
                                htmlFor="remember"
                                className="text-sm cursor-pointer text-foreground"
                              >
                                Remember me
                              </label>
                            </div>
                            <button
                              type="button"
                              onClick={() => setView("forgot")}
                              className="auth-link"
                            >
                              Forgot password?
                            </button>
                          </motion.div>

                          <motion.button
                            type="submit"
                            disabled={loading}
                            className="auth-button disabled:opacity-50 disabled:cursor-not-allowed"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {loading ? "Signing in..." : "Sign In"}
                          </motion.button>
                        </Form>
                      )}
                    </Formik>

                    <motion.p
                      className="text-center text-sm text-muted-foreground mt-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      Don&apos;t have an account?{" "}
                      <a href="/register" className="auth-link font-medium">
                        Sign up
                      </a>
                    </motion.p>
                  </>
                ) : (
                  <>
                    <motion.button
                      onClick={handleBackToLogin}
                      className="flex items-center gap-2 text-primary hover:opacity-80 mb-6 transition"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      whileHover={{ x: -4 }}
                    >
                      <ArrowLeft size={18} />
                      Back to Login
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
                        <div>
                          <button
                            type="submit"
                            disabled={loading}
                            className="auth-button disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? "Verifying..." : "Verify OTP"}
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
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
