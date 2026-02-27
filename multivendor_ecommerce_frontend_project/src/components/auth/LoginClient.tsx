"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { loginUser } from "@/lib/auth.actions";
import { toast } from "react-toastify";
import Link from "next/link";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Eye, EyeOff, Home } from "lucide-react";

const loginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  rememberMe: Yup.boolean(),
});

function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);

  // Extract values using the .get() method
  const emailParam = searchParams.get("email") ?? "";

  const handleSubmit = async (values: any, { setFieldError }: any) => {
    setLoading(true);
    try {
      const response = await loginUser(
        values.email,
        values.password,
        values.rememberMe
      );

      if (response.success) {
        toast.success("Login successful! Redirecting...");
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        const { errors } = response.data;
        // console.log(response.data);
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="auth-header">Welcome Back</h1>
              <p className="auth-subtext">
                Sign in to your account to continue shopping
              </p>
            </motion.div>

            <Formik
              initialValues={{
                email: emailParam || "",
                password: "",
                rememberMe: false,
              }}
              validationSchema={loginSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, values, setFieldValue }) => (
                <Form className="space-y-4">
                  <motion.div
                    className="form-group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
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
                    transition={{ delay: 0.4, duration: 0.5 }}
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
                    transition={{ delay: 0.5, duration: 0.5 }}
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
                    <Link href="/forgot-password" className="auth-link">
                      Forgot password?
                    </Link>
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="auth-button disabled:opacity-50 disabled:cursor-not-allowed"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
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
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              Don&apos;t have an account?{" "}
              <Link href="/register" className="auth-link font-medium">
                Sign up
              </Link>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default LoginPage;
