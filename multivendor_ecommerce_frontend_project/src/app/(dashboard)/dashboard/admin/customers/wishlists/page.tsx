import CustomerWishlistTable from "@/components/dashboard/admin/Customers/Wishlist/CustomerWishlistTable";
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


  let all_wishlists = [];

  try {
    const response = await axiosInstance.get(
      `/api/wishlist/v1/wishlists/?page_size=100&page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    all_wishlists = response.data;
    // console.log(all_wishlists)
  } catch (error) {
    console.error("Failed to fetch wishlists list:", error);
  }

  return (
    <div>
      <CustomerWishlistTable all_wishlists={all_wishlists} />
    </div>
  );
}
