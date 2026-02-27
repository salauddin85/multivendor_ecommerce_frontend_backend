import { Product } from "../product-data"


interface DescriptionTabProps {
  product: Product
}
 const keyFeatures = [
   "Powerful Apple M2 chip with 8-core CPU",
   "Up to 10-core GPU for smooth graphics",
   "Fast SSD storage for quick boot and file access",
   "Stunning 13.3-inch Retina display",
   "All-day battery life up to 15 hours",
   "MacBook Air weighs just 1.24 kg",
   "Fanless design for silent operation",
   "Thunderbolt 3 ports for fast connectivity",
 ];
export default function DescriptionTab({ product }: DescriptionTabProps) {
  return (
    <div className="max-w-4xl space-y-6 border-t-2 border-primary pt-2 md:pt-4 px-2">
     <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Product Description
        </h2>
        
        <div 
          className="text-gray-700 leading-relaxed mb-4 rich-text-container"
          dangerouslySetInnerHTML={{ __html: product.description }} 
        />
      </div>
    
      {/* <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Key Specifications</h3>
        <ul className="space-y-2">
          {keyFeatures.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div> */}
    </div>
  );
}
