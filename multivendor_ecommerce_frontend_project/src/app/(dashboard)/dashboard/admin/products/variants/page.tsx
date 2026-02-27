import AdminProductVariantTable from "@/components/dashboard/admin/Products/Variants/AdminProductVariantsTable";
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
      `/api/products/v1/products/variants/?page_size=50&page=${currentPage}`,
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
      <AdminProductVariantTable product_variants={product_variants} />
    </div>
  );
}
