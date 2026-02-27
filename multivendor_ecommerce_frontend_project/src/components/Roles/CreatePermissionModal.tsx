"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { create_permission } from "@/actions/authorization";

export default function CreatePermissionModal({
  open,
  onOpenChange,
  onPermissionCreated,
}: any) {
  const [permissionName, setPermissionName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const handleCreate = async () => {
    if (!permissionName.trim()) {
      toast.error("Permission name is required");
      return;
    }

    setIsLoading(true);
    try {
      const result = await create_permission({
        name: permissionName,
      });

      if (result.success) {
        toast.success(result.message);
        setPermissionName("");
        onOpenChange(false);
        onPermissionCreated?.();
        setErrorMessage("");
      } else {
        toast.error(result.message || "Failed to create permission");
        const errorMessages = result?.data?.errors?.server_error[0];
        setErrorMessage(errorMessages);
        console.log(result);
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error("Create permission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <button
          onClick={() => {
            onOpenChange(false);
            setPermissionName("");
            setErrorMessage("");
          }}
          className="absolute right-4 top-4 rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-lg font-bold text-foreground">Create Permission</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Add a new permission to your system
        </p>

        <div className="mt-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Permission Name
          </label>
          <input
            type="text"
            placeholder="e.g., remove member"
            value={permissionName}
            onChange={(e) => setPermissionName(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
        </div>

        {errorMessage && (
          <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              onOpenChange(false);
              setPermissionName("");
              setErrorMessage("");
            }}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-border bg-card px-4 py-2 font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
