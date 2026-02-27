"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  MapPin,
  CreditCard,
  Package,
  RotateCcw,
  XCircle,
  Heart,
  Store,
  LogOut,
  PackageCheck,
  Star,
} from "lucide-react";

const navItems = [
  { label: "My orders", href: "/dashboard/customer/orders", icon: Package },
  {
    label: "My cancellations",
    href: "/dashboard/customer/cancellations",
    icon: XCircle,
  },
  { label: "My deliveries", href: "/dashboard/customer/deliveries", icon: PackageCheck },
  { label: "My wishlist", href: "/dashboard/customer/wishlist", icon: Heart },
  { label: "My reviews", href: "/dashboard/customer/reviews", icon: Star },
  { label: "Address Book", href: "/dashboard/customer/address", icon: MapPin },
  {
    label: "Logout",
    href: "/logout",
    icon: LogOut,
  },
];

import { logoutUser } from "@/lib/auth.actions";
import { toast } from "react-toastify";


const Sidebar = () => {
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
    <aside className="hidden md:block w-64 border-r">
      <div className="px-4 py-6">
        <h2 className="text-lg font-semibold mb-4">My Account</h2>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            if (item.label === "Logout") {
              return (
                <button
                  key={item.href}
                  onClick={handleLogOut}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted transition text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm 
                  hover:bg-muted transition
                  ${isActive ? "bg-muted font-medium text-primary" : ""}
                `}
              >
                <Icon
                  className={`size-4 
                    ${isActive ? "text-primary" : "text-muted-foreground"}
                  `}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
