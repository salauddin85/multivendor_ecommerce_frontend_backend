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
import { toast } from "react-toastify";

type Props = {
  product_variants: ProductVariantResponse;
};

// Backend URL directly
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";

export default function AdminProductVariantTable({ product_variants }: Props) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const variants: ProductVariant[] = product_variants.data;
  const pagination = product_variants.pagination;

  // ======================
  // Image URL Helper
  // ======================
  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) {
      return "/placeholder-image.png";
    }

    // If already full URL
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    // Clean the backend URL (remove trailing slash if exists)
    const cleanBackendUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;

    // Ensure imagePath starts with slash
    const cleanImagePath = imagePath.startsWith("/")
      ? imagePath
      : `/${imagePath}`;

    return `${cleanBackendUrl}${cleanImagePath}`;
  };

  // ======================
  // Format date helper
  // ======================
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // ======================
  // ACTIONS
  // ======================
  const handleUpdate = (id: number) => {
    router.push(`/dashboard/admin/products/variants/update?variant_id=${id}`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      await axiosInstance.delete(
        `/api/products/v1/products/variants/${deleteId}/`,
      );
      router.refresh();
      setDeleteId(null);
      toast.success("Variant deleted successfully");
    } catch (error) {
      console.error("Variant delete failed:", error);
      toast.error("Failed to delete variant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto border rounded-xl">
        <table className="min-w-[1400px] w-full text-sm">
          <thead className="bg-orange-500 text-white">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Image</th>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Variant Name</th>
              <th className="px-4 py-3 text-center">SKU</th>
              <th className="px-4 py-3 text-center">Price (৳)</th>
              <th className="px-4 py-3 text-center">Discount (৳)</th>
              <th className="px-4 py-3 text-center">Stock</th>
              <th className="px-4 py-3 text-center">Default</th>
              <th className="px-4 py-3 text-center">Created At</th>
              <th className="px-4 py-3 text-center">Updated At</th>
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
                    <div className="text-sm font-medium text-gray-800">
                      {variant.id}
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="relative w-16 h-16">
                      <Image
                        src={imageUrl}
                        alt={variant.variant_name || "variant"}
                        className="rounded-md object-cover"
                        width={64}
                        height={64}
                      />
                    </div>
                  </td>

                  <td className="px-4 py-3 font-medium max-w-[200px]">
                    <div className="" title={variant.product}>
                      {variant.product}
                    </div>
                  </td>

                  <td className="px-4 py-3 max-w-[150px]">
                    <div className="" title={variant.variant_name || "-"}>
                      {variant.variant_name || "-"}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center font-mono text-xs">
                    {variant.sku}
                  </td>

                  <td className="px-4 py-3 text-center font-semibold">
                    ৳ {parseFloat(variant.price).toFixed(2)}
                  </td>

                  <td className="px-4 py-3 text-center text-green-600 font-semibold">
                    {variant.discount_price && parseFloat(variant.discount_price) > 0 
                      ? `৳ ${parseFloat(variant.discount_price).toFixed(2)}` 
                      : "-"}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      variant.stock > 10 
                        ? 'bg-green-100 text-green-800' 
                        : variant.stock > 0 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {variant.stock}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    {variant.is_default ? (
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                        Default
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center text-xs text-gray-600">
                    {formatDate(variant.created_at)}
                  </td>

                  <td className="px-4 py-3 text-center text-xs text-gray-600">
                    {formatDate(variant.updated_at)}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleUpdate(variant.id)}
                        className="px-3 py-1 text-xs rounded-md bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                      >
                        Update
                      </button>

                      <button
                        onClick={() => setDeleteId(variant.id)}
                        className="px-3 py-1 text-xs rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
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
                <td colSpan={12} className="text-center py-10 text-gray-500">
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
            <h3 className="text-lg font-semibold mb-3">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this variant?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-md border hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
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