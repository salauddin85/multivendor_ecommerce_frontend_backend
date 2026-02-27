'use client'
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from '@/lib/axios';
import { Plus, Edit2, Check, X, Loader2 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

// Type definitions
interface ShippingConfiguration {
  id: number;
  created_at: string;
  updated_at: string;
  location_name: 'inside dhaka' | 'outside dhaka' | string;
  shipping_fee: string
}

interface ApiResponse {
  code: number;
  status: string;
  message: string;
  data: ShippingConfiguration[] | ShippingConfiguration;
}

interface FormData {
  location_name: string;
  shipping_fee: string | number;
}

interface FieldErrors {
  [key: string]: string[];
}

interface ShippingConfigurationsProps {
  initialData: ShippingConfiguration[];
}

const ShippingConfigurations: React.FC<ShippingConfigurationsProps> = ({ initialData }) => {
  // State with proper typing
  const [configurations, setConfigurations] = useState<ShippingConfiguration[]>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    location_name: '',
    shipping_fee: ''
  });
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [addFormErrors, setAddFormErrors] = useState<FieldErrors>({});

  // Clear field errors when form data changes
  useEffect(() => {
    if (fieldErrors.shipping_fee && formData.shipping_fee !== '') {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.shipping_fee;
        return newErrors;
      });
    }
  }, [formData.shipping_fee]);

  // Clear add form errors when form data changes
  useEffect(() => {
    if (showAddForm && formData.location_name && addFormErrors.location_name) {
      setAddFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.location_name;
        return newErrors;
      });
    }
    if (showAddForm && formData.shipping_fee && addFormErrors.shipping_fee) {
      setAddFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.shipping_fee;
        return newErrors;
      });
    }
  }, [formData.location_name, formData.shipping_fee, showAddForm]);

  // Fetch shipping configurations for refreshing data
  const fetchConfigurations = async (): Promise<void> => {
    try {
      setIsRefreshing(true);
      setError(null);
      setFieldErrors({});
      
      const response = await axios.get<ApiResponse>('/api/orders/v1/shipping_configuration/');
      
      if (response.data.code === 200) {
        const data = response.data.data;
        if (Array.isArray(data)) {
          setConfigurations(data);
          toast.success('Shipping configurations refreshed successfully');
        } else {
          setConfigurations([data]);
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch shipping configurations';
      const errors = err.response?.data?.errors || {};
      
      setError(errorMessage);
      
      if (Object.keys(errors).length > 0) {
        // Display field errors if present
        Object.entries(errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            toast.error(`${field}: ${messages[0]}`);
          }
        });
      } else {
        toast.error(errorMessage);
      }
      
      console.error('Fetch error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Refresh button handler
  const handleRefresh = (): void => {
    fetchConfigurations();
  };

  // Handle form input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'shipping_fee' ? parseFloat(value) || '' : value
    }));
  };

  // Format error messages from backend
  const formatErrorMessage = (errors: any): string => {
    if (typeof errors === 'string') return errors;
    if (Array.isArray(errors)) return errors.join(', ');
    if (typeof errors === 'object') {
      return Object.entries(errors)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join('; ');
    }
    return 'An error occurred';
  };

  // Handle add new configuration
  const handleAddSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setAddFormErrors({});
    
    // Basic frontend validation
    if (!formData.location_name || formData.shipping_fee === '') {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if location already exists
    const locationExists = configurations.some(
      config => config.location_name.toLowerCase() === formData.location_name.toLowerCase()
    );

    if (locationExists) {
      setAddFormErrors({
        location_name: [`Shipping configuration for "${formData.location_name}" already exists`]
      });
      toast.error(`Shipping configuration for "${formData.location_name}" already exists`);
      return;
    }

    setFormLoading(true);

    try {
      const response = await axios.post<ApiResponse>(
        '/api/orders/v1/shipping_configuration/', 
        formData
      );
      
      if (response.data.code === 200) {
        await fetchConfigurations();
        setFormData({ location_name: '', shipping_fee: '' });
        setShowAddForm(false);
        setAddFormErrors({});
        toast.success('Shipping configuration added successfully');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to add configuration';
      const errors = err.response?.data?.errors || {};
      
      console.error('Error adding configuration:', err);
      
      // Set field-level errors for add form
      if (Object.keys(errors).length > 0) {
        setAddFormErrors(errors);
        
        // Show each field error as toast
        Object.entries(errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            toast.error(`${field}: ${messages[0]}`);
          }
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit configuration
  const handleEditSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!editingId) return;
    
    // Basic frontend validation
    if (formData.shipping_fee === '' || Number(formData.shipping_fee) < 0) {
      setFieldErrors({
        shipping_fee: ['Please enter a valid shipping fee (must be positive)']
      });
      toast.error('Please enter a valid shipping fee');
      return;
    }

    if (Number(formData.shipping_fee) > 500) {
      setFieldErrors({
        shipping_fee: ['Shipping fee cannot be more than 500']
      });
      toast.error('Shipping fee cannot be more than 500');
      return;
    }

    setFormLoading(true);
    setFieldErrors({});

    try {
      const response = await axios.patch<ApiResponse>(
        `/api/orders/v1/shipping_configuration/${editingId}/`,
        { shipping_fee: formData.shipping_fee }
      );
      
      if (response.data.code === 200) {
        await fetchConfigurations();
        setEditingId(null);
        setFormData({ location_name: '', shipping_fee: '' });
        setFieldErrors({});
        toast.success('Shipping configuration updated successfully');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update configuration';
      const errors = err.response?.data?.errors || {};
      
      console.error('Error updating configuration:', err);
      
      // Set field-level errors for edit form
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        
        // Show each field error as toast
        Object.entries(errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            toast.error(`${field}: ${messages[0]}`);
          }
        });
        
        // If shipping_configuration_id error (not found), cancel editing
        if (errors.shipping_configuration_id) {
          setEditingId(null);
          setFormData({ location_name: '', shipping_fee: '' });
        }
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setFormLoading(false);
    }
  };

  // Start editing a configuration
  const startEditing = (config: ShippingConfiguration): void => {
    setEditingId(config.id);
    setFormData({
      location_name: config.location_name,
      shipping_fee: parseFloat(config.shipping_fee)
    });
    setFieldErrors({});
  };

  // Cancel editing
  const cancelEditing = (): void => {
    setEditingId(null);
    setFormData({ location_name: '', shipping_fee: '' });
    setFieldErrors({});
    toast.info('Editing cancelled');
  };

  // Cancel add form
  const cancelAddForm = (): void => {
    setShowAddForm(false);
    setFormData({ location_name: '', shipping_fee: '' });
    setAddFormErrors({});
  };

  // Format currency
  const formatCurrency = (value: string): string => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '৳0.00';
    return `৳${numValue.toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Handle key press for form submission
  const handleKeyPress = (e: React.KeyboardEvent, configId: number): void => {
    if (e.key === 'Enter' && editingId === configId) {
      handleEditSubmit(e as unknown as FormEvent);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shipping Configurations</h1>
              <p className="text-gray-600 mt-2">Manage shipping fees for different locations</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                'Refresh Data'
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Add New Configuration Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isRefreshing}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Shipping Configuration
          </button>
        </div>

        {/* Add Form Modal - Responsive with blue background */}
        {showAddForm && (
          <div className="fixed inset-0  bg-opacity-20 flex items-center justify-center p-2 sm:p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-2 sm:mx-4">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Add Shipping Configuration</h3>
                  <button
                    onClick={cancelAddForm}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded transition-colors p-1"
                    disabled={formLoading}
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="add_location_name" className="block text-sm font-medium text-gray-700 mb-2">
                        Location Name *
                      </label>
                      <select
                        id="add_location_name"
                        name="location_name"
                        value={formData.location_name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                          addFormErrors.location_name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        required
                        disabled={formLoading}
                        aria-describedby={addFormErrors.location_name ? "location-name-error" : undefined}
                      >
                        <option value="">Select location</option>
                        <option value="inside dhaka">Inside Dhaka</option>
                        <option value="outside dhaka">Outside Dhaka</option>
                      </select>
                      {addFormErrors.location_name && (
                        <div id="location-name-error" className="mt-1">
                          {addFormErrors.location_name.map((error, index) => (
                            <p key={index} className="text-red-600 text-xs">
                              {error}
                            </p>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Note: Only two locations are supported</p>
                    </div>

                    <div>
                      <label htmlFor="add_shipping_fee" className="block text-sm font-medium text-gray-700 mb-2">
                        Shipping Fee *
                      </label>
                      <input
                        type="number"
                        id="add_shipping_fee"
                        name="shipping_fee"
                        value={formData.shipping_fee}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        max="500"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                          addFormErrors.shipping_fee ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter shipping fee (e.g., 70.00)"
                        required
                        disabled={formLoading}
                        aria-describedby={addFormErrors.shipping_fee ? "shipping-fee-error" : undefined}
                      />
                      {addFormErrors.shipping_fee && (
                        <div id="shipping-fee-error" className="mt-1">
                          {addFormErrors.shipping_fee.map((error, index) => (
                            <p key={index} className="text-red-600 text-xs">
                              {error}
                            </p>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Enter amount in BDT (max: 500)</p>
                    </div>

                    {/* Display server errors that are not field-specific */}
                    {addFormErrors.server_error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">
                          {formatErrorMessage(addFormErrors.server_error)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-6 pt-6 border-t">
                    <button
                      type="button"
                      onClick={cancelAddForm}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                      disabled={formLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center w-full sm:w-auto"
                    >
                      {formLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Adding...
                        </>
                      ) : (
                        'Add Configuration'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Configurations Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location Name
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shipping Fee
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated At
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {configurations.map((config) => (
                  <tr 
                    key={config.id} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{config.id}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {config.location_name}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingId === config.id ? (
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                          <div className="flex-1">
                            <input
                              type="number"
                              name="shipping_fee"
                              value={formData.shipping_fee}
                              onChange={handleInputChange}
                              onKeyDown={(e) => handleKeyPress(e, config.id)}
                              step="0.01"
                              min="0"
                              max="500"
                              className={`w-full px-3 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50 transition-colors ${
                                fieldErrors.shipping_fee ? 'border-red-300' : 'border-gray-300'
                              }`}
                              disabled={formLoading}
                              autoFocus
                              aria-describedby={fieldErrors.shipping_fee ? `shipping-fee-error-${config.id}` : undefined}
                            />
                            {fieldErrors.shipping_fee && (
                              <div id={`shipping-fee-error-${config.id}`} className="mt-1">
                                {fieldErrors.shipping_fee.map((error, index) => (
                                  <p key={index} className="text-red-600 text-xs">
                                    {error}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="text-gray-500 text-sm">BDT</span>
                        </div>
                      ) : (
                        <span className="font-semibold text-orange-600">
                          {formatCurrency(config.shipping_fee)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="hidden sm:inline">{formatDate(config.created_at)}</span>
                      <span className="sm:hidden text-xs">
                        {new Date(config.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="hidden sm:inline">{formatDate(config.updated_at)}</span>
                      <span className="sm:hidden text-xs">
                        {new Date(config.updated_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                      {editingId === config.id ? (
                        <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                          <button
                            onClick={handleEditSubmit}
                            disabled={formLoading}
                            className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center justify-center"
                            title="Save changes"
                            type="button"
                          >
                            {formLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="w-4 h-4 sm:mr-1" />
                                <span className="text-xs sm:hidden">Save</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={formLoading}
                            className="p-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 flex items-center justify-center"
                            title="Cancel editing"
                            type="button"
                          >
                            <X className="w-4 h-4 sm:mr-1" />
                            <span className="text-xs sm:hidden">Cancel</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(config)}
                          className="p-1.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 flex items-center justify-center w-full sm:w-auto"
                          title="Edit shipping fee"
                          type="button"
                          disabled={formLoading || isRefreshing}
                        >
                          <Edit2 className="w-4 h-4 sm:mr-1" />
                          <span className="text-xs sm:hidden">Edit</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {configurations.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium">No shipping configurations found</p>
              <p className="text-gray-400 mt-2 mb-6">Add your first shipping configuration to get started</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add your first configuration
              </button>
            </div>
          )}
        </div>

        {/* Stats and Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Important Notes</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Only two locations are supported: Inside Dhaka and Outside Dhaka</li>
                    <li>When editing, only the shipping fee can be modified</li>
                    <li>Location name cannot be changed once created</li>
                    <li>Shipping fee must be between 0 and 500 BDT</li>
                    <li>Press Enter to save changes while editing</li>
                    <li>Press Escape to cancel editing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Box */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-orange-800 mb-3">Shipping Configuration Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-lg border border-orange-100">
                <p className="text-xs text-gray-500">Total Configurations</p>
                <p className="text-2xl font-bold text-orange-600">{configurations.length}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-orange-100">
                <p className="text-xs text-gray-500">Inside Dhaka</p>
                <p className="text-2xl font-bold text-orange-600">
                  {configurations.filter(c => c.location_name.toLowerCase() === 'inside dhaka').length}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-orange-100">
                <p className="text-xs text-gray-500">Outside Dhaka</p>
                <p className="text-2xl font-bold text-orange-600">
                  {configurations.filter(c => c.location_name.toLowerCase() === 'outside dhaka').length}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-orange-100">
                <p className="text-xs text-gray-500">Average Fee</p>
                <p className="text-2xl font-bold text-orange-600">
                  ৳{configurations.length > 0 
                    ? (configurations.reduce((sum, config) => sum + parseFloat(config.shipping_fee), 0) / configurations.length).toFixed(2)
                    : '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingConfigurations;