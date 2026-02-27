"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface BestSellingProduct {
  id: number;
  slug: string;
  store: string | null;
  category: string;
  brand: string | null;
  title: string;
  type: string;
  base_price: string;
  main_image: string;
  stock: number;
  is_featured: boolean;
  average_rating?: string | number | null;
  status: string;
  variants: any;
}

const PRODUCTS_PER_PAGE = 4;

const getRating = (rating?: string | number | null): number => {
  if (rating == null) return 0;
  const parsed = parseFloat(String(rating));
  return isNaN(parsed) ? 0 : parsed;
};

const getPrice = (product: BestSellingProduct): string => {
  if (product.type === "variable") {
    const variantPrice = product.variants?.price;
    return variantPrice != null ? String(variantPrice) : product.base_price;
  }
  return product.base_price;
};

const BestSelling: React.FC<{ products: BestSellingProduct[] }> = ({ products }) => {
  const [activePage, setActivePage] = useState(0);

  const TOTAL_PAGES = Math.ceil(products.length / PRODUCTS_PER_PAGE);

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={
            i < Math.floor(rating)
              ? "text-yellow-400 text-xs"
              : "text-gray-300 text-xs"
          }
        >
          ★
        </span>
      ))}
    </div>
  );

  // Get products for current page
  const startIndex = activePage * PRODUCTS_PER_PAGE;
  const currentPageProducts = products.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

  return (
    <div className="w-full hidden md:block xl:max-w-[250px] mx-auto overflow-hidden rounded-md border order-2 xl:order-0 xl:shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between p-3 mb-2 bg-gray-100">
        <h2 className="font-bold text-gray-900 text-sm">BEST SELLING</h2>
        <div className="flex gap-2">
          {[...Array(TOTAL_PAGES)].map((_, index) => (
            <button
              key={index}
              onClick={() => setActivePage(index)}
              className={`transition-all ${
                index === activePage
                  ? "w-6 h-2 bg-orange-500 rounded-full"
                  : "w-2 h-2 bg-gray-400 rounded-full"
              }`}
              title={`Page ${index + 1}`}
              aria-label={`Page ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Products List */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 xl:grid-cols-1 rounded-lg p-4 transition-all duration-300 ease-in-out">
        {currentPageProducts.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="block"
          >
            <div className="flex gap-4 pb-4 last:pb-0 border-b last:border-b-0 animate-in fade-in slide-in-from-bottom-2 duration-300 hover:opacity-75 transition-opacity cursor-pointer">
              {/* Product Image */}
              <div className="shrink-0 w-15 h-15 bg-gray-50 rounded flex items-center justify-center overflow-hidden">
                <Image
                  src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${product.main_image}`}
                  alt={product.title}
                  className="object-contain w-full h-full"
                  width={60}
                  height={60}
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                {/* Title */}
                <h3 className="text-xs font-medium text-gray-900 line-clamp-2">
                  {product.title.split(" ").slice(0, 2).join(" ")}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1 my-1">
                  {renderStars(getRating(product.average_rating))}
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-orange-500">
                    ৳{getPrice(product)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BestSelling;