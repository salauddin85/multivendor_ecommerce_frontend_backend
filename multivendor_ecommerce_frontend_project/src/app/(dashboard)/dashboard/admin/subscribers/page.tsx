import AllSubscribersList from "@/components/dashboard/admin/Subscribers/AllSubscribersList";
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


  let all_subscribers_list = [];

  try {
    const response = await axiosInstance.get(
      `/api/notifications/v1/notifications/subscriber/?page_size=50&page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    all_subscribers_list = response.data;
    // console.log(all_subscribers_list)
  } catch (error) {
    console.error("Failed to fetch subscribers list:", error);
  }

  return (
    <div>
      <AllSubscribersList all_subscribers_list={all_subscribers_list} />
    </div>
  );
}
