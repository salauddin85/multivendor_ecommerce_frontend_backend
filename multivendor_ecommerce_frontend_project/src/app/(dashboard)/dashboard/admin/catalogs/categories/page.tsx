import AllProductsList from "@/components/dashboard/admin/Products/AllProductsList";
import AllProductCategories from "@/components/dashboard/admin/Products/Categories/AllProductCategories";
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


  let categories = [];

  try {
    const response = await axiosInstance.get(
      `/api/catalog/v1/categories/?page_size=20&page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    categories = response.data;
    // console.log(categories)
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }

  return (
    <div>
      <AllProductCategories categories={categories} />
    </div>
  );
}
