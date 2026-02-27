"use client";
import React, { useState, useEffect } from "react";
import Pagination from "@/components/pagination/Pagination";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Product {
  id: number;
  store: string | null;
  category: string;
  brand: string | null;
  title: string;
  slug: string;
  type: "simple" | "variable";
  base_price: string;
  main_image: string | null;
  stock: number;
  is_featured: boolean;
  status: "published" | "draft" | "pending" | "archived";
  average_rating: number | null;
  total_reviews: number;
}

interface PaginationData {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  page_size: number;
}

interface ApiResponse {
  code: number;
  status: string;
  message: string;
  data: Product[];
  pagination: PaginationData;
}

interface AllProductsListProps {
  products_list: ApiResponse | null;
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AllProductsList({ products_list }: AllProductsListProps) {
  const router = useRouter();

  
  const initialProducts: Product[] = products_list?.data ?? [];
  const pagination: PaginationData | undefined = products_list?.pagination;

  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [storeFilter, setStoreFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "id",
    direction: "desc",
  });
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  //  Sync state when server sends new page data (pagination fix)
  useEffect(() => {
    setFilteredProducts(products_list?.data ?? []);
  }, [products_list]);

  // Safe products reference
  const products: Product[] = products_list?.data ?? [];

  // ── Unique filter values ──────────────────────────────────────────────────
  const uniqueCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  const uniqueStores = Array.from(new Set(products.map((p) => p.store).filter(Boolean))) as string[];

  // ── Statistics ────────────────────────────────────────────────────────────
  const stats = {
    total: filteredProducts.length,
    published: filteredProducts.filter((p) => p.status === "published").length,
    draft: filteredProducts.filter((p) => p.status === "draft").length,
    simple: filteredProducts.filter((p) => p.type === "simple").length,
    variable: filteredProducts.filter((p) => p.type === "variable").length,
    stores: uniqueStores.length,
  };

  // ── Filters + Sort ────────────────────────────────────────────────────────
  useEffect(() => {
    let result = [...products];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(term) ||
          p.slug?.toLowerCase().includes(term) ||
          p.brand?.toLowerCase().includes(term) ||
          p.category?.toLowerCase().includes(term) ||
          p.store?.toLowerCase().includes(term),
      );
    }

    if (statusFilter !== "all") result = result.filter((p) => p.status === statusFilter);
    if (typeFilter !== "all") result = result.filter((p) => p.type === typeFilter);
    if (categoryFilter !== "all") result = result.filter((p) => p.category === categoryFilter);
    if (storeFilter !== "all") result = result.filter((p) => p.store === storeFilter);

