import CompaniesList from "@/components/dashboard/admin/Companies/CompaniesList";
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


  let companies_list = [];

  try {
    const response = await axiosInstance.get(
      `/api/authorization/v1/store_owners/list/?page_size=20&page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    companies_list = response.data;
    // console.log(companies_list)
  } catch (error) {
    console.error("Failed to fetch companies list:", error);
  }

  return (
    <div>
      <CompaniesList companies_list={companies_list} />
    </div>
  );
}
