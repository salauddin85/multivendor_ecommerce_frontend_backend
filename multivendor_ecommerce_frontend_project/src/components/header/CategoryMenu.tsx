"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Menu,
  Smartphone,
  Laptop,
  Sparkles,
  ShoppingCart,
  Sofa,
  Shirt,
  Sun,
  Bike,
  Package,
  X,
  ChevronLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useCategories, type SubCategory } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";

// Default icon mapping
const getDefaultIcon = (categoryName: string) => {
  const lowerName = categoryName.toLowerCase();

  if (lowerName.includes("phone") || lowerName.includes("mobile")) {
    return <Smartphone size={18} color="black" />;
  }
  if (lowerName.includes("laptop") || lowerName.includes("computer")) {
    return <Laptop size={18} color="black" />;
  }
  if (lowerName.includes("perfume") || lowerName.includes("fragrance")) {
    return <Sparkles size={18} color="black" />;
  }
  if (lowerName.includes("grocery") || lowerName.includes("food")) {
    return <ShoppingCart size={18} color="black" />;
  }
  if (lowerName.includes("furniture") || lowerName.includes("sofa")) {
    return <Sofa size={18} color="black" />;
  }
  if (
    lowerName.includes("shirt") ||
    lowerName.includes("top") ||
    lowerName.includes("cloth")
  ) {
    return <Shirt size={18} color="black" />;
  }
  if (lowerName.includes("sun") || lowerName.includes("glass")) {
    return <Sun size={18} color="black" />;
  }
  if (lowerName.includes("bike") || lowerName.includes("motorcycle")) {
    return <Bike size={18} color="black" />;
  }

  return <Package size={18} color="black" />;
};

interface CategoryMenuProps {
  isMobile?: boolean;
}

