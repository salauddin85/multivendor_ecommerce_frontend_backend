"use client";

import React, { useEffect } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWishlistStore } from "@/store/wishlist_store";
import { useUserStore } from "@/store/user.store";

const WishlistIcon = ({ onAuthRequired }: { onAuthRequired?: () => void }) => {
  const router = useRouter();
  const { totalItems, fetchWishlist } = useWishlistStore();
  const { userType } = useUserStore();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleClick = () => {
    if (!userType) {
      onAuthRequired?.();
    } else {
      router.push("/dashboard/customer/wishlist");
    }
  };

  return (
    <Button
      size="icon"
      variant="link"
      className="relative"
      onClick={handleClick}
    >
      <Heart className="size-6 text-white" />

      {totalItems > 0 && (
        <Badge
          className="absolute left-full bottom-full -ml-3 -mb-3 h-5 min-w-5 rounded-full px-1 text-xs"
          variant="default"
        >
          {totalItems}
        </Badge>
      )}
    </Button>
  );
};

export default WishlistIcon;
