import axiosInstance from "@/lib/axios";
import { cookies } from "next/headers";
import StoreDetails from "@/components/dashboard/vendor/store/StoreDetails";

export default async function Page() {

  const cookieStore = await cookies();
  const authToken = cookieStore.get("access_token")?.value;

  let store_details = [];

  try {
    const response = await axiosInstance.get(
      "/api/stores/v1/stores/me/",
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    store_details = response.data;
    // console.log(store_details)
  } catch (error) {
    console.error("Failed to fetch store details:", error);
  }

  return (
    <div>
      <StoreDetails store_details={store_details} />
    </div>
  );
}
