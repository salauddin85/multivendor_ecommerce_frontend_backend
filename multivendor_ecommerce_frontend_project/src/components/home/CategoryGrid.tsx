"use client";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

interface CategoryCard {
  id: number;
  image: string;
  category: {
    id: number;
    name: string;
    slug: string;
    icon: string;
  };
}

interface CategoryGridProps {
  categories?: CategoryCard[];
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories = [],
}) => {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="w-full mx-auto">
      {/* Category Grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
        {categories.map((item) => (
          <Link key={item.id} href={`/products/category/${item.category?.slug}`} className="group">
            <Card className="p-0 h-full overflow-hidden cursor-pointer border-0 transition-all duration-300 rounded-sm">
              <CardContent className="p-0 h-full flex flex-col relative">
                {/* Image Container */}
                <div className="relative w-full aspect-square flex items-center justify-center overflow-hidden">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${item.image}`}
                    alt={item.category?.name}
                    className="w-full h-full object-cover transition-opacity duration-300"
                    fill
                  />
                  {/* Black Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryGrid;
