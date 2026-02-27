'use client';

import { useState, useMemo } from 'react';
import { X, Search, User2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { add_members_to_role } from '@/actions/authorization';

export default function AddMembersModal({
  open,
  onOpenChange,
  allMembers,
  assignedMembers,
  onAdd,
  roleId,
}: any) {
  const [selectedMembers, setSelectedMembers] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false)
  const availableMembers = useMemo(
    () =>
      allMembers.filter((m: any) => !assignedMembers.some((am: any) => am.id === m.id)),
    [allMembers, assignedMembers]
  );

  const filteredMembers = useMemo(
    () =>
      availableMembers.filter(
        (m: any) =>
          m.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.email.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [availableMembers, searchQuery]
  );

    const handleDone = async () => {
    if (selectedMembers.length === 0) {
      toast.warning("Please select at least one member")
      return
    }

    if (roleId) {
      setIsLoading(true)
      const result = await add_members_to_role(roleId, selectedMembers)
      setIsLoading(false)

      if (result.success) {
        toast.success(result.message || "Members added successfully")
        const selected = availableMembers.filter((m: any) => selectedMembers.includes(m.id))
        onAdd(selected)
        setSelectedMembers([])
        setSearchQuery("")
        onOpenChange(false)
      } else {
        console.log(result);
        toast.error(result.message || "Failed to add members")
      }
    } else {
      const selected = availableMembers.filter((m: any) => selectedMembers.includes(m.id))
      onAdd(selected)
      setSelectedMembers([])
      setSearchQuery("")
      onOpenChange(false)
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
        <button
          onClick={() => {
            onOpenChange(false);
            setSelectedMembers([]);
            setSearchQuery('');
          }}
          className="absolute right-4 top-4 rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-lg font-bold text-foreground">Add Members</h2>

        {/* Search Box */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Available Members Section */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-foreground mb-3">
            Available Members
          </label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member: any) => (
                <label
                  key={member.id}
                  className="flex items-center gap-3 rounded-md border border-border bg-secondary/50 p-3 cursor-pointer transition-colors hover:bg-secondary"
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMembers([...selectedMembers, member.id]);
                      } else {
                        setSelectedMembers(
                          selectedMembers.filter((id: any) => id !== member.id)
                        );
                      }
                    }}
                    className="h-4 w-4 rounded border-border bg-background cursor-pointer accent-primary"
                  />
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    <User2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-md text-foreground">{member.first_name} {member.last_name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </label>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">
                {availableMembers.length === 0
                  ? 'All members are already assigned'
                  : 'No members found'}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              onOpenChange(false);
              setSelectedMembers([]);
              setSearchQuery('');
            }}
            className="flex-1 rounded-lg border border-border bg-card px-4 py-2 font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleDone}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isLoading ? "Adding..." : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
