import axiosInstance from "@/lib/axios";
import { cookies } from "next/headers";
import { Suspense } from "react";
import PageLoader from "@/components/common/PageLoader";
import ProductAttributeUpdateForm from "@/components/dashboard/admin/Products/Attributes/ProductAttributeUpdateForm";

type PageProps = {
  searchParams?: {
    attribute_id?: string;
  };
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const attributeId = Number(params?.attribute_id);

  const cookieStore = await cookies();
  const authToken = cookieStore.get("access_token")?.value;

  let product_attribute = [];

  try {
    const response = await axiosInstance.get(
      `/api/products/v1/products/attributes/${attributeId}/`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    // if paginated
    product_attribute = response.data;
    console.log(product_attribute);
  } catch (error) {
    console.error("Failed to fetch product attribute:", error);
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <div>
        <ProductAttributeUpdateForm product_attribute={product_attribute} />
      </div>
    </Suspense>
  );
}