    result.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortConfig.key) {
        case "title": aVal = a.title.toLowerCase(); bVal = b.title.toLowerCase(); break;
        case "category": aVal = a.category.toLowerCase(); bVal = b.category.toLowerCase(); break;
        case "store": aVal = (a.store ?? "").toLowerCase(); bVal = (b.store ?? "").toLowerCase(); break;
        case "status": aVal = a.status; bVal = b.status; break;
        default: aVal = a.id; bVal = b.id;
      }
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredProducts(result);
  }, [searchTerm, statusFilter, typeFilter, categoryFilter, storeFilter, sortConfig, products_list]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setCategoryFilter("all");
    setStoreFilter("all");
    setSelectedProducts([]);
  };

  const handleSelectAll = () => {
    setSelectedProducts(
      selectedProducts.length === filteredProducts.length ? [] : filteredProducts.map((p) => p.id)
    );
  };

  const handleSelectProduct = (id: number) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleEdit = (productId: number) => {
    router.push(`/dashboard/admin/products/${productId}`);
  };

  //  Fixed: useRouter() moved to component level — hooks can't be inside functions
  const handleDelete = async (slug: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/api/products/v1/products/${slug}/`);
      toast.success("Product deleted successfully.");
      router.refresh();
    } catch (error: any) {
      const data = error?.response?.data;
      if (data?.errors) {
        Object.entries(data.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(`${field}: ${msg}`));
          }
        });
      } else if (data?.message) {
        toast.error(data.message);
      } else {
        toast.error("Failed to delete product.");
      }
    }
  };

  // ── Badge helpers ─────────────────────────────────────────────────────────

  const getStatusBadge = (status: string) => {
    const map: Record<string, { dot: string; bg: string; text: string; label: string }> = {
      published: { dot: "bg-green-500", bg: "bg-green-100", text: "text-green-800", label: "Published" },
      draft: { dot: "bg-gray-500", bg: "bg-gray-100", text: "text-gray-800", label: "Draft" },
      pending: { dot: "bg-yellow-500", bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
      archived: { dot: "bg-red-500", bg: "bg-red-100", text: "text-red-800", label: "Archived" },
    };
    const s = map[status] ?? map.draft;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
        <span className={`w-2 h-2 mr-1 rounded-full ${s.dot}`} />
        {s.label}
      </span>
    );
  };

  const getTypeBadge = (type: string) =>
    type === "simple" ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">Simple</span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">Variable</span>
    );

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <span className="text-gray-400 ml-1">↕</span>;
    return sortConfig.direction === "asc" ? <span className="text-orange-500 ml-1">↑</span> : <span className="text-orange-500 ml-1">↓</span>;
  };

  // ── Empty state ───────────────────────────────────────────────────────────

  if (!products_list) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <p className="text-gray-500 text-lg">Failed to load products. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-1">Manage all products across all stores</p>
        </div>
        <div className="px-4 py-2 bg-orange-50 rounded-lg border border-orange-100">
          <p className="text-sm text-orange-700">Total Products</p>
          <p className="text-xl font-bold text-orange-900">{pagination?.count ?? products.length}</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total", value: stats.total, color: "blue" },
          { label: "Published", value: stats.published, color: "green" },
          { label: "Draft", value: stats.draft, color: "gray" },
          { label: "Simple", value: stats.simple, color: "sky" },
          { label: "Variable", value: stats.variable, color: "purple" },
          { label: "Stores", value: stats.stores, color: "orange" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-${color}-50 border border-${color}-100 rounded-lg p-3`}>
            <p className={`text-xs font-medium text-${color}-700`}>{label}</p>
            <p className={`text-2xl font-bold text-${color}-900 mt-1`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex flex-wrap items-center justify-between gap-3">
          <span className="text-orange-700 font-medium text-sm">{selectedProducts.length} product(s) selected</span>
          <div className="flex gap-2">
            <button onClick={() => setSelectedProducts([])} className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <input
              type="text"
              placeholder="Search by title, brand, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-sm"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {[
            { value: statusFilter, setter: setStatusFilter, options: [["all","All Status"],["published","Published"],["draft","Draft"],["pending","Pending"],["archived","Archived"]] },
            { value: typeFilter, setter: setTypeFilter, options: [["all","All Types"],["simple","Simple"],["variable","Variable"]] },
            { value: categoryFilter, setter: setCategoryFilter, options: [["all","All Categories"], ...uniqueCategories.map((c) => [c, c])] },
            { value: storeFilter, setter: setStoreFilter, options: [["all","All Stores"], ...uniqueStores.map((s) => [s, s])] },
          ].map(({ value, setter, options }, i) => (
            <select
              key={i}
              value={value}
              onChange={(e) => setter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 text-sm"
            >
              {options.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            {["title", "store", "status"].map((key) => (
              <button
                key={key}
                onClick={() => handleSort(key)}
                className={`px-3 py-1.5 border rounded-lg text-sm flex items-center capitalize ${sortConfig.key === key ? "bg-orange-50 border-orange-300 text-orange-700" : "border-gray-300 text-gray-700"}`}
              >
                {key} {getSortIcon(key)}
              </button>
            ))}
          </div>
          {(searchTerm || statusFilter !== "all" || typeFilter !== "all" || categoryFilter !== "all" || storeFilter !== "all") && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{filteredProducts.length} results</span>
              <button onClick={clearFilters} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left w-10">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-orange-500 rounded border-gray-300"
                />
              </th>
             
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className={`hover:bg-gray-50 transition-colors duration-150 ${selectedProducts.includes(product.id) ? "bg-orange-50" : ""}`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                      className="h-4 w-4 text-orange-500 rounded border-gray-300"
                    />
                  </td>

                  {/* Product */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-gray-100 overflow-hidden shrink-0">
                        {product.main_image ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${product.main_image}`}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.title}</div>
                        <div className="text-xs text-gray-400">#{product.id} · {product.slug}</div>
                      </div>
                    </div>
                  </td>

                  {/* Store & Category */}
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-700">{product.store ?? <span className="text-gray-400 italic">No store</span>}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{product.category}</div>
                  </td>

                  {/* Type & Brand */}
                  <td className="px-4 py-4">
                    {getTypeBadge(product.type)}
                    <div className="text-xs text-gray-500 mt-1">{product.brand ?? "No Brand"}</div>
                  </td>

                 

                  {/* Status */}
                  <td className="px-4 py-4">{getStatusBadge(product.status)}</td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEdit(product.id)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(product.slug)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <p className="text-gray-400 text-sm mt-2">
                    {products.length === 0 ? "No products available." : "No products match your filters."}
                  </p>
                  {products.length > 0 && (
                    <button onClick={clearFilters} className="mt-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm">
                      Clear Filters
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4">
        {pagination && <Pagination paginationData={pagination} />}
      </div>
    </div>
  );
}