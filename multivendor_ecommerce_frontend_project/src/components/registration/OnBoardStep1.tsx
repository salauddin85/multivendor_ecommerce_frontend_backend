"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { AxiosError } from "axios";
import axiosInstance from "@/lib/axios";
import { toast } from "react-toastify";
import { useRegUserStore } from "@/store/register_store";
import { useRouter } from "next/navigation";

// ---------------- Form Type ----------------
interface EmailFormInputs {
  email: string;
}

// ---------------- Backend Error Type ----------------
interface BackendErrorResponse {
  message?: string;
  errors?: {
    [key: string]: string[];
  };
}

// ---------------- Validation Schema ----------------
const validationSchema: Yup.ObjectSchema<EmailFormInputs> = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

const EmailForm: React.FC = () => {
  const setEmail = useRegUserStore((state: any) => state.setEmail);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const {
    handleSubmit,
    setError,
    formState: { errors },
    reset,
    register,
  } = useForm<EmailFormInputs>({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<EmailFormInputs> = async (data) => {
    try {
      setLoading(true);
      setEmail(data.email);

      const response = await axiosInstance.post(
        "/api/authorization/v1/onboarding/employee/",
        data
      );

      if (response.data?.status === "success") {
        toast.success(response.data.message || "OTP sent successfully!");
        router.push("/dashboard/admin/registration/otp/");
        reset();
      } else {
        toast.error("Something went wrong!");
      }
    } catch (error) {
      const err = error as AxiosError<BackendErrorResponse>;

      if (err.response?.data?.errors) {
        const backendErrors = err.response.data.errors;

        Object.keys(backendErrors).forEach((field) => {
          setError(field as keyof EmailFormInputs, {
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded border-t-4 border-orange-500">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 w-full max-w-md mx-auto"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-600 text-sm mt-1">Please enter employee email to continue</p>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            {...register("email")}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="example@mail.com"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.email.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition duration-200 ease-in-out transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending OTP...
            </span>
          ) : (
            "Send OTP"
          )}
        </button>
      </form>
    </div>
  );
};

export default EmailForm;