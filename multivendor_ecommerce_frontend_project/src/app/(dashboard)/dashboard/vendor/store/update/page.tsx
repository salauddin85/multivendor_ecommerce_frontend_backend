import { Suspense } from 'react'
import StoreUpdateForm from '@/components/dashboard/vendor/store/StoreUpdateForm';


export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
    <div className="p-4">
      <StoreUpdateForm />
    </div>
    </Suspense>
  )
}
