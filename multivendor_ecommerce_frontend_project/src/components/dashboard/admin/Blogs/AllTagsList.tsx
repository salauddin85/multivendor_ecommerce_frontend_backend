'use client';

import React, { useState } from 'react';
import axios from '@/lib/axios';
import { toast } from 'react-toastify';

/* ---------------- TYPES ---------------- */
interface Tag {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
}

interface AllTagsListProps {
  tags_list: {
    data: Tag[];
  };
}

/* ---------------- COMPONENT ---------------- */
export default function AllTagsList({ tags_list }: AllTagsListProps) {
  /* ---------------- STATE ---------------- */
  const [tags, setTags] = useState<Tag[]>(tags_list.data || []);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  /* ---------------- CREATE ---------------- */
  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error('Tag name cannot be empty');
      return;
    }

    setCreateLoading(true);

    try {
      const res = await axios.post(
        '/api/blogs/v1/tags/',
        { name: newTagName },
        { withCredentials: true }
      );

      if (res.status === 201 || res.status === 200) {
        // ✅ Normalize API response
        const apiTag = res.data.data ?? res.data;
        const now = new Date().toISOString();

        const createdTag: Tag = {
          id: apiTag.id,
          name: apiTag.name,
          created_at: apiTag.created_at || now,
          updated_at: apiTag.updated_at || now,
        };

        // ✅ Refresh ছাড়াই UI update
        setTags(prev => [createdTag, ...prev]);

        toast.success('Tag created successfully');
        setIsCreateOpen(false);
        setNewTagName('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create tag');
    } finally {
      setCreateLoading(false);
    }
  };

  /* ---------------- UPDATE ---------------- */
  const handleUpdateTag = async (id: number) => {
    if (!editingName.trim()) {
      toast.error('Tag name cannot be empty');
      return;
    }

    setLoadingId(id);

    try {
      const res = await axios.patch(
        `/api/blogs/v1/tags/${id}/`,
        { name: editingName },
        { withCredentials: true }
      );

      if (res.status === 200) {
        const now = new Date().toISOString();

        setTags(prev =>
          prev.map(tag =>
            tag.id === id
              ? { ...tag, name: editingName, updated_at: now }
              : tag
          )
        );

        toast.success('Tag updated successfully');
        setEditingId(null);
        setEditingName('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update tag');
    } finally {
      setLoadingId(null);
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDeleteTag = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;

    setLoadingId(id);

    try {
      const res = await axios.delete(
        `/api/blogs/v1/tags/${id}/`,
        { withCredentials: true }
      );

      if (res.status === 200 || res.status === 204) {
        setTags(prev => prev.filter(tag => tag.id !== id));
        toast.success('Tag deleted successfully');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete tag');
    } finally {
      setLoadingId(null);
    }
  };

  /* ---------------- HELPERS ---------------- */
  const startEditing = (tag: Tag) => {
    setEditingId(tag.id);
    setEditingName(tag.name);
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
        <h1 className="text-2xl font-semibold">All Tags</h1>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 bg-orange-500 text-white rounded-md"
        >
          Create Tag
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {tags.length === 0 && <p className="text-gray-500">No tags found</p>}

        {tags.map(tag => (
          <div
            key={tag.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow border"
          >
            {/* LEFT */}
            <div className="flex-1">
              {editingId === tag.id ? (
                <input
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  className="px-3 py-2 border rounded-md w-full max-w-xs"
                  autoFocus
                />
              ) : (
                <>
                  <h3 className="font-semibold text-lg">{tag.name}</h3>
                  <p className="text-sm text-gray-500">
                    Created: {formatDateTime(tag.created_at)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Updated: {formatDateTime(tag.updated_at)}
                  </p>
                </>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2">
              {editingId === tag.id ? (
                <>
                  <button
                    onClick={() => handleUpdateTag(tag.id)}
                    disabled={loadingId === tag.id}
                    className="px-4 py-2 bg-green-500 text-white rounded-md"
                  >
                    {loadingId === tag.id ? 'Saving...' : 'Save'}
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
                    onClick={() => startEditing(tag)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    disabled={loadingId === tag.id}
                    className="px-4 py-2 bg-red-500 text-white rounded-md"
                  >
                    {loadingId === tag.id ? 'Deleting...' : 'Delete'}
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
            <h2 className="text-lg font-semibold mb-4">Create Tag</h2>

            <input
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              placeholder="Enter tag name"
              className="w-full px-3 py-2 border rounded-md mb-4"
              autoFocus
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setNewTagName('');
                }}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateTag}
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
