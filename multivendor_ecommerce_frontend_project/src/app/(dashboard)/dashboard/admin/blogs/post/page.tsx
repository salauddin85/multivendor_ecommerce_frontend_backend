import React, { Suspense } from 'react';
import BlogPostForm from '@/components/dashboard/admin/Blogs/BlogPostForm';
import BlogFormSkeleton from '@/components/dashboard/admin/Blogs/BlogFormSkeleton';
import axios from '@/lib/axios';
import { cookies } from 'next/headers';

interface PageProps {
  searchParams: Promise<{
    blog_id?: string;
  }>;
}

/* ---------------- Server Data Fetchers ---------------- */

async function fetchCategoriesAndTags() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('access_token')?.value;

  try {
    const [categoriesResponse, tagsResponse] = await Promise.all([
      axios.get('/api/blogs/v1/categories/', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }),
      axios.get('/api/blogs/v1/tags/', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }),
    ]);

    return {
      categories:
        categoriesResponse.data.code === 200
          ? categoriesResponse.data.data
          : [],
      tags:
        tagsResponse.data.code === 200
          ? tagsResponse.data.data
          : [],
    };
  } catch (error) {
    console.error('Failed to fetch categories and tags:', error);
    return {
      categories: [],
      tags: [],
    };
  }
}

async function fetchBlogData(blogId: string) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('access_token')?.value;

  try {
    const response = await axios.get(`/api/blogs/v1/blogs/${blogId}/`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return response.data.code === 200 ? response.data.data : null;
  } catch (error) {
    console.error('Failed to fetch blog:', error);
    return null;
  }
}

/* ---------------- Page Component ---------------- */

export default async function Page({ searchParams }: PageProps) {
  const { blog_id } = await searchParams;

  // Fetch categories and tags
  const { categories, tags } = await fetchCategoriesAndTags();

  // Fetch blog if editing
  let blogData = null;
  if (blog_id) {
    blogData = await fetchBlogData(blog_id);
  }

  return (
    <div>
      <Suspense fallback={<BlogFormSkeleton />}>
        <BlogPostForm
          blogId={blog_id}
          initialCategories={categories}
          initialTags={tags}
          initialBlogData={blogData}
        />
      </Suspense>
    </div>
  );
}
