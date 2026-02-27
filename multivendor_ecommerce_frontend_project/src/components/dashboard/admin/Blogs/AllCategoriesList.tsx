'use client';

import React, { useState } from 'react';
import axios from '@/lib/axios';
import { toast } from 'react-toastify';

/* ---------------- TYPES ---------------- */
interface Category {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
}

interface AllCategoriesListProps {
  categories_list: {
    data: Category[];
  };
}

/* ---------------- COMPONENT ---------------- */
export default function AllCategoriesList({
  categories_list,
}: AllCategoriesListProps) {
  /* ---------------- STATE ---------------- */
  const [categories, setCategories] = useState<Category[]>(categories_list.data || []);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  /* ---------------- CREATE ---------------- */
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    setCreateLoading(true);

    try {
      const res = await axios.post(
        `/api/blogs/v1/categories/`,
        { name: newCategoryName },
        { withCredentials: true }
      );

      if (res.status === 201 || res.status === 200) {
        const apiCategory = res.data.data ?? res.data;
        const now = new Date().toISOString();

        // ✅ Normalize and add local timestamps if missing
        const createdCategory: Category = {
          id: apiCategory.id,
          name: apiCategory.name,
          created_at: apiCategory.created_at || now,
          updated_at: apiCategory.updated_at || now,
        };

        setCategories(prev => [createdCategory, ...prev]);

        toast.success('Category created successfully');
        setIsCreateOpen(false);
        setNewCategoryName('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    } finally {
      setCreateLoading(false);
    }
  };

  /* ---------------- UPDATE ---------------- */
  const handleUpdateCategory = async (id: number) => {
    if (!editingName.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    setLoadingId(id);

    try {
      const res = await axios.patch(
        `/api/blogs/v1/categories/${id}/`,
        { name: editingName },
        { withCredentials: true }
      );

      if (res.status === 200) {
        const now = new Date().toISOString();

        setCategories(prev =>
          prev.map(cat =>
            cat.id === id
              ? { ...cat, name: editingName, updated_at: now }
              : cat
          )
        );

        toast.success('Category updated successfully');
        setEditingId(null);
        setEditingName('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update category');
    } finally {
      setLoadingId(null);
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    setLoadingId(id);

    try {
      const res = await axios.delete(
        `/api/blogs/v1/categories/${id}/`,
        { withCredentials: true }
      );

      if (res.status === 200 || res.status === 204) {
        setCategories(prev => prev.filter(cat => cat.id !== id));
        toast.success('Category deleted successfully');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setLoadingId(null);
    }
  };

  /* ---------------- HELPERS ---------------- */
  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">All Categories</h1>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 bg-orange-500 text-white rounded-md"
        >
          Create Category
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {categories.length === 0 && <p className="text-gray-500">No categories found</p>}

        {categories.map(category => (
          <div
            key={category.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow border"
          >
            {/* LEFT */}
            <div className="flex-1">
              {editingId === category.id ? (
                <input
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  className="px-3 py-2 border rounded-md w-full max-w-xs"
                  autoFocus
                />
              ) : (
                <>
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  <p className="text-sm text-gray-500">
                    Created: {formatDateTime(category.created_at)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Updated: {formatDateTime(category.updated_at)}
                  </p>
                </>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2">
              {editingId === category.id ? (
                <>
                  <button
                    onClick={() => handleUpdateCategory(category.id)}
                    disabled={loadingId === category.id}
                    className="px-4 py-2 bg-green-500 text-white rounded-md"
                  >
                    {loadingId === category.id ? 'Saving...' : 'Save'}
                  </button>

                  <button
                    onClick={cancelEditing}
                    className="px-4 py-2 bg-gray-300 rounded-md"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => startEditing(category)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={loadingId === category.id}
                    className="px-4 py-2 bg-red-500 text-white rounded-md"
                  >
                    {loadingId === category.id ? 'Deleting...' : 'Delete'}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Create Category</h2>

            <input
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              placeholder="Enter category name"
              className="w-full px-3 py-2 border rounded-md mb-4"
              autoFocus
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setNewCategoryName('');
                }}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateCategory}
                disabled={createLoading}
                className="px-4 py-2 bg-orange-500 text-white rounded-md"
              >
                {createLoading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
