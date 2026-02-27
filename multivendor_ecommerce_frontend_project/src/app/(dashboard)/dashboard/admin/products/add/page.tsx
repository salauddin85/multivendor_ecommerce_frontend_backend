// app/dashboard/admin/products/add/page.tsx
import axiosInstance from "@/lib/axios";
import { cookies } from "next/headers";
import { Suspense } from "react";

import type { Brand, Category, ApiResponse } from "@/types/catalog";
import AdminProductAddForm from "@/components/dashboard/admin/Products/AdminProductAddForm";

export default async function ProductAddPage() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("access_token")?.value ?? "";

  let brands: Brand[] = [];
  let categories: Category[] = [];

  try {
    const [brandsRes, categoriesRes] = await Promise.all([
      axiosInstance.get<ApiResponse<Brand[]>>("/api/catalog/v1/brands/", {
        headers: { Cookie: `access_token=${authToken}` },
      }),

      axiosInstance.get<ApiResponse<Category[]>>(
        "/api/catalog/v1/categories_tree/",
        {
          headers: { Cookie: `access_token=${authToken}` },
        }
      ),
    ]);

    brands = brandsRes.data.data;
    categories = categoriesRes.data.data;

    // console.log(categories);
    // console.log(brands);
  } catch (error) {
    console.error("Product add page data fetch failed:", error);
  }

  return (
    <Suspense fallback={<div>Loading product form...</div>}>
      <AdminProductAddForm brands={brands} categories={categories} />
    </Suspense>
  );
}