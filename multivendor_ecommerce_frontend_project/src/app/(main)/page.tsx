import { get_top_categories, get_best_selling_products, get_latest_products, get_carousel_images, get_category_grid_images } from "@/actions/product.action";
import BestSelling from "@/components/home/BestSelling";
import CategoryGrid from "@/components/home/CategoryGrid";
import HomeCarousel from "@/components/home/HomeCarousel";
import HomeProductGrid from "@/components/home/HomeProductGrid";
import LatestProducts from "@/components/home/LatestProducts";
import React from "react";



async function page() {
  // Fetch all data in parallel
  const [
    topCategoriesResult, 
    bestSellingResult, 
    latestProductsResult,
    carouselResult,
    categoryGridResult
  ] = await Promise.all([
    get_top_categories(),
    get_best_selling_products(),
    get_latest_products(),
    get_carousel_images(),
    get_category_grid_images(),
  ]);

  const topCategories = topCategoriesResult?.data ?? [];
  const bestSellingProducts = bestSellingResult?.data ?? [];
  const latestProducts = latestProductsResult?.data ?? [];
  const carouselData = carouselResult?.data ?? [];
  const categoryGridData = categoryGridResult?.data ?? [];

  return (
    <div className="p-4 lg:p-10 xl:px-16">
      {/**Home Hero section */}
      <div className="flex flex-col xl:flex-row items-start gap-6 md:gap-10 justify-between">
        <LatestProducts products={latestProducts} />
        <HomeCarousel data={carouselData} />
        <BestSelling products={bestSellingProducts} />
      </div>
      {/**Category section */}
      <div className="my-5 lg:my-10">
        <CategoryGrid categories={categoryGridData} />
      </div>
      {/**Dynamic Category Product Grids - Only show categories with products */}
      {topCategories.map((category: any) => {
        // Only render if category has products
        if (category.products_count > 0 && category.products.length > 0) {
          return (
            <HomeProductGrid
              key={category.category_id}
              category={category.category_name}
              categorySlug={category.category_slug}
              products={category.products}
            />
          );
        }
        return null;
      })}
    </div>
  );
};

export default page

