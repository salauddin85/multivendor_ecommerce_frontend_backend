"use client";
import React, { useState } from "react";
import axios from "@/lib/axios";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

// TypeScript interface
interface Product {
  id: number;
  title: string;
  slug: string;
}

interface ProductAttributeData {
  id: number;
  product: Product;
  created_at: string;
  updated_at: string;
  name: string;
  is_variation: boolean;
}

interface ApiResponse {
  code: number;
  status: string;
  message: string;
  data: ProductAttributeData;
}

interface ProductAttributeUpdateFormProps {
  product_attribute: ApiResponse | null;
}

export default function ProductAttributeUpdateForm({
  product_attribute,
}: ProductAttributeUpdateFormProps) {
  const [formData, setFormData] = useState({
    name: product_attribute?.data.name || "",
    is_variation: product_attribute?.data.is_variation || false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle switch change
  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      is_variation: checked,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get auth token from localStorage or cookies
      const authToken = localStorage.getItem("access_token") || "";

      const response = await axios.patch(
        `/api/products/v1/products/attributes/${product_attribute?.data.id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200) {
        toast.success("Product attribute updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          style: { backgroundColor: "#f97316" }, // orange-500
        });

        // Update local data if needed
        if (product_attribute) {
          product_attribute.data = {
            ...product_attribute.data,
            ...formData,
            updated_at: new Date().toISOString(),
          };
        }
      }
    } catch (err) {
      const error = err as AxiosError<any>;
      console.error("Update failed:", error);

      let errorMessage = "Failed to update product attribute";

      if (error.response?.data) {
        const data = error.response.data;

        // 🔥 Field-wise validation error
        if (data.errors) {
          const fieldErrors = Object.entries(data.errors)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return `${field}: ${messages.join(", ")}`;
              }
              return `${field}: ${messages}`;
            })
            .join("\n");

          errorMessage = fieldErrors;
        }
        // fallback
        else if (data.message) {
          errorMessage = data.message;
        }
      }

      setError(errorMessage);

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!product_attribute) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product attribute...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Update Product Attribute
            <Badge
              variant="outline"
              className="ml-2 bg-orange-50 text-orange-700 border-orange-200"
            >
              ID: {product_attribute.data.id}
            </Badge>
          </CardTitle>
          <CardDescription className="text-gray-600">
            Update the attribute details for your product
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {/* Product Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">
              Product Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Product Name</p>
                <p className="font-medium">
                  {product_attribute.data.product.title}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Product Slug</p>
                <p className="font-medium">
                  {product_attribute.data.product.slug}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Timestamps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-medium">
                  {formatDate(product_attribute.data.created_at)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Updated At</p>
                <p className="font-medium">
                  {formatDate(product_attribute.data.updated_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Update Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-medium">
                Attribute Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter attribute name (e.g., Size, Color)"
                className="w-full border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                required
              />
              <p className="text-sm text-gray-500">
                The name of the attribute as displayed to customers
              </p>
            </div>

            {/* Variation Switch */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <Label
                  htmlFor="is_variation"
                  className="text-gray-700 font-medium"
                >
                  Use for Variations
                </Label>
                <p className="text-sm text-gray-500">
                  Enable if this attribute should be used to create product
                  variations
                </p>
              </div>
              <Switch
                id="is_variation"
                checked={formData.is_variation}
                onCheckedChange={handleSwitchChange}
                className="data-[state=checked]:bg-orange-500"
              />
            </div>

            {/* Current Status */}
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2">
                Current Status
              </h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${formData.is_variation ? "bg-green-500" : "bg-gray-400"}`}
                  ></div>
                  <span className="text-sm">
                    {formData.is_variation
                      ? "Used for variations"
                      : "Not used for variations"}
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    formData.is_variation
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {formData.is_variation ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <Button
                type="submit"
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 flex-1 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  "Update Attribute"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    name: product_attribute?.data.name || "",
                    is_variation: product_attribute?.data.is_variation || false,
                  });
                  setError(null);
                }}
                className=""
              >
                Reset Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
