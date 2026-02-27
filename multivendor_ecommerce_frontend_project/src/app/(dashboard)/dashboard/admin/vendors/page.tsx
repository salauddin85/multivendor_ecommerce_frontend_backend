import CompaniesList from "@/components/dashboard/admin/Companies/CompaniesList";
import VendorsList from "@/components/dashboard/admin/Vendors/VendorsList";
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


  let vendors_list = [];

  try {
    const response = await axiosInstance.get(
      `/api/authorization/v1/vendors/list/?page_size=2&page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    vendors_list = response.data;
    // console.log(vendors_list)
  } catch (error) {
    console.error("Failed to fetch vendors list:", error);
  }

  return (
    <div>
      <VendorsList vendors_list={vendors_list} />
    </div>
  );
}