export default function CategoryMenu({ isMobile = false }: CategoryMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [menuLevel, setMenuLevel] = useState<number>(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { categories, loading, error } = useCategories();

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setMenuLevel(0);
        setSelectedCategory(null);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside as any);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside as any);
    };
  }, [showMenu]);

  // Handle touch gestures for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = e.touches[0].clientX;
    const diff = touchStart - touchEnd;

    // Swipe left to go back in subcategories
    if (diff > 50 && menuLevel > 0) {
      setMenuLevel((prev) => prev - 1);
      setTouchStart(null);
    }
  };

  // Recursive rendering for subcategories - mobile optimized
  const renderSubcategories = (
    subcategories: SubCategory[],
    parentSlug: string,
    level: number = 1
  ) => {
    if (level > 3 || subcategories.length === 0) return null;

    return (
      <ul
        className={cn(
          "space-y-1",
          level > 1 && "ml-4 border-l-2 border-gray-200 pl-3"
        )}
      >
        {subcategories.map((sub) => (
          <li key={sub.id} className="relative">
            <Link
              href={`/products/category/${sub.slug}`}
              className={cn(
                "block py-2 text-sm hover:text-orange-600 transition",
                "px-3 rounded-md hover:bg-gray-50",
                "active:bg-gray-100" // Mobile feedback
              )}
              onClick={() => {
                if (isMobile) {
                  setShowMenu(false);
                  setMenuLevel(0);
                }
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-700">{sub.name}</span>
                {sub.children && sub.children.length > 0 && (
                  <ChevronRight size={14} className="text-gray-400" />
                )}
              </div>
            </Link>

            {sub.children && sub.children.length > 0 && level < 3 && (
              <div className="mt-1">
                {renderSubcategories(
                  sub.children,
                  `${sub.slug}`,
                  level + 1
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  // Mobile menu content
  const renderMobileMenu = () => {
    if (menuLevel === 0) {
      return (
        <div className="space-y-1">
          {categories.map((category) => (
            <button
              key={category.id}
              className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 active:bg-gray-100 transition rounded-md"
              onClick={() => {
                if (category.subcategories.length > 0) {
                  setSelectedCategory(category.name);
                  setMenuLevel(1);
                } else {
                  setShowMenu(false);
                  // Navigate directly if no subcategories
                  window.location.href = `/products/category/${category.slug}`;
                }
              }}
            >
              <div className="flex items-center gap-3">
                {category.icon ? (
                  <div className="relative w-5 h-5">
                    <Image
                      src={category.icon}
                      alt={category.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  getDefaultIcon(category.name)
                )}
                <span className="text-gray-800 font-medium">
                  {category.name}
                </span>
              </div>
              {category.subcategories.length > 0 && (
                <ChevronRight size={16} className="text-gray-400" />
              )}
            </button>
          ))}
        </div>
      );
    }

    if (menuLevel === 1 && selectedCategory) {
      const category = categories.find((c) => c.name === selectedCategory);
      if (!category) return null;

      return (
        <div
          className="h-full"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <div className="sticky top-0 bg-white border-b z-10">
            <button
              className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:text-orange-600"
              onClick={() => {
                setMenuLevel(0);
                setSelectedCategory(null);
              }}
            >
              <ChevronLeft size={18} />
              <span className="font-medium">Back</span>
            </button>
            <div className="px-4 pb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {category.name}
              </h3>
              <Link
                href={`/products/category/${category.slug}`}
                className="text-sm text-orange-600 hover:underline mt-1 inline-block"
                onClick={() => setShowMenu(false)}
              >
                View all {category.name}
              </Link>
            </div>
          </div>

          <div className="p-4 overflow-y-auto max-h-[calc(100vh-180px)]">
            <div className="space-y-4">
              {category.subcategories.map((sub) => (
                <div key={sub.id} className="space-y-2">
                  <Link
                    href={`/products/category/${sub.slug}`}
                    className="block py-2 text-base font-medium text-gray-900 hover:text-orange-600"
                    onClick={() => setShowMenu(false)}
                  >
                    {sub.name}
                  </Link>
                  {sub.children && sub.children.length > 0 && (
                    <div className="ml-3 space-y-1">
                      {sub.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/products/category/${child.slug}`}
                          className="block py-1.5 text-sm text-gray-600 hover:text-orange-600 pl-3 border-l border-gray-300"
                          onClick={() => setShowMenu(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  };
// categories.forEach((cat, index) => {
//     console.log(`Category ${index}:`, cat.name, 'Icon:', cat.icon);
//   });  
// Desktop menu content
  const renderDesktopMenu = () => (
    <Card className="absolute left-0 top-full w-full md:w-96 bg-white shadow-xl rounded-b-lg z-50 border-t-0">
      <CardContent className="p-0">
        <div className="flex h-[500px]">
          {/* Categories List */}
          <div className="w-1/3 border-r overflow-y-auto">
            <ul className="divide-y divide-gray-100">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="relative group"
                  onMouseEnter={() => setActiveCategory(category.id)}
                >
                  <Link
                    href={`/products/category/${category.slug}`}
                    className={cn(
                      "flex items-center justify-between px-4 py-3",
                      "hover:bg-gray-50 transition-colors",
                      activeCategory === category.id && "bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {category.icon ? (
                        <div className="relative w-5 h-5">
                          <Image
                            // src={category.icon}
                            src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${category.icon}`}

                            alt={category.name}
                            fill
                            className="object-contain"
                          />
                          {/* <Image
                            className="rounded-md"
                            src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${category.icon}`}
                            width={260}
                            height={250}
                            alt={category.name}
                            // fill
                          /> */}
                        </div>
                      ) : (
                        getDefaultIcon(category.name)
                      )}
                      <span className="text-gray-800 font-medium">
                        {category.name}
                      </span>
                    </div>
                    {category.subcategories.length > 0 && (
                      <ChevronRight className="text-gray-400" size={16} />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Subcategories Panel */}
          <div className="w-2/3 p-4 overflow-y-auto">
            {activeCategory && (
              <>
                {(() => {
                  const category = categories.find(
                    (c) => c.id === activeCategory
                  );
                  if (!category) return null;

                  return (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {category.name}
                        </h3>
                        <Link
                          href={`/products/category/${category.slug}`}
                          className="text-sm text-orange-600 hover:underline"
                        >
                          View all {category.name}
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {category.subcategories.map((sub) => (
                          <div key={sub.id} className="space-y-2">
                            <Link
                              href={`/products/category/${sub.slug}`}
                              className="block text-sm font-medium text-gray-900 hover:text-orange-600"
                            >
                              {sub.name}
                            </Link>
                            {sub.children && sub.children.length > 0 && (
                              <ul className="space-y-1 ml-2">
                                {sub.children.slice(0, 4).map((child) => (
                                  <li key={child.id}>
                                    <Link
                                      href={`/products/category/${child.slug}`}
                                      className="block text-xs text-gray-600 hover:text-orange-600 py-1"
                                    >
                                      {child.name}
                                    </Link>
                                  </li>
                                ))}
                                {sub.children.length > 4 && (
                                  <li>
                                    <Link
                                      href={`/products/category/${sub.slug}`}
                                      className="block text-xs text-orange-600 hover:underline py-1"
                                    >
                                      + {sub.children.length - 4} more
                                    </Link>
                                  </li>
                                )}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // if (loading) {
  //   return (
  //     <div className="flex items-center gap-2 bg-orange-600 text-white font-semibold px-4 py-3 rounded-lg md:rounded-t-md">
  //       <Menu size={18} color="white" />
  //       <span>LOADING...</span>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="flex items-center gap-2  cursor-pointer text-white font-semibold px-4 py-3 rounded-lg md:rounded-t-md">
        <Menu size={18} color="white" />
        <span>CATEGORIES</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Mobile Menu Trigger */}
      {isMobile ? (
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={cn(
            "flex items-center gap-2 w-full justify-center",
            " text-white font-semibold ",
            "active:bg-orange-700 transition-colors",
            "touch-manipulation" // Disable double-tap zoom on mobile
          )}
        >
          <Menu size={26} color="white" />
          <span className="text-xs hidden md:block">All Categories</span>
        </button>
      ) : (
        /* Desktop Menu Trigger */
        <button
          onMouseEnter={() => setShowMenu(true)}
          className="hidden md:flex items-center gap-2 bg-orange-600 text-white font-semibold px-4 py-3 rounded-t-md hover:bg-orange-700 transition"
        >
          <Menu size={18} color="white" />
          <span>ALL CATEGORIES</span>
        </button>
      )}

      {/* Mobile Menu Overlay */}
      {isMobile && showMenu && (
        <div className="fixed inset-0 z-9999 bg-black/50 animate-in fade-in">
          <div
            className="absolute inset-0"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute left-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-xl animate-in slide-in-from-left">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b bg-orange-600 text-white">
                <h2 className="text-lg font-semibold">Categories</h2>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-1 active:bg-orange-700 rounded"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">{renderMobileMenu()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Menu Dropdown */}
      {!isMobile && showMenu && (
        <div
          onMouseEnter={() => setShowMenu(true)}
          onMouseLeave={() => {
            setShowMenu(false);
            setActiveCategory(null);
          }}
          className="hidden md:block"
        >
          {renderDesktopMenu()}
        </div>
      )}
    </div>
  );
}
