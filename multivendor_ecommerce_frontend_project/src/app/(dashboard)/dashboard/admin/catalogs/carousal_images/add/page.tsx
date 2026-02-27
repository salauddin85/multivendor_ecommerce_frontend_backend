import React from "react";
import BlogFormSkeleton from "@/components/dashboard/admin/Blogs/BlogFormSkeleton";
import CarousalImagesForm from "@/components/dashboard/admin/Products/CarousalImages/CarousalImagesForm";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={<BlogFormSkeleton />}>
      <CarousalImagesForm/>
    </Suspense>
  );
}
