import AllCarousalImages from "@/components/dashboard/admin/Products/CarousalImages/AllCarousalImages";
import AllCategoryGridImages from "@/components/dashboard/admin/Products/CategoryGridImages/AllCategoryGridImages";
import axiosInstance from "@/lib/axios";
import { cookies } from "next/headers";



export default async function Page() {

  const cookieStore = await cookies();
  const authToken = cookieStore.get("access_token")?.value;


  let carousal_images = [];

  try {
    const response = await axiosInstance.get(
      `/api/catalog/v1/carousel_images/`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    carousal_images = response.data.data;
    // console.log(carousal_images)
  } catch (error) {
    console.error("Failed to fetch carousal_images:", error);
  }

  return (
    <div>
      <AllCarousalImages carousal_images={carousal_images} />
    </div>
  );
}
