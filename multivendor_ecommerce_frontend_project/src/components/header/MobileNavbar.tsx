"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CircleUserRound, LayoutDashboard, UserLock } from "lucide-react";
import SearchBar from "./SearchBar";
import CartSidebar from "./Cart";
import { useUserStore } from "@/store/user.store";
import { useAuth } from "@/hooks/useAuth";
import CategoryMenuWrapper from "@/components/category/CategoryMenuWrapper";
import AuthModal from "./AuthModal";
import { useRouter } from "next/navigation";

const MobileNavbar = () => {
  useAuth();
  const { userType } = useUserStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const router = useRouter();
  return (
    <div
      className="w-full bg-white bg-cover bg-center"
      style={{
        backgroundImage: "url('/assets/images/bg-header.jpg')",
      }}
    >
      <div className="container mx-auto flex items-center justify-between px-4  pt-2 md:pt-6 ">
        <div className="md:hidden flex items-center gap-2">
          <CategoryMenuWrapper />

          <Link
            href="/"
            className="block relative w-35  md:w-50 aspect-3/1 mr-4"
          >
            <Image
              src="/assets/images/white_logo.png"
              alt="E-Com logo"
              fill
              className="object-contain"
            />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-white cursor-pointer">
            {userType ? (
              <>
                {userType == "customer" ? (
                  <CircleUserRound
                    className="size-6"
                    onClick={() => router.push("/dashboard")}
                  />
                ) : (
                  <LayoutDashboard
                    className="size-6"
                    onClick={() => router.push("/dashboard")}
                  />
                )}
              </>
            ) : (
              <>
                <div
                  className="text-white cursor-pointer"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  <UserLock className="size-6" />
                </div>
              </>
            )}
          </div>
          <div>
            <CartSidebar onAuthRequired={() => setIsAuthModalOpen(true)} />
          </div>
        </div>
      </div>

      {/**Mobile search bar */}
      <div className="w-full md:hidden mt-1 mx-auto">
        <SearchBar />
      </div>

      {/* Bottom section: categories, login/register */}
      <nav className="text-white my-2">
        <div className="container mx-auto px-4 text-sm">
          <div className="flex items-center justify-between gap-4 ">
            <Link href="/products" className="hover:underline">
              Products
            </Link>
            <Link href="/blogs" className="hover:underline">
              Blogs
            </Link>
            <Link href="/deals" className="hover:underline">
              Deals
            </Link>
            <Link
              href="/products/?new_arrival=true"
              className="hover:underline"
            >
              New Arrivals
            </Link>
            <Link href="/brands" className="hover:underline">
              Brands
            </Link>
            {/* <Link href="/best" className="hover:underline">
              Best Sellers
            </Link> */}
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default MobileNavbar;
