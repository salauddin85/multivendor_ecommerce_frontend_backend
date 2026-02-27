import { ArrowLeft, Mail, User, Shield, Lock, CheckCircle } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "User Profile | Authorization System",
  description: "View your profile, roles, and permissions",
}

export default async function AdminDetailsPage({data}: any) {
  const { user, roles, permissions } = data

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="w-full rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-xs uppercase font-semibold text-primary mt-1">{user.user_type}</p>
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground">EMAIL</p>
                <p className="text-sm font-medium text-foreground break-all">{user.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {user.is_active && (
                <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700">Active</span>
                </div>
              )}
              {user.is_staff && (
                <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">Staff</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">Roles</h3>
              <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                {roles.length}
              </span>
            </div>

            <div className="space-y-2">
              {roles && roles.length > 0 ? (
                roles.map((role: any, idx: any) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-md bg-secondary p-3 text-sm font-medium text-foreground"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    {role}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No roles assigned</p>
              )}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">Permissions</h3>
              <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                {permissions.length}
              </span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {permissions && permissions.length > 0 ? (
                permissions.map((permission: any, idx: any) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-md bg-secondary p-3 text-sm font-medium text-foreground"
                  >
                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                    {permission}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No permissions assigned</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
