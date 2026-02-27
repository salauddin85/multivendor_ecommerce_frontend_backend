"use client";

import React, { useState, useMemo } from "react";
import Pagination from "@/components/pagination/Pagination";
import {
  Search,
  Filter,
  Calendar,
  User,
  MoreVertical,
  FileEdit,
  Trash2,
  Eye,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Blog {
  id: number;
  title: string;
  author_name: string;
  featured_image: string;
  summary: string;
  created_at: string;
}

interface PaginationData {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | boolean | null;
  previous: string | boolean | null;
  page_size: number;
}

interface BlogsResponse {
  code: number;
  message: string;
  status: string;
  data: Blog[];
  pagination: PaginationData;
}

export default function AllBlogsList({
  blogs_list,
}: {
  blogs_list: BlogsResponse;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [blogs, setBlogs] = useState<Blog[]>(blogs_list.data);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    blogId: null as number | null,
    blogTitle: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Extract unique authors for filter
  const authors = useMemo(() => {
    const uniqueAuthors = Array.from(
      new Set(blogs.map((blog) => blog.author_name)),
    );
    return [
      "All Authors",
      ...uniqueAuthors.filter((author) => author && author.trim() !== ""),
    ];
  }, [blogs]);

  // Filter and sort blogs
  const filteredBlogs = useMemo(() => {
    let filtered = blogs.filter((blog) => {
      const matchesSearch =
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesAuthor =
        selectedAuthor === "all" ||
        blog.author_name === selectedAuthor ||
        (selectedAuthor === "All Authors" && blog.author_name);

      return matchesSearch && matchesAuthor;
    });

    // Sort blogs
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === "newest"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

    return filtered;
  }, [blogs, searchQuery, selectedAuthor, sortOrder]);

  // Handle delete click
  const handleDeleteClick = (blog: Blog) => {
    setDeleteDialog({
      isOpen: true,
      blogId: blog.id,
      blogTitle: blog.title,
    });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.blogId) return;

    setIsDeleting(true);
    try {
      const response = await axiosInstance.delete(
        `/api/blogs/v1/blogs/${deleteDialog.blogId}/`,
        {
          withCredentials: true,
        }
      );

      // Check response status
      if (response.status === 204 || response.data?.code === 204) {
        // Remove deleted blog from state
        setBlogs(prevBlogs => 
          prevBlogs.filter(blog => blog.id !== deleteDialog.blogId)
        );
        
        toast.success('Blog deleted successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
        
        // Close dialog
        setDeleteDialog({ isOpen: false, blogId: null, blogTitle: "" });
      }
    } catch (error: any) {
      console.error("Failed to delete blog:", error);
      
      // Handle different error scenarios
      if (error.response) {
        const { status, data } = error.response;
        
        // Handle 404 Not Found
        if (status === 404) {
          toast.error(data?.message || 'Blog not found', {
            position: "top-right",
            autoClose: 5000,
          });
          
          // Show field-specific errors if available
          if (data?.errors?.not_found) {
            data.errors.not_found.forEach((msg: string) => {
              toast.error(msg, {
                position: "top-right",
                autoClose: 5000,
              });
            });
          }
        }
        // Handle 500 Internal Server Error
        else if (status === 500) {
          toast.error('Server error occurred', {
            position: "top-right",
            autoClose: 5000,
          });
          
          // Show server error details
          if (data?.errors?.server_error) {
            data.errors.server_error.forEach((msg: string) => {
              toast.error(msg, {
                position: "top-right",
                autoClose: 5000,
              });
            });
          }
        }
        // Handle other errors
        else {
          toast.error(data?.message || 'Failed to delete blog', {
            position: "top-right",
            autoClose: 5000,
          });
          
          // Show any field-specific errors
          if (data?.errors) {
            Object.entries(data.errors).forEach(([field, messages]) => {
              if (Array.isArray(messages)) {
                messages.forEach((msg: string) => {
                  toast.error(`${field}: ${msg}`, {
                    position: "top-right",
                    autoClose: 5000,
                  });
                });
              }
            });
          }
        }
      } else if (error.request) {
        // Network error
        toast.error('Network error. Please check your connection.', {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        // Other errors
        toast.error('An unexpected error occurred', {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Truncate summary
  const truncateSummary = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteDialog.isOpen} 
        onOpenChange={(open) => !open && setDeleteDialog({ isOpen: false, blogId: null, blogTitle: "" })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete the blog post:{" "}
              <span className="font-semibold text-red-600">
                {deleteDialog.blogTitle}
              </span>
              <br />
              This action cannot be undone. This will permanently delete the
              blog post and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Blog Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage and organize all your blog posts
              </p>
            </div>

            <Link href="/dashboard/admin/blogs/post">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create Blog
              </Button>
            </Link>
          </div>

          {/* Stats Cards - Update total blogs count */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Blogs</p>
                    <p className="text-2xl font-bold">
                      {blogs.length}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <FileEdit className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Pages</p>
                    <p className="text-2xl font-bold">
                      {blogs_list.pagination.total_pages}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FileEdit className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Unique Authors</p>
                    <p className="text-2xl font-bold">{authors.length - 1}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <User className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Current Page</p>
                    <p className="text-2xl font-bold">
                      {blogs_list.pagination.current_page}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Calendar className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search blogs by title or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by author" />
                </SelectTrigger>
                <SelectContent>
                  {authors.map((author, index) => (
                    <SelectItem
                      key={index}
                      value={author === "All Authors" ? "all" : author}
                    >
                      {author || "Unknown Author"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold">{filteredBlogs.length}</span> of{" "}
              <span className="font-semibold">
                {blogs.length}
              </span>{" "}
              blogs
            </p>

            <Badge
              variant="outline"
              className="bg-orange-50 text-orange-500 border-orange-200"
            >
              <Filter className="h-3 w-3 mr-1" />
              Filtered
            </Badge>
          </div>
        </div>

        {/* Blogs Grid */}
        {filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredBlogs.map((blog) => (
              <Card
                key={blog.id}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative aspect-video bg-gray-200">
                  {blog.featured_image ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${blog.featured_image}`}
                      alt={blog.title}
                      className="object-cover"
                      fill
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50">
                      <FileEdit className="h-12 w-12 text-orange-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm"
                        >
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          <Link href={`/blogs/${blog.id}/`} target="__blank">
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileEdit className="mr-2 h-4 w-4" />
                          <Link href={`/dashboard/admin/blogs/post/?blog_id=${blog.id}`}>
                            Edit Blog
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600 cursor-pointer"
                          onClick={() => handleDeleteClick(blog)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Badge
                      variant="secondary"
                      className="bg-orange-100 text-orange-600 hover:bg-orange-100"
                    >
                      Blog ID: {blog.id}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(blog.created_at)}
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-2 line-clamp-1 hover:text-orange-600 transition-colors">
                    {blog.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {truncateSummary(blog.summary)}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {blog.author_name || "Unknown Author"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg border">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <FileEdit className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No blogs found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedAuthor !== "all"
                ? "Try adjusting your search or filter to find what you're looking for."
                : "Start by creating your first blog post."}
            </p>
            <Link href="/dashboard/admin/blogs/post">
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Blog
              </Button>
            </Link>
          </div>
        )}

        {/* Pagination */}
        {filteredBlogs.length > 0 && blogs_list.pagination.total_pages > 1 && (
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-center">
              <div className="mt-3">
                <Pagination paginationData={blogs_list.pagination} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}