import { Product } from "../product-data"

interface SpecificationTabProps {
  product: Product
}

export default function SpecificationTab({ product }: SpecificationTabProps) {
  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Specification</h2>

      {/* Specifications Table */}
      <div className="space-y-4">
        <div 
          dangerouslySetInnerHTML={{ __html: product.specification }} 
        />
      </div>
    </div>
  );
}