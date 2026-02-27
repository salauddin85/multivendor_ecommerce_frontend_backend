import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';

// --- Types Definition ---

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  display_order: number;
  children: ApiCategory[]; // Recursive structure from API
}

interface ApiResponse {
  code: number;
  status: string;
  message: string;
  data: ApiCategory[];
}

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  children?: ApiCategory[]; // Level 3 children
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  subcategories: SubCategory[];
}

// --- Hook Implementation ---

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        // Axios instance call
        const response = await axiosInstance.get<ApiResponse>('/api/catalog/v1/categories_tree/?product_available=true');
        
        // Axios automatic provides the data object
        const result = response.data;
        console.log(result);

        if (result.status === 'success' || result.code === 200) {
          // Transform API nested data to your preferred structure
          const transformedCategories: Category[] = result.data.map((cat) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
            subcategories: cat.children.map((child) => ({
              id: child.id,
              name: child.name,
              slug: child.slug,
              icon: child.icon,
              children: child.children, // Mapping Level 3 (e.g., Smartphones, Laptops)
            })),
          }));

          setCategories(transformedCategories);
          setError(null);
        } else {
          throw new Error(result.message || 'Failed to fetch categories');
        }

      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}