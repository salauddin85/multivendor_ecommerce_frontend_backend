import ProductAttributeTable from "@/components/dashboard/vendor/products/ProductAttributeTable";
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

  let product_attributes = [];

  try {
    const response = await axiosInstance.get(
      `/api/vendors_dashboard/v1/vendors/products/attributes/?page_size=2&page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    product_attributes = response.data;
    // console.log(product_attributes)
  } catch (error) {
    console.error("Failed to fetch product attributes:", error);
  }

  return (
    <div>
      <ProductAttributeTable product_attributes={product_attributes} />
    </div>
  );
}
