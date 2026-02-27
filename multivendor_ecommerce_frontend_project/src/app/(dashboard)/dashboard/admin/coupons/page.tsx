import AllCouponsList from "@/components/dashboard/admin/Coupons/AllCouponsList";
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


  let all_coupons_list = [];

  try {
    const response = await axiosInstance.get(
      `/api/coupons/v1/coupons/?page_size=20&page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    all_coupons_list = response.data;
    // console.log(all_coupons_list)
  } catch (error) {
    console.error("Failed to fetch coupons list:", error);
  }

  return (
    <div>
      <AllCouponsList all_coupons_list={all_coupons_list} />
    </div>
  );
}
