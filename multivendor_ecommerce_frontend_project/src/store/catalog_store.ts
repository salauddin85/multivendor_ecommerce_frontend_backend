import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CategoryFormData {
  id?: number;
  name: string;
  slug: string;
  parent_id: number | null;
  icon: File | string | null;
  display_order: number;
  is_active: boolean;
}

interface CategoryStore {
  editingCategory: CategoryFormData | null;
  setEditingCategory: (category: CategoryFormData | null) => void;
  clearEditingCategory: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      editingCategory: null,
      setEditingCategory: (category) => set({ editingCategory: category }),
      clearEditingCategory: () => set({ editingCategory: null }),
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "category-store",
      partialize: (state) => ({ editingCategory: state.editingCategory }),
    }
  )
);