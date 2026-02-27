"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Upload, X, Plus, Loader2 } from "lucide-react";
import axiosInstance from "@/lib/axios";
import TiptapEditor from "@/components/editor/TiptapEditor";
import { toast } from "sonner";
import type { Brand, Category } from "@/types/catalog";

// ─── Types ─────────────────────────────────────────────────────────────────────

// Add STATUS type
type ProductStatus = "draft" | "pending" | "published" | "rejected";

interface GalleryImage {
  image: string;
  file?: File;
  preview: string;
  isExisting: boolean;
}

interface ProductData {
  id: number;
  title: string;
  slug: string;
  main_image: string | null;
  base_price: string;
  stock: number;
  category: number;
  brand: number | null;
  type: "simple" | "variable";
  description: string;
  specification: string;
  discount_amount: string | null;
  is_featured: boolean;
  gallery_images: { image: string }[];
  status?: ProductStatus; // Add status field
}

interface FormValues {
  title: string;
  category: string;
  brand: string;
  type: "simple" | "variable";
  base_price: string;
  discount_amount: string;
  stock: string;
  is_featured: boolean;
  status: ProductStatus; // Add status to form values
}

interface ProductEditFormProps {
  product: ProductData | null;
  brands: Brand[];
  categories: Category[];
}

// ─── Constants ─────────────────────────────────────────────────────────────────

