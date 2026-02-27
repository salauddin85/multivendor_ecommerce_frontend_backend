import ProductVariantTable from "@/components/dashboard/vendor/products/ProductVariantTable";
import axiosInstance from "@/lib/axios";
import { cookies } from "next/headers";

type PageProps = {
  searchParams?: {
    page?: string;
  };
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;

  const cookieStore = await cookies();
  const authToken = cookieStore.get("access_token")?.value;

  let product_variants = [];

  try {
    const response = await axiosInstance.get(
      `/api/vendors_dashboard/v1/vendors/products/variants/?page_size=2&page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    product_variants = response.data;
    // console.log(product_variants)
  } catch (error) {
    console.error("Failed to fetch product variants:", error);
  }

  return (
    <div>
      <ProductVariantTable product_variants={product_variants} />
    </div>
  );
}
