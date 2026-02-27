// app/blog/page.tsx

import AllBlogs from "@/components/blogs/AllBlogs";
import axiosInstance from "@/lib/axios";
import { BlogsApiResponse } from "@/types/blog";

type PageProps = {
  searchParams?: {
    page?: string;
  };
};

export default async function AllBlogsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;

  let blogs: BlogsApiResponse = {
    code: 200,
    message: "",
    status: "success",
    data: [],
    pagination: {
      count: 0,
      total_pages: 0,
      current_page: 1,
      next: null,
      previous: null,
      page_size: 12,
    },
  };

  try {
    const blogResponse = await axiosInstance.get<BlogsApiResponse>(
      `/api/blogs/v1/blogs/?page_size=12&page=${currentPage}`
    );

    blogs = blogResponse.data;
  } catch (err) {
    console.error(err);
  }

  return <AllBlogs blogs={blogs} />;
}