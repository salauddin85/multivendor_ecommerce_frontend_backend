import AllBlogsList from "@/components/dashboard/admin/Blogs/AllBlogsList";
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


  let blogs_list = [];

  try {
    const response = await axiosInstance.get(
      `/api/blogs/v1/blogs/?page_size=20&page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    blogs_list = response.data;
    // console.log(blogs_list)
  } catch (error) {
    console.error("Failed to fetch blogs list:", error);
  }

  return (
    <div>
      <AllBlogsList blogs_list={blogs_list} />
    </div>
  );
}
