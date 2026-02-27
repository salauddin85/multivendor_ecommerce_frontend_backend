"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { delete_wishlist_item } from "@/actions/wishlist.action";
import { add_to_cart } from "@/actions/cart.action";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import RatingStars from "@/components/ReviewStars";
import { useWishlistStore } from "@/store/wishlist_store";

interface WishlistItemsProps {
  initialItems: any[];
}

const WishlistItems: React.FC<WishlistItemsProps> = ({ initialItems }) => {
  const [loadingItems, setLoadingItems] = useState<Record<string, 'cart' | 'delete' | null>>({});
  const router = useRouter();

  const handleAddToCart = async (item: any) => {
    setLoadingItems((prev: Record<string, any>) => ({ ...prev, [item.id]: 'cart' }));
    try {
      const response = await add_to_cart(item.product.id, item.variant?.id, 1);
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } finally {
      setLoadingItems((prev: Record<string, any>) => ({ ...prev, [item.id]: null }));
    }
  };

  const handleDelete = async (itemId: number) => {
    setLoadingItems((prev: Record<string, any>) => ({ ...prev, [itemId]: 'delete' }));
    try {
      const response = await delete_wishlist_item(itemId);
      if (response.success) {
        toast.success(response.message);
        await useWishlistStore.getState().fetchWishlist();
        router.refresh();
      } else {
        toast.error(response.message);
      }
    } finally {
      setLoadingItems((prev: Record<string, any>) => ({ ...prev, [itemId]: null }));
    }
  };
  if (!initialItems || initialItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-muted/30 p-6 rounded-full mb-4">
          <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold">Your wishlist is empty</h3>
        <p className="text-muted-foreground max-w-sm mt-2 mb-6">
          Looks like you haven&apos;t added anything to your wishlist yet.
        </p>
        <Link href="/products">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {initialItems.map((item) => (
        <div
          key={item.id}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg hover:bg-muted/5 transition-colors"
        >
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-muted">
            <Image
              src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${item.variant?.image || item.product.main_image}`}
              alt={item.product.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex flex-1 flex-col gap-1">
            <h3 className="font-semibold dark:text-gray-400">
                <Link href={`/products/${item.product.slug}`} className="hover:underline">
                    {item.product.title}
                </Link>
            </h3>
            <div className="mt-1">
              <RatingStars 
                avgRating={parseFloat(item.product.avg_rating || "0")} 
                totalReviews={item.product.total_reviews || 0} 
                showText={false} 
                size={14}
              />
            </div>
             <div className="mt-2 flex items-center gap-2">
                 <span className="font-bold text-lg dark:text-gray-400">
                    ৳{item.variant ? item.variant.price : item.product.base_price}
                 </span>
                 {item.product.old_price && (
                    <span className="text-sm text-muted-foreground line-through">
                         ৳{parseFloat(item.product.old_price).toFixed(2)}
                    </span>
                 )}
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
             <Button 
                className="w-full sm:w-auto" 
                size="sm"
                onClick={() => handleAddToCart(item)}
                disabled={!!loadingItems[item.id]}
              >
                {loadingItems[item.id] === 'cart' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                Add to Cart
             </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full sm:w-auto text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => handleDelete(item.id)}
              disabled={!!loadingItems[item.id]}
            >
              {loadingItems[item.id] === 'delete' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="size-4 mr-2" />}
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WishlistItems;
