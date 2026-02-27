import axiosInstance from "@/lib/axios";
import { cookies } from "next/headers";
import VendorProfile from "@/components/dashboard/vendor/profile/VendorProfile";

export default async function Page() {

  const cookieStore = await cookies();
  const authToken = cookieStore.get("access_token")?.value;

  let profile_details = [];

  try {
    const response = await axiosInstance.get(
      "/api/vendors_dashboard/v1/vendors/profile/me/",
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    profile_details = response.data;
    // console.log(profile_details)
  } catch (error) {
    console.error("Failed to fetch profile details:", error);
  }

  return (
    <div>
      <VendorProfile profile_details={profile_details} />
    </div>
  );
}
