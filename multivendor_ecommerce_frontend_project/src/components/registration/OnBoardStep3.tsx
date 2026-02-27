"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Eye, EyeOff, UserCog, PartyPopper, UserPlus, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useRegUserStore } from "@/store/register_store";

// ---------------- Form Type ----------------
interface RegistrationFormInputs {
  first_name?: string;
  last_name?: string;
  email: string;
  password: string;
}

// ---------------- Backend Error Type ----------------
interface BackendErrorResponse {
  message?: string;
  errors?: {
    [key: string]: string[] | string;
  };
}

// ---------------- Validation Schema ----------------
const validationSchema: Yup.ObjectSchema<RegistrationFormInputs> =
  Yup.object().shape({
    first_name: Yup.string().optional(),
    last_name: Yup.string().optional(),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(
        6,
        "Password must be at least 6 characters with contains 1 uppercase, 1 lowercase, and 1 number"
      )
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/\d/, "Password must contain at least one number")
      .required("Password is required"),
  });

const OnboardingStep3: React.FC = () => {
  const { email, isOtpPass } = useRegUserStore();
  const router = useRouter();

  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  useEffect(() => {
    if (!isOtpPass) {
      router.replace("/dashboard/admin/registration/otp");
    }
  }, [isOtpPass, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegistrationFormInputs>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: email || "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<RegistrationFormInputs> = async (data) => {
    try {
      const submissionData = { ...data };
      
      if (!submissionData.first_name || submissionData.first_name.trim() === "") {
        delete submissionData.first_name;
      }
      
      if (!submissionData.last_name || submissionData.last_name.trim() === "") {
        delete submissionData.last_name;
      }

      console.log("Submitting data:", submissionData);

      const res = await axiosInstance.post(
        "/api/authorization/v1/onboarding/employee/register/",
        submissionData
      );

      if (res.data?.status === "success") {
        toast.success(res.data.message || "Registration successful!");
        reset();
        setIsSuccess(true);
        setRegisteredEmail(res.data.email || data.email);
      }
    } catch (error) {
      const err = error as AxiosError<BackendErrorResponse>;
      const message = err.response?.data?.message;
      const backendErrors = err.response?.data?.errors;

      if (backendErrors) {
        Object.entries(backendErrors).forEach(([key, val]) => {
          const errorMessage = Array.isArray(val) ? val[0] : val;
          toast.error(`${key}: ${errorMessage}`);
        });
      } else {
        toast.error(message || "Something went wrong");
      }
    }
  };

  const handleBack = () => {
    reset();
    router.push("/dashboard/admin/registration/otp");
  };

  // ---------------- Success View ----------------
  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-orange-50 to-white">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-lg border-t-4 border-orange-500 p-8 text-center transform transition-all hover:shadow-xl">
          <div className="relative flex justify-center mb-6">
            <div className="absolute inset-0 bg-orange-200 rounded-full blur-md opacity-50"></div>
            <div className="relative w-28 h-28 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg">
              <PartyPopper className="w-14 h-14 text-white" />
            </div>
          </div>
          
          <div className="space-y-2 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Successfully Registered!</h1>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-orange-500" />
              <span>Employee added with</span>
            </div>
            <p className="text-sm px-4 py-2 text-orange-700 font-medium border rounded-lg bg-orange-50 border-orange-200 shadow-sm">
              {registeredEmail}
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard/admin/registration/email")}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition flex items-center justify-center gap-2 shadow-md font-medium"
          >
            <UserPlus className="w-4 h-4" /> Add Another Employee
          </button>
        </div>
      </div>
    );
  }

  // ---------------- Registration Form ----------------
  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-orange-50 to-white">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg border-t-4 border-orange-500 p-8 transform transition-all hover:shadow-xl">
        <div className="flex flex-col items-center space-y-4 mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-200 rounded-full blur-md opacity-50"></div>
            <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg">
              <UserCog className="w-12 h-12 text-white" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-gray-800">Complete Registration</h1>
            <p className="text-sm text-gray-600">Fill in the details for</p>
          </div>
          <p className="text-sm px-4 py-2 text-orange-700 font-medium border rounded-lg bg-orange-50 border-orange-200 shadow-sm">
            {email}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                {...register("first_name")}
                className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition"
                placeholder="John"
              />
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                {...register("last_name")}
                className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              {...register("email")}
              className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-4 transition ${
                errors.email 
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                  : "border-gray-200 focus:border-orange-500 focus:ring-orange-200"
              }`}
              placeholder="Enter email"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={`w-full border rounded-lg p-3 pr-12 focus:outline-none focus:ring-4 transition ${
                  errors.password 
                    ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                    : "border-gray-200 focus:border-orange-500 focus:ring-orange-200"
                }`}
                placeholder="Create a strong password"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-orange-500 transition"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 flex items-start gap-1">
                <svg className="w-3 h-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{errors.password.message}</span>
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
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
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md font-medium"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </>
              ) : (
                <>
                  Register
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingStep3;