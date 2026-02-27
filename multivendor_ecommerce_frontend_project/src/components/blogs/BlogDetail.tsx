"use client";

import { BlogDetail as BlogDetailType } from "@/types/blog";
import { Calendar, User, Tag } from "lucide-react";
import Image from "next/image";

interface BlogDetailProps {
  blog: BlogDetailType;
}

export default function BlogDetail({ blog }: BlogDetailProps) {
  const formatBDTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString("en-BD", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const imageUrl = blog.featured_image
    ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${blog.featured_image}`
    : "/images/blog/blog1.jpg";

  return (
    <div className="blog-details-area ptb-100 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto">
          <article className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* Featured Image */}
            <div className="relative h-[400px] md:h-[500px] w-full">
              <Image
                src={imageUrl}
                alt={blog.title}
                className="w-full h-full object-cover"
                fill
              />
              <div className="absolute top-6 left-6">
                <span className="bg-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                  {blog.category}
                </span>
              </div>
            </div>

            <div className="p-6 md:p-12">
              {/* Meta Info */}
              <div className="flex flex-wrap gap-6 mb-8 text-sm text-gray-500 border-b border-gray-100 pb-8">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-gray-900">{blog.author_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <span>{formatBDTime(blog.created_at)}</span>
                </div>
                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-orange-600" />
                    <div className="flex gap-2">
                      {blog.tags.map((tag, index) => (
                        <span key={index} className="text-gray-600">
                          #{tag}{index < blog.tags.length - 1 ? "," : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-8 leading-tight">
                {blog.title}
              </h1>

              {/* Summary */}
              {blog.summary && (
                <p className="text-xl text-gray-600 mb-10 italic border-l-4 border-orange-600 pl-6 py-2 bg-orange-50/30">
                  {blog.summary}
                </p>
              )}

              {/* Content */}
              <div 
                className="blog-content-wrapper max-w-none text-gray-700 leading-relaxed space-y-6"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />

              <style jsx global>{`
                .blog-content-wrapper p {
                  margin-bottom: 1.5rem;
                  font-size: 1.125rem;
                  line-height: 1.8;
                }
                .blog-content-wrapper h2 {
                  font-size: 1.875rem;
                  font-weight: 700;
                  margin-top: 2.5rem;
                  margin-bottom: 1.25rem;
                  color: #111827;
                }
                .blog-content-wrapper h3 {
                  font-size: 1.5rem;
                  font-weight: 600;
                  margin-top: 2rem;
                  margin-bottom: 1rem;
                  color: #111827;
                }
                .blog-content-wrapper ul {
                  list-style-type: disc;
                  padding-left: 1.5rem;
                  margin-bottom: 1.5rem;
                }
                .blog-content-wrapper ol {
                  list-style-type: decimal;
                  padding-left: 1.5rem;
                  margin-bottom: 1.5rem;
                }
                .blog-content-wrapper li {
                  margin-bottom: 0.5rem;
                }
                .blog-content-wrapper img {
                  border-radius: 1rem;
                  margin: 2rem 0;
                  max-width: 100%;
                  height: auto;
                  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
                .blog-content-wrapper a {
                  color: #ea580c;
                  text-decoration: underline;
                  font-weight: 500;
                }
                .blog-content-wrapper blockquote {
                  border-left: 4px solid #ea580c;
                  padding-left: 1.5rem;
                  font-style: italic;
                  color: #4b5563;
                  margin: 2rem 0;
                }
              `}</style>

              {/* Footer Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Tags:</span>
                    {blog.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-orange-100 hover:text-orange-600 transition-colors cursor-default"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
