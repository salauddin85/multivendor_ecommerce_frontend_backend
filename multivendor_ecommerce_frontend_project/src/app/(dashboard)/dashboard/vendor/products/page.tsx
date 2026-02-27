import ProductsTable from "@/components/dashboard/vendor/products/ProductsTable";
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

  let products = [];

  try {
    const response = await axiosInstance.get(
      `/api/vendors_dashboard/v1/vendors/products/?page_size=3&page=${currentPage}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    // if paginated
    products = response.data;
    // console.log(products)
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

  return (
    <div>
      <ProductsTable products={products} />
    </div>
  );
}
