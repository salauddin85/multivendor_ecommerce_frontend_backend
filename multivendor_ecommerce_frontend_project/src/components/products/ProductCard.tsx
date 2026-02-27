"use client";
import { Eye, Heart, ShoppingCart, Star, Store, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { add_to_cart } from "@/actions/cart.action";
import { add_to_wishlist } from "@/actions/wishlist.action";
import { toast } from "react-toastify";
import ProductModal from "./ProductModal";
import { useCartStore } from "@/store/cart_store";
import { useWishlistStore } from "@/store/wishlist_store";
import { console } from "inspector";

const ProductCard = ({ product }: { product: any }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartPending, startCartTransition] = useTransition();
  const [isWishlistPending, startWishlistTransition] = useTransition();
  const router = useRouter();
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    startCartTransition(async () => {
      // For variable products, use variants.id as the variant ID
      // For simple products, variantId can be null (or product.variants.id if present)
      const variantId =
        product.type === "variable" ? product.variants?.id : null;

      const res = await add_to_cart(product.id, variantId, 1);
      if (res.success) {
        toast.success(res.message || "Added to cart");
        await useCartStore.getState().fetchCart();
      } else {
        toast.error(res.message || "Failed to add to cart");
      }
    });
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    startWishlistTransition(async () => {
      const variantId =
        product.type === "variable" ? product.variants?.id : null;
      const res = await add_to_wishlist(product.id, variantId);
      if (res.success) {
        toast.success(res.message || "Added to wishlist");
        setIsFavorite(true);
        await useWishlistStore.getState().fetchWishlist();
      } else {
        toast.error(res.message || "Failed to add to wishlist");
      }
    });
  };

  return (
    <>
      <div
        className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.main_image ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${product.main_image}`}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400 text-xs">No Image</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_featured && (
              <span className="bg-linear-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                Featured
              </span>
            )}
            {product.stock < 10 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                Low Stock
              </span>
            )}
          </div>

          {/* Quick Actions - Always visible on mobile, hover on desktop */}
          <div
            className={`absolute top-2 right-2 flex flex-col gap-1.5 transition-all duration-300 
              ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"}
              max-sm:opacity-100 max-sm:translate-x-0
            `}
          >
            <button
              onClick={handleAddToWishlist}
              disabled={isWishlistPending}
              className="bg-white/90 backdrop-blur-sm cursor-pointer p-1.5 rounded-full shadow hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {isWishlistPending ? (
                <Loader2 size={16} className="text-gray-600 animate-spin" />
              ) : (
                <Heart
                  size={16}
                  className={
                    isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                  }
                />
              )}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white/90 backdrop-blur-sm cursor-pointer p-1.5 rounded-full shadow hover:bg-blue-50 transition-colors"
            >
              <Eye size={16} className="text-gray-600" />
            </button>
            <button
              disabled={isCartPending}
              onClick={handleAddToCart}
              className="bg-white/90 backdrop-blur-sm cursor-pointer p-1.5 rounded-full shadow hover:bg-orange-50 transition-colors disabled:opacity-50"
            >
              {isCartPending ? (
                <Loader2 size={16} className="text-gray-600 animate-spin" />
              ) : (
                <ShoppingCart size={16} className="text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div
          className="p-2.5 sm:p-3 cursor-pointer"
          onClick={() => router.push(`/products/${product.slug}`)}
        >
          {/* Category */}
          <span className="text-[10px] sm:text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
            {product.category}
          </span>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 mt-1.5 text-xs sm:text-sm line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
            {product.title}
          </h3>

          {/* Store Info */}
          <div className="text-[10px] sm:text-xs text-gray-500 mt-1.5 flex items-center gap-1">
            <Store size={12} className="text-orange-400" />
            <span className="truncate">
              {product.store || "eezzymart platform"}
            </span>
          </div>

          {/* Price & Rating */}
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm sm:text-base font-bold text-gray-900">
              ৳
              {product.type === "variable"
                ? product.variants?.price
                : product.base_price}
            </p>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  className={
                    i < Math.round(product.average_rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        slug={product.slug}
      />
    </>
  );
};

export default ProductCard;
