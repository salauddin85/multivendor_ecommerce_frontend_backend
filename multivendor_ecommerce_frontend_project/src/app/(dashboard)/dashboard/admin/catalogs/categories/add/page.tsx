import React, { Suspense } from 'react'
import PageLoader from '@/components/common/PageLoader'
import CategoryAddForm from '@/components/dashboard/admin/Products/Categories/CategoryAddForm'

type PageProps = {
  params: {
    category_id?: string
  }
}

export default function Page({ params }: PageProps) {
  return (
    <Suspense fallback={<PageLoader />}>
      <div>
        <CategoryAddForm category_id={params.category_id} />
      </div>
    </Suspense>
  )
}
