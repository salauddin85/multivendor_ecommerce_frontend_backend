import AllCouponsList from "@/components/dashboard/admin/Coupons/AllCouponsList";
import CouponUsagesList from "@/components/dashboard/admin/Coupons/CouponUsagesList";
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


  let all_coupon_usages = [];

  try {
    const response = await axiosInstance.get(
      `/api/coupons/v1/coupon_usages/?page_size=20&page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    all_coupon_usages = response.data;
    // console.log(all_coupon_usages)
  } catch (error) {
    console.error("Failed to fetch coupon usages list:", error);
  }

  return (
    <div>
      <CouponUsagesList all_coupons_list={all_coupon_usages} />
    </div>
  );
}
