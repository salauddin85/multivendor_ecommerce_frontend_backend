import React from "react";
import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import SearchBar from "@/components/header/SearchBar";
import CartDrawer from "@/components/header/Cart";
import { Button } from "@/components/ui/button";
import MobileDrawer from "./MobileDrawer";

import WishlistIcon from "@/components/header/WishlistIcon";

const Header = () => {
  return (
    <div>
      <header
        className="w-full bg-white shadow-sm bg-cover bg-center sticky top-0 z-50"
        style={{
          backgroundImage: "url('/assets/images/bg-header.jpg')",
        }}
      >
        <div className="container mx-auto flex items-center justify-between p-4    ">
          <Link
            href="/"
            className="block relative w-40  md:w-45 aspect-3/1 mr-4"
          >
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
              <WishlistIcon />
            </div>
            <div>
              <CartDrawer />
            </div>
            <div>
              <MobileDrawer  />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
