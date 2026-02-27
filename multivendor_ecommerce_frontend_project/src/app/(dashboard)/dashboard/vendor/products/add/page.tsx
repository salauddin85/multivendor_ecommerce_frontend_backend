import ProductAddForm from "@/components/dashboard/vendor/products/ProductAddForm";
import axiosInstance from "@/lib/axios";
import { cookies } from "next/headers";
import { Suspense } from "react";

import type { Brand, Category, Store, ApiResponse } from "@/types/catalog";

export default async function ProductAddPage() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("access_token")?.value ?? "";

  let brands: Brand[] = [];
  let categories: Category[] = [];
  let store: Store[] = [];

  try {
    const [brandsRes, categoriesRes, storeRes] = await Promise.all([
      axiosInstance.get<ApiResponse<Brand[]>>("/api/catalog/v1/brands/", {
        headers: { Cookie: `access_token=${authToken}` },
      }),

      axiosInstance.get<ApiResponse<Category[]>>(
        "/api/catalog/v1/categories_tree/",
        {
          headers: { Cookie: `access_token=${authToken}` },
        }
      ),

      axiosInstance.get<ApiResponse<Store[]>>("/api/stores/v1/stores/me/", {
        headers: { Cookie: `access_token=${authToken}` },
      }),
    ]);

    brands = brandsRes.data.data;
    categories = categoriesRes.data.data;
    store = storeRes.data.data;

    // console.log(categories);
    // console.log(brands);
  } catch (error) {
    console.error("Product add page data fetch failed:", error);
  }

  return (
    <Suspense fallback={<div>Loading product form...</div>}>
      <ProductAddForm brands={brands} categories={categories} store={store} />
    </Suspense>
  );
}
