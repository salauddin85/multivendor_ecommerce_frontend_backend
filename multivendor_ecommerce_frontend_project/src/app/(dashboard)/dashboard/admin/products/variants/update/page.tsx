import ProductVariantsUpdateForm from "@/components/dashboard/admin/Products/Variants/ProductVariantsUpdateForm";
import axiosInstance from "@/lib/axios";
import { cookies } from "next/headers";
import { Suspense } from "react";
import PageLoader from "@/components/common/PageLoader";

type PageProps = {
  searchParams?: {
    variant_id?: string;
  };
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const variantId = Number(params?.variant_id);

  const cookieStore = await cookies();
  const authToken = cookieStore.get("access_token")?.value;

  let product_variant = [];

  try {
    const response = await axiosInstance.get(
      `/api/products/v1/products/variants/${variantId}/`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    // if paginated
    product_variant = response.data;
    // console.log(product_variant);
  } catch (error) {
    console.error("Failed to fetch product variant:", error);
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <div>
        <ProductVariantsUpdateForm product_variant={product_variant} />
      </div>
    </Suspense>
  );
}
