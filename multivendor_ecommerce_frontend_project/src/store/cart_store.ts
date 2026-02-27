import { create } from "zustand";
import { get_cart_items } from "@/actions/cart.action";

interface CartStore {
  cartItems: any[];
  totalPrice: number;
  totalItems: number;
  isLoading: boolean;
  
  fetchCart: () => Promise<void>;
  setCartData: (items: any[], total: number, count: number) => void;
  clearCartStore: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  cartItems: [],
  totalPrice: 0,
  totalItems: 0,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await get_cart_items();
      if (!res.error) {
        set({
          cartItems: res.data?.items || [],
          totalPrice: res.total_price || 0,
          totalItems: res.total_items || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  setCartData: (items, total, count) => {
    set({
      cartItems: items,
      totalPrice: total,
      totalItems: count,
    });
  },

  clearCartStore: () => {
    set({
      cartItems: [],
      totalPrice: 0,
      totalItems: 0,
    });
  },
}));
