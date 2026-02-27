// store/storeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoreData {
  id?: number;
  store_name?: string;
  slug?: string;
  type?: string;
  address?: string;
  description?: string;
  logo?: string | null;
  banner?: string | null;
  vendor?: string | null;
  is_verified?: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
  store_owner?: string | null;
}

interface StoreState {
  storeData: StoreData | null;
  setStoreData: (data: StoreData) => void;
  clearStoreData: () => void;
}

export const useStoreData = create<StoreState>()(
  persist(
    (set) => ({
      storeData: null,
      setStoreData: (data) => set({ storeData: data }),
      clearStoreData: () => set({ storeData: null }),
    }),
    {
      name: 'store-data-storage', // LocalStorage key name
    }
  )
);