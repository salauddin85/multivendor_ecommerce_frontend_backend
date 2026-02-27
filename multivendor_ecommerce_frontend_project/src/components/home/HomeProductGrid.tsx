"use client";
import { Product } from "@/types/product";
import ProductCard from "@/components/products/ProductCard";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const HomeProductGrid: React.FC<{ category: string, categorySlug: string, products: Product[] }> = ({ category, categorySlug, products }) => {
  return (
    <div className=" mx-auto my-4 md:my-8">
      <div className="mt-4 flex justify-between items-center">
        <div>
          <h1 className=" bg-orange-500 text-white px-8 py-2 ">
            {category.toUpperCase()}
          </h1>
        </div>
        <div>
          <Link
            href={`/products/category/${categorySlug}`}
            className="text-gray-700 hover:text-black flex "
          >
            See All
          </Link>
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mt-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default HomeProductGrid;
