// components/category/CategoryMenuWrapper.tsx
"use client";

import { useState, useEffect } from "react";
import CategoryMenu from "../header/CategoryMenu";

export default function CategoryMenuWrapper() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add event listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return <CategoryMenu isMobile={isMobile} />;
}