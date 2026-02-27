import React, { Suspense } from "react";
import PageLoader from "@/components/common/PageLoader";
import BrandAddForm from "@/components/dashboard/admin/Products/Brands/BrandAddForm";

export default function page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <div>
        <BrandAddForm />
      </div>
    </Suspense>
  );
}

