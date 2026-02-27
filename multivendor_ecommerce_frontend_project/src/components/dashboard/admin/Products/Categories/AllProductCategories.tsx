'use client'
import React, { useState} from "react";
import { ChevronDown, ChevronRight, Folder, FolderOpen, Trash2 } from "lucide-react";
import Pagination from "@/components/pagination/Pagination";
import { useCategoryStore } from "@/store/catalog_store";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios"
import { toast } from "react-toastify"
import Image from "next/image";

const handleDelete = async (slug: string) => {
  if (!confirm(`Are you sure you want to delete "${slug}"?`)) return;

  try {
    await axiosInstance.delete(`/api/catalog/v1/categories/${slug}/`);
    toast.success("Category deleted successfully");

   
  } catch (error: any) {
    console.error("Error deleting category:", error);

    const responseData = error?.response?.data;

    // 🔹 Field-wise errors (DRF)
    if (responseData?.errors) {
      Object.entries(responseData.errors).forEach(
        ([field, messages]: [string, any]) => {
          if (Array.isArray(messages)) {
            messages.forEach((message: string) => {
              toast.error(`${field}: ${message}`);
            });
          } else if (typeof messages === "string") {
            toast.error(`${field}: ${messages}`);
          }
        }
      );
    }
    // 🔹 General backend message
    else if (responseData?.message) {
      toast.error(responseData.message);
    }
    // 🔹 DRF default detail
    else if (responseData?.detail) {
      toast.error(responseData.detail);
    }
    // 🔹 Fallback
    else {
      toast.error("Failed to delete category");
    }
  }
};




interface Category {
  id: number;
  name: string;
  slug: string;
  parent: {
    id: number;
    name: string;
    slug: string;
  } | null;
  icon: string | null;
  display_order: number;
}

interface CategoriesResponse {
  code: number;
  status: string;
  message: string;
  data: Category[];
  pagination: {
    count: number;
    total_pages: number;
    current_page: number;
    next: string | null;
    previous: string | null;
    page_size: number;
  };
}

interface AllProductCategoriesProps {
  categories: CategoriesResponse;
}

interface TreeNode extends Category {
  children: TreeNode[];
  level: number;
}

