export const dynamic = "force-dynamic";
import { get_product } from "@/actions/product.action";
import ProductDetails from "@/components/product_details/product-details";

async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const res = await get_product(slug);
  if (res.error)
    return (
      <div className="p-10 text-center text-red-500 text-lg">
        <p className="text-lg">{res.message}</p>
      </div>
    );

  return (
    <div>
      <ProductDetails product={res.data} />
    </div>
  );
}

export default ProductDetailsPage;
