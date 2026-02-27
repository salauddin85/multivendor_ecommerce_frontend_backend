"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { toast } from "react-toastify"
import { create_role } from "@/actions/authorization"

export default function CreateRoleModal({ open, onOpenChange, allPermissions, onRoleCreated }: any) {
  const [roleName, setRoleName] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<any>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleCreate = async () => {
    if (!roleName.trim()) {
      toast.error("Role name is required")
      return
    }

    setIsLoading(true)
    try {
      const result = await create_role({
        name: roleName,
        permissions: selectedPermissions,
      })

      if (result.success) {
        toast.success(result.message)
        setRoleName("")
        setSelectedPermissions([])
        onOpenChange(false)
        onRoleCreated?.()
      } else {
        toast.error(result.message || "Failed to create role")
      }
    } catch (error) {
      toast.error("An error occurred")
      console.error("Create role error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
        <button
          onClick={() => {
            onOpenChange(false)
            setRoleName("")
            setSelectedPermissions([])
          }}
          className="absolute cursor-pointer right-4 top-4 rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-lg font-bold text-foreground">Create Role</h2>
        <p className="mt-2 text-sm text-muted-foreground">Create a new role and assign permissions</p>

        <div className="mt-4">
          <label className="block text-sm font-medium text-foreground mb-2">Role Name</label>
          <input
            type="text"
            placeholder="e.g., Moderator"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
        </div>

        <div className="mt-2">
          <label className="block text-sm font-medium text-foreground mb-3">Permissions</label>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {allPermissions.length > 0 ? (
              allPermissions.map((permission: any) => (
                <label
                  key={permission.id}
                  className="flex items-center gap-3 rounded-md border border-border bg-secondary/50 p-3 cursor-pointer transition-colors hover:bg-secondary"
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(permission.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPermissions([...selectedPermissions, permission.id])
                      } else {
                        setSelectedPermissions(selectedPermissions.filter((id: any) => id !== permission.id))
                      }
                    }}
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-border bg-background cursor-pointer accent-primary disabled:opacity-50"
                  />
                  <div>
                    <p className="font-medium text-foreground">{permission.name}</p>
                    <p className="text-xs text-muted-foreground">{permission.code}</p>
                  </div>
                </label>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">No permissions available</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              onOpenChange(false)
              setRoleName("")
              setSelectedPermissions([])
            }}
            disabled={isLoading}
            className="flex-1 cursor-pointer rounded-lg border border-border bg-card px-4 py-2 font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-primary cursor-pointer px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  )
}
