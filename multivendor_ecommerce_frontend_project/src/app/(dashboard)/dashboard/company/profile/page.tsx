import axiosInstance from "@/lib/axios";
import { cookies } from "next/headers";
import VendorProfile from "@/components/dashboard/vendor/profile/VendorProfile";
import CompanyProfile from "@/components/dashboard/company/profile/CompanyProfile";

export default async function Page() {

  const cookieStore = await cookies();
  const authToken = cookieStore.get("access_token")?.value;

  let profile_details = [];

  try {
    const response = await axiosInstance.get(
      "/api/company_dashboard/v1/companies/profile/me/",
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
      <CompanyProfile profile_details={profile_details} />
    </div>
  );
}
