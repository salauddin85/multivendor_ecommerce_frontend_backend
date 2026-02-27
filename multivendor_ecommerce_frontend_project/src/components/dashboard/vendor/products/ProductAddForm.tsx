'use client';

import React, { useState, useEffect } from 'react'; 
import { Upload, X, Plus, Loader2 } from 'lucide-react';
import type { Brand, Category, Store } from '@/types/catalog';
import axiosInstance from '@/lib/axios';
import TiptapEditor from '@/components/editor/TiptapEditor';

interface ProductAddFormProps {
  brands: Brand[];
  categories: Category[];
  store: Store[];
}

interface FormData {
  title: string;
  category: string;
  brand: string;
  store: string;
  type: 'simple' | 'variable';
  description: string;
  base_price: string;
  main_image: File | null;
  gallery_images: File[];
  stock: string;
  is_featured: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export default function ProductAddForm({
  brands,
  categories,
  store: stores
}: ProductAddFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: '',
    brand: '',
    store: '', // 
    type: 'simple',
    description: '',
    base_price: '',
    main_image: null,
    gallery_images: [],
    stock: '',
    is_featured: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainImagePreview, setMainImagePreview] = useState<string>('');
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (stores.length > 0) {
      setFormData(prev => ({
        ...prev,
        store: stores[0].id.toString() 
      }));
    }
  }, [stores]);

  const flattenCategories = (cats: Category[]): Category[] => {
    return cats.reduce((acc: Category[], cat) => {
      acc.push(cat);
      if (cat.children && cat.children.length > 0) {
        acc.push(...flattenCategories(cat.children));
      }
      return acc;
    }, []);
  };

  const allCategories = flattenCategories(categories);

  const getCategoryDepth = (categoryId: string): number => {
    const findDepth = (cats: Category[], targetId: string, depth: number = 0): number => {
      for (const cat of cats) {
        if (cat.id.toString() === targetId) return depth;
        if (cat.children && cat.children.length > 0) {
          const childDepth = findDepth(cat.children, targetId, depth + 1);
          if (childDepth !== -1) return childDepth;
        }
      }
      return -1;
    };
    return findDepth(categories, categoryId);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleDescriptionChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      description: content,
    }));

    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: '' }));
    }
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, main_image: 'Please select a valid image file' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, main_image: 'Image size should be less than 5MB' }));
        return;
      }

      setFormData((prev) => ({ ...prev, main_image: file }));
      setMainImagePreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, main_image: '' }));
    }
  };

  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentCount = formData.gallery_images.length;
    const availableSlots = 5 - currentCount;

    if (files.length > availableSlots) {
      setErrors((prev) => ({
        ...prev,
        gallery_images: `You can only add ${availableSlots} more image(s). Maximum 5 images allowed.`,
      }));
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, gallery_images: 'Please select valid image files' }));
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          gallery_images: 'Each image should be less than 5MB',
        }));
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const newFiles = [...formData.gallery_images, ...validFiles];
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));

      setFormData((prev) => ({ ...prev, gallery_images: newFiles }));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
      setErrors((prev) => ({ ...prev, gallery_images: '' }));
    }
  };

  const removeGalleryImage = (index: number) => {
    const newImages = formData.gallery_images.filter((_, i) => i !== index);
    const newPreviews = galleryPreviews.filter((_, i) => i !== index);

    URL.revokeObjectURL(galleryPreviews[index]);
    setFormData((prev) => ({ ...prev, gallery_images: newImages }));
    setGalleryPreviews(newPreviews);
  };

  const removeMainImage = () => {
    if (mainImagePreview) {
      URL.revokeObjectURL(mainImagePreview);
    }
    setFormData((prev) => ({ ...prev, main_image: null }));
    setMainImagePreview('');
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Product title is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.store.trim()) newErrors.store = 'Store is required';
    
    const strippedDescription = formData.description.replace(/<[^>]*>/g, '').trim();
    if (!strippedDescription) newErrors.description = 'Description is required';
    
    if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
      newErrors.base_price = 'Valid price is required';
    }
    if (!formData.main_image) newErrors.main_image = 'Main image is required';
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('category', formData.category);
      if (formData.brand) submitData.append('brand', formData.brand);
      submitData.append('store', formData.store); 
      submitData.append('type', formData.type);
      submitData.append('description', formData.description);
      submitData.append('base_price', formData.base_price);
      submitData.append('stock', formData.stock);
      submitData.append('is_featured', formData.is_featured.toString());

      if (formData.main_image) {
        submitData.append('main_image', formData.main_image);
      }

      formData.gallery_images.forEach((file) => {
        submitData.append('gallery_images', file);
      });
      
      // console.log("Submitting store ID:", formData.store); // debug log
      // console.log("Form Data:", Object.fromEntries(submitData)); // debug log

      const response = await axiosInstance.post('/api/products/v1/products/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201 || response.status === 200) {
        alert('Product added successfully!');
        
        setFormData({
          title: '',
          category: '',
          brand: '',
          store: stores.length > 0 ? stores[0].id.toString() : '', 
          type: 'simple',
          description: '',
          base_price: '',
          main_image: null,
          gallery_images: [],
          stock: '',
          is_featured: false,
        });
        
        if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
        galleryPreviews.forEach(preview => URL.revokeObjectURL(preview));
        setMainImagePreview('');
        setGalleryPreviews([]);
        
      } else {
        throw new Error('Failed to add product');
      }
      
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      if (error.response?.data) {
        const apiErrors = error.response.data;
        const newErrors: FormErrors = {};
        
        Object.keys(apiErrors).forEach((key) => {
          if (key in formData) {
            newErrors[key] = Array.isArray(apiErrors[key]) 
              ? apiErrors[key].join(', ') 
              : apiErrors[key];
          }
        });
        
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
        } else {
          alert(error.response.data.message || 'Failed to add product. Please try again.');
        }
      } else {
        alert('Failed to add product. Please check your network connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">Add New Product</h1>
            <p className="mt-1 text-sm text-gray-600">
              Fill in the product details to add it to your store
            </p>
            {stores.length > 0 && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Store:</span> {stores[0].store_name}
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter product title"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select category</option>
                    {allCategories.map((cat) => {
                      const depth = getCategoryDepth(cat.id.toString());
                      const indent = '—'.repeat(depth);
                      return (
                        <option key={cat.id} value={cat.id}>
                          {indent} {cat.name}
                        </option>
                      );
                    })}
                  </select>
                  {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                </div>

                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                    Brand <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <select
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select brand (optional)</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="hidden"
                  name="store"
                  value={formData.store}
                />
                
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="simple">Simple</option>
                    <option value="variable">Variable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <TiptapEditor
                  content={formData.description}
                  onChange={handleDescriptionChange}
                  error={errors.description}
                />
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Pricing & Stock</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-1">
                    Base Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="base_price"
                    name="base_price"
                    value={formData.base_price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.base_price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.base_price && (
                    <p className="mt-1 text-sm text-red-600">{errors.base_price}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.stock ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_featured"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700">
                  Mark as featured product
                </label>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Product Images</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main Image <span className="text-red-500">*</span>
                </label>
                {!mainImagePreview ? (
                  <label
                    htmlFor="main_image"
                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      errors.main_image ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 text-gray-400 mb-3" />
                      <p className="mb-2 text-sm text-gray-600">
                        <span className="font-semibold">Click to upload</span> main image
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                    <input
                      id="main_image"
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative w-full h-48 border-2 border-gray-300 rounded-lg overflow-hidden">
                    <img
                      src={mainImagePreview}
                      alt="Main preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeMainImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {errors.main_image && (
                  <p className="mt-1 text-sm text-red-600">{errors.main_image}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gallery Images{' '}
                  <span className="text-gray-400 text-xs">
                    (Optional - Max 5 images, {formData.gallery_images.length}/5)
                  </span>
                </label>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {galleryPreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative aspect-square border-2 border-gray-300 rounded-lg overflow-hidden"
                    >
                      <img
                        src={preview}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {formData.gallery_images.length < 5 && (
                    <label
                      htmlFor="gallery_images"
                      className="aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors flex flex-col items-center justify-center"
                    >
                      <Plus className="w-8 h-8 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Add Image</span>
                      <input
                        id="gallery_images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryImagesChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {errors.gallery_images && (
                  <p className="mt-1 text-sm text-red-600">{errors.gallery_images}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-2 border cursor-pointer border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-500 transition-colors cursor-pointer disabled:bg-orange-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding Product...
                  </>
                ) : (
                  'Add Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}