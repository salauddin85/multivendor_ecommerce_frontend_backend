"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import CreatePermissionModal from "./CreatePermissionModal";
import CreateRoleModal from "./CreateRoleModal";

export default function RolesHeader({
  allPermissions,
  onPermissionCreated,
  onRoleCreated,
}: any) {
  const [createPermissionOpen, setCreatePermissionOpen] = useState(false);
  const [createRoleOpen, setCreateRoleOpen] = useState(false);

  return (
    <>
      <div className="border-b border-primary ">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 ">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-md sm:text-3xl font-bold text-foreground">
                Authorization Roles
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage roles and permissions for your system
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCreatePermissionOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary/80"
              >
                <Plus className="h-4 w-4" />
                <span className="inline">Create Permission</span>
              </button>
              <button
                onClick={() => setCreateRoleOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                <span className="inline">Create Role</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <CreatePermissionModal
        open={createPermissionOpen}
        onOpenChange={setCreatePermissionOpen}
        onPermissionCreated={onPermissionCreated}
      />

      <CreateRoleModal
        open={createRoleOpen}
        onOpenChange={setCreateRoleOpen}
        allPermissions={allPermissions}
        onRoleCreated={onRoleCreated}
      />
    </>
  );
}
