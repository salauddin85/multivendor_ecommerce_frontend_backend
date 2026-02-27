'use client'
import React, { useState } from "react";
import { Building2, Edit2, Trash2, Plus, Search, Filter, X, Loader2, Upload, XCircle } from "lucide-react";
import Pagination from "@/components/pagination/Pagination";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Form validation schema for edit
const brandEditSchema = z.object({
  name: z.string()
    .min(2, 'Brand name must be at least 2 characters')
    .max(100, 'Brand name must not exceed 100 characters'),
  display_order: z.union([z.number(), z.string()])
    .optional()
    .nullable()
    .transform((val) => {
      if (val === null || val === undefined || val === '') return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    })
    .refine((val) => val === null || val >= 0, 'Display order must be a positive number'),
  logo: z.any()
    .refine((file) => !file || file instanceof File, 'Please upload a valid image file')
    .refine(
      (file) => !file || (file instanceof File && ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)),
      'Only .jpg, .jpeg, .png and .webp formats are supported'
    )
    .refine(
      (file) => !file || (file instanceof File && file.size <= 5 * 1024 * 1024),
      'File size must be less than 5MB'
    )
    .optional()
    .nullable()
});

type BrandEditFormData = z.infer<typeof brandEditSchema>;

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  brandName,
  isDeleting 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  brandName: string;
  isDeleting: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <div className="bg-white rounded-xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Delete Brand
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            Are you sure you want to delete <span className="font-medium text-slate-800">"{brandName}"</span>? This action cannot be undone.
          </p>
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Edit Brand Modal Component
const EditBrandModal = ({ 
  isOpen, 
  onClose, 
  brand,
  onUpdateSuccess
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  brand: Brand | null;
  onUpdateSuccess: () => void;
}) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(brand?.logo ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${brand.logo}` : null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removeCurrentLogo, setRemoveCurrentLogo] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<BrandEditFormData>({
    resolver: zodResolver(brandEditSchema) as any,
    defaultValues: {
      name: brand?.name || '',
      display_order: brand?.display_order || null,
      logo: null
    }
  });

  // Reset form when brand changes
  React.useEffect(() => {
    if (brand) {
      reset({
        name: brand.name,
        display_order: brand.display_order,
        logo: null
      });
      setLogoPreview(brand.logo ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${brand.logo}` : null);
      setRemoveCurrentLogo(false);
    }
  }, [brand, reset]);

  // Handle logo file change
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('logo', file, { shouldValidate: true });
      setRemoveCurrentLogo(true);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove logo
  const removeLogo = () => {
    setValue('logo', null, { shouldValidate: true });
    setLogoPreview(null);
    setRemoveCurrentLogo(true);
  };

  // Form submission
  const onSubmit = async (data: BrandEditFormData) => {
    if (!brand) return;
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      
      if (data.display_order !== null && data.display_order !== undefined) {
        formData.append('display_order', String(data.display_order));
      }
      
      // Handle logo: if new file uploaded
      if (data.logo instanceof File) {
        formData.append('logo', data.logo);
      }
      // If logo was removed (and no new file uploaded)
      else if (removeCurrentLogo && !data.logo) {
        formData.append('logo', '');
      }

      const response = await axiosInstance.patch(
        `/api/catalog/v1/brands/${brand.slug}/`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200 || response.data?.code === 200) {
        toast.success(`Brand "${data.name}" updated successfully`);
        onUpdateSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error('Error updating brand:', error);
      
      const responseData = error?.response?.data;
      
      if (responseData?.errors) {
        Object.entries(responseData.errors).forEach(([field, messages]: [string, any]) => {
          if (Array.isArray(messages)) {
            messages.forEach((message: string) => {
              toast.error(`${field}: ${message}`);
            });
          } else if (typeof messages === 'string') {
            toast.error(`${field}: ${messages}`);
          }
        });
      } else if (responseData?.message) {
        toast.error(responseData.message);
      } else if (responseData?.detail) {
        toast.error(responseData.detail);
      } else {
        toast.error('Failed to update brand');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !brand) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-white rounded-xl shadow-xl">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">Edit Brand</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <XCircle className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Brand Name Field */}
            <div className="space-y-2">
              <label htmlFor="edit-name" className="block text-sm font-medium text-slate-700">
                Brand Name <span className="text-red-500">*</span>
              </label>
              <input
                id="edit-name"
                type="text"
                {...register('name')}
                placeholder="e.g., Nike, Apple, Samsung"
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors ${
                  errors.name ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Display Order Field */}
            <div className="space-y-2">
              <label htmlFor="edit-display_order" className="block text-sm font-medium text-slate-700">
                Display Order
              </label>
              <input
                id="edit-display_order"
                type="number"
                min="0"
                {...register('display_order')}
                placeholder="e.g., 1, 2, 3"
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors ${
                  errors.display_order ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.display_order && (
                <p className="text-xs text-red-500 mt-1">{errors.display_order.message}</p>
              )}
            </div>

            {/* Logo Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Brand Logo
              </label>
              
              {logoPreview ? (
                <div className="relative inline-block">
                  <div className="relative h-32 w-32 rounded-lg border-2 border-slate-200 overflow-hidden bg-slate-50">
                    <Image
                      src={logoPreview}
                      alt="Logo preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="edit-logo-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors group"
                  >
                    <div className="flex flex-col items-center justify-center pt-4 pb-5">
                      <Upload className="h-6 w-6 text-slate-400 group-hover:text-orange-500 transition-colors" />
                      <p className="mt-2 text-xs text-slate-500 group-hover:text-orange-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-slate-400">
                        PNG, JPG, JPEG, or WebP (MAX. 5MB)
                      </p>
                    </div>
                    <input
                      id="edit-logo-upload"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </label>
                </div>
              )}
              {errors.logo && (
                <p className="text-xs text-red-500">{errors.logo.message as string}</p>
              )}
              {brand?.logo && !removeCurrentLogo && !logoPreview && (
                <p className="text-xs text-amber-600">
                  Current logo will be kept if no new file is uploaded
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Brand'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  display_order: number;
  is_active?: boolean;
}

interface BrandsResponse {
  code: number;
  status: string;
  message: string;
  data: Brand[];
  pagination: {
    count: number;
    total_pages: number;
    current_page: number;
    next: string | null;
    previous: string | null;
    page_size: number;
  };
}

interface AllBrandListProps {
  brands: BrandsResponse;
  onRefresh?: () => void;
}

export default function AllBrandList({ brands, onRefresh }: AllBrandListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'id' | 'order'>('order');
  
  // Delete modal states
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; brandSlug: string | null; brandName: string }>({
    isOpen: false,
    brandSlug: null,
    brandName: ""
  });
  
  // Edit modal states
  const [editModal, setEditModal] = useState<{ isOpen: boolean; brand: Brand | null }>({
    isOpen: false,
    brand: null
  });

  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingBrands, setUpdatingBrands] = useState<Set<number>>(new Set());

  if (!brands || !brands.data) {
    return <div className="text-center py-10">No brands found</div>;
  }

  const { data, pagination } = brands;

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const params = new URLSearchParams(window.location.search);
      params.set('search', searchTerm.trim());
      params.set('page', '1');
      router.push(`?${params.toString()}`);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    const params = new URLSearchParams(window.location.search);
    params.delete('search');
    router.push(`?${params.toString()}`);
  };

  // Filter and sort brands
  const filteredBrands = data
    .filter(brand => 
      !searchTerm || 
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'id':
          return a.id - b.id;
        case 'order':
          return a.display_order - b.display_order;
        default:
          return 0;
      }
    });

  // Handle single brand delete
  const handleDeleteClick = (brandSlug: string, brandName: string) => {
    setDeleteModal({
      isOpen: true,
      brandSlug,
      brandName
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.brandSlug) return;
    
    setIsDeleting(true);
    const brandSlug = deleteModal.brandSlug;
    
    try {
      const response = await axiosInstance.delete(`/api/catalog/v1/brands/${brandSlug}/`);
      
      if (response.status === 204 || response.data?.code === 204) {
        toast.success(`Brand "${deleteModal.brandName}" deleted successfully`);
        
        // Refresh the list
        if (onRefresh) {
          onRefresh();
        } else {
          router.refresh();
          router.push('/dashboard/admin/catalogs/brands');
        }
      }
    } catch (error: any) {
      console.error('Error deleting brand:', error);
      
      const responseData = error?.response?.data;
      
      if (responseData?.detail) {
        toast.error(responseData.detail);
      } else if (responseData?.message) {
        toast.error(responseData.message);
      } else if (responseData?.error) {
        toast.error(responseData.error);
      } else {
        toast.error('Failed to delete brand');
      }
    } finally {
      setIsDeleting(false);
      setDeleteModal({ isOpen: false, brandSlug: null, brandName: "" });
    }
  };

  // Handle brand edit - open modal
  const handleEditClick = (brand: Brand) => {
    setEditModal({
      isOpen: true,
      brand: brand
    });
  };

  // Handle successful update
  const handleUpdateSuccess = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      router.refresh();
    }
  };

  // Render grid view
  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredBrands.map((brand) => {
        const isUpdating = updatingBrands.has(brand.id);
        
        return (
          <div
            key={brand.id}
            className="group relative bg-white rounded-xl border border-slate-200 shadow-sm p-4 transition-all duration-200 hover:shadow-md"
          >
            {/* Status Indicator (if is_active exists) */}
            {brand.is_active !== undefined && (
              <div className="absolute top-3 left-3 z-10">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  brand.is_active 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {brand.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            )}

            {/* Brand Logo */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-24 w-24 rounded-full bg-orange-50 flex items-center justify-center overflow-hidden border-2 border-slate-100">
                {brand.logo ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${brand.logo}`}
                    alt={brand.name}
                    className="h-20 w-20 object-contain p-2"
                    width={80}
                    height={80}
                  />
                ) : (
                  <div className="h-20 w-20 flex items-center justify-center text-orange-600">
                    <Building2 className="h-10 w-10" />
                  </div>
                )}
              </div>

              {/* Brand Info */}
              <div className="w-full">
                <h3 className="font-semibold text-slate-800 text-lg truncate mb-1">
                  {brand.name}
                </h3>
                <p className="text-sm text-slate-500 truncate mb-2">@{brand.slug}</p>
                
                <div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400">ID:</span>
                    <span className="font-medium">{brand.id}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400">Order:</span>
                    <span className="font-medium">{brand.display_order}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-2 w-full pt-2">
                <button 
                  onClick={() => handleEditClick(brand)}
                  disabled={isUpdating}
                  className="flex-1 px-3 py-2 text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Edit2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button 
                  onClick={() => handleDeleteClick(brand.slug, brand.name)}
                  disabled={isUpdating}
                  className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Render list view
  const renderListView = () => (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Brand
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">
              Slug
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
              ID
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">
              Order
            </th>
            {brands.data[0]?.is_active !== undefined && (
              <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Status
              </th>
            )}
            <th className="py-3 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {filteredBrands.map((brand) => {
            const isUpdating = updatingBrands.has(brand.id);
            
            return (
              <tr key={brand.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
                      {brand.logo ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${brand.logo}`}
                          alt={brand.name}
                          className="h-8 w-8 object-contain"
                          width={32}
                          height={32}
                        />
                      ) : (
                        <div className="h-8 w-8 flex items-center justify-center text-orange-600">
                          <Building2 className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-slate-800">{brand.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-600 hidden md:table-cell">
                  <code className="text-sm bg-slate-100 px-2 py-1 rounded">@{brand.slug}</code>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-slate-600">{brand.id}</span>
                </td>
                <td className="py-3 px-4 hidden sm:table-cell">
                  <span className="text-sm text-slate-600">{brand.display_order}</span>
                </td>
                {brand.is_active !== undefined && (
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      brand.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {brand.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                )}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEditClick(brand)}
                      disabled={isUpdating}
                      className="p-1.5 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors disabled:opacity-50"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(brand.slug, brand.name)}
                      disabled={isUpdating}
                      className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, brandSlug: null, brandName: "" })}
        onConfirm={handleDeleteConfirm}
        brandName={deleteModal.brandName}
        isDeleting={isDeleting}
      />

      {/* Edit Brand Modal */}
      <EditBrandModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, brand: null })}
        brand={editModal.brand}
        onUpdateSuccess={handleUpdateSuccess}
      />

      {/* Header */}
      <div className="bg-white rounded-xl border shadow-sm p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Brand Management</h1>
            <p className="text-slate-500 mt-1">
              Manage your product brands and logos
            </p>
          </div>
          <Link href="/dashboard/admin/catalogs/brands/add" >
            <button className="px-5 py-2.5 rounded-lg text-white bg-orange-500 hover:bg-orange-600 transition font-medium flex items-center justify-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Brand
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
            <p className="text-sm text-orange-700 font-medium">Total Brands</p>
            <p className="text-2xl font-bold text-slate-800">{pagination.count}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-600">With Logo</p>
            <p className="text-2xl font-bold text-slate-800">
              {data.filter(brand => brand.logo).length}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-600">Without Logo</p>
            <p className="text-2xl font-bold text-slate-800">
              {data.filter(brand => !brand.logo).length}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-600">Active</p>
            <p className="text-2xl font-bold text-slate-800">
              {data.filter(brand => brand.is_active !== false).length}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border shadow-sm p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg">
            <div className="relative">
              <input
                type="text"
                placeholder="Search brands by name or slug..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </form>

          {/* View Controls */}
          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-3 pr-8 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white text-sm"
              >
                <option value="order">Sort by Order</option>
                <option value="name">Sort by Name</option>
                <option value="id">Sort by ID</option>
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>

            {/* View Toggle */}
            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Brands Content */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="border-b px-5 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-700 tracking-wide uppercase">
              {viewMode === 'grid' ? 'Brand Cards' : 'Brand List'}
            </h2>
            <p className="text-xs text-slate-500">
              Showing {filteredBrands.length} of {pagination.count} brands
            </p>
          </div>
        </div>
        
        <div className="p-5">
          {filteredBrands.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-slate-400 mb-3">
                <Building2 className="h-16 w-16 mx-auto" />
              </div>
              <p className="text-slate-600 text-lg font-medium mb-2">No brands found</p>
              <p className="text-slate-500 mb-4">
                {searchTerm ? `No brands matching "${searchTerm}"` : 'Add your first brand to get started'}
              </p>
              {searchTerm ? (
                <button
                  onClick={clearSearch}
                  className="text-orange-500 hover:text-orange-600 font-medium"
                >
                  Clear search
                </button>
              ) : (
                <Link href="/dashboard/admin/catalogs/brands/add">
                  <button className="px-5 py-2.5 rounded-lg text-white bg-orange-500 hover:bg-orange-600 transition font-medium inline-flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Brand
                  </button>
                </Link>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            renderGridView()
          ) : (
            <div className="overflow-x-auto">
              {renderListView()}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <Pagination paginationData={pagination} />
        </div>
      )}
    </div>
  );
}