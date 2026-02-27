import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CheckoutItem {
  id?: number; // item ID if it comes from cart
  product: number;
  variant?: number;
  quantity: number;
  product_name: string;
  price: number;
  image: string;
}

interface CheckoutStore {
  orderId: number | null;
  orderDetails: any | null;
  items: CheckoutItem[]; // Keep for display
  totalPrice: number; // Keep for display
  
  setOrderId: (id: number) => void;
  setOrderDetails: (details: any) => void;
  setCheckoutItems: (items: CheckoutItem[], total: number) => void;
  clearCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set, get) => ({
      orderId: null,
      orderDetails: null,
      items: [],
      totalPrice: 0,
      
      setOrderId: (id) => set({ orderId: id }),
      setOrderDetails: (details) => set({ orderDetails: details }),
      setCheckoutItems: (items, total) => set({ items, totalPrice: total }),
      clearCheckout: () => set({ 
        orderId: null, 
        orderDetails: null, 
        items: [], 
        totalPrice: 0 
      }),
    }),
    {
      name: "checkout-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