export default function AllProductCategories({ categories }: AllProductCategoriesProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { setEditingCategory } = useCategoryStore();

  if (!categories || !categories.data) {
    return <div className="text-center py-10">No categories found</div>;
  }

  const { data, pagination } = categories;

  // Build tree structure
  const buildCategoryTree = (): TreeNode[] => {
    const categoryMap = new Map<number, TreeNode>();
    const rootCategories: TreeNode[] = [];

    data.forEach((category) => {
      categoryMap.set(category.id, {
        ...category,
        children: [],
        level: 0,
      });
    });

    data.forEach((category) => {
      const node = categoryMap.get(category.id)!;
      
      if (category.parent) {
        const parentNode = categoryMap.get(category.parent.id);
        if (parentNode) {
          node.level = parentNode.level + 1;
          parentNode.children.push(node);
          parentNode.children.sort((a, b) => a.display_order - b.display_order);
        }
      } else {
        rootCategories.push(node);
      }
    });

    return rootCategories.sort((a, b) => a.display_order - b.display_order);
  };

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const filterCategories = (nodes: TreeNode[], search: string): TreeNode[] => {
    if (!search) return nodes;

    return nodes.filter(node => {
      const matches = node.name.toLowerCase().includes(search.toLowerCase());
      const childrenMatches = filterCategories(node.children, search);
      
      if (matches || childrenMatches.length > 0) {
        if (childrenMatches.length > 0) {
          node.children = childrenMatches;
        }
        return true;
      }
      return false;
    });
  };



const handleDelete = async (slug: string) => {
  if (!confirm(`Are you sure you want to delete "${slug}"?`)) return;

  try {
    await axiosInstance.delete(`/api/catalog/v1/categories/${slug}/`);
    toast.success("Category deleted successfully");

    // optional: refresh list
    // fetchCategories();
  } catch (error: any) {
    console.error("Error deleting category:", error);

    const responseData = error?.response?.data;

    // 🔹 Field-wise errors (DRF)
    if (responseData?.errors) {
      Object.entries(responseData.errors).forEach(
        ([field, messages]: [string, any]) => {
          if (Array.isArray(messages)) {
            messages.forEach((message: string) => {
              toast.error(`${field}: ${message}`);
            });
          } else if (typeof messages === "string") {
            toast.error(`${field}: ${messages}`);
          }
        }
      );
    }
    // 🔹 General backend message
    else if (responseData?.message) {
      toast.error(responseData.message);
    }
    // 🔹 DRF default detail
    else if (responseData?.detail) {
      toast.error(responseData.detail);
    }
    // 🔹 Fallback
    else {
      toast.error("Failed to delete category");
    }
  }
};

  const handleEdit = (category: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setEditingCategory({
      id: category.id,
      name: category.name,
      slug: category.slug,
      parent_id: category.parent?.id || null,
      icon: category.icon,
      display_order: category.display_order,
      is_active: true,
    });
    
    router.push(`/dashboard/admin/catalogs/categories/add/?category_id=${category.id}`);
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    router.push('/dashboard/admin/catalogs/categories/add');
  };

  const calculateNestedLevels = () => {
    let maxLevel = 0;
    const findMaxLevel = (nodes: TreeNode[], level: number) => {
      maxLevel = Math.max(maxLevel, level);
      nodes.forEach(node => {
        findMaxLevel(node.children, level + 1);
      });
    };
    findMaxLevel(buildCategoryTree(), 1);
    return maxLevel;
  };

  const renderCategoryTree = (nodes: TreeNode[]) => {
    const filteredNodes = searchTerm ? filterCategories(nodes, searchTerm) : nodes;

    return filteredNodes.map((node) => {
      const isExpanded = expandedCategories.has(node.id);
      const hasChildren = node.children.length > 0;

      return (
        <div key={node.id} className="space-y-1">
          <div
            className="flex items-center gap-2 p-2 sm:p-3 rounded-lg hover:bg-slate-50 transition-colors min-w-max"
            style={{ paddingLeft: `${node.level * 24 + 12}px` }}
          >
            {hasChildren ? (
              <button
                onClick={() => toggleCategory(node.id)}
                className="p-1 hover:bg-slate-200 rounded transition-colors flex-shrink-0"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                )}
              </button>
            ) : (
              <div className="w-6 flex-shrink-0" />
            )}
            
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                {node.icon ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${node.icon}`}
                    alt={node.name}
                    className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
                    width={32}
                    height={32}
                  />
                ) : (
                  <div className="h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center text-orange-600">
                    {isExpanded ? (
                      <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Folder className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-sm sm:text-base text-slate-800">{node.name}</h3>
                  {node.parent && (
                    <span className="text-xs text-slate-500 px-2 py-0.5 bg-slate-100 rounded whitespace-nowrap">
                      Child of {node.parent.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500 flex-wrap">
                  <span className="whitespace-nowrap">Slug: {node.slug}</span>
                  <span className="whitespace-nowrap">ID: {node.id}</span>
                  <span className="whitespace-nowrap">Order: {node.display_order}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {hasChildren && (
                  <span className="hidden sm:inline-block text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded whitespace-nowrap">
                    {node.children.length} sub
                  </span>
                )}
                <button 
                      onClick={(e) => handleEdit(node, e)}

                  className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-md transition-colors whitespace-nowrap"
                >
                  Edit
                </button>
                <button 
                  onClick={(e) => handleDelete(node.slug)}
                  className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>
          </div>
          
          {hasChildren && isExpanded && (
            <div>
              {renderCategoryTree(node.children)}
            </div>
          )}
        </div>
      );
    });
  };

  const categoryTree = buildCategoryTree();
  const hasSearchResults = searchTerm ? filterCategories(categoryTree, searchTerm).length > 0 : true;
  const nestedLevels = calculateNestedLevels();

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border shadow-sm p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">Product Categories</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your product categories and hierarchy
            </p>
          </div>
          <button className="px-4 sm:px-5 py-2.5 rounded-md text-white bg-orange-400 hover:bg-orange-500 transition font-medium text-sm sm:text-base"
                  onClick={handleAddNew}>
            Add New Category
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
          <div className="bg-slate-50 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-slate-500">Total Categories</p>
            <p className="text-lg sm:text-2xl font-semibold text-slate-800">{pagination.count}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-slate-500">Root Categories</p>
            <p className="text-lg sm:text-2xl font-semibold text-slate-800">
              {categoryTree.length}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-slate-500">Nested Levels</p>
            <p className="text-lg sm:text-2xl font-semibold text-slate-800">{nestedLevels}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-slate-500">With Icons</p>
            <p className="text-lg sm:text-2xl font-semibold text-slate-800">
              {data.filter(cat => cat.icon).length}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="bg-white rounded-xl border shadow-sm p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm sm:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setExpandedCategories(new Set())}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap flex-shrink-0"
            >
              Collapse All
            </button>
            <button
              type="button"
              onClick={() => {
                const allIds = data.map(cat => cat.id);
                setExpandedCategories(new Set(allIds));
              }}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap flex-shrink-0"
            >
              Expand All
            </button>
          </div>
        </div>
      </div>

      {/* Categories List - WITH HORIZONTAL SCROLL */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="border-b px-4 sm:px-5 py-3">
          <h2 className="text-xs sm:text-sm font-semibold text-slate-700 tracking-wide uppercase">
            Category Hierarchy
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Showing {data.length} of {pagination.count} categories (Page {pagination.current_page} of {pagination.total_pages})
          </p>
        </div>
        
        {/* HORIZONTAL SCROLL CONTAINER */}
        <div className="overflow-x-auto">
          <div className="p-4 sm:p-5 min-w-max">
            {!hasSearchResults ? (
              <div className="text-center py-10">
                <div className="text-slate-400 mb-3">
                  <svg className="h-10 w-10 sm:h-12 sm:w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm sm:text-base text-slate-600">No categories found matching "{searchTerm}"</p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-3 text-sm sm:text-base text-orange-500 hover:text-orange-600 font-medium"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {renderCategoryTree(categoryTree)}
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="bg-white rounded-xl border shadow-sm p-5 overflow-x-auto">
          <div className="min-w-max">
            <Pagination paginationData={pagination} />
          </div>
        </div>
      )}
    </div>
  );
}