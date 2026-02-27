/* eslint-disable  */
// @ts-nocheck
"use client";

import { useEffect, useState, useTransition } from "react";
import { ShoppingCart, Trash2, X, Loader2, RotateCw } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  get_cart_items,
  update_cart_quantity,
  delete_cart_item,
  clear_entire_cart,
} from "@/actions/cart.action";
import { createOrderFromItems } from "@/actions/order.action";
import { useCheckoutStore } from "@/store/checkout_product_store";
import { useCartStore } from "@/store/cart_store";
import { useUserStore } from "@/store/user.store";
import { toast } from "react-toastify";

export default function CartDrawer({
  onAuthRequired,
}: {
  onAuthRequired?: () => void;
}) {
  const { cartItems, totalPrice, totalItems, fetchCart, isLoading } =
    useCartStore();
  const { userType } = useUserStore();
  const [isPending, startTransition] = useTransition();
  const [isClearing, setIsClearing] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = (id: number, quantity: number) => {
    startTransition(async () => {
      const res = await update_cart_quantity(id, quantity);
      if (res.success) {
        fetchCart();
      }
    });
  };

  const handleRemoveItem = (id: number) => {
    startTransition(async () => {
      const res = await delete_cart_item(id);
      if (res.success) {
        fetchCart();
      }
    });
  };

  const handleClearCart = () => {
    setIsClearing(true);
    startTransition(async () => {
      const res = await clear_entire_cart();
      if (res.success) {
        await fetchCart();
        setIsOpen(false);
      }
      setIsClearing(false);
    });
  };
  if (!mounted) return null;
  return (
    <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
      {/* Cart Button */}
      <DrawerTrigger asChild>
        <Button
          onClick={(e) => {
            if (!userType) {
              e.preventDefault();
              onAuthRequired();
            } else {
              setIsOpen(true);
              fetchCart();
            }
          }}
          size="icon"
          variant="link"
          className="relative"
        >
          <ShoppingCart className="size-6 text-white" />

          {totalItems > 0 && (
            <Badge
              className="absolute left-full bottom-full -ml-3 -mb-3 h-5 min-w-5 rounded-full px-1 text-xs"
              variant="default"
            >
              {totalItems}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>

      {/* Drawer Content */}
      <DrawerContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl ml-auto">
        <DrawerHeader className="flex flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <DrawerTitle>Your Cart</DrawerTitle>
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="sm">
              <X />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        {/* Cart List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
          ) : cartItems.length === 0 ? (
            <p className="text-center text-muted-foreground mt-10">
              Your cart is empty.
            </p>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between gap-4 rounded-lg border p-4 bg-white"
              >
                {/* Image */}
                <div className="relative w-20 h-20 rounded-md overflow-hidden shrink-0">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${item.product_image}`}
                    alt={item.product_name}
                    className="object-cover"
                    width={80}
                    height={80}
                  />
                </div>

                {/* Details */}
                <div className="space-y-1 flex-1">
                  <h4 className="font-medium text-sm ">
                    {item.product_name.slice(0, 30)}
                    {item.product_name.length > 30 && "..."}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    ৳{parseFloat(item.price).toFixed(2)}
                  </p>

                  {/* Quantity Control */}
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={isPending}
                      onClick={() =>
                        handleUpdateQuantity(
                          item.id,
                          Math.max(1, item.quantity - 1),
                        )
                      }
                    >
                      -
                    </Button>

                    <Badge variant="secondary">{item.quantity}</Badge>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={isPending}
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Remove */}
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPending}
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-700  hover:text-white cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 " />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <DrawerFooter>
          <div className="flex justify-between font-semibold text-base mb-2">
            <span>Total</span>
            <span>৳{parseFloat(totalPrice).toFixed(2)}</span>
          </div>

          <Button
            className="w-full cursor-pointer bg-primary hover:bg-primary/80"
            disabled={cartItems.length === 0 || isCheckingOut || isClearing}
            onClick={async (e) => {
              e.preventDefault();
              setIsCheckingOut(true);
              startTransition(async () => {
                const orderItems = cartItems.map((item: any) => ({
                  product: item.product,
                  ...(item.variant && { variant: item.variant }),
                  quantity: item.quantity,
                }));

                const res = await createOrderFromItems(orderItems);
                if (res.success) {
                  useCheckoutStore.getState().setOrderId(res.data.order_id);
                  window.location.href = "/checkout";
                } else {
                  toast.error(res.message || "Failed to create order");
                  setIsCheckingOut(false);
                }
              });
            }}
          >
            {isCheckingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Order...
              </>
            ) : (
              "Checkout"
            )}
          </Button>
          <Button
            variant="outline"
            className="text-destructive border-destructive hover:bg-destructive/80 cursor-pointer"
            onClick={handleClearCart}
            disabled={cartItems.length === 0 || isClearing || isCheckingOut}
          >
            {isClearing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isClearing ? "Clearing..." : "Clear Cart"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
