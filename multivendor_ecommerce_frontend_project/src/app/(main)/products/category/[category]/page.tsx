import Pagination from "@/components/pagination/Pagination";
import ProductGrid from "@/components/products/ProductGrid";
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
interface PageProps {
  params: {
    category: string;
    subcategory: string;
  };
  searchParams: Promise<{ page?: string }>;
}

async function page({ params, searchParams }: PageProps) {
  const { category } = await params;
  const { page } = await searchParams;
  const currentPage = page ? Number(page) : 1;
  const pageSize = 10;

  let products: Product[] = [];
  let paginationData = null;

  try {
    const response = await axiosInstance.get<ApiResponse>(
      `/api/products/v1/products/?page_size=${pageSize}&page=${currentPage}&category=${category}`
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
export default page;
