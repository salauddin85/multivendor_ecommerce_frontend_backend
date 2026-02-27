// use dynamic
export const dynamic = "force-dynamic";
import BrandList from "@/components/brands/BrandList";
import axiosInstance from "@/lib/axios";
// import { cookies } from "next/headers";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brands",
  description: "Explore our collection of premium brands and discover quality products from trusted manufacturers worldwide.",
};

type PageProps = {
  searchParams?: {
    page?: string;
  };
};

export default async function Page({ searchParams }: PageProps) {
  // const cookieStore = await cookies();
  // const authToken = cookieStore.get("access_token")?.value;

  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;

  let brands_list = {
    data: [],
    pagination: {
      count: 0,
      total_pages: 0,
      current_page: currentPage,
      next: null,
      previous: null,
      page_size: 24,
    },
  };

  try {
    const response = await axiosInstance.get(
      `/api/catalog/v1/brands/?product_available=true&page_size=24&page=${currentPage}`,
      // {
      //   headers: {
      //     Authorization: `Bearer ${authToken}`,
      //   },
      // },
    );
    brands_list = response.data;
    // console.log(brands_list);
  } catch (error) {
    console.error("Failed to fetch brands list:", error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 sm:py-12">
      <BrandList brands_list={brands_list} />
    </div>
  );
}
