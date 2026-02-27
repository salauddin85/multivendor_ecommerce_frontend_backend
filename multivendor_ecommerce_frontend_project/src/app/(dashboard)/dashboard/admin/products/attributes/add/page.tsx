import React, { Suspense } from "react";
import PageLoader from "@/components/common/PageLoader";
import ProductAttributeAddForm from "@/components/dashboard/admin/Products/ProductAttributeAddForm";

export default function page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <div>
        <ProductAttributeAddForm />
      </div>
    </Suspense>
  );
}
