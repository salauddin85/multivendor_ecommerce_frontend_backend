"use client";
import { useState, useTransition, useEffect } from "react";
import { Heart, MapPin, Truck, Shield, Package, Loader2 } from "lucide-react";
import ProductGallery from "./product-gallery";
import ProductTabs from "./product-tabs";
import RatingStars from "../ReviewStars";
import { add_to_cart } from "@/actions/cart.action";
import { add_to_wishlist } from "@/actions/wishlist.action";
import { createOrderFromItems } from "@/actions/order.action";
import { toast } from "react-toastify";
import { useCheckoutStore } from "@/store/checkout_product_store";
import { useCartStore } from "@/store/cart_store";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios"; // Make sure you have this import

export default function ProductDetails({ product }: any) {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeAttr, setActiveAttr] = useState<number | null>(null);

  // Reviews state with pagination
  const [reviews, setReviews] = useState([]);
  const [reviewsPagination, setReviewsPagination] = useState({
    count: 0,
    total_pages: 1,
    current_page: 1,
    next: null,
    previous: null,
    page_size: 10, // Default page size
  });
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(
    Array.isArray(product?.variants)
      ? (product?.variants[0] ?? null)
      : (product?.variants ?? null),
  );
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const router = useRouter();

  // Fetch reviews when component mounts or page changes
  useEffect(() => {
    fetchReviews(1);
    fetchRelatedProducts();
  }, [product?.slug]); // Re-fetch if product changes

  const fetchReviews = async (page: number = 1) => {
    setIsLoadingReviews(true);
    try {
      const response = await axiosInstance.get(
        `/api/products/v1/products/${product?.slug}/reviews/?page=${page}&page_size=5`,
      );

      if (response.data.code === 200) {
        setReviews(response.data.data);
        setReviewsPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const fetchRelatedProducts = async () => {
    if (!product?.category?.slug) return;
    try {
      const response = await axiosInstance.get(
        `/api/products/v1/products/?category=${product.category.slug}&page_size=8`,
      );
      if (response.data && response.data.data) {
        // Filter out current product
        const filtered = response.data.data.filter((p: any) => p.slug !== product.slug);
        setRelatedProducts(filtered);
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  const handlePageChange = (page: number) => {
    fetchReviews(page);
    // Scroll to reviews section smoothly
    document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" });
  };

  // GAPHER ALL IMAGES & MAP TO VARIANTS
  const allGalleryImages: string[] = [];
  const imageToVariantMap = new Map<string, any>();

  // 1. Add Variant Images
  if (product?.variants) {
    const variants = Array.isArray(product.variants)
      ? product.variants
      : [product.variants];
    variants.forEach((v: any) => {
      if (v.image) {
        allGalleryImages.push(v.image);
        // Map image to variant (use first encounter)
        if (!imageToVariantMap.has(v.image)) {
          imageToVariantMap.set(v.image, v);
        }
      }
    });
  }

  // 2. Add Main Image
  if (product?.main_image) {
    allGalleryImages.push(product.main_image);
  }

  // 3. Add Gallery Images
  if (product?.images) {
    product.images.forEach((img: any) => {
      if (img.image) allGalleryImages.push(img.image);
    });
  }

  // Deduplicate images while keeping order
  const uniqueImages = Array.from(new Set(allGalleryImages.filter(Boolean)));

  // Determine active index based on selected variant
  const activeIndex = selectedVariant?.image
    ? uniqueImages.indexOf(selectedVariant.image)
    : 0;

  // Handle clicking an image in the gallery
  const handleImageClick = (index: number) => {
    const clickedImage = uniqueImages[index];
    const linkedVariant = imageToVariantMap.get(clickedImage);

    // If this image belongs to a specific variant, select it
    if (linkedVariant) {
      setSelectedVariant(linkedVariant);
    }
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      const res = await add_to_cart(product.id, selectedVariant?.id, quantity);
      if (res.success) {
        toast.success(res.message || "Added to cart");
        await useCartStore.getState().fetchCart();
      } else {
        toast.error(res.message || "Failed to add to cart");
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    setIsAddingToWishlist(true);
    try {
      const res = await add_to_wishlist(product.id, selectedVariant?.id);
      if (res.success) {
        toast.success(res.message || "Added to wishlist");
        setIsFavorite(true);
      } else {
        toast.error(res.message || "Failed to add to wishlist");
      }
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleBuyNow = async () => {
    setIsBuyingNow(true);
    try {
      const orderItems = [
        {
          product: product.id,
          ...(selectedVariant?.id && { variant: selectedVariant.id }),
          quantity: quantity,
        },
      ];

      const res = await createOrderFromItems(orderItems);
      if (res.success) {
        useCheckoutStore.getState().setOrderId(res.data.order_id);
        router.push("/checkout");
      } else {
        toast.error(res.message || "Failed to create order");
      }
    } finally {
      setIsBuyingNow(false);
    }
  };

  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const isOutOfStock = currentStock === 0;

  // Price logic:
  // - For products with variants: use variant's price and discount_price
  // - For simple products: use base_price only
  const variantsArray = Array.isArray(product?.variants)
    ? product.variants
    : product?.variants
      ? [product.variants]
      : [];

  const hasVariants = variantsArray.length > 0;

  let displayPrice = 0; // The price to show (after discount)
  let originalPrice = 0; // The original price (before discount, shown with strikethrough)
  let discountPercent = 0;

  if (hasVariants && selectedVariant) {
    // Variant product:
    // displayPrice is the price from API
    // originalPrice is price + discount_price
    displayPrice = Number.parseFloat(selectedVariant.price) || 0;
    const discountAmount =
      Number.parseFloat(selectedVariant.discount_price) || 0;

    if (discountAmount > 0) {
      originalPrice = displayPrice + discountAmount;
      discountPercent = Math.round((discountAmount / originalPrice) * 100);
    } else {
      originalPrice = 0;
      discountPercent = 0;
    }
  } else {
    // Simple product: only base_price
    displayPrice = Number.parseFloat(product.base_price) || 0;
    originalPrice = 0;
    discountPercent = 0;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-8">
          <div className="flex flex-col gap-4">
            <ProductGallery
              images={uniqueImages}
              activeIndex={activeIndex}
              onImageClick={handleImageClick}
            />
          </div>
          <div className="flex flex-col gap-6">
            {product.is_featured && (
              <span className="bg-linear-to-r from-amber-400 to-orange-500 text-white text-sm font-bold px-2 w-32 py-1.5 text-center rounded-full shadow">
                ✨ Featured
              </span>
            )}

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Title Row */}
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                    {product.title}
                  </h1>

                  <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span className="font-medium">
                      {product.view_count || 0} views
                    </span>
                  </div>
                </div>

                {/* Brand + Seller */}
                <div className="flex items-center gap-2 mt-2 mb-2 flex-wrap">
                  <div className="text-sm text-gray-600">
                    {product.brand ? (
                      <p>
                        Brand :{" "}
                        <span className="text-primary font-semibold">
                          {product.brand.name}
                        </span>
                      </p>
                    ) : (
                      <p>
                        Category :{" "}
                        <span className="text-primary font-semibold">
                          {product.category.name}
                        </span>
                      </p>
                    )}
                  </div>

                  <span className="text-gray-400 hidden sm:inline">|</span>

                  <span className="text-sm text-gray-600 font-medium">
                    Sold by :{" "}
                    <span className="text-primary font-semibold">
                      {product.store?.store_name || "Eezzymart platform"}
                    </span>
                  </span>
                </div>

               
                <div className="flex items-center gap-3 mt-1">
  
  {/* Average Rating - NOT clickable */}
                <div className="flex items-center gap-1.5">
                  <RatingStars
                    avgRating={product.avg_rating || 0}
                    size={18}
                  />
                
                </div>

                <span className="text-gray-300">|</span>

                {/* Total Reviews - CLICKABLE → scroll to #reviews */}
                <button
                  onClick={() =>
                    document
                      .getElementById("reviews")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="text-sm text-primary font-medium hover:underline cursor-pointer transition-all"
                >
                  {reviewsPagination.count} Reviews
                </button>

              </div>
              </div>

              <button
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist}
                className="p-2 hover:bg-red-500 disabled:opacity-50 cursor-pointer rounded-full transition border-2 border-gray-200 hover:border-pink-600"
              >
                {isAddingToWishlist ? (
                  <Loader2 size={24} className="animate-spin text-gray-600" />
                ) : (
                  <Heart
                    size={24}
                    className={
                      isFavorite
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600 hover:text-white"
                    }
                  />
                )}
              </button>
            </div>

            <div className="flex items-end gap-3">
              {/* Display Price (final price after discount) */}
              <span className="text-3xl font-bold text-gray-900">
                ৳{displayPrice.toLocaleString()}
              </span>

              {/* Original Price (strikethrough if there's a discount) */}
              {originalPrice > 0 && originalPrice > displayPrice && (
                <span className="text-lg text-gray-400 line-through">
                  ৳{originalPrice.toLocaleString()}
                </span>
              )}

              {/* Discount Badge */}
              {discountPercent > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-sm font-bold rounded">
                  -{discountPercent}%
                </span>
              )}
            </div>

            {variantsArray.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Variants:
                </p>

                <div className="flex gap-3 flex-wrap">
                  {variantsArray.map((variant: any) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`
            px-5 py-2.5
            text-sm font-semibold
            rounded-full
            shadow-sm
            transition-all duration-300 ease-in-out
            hover:active:scale-95

            ${
              selectedVariant?.id === variant.id
                ? "bg-primary text-white border-2 border-transparent hover:bg-primary hover:text-white hover:shadow-lg hover:-translate-y-1"
                : "bg-primary text-white border-2 border-transparent hover:bg-primary hover:text-white hover:shadow-lg hover:-translate-y-1"
            }
          `}
                    >
                      {variant.variant_name?.toUpperCase() || "DEFAULT"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ATTRIBUTES SECTION */}
            {product.attributes?.length > 0 && (
              <div className="border-t border-gray-200 pt-6 space-y-5">
                <p className="text-sm font-semibold text-gray-700">
                  Attributes:
                </p>

                {/* Attribute Buttons (Flex like variants) */}
                <div className="flex flex-wrap gap-3">
                  {product.attributes.map((attr: any) => (
                    <button
                      key={attr.id}
                      onClick={() =>
                        setActiveAttr(activeAttr === attr.id ? null : attr.id)
                      }
                      className={`
            px-5 py-2.5
            text-sm font-semibold
            rounded-full
            shadow-sm
            transition-all duration-300 ease-in-out
            hover:scale-95

            ${
              activeAttr === attr.id
                ? "bg-primary text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
          `}
                    >
                      {attr.name.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Values Section */}
                {product.attributes.map(
                  (attr: any) =>
                    activeAttr === attr.id &&
                    attr.values?.length > 0 && (
                      <div key={attr.id} className="flex flex-wrap gap-3 mt-4">
                        {attr.values.map((val: any) => (
                          <button
                            key={val.id}
                            className="
                  px-4 py-2
                  text-sm font-medium
                  rounded-full
                  border
                  transition-all duration-300 ease-in-out
                  hover:scale-95

                  bg-white
                  border-gray-300
                  text-gray-700
                  hover:bg-primary hover:text-white hover:border-primary
                "
                          >
                            {val.value}
                          </button>
                        ))}
                      </div>
                    ),
                )}
              </div>
            )}

            <div className="flex items-center gap-2 bg-orange-50 border border-blue-200 rounded-lg p-3">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  <Package />
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {isOutOfStock ? "Out of Stock" : "In Stock"}
                </p>
                <p className="text-xs text-gray-600">
                  {currentStock} units available
                </p>
              </div>
            </div>

            {/* Quantity and Action Buttons Combined */}
            <div className="border-t border-gray-200 pt-6">
              <label className="text-sm font-semibold text-gray-700 block mb-3">
                Quantity:
              </label>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Quantity Control */}
                <div className="flex items-center border border-gray-300 rounded-lg w-full sm:w-auto">
                  <button
                    disabled={isOutOfStock}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-5 py-3 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg font-bold"
                  >
                    -
                  </button>
                  <span className="px-8 py-3 font-semibold text-lg min-w-[80px] text-center">
                    {quantity}
                  </span>
                  <button
                    disabled={
                      isOutOfStock ||
                      (currentStock > 0 && quantity >= currentStock)
                    }
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-5 py-3 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Stock Info */}
                <div className="flex items-center text-sm text-gray-500 sm:ml-2">
                  <span className="bg-gray-100 px-3 py-2 rounded-lg">
                    {currentStock} items available
                  </span>
                </div>
              </div>

              {/* Action Buttons - Now below quantity with better styling */}
              <div className="flex flex-col md:flex-row gap-3 mt-6">
                <button
                  disabled={isAddingToCart || isBuyingNow || isOutOfStock}
                  onClick={handleAddToCart}
                  className="flex-1 cursor-pointer px-6 py-4 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base group"
                >
                  {isAddingToCart ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 group-hover:scale-110 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      ADD TO CART
                    </>
                  )}
                </button>

                <button
                  disabled={isAddingToCart || isBuyingNow || isOutOfStock}
                  onClick={handleBuyNow}
                  className="flex-1 cursor-pointer px-6 py-4 bg-primary text-white font-bold rounded-xl hover:bg-secondary-foreground hover:border-2 hover:border-primary transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base group"
                >
                  {isBuyingNow ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 group-hover:scale-110 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      BUY NOW
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 border-t border-gray-200 pt-6">
              <div className="flex flex-col items-center gap-2">
                <Truck className="text-primary" size={24} />
                <p className="text-xs font-semibold text-gray-700 text-center">
                  Free Delivery
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Shield className="text-primary" size={24} />
                <p className="text-xs font-semibold text-gray-700 text-center">
                  Secure Payment
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <MapPin className="text-primary" size={24} />
                <p className="text-xs font-semibold text-gray-700 text-center">
                  Pick-Up Available
                </p>
              </div>
            </div>

            <div className="border border-gray-300 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0">
                  <Shield size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Secure & Verified
                  </p>
                  <p className="text-xs text-gray-600">Shop with confidence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <ProductTabs
            product={product}
            reviews={reviews}
            reviewsPagination={reviewsPagination}
            isLoadingReviews={isLoadingReviews}
            onPageChange={handlePageChange}
            relatedProducts={relatedProducts}
          />
        </div>
      </div>
    </div>
  );
}
