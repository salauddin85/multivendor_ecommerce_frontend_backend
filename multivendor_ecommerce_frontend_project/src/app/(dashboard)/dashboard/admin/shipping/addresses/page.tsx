import AllPaymentsList from "@/components/dashboard/admin/Payments/AllPaymentsList";
import AllShippingAddress from "@/components/dashboard/admin/Shipping/Address/AllShippingAddress";
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


  let all_shipping_address = [];

  try {
    const response = await axiosInstance.get(
      `/api/orders/v1/shipping_address/?page_size=50&page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    all_shipping_address = response.data;
    // console.log(all_shipping_address)
  } catch (error) {
    console.error("Failed to fetch shipping addresses list:", error);
  }

  return (
    <div>
      <AllShippingAddress all_shipping_address={all_shipping_address} />
    </div>
  );
}
