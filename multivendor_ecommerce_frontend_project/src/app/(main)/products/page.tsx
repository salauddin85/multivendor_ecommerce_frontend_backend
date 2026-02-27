export const dynamic = "force-dynamic";

import ProductGrid from "@/components/products/ProductGrid";
import Pagination from "@/components/pagination/Pagination";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";

type Product = {
  id: number;
  slug: string;
  store: string;
  category: string;
  brand: string | null;
  title: string;
  type: string;
  description: string;
  base_price: string;
  main_image: string | null;
  stock: number;
  is_featured: boolean;
  status: string;
};

type ApiResponse = {
  code: number;
  status: string;
  message: string;
  data: Product[];
  pagination: {
    count: number;
    total_pages: number;
    current_page: number;
    next: string | null;
    previous: string | null;
    page_size: number;
  };
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string, brand?: string,new_arrival?: boolean,a_to_z?: boolean,z_to_a?: boolean,low_to_high?: boolean,high_to_low?: boolean,is_featured?: boolean }>;
}) {
   const params = await searchParams;

   const currentPage = params.page ? Number(params.page) : 1;
   const search = params.search ?? "";
   const brand = params.brand ?? "";
   const new_arrival = params.new_arrival ??'false';
   const a_to_z = params.a_to_z ??'false';
   const z_to_a = params.z_to_a ??'false';
   const low_to_high = params.low_to_high ??'false';
   const high_to_low = params.high_to_low ??'false';
   const featured = params.is_featured ??'false';
   const pageSize = 20;

  let products: Product[] = [];
  let paginationData = null;

  try {
    const response = await axiosInstance.get<ApiResponse>(
      `/api/products/v1/products/?page_size=${pageSize}&page=${currentPage}&search=${search}&brand=${brand}&new_arrival=${new_arrival}&a_to_z=${a_to_z}&z_to_a=${z_to_a}&low_to_high=${low_to_high}&high_to_low=${high_to_low}&is_featured=${featured}`
    );

    if (response.data && response.data.data) {
      products = response.data.data;
      paginationData = {
        count: response.data.pagination.count,
        current_page: response.data.pagination.current_page,
        total_pages: response.data.pagination.total_pages,
        next: response.data.pagination.next ? true : false,
        previous: response.data.pagination.previous ? true : false,
      };
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        "Product fetch failed:",
        error.response?.status,
        error.response?.data
      );
    } else {
      console.error("Unexpected error:", error);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ProductGrid products={products} />

        {paginationData && paginationData.total_pages > 1 && (
          <Pagination paginationData={paginationData} className="mt-8" />
        )}
      </div>
    </div>
  );
}