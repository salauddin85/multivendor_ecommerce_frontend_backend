'use client';

import React, { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import TiptapEditor from '@/components/editor/TiptapEditorBlog';

// Types
interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

interface BlogData {
  id?: number;
  title: string;
  summary: string;
  content: string;
  category?: { id: number; name: string };
  tags?: { id: number; name: string }[];
  author_name: string;
  featured_image?: string;
}

// Validation schema - Tags is now optional
const blogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  summary: z.string().min(1, 'Summary is required').max(500, 'Summary is too long'),
  content: z.string().min(1, 'Content is required'),
  category: z.coerce.number().min(1, 'Please select a category'),
  tags: z.array(z.coerce.number()).optional(), // Changed from .min(1) to .optional()
  author_name: z.string().min(1, 'Author name is required').max(100, 'Author name is too long'),
  featured_image: z.instanceof(File).optional(),
});

type BlogFormData = z.infer<typeof blogSchema>;

interface BlogPostFormProps {
  blogId?: string;
  initialCategories: Category[];
  initialTags: Tag[];
  initialBlogData: BlogData | null;
}

export default function BlogPostForm({ 
  blogId, 
  initialCategories, 
  initialTags, 
  initialBlogData 
}: BlogPostFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [categories] = useState<Category[]>(initialCategories);
  const [tags] = useState<Tag[]>(initialTags);

  const {
    control,
    handleSubmit,
    register,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema) as any,
    defaultValues: {
      title: '',
      summary: '',
      content: '',
      category: undefined,
      tags: [], // Empty array by default
      author_name: '',
    },
  });

  // Initialize form with blog data if editing
  useEffect(() => {
    if (initialBlogData) {
      const blog = initialBlogData;
      reset({
        title: blog.title || '',
        summary: blog.summary || '',
        content: blog.content || '',
        category: blog.category?.id || undefined,
        tags: blog.tags?.map(tag => tag.id) || [],
        author_name: blog.author_name || '',
      });
      if (blog.featured_image) {
        setExistingImage(blog.featured_image);
      }
    }
  }, [initialBlogData, reset]);

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('featured_image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setExistingImage(null);
    }
  };

  // Handle form submission
  const onSubmit = async (data: BlogFormData) => {
    const formData = new FormData();
    
    // Append all form data
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'featured_image' && value instanceof File) {
        formData.append(key, value);
      } else if (key === 'tags' && Array.isArray(value) && value.length > 0) {
        // Only append tags if there are any selected
        value.forEach(tagId => formData.append('tags', tagId.toString()));
      } else if (key === 'tags' && Array.isArray(value) && value.length === 0) {
        // If no tags selected, you might want to send an empty array or nothing
        // Depending on your API requirements
        formData.append('tags', '');
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    try {
      let response;
      
      if (blogId) {
        // Update existing blog
        response = await axios.patch(`/api/blogs/v1/blogs/${blogId}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });
      } else {
        // Create new blog
        response = await axios.post('/api/blogs/v1/blogs/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });
      }

      if (response.data.code === 200 || response.data.code === 201) {
        toast.success(blogId ? 'Blog updated successfully!' : 'Blog created successfully!');
        router.push('/dashboard/admin/blogs');
        router.refresh();
      }
    } catch (error: any) {
      console.error('Failed to save blog:', error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.entries(errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            toast.error(`${field}: ${messages.join(', ')}`);
          }
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to save blog');
      }
    }
  };

  // Loading state (only for blog data fetching)
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        {blogId ? 'Edit Blog Post' : 'Create New Blog Post'}
      </h1>
      <p className="text-gray-600 mb-8">
        {blogId ? 'Update your existing blog post' : 'Fill in the details to create a new blog post'}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            {...register('title')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="My first post"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Summary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Summary *
          </label>
          <textarea
            {...register('summary')}
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              errors.summary ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Short intro about the blog post"
          />
          {errors.summary && (
            <p className="mt-1 text-sm text-red-600">{errors.summary.message}</p>
          )}
        </div>

        {/* Featured Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Featured Image
          </label>
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
            
            {(imagePreview || existingImage) && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <div className="relative w-full max-w-md h-48">
                  <img
                    src={imagePreview || existingImage || ''}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg border"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <TiptapEditor
                content={field.value}
                onChange={field.onChange}
                error={errors.content?.message}
              />
            )}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        {/* Tags - Now Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <label
                      key={tag.id}
                      className={`inline-flex items-center px-4 py-2 rounded-full border cursor-pointer transition-colors ${
                        field.value?.includes(tag.id)
                          ? 'bg-orange-100 border-orange-500 text-orange-700'
                          : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        value={tag.id}
                        checked={field.value?.includes(tag.id) || false}
                        onChange={(e) => {
                          const currentValue = field.value || [];
                          const newValue = e.target.checked
                            ? [...currentValue, tag.id]
                            : currentValue.filter((id) => id !== tag.id);
                          field.onChange(newValue);
                        }}
                      />
                      {tag.name}
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  Selected: {field.value?.length || 0} tag(s)
                </p>
              </div>
            )}
          />
          {errors.tags && (
            <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>
          )}
        </div>

        {/* Author Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Author Name *
          </label>
          <input
            type="text"
            {...register('author_name')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              errors.author_name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter author name"
          />
          {errors.author_name && (
            <p className="mt-1 text-sm text-red-600">{errors.author_name.message}</p>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : blogId ? 'Update Blog' : 'Create Blog'}
          </button>
        </div>
      </form>
    </div>
  );
}