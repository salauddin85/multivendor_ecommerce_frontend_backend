// components/DashboardHeader.tsx
import { Search, Bell, ChevronDown, Sun } from 'lucide-react';

export default function DashboardHeader() {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Welcome back, Salman!</h2>
        <p className="text-gray-600">Here's what's happening with your store today</p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
        {/* Weather Widget */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2">
          <Sun className="text-yellow-500" size={20} />
          <div>
            <p className="text-sm font-medium">61°F</p>
            <p className="text-xs text-gray-500">Sunny</p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative flex-1 md:flex-none">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search orders, products, analytics..."
            className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* Notifications */}
        <button className="relative p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </button>
        
        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
          <ChevronDown size={20} className="text-gray-500" />
        </div>
      </div>
    </header>
  );
}