// Status options with colors for better UX
const STATUS_OPTIONS = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" },
  { value: "pending", label: "Pending Approval", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500" },
  { value: "published", label: "Published", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500" },
] as const;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function flattenCategories(cats: Category[]): Category[] {
  return cats.reduce((acc: Category[], cat) => {
    acc.push(cat);
    if (cat.children?.length) acc.push(...flattenCategories(cat.children));
    return acc;
  }, []);
}

function getCategoryDepth(
  cats: Category[],
  targetId: string,
  depth = 0,
): number {
  for (const cat of cats) {
    if (cat.id.toString() === targetId) return depth;
    if (cat.children?.length) {
      const d = getCategoryDepth(cat.children, targetId, depth + 1);
      if (d !== -1) return d;
    }
  }
  return -1;
}

// ✅ Fix 1: Proper image URL builder
// Requires NEXT_PUBLIC_BACKEND_URL in .env.local e.g: http://127.0.0.1:8000
const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");
function getImageUrl(path: string | null | undefined): string {
  if (!path) return "";

  // If it's already a full URL, return as is
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // Clean the path - ensure it starts with /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // Construct full URL to backend
  return `${BACKEND_URL}${cleanPath}`;
}

//  Fix 2: Slug generator
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ProductEditForm({
  product,
  brands,
  categories,
}: ProductEditFormProps) {
  const router = useRouter();
  const allCategories = flattenCategories(categories);

  const [description, setDescription] = useState(product?.description ?? "");
  const [specification, setSpecification] = useState(
    product?.specification ?? "",
  );
  const [descError, setDescError] = useState("");

  //  Live slug preview state
  const [slugPreview, setSlugPreview] = useState(product?.slug ?? "");

  //  Main image: initialize with full backend URL
  const [mainImagePreview, setMainImagePreview] = useState<string>(
    getImageUrl(product?.main_image),
  );
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImageError, setMainImageError] = useState("");

  //  Gallery: initialize each with full backend URL
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(
    (product?.gallery_images ?? []).map((g) => ({
      image: g.image,
      preview: getImageUrl(g.image),
      isExisting: true,
    })),
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: product?.title ?? "",
      category: product?.category?.toString() ?? "",
      brand: product?.brand?.toString() ?? "",
      type: product?.type ?? "simple",
      base_price: product?.base_price ?? "",
      discount_amount: product?.discount_amount ?? "",
      stock: product?.stock?.toString() ?? "",
      is_featured: product?.is_featured ?? false,
      status: product?.status ?? "draft", // Default to draft if not set
    },
  });

  const productType = watch("type");
  const titleValue = watch("title");
  const currentStatus = watch("status");

  //  Auto-generate slug from title
  useEffect(() => {
    if (titleValue) {
      setSlugPreview(generateSlug(titleValue));
    }
  }, [titleValue]);

  // Clear pricing when type switches to variable
  useEffect(() => {
    if (productType === "variable") {
      setValue("base_price", "");
      setValue("stock", "");
      setValue("discount_amount", "");
    }
  }, [productType, setValue]);

  // ── Image handlers ────────────────────────────────────────────────────────

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    if (mainImageFile) URL.revokeObjectURL(mainImagePreview);
    setMainImageFile(file);
    setMainImagePreview(URL.createObjectURL(file));
    setMainImageError("");
  };

  const removeMainImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (mainImageFile) URL.revokeObjectURL(mainImagePreview);
    setMainImageFile(null);
    setMainImagePreview("");
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const available = 5 - galleryImages.length;
    if (files.length > available) {
      toast.error(`You can add ${available} more image(s)`);
      return;
    }
    const valid = files.filter((f) => {
      if (!f.type.startsWith("image/")) {
        toast.error("Invalid image file");
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error("Each image must be under 5MB");
        return false;
      }
      return true;
    });
    setGalleryImages((prev) => [
      ...prev,
      ...valid.map((f) => ({
        image: "",
        file: f,
        preview: URL.createObjectURL(f),
        isExisting: false,
      })),
    ]);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => {
      const item = prev[index];
      if (!item.isExisting) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const onSubmit = async (data: FormValues) => {
    const stripped = description.replace(/<[^>]*>/g, "").trim();
    if (!stripped) {
      setDescError("Description is required");
      toast.error("Description is required");
      return;
    }
    setDescError("");

    if (!mainImagePreview && !mainImageFile) {
      setMainImageError("Main image is required");
      toast.error("Main image is required");
      return;
    }
    setMainImageError("");

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title.trim());
      formData.append("slug", slugPreview);
      formData.append("category", data.category);
      formData.append("status", data.status); // Add status to form data
      if (data.brand) formData.append("brand", data.brand);
      formData.append("type", data.type);
      formData.append("description", description);
      if (specification) formData.append("specification", specification);
      formData.append("is_featured", data.is_featured.toString());

      if (data.type === "simple") {
        formData.append("base_price", data.base_price || "0");
        formData.append("stock", data.stock || "0");
        if (data.discount_amount)
          formData.append("discount_amount", data.discount_amount);
      } else {
        formData.append("base_price", "0");
        formData.append("stock", "0");
      }

      if (mainImageFile) formData.append("main_image", mainImageFile);
      galleryImages.forEach((g) => {
        if (!g.isExisting && g.file) formData.append("gallery_images", g.file);
      });

      const response = await axiosInstance.patch(
        `/api/products/v1/products/${product?.slug}/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      toast.success(response.data?.message ?? "Product updated successfully!");
      router.push("/dashboard/admin/products");
      router.refresh();
    } catch (error: any) {
      const apiErrors = error?.response?.data?.errors;
      if (apiErrors) {
        Object.entries(apiErrors).forEach(([field, messages]) => {
          const msgs = Array.isArray(messages) ? messages : [String(messages)];
          msgs.forEach((m) => toast.error(`${field}: ${m}`));
        });
      } else {
        toast.error(
          error?.response?.data?.message ?? "Failed to update product.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Product not found.</p>
      </div>
    );
  }

  // Get current status color for display
  const currentStatusOption = STATUS_OPTIONS.find(s => s.value === currentStatus);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Edit Product
            </h1>
            <div className="mt-1 flex items-center gap-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ID:{" "}
                <span className="font-mono text-orange-500">#{product.id}</span>
              </p>
              {/* Current status badge */}
              {currentStatusOption && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatusOption.color}`}>
                  {currentStatusOption.label}
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Basic Information
              </h2>

              {/* Status Field - Add this right after the title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("status", { required: "Status is required" })}
                  className={`w-full px-3 py-2 bg-white dark:bg-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.status ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.status.message}
                  </p>
                )}
                
                {/* Help text based on status */}
                {currentStatus === "draft" && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Draft products are only visible to administrators.
                  </p>
                )}
                {currentStatus === "pending" && (
                  <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-500">
                    This product is waiting for approval.
                  </p>
                )}
                {currentStatus === "published" && (
                  <p className="mt-1 text-xs text-green-600 dark:text-green-500">
                    This product is live and visible to customers.
                  </p>
                )}
                {currentStatus === "rejected" && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-500">
                    This product has been rejected. Please review and resubmit.
                  </p>
                )}
              </div>

              {/* Title + live slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Title <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("title", { required: "Title is required" })}
                  className={`w-full px-3 py-2 bg-white dark:bg-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                  placeholder="Enter product title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.title.message}
                  </p>
                )}

                {/* ✅ Live slug preview */}
                {slugPreview && (
                  <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-gray-400">Slug:</span>
                    <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 text-orange-600 px-2 py-0.5 rounded break-all">
                      {slugPreview}
                    </span>
                  </div>
                )}
              </div>

              {/* Category + Brand */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("category", {
                      required: "Category is required",
                    })}
                    className={`w-full px-3 py-2 bg-white dark:bg-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.category ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                  >
                    <option value="">Select category</option>
                    {allCategories.map((cat) => {
                      const depth = getCategoryDepth(
                        categories,
                        cat.id.toString(),
                      );
                      return (
                        <option key={cat.id} value={cat.id}>
                          {"—".repeat(depth)} {cat.name}
                        </option>
                      );
                    })}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Brand{" "}
                    <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <select
                    {...register("brand")}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">No brand</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("type")}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="simple">Simple</option>
                  <option value="variable">Variable</option>
                </select>
                {productType === "variable" && (
                  <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                    Price and stock are managed through variants.
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <TiptapEditor
                  content={description}
                  onChange={(v) => {
                    setDescription(v);
                    if (v.replace(/<[^>]*>/g, "").trim()) setDescError("");
                  }}
                />
                {descError && (
                  <p className="mt-1 text-sm text-red-600">{descError}</p>
                )}
              </div>

              {/* Specification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Specification{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <TiptapEditor
                  content={specification}
                  onChange={setSpecification}
                />
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Pricing & Stock
              </h2>

              {productType === "simple" ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Base Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register("base_price", {
                        required: "Price is required",
                        min: { value: 0.01, message: "Must be greater than 0" },
                      })}
                      className={`w-full px-3 py-2 bg-white dark:bg-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.base_price ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                      placeholder="0.00"
                    />
                    {errors.base_price && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.base_price.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Discount Amount{" "}
                      <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register("discount_amount")}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Stock <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      {...register("stock", {
                        required: "Stock is required",
                        min: { value: 0, message: "Cannot be negative" },
                      })}
                      className={`w-full px-3 py-2 bg-white dark:bg-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.stock ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                      placeholder="0"
                    />
                    {errors.stock && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.stock.message}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-400">
                    <strong>Variable Product:</strong> Manage price and stock
                    through variants.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  {...register("is_featured")}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="is_featured"
                  className="text-sm text-gray-700 dark:text-gray-300"
                >
                  Mark as featured product
                </label>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-5 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Product Images
              </h2>

              {/* Main Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Main Image <span className="text-red-500">*</span>
                </label>

                {mainImagePreview ? (
                  <div className="relative w-full h-52 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden group">
                    <img
                      src={mainImagePreview}
                      alt="Main product image"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(
                          "Failed to load image:",
                          mainImagePreview,
                        );
                        e.currentTarget.src = "/placeholder-image.jpg"; // Optional fallback
                        e.currentTarget.onerror = null; // Prevent infinite loop
                      }}
                    />
                    {/* Hover to replace */}
                    <label
                      htmlFor="main_image_replace"
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer z-10"
                    >
                      <Upload className="w-8 h-8 text-white mb-1" />
                      <span className="text-white text-sm font-medium">
                        Click to replace
                      </span>
                      <input
                        id="main_image_replace"
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={removeMainImage}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 z-20"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {mainImageFile ? (
                      <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full z-10">
                        New
                      </span>
                    ) : (
                      <span className="absolute bottom-2 left-2 bg-gray-700/70 text-white text-xs px-2 py-0.5 rounded-full z-10">
                        Saved
                      </span>
                    )}
                  </div>
                ) : (
                  <label
                    htmlFor="main_image"
                    className={`flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${mainImageError ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}
                  >
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG up to 5MB
                    </p>
                    <input
                      id="main_image"
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageChange}
                      className="hidden"
                    />
                  </label>
                )}
                {mainImageError && (
                  <p className="mt-1 text-sm text-red-600">{mainImageError}</p>
                )}
              </div>

              {/* Gallery */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gallery Images{" "}
                  <span className="text-gray-400 text-xs">
                    (Optional — {galleryImages.length}/5)
                  </span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {galleryImages.map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-square border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden group"
                    >
                      <img
                        src={img.preview}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {img.isExisting ? (
                        <span className="absolute bottom-1 left-1 bg-gray-700/70 text-white text-xs px-1.5 py-0.5 rounded">
                          Saved
                        </span>
                      ) : (
                        <span className="absolute bottom-1 left-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded">
                          New
                        </span>
                      )}
                    </div>
                  ))}

                  {galleryImages.length < 5 && (
                    <label
                      htmlFor="gallery_add"
                      className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex flex-col items-center justify-center"
                    >
                      <Plus className="w-7 h-7 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Add</span>
                      <input
                        id="gallery_add"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:bg-orange-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                  </>
                ) : (
                  "Update Product"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}