import AllCategoriesList from "@/components/dashboard/admin/Blogs/AllCategoriesList";
import axiosInstance from "@/lib/axios";
import { cookies } from "next/headers";
import axios from "@/lib/axios";

export default async function Page() {

  const cookieStore = await cookies();
  const authToken = cookieStore.get("access_token")?.value;



  let categories_list = [];

  try {
    const response = await axiosInstance.get(
      `/api/blogs/v1/categories/`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    categories_list = response.data;
    // console.log(categories_list)
  } catch (error) {
    console.error("Failed to fetch categories list:", error);
  }

  return (
    <div>
      <AllCategoriesList categories_list={categories_list} />
    </div>
  );
}
