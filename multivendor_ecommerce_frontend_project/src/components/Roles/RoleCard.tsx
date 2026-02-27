'use client';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';


export default function RoleCard({ role, onDelete }: any) {
  return (
    <Link href={`/dashboard/admin/roles/${role.id}`}>
      <div className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:border-primary hover:shadow-lg cursor-pointer">
        {/* Background accent */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        {/* Content */}
        <div className="relative z-10">
          <div className="mb-4 flex items-start justify-between">
            <h3 className="text-xl font-bold text-foreground">{role.name}</h3>
          </div>

          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {role.permission_count} permissions
            </p>
            <p className="text-sm text-muted-foreground">
              {role.user_count} users
            </p>
          </div>
          
          <div className="flex items-center justify-between pt-4">
            <span className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90">View</span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
              className="rounded-md p-2 text-white bg-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label="Delete role"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
