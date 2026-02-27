'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import axiosInstance from '@/lib/axios'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Upload, X, ArrowLeft, Loader2 } from 'lucide-react'

// Form validation schema - Fixed type definitions
const brandSchema = z.object({
  name: z.string()
    .min(2, 'Brand name must be at least 2 characters')
    .max(100, 'Brand name must not exceed 100 characters'),
  display_order: z.union([z.number(), z.string()])
    .optional()
    .nullable()
    .transform((val) => {
      if (val === null || val === undefined || val === '') return null
      const num = Number(val)
      return isNaN(num) ? null : num
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
})

// Infer the type from the schema
type BrandFormData = z.infer<typeof brandSchema>

export default function BrandAddForm() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema) as any,
    defaultValues: {
      name: '',
      display_order: null,
      logo: null
    }
  })

  // Handle logo file change
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setValue('logo', file, { shouldValidate: true })
      
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove logo
  const removeLogo = () => {
    setValue('logo', null, { shouldValidate: true })
    setLogoPreview(null)
  }

  // Form submission - Fixed type to accept FormData
  const onSubmit = async (data: BrandFormData) => {
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      
      // Append form fields
      formData.append('name', data.name)
      
      if (data.display_order !== null && data.display_order !== undefined) {
        formData.append('display_order', String(data.display_order))
      }
      
      if (data.logo instanceof File) {
        formData.append('logo', data.logo)
      }

      const response = await axiosInstance.post('/api/catalog/v1/brands/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.code === 201 || response.status === 201) {
        toast.success('Brand created successfully')
        reset()
        removeLogo()
        router.push('/dashboard/admin/catalogs/brands')
      } else {
        toast.success('Brand created successfully')
        reset()
        removeLogo()
        router.push('/dashboard/admin/catalogs/brands')
      }
    } catch (error: any) {
      console.error('Error creating brand:', error)
      
      const responseData = error?.response?.data

      // Handle field-wise errors
      if (responseData?.errors) {
        Object.entries(responseData.errors).forEach(([field, messages]: [string, any]) => {
          if (Array.isArray(messages)) {
            messages.forEach((message: string) => {
              toast.error(`${field}: ${message}`)
            })
          } else if (typeof messages === 'string') {
            toast.error(`${field}: ${messages}`)
          }
        })
      }
      // Handle general error message
      else if (responseData?.message) {
        toast.error(responseData.message)
      }
      // Handle DRF default detail
      else if (responseData?.detail) {
        toast.error(responseData.detail)
      }
      // Handle name field error specifically for brands
      else if (responseData?.name) {
        if (Array.isArray(responseData.name)) {
          responseData.name.forEach((msg: string) => toast.error(`Name: ${msg}`))
        } else {
          toast.error(`Name: ${responseData.name}`)
        }
      }
      // Fallback
      else {
        toast.error('Failed to create brand')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with navigation */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={handleCancel}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          type="button"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Add New Brand</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create a new brand for your products
          </p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-base font-semibold text-slate-700">Basic Information</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enter the brand details below</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Brand Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Brand Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
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
              <p className="text-xs text-slate-400">
                The brand name as it will appear in your store
              </p>
            </div>

            {/* Display Order Field */}
            <div className="space-y-2">
              <label htmlFor="display_order" className="block text-sm font-medium text-slate-700">
                Display Order
              </label>
              <input
                id="display_order"
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
              <p className="text-xs text-slate-400">
                Lower numbers will appear first (optional)
              </p>
            </div>
          </div>
        </div>

        {/* Brand Logo Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-base font-semibold text-slate-700">Brand Logo</h2>
            <p className="text-xs text-slate-500 mt-0.5">Upload the brand logo (optional)</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {/* Logo Preview Area */}
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
                    htmlFor="logo-upload"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors group"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-8 w-8 text-slate-400 group-hover:text-orange-500 transition-colors" />
                      <p className="mb-2 text-sm text-slate-500 group-hover:text-orange-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-slate-400">
                        PNG, JPG, JPEG, or WebP (MAX. 5MB)
                      </p>
                    </div>
                    <input
                      id="logo-upload"
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
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[120px] flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              'Create Brand'
            )}
          </button>
        </div>
      </form>

      {/* Help Card */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Quick Tips</h3>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li>Brand name is required and should be unique</li>
          <li>Display order determines the sorting position (optional)</li>
          <li>Logo should be at least 200x200px for best quality</li>
          <li>Supported formats: PNG, JPG, JPEG, WebP (max 5MB)</li>
        </ul>
      </div>
    </div>
  )
}