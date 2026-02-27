import React from "react";
import BlogFormSkeleton from "@/components/dashboard/admin/Blogs/BlogFormSkeleton";
import { Suspense } from "react";
import CategoryGridImageForm from "@/components/dashboard/admin/Products/CategoryGridImages/CategoryGridImageForm";

export default function page() {
  return (
    <Suspense fallback={<BlogFormSkeleton />}>
      <CategoryGridImageForm/>
    </Suspense>
  );
}
