"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { logoutUser } from "@/lib/auth.actions";
import { toast } from "react-toastify";

const navItems = [
  { label: "My orders", href: "/dashboard/customer/orders" },
  { label: "My deliveries", href: "/dashboard/customer/deliveries" },
  { label: "My cancellations", href: "/dashboard/customer/cancellations" },
  { label: "My wishlist", href: "/dashboard/customer/wishlist" },
  { label: "My reviews", href: "/dashboard/customer/reviews" },
  { label: "Address Book", href: "/dashboard/customer/address" },
  { label: "Logout", href: "/logout" },
];

const MobileDrawer = () => {
  const pathname = usePathname();

  const handleLogOut = async () => {
    try {
      const response = await logoutUser();

      if (response.success) {
        toast.success(response.message);
        window.location.href = "/login";
      } else {
        console.log(response);
        toast.error(response.message);
      }
    } catch (err) {
      console.log(err);
      toast.error("Log Out Failed");
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="link" size="icon" className="md:hidden">
          <Menu className="size-6 text-white" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>My Account</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4 space-y-1">
          {navItems.map((item) => {
           const isActive = pathname.startsWith(item.href);
            if (item.label === "Logout") {
              return (
                <DrawerClose asChild key={item.href}>
                  <div
                    onClick={handleLogOut}
                    className="block rounded-md px-3 py-2 text-sm hover:bg-muted cursor-pointer text-red-500 hover:text-red-600"
                  >
                    {item.label}
                  </div>
                </DrawerClose>
              );
            }
            return (
              <DrawerClose asChild key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded-md px-3 py-2 text-sm hover:bg-muted ${
                    isActive ? "bg-muted font-medium" : ""
                  }`}
                >
                  {item.label}
                </Link>
              </DrawerClose>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileDrawer;
