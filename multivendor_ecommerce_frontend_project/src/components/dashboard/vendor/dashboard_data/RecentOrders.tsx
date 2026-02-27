// components/RecentOrders.tsx
import { CheckCircle, Clock, XCircle, MoreVertical } from 'lucide-react';

const orders = [
  { id: '#ORD-001', customer: 'John Smith', date: '2024-01-15', amount: '$245.99', status: 'completed' },
  { id: '#ORD-002', customer: 'Emma Johnson', date: '2024-01-14', amount: '$189.50', status: 'pending' },
  { id: '#ORD-003', customer: 'Michael Brown', date: '2024-01-14', amount: '$324.75', status: 'completed' },
  { id: '#ORD-004', customer: 'Sarah Davis', date: '2024-01-13', amount: '$98.99', status: 'cancelled' },
  { id: '#ORD-005', customer: 'Robert Wilson', date: '2024-01-13', amount: '$450.00', status: 'pending' },
];

export default function RecentOrders() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={16} />;
      case 'cancelled':
        return <XCircle className="text-red-500" size={16} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
          <p className="text-sm text-gray-500">Latest 5 orders from your store</p>
        </div>
        <button className="text-blue-600 hover:text-blue-800 font-medium">
          View All →
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b">
              <th className="pb-3 font-medium">Order ID</th>
              <th className="pb-3 font-medium">Customer</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="py-4 font-medium">{order.id}</td>
                <td className="py-4">{order.customer}</td>
                <td className="py-4 text-gray-500">{order.date}</td>
                <td className="py-4 font-medium">{order.amount}</td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="py-4">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical size={20} className="text-gray-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}