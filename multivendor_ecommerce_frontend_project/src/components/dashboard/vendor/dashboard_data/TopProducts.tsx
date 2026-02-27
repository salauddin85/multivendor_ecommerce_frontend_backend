// components/TopProducts.tsx
import { Star } from 'lucide-react';

const products = [
  { name: 'Premium Headphones', sales: 142, revenue: '$4,258', rating: 4.8 },
  { name: 'Wireless Mouse', sales: 98, revenue: '$1,960', rating: 4.5 },
  { name: 'Mechanical Keyboard', sales: 76, revenue: '$3,800', rating: 4.9 },
  { name: 'USB-C Hub', sales: 64, revenue: '$1,280', rating: 4.3 },
  { name: 'Laptop Stand', sales: 53, revenue: '$1,325', rating: 4.7 },
];

export default function TopProducts() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Top Products</h3>
      
      <div className="space-y-4">
        {products.map((product, index) => (
          <div key={product.name} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                <span className="font-bold text-blue-600">{index + 1}</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">{product.name}</p>
                <div className="flex items-center gap-1">
                  <Star className="text-yellow-500 fill-current" size={14} />
                  <span className="text-sm text-gray-600">{product.rating}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-semibold text-gray-800">{product.revenue}</p>
              <p className="text-sm text-gray-500">{product.sales} sold</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}