"use client";

import React, { useTransition } from "react";
import { 
  MapPin, 
  Phone, 
  Trash2, 
  Home, 
  Briefcase,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { deleteAddress } from "@/actions/address.action";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Address {
  id: number;
  name: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  type: string;
  is_default: boolean;
}

interface AddressBookClientProps {
  addresses: Address[];
}


export default function AddressBookClient({ addresses }: AddressBookClientProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async (id: number) => {
    startTransition(async () => {
      const res = await deleteAddress(id);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  if (!addresses || addresses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 animate-in fade-in zoom-in duration-500">
        <div className="bg-orange-50 p-6 rounded-full mb-6">
          <MapPin className="h-12 w-12 text-orange-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Addresses Found</h3>
        <p className="text-gray-500 text-center mb-8 max-w-sm">
           You can add addresses when checking out any order.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Address Book</h1>
          <p className="text-sm text-gray-500 mt-1">
             You can add addresses when checking out any order.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addresses.map((address) => (
          <div 
            key={address.id} 
            className={`
              relative group bg-white border rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300
              ${address.is_default ? 'border-orange-200 ring-2 ring-orange-100' : 'border-gray-200 hover:border-orange-200'}
            `}
          >
            {/* Header / Badges */}
            <div className="flex justify-between items-start mb-4">
               <div className="flex gap-2">
                 {address.type === 'home' ? (
                   <span className="bg-blue-50 text-blue-700 p-2 rounded-lg">
                     <Home size={18} />
                   </span>
                 ) : (
                    <span className="bg-purple-50 text-purple-700 p-2 rounded-lg">
                     <Briefcase size={18} />
                   </span>
                 )}
                 {address.is_default && (
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200 h-9 px-3">
                        Default
                    </Badge>
                 )}
               </div>
               
               {/* Actions */}
               <div>
                   {!address.is_default && (
                     <AlertDialog>
                       <AlertDialogTrigger asChild>
                         <button
                           disabled={isPending}
                           className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                           title="Delete Address"
                         >
                           <Trash2 size={18} />
                         </button>
                       </AlertDialogTrigger>
                       <AlertDialogContent>
                         <AlertDialogHeader>
                           <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                           <AlertDialogDescription>
                             This action cannot be undone. This will permanently delete your
                             address from our servers.
                           </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                           <AlertDialogCancel>Cancel</AlertDialogCancel>
                           <AlertDialogAction onClick={() => handleDelete(address.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                         </AlertDialogFooter>
                       </AlertDialogContent>
                     </AlertDialog>
                   )}
               </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
                <h3 className="font-bold text-gray-900 text-lg">{address.name}</h3>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Phone size={14} className="text-gray-400" />
                    {address.phone}
                </div>
                <div className="flex items-start gap-2 text-gray-600 text-sm leading-relaxed">
                    <MapPin size={14} className="text-gray-400 mt-1 shrink-0" />
                    <span>
                      {address.address_line}, {address.city}, {address.state} - {address.postal_code}, {address.country}
                    </span>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}