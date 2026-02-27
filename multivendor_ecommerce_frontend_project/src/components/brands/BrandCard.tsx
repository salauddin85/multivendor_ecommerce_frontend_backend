"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string;
  display_order: number;
}

interface BrandCardProps {
  brand: Brand;
}

const BrandCard = ({ brand }: BrandCardProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/products?brand=${brand.slug}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group flex items-center gap-4 bg-white rounded-xl p-2 shadow-sm  shadow-orange-200 hover:shadow-lg border border-gray-100 hover:border-orange-300 transition-all duration-300 cursor-pointer hover:-translate-y-1"
    >
      {/* Square Logo */}
      <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 group-hover:border-orange-300 transition-colors">
        {brand.logo ? (
          <Image
            src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${brand.logo}`}
            alt={brand.name}
            className="object-contain w-full h-full p-2 group-hover:scale-110 transition-transform duration-300"
            width={100}
            height={100}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl sm:text-3xl font-bold text-gray-300 group-hover:text-orange-500 transition-colors">
              {brand.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Brand Name */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm sm:text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors truncate">
          {brand.name}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">View Products</p>
      </div>

      {/* Arrow Icon */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg
          className="w-5 h-5 text-orange-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  );
};

export default BrandCard;
