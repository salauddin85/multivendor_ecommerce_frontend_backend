'use client'
import React, { useState } from 'react'
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
import { Loader2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

// Validation schema matching backend serializer
const formSchema = z.object({
  name: z.string()
    .min(2, { message: "Attribute name must be at least 2 characters" })
    .max(100, { message: "Attribute name must be less than 100 characters" }),
  product: z.string()
    .min(1, { message: "Product ID is required" })
    .regex(/^\d+$/, { message: "Product ID must be a number" }),
  is_variation: z.boolean().default(true),
})

type FormValues = {
  name: string
  product: string
  is_variation: boolean
}

interface BackendError {
  code?: number
  status?: string
  message?: string
  errors?: Record<string, string[]>
  data?: {
    id: number
    name: string
    product: number
    is_variation: boolean
  }
}

export default function ProductAttributeAddForm() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Fix: Don't use zodResolver with explicit generic, let TypeScript infer
  const form = useForm<FormValues>({
    // Fix: Type assertion to handle the resolver properly
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: '',
      product: '',
      is_variation: true,
    },
    mode: 'onChange',
  })

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

  // Fix: Use proper typing for the onSubmit handler
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      
      // Append form values
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString())
        }
      })

      // API endpoint needs to be adjusted based on your backend
      const response = await axios.post('/api/products/v1/products/attributes/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.status === 201 || response.data?.code === 201) {
        const successMessage = `Attribute "${response.data.data?.name || 'Unknown'}" created successfully!`
        
        toast.success(successMessage, {
          position: "top-right",
          autoClose: 5000,
          closeButton: true,
          progress: undefined,
          theme: "light",
        })

        // Show additional info toast
        setTimeout(() => {
          const productId = response.data.data?.product || 'Unknown'
          toast.info(`Attribute added to Product ID: ${productId}`, {
            position: "top-right",
            autoClose: 4000,
          })
        }, 600)
        
        // Reset form on success
        form.reset({
          name: '',
          product: '',
          is_variation: true,
        })

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
            if (field === 'name' || field === 'product' || field === 'is_variation') {
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
          Creating Attribute...
        </>
      )
    }
    return 'Create Attribute'
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="border-orange-200 shadow-lg">
        <CardHeader className="border-b border-orange-100 bg-gradient-to-r from-orange-50 to-white">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Add New Product Attribute
          </CardTitle>
          <CardDescription className="text-gray-600">
            Create attributes like Size, Color, Material, etc. for your products.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <Form {...form}>
            {/* Fix: Use any type assertion for form.handleSubmit */}
            <form onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit(onSubmit)(e)
            }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Attribute Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Attribute Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Size, Color, Material" 
                          {...field} 
                          className="focus:border-orange-500 focus:ring-orange-500"
                        />
                      </FormControl>
                      <FormDescription>
                        Name of the attribute (will be displayed to customers)
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

                {/* Is Variation Switch */}
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="is_variation"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base text-gray-700 font-medium">
                            Use as Product Variation
                          </FormLabel>
                          <FormDescription>
                            When enabled, this attribute will be used to create product variations.
                            For example: Size variations (S, M, L) or Color variations.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-orange-500"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="mt-2 text-sm text-gray-500">
                    <p>
                      <span className="font-medium">Examples:</span>
                    </p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li><span className="font-medium">Size:</span> Used for variations (S, M, L, XL) ✓</li>
                      <li><span className="font-medium">Color:</span> Used for variations (Red, Blue, Green) ✓</li>
                      <li><span className="font-medium">Material:</span> May or may not be used for variations</li>
                      <li><span className="font-medium">Warranty:</span> Usually not used for variations</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Attribute Examples Section */}
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <h3 className="font-medium text-orange-800 mb-2">Common Attribute Examples</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <h4 className="font-medium text-gray-700">Fashion Products:</h4>
                    <ul className="text-gray-600 list-disc pl-5">
                      <li>Size (S, M, L, XL)</li>
                      <li>Color (Red, Blue, Black)</li>
                      <li>Material (Cotton, Polyester, Silk)</li>
                      <li>Pattern (Striped, Solid, Printed)</li>
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-gray-700">Electronics:</h4>
                    <ul className="text-gray-600 list-disc pl-5">
                      <li>Storage (64GB, 128GB, 256GB)</li>
                      <li>Color (Space Gray, Silver, Gold)</li>
                      <li>Warranty (1 Year, 2 Years)</li>
                      <li>Connectivity (WiFi, 4G, 5G)</li>
                    </ul>
                  </div>
                </div>
              </div>

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
  )
}