import OrdersList from "@/components/dashboard/admin/Orders/OrdersList";
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


  let orders_list = [];

  try {
    const response = await axiosInstance.get(
      `/api/orders/v1/orders/?page_size=100&page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    orders_list = response.data;
    // console.log(orders_list)
  } catch (error) {
    console.error("Failed to fetch orders list:", error);
  }

  return (
    <div>
      <OrdersList orders_list={orders_list} />
    </div>
  );
}
