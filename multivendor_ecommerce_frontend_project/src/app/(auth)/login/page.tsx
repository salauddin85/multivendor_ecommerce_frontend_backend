import LoginPage from '@/components/auth/LoginClient';
import React, { Suspense } from 'react'

function page() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}

export default page