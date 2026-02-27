// ReviewsRatingList.tsx
'use client';

import React, { useState } from 'react';
import { Star, CheckCircle, Clock, XCircle, MoreVertical, Loader2 } from 'lucide-react';
import Pagination from '@/components/pagination/Pagination';
import axiosInstance from '@/lib/axios';

interface Review {
  id: number;
  user: string;
  product: string;
  rating: number;
  comment: string;
  status: string;
  created_at: string;
  vendor: string | null;
  store_owner: string | null;
  order: number | null;
  is_verified_purchase: boolean;
}

interface ReviewsRatingListProps {
  reviews_list: {
    data: Review[];
    pagination: {
      count: number;
      total_pages: number;
      current_page: number;
      next: string | null;
      previous: string | null;
      page_size: number;
    };
  };
}

export default function ReviewsRatingList({ reviews_list }: ReviewsRatingListProps) {
  const [reviews, setReviews] = useState<Review[]>(reviews_list?.data || []);
  const [loadingStates, setLoadingStates] = useState<{ [key: number]: { approve: boolean; reject: boolean } }>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const pagination = reviews_list?.pagination;

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle approve/reject
  const handleStatusUpdate = async (reviewId: number, newStatus: 'approved' | 'rejected') => {
    // Set loading state for this review
    setLoadingStates(prev => ({
      ...prev,
      [reviewId]: {
        ...prev[reviewId],
        [newStatus === 'approved' ? 'approve' : 'reject']: true
      }
    }));

    try {
      // Make PATCH request to update status
      const response = await axiosInstance.patch(
        `/api/reviews/v1/reviews/${reviewId}/approve/`,
        { status: newStatus },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.status === 200) {
        // Update local state
        setReviews(prevReviews =>
          prevReviews.map(review =>
            review.id === reviewId
              ? { ...review, status: newStatus }
              : review
          )
        );

        showNotification('success', `Review ${newStatus} successfully!`);
      }
    } catch (error: any) {
      console.error(`Failed to ${newStatus} review:`, error);
      
      // Show error message
      const errorMessage = error.response?.data?.message || `Failed to ${newStatus} review. Please try again.`;
      showNotification('error', errorMessage);
    } finally {
      // Clear loading state
      setLoadingStates(prev => ({
        ...prev,
        [reviewId]: {
          ...prev[reviewId],
          [newStatus === 'approved' ? 'approve' : 'reject']: false
        }
      }));
    }
  };

  // Render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={`${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-xs text-gray-600">({rating})</span>
      </div>
    );
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      approved: { 
        color: 'bg-green-100 text-green-800', 
        icon: CheckCircle,
        label: 'Approved'
      },
      pending: { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: Clock,
        label: 'Pending'
      },
      rejected: { 
        color: 'bg-red-100 text-red-800', 
        icon: XCircle,
        label: 'Rejected'
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No reviews found</p>
      </div>
    );
  }

  // Transform pagination data to match your Pagination component's expected format
  const paginationData = pagination ? {
    count: pagination.count,
    current_page: pagination.current_page,
    total_pages: pagination.total_pages,
    next: pagination.next !== null ? pagination.next : false,
    previous: pagination.previous !== null ? pagination.previous : false,
    page_size: pagination.page_size
  } : null;

  return (
    <div className="space-y-4">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg animate-slide-in ${
          notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle size={20} className="text-green-600" />
            ) : (
              <XCircle size={20} className="text-red-600" />
            )}
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Header with count */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          All Reviews <span className="text-gray-500 text-sm ml-2">({pagination?.count || reviews.length} total)</span>
        </h2>
      </div>

      {/* Table - Horizontal scroll on mobile */}
      <div className="relative overflow-hidden bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <table className="w-full min-w-[1000px] lg:min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comment
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verified
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.map((review) => {
                const isLoading = loadingStates[review.id] || { approve: false, reject: false };
                
                return (
                  <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                    {/* User */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-medium">
                            {review.user.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{review.user}</span>
                      </div>
                    </td>

                    {/* Product */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{review.product}</span>
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {renderStars(review.rating)}
                    </td>

                    {/* Comment */}
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="text-sm text-gray-600 truncate" title={review.comment}>
                        {review.comment}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={review.status} />
                    </td>

                    {/* Order # */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {review.order ? `#${review.order}` : 'N/A'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {formatDate(review.created_at)}
                      </span>
                    </td>

                    {/* Verified */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {review.is_verified_purchase ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <CheckCircle size={12} />
                          Verified
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {review.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          {/* Approve Button */}
                          <button
                            onClick={() => handleStatusUpdate(review.id, 'approved')}
                            disabled={isLoading.approve || isLoading.reject}
                            className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading.approve ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <CheckCircle size={12} />
                            )}
                            Approve
                          </button>
                          
                          <span className="text-gray-300">|</span>
                          
                          {/* Reject Button */}
                          <button
                            onClick={() => handleStatusUpdate(review.id, 'rejected')}
                            disabled={isLoading.approve || isLoading.reject}
                            className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading.reject ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <XCircle size={12} />
                            )}
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {paginationData && paginationData.total_pages > 1 && (
        <Pagination 
          paginationData={paginationData}
          className="mt-4"
        />
      )}
    </div>
  );
}