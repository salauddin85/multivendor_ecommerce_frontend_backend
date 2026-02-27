"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Pagination from "@/components/pagination/Pagination";
import axiosInstance from "@/lib/axios";
import { toast } from "react-toastify";
import type {
  ProductAttribute,
  ProductAttributeResponse,
} from "@/types/productAttribute";
import Link from "next/link";

type Props = {
  product_attributes: ProductAttributeResponse;
};

export default function ProductAttributeTableForAdmin({
  product_attributes,
}: Props) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const attributes: ProductAttribute[] = product_attributes.data;
  const pagination = product_attributes.pagination;

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ======================
  // ACTIONS
  // ======================
  const handleAttributeValues = (id: number) => {
    router.push(`/dashboard/admin/products/attributes/${id}`);
  };

  const handleUpdate = (id: number) => {
    console.log("Navigating to update attribute with ID:", id);
    router.push(
      `/dashboard/admin/products/attributes/update/?attribute_id=${id}`,
    );
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      await axiosInstance.delete(
        `/api/products/v1/products/attributes/${deleteId}/`,
      );
      router.refresh();
      setDeleteId(null);
      toast.success("Attribute deleted successfully");
    } catch (error) {
      console.error("Attribute delete failed:", error);
      toast.error("Failed to delete attribute");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header section - stays at top */}
      <div className="sticky top-0 z-10 bg-white pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">
            Product Attributes Table
          </h1>

          <Link href="/dashboard/admin/products/attributes/add">
            <button
              type="button"
              className="flex items-center gap-2 bg-orange-500 px-4 py-2 rounded-md text-white font-medium
                   hover:bg-orange-600 transition shadow-sm whitespace-nowrap"
            >
              + Create Attribute
            </button>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {/* ================= TABLE WITH STICKY HEADER ================= */}
        <div className="relative">
          {/* Table container with horizontal scroll */}
          <div className="overflow-x-auto border rounded-xl">
            <table className="w-full text-sm">
              {/* Sticky header that stays on top when scrolling horizontally */}
              <thead className="bg-orange-500 text-white sticky top-0 z-20">
                <tr>
                  <th className="px-4 py-3 text-left whitespace-nowrap">ID</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Product ID</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Product Title</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Product Slug</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Attribute Name</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Variation</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Created</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Updated</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Actions</th>
                </tr>
              </thead>

              <tbody>
                {attributes.map((attr) => {
                  // Extract product data (handling both object and string formats)
                  const productId = typeof attr.product === 'object' ? attr.product.id : 'N/A';
                  const productTitle = typeof attr.product === 'object' ? attr.product.title : attr.product;
                  const productSlug = typeof attr.product === 'object' ? attr.product.slug : 'N/A';

                  return (
                    <tr
                      key={attr.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{attr.id}</td>
                      
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-mono">
                          #{productId}
                        </span>
                      </td>

                      <td className="px-4 py-3 min-w-[200px] max-w-[300px]">
                        <div className="truncate font-medium" title={productTitle}>
                          {productTitle}
                        </div>
                      </td>

                      <td className="px-4 py-3 min-w-[150px] max-w-[250px]">
                        <div className="truncate text-xs text-gray-600 font-mono" title={productSlug}>
                          {productSlug}
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-gray-800">
                          {attr.name}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {attr.is_variation ? (
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 whitespace-nowrap">
                            Yes
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-700 whitespace-nowrap">
                            No
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(attr.created_at)}
                      </td>

                      <td className="px-4 py-3 text-center text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(attr.updated_at)}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleAttributeValues(attr.id)}
                            className="px-3 py-1 text-xs rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors whitespace-nowrap"
                            title="View attribute values"
                          >
                            Values
                          </button>

                          <button
                            onClick={() => handleUpdate(attr.id)}
                            className="px-3 py-1 text-xs rounded-md bg-orange-600 text-white hover:bg-orange-700 transition-colors whitespace-nowrap"
                          >
                            Update
                          </button>

                          <button
                            onClick={() => setDeleteId(attr.id)}
                            className="px-3 py-1 text-xs rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors whitespace-nowrap"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {attributes.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-gray-500">
                      No attributes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= PAGINATION ================= */}
        <div className="sticky bottom-0 bg-white py-4 border-t">
          <Pagination paginationData={pagination} />
        </div>

        {/* ================= DELETE MODAL ================= */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
              <h3 className="text-lg font-semibold mb-3">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this attribute?
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
    </div>
  );
}