'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Trash2, Eye } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';

interface CategoryGridImage {
  id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  image: string;
  display_order: number;
  category: {
    id: number;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    name: string;
    slug: string;
    icon: null | string;
    display_order: number;
    parent: number;
  };
}

interface AllCategoryGridImagesProps {
  category_grid_images: CategoryGridImage[];
}

// Modal Component for Delete Confirmation
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Delete Grid Image
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to delete this category grid image? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            {isDeleting ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Deleting...
              </>
            ) : (
              'Yes, Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal Component for Image Zoom
const ImageZoomModal = ({
  isOpen,
  onClose,
  imageUrl,
  categoryName,
}: {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  categoryName: string;
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all cursor-zoom-out"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
        <div className="relative w-full h-[70vh]">
          <Image
            src={imageUrl}
            alt={categoryName}
            className="object-contain rounded-lg shadow-2xl"
            fill
          />
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur text-white rounded-full p-2 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default function AllCategoryGridImages({ category_grid_images }: AllCategoryGridImagesProps) {
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CategoryGridImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Zoom modal state
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [zoomImageUrl, setZoomImageUrl] = useState('');
  const [zoomCategoryName, setZoomCategoryName] = useState('');

  const openDeleteModal = (item: CategoryGridImage) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedItem(null);
  };

  const openZoomModal = (imageUrl: string, categoryName: string) => {
    setZoomImageUrl(imageUrl);
    setZoomCategoryName(categoryName);
    setZoomModalOpen(true);
  };

  const closeZoomModal = () => {
    setZoomModalOpen(false);
    setZoomImageUrl('');
    setZoomCategoryName('');
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/api/catalog/v1/category_grid_images/${selectedItem.id}/`);
      // Refresh the page to reflect changes (or you could update state locally)
      router.refresh();
      closeDeleteModal();
      toast.success('Category grid image deleted successfully!');
    } catch (error) {
      console.error('Failed to delete category grid image:', error);
      // Optionally show an error toast here
      toast.error('Failed to delete category grid image. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to construct full image URL
  const getFullImageUrl = (path: string) => {
    return `${process.env.NEXT_PUBLIC_BACKEND_API_URL}${path}`;
  };

  return (
    <>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header with title and add button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
            Category Grid Images
          </h1>
          <Link href="/dashboard/admin/catalogs/category_grid_images/add" className="inline-flex items-center justify-center px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 text-sm md:text-base">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Category Grid Image
          </Link>
        </div>

        {/* Grid container */}
        {category_grid_images.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No category grid images found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {category_grid_images.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 flex flex-col"
              >
                {/* Image container with overlay actions */}
                <div className="relative aspect-[4/3] w-full bg-gray-100 dark:bg-gray-900">
                  <Image
                    src={getFullImageUrl(item.image)}
                    alt={item.category.name}
                    className="w-full h-full object-cover"
                    fill
                  />

                  {/* Action buttons overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                      onClick={() => openZoomModal(getFullImageUrl(item.image), item.category.name)}
                      className="p-2.5 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-md hover:scale-110 transition-transform"
                      title="View"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(item)}
                      className="p-2.5 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-md hover:scale-110 transition-transform"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white text-base mb-1 line-clamp-1">
                    {item.category.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Order: {item.display_order}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    ID: {item.id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />

      {/* Image Zoom Modal */}
      <ImageZoomModal
        isOpen={zoomModalOpen}
        onClose={closeZoomModal}
        imageUrl={zoomImageUrl}
        categoryName={zoomCategoryName}
      />
    </>
  );
}