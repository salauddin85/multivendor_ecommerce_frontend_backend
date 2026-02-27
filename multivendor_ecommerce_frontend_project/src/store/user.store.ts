import { create } from "zustand";
import { user_type } from "@/types/user";

interface UserStore {
  userType: user_type;
  userData: any;
  setUserData: (data: any) => void;
  setUser: (type: user_type) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  userType: null,
  userData: null,

  setUser: (type: user_type) => set({ userType: type }),
  setUserData: (data:any) => set({ userData: data }),
}));
