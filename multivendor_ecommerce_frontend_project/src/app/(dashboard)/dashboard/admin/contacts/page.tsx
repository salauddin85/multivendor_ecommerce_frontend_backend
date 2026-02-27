import AllContactList from "@/components/dashboard/admin/Contact/AllContactList";
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


  let all_contacts_list = [];

  try {
    const response = await axiosInstance.get(
      `/api/contacts/v1/contacts/?page_size=50&page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    all_contacts_list = response.data;
    // console.log(all_contacts_list)
  } catch (error) {
    console.error("Failed to fetch contacts list:", error);
  }

  return (
    <div>
      <AllContactList all_contacts_list={all_contacts_list} />
    </div>
  );
}
