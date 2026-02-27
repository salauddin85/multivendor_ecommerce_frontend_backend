import AllProductsList from "@/components/dashboard/admin/Products/AllProductsList";
import axiosInstance from "@/lib/axios";
import { cookies } from "next/headers";

type PageProps = {
  searchParams?: {
    page?: string;
  };
};

export default async function Page({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("access_token")?.value;

  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;

  let products_list = null; 

  try {
    const response = await axiosInstance.get(
      `/api/admin_dashboard/v1/admin/products/?page_size=50&page=${currentPage}`, 
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    products_list = response.data;
  } catch (error) {
    console.error("Failed to fetch products list:", error);
  }

  return (
    <div>
      <AllProductsList products_list={products_list} />
    </div>
  );
}