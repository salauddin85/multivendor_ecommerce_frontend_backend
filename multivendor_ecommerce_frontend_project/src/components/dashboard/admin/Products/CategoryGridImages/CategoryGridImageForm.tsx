'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { toast } from 'react-toastify';

interface FormData {
  category_id: string;
  display_order: string;
  image: File | null;
}

interface FormErrors {
  category_id?: string;
  display_order?: string;
  image?: string;
  general?: string;
}

export default function CategoryGridImagesForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    category_id: '',
    display_order: '',
    image: null,
  });
  
  // Preview state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Errors state (kept for inline validation, but we'll use toast for display)
  const [errors, setErrors] = useState<FormErrors>({});

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear image error
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: undefined }));
      }
    }
  };

  // Remove selected image
  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.category_id) {
      newErrors.category_id = 'Category ID is required';
      toast.error('Category ID is required');
    } else if (!/^\d+$/.test(formData.category_id)) {
      newErrors.category_id = 'Category ID must be a number';
      toast.error('Category ID must be a number');
    }

    if (!formData.display_order) {
      newErrors.display_order = 'Display order is required';
      toast.error('Display order is required');
    } else if (!/^\d+$/.test(formData.display_order)) {
      newErrors.display_order = 'Display order must be a number';
      toast.error('Display order must be a number');
    }

    if (!formData.image) {
      newErrors.image = 'Image is required';
      toast.error('Image is required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    // Create FormData for multipart/form-data
    const submitFormData = new FormData();
    submitFormData.append('category', formData.category_id);
    submitFormData.append('display_order', formData.display_order);
    if (formData.image) {
      submitFormData.append('image', formData.image);
    }

    try {
      const response = await axiosInstance.post('/api/catalog/v1/category_grid_images/', submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Show success toast
      toast.success(response.data.message || 'Category grid image added successfully!');
      
      // Reset form
      setFormData({
        category_id: '',
        display_order: '',
        image: null,
      });
      setImagePreview(null);
      
      // Reset file input
      const fileInput = document.getElementById('image') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/admin/catalogs/category_grid_images/');
        router.refresh();
      }, 2000);

    } catch (error: any) {
      console.error('Failed to add category grid image:', error);
      
      // Handle API validation errors based on your serializer structure
      if (error.response?.data) {
        const apiResponse = error.response.data;
        
        // Check if it's a validation error (400) with errors object
        if (error.response.status === 400 && apiResponse.errors) {
          const apiErrors = apiResponse.errors;
          
          // Show each validation error in a toast
          Object.entries(apiErrors).forEach(([field, fieldErrors]) => {
            if (Array.isArray(fieldErrors)) {
              fieldErrors.forEach(errorMessage => {
                toast.error(`${field}: ${errorMessage}`);
              });
            } else if (typeof fieldErrors === 'string') {
              toast.error(`${field}: ${fieldErrors}`);
            }
          });
          
          // Also set inline errors for reference
          if (apiErrors.category) {
            setErrors(prev => ({ 
              ...prev, 
              category_id: Array.isArray(apiErrors.category) ? apiErrors.category[0] : apiErrors.category 
            }));
          }
          if (apiErrors.display_order) {
            setErrors(prev => ({ 
              ...prev, 
              display_order: Array.isArray(apiErrors.display_order) ? apiErrors.display_order[0] : apiErrors.display_order 
            }));
          }
          if (apiErrors.image) {
            setErrors(prev => ({ 
              ...prev, 
              image: Array.isArray(apiErrors.image) ? apiErrors.image[0] : apiErrors.image 
            }));
          }
        } else if (apiResponse.message) {
          // Show general error message
          toast.error(apiResponse.message);
        } else {
          toast.error('Failed to add category grid image. Please try again.');
        }
      } else {
        toast.error('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Add Category Grid Image
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create a new category grid image by filling out the form below
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category ID Input */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                min="1"
                disabled={isSubmitting}
                className={`w-full px-4 py-2.5 bg-white dark:bg-gray-900 border ${
                  errors.category_id 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500'
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors disabled:opacity-50`}
                placeholder="Enter category ID (e.g., 28)"
              />
            </div>
            {errors.category_id && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.category_id}</p>
            )}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Enter the numeric ID of the category
            </p>
          </div>

          {/* Display Order */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <label htmlFor="display_order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Display Order <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="display_order"
                name="display_order"
                value={formData.display_order}
                onChange={handleInputChange}
                min="1"
                disabled={isSubmitting}
                className={`w-full px-4 py-2.5 bg-white dark:bg-gray-900 border ${
                  errors.display_order 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500'
                } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors disabled:opacity-50`}
                placeholder="Enter display order"
              />
            </div>
            {errors.display_order && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-500">{errors.display_order}</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Grid Image <span className="text-red-500">*</span>
            </label>
            
            {/* Image Preview */}
            {imagePreview ? (
              <div className="relative mb-4">
                <div className="relative aspect-square w-full max-w-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <div className="relative aspect-square w-full max-w-md rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Preview will appear here</p>
                  </div>
                </div>
              </div>
            )}

            {/* File Input */}
            <div className="flex items-center space-x-4">
              <label
                htmlFor="image"
                className={`relative cursor-pointer bg-white dark:bg-gray-900 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span className="flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image
                </span>
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                  className="sr-only"
                />
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                PNG, JPG, GIF up to 5MB
              </span>
            </div>
            {errors.image && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500">{errors.image}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Adding...
                </>
              ) : (
                'Add Category Grid Image'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}