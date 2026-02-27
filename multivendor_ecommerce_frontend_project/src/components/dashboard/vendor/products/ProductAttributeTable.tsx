"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Pagination from "@/components/pagination/Pagination";
import axiosInstance from "@/lib/axios";
import type {
  ProductAttribute,
  ProductAttributeResponse,
} from "@/types/productAttribute";

type Props = {
  product_attributes: ProductAttributeResponse;
};

export default function ProductAttributeTable({
  product_attributes,
}: Props) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const attributes: ProductAttribute[] = product_attributes.data;
  const pagination = product_attributes.pagination;


  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  // ======================
  // ACTIONS
  // ======================
  const handleAttributeValues = (id: number) => {
    router.push(`/dashboard/vendor/products/attributes/${id}`);
  };

  const handleUpdate = (id: number) => {
    router.push(`/dashboard/vendor/products/attributes/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      await axiosInstance.delete(
        `/api/vendors_dashboard/v1/vendors/product-attributes/${deleteId}/`
      );
      router.refresh();
      setDeleteId(null);
    } catch (error) {
      console.error("Attribute delete failed:", error);
      alert("Failed to delete attribute");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto border rounded-xl">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-orange-500 text-white">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>

              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Attribute Name</th>
              <th className="px-4 py-3 text-center">Variation</th>
              <th className="px-4 py-3 text-center">Created</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {attributes.map((attr) => (
              
              <tr
                key={attr.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3 font-medium">
                  {attr.id}
                </td>
                <td className="px-4 py-3 font-medium">
                  {attr.product.title}
                </td>

                {/*  Long attribute name safe */}
                <td className="px-4 py-3 max-w-[260px] whitespace-nowrap overflow-x-auto">
                  {attr.name}
                </td>

                <td className="px-4 py-3 text-center">
                  {attr.is_variation ? (
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
                      Yes
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-700">
                      No
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-center text-gray-500">
                  {formatDate(attr.created_at)}
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleAttributeValues(attr.id)}
                      className="px-3 py-1 text-xs rounded-md bg-blue-500 text-white hover:bg-blue-600"
                    >
                      Values
                    </button>

                    <button
                      onClick={() => handleUpdate(attr.id)}
                      className="px-3 py-1 text-xs rounded-md bg-orange-600 text-white hover:bg-orange-700"
                    >
                      Update
                    </button>

                    <button
                      onClick={() => setDeleteId(attr.id)}
                      className="px-3 py-1 text-xs rounded-md bg-red-500 text-white hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {attributes.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-10 text-gray-500"
                >
                  No attributes found
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
              Are you sure you want to delete this attribute?
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
