import AllCategoryGridImages from "@/components/dashboard/admin/Products/CategoryGridImages/AllCategoryGridImages";
import axiosInstance from "@/lib/axios";
import { cookies } from "next/headers";



export default async function Page() {

  const cookieStore = await cookies();
  const authToken = cookieStore.get("access_token")?.value;


  let category_grid_images = [];

  try {
    const response = await axiosInstance.get(
      `/api/catalog/v1/category_grid_images/`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    category_grid_images = response.data.data;
    // console.log(category_grid_images)
  } catch (error) {
    console.error("Failed to fetch category_grid_images:", error);
  }

  return (
    <div>
      <AllCategoryGridImages category_grid_images={category_grid_images} />
    </div>
  );
}
