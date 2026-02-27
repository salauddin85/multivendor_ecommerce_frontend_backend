"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tag, Percent, DollarSign, Hash, Clock, CalendarCheck, Loader2 } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type CouponFormData = {
  code: string;
  type: "percentage" | "fixed";
  value: string;
  min_order_amount: string;
  usage_limit: string;
  valid_from: string;
  valid_to: string;
};

// ─── Field Wrapper ─────────────────────────────────────────────────────────────

function FormField({
  label,
  icon,
  error,
  required,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
        <span className="text-orange-500">{icon}</span>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-red-500 font-medium mt-0.5 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-500 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CouponAddForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CouponFormData>({
    defaultValues: {
      code: "",
      type: "percentage",
      value: "",
      min_order_amount: "0.00",
      usage_limit: "",
      valid_from: "",
      valid_to: "",
    },
  });

  const selectedType = watch("type");

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (data: CouponFormData) => {
    setLoading(true);
    try {
      const payload: Record<string, any> = {
        code: data.code.trim(),
        type: data.type,
        value: data.value,
        min_order_amount: data.min_order_amount || "0.00",
        valid_from: data.valid_from,
        valid_to: data.valid_to,
      };
      if (data.usage_limit) payload.usage_limit = Number(data.usage_limit);

      await axiosInstance.post("/api/coupons/v1/coupons/", payload);
      toast.success("Coupon created successfully!");
      reset();
      router.push("/dashboard/admin/coupons");
    } catch (error: any) {
      const serverErrors = error?.response?.data?.errors;
      if (serverErrors && typeof serverErrors === "object") {
        // Show each field error as individual toast
        Object.entries(serverErrors).forEach(([field, messages]) => {
          const msg = Array.isArray(messages) ? messages.join(", ") : String(messages);
          toast.error(`${field}: ${msg}`);
        });
      } else {
        toast.error(error?.response?.data?.message ?? "Failed to create coupon. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* ── Header ── */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create Coupon</h1>
          <p className="text-sm text-gray-500 mt-2">Add a new discount coupon to the system</p>
        </div>

        {/* ── Form Card ── */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Tag className="w-4 h-4 text-orange-500" />
            <span className="font-semibold text-gray-800 text-sm">Coupon Details</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-5">
            {/* Row 1: Code + Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Code */}
              <FormField
                label="Coupon Code"
                icon={<Tag className="w-3.5 h-3.5" />}
                error={errors.code?.message}
                required
              >
                <Input
                  {...register("code", {
                    required: "Coupon code is required",
                    maxLength: { value: 50, message: "Max 50 characters" },
                  })}
                  placeholder="e.g. NEWYEAR26"
                  className={`rounded-xl border-gray-200 font-mono uppercase focus-visible:ring-orange-400 ${
                    errors.code ? "border-red-300 focus-visible:ring-red-400" : ""
                  }`}
                />
              </FormField>

              {/* Type */}
              <FormField
                label="Discount Type"
                icon={<Percent className="w-3.5 h-3.5" />}
                error={errors.type?.message}
                required
              >
                <Select
                  value={selectedType}
                  onValueChange={(val) =>
                    setValue("type", val as "percentage" | "fixed", { shouldValidate: true })
                  }
                >
                  <SelectTrigger
                    className={`rounded-xl border-gray-200 focus:ring-orange-400 ${
                      errors.type ? "border-red-300" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="percentage">
                      <span className="flex items-center gap-2">
                        <Percent className="w-3.5 h-3.5 text-blue-500" />
                        Percentage (%)
                      </span>
                    </SelectItem>
                    <SelectItem value="fixed">
                      <span className="flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5 text-purple-500" />
                        Fixed Amount (৳)
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <input
                  type="hidden"
                  {...register("type", { required: "Type is required" })}
                />
              </FormField>
            </div>

            {/* Row 2: Value + Min Order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Value */}
              <FormField
                label={selectedType === "percentage" ? "Discount Value (%)" : "Discount Value (৳)"}
                icon={
                  selectedType === "percentage" ? (
                    <Percent className="w-3.5 h-3.5" />
                  ) : (
                    <DollarSign className="w-3.5 h-3.5" />
                  )
                }
                error={errors.value?.message}
                required
              >
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                    {selectedType === "percentage" ? "%" : "৳"}
                  </span>
                  <Input
                    {...register("value", {
                      required: "Discount value is required",
                      pattern: {
                        value: /^\d+(\.\d{1,2})?$/,
                        message: "Enter a valid number (e.g. 10.00)",
                      },
                      validate: (val) => {
                        if (selectedType === "percentage") {
                          const n = parseFloat(val);
                          if (n < 0 || n > 100) return "Percentage must be between 0 and 100";
                        }
                        return true;
                      },
                    })}
                    placeholder={selectedType === "percentage" ? "5.00" : "50.00"}
                    className={`pl-8 rounded-xl border-gray-200 focus-visible:ring-orange-400 ${
                      errors.value ? "border-red-300 focus-visible:ring-red-400" : ""
                    }`}
                  />
                </div>
              </FormField>

              {/* Min Order Amount */}
              <FormField
                label="Minimum Order Amount (৳)"
                icon={<DollarSign className="w-3.5 h-3.5" />}
                error={errors.min_order_amount?.message}
              >
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                    ৳
                  </span>
                  <Input
                    {...register("min_order_amount", {
                      pattern: {
                        value: /^\d+(\.\d{1,2})?$/,
                        message: "Enter a valid amount",
                      },
                    })}
                    placeholder="0.00"
                    className={`pl-8 rounded-xl border-gray-200 focus-visible:ring-orange-400 ${
                      errors.min_order_amount ? "border-red-300 focus-visible:ring-red-400" : ""
                    }`}
                  />
                </div>
              </FormField>
            </div>

            {/* Row 3: Usage Limit */}
            <FormField
              label="Usage Limit"
              icon={<Hash className="w-3.5 h-3.5" />}
              error={errors.usage_limit?.message}
            >
              <Input
                {...register("usage_limit", {
                  pattern: {
                    value: /^\d+$/,
                    message: "Must be a whole number",
                  },
                })}
                placeholder="Leave empty for unlimited"
                type="number"
                min={1}
                className={`rounded-xl border-gray-200 focus-visible:ring-orange-400 ${
                  errors.usage_limit ? "border-red-300 focus-visible:ring-red-400" : ""
                }`}
              />
              <p className="text-xs text-gray-400 mt-1">Leave blank for unlimited usage</p>
            </FormField>

            {/* Row 4: Valid From + Valid To */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Valid From */}
              <FormField
                label="Valid From"
                icon={<Clock className="w-3.5 h-3.5" />}
                error={errors.valid_from?.message}
                required
              >
                <Input
                  {...register("valid_from", {
                    required: "Valid from date is required",
                  })}
                  type="datetime-local"
                  className={`rounded-xl border-gray-200 focus-visible:ring-orange-400 cursor-pointer ${
                    errors.valid_from ? "border-red-300 focus-visible:ring-red-400" : ""
                  }`}
                />
              </FormField>

              {/* Valid To */}
              <FormField
                label="Valid To"
                icon={<CalendarCheck className="w-3.5 h-3.5" />}
                error={errors.valid_to?.message}
                required
              >
                <Input
                  {...register("valid_to", {
                    required: "Valid to date is required",
                    validate: (val) => {
                      const from = watch("valid_from");
                      if (from && val && new Date(val) <= new Date(from)) {
                        return "Valid To must be later than Valid From";
                      }
                      return true;
                    },
                  })}
                  type="datetime-local"
                  className={`rounded-xl border-gray-200 focus-visible:ring-orange-400 cursor-pointer ${
                    errors.valid_to ? "border-red-300 focus-visible:ring-red-400" : ""
                  }`}
                />
              </FormField>
            </div>

            {/* ── Actions ── */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                className="rounded-xl border-gray-200 text-white bg-orange-500 font-semibold px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl px-6 transition-all duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Tag className="w-4 h-4" />
                    Create Coupon
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}