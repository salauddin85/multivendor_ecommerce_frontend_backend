import { Star } from "lucide-react";

interface RatingStarsProps {
  avgRating: number;
  totalReviews?: number;
  size?: number; 
  showText?: boolean;
}

const RatingStars = ({ 
  avgRating, 
  totalReviews, 
  size = 14, 
  showText = true 
}: RatingStarsProps) => {
  // Round to nearest 0.5
  const roundedRating = Math.round(avgRating * 2) / 2;
  
  return (
    <div className="flex items-center gap-1.5">
      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => {
          const starValue = i + 1;
          const isFull = roundedRating >= starValue;
          const isHalf = !isFull && roundedRating >= starValue - 0.5;
          
          return (
            <div key={i} className="relative">
              {/* Empty star background */}
              <Star
                size={size}
                className="text-gray-200"
              />
              {/* Filled star overlay */}
              {(isFull || isHalf) && (
                <div 
                  className="absolute top-0 left-0 overflow-hidden"
                  style={{ width: isHalf ? '50%' : '100%' }}
                >
                  <Star
                    size={size}
                    className="fill-amber-400 text-amber-400"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Rating text */}
      {showText && (
        <>
          <span className="text-sm font-semibold text-gray-800">
            {avgRating}
          </span>
          {totalReviews !== undefined && (
            <span className="text-sm text-gray-500">
              ({totalReviews} reviews)
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default RatingStars;