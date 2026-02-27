// app/dashboard/admin/products/edit/[id]/page.tsx

import ProductEditForm from "@/components/dashboard/admin/Products/ProductEditForm";
import axiosInstance from "@/lib/axios";
import { cookies } from "next/headers";
import { Suspense } from "react";
import BlogFormSkeleton from "@/components/dashboard/admin/Blogs/BlogFormSkeleton";

import type { Brand, Category, ApiResponse } from "@/types/catalog";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const authToken = cookieStore.get("access_token")?.value ?? "";

  let product = null;
  let brands: Brand[] = [];
  let categories: Category[] = [];

  try {
    const [productRes, brandsRes, categoriesRes] = await Promise.all([
      axiosInstance.get(`/api/products/v1/product/${id}/`, {
        headers: {
          Cookie: `access_token=${authToken}`,
        },
      }),

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

    product = productRes.data.data;
    brands = brandsRes.data.data;
    categories = categoriesRes.data.data;

  } catch (error) {
    console.error("Product edit page data fetch failed:", error);
  }

  return (
    <Suspense fallback={<BlogFormSkeleton />}>
      <ProductEditForm
        product={product}
        brands={brands}
        categories={categories}
      />
    </Suspense>
  );
}