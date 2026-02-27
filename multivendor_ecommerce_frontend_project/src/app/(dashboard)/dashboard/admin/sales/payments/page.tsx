import AllPaymentsList from "@/components/dashboard/admin/Payments/AllPaymentsList";
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


  let all_payments_list = [];

  try {
    const response = await axiosInstance.get(
      `/api/payments/v1/payments/?page_size=100&page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    all_payments_list = response.data;
    // console.log(all_payments_list)
  } catch (error) {
    console.error("Failed to fetch payments list:", error);
  }

  return (
    <div>
      <AllPaymentsList all_payments_list={all_payments_list} />
    </div>
  );
}
