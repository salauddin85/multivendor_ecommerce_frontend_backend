'use client';
import React from 'react';
import Image from 'next/image';
import { useStoreData } from '@/store/storeStore';


export default function StoreDetails({ store_details }: { store_details: any }) {
  // console.log("Store Details Props:", store_details);
  // Extract store data from the response structure
  const store = store_details?.data?.[0] || {};
  const setStoreData = useStoreData((state) => state.setStoreData);
  
  const handleUpdateClick = () => {
    // Set data to Zustand before navigation
    if (store && store.id) {
      setStoreData(store);
    }
    if (store.type=='vendor'){
      window.location.href = '/dashboard/vendor/store/update';
      return;
    }
    if (store.type=='company'){
      window.location.href = '/dashboard/company/store/update';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Banner Section */}
          <div className="h-32 sm:h-48 bg-gradient-to-r from-orange-400 to-red-300 relative">
            {store.banner ? (
              <Image src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${store.banner}`} alt="Store Banner" className="w-full h-full object-cover" fill />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-lg opacity-50">No Banner Image</p>
              </div>
            )}
          </div>

          {/* Logo and Store Name Section */}
          <div className="px-4 sm:px-6 lg:px-8 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-12 sm:-mt-16 gap-4">
              {/* Logo */}
              <div className="w-24 mt-16 h-24 sm:w-32 sm:h-32 rounded-lg border-4 border-white shadow-lg bg-white flex items-center justify-center overflow-hidden">
                {store.logo ? (
                  <Image src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${store.logo}`} alt="Store Logo" className="w-full h-full object-cover" width={128} height={128} />
                ) : (
                  <div className="text-4xl font-bold text-gray-400">
                    {store.store_name?.charAt(0) || 'S'}
                  </div>
                )}
              </div>

              {/* Store Name and Update Button */}
              <div className="flex-1 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 w-full">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {store.store_name || 'Store Name'}
                  </h1>
                  <p className="text-gray-500 text-sm sm:text-base mt-1">
                    {store.slug || 'store-slug'}
                  </p>
                </div>
                
                <button                  
                onClick={handleUpdateClick}
                  className="bg-orange-400 hover:bg-orange-600 text-white cursor-pointer px-6 py-2.5 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
                >
                  Update Store
                </button>
              </div>
            </div>
          </div>

          {/* Store Information Grid */}
          <div className="px-4 sm:px-6 lg:px-8 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Basic Information
                </h2>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Store Type</label>
                    <p className="text-gray-900 mt-1 capitalize">{store.type || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Vendor Email</label>
                    <p className="text-gray-900 mt-1">{store.vendor || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Store Owner</label>
                    <p className="text-gray-900 mt-1">{store.store_owner || 'Not Assigned'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(store.status)}`}>
                        {store.status?.charAt(0).toUpperCase() + store.status?.slice(1) || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Verification Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${store.is_verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {store.is_verified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Additional Details
                </h2>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-gray-900 mt-1">{store.address || 'No address provided'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900 mt-1">{store.description || 'No description available'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created At</label>
                    <p className="text-gray-900 mt-1">
                      {store.created_at ? new Date(store.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="text-gray-900 mt-1">
                      {store.updated_at ? new Date(store.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store ID Card */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Store ID</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">#{store.id || 'N/A'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Slug</p>
              <p className="text-lg font-mono text-blue-600 mt-1">{store.slug || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}