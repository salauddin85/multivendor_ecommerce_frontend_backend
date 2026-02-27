'use client'
import React, { useState, ChangeEvent } from 'react'
import axios from '@/lib/axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Upload, Info } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Define the schema
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
  is_default: z.boolean().default(false),
})

// Infer type from schema
type FormValues = z.infer<typeof formSchema>

interface BackendError {
  code?: number
  status?: string
  message?: string
  errors?: Record<string, string[]>
  data?: {
    id: number
    name: string
    price: number
    product: string
  }
}

export default function ProductVariantAddForm({products}: any) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string>('')

  // FIX: Use a type assertion for the resolver
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any, // Type assertion to bypass the complex type checking
    defaultValues: {
      variant_name: '',
      sku: '',
      product: '',
      price: '',
      stock: '',
      discount_price: '',
      is_default: false,
    },
    mode: 'onChange',
  })

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
      const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
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

      toast.success('Image selected successfully!', {
        position: "top-right",
        autoClose: 2000,
      })
    }
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

  // FIX: Use a type assertion for the onSubmit handler
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    setUploadProgress(0)

    // Validate image before submission
    if (!imageFile) {
      const errorMsg = 'Product image is required'
      setImageError(errorMsg)
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 3000,
      })
      setIsSubmitting(false)
      return
    }

    try {
      const formData = new FormData()
      
      // Append form values
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Handle boolean conversion for is_default
          if (key === 'is_default') {
            formData.append(key, value ? 'true' : 'false')
          } else {
            formData.append(key, value.toString())
          }
        }
      })

      // Append image file
      formData.append('image', imageFile)

      const response = await axios.post('/api/products/v1/products/variants/', formData, {
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

      if (response.status === 201 || response.data?.code === 201) {
        const successMessage = `Variant "${response.data.data.name}" created successfully!`
        
        toast.success(successMessage, {
          position: "top-right",
          autoClose: 5000,
          closeButton: true,
          progress: undefined,
          theme: "light",
        })

        // Show additional info about default variant if applicable
        if (data.is_default) {
          setTimeout(() => {
            toast.info('This variant is set as the default. Other variants for this product will be automatically unset as default.', {
              position: "top-right",
              autoClose: 6000,
            })
          }, 600)
        }

        // Show additional info toast
        setTimeout(() => {
          toast.info(`Variant added to ${response.data.data.product} with price $${response.data.data.price.toFixed(2)}`, {
            position: "top-right",
            autoClose: 4000,
          })
        }, 600)
        
        // Reset form on success
        form.reset()
        setImageFile(null)
        setImagePreview(null)
        setImageError('')
        setUploadProgress(0)

      } else {
        const errorMessage = response.data?.message || 'Something went wrong!'
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 4000,
        })

        // Show validation errors if available
        if (response.data?.errors) {
          showValidationErrors(response.data.errors)
        }
      }

    } catch (error: any) {
      console.error('Submission error:', error)
      
      if (error.response) {
        // Backend returned an error response
        const errorData = error.response.data
        
        const errorMessage = errorData.message || 'An error occurred'
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 4000,
        })

        // Show validation errors if available
        if (errorData.errors) {
          showValidationErrors(errorData.errors)

          // Set field-specific errors in form
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
        // Request was made but no response received
        toast.error('Network error. Please check your connection and try again.', {
          position: "top-right",
          autoClose: 4000,
        })
      } else {
        // Something else happened
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
          Creating Variant...
        </>
      )
    }
    return 'Create Variant'
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-orange-200 shadow-lg">
          <CardHeader className="border-b border-orange-100 bg-gradient-to-r from-orange-50 to-white">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Add New Product Variant
            </CardTitle>
            <CardDescription className="text-gray-600">
              Fill in the details below to create a new product variant. All fields are required unless marked optional.
            </CardDescription>
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
                        <FormLabel className="text-gray-700 font-medium">
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
                          Descriptive name for this variant
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
                        <FormLabel className="text-gray-700 font-medium">
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
                          Unique stock keeping unit
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
                        <FormLabel className="text-gray-700 font-medium">
                          Product ID <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 1" 
                            {...field} 
                            className="focus:border-orange-500 focus:ring-orange-500"
                          />
                        </FormControl>
                        <FormDescription>
                          ID of the parent product
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
                        <FormLabel className="text-gray-700 font-medium">
                          Price ($) <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.01"
                            placeholder="e.g., 333.00" 
                            {...field} 
                            className="focus:border-orange-500 focus:ring-orange-500"
                          />
                        </FormControl>
                        <FormDescription>
                          Regular price in USD
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
                        <FormLabel className="text-gray-700 font-medium">
                          Stock Quantity <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="e.g., 50" 
                            {...field} 
                            className="focus:border-orange-500 focus:ring-orange-500"
                          />
                        </FormControl>
                        <FormDescription>
                          Available inventory
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
                        <FormLabel className="text-gray-700 font-medium">
                          Discount Price ($)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.01"
                            placeholder="e.g., 20.00 (optional)" 
                            value={field.value || ''}
                            onChange={field.onChange}
                            className="focus:border-orange-500 focus:ring-orange-500"
                          />
                        </FormControl>
                        <FormDescription>
                          Optional discounted price
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Default Variant Checkbox */}
                <div className="space-y-4 pt-2">
                  <FormField
                    control={form.control}
                    name="is_default"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border border-orange-200 rounded-lg bg-orange-50/50">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="border-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:text-white"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                            Set as Default Variant
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-orange-500 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <p className="text-sm">
                                  When checked, this variant will be the default selection for the product. 
                                  Only one variant per product can be default.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </FormLabel>
                          <FormDescription className="text-sm text-gray-600">
                            If this variant is set as default, all other variants for this product will be automatically unset as default.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-4">
                  <div>
                    <FormLabel className="text-gray-700 font-medium block mb-2">
                      Product Image <span className="text-red-500">*</span>
                    </FormLabel>
                    
                    <div className="flex items-center justify-center w-full">
                      <label 
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {imagePreview ? (
                            <div className="relative w-32 h-32 mb-4">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                          ) : (
                            <Upload className="w-10 h-10 mb-3 text-gray-400" />
                          )}
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, WebP (MAX. 5MB)
                          </p>
                        </div>
                        <input
                          id="image-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    
                    {imageError && (
                      <p className="text-sm font-medium text-destructive mt-2">
                        {imageError}
                      </p>
                    )}
                    
                    {imageFile && (
                      <div className="mt-2 text-sm text-gray-600">
                        Selected: {imageFile.name} ({(imageFile.size / 1024).toFixed(2)} KB)
                      </div>
                    )}
                  </div>

                  {/* Upload Progress */}
                  {isSubmitting && uploadProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Uploading...</span>
                        <span className="text-orange-600 font-medium">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2 bg-gray-200" />
                    </div>
                  )}
                </div>

                {/* Info Alert */}
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700 text-sm">
                    <span className="font-semibold">Note:</span> If you set this variant as default, any existing default variant for the same product will automatically be updated to non-default.
                  </AlertDescription>
                </Alert>

                {/* Submit Button */}
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {getButtonContent()}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}