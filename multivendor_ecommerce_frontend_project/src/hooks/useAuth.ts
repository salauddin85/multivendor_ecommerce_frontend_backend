"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/user.store";

export const useAuth = () => {
  const { setUser } = useUserStore();

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/status");
        const { userType } = await res.json();

        if (userType) {
          setUser(userType);
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      }
    }

    loadUser();
  }, []);
};
