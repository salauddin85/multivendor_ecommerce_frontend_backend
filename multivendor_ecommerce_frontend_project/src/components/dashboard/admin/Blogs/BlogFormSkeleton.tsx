export default function BlogFormSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 animate-pulse">
      {/* Title skeleton */}
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
      
      {/* Form fields skeleton */}
      <div className="space-y-6">
        {[...Array(7)].map((_, i) => (
          <div key={i}>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
        
        {/* Content editor skeleton */}
        <div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
        
        {/* Buttons skeleton */}
        <div className="flex justify-end space-x-4 pt-6">
          <div className="h-10 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-orange-200 rounded w-32"></div>
        </div>
      </div>
    </div>
  );
}