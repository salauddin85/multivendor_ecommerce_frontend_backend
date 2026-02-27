"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import axiosInstance from "@/lib/axios";
import Pagination from "@/components/pagination/Pagination";
import type { Product, ProductsResponse } from "@/types/product";

type ProductsTableProps = {
  products: ProductsResponse;
};

export default function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const productList: Product[] = products?.data ?? [];
  const pagination = products?.pagination;

  // =====================
  // ACTIONS
  // =====================
  const handleDetails = (slug: string) => {
    router.push(`/dashboard/vendor/products/${slug}`);
  };

  const handleUpdate = (slug: string) => {
    router.push(`/dashboard/vendor/products/${slug}/edit`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      await axiosInstance.delete(
        `/api/vendors_dashboard/v1/vendors/products/${deleteId}/`
      );
      router.refresh();
      setDeleteId(null);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Product delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= TABLE ================= */}
      <div className="overflow-x-auto border rounded-xl">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-orange-500 text-white">
            <tr>
              <th className="px-4 py-3 text-left">Image</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-center">Category</th>
              <th className="px-4 py-3 text-center">Brand</th>
              <th className="px-4 py-3 text-center">Price</th>
              <th className="px-4 py-3 text-center">Stock</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {productList.map((product) => (
              <tr
                key={product.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3">
                  <Image
                    src={product.main_image}
                    alt={product.title}
                    width={48}
                    height={48}
                    className="rounded-md object-cover"
                  />
                </td>

                <td className="px-4 py-3 font-medium">
                  {product.title}
                </td>

                <td className="px-4 py-3 text-center">
                  {product.category}
                </td>

                <td className="px-4 py-3 text-center">
                  {product.brand}
                </td>

                <td className="px-4 py-3 text-center font-semibold">
                  ৳ {product.base_price}
                </td>

                <td className="px-4 py-3 text-center">
                  {product.stock}
                </td>

                <td className="px-4 py-3 text-center">
                  <span className="px-3 py-1 text-xs rounded-full bg-gray-200">
                    {product.status}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleDetails(product.slug)}
                      className="px-3 py-1 rounded-md bg-blue-500 text-white text-xs hover:bg-blue-600"
                    >
                      Details
                    </button>

                    <button
                      onClick={() => handleUpdate(product.slug)}
                      className="px-3 py-1 rounded-md bg-orange-600 text-white text-xs hover:bg-orange-700"
                    >
                      Update
                    </button>

                    <button
                      onClick={() => setDeleteId(product.id)}
                      className="px-3 py-1 rounded-md bg-red-500 text-white text-xs hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {productList.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-10 text-gray-500"
                >
                  No products found
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
              Are you sure you want to delete this product?
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
