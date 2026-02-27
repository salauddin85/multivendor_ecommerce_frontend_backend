'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { update_role_permissions } from '@/actions/authorization';
import { toast } from 'react-toastify';

export default function EditRoleModal({
  open,
  onOpenChange,
  currentName,
  roleId,
  currentPermissions,
  onSave,
}: any) {
  const [roleName, setRoleName] = useState(currentName);
    const [isLoading, setIsLoading] = useState(false)

 const handleSave = async () => {
    if (!roleName.trim()) {
      toast.error("Role name is required")
      return
    }

    if (!roleId) {
      toast.error("Role ID is missing")
      return
    }

    setIsLoading(true)
    try {
      const permissionIds = currentPermissions.map((p: any) => p.id)
      const result = await update_role_permissions(roleId, {
        name: roleName,
        permissions: permissionIds,
      })

      if (result.success) {
        toast.success(result.message)
        onSave(roleName)
        onOpenChange(false)
      } else {
        toast.error(result.message || "Failed to update role")
      }
    } catch (error) {
      toast.error("An error occurred while updating the role")
      console.error("Edit role error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg">
        <button
          onClick={() => {
            onOpenChange(false);
            setRoleName(currentName);
          }}
          className="absolute right-4 top-4 rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-lg font-bold text-foreground">Edit Role Name</h2>

        <div className="mt-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Role Name
          </label>
          <input
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="Enter role name"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              onOpenChange(false);
              setRoleName(currentName);
            }}
            className="flex-1 rounded-lg border border-border bg-card px-4 py-2 font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
