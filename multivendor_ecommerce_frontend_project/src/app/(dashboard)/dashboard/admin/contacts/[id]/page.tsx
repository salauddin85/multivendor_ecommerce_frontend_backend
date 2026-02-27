import SingleBlogDetails from "@/components/dashboard/admin/Blogs/SingleBlogDetails";
import axiosInstance from "@/lib/axios";
import { cookies } from "next/headers";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("access_token")?.value;

  const { id } = await params;
  const blogId = id;

  if (!blogId) {
    return <div>No blog ID provided.</div>;
  }

  let single_blog: any = null;

  try {
    const response = await axiosInstance.get(`/api/blogs/v1/blogs/${blogId}/`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    single_blog = response.data;
    console.log(single_blog);
  } catch (error) {
    console.error("Failed to fetch blog:", error);
  }

  return (
    <div>
      {single_blog ? (
        <SingleBlogDetails single_blog={single_blog} />
      ) : (
        <div>Failed to load blog details.</div>
      )}
    </div>
  );
}