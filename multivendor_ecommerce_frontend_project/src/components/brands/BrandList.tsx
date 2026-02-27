"use client";
import Pagination from "../pagination/Pagination";
import BrandCard from "./BrandCard";
import { Package } from "lucide-react";

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string;
  display_order: number;
}

interface PaginationData {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  page_size: number;
}

interface BrandListProps {
  brands_list: {
    data: Brand[];
    pagination: PaginationData;
  };
}

const BrandList = ({ brands_list }: BrandListProps) => {
  const { data: brands, pagination } = brands_list;

  // Empty State
  if (!brands || brands.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-orange-200">
            <Package size={40} className="text-orange-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            No Brands Available
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            We&apos;re currently updating our brand collection. Please check
            back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-8 sm:mb-12">
        <div className="text-center max-w-3xl mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Explore Our{" "}
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Premium Brands
            </span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-2">
            Discover quality products from trusted brands worldwide
          </p>
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full text-xs sm:text-sm font-medium">
            <Package size={16} />
            <span>
              {pagination.count} Brand{pagination.count !== 1 ? "s" : ""}{" "}
              Available
            </span>
          </div>
        </div>
      </div>

      {/* Brands Grid - 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {brands.map((brand) => (
          <BrandCard key={brand.id} brand={brand} />
        ))}
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="mt-16 flex justify-center">
          <Pagination paginationData={pagination} />
        </div>
      )}
    </div>
  );
};

export default BrandList;
