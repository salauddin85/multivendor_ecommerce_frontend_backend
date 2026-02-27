import axiosInstance from "@/lib/axios";
import { cookies } from "next/headers";
import StaffList from "@/components/dashboard/vendor/staff/StaffList";

export default async function Page() {

  const cookieStore = await cookies();
  const authToken = cookieStore.get("access_token")?.value;

  let staff_list = [];

  try {
    const response = await axiosInstance.get(
      "/api/vendors_dashboard/v1/vendors/staff/",
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    staff_list = response.data;
    // console.log(staff_list)
  } catch (error) {
    console.error("Failed to fetch staff list:", error);
  }

  return (
    <div>
      <StaffList staff_list={staff_list} />
    </div>
  );
}
