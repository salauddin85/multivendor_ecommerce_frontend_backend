import MyActivityLog from "@/components/dashboard/admin/ActivityLog/MyActivityLog";
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


  let my_activity_log = [];

  try {
    const response = await axiosInstance.get(
      `/api/activity_log/v1/activity_logs/me/?page_size=100&page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    my_activity_log = response.data;
    // console.log(my_activity_log)
  } catch (error) {
    console.error("Failed to fetch my activity log:", error);
  }

  return (
    <div>
      <MyActivityLog my_activity_log={my_activity_log} />
    </div>
  );
}
