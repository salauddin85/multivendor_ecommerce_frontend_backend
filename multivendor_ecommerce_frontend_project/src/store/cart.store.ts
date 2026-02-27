import { create } from "zustand";
import { Product } from "@/types/product";

interface CartItem {
  item: Product;
  quantity: number;
}

interface CartStore {
  cart: CartItem[];

  addToCart: (item: Product, quantity: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;

  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: [],

  addToCart: (item, quantity) =>
    set((state) => {
      const existing = state.cart.find((c) => c.item.id === item.id);
      if (existing) {
        return {
          cart: state.cart.map((c) =>
            c.item.id === item.id
              ? { ...c, quantity: c.quantity + quantity }
              : c
          ),
        };
      }
      return { cart: [...state.cart, { item, quantity }] };
    }),

  removeFromCart: (id) =>
    set((state) => ({
      cart: state.cart.filter((c) => c.item.id !== id),
    })),

  updateQuantity: (id, quantity) =>
    set((state) => ({
      cart: state.cart.map((c) => (c.item.id === id ? { ...c, quantity } : c)),
    })),

  clearCart: () => set({ cart: [] }),

  totalItems: () => get().cart.reduce((acc, c) => acc + c.quantity, 0),

  totalPrice: () =>
    get().cart.reduce((acc, c) => acc + (c.item as any).price * c.quantity, 0),
}));
