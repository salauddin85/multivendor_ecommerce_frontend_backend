import { create } from "zustand";
import { getWishlistItems } from "@/actions/wishlist.action";

interface WishlistStore {
  wishlistItems: any[];
  totalItems: number;
  isLoading: boolean;
  
  fetchWishlist: () => Promise<void>;
  setWishlistData: (items: any[], count: number) => void;
  clearWishlistStore: () => void;
}

export const useWishlistStore = create<WishlistStore>((set) => ({
  wishlistItems: [],
  totalItems: 0,
  isLoading: false,

  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const res = await getWishlistItems();
      if (res.success) {
        set({
          wishlistItems: res.data || [],
          totalItems: res.data?.length || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  setWishlistData: (items, count) => {
    set({
      wishlistItems: items,
      totalItems: count,
    });
  },

  clearWishlistStore: () => {
    set({
      wishlistItems: [],
      totalItems: 0,
    });
  },
}));
