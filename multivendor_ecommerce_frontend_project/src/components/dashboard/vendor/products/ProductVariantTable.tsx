"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Pagination from "@/components/pagination/Pagination";
import axiosInstance from "@/lib/axios";
import type {
  ProductVariant,
  ProductVariantResponse,
} from "@/types/productVariant";
import { env } from "process";

type Props = {
  product_variants: ProductVariantResponse;
};

// Backend URL directly
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";

export default function ProductVariantTable({ product_variants }: Props) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const variants: ProductVariant[] = product_variants.data;
  const pagination = product_variants.pagination;

  console.log("Backend URL:", BACKEND_URL);

  // ======================
  // Image URL Helper - SIMPLIFIED
  // ======================
  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) {
      return "/placeholder-image.png";
    }
    
    // If already full URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Clean the backend URL (remove trailing slash if exists)
    const cleanBackendUrl = BACKEND_URL.endsWith('/') 
      ? BACKEND_URL.slice(0, -1) 
      : BACKEND_URL;
    
    // Ensure imagePath starts with slash
    const cleanImagePath = imagePath.startsWith('/') 
      ? imagePath 
      : `/${imagePath}`;
    
    const finalUrl = `${cleanBackendUrl}${cleanImagePath}`;
    console.log(`Image URL: ${finalUrl}`);
    return finalUrl;
  };

  // ======================
  // OPTION 1: Use img tag (like your profile page)
  // ======================
  const renderWithImgTag = (imagePath: string, alt: string) => {
    const imageUrl = getImageUrl(imagePath);
    
    return (
      <div className="relative w-16 h-16">
        <Image
          src={imageUrl}
          alt={alt}
          className="w-full h-full rounded-md object-cover"
          width={64}
          height={64}
        />
      </div>
    );
  };

  // ======================
  // OPTION 2: Use Next.js Image component with proper config
  // ======================
  const renderWithNextImage = (imagePath: string, alt: string) => {
    const imageUrl = getImageUrl(imagePath);
    
    // Check if the URL is from your backend
    const isBackendImage = imageUrl.includes(env.NEXT_PUBLIC_BACKEND_API_URL || '');
    
    if (isBackendImage) {
      return (
        <div className="relative w-16 h-16">
          <Image
            src={imageUrl}
            alt={alt}
            // fill
            className="rounded-md object-cover"
            sizes="64px"
            width={300}
            height={200}
            // unoptimized={true} // Disable optimization for external images
            
          />
        </div>
      );
    }
    
    
  };

  // ======================
  // ACTIONS
  // ======================
  const handleDetails = (id: number) => {
    router.push(`/dashboard/vendor/product-variants/${id}`);
  };

  const handleUpdate = (id: number) => {
    router.push(`/dashboard/vendor/product-variants/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      await axiosInstance.delete(
        `/api/vendors_dashboard/v1/vendors/product-variants/${deleteId}/`
      );
      router.refresh();
      setDeleteId(null);
    } catch (error) {
      console.error("Variant delete failed:", error);
      alert("Failed to delete variant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto border rounded-xl">
        <table className="min-w-[1200px] w-full text-sm">
          <thead className="bg-orange-500 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Image</th>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Variant Name</th>
              <th className="px-4 py-3 text-center">SKU</th>
              <th className="px-4 py-3 text-center">Price</th>
              <th className="px-4 py-3 text-center">Discount</th>
              <th className="px-4 py-3 text-center">Stock</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {variants.map((variant) => {
              const imageUrl = getImageUrl(variant.image);
              
              
              return (
                <tr
                  key={variant.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">
                    {/* OPTION 1: Use img tag (Recommended for now) */}
                    {/* {renderWithImgTag(variant.image, variant.variant_name || "variant")} */}
                    
                    {/* OPTION 2: Use Next Image */}
                    {renderWithNextImage(variant.image, variant.variant_name || "variant")}
                  </td>

                  <td className="px-4 py-3 font-medium">
                    {variant.product}
                  </td>

                  <td className="px-4 py-3 max-w-[260px] whitespace-nowrap overflow-x-auto">
                    {variant.variant_name || "-"}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {variant.sku}
                  </td>

                  <td className="px-4 py-3 text-center font-semibold">
                    ৳ {variant.price}
                  </td>

                  <td className="px-4 py-3 text-center text-green-600 font-semibold">
                    ৳ {variant.discount_price}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {variant.stock}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleDetails(variant.id)}
                        className="px-3 py-1 text-xs rounded-md bg-blue-500 text-white hover:bg-blue-600"
                      >
                        Details
                      </button>

                      <button
                        onClick={() => handleUpdate(variant.id)}
                        className="px-3 py-1 text-xs rounded-md bg-orange-600 text-white hover:bg-orange-700"
                      >
                        Update
                      </button>

                      <button
                        onClick={() => setDeleteId(variant.id)}
                        className="px-3 py-1 text-xs rounded-md bg-red-500 text-white hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {variants.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-10 text-gray-500"
                >
                  No variants found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= PAGINATION ================= */}
      <Pagination paginationData={pagination} />

      {/* ================= DELETE MODAL ================= */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold mb-3">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this variant?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-md border"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}