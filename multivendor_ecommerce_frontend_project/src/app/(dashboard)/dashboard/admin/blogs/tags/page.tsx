import AllCategoriesList from "@/components/dashboard/admin/Blogs/AllCategoriesList";
import axiosInstance from "@/lib/axios";
import { cookies } from "next/headers";
import axios from "@/lib/axios";
import AllTagsList from "@/components/dashboard/admin/Blogs/AllTagsList";

export default async function Page() {

  const cookieStore = await cookies();
  const authToken = cookieStore.get("access_token")?.value;



  let tags_list = [];

  try {
    const response = await axiosInstance.get(
      `/api/blogs/v1/tags/`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    tags_list = response.data;
    // console.log(tags_list)
  } catch (error) {
    console.error("Failed to fetch tags list:", error);
  }

  return (
    <div>
      <AllTagsList tags_list={tags_list} />
    </div>
  );
}
