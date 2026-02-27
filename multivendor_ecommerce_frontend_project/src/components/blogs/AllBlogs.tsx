"use client";

import React from "react";
import Link from "next/link";
import Pagination from "@/components/pagination/Pagination";
import { BlogsApiResponse } from "@/types/blog";
import { Calendar, User, ArrowRight } from "lucide-react";
import Image from "next/image";

interface AllBlogsProps {
  blogs: BlogsApiResponse;
}

export default function AllBlogs({ blogs }: AllBlogsProps) {
  const blogList = blogs?.data || [];
  const pagination = blogs?.pagination;

  // Transform pagination data to match Pagination component's expected format
  const transformedPagination = pagination ? {
    count: pagination.count,
    current_page: pagination.current_page,
    total_pages: pagination.total_pages,
    next: pagination.next !== null ? true : null,
    previous: pagination.previous !== null ? true : null,
    page_size: pagination.page_size,
  } : null;

  const formatBDTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString("en-BD", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (blogList.length === 0) {
    return (
      <div className="blog-area ptb-100 bg-gray-50 min-h-[400px] flex items-center justify-center">
        <div className="container">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-600">No blogs found</h3>
            <p className="text-gray-400 mt-2">Check back later for more updates.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-area ptb-100 bg-gray-50/50">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16 max-w-2xl mx-auto pt-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Our Latest <span className="text-orange-600">Insights</span>
          </h2>
          <div className="h-1.5 w-24 bg-orange-600 mx-auto rounded-full mb-6"></div>
          <p className="text-gray-600 text-lg">
            Stay updated with the latest trends, guides, and stories from our expert team.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 my-20">
          {blogList.map((post) => (
            <div key={post.id} className="group h-full">
              <div className="single-blog-post bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden h-full flex flex-col border border-gray-100">
                
                {/* Image Section with Zoom Effect */}
                <div className="post-image relative h-56 w-full overflow-hidden">
                  <Link href={`/blogs/${post.id}`} className="block w-full h-full">
                    <Image
                      src={
                        post.featured_image
                          ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${post.featured_image}`
                          : "/images/blog/blog1.jpg"
                      }
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                      fill
                    />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </Link>
                </div>

                {/* Content Section */}
                <div className="post-content p-6 flex-grow flex flex-col">
                  {/* Meta Information */}
                  <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-orange-600 mb-4">
                    <span className="flex items-center gap-1.5 bg-orange-50 px-2.5 py-1 rounded-md">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatBDTime(post.created_at)}
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <User className="w-3.5 h-3.5" />
                      {post.author_name}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-3 leading-snug">
                    <Link 
                      href={`/blogs/${post.id}`} 
                      className="text-gray-900 hover:text-orange-600 transition-colors duration-300 line-clamp-2"
                    >
                      {post.title}
                    </Link>
                  </h3>

                  {/* Summary */}
                  <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {post.summary}
                  </p>

                  {/* Read More Link */}
                  <div className="mt-auto pt-4">
                    <Link 
                      href={`/blogs/${post.id}`} 
                      className="inline-flex items-center gap-2 text-sm font-bold bg-orange-600 text-white px-6 py-2.5 rounded-xl hover:bg-orange-700 transition-all duration-300 uppercase tracking-widest shadow-sm hover:shadow-orange-200 hover:shadow-lg group/btn active:scale-[0.98]"
                    >
                      Read Story
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Section */}
        {transformedPagination && transformedPagination.total_pages > 1 && (
          <div className="mt-16 flex justify-center">
            <Pagination paginationData={transformedPagination} />
          </div>
        )}
      </div>
    </div>
  );
}
