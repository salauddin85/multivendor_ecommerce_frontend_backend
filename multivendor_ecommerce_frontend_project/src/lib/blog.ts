import { create } from 'zustand';

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

interface BlogStore {
  categories: Category[];
  tags: Tag[];
  isLoading: boolean;
  setCategories: (categories: Category[]) => void;
  setTags: (tags: Tag[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  fetchCategories: () => Promise<void>;
  fetchTags: () => Promise<void>;
}

export const useBlogStore = create<BlogStore>((set) => ({
  categories: [],
  tags: [],
  isLoading: false,
  
  setCategories: (categories) => set({ categories }),
  setTags: (tags) => set({ tags }),
  setIsLoading: (isLoading) => set({ isLoading }),
  
  fetchCategories: async () => {
    try {
      set({ isLoading: true });
      const response = await fetch('/api/blogs/v1/categories/', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.code === 200) {
        set({ categories: data.data });
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchTags: async () => {
    try {
      set({ isLoading: true });
      const response = await fetch('/api/blogs/v1/tags/', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.code === 200) {
        set({ tags: data.data });
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));