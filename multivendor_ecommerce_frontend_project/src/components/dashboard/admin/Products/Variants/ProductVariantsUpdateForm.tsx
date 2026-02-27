'use client'
import React, { useState, ChangeEvent, useEffect, useCallback, useRef } from 'react'
import axios from '@/lib/axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Upload, Eye, X, Package, Tag, Hash, DollarSign, PackageCheck, Image as ImageIcon } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Validation schema
const formSchema = z.object({
  variant_name: z.string()
    .min(2, { message: "Variant name must be at least 2 characters" })
    .max(100, { message: "Variant name must be less than 100 characters" }),
  sku: z.string()
    .min(3, { message: "SKU must be at least 3 characters" })
    .max(50, { message: "SKU must be less than 50 characters" })
    .regex(/^[A-Za-z0-9-]+$/, { message: "SKU can only contain letters, numbers, and hyphens" }),
  product: z.string()
    .min(1, { message: "Product ID is required" })
    .regex(/^\d+$/, { message: "Product ID must be a number" }),
  price: z.string()
    .min(1, { message: "Price is required" })
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Price must be a valid number with up to 2 decimal places" }),
  stock: z.string()
    .min(1, { message: "Stock is required" })
    .regex(/^\d+$/, { message: "Stock must be a whole number" }),
  discount_price: z.string()
    .optional()
    .refine((val) => !val || /^\d+(\.\d{1,2})?$/.test(val), { 
      message: "Discount price must be a valid number with up to 2 decimal places" 
    }),
})

type FormValues = z.infer<typeof formSchema>

interface ProductType {
  id: number
  title: string
  slug: string
}

interface ProductVariantData {
  id: number
  product: ProductType
  created_at: string
  updated_at: string
  sku: string
  variant_name: string
  price: string
  discount_price: string | null
  stock: number
  image: string
}

interface ProductVariantUpdateFormProps {
  product_variant: {
    code: number
    status: string
    message: string
    data: ProductVariantData
  }
}

