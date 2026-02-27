import AllBrandList from "@/components/dashboard/admin/Products/Brands/AllBrandList";
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


  let brands = [];

  try {
    const response = await axiosInstance.get(
      `/api/catalog/v1/brands/?page_size=20&page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    brands = response.data;
    // console.log(brands)
  } catch (error) {
    console.error("Failed to fetch brands:", error);
  }

  return (
    <div>
      <AllBrandList brands={brands} />
    </div>
  );
}
