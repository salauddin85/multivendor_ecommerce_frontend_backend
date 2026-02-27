// components/wishlist/CustomerWishlistTable.tsx
"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Pagination from "@/components/pagination/Pagination";
import {
  HeartIcon,
  UserIcon,
  CalendarIcon,
  PackageIcon,
  EyeIcon,
  ShoppingBagIcon,
  StarIcon,
  MailIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronRightIcon,
  BoxIcon,
  TagIcon,
} from "lucide-react";

type WishlistItem = {
  id: number;
  product: {
    id: number;
    title: string;
    slug: string;
  };
  variant: {
    id: number;
    variant_name: string;
    sku: string;
  } | null;
  created_at: string;
};

type Wishlist = {
  id: number;
  user: string;
  name: string;
  is_default: boolean;
  created_at: string;
  items: WishlistItem[];
};

type PaginationData = {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | boolean | null;
  previous: string | boolean | null;
  page_size: number;
};

type CustomerWishlistTableProps = {
  all_wishlists: {
    code: number;
    message: string;
    status: string;
    data: Wishlist[];
    pagination: PaginationData;
  };
};

export default function CustomerWishlistTable({ all_wishlists }: CustomerWishlistTableProps) {
  const { data: wishlists, pagination } = all_wishlists;
  const [selectedWishlist, setSelectedWishlist] = useState<Wishlist | null>(null);

  const totalWishlists = wishlists.length;
  const totalItems = wishlists.reduce((sum, wishlist) => sum + wishlist.items.length, 0);
  const defaultWishlists = wishlists.filter((w) => w.is_default).length;
  const uniqueUsers = new Set(wishlists.map((w) => w.user)).size;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

 
  const WishlistItemsViewer = ({ items }: { items: WishlistItem[] }) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-8">
          <PackageIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No items in this wishlist</p>
        </div>
      );
    }

    return (
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-orange-200 hover:bg-orange-50 transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBagIcon className="h-4 w-4 text-orange-500" />
                  <h4 className="font-semibold text-gray-800">
                    {item.product.title}
                  </h4>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {item.variant ? (
                    <>
                      <div className="flex items-center gap-1 text-gray-600">
                        <TagIcon className="h-3.5 w-3.5" />
                        <span>Variant: {item.variant.variant_name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <BoxIcon className="h-3.5 w-3.5" />
                        <span>SKU: {item.variant.sku}</span>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-2 text-gray-500 italic">
                      No variant selected
                    </div>
                  )}
                </div>
              </div>
              
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                <CalendarIcon className="h-3 w-3 mr-1" />
                {new Date(item.created_at).toLocaleDateString()}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Wishlists
            </CardTitle>
            <HeartIcon className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalWishlists}</div>
            <p className="text-xs text-gray-500 mt-1">Active wishlists</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Items
            </CardTitle>
            <PackageIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalItems}</div>
            <p className="text-xs text-gray-500 mt-1">Products saved</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Default Lists
            </CardTitle>
            <StarIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{defaultWishlists}</div>
            <p className="text-xs text-gray-500 mt-1">Primary wishlists</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Unique Users
            </CardTitle>
            <UserIcon className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{uniqueUsers}</div>
            <p className="text-xs text-gray-500 mt-1">Active customers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-gray-200 bg-gray-50/50">
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <HeartIcon className="h-5 w-5 text-orange-500" />
            Customer Wishlists Management
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700 w-12">#</TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      <MailIcon className="h-4 w-4" />
                      User
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      <HeartIcon className="h-4 w-4" />
                      Wishlist Name
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      <StarIcon className="h-4 w-4" />
                      Type
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      <PackageIcon className="h-4 w-4" />
                      Items
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      Created At
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wishlists.map((wishlist, index) => (
                  <TableRow
                    key={wishlist.id}
                    className="hover:bg-orange-50/50 transition-colors duration-200 group"
                  >
                    <TableCell className="font-medium text-gray-500">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">
                            {wishlist.user}
                          </p>
                          <p className="text-xs text-gray-400">
                            ID: {wishlist.user.split('@')[0]}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-800">
                        {wishlist.name}
                      </span>
                    </TableCell>
                    <TableCell>
                      {wishlist.is_default ? (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-600">
                          <XCircleIcon className="h-3 w-3 mr-1" />
                          Custom
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className={`font-semibold ${
                          wishlist.items.length > 0 
                            ? "text-orange-600" 
                            : "text-gray-400"
                        }`}>
                          {wishlist.items.length}
                        </span>
                        <span className="text-gray-500 text-sm">items</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-gray-600">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        <span className="text-sm">
                          {formatDate(wishlist.created_at)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            onClick={() => setSelectedWishlist(wishlist)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors duration-200 group"
                          >
                            <EyeIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">View Items</span>
                            <ChevronRightIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl">
                              <HeartIcon className="h-5 w-5 text-orange-500" />
                              {wishlist.name}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="mt-4">
                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">User:</span>
                                  <p className="font-medium text-gray-800">{wishlist.user}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Created:</span>
                                  <p className="font-medium text-gray-800">
                                    {formatDate(wishlist.created_at)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <WishlistItemsViewer items={wishlist.items} />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

     
        <div className="flex justify-center mt-8">
          <Pagination paginationData={pagination} />
        </div>
    </div>
  );
}