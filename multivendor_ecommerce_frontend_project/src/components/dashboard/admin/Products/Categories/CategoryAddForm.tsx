"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import {
  Plus,
  Edit2,
  Check,
  X,
  Loader2,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import Image from "next/image";
import { useCategoryStore, CategoryFormData } from "@/store/catalog_store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

type CategoryAddFormProps = {
  category_id?: string;
};

interface CategoryOption {
  id: number;
  name: string;
  slug: string;
}

export default function CategoryAddForm({ category_id }: CategoryAddFormProps) {
  const router = useRouter();
  const { editingCategory, clearEditingCategory, isLoading, setIsLoading } =
    useCategoryStore();

  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    parent_id: null,
    icon: null,
    display_order: 0,
    is_active: true,
  });

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);

  // Load all categories for parent selection
  useEffect(() => {
    fetchCategories();

    // If there's editingCategory in store, populate the form
    if (editingCategory) {
      setFormData(editingCategory);
      if (typeof editingCategory.icon === "string" && editingCategory.icon) {
        setIconPreview(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${editingCategory.icon}`,
        );
      }
    }
  }, [editingCategory]);

  // If it's edit mode but no data in store, fetch from API
  useEffect(() => {
    if (category_id && !editingCategory) {
      fetchCategoryById(category_id);
    }
  }, [category_id, editingCategory]);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("/api/catalog/v1/categories/");
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchCategoryById = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        `/api/catalog/v1/categories/${id}/`,
      );
      const category = response.data.data;

      setFormData({
        id: category.id,
        name: category.name,
        slug: category.slug,
        parent_id: category.parent?.id || null,
        icon: category.icon,
        display_order: category.display_order,
        is_active: true,
      });

      if (category.icon) {
        setIconPreview(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${category.icon}`,
        );
      }
    } catch (error) {
      console.error("Failed to fetch category:", error);
      toast.error("Failed to load category");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "display_order" ? parseInt(value) || 0 : value,
    }));

    // Auto-generate slug
    if (name === "name" && !formData.id) {
      generateSlug(value);
    }
  };

  const generateSlug = async (name: string) => {
    if (!name.trim() || isGeneratingSlug) return;

    setIsGeneratingSlug(true);
    try {
      // Simple slug generation (you can adjust as needed)
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      setFormData((prev) => ({ ...prev, slug }));
    } catch (error) {
      console.error("Failed to generate slug:", error);
    } finally {
      setIsGeneratingSlug(false);
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, icon: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeIcon = () => {
    setFormData((prev) => ({ ...prev, icon: null }));
    setIconPreview(null);
  };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.name.trim()) {
    toast.error("Category name is required");
    return;
  }

  if (!formData.slug.trim()) {
    toast.error("Slug is required");
    return;
  }

  setIsLoading(true);

  try {
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("slug", formData.slug);
    formDataToSend.append("display_order", formData.display_order.toString());
    formDataToSend.append("is_active", formData.is_active.toString());

    if (formData.parent_id) {
      formDataToSend.append("parent", formData.parent_id.toString());
    }

    if (formData.icon instanceof File) {
      formDataToSend.append("icon", formData.icon);
    } else if (typeof formData.icon === "string" && formData.icon) {
      // For edit mode, don't send the icon if it's unchanged
      // Only send if it's a new file or null
    }

    console.log("form data to send:", formDataToSend);
    let response;
    
    if (formData.id) {
      // Update operation - FIX: Use the original slug from editingCategory or formData.id
      // The issue might be that the slug changed, so we need the original slug for the URL
      const originalSlug = editingCategory?.slug || formData.slug;
      
      response = await axiosInstance.patch(
        `/api/catalog/v1/categories/${originalSlug}/`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      toast.success("Category updated successfully");
    } else {
      // Create operation
      response = await axiosInstance.post(
        "/api/catalog/v1/categories/",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      toast.success("Category created successfully");
    }

    // Clear store and form
    clearEditingCategory();
    resetForm();

    // Navigate back to categories list
    router.push("/dashboard/admin/catalogs/categories");
  } catch (error: any) {
    console.error("Error saving category:", error);

    const responseData = error?.response?.data;

    if (responseData?.errors) {
      // DRF field-wise errors
      Object.entries(responseData.errors).forEach(
        ([field, messages]: [string, any]) => {
          if (Array.isArray(messages)) {
            messages.forEach((message: string) => {
              toast.error(`${field}: ${message}`);
            });
          } else if (typeof messages === "string") {
            toast.error(`${field}: ${messages}`);
          }
        },
      );
    } else if (responseData?.message) {
      // General error message from backend
      toast.error(responseData.message);
    } else {
      toast.error("Failed to save category");
    }
  } finally {
    setIsLoading(false);
  }
};

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      parent_id: null,
      icon: null,
      display_order: 0,
      is_active: true,
    });
    setIconPreview(null);
  };

  const handleCancel = () => {
    clearEditingCategory();
    router.push("/dashboard/admin/catalogs/categories");
  };

  if (isLoading && category_id && !editingCategory) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    // REMOVED: container mx-auto p-4 md:p-6 max-w-4xl
    // ADDED: Proper padding and layout that won't conflict with sidebar
    <div className="container  mx-auto p-4 md:p-6 lg:p-8 w-full max-w-4xl">
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-white border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-slate-800">
                {formData.id ? "Edit Category" : "Add New Category"}
              </CardTitle>
              <CardDescription className="text-slate-600 mt-2">
                {formData.id
                  ? `Editing: ${formData.name}`
                  : "Create a new product category"}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-slate-300  self-start sm:self-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="pt-6 space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 flex items-center">
                <Edit2 className="h-5 w-5 mr-2 text-orange-500" />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700">
                    Category Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Electronics, Clothing"
                    className="focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                  <p className="text-xs text-slate-500">
                    The name of your category as it will appear on your store
                  </p>
                </div>

                {/* Slug Field */}
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-slate-700">
                    Slug *
                  </Label>
                  <div className="relative">
                    <Input
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="e.g., electronics, clothing"
                      className="focus:ring-orange-500 focus:border-orange-500 pr-10"
                      required
                    />
                    {isGeneratingSlug && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    URL-friendly version of the name (auto-generated)
                  </p>
                </div>

                {/* Parent Category */}
                <div className="space-y-2">
                  <Label htmlFor="parent_id" className="text-slate-700">
                    Parent Category
                  </Label>
                  <Select
                    value={formData.parent_id?.toString() || "null"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        parent_id: value === "null" ? null : parseInt(value),
                      }))
                    }
                  >
                    <SelectTrigger className="focus:ring-orange-500 focus:border-orange-500">
                      <SelectValue placeholder="Select parent category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">None (Root Category)</SelectItem>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    Leave empty to create a root category
                  </p>
                </div>

                {/* Display Order */}
                <div className="space-y-2">
                  <Label htmlFor="display_order" className="text-slate-700">
                    Display Order
                  </Label>
                  <Input
                    id="display_order"
                    name="display_order"
                    type="number"
                    min="0"
                    value={formData.display_order}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="focus:ring-orange-500 focus:border-orange-500"
                  />
                  <p className="text-xs text-slate-500">
                    Lower numbers appear first
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Icon Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 flex items-center">
                <ImageIcon className="h-5 w-5 mr-2 text-orange-500" />
                Category Icon
              </h3>

              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                {/* Icon Preview */}
                <div className="flex-shrink-0">
                  <div className="h-32 w-32 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
                    {iconPreview ? (
                      <div className="relative w-full h-40 border rounded-lg overflow-hidden bg-slate-50">
                      <Image
                        src={iconPreview}
                        alt="Category icon"
                        className="w-full h-full object-contain p-2"
                        width={160}
                        height={160}
                      />
                        <button
                          type="button"
                          onClick={removeIcon}
                          className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">
                          No icon selected
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Area */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700">Upload Icon</Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                      <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm text-slate-600 mb-2">
                        Drag & drop your icon here, or click to browse
                      </p>
                      <Input
                        id="icon"
                        type="file"
                        accept="image/*"
                        onChange={handleIconChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("icon")?.click()}
                        className="border-orange-300 text-orange-600"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Select File
                      </Button>
                      <p className="text-xs text-slate-500 mt-3">
                        Recommended: 256x256px PNG, JPG or SVG (Max 2MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Status Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-700 flex items-center">
                <Check className="h-5 w-5 mr-2 text-orange-500" />
                Status & Settings
              </h3>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="space-y-1">
                  <Label
                    htmlFor="is_active"
                    className="text-slate-700 font-medium"
                  >
                    Category Status
                  </Label>
                  <p className="text-sm text-slate-600">
                    {formData.is_active
                      ? "Category is visible to customers"
                      : "Category is hidden from customers"}
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_active: checked }))
                  }
                  className="data-[state=checked]:bg-orange-500"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-slate-50 border-t px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isLoading}
                className="border-slate-300 text-slate-700 "
              >
                Reset Form
              </Button>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="border-slate-300 text-slate-700 "
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {formData.id ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      {formData.id ? (
                        <>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Update Category
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Category
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* Form Guidelines */}
      <Card className="mt-6 shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-700">
            📋 Form Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start">
              <div className="h-2 w-2 bg-orange-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
              <span>Fields marked with * are required</span>
            </li>
            <li className="flex items-start">
              <div className="h-2 w-2 bg-orange-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
              <span>Slug will be auto-generated from the category name</span>
            </li>
            <li className="flex items-start">
              <div className="h-2 w-2 bg-orange-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
              <span>
                Parent category is optional - leave empty for root categories
              </span>
            </li>
            <li className="flex items-start">
              <div className="h-2 w-2 bg-orange-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
              <span>Display order determines the sorting sequence</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
