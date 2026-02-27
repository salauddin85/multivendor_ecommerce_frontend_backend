"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import SearchBar from "./SearchBar";
import CategoryMenu from "./CategoryMenu";
import CartSidebar from "./Cart";
import { useUserStore } from "@/store/user.store";
import { useAuth } from "@/hooks/useAuth";
import CategoryMenuWrapper from "@/components/category/CategoryMenuWrapper";
import AuthModal from "./AuthModal";

import { logoutUser } from "@/lib/auth.actions";
import { toast } from "react-toastify";
import WishlistIcon from "./WishlistIcon";
import { useRouter } from "next/navigation";

const DesktopNavbar = () => {
  useAuth();
  const router = useRouter();
  const { userType } = useUserStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const logOut = async () => {
    const response = await logoutUser();

    if (response.success) {
      toast.success(response.message);
      window.location.href = "/";
    } else {
      console.log(response);
      toast.error(response.message);
    }
  };

  return (
    <div
      className="w-full bg-white shadow-sm bg-cover bg-center"
      style={{
        backgroundImage: "url('/assets/images/bg-header.jpg')",
      }}
    >
      {/**Mobile search bar */}
      <div className="max-w-sm md:hidden mt-4 mx-auto">
        <SearchBar />
      </div>

      {/* Top section: logo, search, wishlist/cart */}
      <div className="container mx-auto flex items-center justify-between px-4  pt-2 md:pt-3 ">
        <Link href="/" className="block relative w-40  md:w-60 aspect-3/1 mr-4">
          <Image
            src="/assets/images/white_logo.png"
            alt="E-Com logo"
            fill
            className="object-contain"
          />
        </Link>

        <div className="hidden md:flex w-full  justify-center">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2">
          <div>
            <WishlistIcon onAuthRequired={() => setIsAuthModalOpen(true)} />
          </div>
          <div>
            <CartSidebar onAuthRequired={() => setIsAuthModalOpen(true)} />
          </div>
        </div>
      </div>

      <nav className="text-white mt-1">
        <div className="container mx-auto flex items-center justify-between   text-sm">
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              {" "}
              <CategoryMenu />
            </div>
            <div className="md:hidden">
              <CategoryMenuWrapper />
            </div>
            <div className="flex items-center gap-4 ">
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
          <div className="flex items-center justify-end gap-1 md:gap-4 mb-1 mr-2">
            {userType ? (
              <>
                <Link href="/dashboard">
                  <Button
                    variant="link"
                    size="sm"
                    className="text-white cursor-pointer"
                  >
                    {userType == "customer" ? "My Account" : "Dashboard"}
                  </Button>
                </Link>
                <span className="text-sm">/</span>
                <Button
                  variant="link"
                  size="sm"
                  className="text-white cursor-pointer"
                  onClick={logOut}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="link"
                  size="sm"
                  className="text-white cursor-pointer"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  Login
                </Button>
                <span className="text-sm">/</span>
                <Link href="/register">
                  <Button
                    variant="link"
                    size="sm"
                    className="text-white  cursor-pointer"
                  >
                    Register
                  </Button>
                </Link>
              </>
            )}
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

export default DesktopNavbar;