export default function ProductVariantsUpdateForm({ product_variant }: ProductVariantUpdateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string>('')
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('')
  const [showImageModal, setShowImageModal] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [hasLoaded, setHasLoaded] = useState<boolean>(false)

  // Use ref to track if data has been loaded
  const dataLoadedRef = useRef(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variant_name: '',
      sku: '',
      product: '',
      price: '',
      stock: '',
      discount_price: '',
    },
    mode: 'onChange',
  })

  // Function to build image URL
  const buildImageUrl = useCallback((imagePath: string): string => {
    if (!imagePath) return ''
    
    // If it's already a full URL, return it
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }
    
    // If it starts with /media/, it's likely a Django media file
    if (imagePath.startsWith('/media/')) {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000'
      return `${baseUrl}${imagePath}`
    }
    
    // If it's just a filename or relative path
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000'
    return `${baseUrl}/media/${imagePath}`
  }, [])

  // Populate form with existing data - only once
  useEffect(() => {
    if (product_variant?.data && !dataLoadedRef.current) {
      const variantData = product_variant.data
      
      console.log('Loading variant data:', variantData)
      
      // Set current image URL
      if (variantData.image) {
        const imageUrl = buildImageUrl(variantData.image)
        console.log('Setting image URL:', imageUrl)
        setCurrentImageUrl(imageUrl)
        setImagePreview(imageUrl)
      } else {
        console.log('No image found in variant data')
      }

      // Set form values
      form.reset({
        variant_name: variantData.variant_name || '',
        sku: variantData.sku || '',
        product: variantData.product?.id?.toString() || '',
        price: variantData.price || '',
        stock: variantData.stock?.toString() || '',
        discount_price: variantData.discount_price || '',
      })

      dataLoadedRef.current = true
      setIsLoading(false)
      setHasLoaded(true)
    }
  }, [product_variant, form, buildImageUrl])

  // Debug effect to check state
  useEffect(() => {
    console.log('Current states:', {
      isLoading,
      hasLoaded,
      currentImageUrl,
      imagePreview,
      product_variant: product_variant?.data
    })
  }, [isLoading, hasLoaded, currentImageUrl, imagePreview, product_variant])

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        const errorMsg = 'Please upload a valid image (JPEG, PNG, WebP)'
        setImageError(errorMsg)
        toast.error(errorMsg, {
          position: "top-right",
          autoClose: 3000,
        })
        return
      }

      // Validate file size (max 5MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024
      if (file.size > MAX_FILE_SIZE) {
        const errorMsg = 'Image size should be less than 5MB'
        setImageError(errorMsg)
        toast.error(errorMsg, {
          position: "top-right",
          autoClose: 3000,
        })
        return
      }

      setImageFile(file)
      setImageError('')
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      toast.success('New image selected!', {
        position: "top-right",
        autoClose: 2000,
      })
    }
  }

  const removeSelectedImage = () => {
    setImageFile(null)
    // Revert to current image
    setImagePreview(currentImageUrl)
    toast.info('New image removed, keeping current image', {
      position: "top-right",
      autoClose: 2000,
    })
  }

  const showValidationErrors = (errors: Record<string, string[]>) => {
    Object.values(errors).forEach((errorArray) => {
      errorArray.forEach((errorMessage) => {
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 4000,
        })
      })
    })
  }

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      
      // Append all form values
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value)
        }
      })

      // Append image file only if new image is selected
      if (imageFile) {
        formData.append('image', imageFile)
      }

      // Use PATCH for update
      const response = await axios.patch(`/api/products/v1/products/variants/${product_variant.data.id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            setUploadProgress(percentCompleted)
          }
        },
      })

      if (response.status === 200 || response.data?.code === 200) {
        const successMessage = `Variant "${data.variant_name}" updated successfully!`
        
        toast.success(successMessage, {
          position: "top-right",
          autoClose: 5000,
          closeButton: true,
          theme: "light",
        })

        // Update current image URL if new image was uploaded
        if (imageFile && response.data.data?.image) {
          const newImageUrl = buildImageUrl(response.data.data.image)
          setCurrentImageUrl(newImageUrl)
          setImagePreview(newImageUrl)
        }

        // Clear new image file if uploaded
        if (imageFile) {
          setImageFile(null)
        }

        setUploadProgress(0)

      } else {
        const errorMessage = response.data?.message || 'Something went wrong!'
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 4000,
        })

        if (response.data?.errors) {
          showValidationErrors(response.data.errors)
        }
      }

    } catch (error: any) {
      console.error('Update error:', error)
      
      if (error.response) {
        const errorData = error.response.data
        
        const errorMessage = errorData.message || 'An error occurred'
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 4000,
        })

        if (errorData.errors) {
          showValidationErrors(errorData.errors)

          Object.keys(errorData.errors).forEach((field) => {
            const errorMessage = errorData.errors[field][0]
            if (field === 'image') {
              setImageError(errorMessage)
            } else if (field in formSchema.shape) {
              form.setError(field as keyof FormValues, {
                type: 'server',
                message: errorMessage,
              })
            }
          })
        }
      } else if (error.request) {
        toast.error('Network error. Please check your connection and try again.', {
          position: "top-right",
          autoClose: 4000,
        })
      } else {
        toast.error('An unexpected error occurred. Please try again.', {
          position: "top-right",
          autoClose: 4000,
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const getButtonContent = () => {
    if (isSubmitting) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Updating Variant...
        </>
      )
    }
    return 'Update Variant'
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Image failed to load:', e.currentTarget.src)
    e.currentTarget.src = '/placeholder-image.jpg'
    e.currentTarget.alt = 'Image not available'
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-orange-200 shadow-lg">
          <CardContent className="p-12 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <p className="text-sm text-gray-500">Loading variant data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const variantData = product_variant.data

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="border-orange-200 shadow-lg">
        <CardHeader className="border-b border-orange-100 bg-gradient-to-r from-orange-50 to-white">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="h-6 w-6 text-orange-500" />
                Update Product Variant
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Update the details for: <span className="font-semibold text-orange-600">{variantData.variant_name}</span>
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
              <Hash className="h-3 w-3 mr-1" />
              ID: {variantData.id}
            </Badge>
          </div>
          
          {/* Variant Summary */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 text-blue-700">
                <Tag className="h-4 w-4" />
                <span className="text-sm font-medium">Product</span>
              </div>
              <p className="text-sm font-semibold mt-1 truncate">{variantData.product.title}</p>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 text-green-700">
                <Tag className="h-4 w-4" />
                <span className="text-sm font-medium">SKU</span>
              </div>
              <p className="text-sm font-semibold mt-1">{variantData.sku}</p>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
              <div className="flex items-center gap-2 text-purple-700">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Price</span>
              </div>
              <p className="text-sm font-semibold mt-1">${variantData.price}</p>
            </div>
            
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
              <div className="flex items-center gap-2 text-amber-700">
                <PackageCheck className="h-4 w-4" />
                <span className="text-sm font-medium">Stock</span>
              </div>
              <p className="text-sm font-semibold mt-1">{variantData.stock}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Variant Name */}
                <FormField
                  control={form.control}
                  name="variant_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Variant Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Black - Small" 
                          {...field} 
                          className="focus:border-orange-500 focus:ring-orange-500"
                        />
                      </FormControl>
                      <FormDescription>
                        Current: <span className="font-medium">{variantData.variant_name}</span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* SKU */}
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        SKU <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., TSHIRT-BLK-S" 
                          {...field} 
                          className="focus:border-orange-500 focus:ring-orange-500"
                        />
                      </FormControl>
                      <FormDescription>
                        Current: <span className="font-medium">{variantData.sku}</span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Product ID */}
                <FormField
                  control={form.control}
                  name="product"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Product ID <span className="text-red-500">*</span>
                      </FormLabel>
                      <div className="mb-2 p-3 bg-gray-50 rounded-lg border">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">{variantData.product.title}</p>
                            <p className="text-xs text-gray-500">Slug: {variantData.product.slug}</p>
                          </div>
                          <Badge variant="secondary">ID: {variantData.product.id}</Badge>
                        </div>
                      </div>
                      <FormControl>
                        <Input 
                          placeholder="Enter Product ID" 
                          {...field} 
                          className="focus:border-orange-500 focus:ring-orange-500"
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the product ID to change parent product
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Price ($) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input 
                            type="number"
                            step="0.01"
                            placeholder="e.g., 344.00" 
                            {...field} 
                            className="pl-8 focus:border-orange-500 focus:ring-orange-500"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Current: <span className="font-medium">${variantData.price}</span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Stock */}
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                        <PackageCheck className="h-4 w-4" />
                        Stock Quantity <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="e.g., 10" 
                          {...field} 
                          className="focus:border-orange-500 focus:ring-orange-500"
                        />
                      </FormControl>
                      <FormDescription>
                        Current: <span className="font-medium">{variantData.stock}</span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Discount Price */}
                <FormField
                  control={form.control}
                  name="discount_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Discount Price ($)
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input 
                            type="number"
                            step="0.01"
                            placeholder="e.g., 10.00 (optional)" 
                            value={field.value || ''}
                            onChange={field.onChange}
                            className="pl-8 focus:border-orange-500 focus:ring-orange-500"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Current: <span className="font-medium">{variantData.discount_price ? `$${variantData.discount_price}` : 'Not set'}</span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Image Upload Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-orange-500" />
                    Product Image
                  </h3>
                  
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Current Image */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 bg-blue-50 p-2 rounded-lg">Current Image</h4>
                    <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50/50">
                      {currentImageUrl ? (
                        <div className="relative">
                          <img
                            src={currentImageUrl}
                            alt="Current variant"
                            className="w-full h-64 object-contain rounded-lg"
                            onError={handleImageError}
                            loading="lazy"
                          />
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-blue-600 text-white">Current</Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                          <ImageIcon className="w-16 h-16 mb-4" />
                          <p className="text-sm">No image available</p>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 text-center">
                      This is the current product variant image
                    </p>
                  </div>

                  {/* New Image Upload */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 bg-green-50 p-2 rounded-lg">Update Image (Optional)</h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center py-4">
                        {imagePreview && imagePreview !== currentImageUrl ? (
                          <div className="relative w-48 h-48 mb-4">
                            <img
                              src={imagePreview}
                              alt="New preview"
                              className="w-full h-full object-contain rounded-lg border-2 border-green-300"
                            />
                            <button
                              type="button"
                              onClick={removeSelectedImage}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-lg"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <div className="absolute bottom-3 right-3">
                              <Badge className="bg-green-600 text-white">New</Badge>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-20 h-20 mb-4 flex items-center justify-center bg-white rounded-full border-2 border-dashed border-gray-300">
                              <Upload className="w-10 h-10 text-gray-400" />
                            </div>
                            <p className="mb-2 text-sm text-gray-500 text-center">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 text-center">
                              PNG, JPG, WebP (MAX. 5MB)
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <div className="flex flex-col gap-3 mt-4">
                        <Button
                          type="button"
                          variant={imagePreview !== currentImageUrl ? "outline" : "default"}
                          onClick={() => document.getElementById('image-upload')?.click()}
                          className="w-full"
                        >
                          {imagePreview !== currentImageUrl ? 'Change Image' : 'Upload New Image'}
                        </Button>
                        {imagePreview !== currentImageUrl && (
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={removeSelectedImage}
                            className="w-full"
                          >
                            Remove New Image
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {imageError && (
                      <Alert variant="destructive" className="mt-3">
                        <AlertDescription>{imageError}</AlertDescription>
                      </Alert>
                    )}
                    
                    <p className="text-sm text-gray-500">
                      Upload a new image to replace the current one. Leave empty to keep current image.
                    </p>
                  </div>
                </div>

                {/* Upload Progress */}
                {isSubmitting && uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Uploading image...</span>
                      <span className="text-orange-600 font-medium">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2 bg-gray-200" />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    disabled={isSubmitting}
                  >
                    Reset Changes
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 shadow-md hover:shadow-lg"
                  >
                    {getButtonContent()}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Image Modal */}
      {showImageModal && currentImageUrl && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b bg-gray-50">
              <div>
                <h3 className="font-bold text-xl text-gray-800">Current Variant Image</h3>
                <p className="text-sm text-gray-600 mt-1">{variantData.variant_name}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImageModal(false)}
                className="rounded-full p-2 hover:bg-gray-200"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-8 flex items-center justify-center bg-gray-900 max-h-[60vh]">
              <img
                src={currentImageUrl}
                alt="Full size variant"
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                onError={handleImageError}
              />
            </div>
            <div className="p-6 border-t bg-gray-50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Variant</p>
                  <p className="font-medium">{variantData.variant_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">SKU</p>
                  <p className="font-medium">{variantData.sku}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}