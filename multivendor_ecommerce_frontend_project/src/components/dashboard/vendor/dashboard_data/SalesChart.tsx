// components/SalesChart.tsx
import { TrendingUp } from 'lucide-react';

export default function SalesChart() {
  const salesData = [
    { month: 'Jan', sales: 4000 },
    { month: 'Feb', sales: 3000 },
    { month: 'Mar', sales: 5000 },
    { month: 'Apr', sales: 4500 },
    { month: 'May', sales: 6000 },
    { month: 'Jun', sales: 5500 },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Sales Overview</h3>
          <p className="text-sm text-gray-500">Monthly revenue performance</p>
        </div>
        <div className="flex items-center gap-2 text-green-600">
          <TrendingUp size={20} />
          <span className="font-medium">+12.5% growth</span>
        </div>
      </div>
      
      {/* Simple Bar Chart - Static */}
      <div className="h-64 flex items-end gap-4 pt-8">
        {salesData.map((data, index) => (
          <div key={data.month} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg transition-all hover:opacity-90"
              style={{ height: `${(data.sales / 6000) * 80}%` }}
            />
            <span className="mt-2 text-sm text-gray-600">{data.month}</span>
            <span className="text-xs text-gray-500">${data.sales}</span>
          </div>
        ))}
      </div>
    </div>
  );
}