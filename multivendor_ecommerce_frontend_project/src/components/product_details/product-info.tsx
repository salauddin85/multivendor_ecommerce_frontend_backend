import { AlertCircle, Tag } from "lucide-react"
import type { Product } from "./product-data";

interface ProductInfoProps {
  product: Product
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const offers = product.offers || []
  const stock = product.stock || 0

  return (
    <div className="space-y-4">
      {/* Offer Banner */}
      {product.specialOffer && (
        <div className="bg-orange-50 border border-orange-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Tag className="text-orange-600 shrink-0 mt-1" size={20} />
            <div>
              <p className="text-sm font-bold text-orange-900">{product.specialOffer.title}</p>
              <p className="text-xs text-orange-800 mt-1">{product.specialOffer.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Offer Section */}
      {offers.length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Available Offer</h3>
          <div className="space-y-2">
            {offers.map((offer, index) => (
              <div key={index} className="flex items-start gap-2">
                <Tag size={16} className="text-orange-600 shrink-0 mt-1" />
                <p className="text-sm text-gray-700">{offer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock Status */}
      <div
        className={`border rounded-lg p-4 flex items-center gap-3 ${
          stock > 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
        }`}
      >
        <AlertCircle size={20} className={stock > 0 ? "text-green-600" : "text-red-600"} />
        <div>
          <p className={`text-sm font-semibold ${stock > 0 ? "text-green-900" : "text-red-900"}`}>
            {stock > 0 ? `${stock} in stock` : "Out of stock"}
          </p>
        </div>
      </div>
    </div>
  )
}
