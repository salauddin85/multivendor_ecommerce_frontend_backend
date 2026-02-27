"use client";

import ProductCard from "@/components/products/ProductCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface RelatedProductsTabProps {
  products: any[];
  category: {
    id: number;
    name: string;
    slug: string;
  };
}

export default function RelatedProductsTab({
  products,
  category,
}: RelatedProductsTabProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h2 className="text-sm sm:text-xl md:text-2xl font-bold text-gray-900">
          Related Products
        </h2>
        <Link
          href={`/products/category/${category.slug}`}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors group"
        >
          See More
          <ArrowRight
            size={16}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
