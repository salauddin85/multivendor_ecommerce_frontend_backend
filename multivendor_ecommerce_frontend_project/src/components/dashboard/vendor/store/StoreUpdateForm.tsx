"use client";
import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";

interface StoreData {
  id?: number;
  store_name?: string;
  slug?: string;
  type?: string;
  address?: string;
  description?: string;
  logo?: string | null;
  banner?: string | null;
}

interface StoreUpdateFormProps {
  storeData?: StoreData | null;
}

export default function StoreUpdateForm({ storeData }: StoreUpdateFormProps) {
  const [formData, setFormData] = useState({
    store_name: "",
    slug: "",
    address: "",
    description: "",
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB
  const MAX_BANNER_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

  useEffect(() => {
    if (storeData) {
      setFormData({
        store_name: storeData.store_name || "",
        slug: storeData.slug || "",
        address: storeData.address || "",
        description: storeData.description || "",
      });

      if (storeData.logo) {
        setLogoPreview(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${storeData.logo}`
        );
      }
      if (storeData.banner) {
        setBannerPreview(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${storeData.banner}`
        );
      }
    }
  }, [storeData]);

  // Auto-generate slug from store name
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Auto-generate slug when store_name changes
    if (name === "store_name") {
      setFormData((prev) => ({
        ...prev,
        store_name: value,
        slug: generateSlug(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateImage = (
    file: File,
    maxSize: number,
    fieldName: string
  ): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${fieldName} must be a JPEG, PNG, or WebP image`;
    }

    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      return `${fieldName} must be less than ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImage(file, MAX_LOGO_SIZE, "Logo");
    if (error) {
      setErrors((prev) => ({ ...prev, logo: error }));
      e.target.value = "";
      return;
    }

    setErrors((prev) => ({ ...prev, logo: "" }));
    setLogoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImage(file, MAX_BANNER_SIZE, "Banner");
    if (error) {
      setErrors((prev) => ({ ...prev, banner: error }));
      e.target.value = "";
      return;
    }

    setErrors((prev) => ({ ...prev, banner: "" }));
    setBannerFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
    setErrors((prev) => ({ ...prev, logo: "" }));
  };

  const removeBanner = () => {
    setBannerPreview(null);
    setBannerFile(null);
    setErrors((prev) => ({ ...prev, banner: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.store_name.trim()) {
      newErrors.store_name = "Store name is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Store slug is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const submitData = new FormData();

      submitData.append("store_name", formData.store_name);
      submitData.append("slug", formData.slug);
      submitData.append("address", formData.address);
      submitData.append("description", formData.description);

      if (logoFile) submitData.append("logo", logoFile);
      if (bannerFile) submitData.append("banner", bannerFile);

  
      const response = await axiosInstance.patch(
        "/api/stores/v1/stores/me/",
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === "success") {
        alert("Store updated successfully!");
        window.location.href = "/dashboard/vendor/store";
      }

       else {
        const errorMessage =
          response.data.message || "Failed to update store. Please try again.";
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error updating store:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Update Store</h1>
          <p className="mt-2 text-gray-600">
            Manage your store information and branding
          </p>
        </div>

        <div className="space-y-6">
          {/* Banner Image Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Store Banner
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Recommended size: 1920x480px (Max: 5MB) • JPEG, PNG, or WebP
            </p>

            <div className="space-y-4">
              {bannerPreview ? (
                <div className="relative">
                  <img
                    src={bannerPreview}
                    alt="Banner Preview"
                    className="w-full h-48 sm:h-64 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeBanner}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 sm:h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-12 h-12 mb-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-600">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      JPEG, PNG, or WebP (Max 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleBannerChange}
                  />
                </label>
              )}
              {errors.banner && (
                <p className="text-sm text-red-600">{errors.banner}</p>
              )}
            </div>
          </div>

          {/* Logo Image Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Store Logo
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Recommended size: 400x400px (Max: 2MB) • JPEG, PNG, or WebP
            </p>

            <div className="space-y-4">
              {logoPreview ? (
                <div className="relative inline-block">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-32 h-32 sm:w-40 sm:h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <p className="mt-2 text-xs text-gray-500 text-center px-2">
                      Upload Logo
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleLogoChange}
                  />
                </label>
              )}
              {errors.logo && (
                <p className="text-sm text-red-600">{errors.logo}</p>
              )}
            </div>
          </div>

          {/* Store Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Store Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Store Name */}
              <div>
                <label
                  htmlFor="store_name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Store Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="store_name"
                  name="store_name"
                  value={formData.store_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all ${
                    errors.store_name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter store name"
                />
                {errors.store_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.store_name}
                  </p>
                )}
              </div>

              {/* Store Slug - Auto Generated */}
              <div>
                <label
                  htmlFor="slug"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Store Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all bg-gray-50 ${
                    errors.slug ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="auto-generated-slug"
                  readOnly
                />
                <p className="mt-1 text-xs text-gray-500">
                  Auto-generated from store name
                </p>
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  placeholder="Enter store address"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all resize-none"
                placeholder="Tell customers about your store..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end bg-white rounded-lg shadow-sm p-6">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-orange-400 hover:bg-orange-500 text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Updating...
                </span>
              ) : (
                "Update Store"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
