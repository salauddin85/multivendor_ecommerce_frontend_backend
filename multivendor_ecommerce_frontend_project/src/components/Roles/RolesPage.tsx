"use client";

import { useState } from "react";
import DeleteModal from "@/components/Roles/DeleteModal";
import RoleCard from "@/components/Roles/RoleCard";
import { delete_role } from "@/actions/authorization";
import { toast } from "react-toastify";
import RolesHeader from "./RolesHeader";
export default function RolesPage({ rolesData, permissions }: any) {
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    roleId: null,
  });

  const handleConfirmDelete = async (roleId: any) => {
    try {
      const result = await delete_role(roleId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || "Failed to delete role");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the role");
      console.error("Delete role error:", error);
    }
  };
  const handleDeleteRole = (roleId: any) => {
    handleConfirmDelete(roleId);
    setDeleteModal({ open: false, roleId: null });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <RolesHeader
        allPermissions={permissions}
        onPermissionCreated={() => {}}
        onRoleCreated={() => {}}
      />

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rolesData &&
            rolesData?.map((role: any) => (
              <RoleCard
                key={role.id}
                role={role}
                onDelete={() => setDeleteModal({ open: true, roleId: role.id })}
              />
            ))}
        </div>

        {rolesData?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No roles found</p>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteModal
        open={deleteModal.open}
        onOpenChange={(open: any) => setDeleteModal({ ...deleteModal, open })}
        onConfirm={() =>
          deleteModal.roleId && handleDeleteRole(deleteModal.roleId)
        }
        title="Delete Role"
        description="Are you sure you want to delete this role? This action cannot be undone."
      />
    </div>
  );
}
