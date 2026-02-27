"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Star,
  ShoppingCart,
  Eye,
  Heart,
  Store,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

// Image Component
import Image from "next/image";
import ProductCard from "./ProductCard";

// Product Card Component

// Filter Sidebar Component
const FilterSidebar = ({
  filters,
  onFilterChange,
  onClearFilters,
  categories,
  brands,
}: {
  filters: any;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  categories: string[];
  brands: string[];
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Filter FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-linear-to-r from-orange-500 to-orange-600 text-white p-4 rounded-full shadow-2xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 cursor-pointer"
      >
        <SlidersHorizontal size={24} />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div
        className={`fixed lg:sticky top-0 left-0 h-screen lg:h-auto w-80 lg:w-full bg-white z-40 lg:z-0 overflow-y-auto transition-transform duration-300 shadow-2xl lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Mobile Header */}
        <div className="bg-linear-to-r from-orange-500 to-orange-600 px-5 py-4 flex items-center justify-between lg:hidden">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <SlidersHorizontal size={20} />
            Filters
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors cursor-pointer"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Clear Filters */}
          <button
            onClick={() => {
              onClearFilters();
              setIsOpen(false);
            }}
            className="w-full py-2.5 px-4 border-2 border-orange-500 text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <X size={16} />
            Clear All Filters
          </button>

          {/* Category Filter */}
          <div className="border-t border-gray-100 pt-5">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              Category
              <ChevronDown size={18} className="text-gray-400" />
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <label
                  key={cat}
                  className={`flex items-center gap-3 cursor-pointer p-2.5 rounded-lg transition-all duration-200 ${
                    filters.category === cat
                      ? "bg-orange-50 border border-orange-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={filters.category === cat}
                    onChange={() =>
                      onFilterChange(
                        "category",
                        filters.category === cat ? "" : cat,
                      )
                    }
                    className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                  />
                  <span
                    className={`text-sm transition-colors ${
                      filters.category === cat
                        ? "text-orange-700 font-medium"
                        : "text-gray-600"
                    }`}
                  >
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="border-t border-gray-100 pt-5">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              Brand
              <ChevronDown size={18} className="text-gray-400" />
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {brands.map((brand) => (
                <label
                  key={brand}
                  className={`flex items-center gap-3 cursor-pointer p-2.5 rounded-lg transition-all duration-200 ${
                    filters.brand === brand
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={filters.brand === brand}
                    onChange={() =>
                      onFilterChange(
                        "brand",
                        filters.brand === brand ? "" : brand,
                      )
                    }
                    className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
                  />
                  <span
                    className={`text-sm transition-colors ${
                      filters.brand === brand
                        ? "text-blue-700 font-medium"
                        : "text-gray-600"
                    }`}
                  >
                    {brand}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort Filter */}
          <div className="border-t border-gray-100 pt-5">
            <h3 className="font-bold text-gray-800 mb-3">Sort By</h3>
            <select
              value={filters.sort}
              onChange={(e) => onFilterChange("sort", e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all bg-gray-50 hover:bg-white cursor-pointer"
            >
              <option value="">Default</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
            </select>
          </div>

          {/* Featured Only */}
          <div className="border-t border-gray-100 pt-5">
            <label
              className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all duration-200 ${
                filters.featured
                  ? "bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <input
                type="checkbox"
                checked={filters.featured}
                onChange={(e) => onFilterChange("featured", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
              />
              <span
                className={`text-sm font-semibold transition-colors ${
                  filters.featured ? "text-orange-700" : "text-gray-700"
                }`}
              >
                ✨ Featured Only
              </span>
            </label>
          </div>

          {/* Apply Filters Button (Mobile Only) */}
          <button
            onClick={() => {
              console.log("Applying filters:", filters);
              setIsOpen(false);
            }}
            className="w-full py-3 bg-linear-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg cursor-pointer lg:hidden"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
};
const FilterSidebarLG = ({
  filters,
  onFilterChange,
  onClearFilters,
  categories,
  brands,
}: {
  filters: any;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  categories: string[];
  brands: string[];
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-orange-500 to-orange-600 px-5 py-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <SlidersHorizontal size={20} />
          Filters
        </h2>
      </div>

      <div className="p-5 space-y-5">
        {/* Category Filter */}
        <div className="border-t border-gray-100">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            Category
            <ChevronDown size={18} className="text-gray-400" />
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <label
                key={cat}
                className={`flex items-center gap-3 cursor-pointer p-2.5 rounded-lg transition-all duration-200 ${
                  filters.category === cat
                    ? "bg-orange-50 border border-orange-200"
                    : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={filters.category === cat}
                  onChange={() =>
                    onFilterChange(
                      "category",
                      filters.category === cat ? "" : cat,
                    )
                  }
                  className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span
                  className={`text-sm transition-colors ${
                    filters.category === cat
                      ? "text-orange-700 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  {cat}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Brand Filter */}
        <div className="border-t border-gray-100 pt-5">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            Brand
            <ChevronDown size={18} className="text-gray-400" />
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {brands.map((brand) => (
              <label
                key={brand}
                className={`flex items-center gap-3 cursor-pointer p-2.5 rounded-lg transition-all duration-200 ${
                  filters.brand === brand
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={filters.brand === brand}
                  onChange={() =>
                    onFilterChange(
                      "brand",
                      filters.brand === brand ? "" : brand,
                    )
                  }
                  className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span
                  className={`text-sm transition-colors ${
                    filters.brand === brand
                      ? "text-blue-700 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Sort Filter */}
        <div className="border-t border-gray-100 pt-5">
          <h3 className="font-bold text-gray-800 mb-3">Sort By</h3>
          <select
            value={filters.sort}
            onChange={(e) => onFilterChange("sort", e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all bg-gray-50 hover:bg-white cursor-pointer"
          >
            <option value="">Default</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
        </div>

        {/* Featured Only */}
        <div className="border-t border-gray-100 pt-5">
          <label
            className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all duration-300 border ${
              filters.featured
                ? "bg-amber-50 border-amber-200 shadow-sm"
                : "bg-gray-50 border-transparent hover:bg-gray-100"
            }`}
          >
            <input
              type="checkbox"
              checked={filters.featured}
              onChange={(e) => onFilterChange("featured", e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
            />
            <span
              className={`text-sm font-semibold transition-colors ${
                filters.featured ? "text-amber-700" : "text-gray-700"
              }`}
            >
              ✨ Featured Only
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

// Main Products Grid Component
export default function ProductGrid({
  products,
  query,
  category,
}: {
  products: any[];
  query?: string;
  category?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    sort: "",
    featured: false,
  });

  const router = useRouter();
  const pathname = usePathname();
  // Extract unique categories and brands from products
  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))],
    [products],
  );

  const brands = useMemo(
    () => [...new Set(products.map((p) => p.brand).filter(Boolean))],
    [products],
  );

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query),
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    // Brand filter
    if (filters.brand) {
      filtered = filtered.filter((p) => p.brand === filters.brand);
    }

    // Featured filter
    if (filters.featured) {
      filtered = filtered.filter((p) => p.is_featured);
    }

    // Sort
    const getPrice = (p: any) => {
      const price = p.type === "variable" ? p?.variants?.price : p?.base_price;
      return parseFloat(price) || 0;
    };

    switch (filters.sort) {
      case "price_low":
        filtered.sort((a, b) => getPrice(a) - getPrice(b));
        break;
      case "price_high":
        filtered.sort((a, b) => getPrice(b) - getPrice(a));
        break;
      case "name_asc":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name_desc":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    return filtered;
  }, [searchQuery, filters, products]);

  const handleFilterChange = useCallback(
    (key: string, value: any) => {
      setFilters((prev) => ({ ...prev, [key]: value }));

      const params = new URLSearchParams(window.location.search);

      // Reset sorting params first
      params.delete("low_to_high");
      params.delete("high_to_low");
      params.delete("a_to_z");
      params.delete("z_to_a");
      params.delete("is_featured");

      if (key === "sort") {
        if (value === "price_low") {
          params.set("low_to_high", "true");
        } else if (value === "price_high") {
          params.set("high_to_low", "true");
        } else if (value === "name_asc") {
          params.set("a_to_z", "true");
        } else if (value === "name_desc") {
          params.set("z_to_a", "true");
        }
      }

      if (key === "featured") {
        if (value) {
          params.set("is_featured", "true");
        }
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname],
  );

  const handleClearFilters = useCallback(() => {
    setFilters({
      category: "",
      brand: "",
      sort: "",
      featured: false,
    });
    setSearchQuery("");
    router.replace(pathname);
  }, [router, pathname]);

  return (
    <>
      {/* Mobile Filter Sidebar */}
      <div className="lg:hidden">
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          categories={categories}
          brands={brands}
        />
      </div>

      <div className="flex lg:gap-8">
        {/* Sidebar - Hidden on mobile, shown on desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="h-full">
            <FilterSidebarLG
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              categories={categories}
              brands={brands}
            />
          </div>
        </aside>

        {/* Products Grid */}
        <main className="flex-1">
          {/* Results Info */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <p className="text-gray-600 font-medium">
              Showing{" "}
              <span className="text-blue-600 font-bold">
                {filteredProducts.length}
              </span>{" "}
              products
            </p>
            {(filters.category ||
              filters.brand ||
              searchQuery ||
              filters.featured) && (
              <button
                onClick={handleClearFilters}
                className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-2"
              >
                <X size={18} />
                Clear Filters
              </button>
            )}
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or search query
              </p>
              <button
                onClick={handleClearFilters}
                className="px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange  -700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
