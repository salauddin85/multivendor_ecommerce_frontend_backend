// page.tsx
import { cookies } from "next/headers";
import axiosInstance from "@/lib/axios";
import ProductAttributeValues from "@/components/dashboard/vendor/products/ProductAttributeValues";
import { AlertCircle } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>; // params is now a Promise
}

export default async function ProductAttributeValuesPage({ params }: PageProps) {
  //  Await params first
  const { id } = await params;
  
  const cookieStore = await cookies();
  const authToken = cookieStore.get("access_token")?.value;

  const attributeId = parseInt(id);

  if (isNaN(attributeId)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-orange-500 mb-4" />
        <h2 className="text-2xl font-semibold text-orange-600 mb-2">
          Invalid Attribute ID
        </h2>
        <p className="text-gray-600 max-w-md">
          The attribute ID is missing or invalid.
        </p>
        <a
          href="/dashboard/vendor/products/attributes"
          className="mt-6 inline-block px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
        >
          Back to Product Attributes
        </a>
      </div>
    );
  }

  let values: any[] = [];
  
  try {
    const { data } = await axiosInstance.get(
      `/api/vendors_dashboard/v1/vendors/products/attributes/${attributeId}/values/`,
      {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      }
    );
    values = data?.data || [];
    // console.log(values, "values");
  } catch (error) {
    console.error(`Failed to fetch attribute values for ID: ${attributeId}`, error);
  }

  if (!values.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-orange-500 mb-4" />
        <h2 className="text-2xl font-semibold text-orange-600 mb-2">
          Attribute Values Not Found
        </h2>
        <p className="text-gray-600 max-w-md">
          We couldn't find any values for attribute ID{" "}
          <span className="font-mono">{attributeId}</span>.
        </p>
        <a
          href="/dashboard/vendor/products/attributes"
          className="mt-6 inline-block px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          Back to Product Attributes
        </a>
      </div>
    );
  }

  return <ProductAttributeValues values={values} />;
}