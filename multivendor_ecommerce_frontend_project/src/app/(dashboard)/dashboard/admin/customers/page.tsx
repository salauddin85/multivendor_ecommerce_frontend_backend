import CustomerList from "@/components/dashboard/admin/Customers/CustomerList";
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


  let customer_list = [];

  try {
    const response = await axiosInstance.get(
      `/api/authorization/v1/customers/list/?page_size=50&page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    customer_list = response.data;
    // console.log(customer_list)
  } catch (error) {
    console.error("Failed to fetch customer list:", error);
  }

  return (
    <div>
      <CustomerList customer_list={customer_list} />
    </div>
  );
}
