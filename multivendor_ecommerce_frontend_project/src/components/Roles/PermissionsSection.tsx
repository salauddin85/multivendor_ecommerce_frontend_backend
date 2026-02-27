"use client";

import { update_role_permissions } from "@/actions/authorization";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

export default function PermissionsSection({
  permissions,
  onAddClick,
  onRemove,
  roleId,
  roleName,
}: any) {
  const permissionColors = [
    "bg-blue-100 text-blue-700 border-blue-200",
    "bg-purple-100 text-purple-700 border-purple-200",
    "bg-indigo-100 text-indigo-700 border-indigo-200",
    "bg-cyan-100 text-cyan-700 border-cyan-200",
    "bg-violet-100 text-violet-700 border-violet-200",
  ];
  const [removingId, setRemovingId] = useState(null);
  const handleRemovePermission = async (permissionId: any) => {
    try {
      setRemovingId(permissionId);
      const remainingPermissions = permissions
        .filter((p:any) => p.id !== permissionId)
        .map((p:any) => p.id);
      const permissionData = {
        name: roleName,
        permissions: remainingPermissions,
      };
      const result = await update_role_permissions(roleId, permissionData);

      if (result?.success === false) {
        toast.error(result?.message || "Failed to remove permission");
        setRemovingId(null);
        return;
      }

      onRemove(permissionId);
      toast.success("Permission removed successfully");
    } catch (error:any) {
      toast.error(error.message || "Error removing permission");
    } finally {
      setRemovingId(null);
    }
  };
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Permissions</h2>
        <button
          onClick={onAddClick}
          className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Permission</span>
        </button>
      </div>

      {permissions.length > 0 ? (
        <div className="space-y-2">
          {permissions.map((permission: any, index: any) => (
            <div
              key={permission.id}
              className={`flex items-center justify-between rounded-md border p-3 ${
                permissionColors[index % permissionColors.length]
              }`}
            >
              <div>
                <p className="font-medium">{permission.name}</p>
                <p className="text-xs opacity-75">{permission.code}</p>
              </div>
              <button
                onClick={() => handleRemovePermission(permission.id)}
                className="rounded p-1 transition-colors hover:bg-black/10"
                disabled={removingId === permission.id}
                aria-label="Remove permission"
              >
                <X
                  className={`h-4 w-4 ${
                    removingId === permission.id ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-muted-foreground">No permissions assigned yet</p>
          <button
            onClick={onAddClick}
            className="mt-3 text-sm font-medium text-primary hover:underline"
          >
            Add first permission
          </button>
        </div>
      )}
    </div>
  );
}
