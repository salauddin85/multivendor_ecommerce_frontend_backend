"use client";

import { get_product } from "@/actions/product.action";
import { X, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import ProductGallery from "../product_details/product-gallery";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
}

const ProductModal = ({ isOpen, onClose, slug }: ProductModalProps) => {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !slug) return;

    const fetchProductData = async () => {
      setLoading(true);
      try {
        const data = await get_product(slug);
        if (data.error) {
          toast.error(data.message || "Failed to load product");
          onClose();
          return;
        }
        setProduct(data?.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductData();
  }, [isOpen, slug]);

  const handleTitleClick = () => {
    router.push(`/products/${product?.slug}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-primary h-12 w-12" />
          </div>
        ) : (
          <>
            {/* Header with Title and Close Button */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <h2 
                onClick={handleTitleClick}
                className="text-xl font-bold text-gray-900 cursor-pointer hover:text-primary transition-colors duration-200 line-clamp-1 pr-4"
              >
                {product?.title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-all group flex-shrink-0"
                aria-label="Close modal"
              >
                <X size={24} className="text-gray-600 group-hover:text-red-500 transition-colors" />
              </button>
            </div>

            {/* Product Gallery - Full Width & Height */}
            <div className="flex-1 bg-gray-50 flex items-center justify-center p-6 overflow-hidden">
              <div className="w-1/2 h-1/2 flex items-center justify-center">
                <ProductGallery 
                  images={product?.images?.length > 0 
                    ? product.images.map((img: any) => img.image) 
                    : [product?.main_image]} 
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductModal;

