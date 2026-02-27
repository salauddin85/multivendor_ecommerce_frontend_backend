
import React, { Suspense } from "react";
import ProductVariantAddForm from "@/components/dashboard/admin/Products/ProductVariantAddForm";
import PageLoader from "@/components/common/PageLoader";
import axiosInstance from "@/lib/axios";
import { cookies } from "next/headers";

type PageProps = {
  searchParams?: {
    page?: string;
  };
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;

  const cookieStore = await cookies();
  const authToken = cookieStore.get("access_token")?.value;

  let products: any[] = [];
  let paginationData = {
    count: 0,
    total_pages: 1,
    current_page: 1,
    next: null,
    previous: null,
    page_size: 10
  };

  try {
    const response = await axiosInstance.get(
      `/api/admin_dashboard/v1/admin/products/?page_size=10&page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    products = response.data.data || [];
    paginationData = response.data.pagination || paginationData;
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <div>
        <ProductVariantAddForm 
          initialProducts={products} 
          initialPagination={paginationData}
        />
      </div>
    </Suspense>
  );
}