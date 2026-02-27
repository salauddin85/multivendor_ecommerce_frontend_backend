import React from "react";
import WishlistItems from "@/components/dashboard/customer/WishlistItems";
import { getWishlistItems } from "@/actions/wishlist.action";

export default async function WishlistPage() {
  const { data } = await getWishlistItems();

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-2">My Wishlist</h1>
      <p className="text-muted-foreground mb-6">Browse your saved products.</p>

      <WishlistItems initialItems={data} />
    </div>
  );
}
