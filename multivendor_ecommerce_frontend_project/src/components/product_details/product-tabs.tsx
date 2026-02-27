"use client";

import SpecificationTab from "./tabs/specification-tab";
import DescriptionTab from "./tabs/description-tab";
import ReviewsTab from "./tabs/reviews-tab";
import RelatedProductsTab from "./tabs/related-products-tab";

export default function ProductTabs({ product, reviews, reviewsPagination, isLoadingReviews, onPageChange, relatedProducts }: any) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex justify-center border-b border-gray-200 flex-wrap">
        {product.specification && (
        <button
          onClick={() => scrollTo("specs")}
          className="px-6 py-4 cursor-pointer font-semibold text-sm text-primary border-b-2 border-primary "
        >
          Specification
        </button>
        )}

        <button
          onClick={() => scrollTo("description")}
          className="px-6 cursor-pointer py-4 font-semibold text-sm text-gray-600 hover:text-gray-900"
        >
          Description
        </button>

        {reviews && (
        <button
          onClick={() => scrollTo("reviews")}
          className="px-6 cursor-pointer py-4 font-semibold text-sm text-gray-600 hover:text-gray-900"
        >
          Reviews ({reviewsPagination?.count || 0})
        </button>
        )}

        {relatedProducts && relatedProducts.length > 0 && (
          <button
            onClick={() => scrollTo("related")}
            className="px-6 cursor-pointer py-4 font-semibold text-sm text-gray-600 hover:text-gray-900"
          >
            Related Products
          </button>
        )}
      </div>

      {/* All Sections */}
      <div className="py-8 px-4 md:px-8 space-y-16">
        {/* Specification Tab */}
        {product.specification && (
        <div id="specs">
          <SpecificationTab product={product} />
        </div>
        )}
       
        <div id="description">
          <DescriptionTab product={product} />
        </div>
       

        <div id="reviews">
          <ReviewsTab 
            avgRating={product.avg_rating} 
            reviews={reviews} 
            totalReviews={reviewsPagination?.count || product.total_reviews}
            pagination={reviewsPagination}
            isLoading={isLoadingReviews}
            onPageChange={onPageChange}
          />
        </div>

        {relatedProducts && relatedProducts.length > 0 && (
          <div id="related">
            <RelatedProductsTab 
              products={relatedProducts} 
              category={product.category} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
