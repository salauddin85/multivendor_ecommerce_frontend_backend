import AllActivityLog from "@/components/dashboard/admin/ActivityLog/AllActivityLog";
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


  let all_activity_log = [];

  try {
    const response = await axiosInstance.get(
      `/api/activity_log/v1/activity_logs/?page_size=100&page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    all_activity_log = response.data;
    // console.log(my_activity_log)
  } catch (error) {
    console.error("Failed to fetch my activity log:", error);
  }

  return (
    <div>
      <AllActivityLog all_activity_log={all_activity_log} />
    </div>
  );
}
