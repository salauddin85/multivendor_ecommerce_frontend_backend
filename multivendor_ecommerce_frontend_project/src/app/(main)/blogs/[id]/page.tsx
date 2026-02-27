import React from "react";
import { Metadata } from "next";
import axiosInstance from "@/lib/axios";
import { BlogDetailApiResponse } from "@/types/blog";
import BlogDetail from "@/components/blogs/BlogDetail";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const response = await axiosInstance.get<BlogDetailApiResponse>(
      `/api/blogs/v1/blogs/${id}/`,
    );
    const blog = response.data.data;

    return {
      title: `${blog.title} | TalenTracker Limited`,
      description: blog.summary,
      openGraph: {
        title: blog.title,
        description: blog.summary,
        images: blog.featured_image
          ? [`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${blog.featured_image}`]
          : [],
      },
    };
  } catch (error) {
    return {
      title: "Blog Detail | TalenTracker Limited",
    };
  }
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { id } = await params;
  let blog = null;
  try {
    const response = await axiosInstance.get<BlogDetailApiResponse>(
      `/api/blogs/v1/blogs/${id}/`,
    );
     blog = response.data.data;

  } catch (error) {
    blog=null
    console.log(error);
  }

  if (!blog) {
    notFound();
  }

  return <BlogDetail blog={blog} />;
}
