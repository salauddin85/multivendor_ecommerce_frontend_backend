// components/dashboard/vendor/products/ProductAttributeValues.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Check, 
  X, 
  Save,
  AlertTriangle,
  Hash
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { useParams } from 'next/navigation';

interface AttributeValue {
  id: number;
  attribute: number;
  value: string;
  color_code: string;
  created_at: string;
  updated_at: string;
}

interface ProductAttributeValuesProps {
  values: AttributeValue[];
  attributeId?: number; // Optional prop for attribute ID
}

export default function ProductAttributeValues({ values, attributeId: propAttributeId }: ProductAttributeValuesProps) {
  const params = useParams();
  const [attributeValues, setAttributeValues] = useState<AttributeValue[]>(values);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editColor, setEditColor] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newValue, setNewValue] = useState({ value: '', color_code: '#3B82F6' });

  // Get attribute ID from params or props
  const attributeId = propAttributeId || (params?.id ? parseInt(params.id as string) : null);

  // Debug: Log the attribute ID
  useEffect(() => {
    console.log('Attribute ID:', attributeId);
    console.log('Values:', values);
  }, [attributeId, values]);

  // Edit Function
  const handleEdit = (value: AttributeValue) => {
    setEditingId(value.id);
    setEditValue(value.value);
    setEditColor(value.color_code || '#3B82F6');
  };

  const handleSaveEdit = async (id: number) => {
    if (!editValue.trim()) {
      toast.error('Value cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosInstance.patch(
        `/api/products/v1/products/attributes/values/${id}/`,
        {
          value: editValue,
          color_code: editColor
        }
      );

      if (response.status === 200) {
        setAttributeValues(prev =>
          prev.map(item =>
            item.id === id ? { ...item, value: editValue, color_code: editColor } : item
          )
        );
        toast.success('Value updated successfully');
        setEditingId(null);
      }
    } catch (error: any) {
      console.error('Failed to update value:', error);
      toast.error(error.response?.data?.message || 'Failed to update value');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
    setEditColor('');
  };

  // Delete Function
  const handleDelete = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.delete(
        `/api/products/v1/products/attributes/values/${id}/`
      );

      if (response.status === 204 || response.status === 200) {
        setAttributeValues(prev => prev.filter(item => item.id !== id));
        toast.success('Value deleted successfully');
        setShowDeleteModal(null);
      }
    } catch (error: any) {
      console.error('Failed to delete value:', error);
      toast.error(error.response?.data?.message || 'Failed to delete value');
    } finally {
      setIsLoading(false);
    }
  };

  // Add New Value
  const handleAddNewValue = async () => {
    // Validation
    if (!newValue.value.trim()) {
      toast.error('Please enter a value');
      return;
    }

    if (!attributeId) {
      toast.error('Attribute ID not found');
      console.error('Attribute ID is missing');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Adding new value for attribute ID:', attributeId);
      console.log('Payload:', {
        value: newValue.value,
        color_code: newValue.color_code
      });

      // Try different endpoint formats
      let response;
      const endpoints = [
        `/api/products/v1/products/attributes/${attributeId}/values/`,
        `/api/products/v1/products/attributes/values/`,
        `/api/vendors_dashboard/v1/vendors/products/attributes/${attributeId}/values/`
      ];

      for (const endpoint of endpoints) {
        try {
          console.log('Trying endpoint:', endpoint);
          response = await axiosInstance.post(endpoint, {
            value: newValue.value,
            color_code: newValue.color_code,
            attribute: attributeId // Include attribute ID in body if needed
          });
          
          if (response.status === 201 || response.status === 200) {
            console.log('Success with endpoint:', endpoint);
            break;
          }
        } catch (e) {
          console.log(`Endpoint ${endpoint} failed, trying next...`);
          continue;
        }
      }

      if (response && (response.status === 201 || response.status === 200)) {
        // Handle different response formats
        const newItem = response.data.data || response.data;
        
        setAttributeValues(prev => [...prev, {
          id: newItem.id,
          attribute: attributeId,
          value: newItem.value,
          color_code: newItem.color_code || newValue.color_code,
          created_at: newItem.created_at || new Date().toISOString(),
          updated_at: newItem.updated_at || new Date().toISOString()
        }]);
        
        setNewValue({ value: '', color_code: '#3B82F6' });
        toast.success('New value added successfully');
      } else {
        throw new Error('Failed to add value');
      }
    } catch (error: any) {
      console.error('Failed to add new value:', error);
      
      // Show specific error message from API
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail ||
                          error.response?.data?.error ||
                          'Failed to add new value';
      
      toast.error(errorMessage);
      
      // Log full error for debugging
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Attribute Values</h1>
            <p className="text-gray-600 mt-1">
              Manage values for your product attribute
            </p>
            {attributeId && (
              <p className="text-sm text-gray-500 mt-2">
                Attribute ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{attributeId}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-blue-600" />
            <span className="text-gray-700">
              Total Values: {attributeValues.length}
            </span>
          </div>
        </div>
      </div>

      {/* Add New Value Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-green-600" />
          Add New Value
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Value Name
            </label>
            <input
              type="text"
              value={newValue.value}
              onChange={(e) => setNewValue({...newValue, value: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="e.g., 512GB"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Code
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={newValue.color_code}
                onChange={(e) => setNewValue({...newValue, color_code: e.target.value})}
                className="w-12 h-12 cursor-pointer rounded-lg border border-gray-300"
                disabled={isLoading}
              />
              <input
                type="text"
                value={newValue.color_code}
                onChange={(e) => setNewValue({...newValue, color_code: e.target.value})}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="#000000"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAddNewValue}
              disabled={isLoading || !attributeId}
              className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
              title={!attributeId ? "Attribute ID not found" : ""}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add Value
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Show error if attribute ID is missing */}
        {!attributeId && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              ⚠️ Attribute ID not found. Please make sure you're on the correct page.
            </p>
          </div>
        )}
      </div>

      {/* Values List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {attributeValues.map((item) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                        disabled={isLoading}
                      />
                    ) : (
                      <span className="text-gray-900 font-medium">
                        {item.value}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          className="w-10 h-10 cursor-pointer rounded border border-gray-300"
                          disabled={isLoading}
                        />
                        <input
                          type="text"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          className="w-32 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={isLoading}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg border border-gray-300"
                          style={{ backgroundColor: item.color_code }}
                        />
                        <span className="text-gray-600 font-mono">
                          {item.color_code}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(item.updated_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveEdit(item.id)}
                          disabled={isLoading}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={isLoading}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          disabled={isLoading}
                          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center gap-2 disabled:opacity-50"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(item.id)}
                          disabled={isLoading}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center gap-2 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setShowDeleteModal(null)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Delete Value
                  </h3>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this value? This action cannot be undone and will permanently remove the value from your attribute.
                </p>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-700">
                    <strong>Warning:</strong> Deleting this value may affect products that are using it.
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    disabled={isLoading}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteModal)}
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete Permanently
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {attributeValues.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Hash className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Values Found
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Start by adding your first attribute value using the form above.
          </p>
        </div>
      )}
    </div>
  );
}