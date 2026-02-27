"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import {
  Search,
  Filter,
  Calendar,
  User,
  Mail,
  Phone,
  MessageSquare,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  ChevronDown,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { toast } from "react-toastify";
import { format } from "date-fns";
import Pagination from "@/components/pagination/Pagination";

// Types
interface Contact {
  id: number;
  email: string;
  subject: string;
  message: string;
  phone_number: string;
  status: "pending" | "contacted" | "rejected";
  created_at: string;
}

interface PaginationData {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | boolean | null;
  previous: string | boolean | null;
  page_size: number;
}

interface ContactsResponse {
  code: number;
  message: string;
  status: string;
  data: Contact[];
  pagination: PaginationData;
}

interface AllContactListProps {
  all_contacts_list: ContactsResponse;
}

// Status Badge Component
const StatusBadge = ({ status }: { status: Contact["status"] }) => {
  const statusConfig = {
    pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
    contacted: { color: "bg-green-100 text-green-800", label: "Contacted" },
    rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
  };
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <Badge className={`${config.color} border-0`} variant="outline">
      {config.label}
    </Badge>
  );
};

// Filter Bar Component
const FilterBar = ({
  filters,
  onFilterChange,
  onClearFilters,
}: {
  filters: any;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilters = filters.status || filters.start_date || filters.end_date;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by email, subject, message, or phone..."
              value={filters.search || ""}
              onChange={(e) => onFilterChange("search", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge className="ml-1 bg-orange-500 text-white">!</Badge>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </Button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm text-gray-600 mb-1 block">Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  onFilterChange("status", value === "all" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-gray-600 mb-1 block">Start Date</Label>
              <Input
                type="date"
                value={filters.start_date || ""}
                onChange={(e) => onFilterChange("start_date", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm text-gray-600 mb-1 block">End Date</Label>
              <Input
                type="date"
                value={filters.end_date || ""}
                onChange={(e) => onFilterChange("end_date", e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="ghost"
                onClick={onClearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={!hasActiveFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Update Status Dialog
const UpdateStatusDialog = ({
  isOpen, onClose, contact, onUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  onUpdate: (id: number, newStatus: string) => Promise<void>;
}) => {
  const [selectedStatus, setSelectedStatus] = useState(contact?.status || "pending");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (contact) setSelectedStatus(contact.status);
  }, [contact]);

  const handleUpdate = async () => {
    if (!contact) return;
    setIsUpdating(true);
    await onUpdate(contact.id, selectedStatus);
    setIsUpdating(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Contact Status</DialogTitle>
          <DialogDescription>Change the status for contact from {contact?.email}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="status">Status</Label>
          <Select
            value={selectedStatus}
            onValueChange={(value) => setSelectedStatus(value as Contact["status"])}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>Cancel</Button>
          <Button
            onClick={handleUpdate}
            disabled={isUpdating || selectedStatus === contact?.status}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isUpdating ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Delete Dialog
const DeleteDialog = ({
  isOpen, onClose, contact, onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  onDelete: (id: number) => Promise<void>;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!contact) return;
    setIsDeleting(true);
    await onDelete(contact.id);
    setIsDeleting(false);
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to delete the contact from{" "}
            <span className="font-semibold text-red-600">{contact?.email}</span>
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AllContactList({ all_contacts_list }: AllContactListProps) {
  const searchParams = useSearchParams();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const [contacts, setContacts] = useState<Contact[]>(all_contacts_list.data);
  const [pagination, setPagination] = useState<PaginationData>(all_contacts_list.pagination);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    start_date: "",
    end_date: "",
  });
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // ✅ KEY FIX: Watch searchParams for page changes made by Pagination component
  useEffect(() => {
    const page = searchParams.get("page") || "1";
    const pageNumber = parseInt(page, 10);

    // Skip if already on this page (initial load)
    if (pageNumber === all_contacts_list.pagination.current_page && 
        contacts === all_contacts_list.data) {
      return;
    }

    const fetchPage = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(
          `/api/contacts/v1/contacts/?page_size=10&page=${pageNumber}`,
          { withCredentials: true }
        );

        if (response.data) {
          setContacts(response.data.data);
          setPagination(response.data.pagination);

          // Scroll table into view
          tableContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } catch (error) {
        console.error("Failed to fetch page:", error);
        toast.error("Failed to load page", { position: "top-right", autoClose: 3000 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // ← fires every time URL ?page= changes

  // Filter contacts client-side
  const filteredContacts = React.useMemo(() => {
    return contacts.filter((contact) => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        const match =
          contact.email.toLowerCase().includes(s) ||
          contact.subject.toLowerCase().includes(s) ||
          (contact.message && contact.message.toLowerCase().includes(s)) ||
          contact.phone_number.includes(filters.search);
        if (!match) return false;
      }
      if (filters.status && contact.status !== filters.status) return false;
      if (filters.start_date || filters.end_date) {
        const d = new Date(contact.created_at);
        if (filters.start_date && d < new Date(filters.start_date)) return false;
        if (filters.end_date) {
          const end = new Date(filters.end_date);
          end.setHours(23, 59, 59, 999);
          if (d > end) return false;
        }
      }
      return true;
    });
  }, [contacts, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ search: "", status: "", start_date: "", end_date: "" });
  };

  // Status update
  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      const response = await axiosInstance.patch(
        `/api/contacts/v1/contacts/${id}/`,
        { status: newStatus },
        { withCredentials: true }
      );
      if (response.status === 200 || response.data?.code === 200) {
        setContacts((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus as Contact["status"] } : c))
        );
        toast.success("Contact status updated successfully!", { position: "top-right", autoClose: 3000 });
      }
    } catch (error: any) {
      const data = error.response?.data;
      toast.error(data?.message || "Failed to update contact", { position: "top-right", autoClose: 5000 });
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    try {
      await axiosInstance.delete(`/api/contacts/v1/contacts/${id}/`, { withCredentials: true });
      setContacts((prev) => prev.filter((c) => c.id !== id));
      toast.success("Contact deleted successfully!", { position: "top-right", autoClose: 3000 });
    } catch (error: any) {
      const data = error.response?.data;
      toast.error(data?.message || "Failed to delete contact", { position: "top-right", autoClose: 5000 });
    }
  };

  const formatDate = (dateString: string) => format(new Date(dateString), "MMM dd, yyyy hh:mm a");
  const truncateMessage = (text: string, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text || "";
    return text.substring(0, maxLength) + "...";
  };

  const stats = {
    total: pagination.count,
    pending: contacts.filter((c) => c.status === "pending").length,
    contacted: contacts.filter((c) => c.status === "contacted").length,
    rejected: contacts.filter((c) => c.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <UpdateStatusDialog
        isOpen={isStatusDialogOpen}
        onClose={() => { setIsStatusDialogOpen(false); setSelectedContact(null); }}
        contact={selectedContact}
        onUpdate={handleStatusUpdate}
      />
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setSelectedContact(null); }}
        contact={selectedContact}
        onDelete={handleDelete}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contact Management</h1>
          <p className="text-gray-600 mt-2">Manage and organize all contact inquiries</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Contacts", value: stats.total, Icon: Mail, bg: "bg-orange-100", color: "text-orange-500" },
            { label: "Pending", value: stats.pending, Icon: RefreshCw, bg: "bg-yellow-100", color: "text-yellow-500" },
            { label: "Contacted", value: stats.contacted, Icon: CheckCircle, bg: "bg-green-100", color: "text-green-500" },
            { label: "Rejected", value: stats.rejected, Icon: XCircle, bg: "bg-red-100", color: "text-red-500" },
          ].map(({ label, value, Icon, bg, color }) => (
            <Card key={label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                  </div>
                  <div className={`p-3 ${bg} rounded-full`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <FilterBar filters={filters} onFilterChange={handleFilterChange} onClearFilters={handleClearFilters} />

        {/* Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredContacts.length}</span> of{" "}
            <span className="font-semibold">{pagination.count}</span> contacts
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent" />
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        )}

        {/* Table */}
        {!isLoading && filteredContacts.length > 0 ? (
          <div
            ref={tableContainerRef}
            className="bg-white rounded-lg shadow-sm border overflow-x-auto mb-6"
          >
            <Table className="min-w-[1200px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead className="w-[200px]">Email</TableHead>
                  <TableHead className="w-[150px]">Subject</TableHead>
                  <TableHead className="w-[300px]">Message</TableHead>
                  <TableHead className="w-[120px]">Phone</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[150px]">Created At</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium align-middle">#{contact.id}</TableCell>
                    <TableCell className="align-middle">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-sm break-words">{contact.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="align-middle">
                      <span className="text-sm font-medium break-words">{contact.subject}</span>
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="flex items-start">
                        <MessageSquare className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600 break-words">
                          {truncateMessage(contact.message, 150)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-sm">{contact.phone_number}</span>
                      </div>
                    </TableCell>
                    <TableCell className="align-middle">
                      <StatusBadge status={contact.status} />
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <span className="text-sm whitespace-nowrap">{formatDate(contact.created_at)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right align-middle">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => { setSelectedContact(contact); setIsStatusDialogOpen(true); }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Update Status
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => { setSelectedContact(contact); setIsDeleteDialogOpen(true); }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : !isLoading && (
          <div className="text-center py-16 bg-white rounded-lg border mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <Mail className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No contacts found</h3>
            <p className="text-gray-600">
              {filters.search || filters.status || filters.start_date || filters.end_date
                ? "Try adjusting your filters to find what you're looking for."
                : "No contacts have been submitted yet."}
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && !isLoading && (
          <div className="mt-6">
            <Pagination paginationData={pagination} />
          </div>
        )}
      </div>
    </div>
  );
}