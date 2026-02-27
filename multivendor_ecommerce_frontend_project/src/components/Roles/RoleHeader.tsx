'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit2 } from 'lucide-react';

export default function RoleHeader({ roleName, onEditClick }: any) {
  const router = useRouter();

  return (
    <div className="border-b border-primary">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="rounded-md p-2 bg-primary text-white transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground">{roleName}</h1>
             
            </div>
          </div>
          <button
            onClick={onEditClick}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            <Edit2 className="h-4 w-4" />
            <span className="hidden sm:inline">Edit Role</span>
          </button>
        </div>
      </div>
    </div>
  );
}
