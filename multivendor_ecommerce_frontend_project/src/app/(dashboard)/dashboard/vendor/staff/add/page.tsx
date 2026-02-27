'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStaffOnboardingStore } from '@/store/staffOnboardingStore';
import { StepIndicator } from '@/components/dashboard/vendor/staff/StepIndicator';
import { EmailStep } from '@/components/dashboard/vendor/staff/EmailStep';
import { OtpVerificationStep } from '@/components/dashboard/vendor/staff/OtpVerificationStep';
import { RegistrationStep } from '@/components/dashboard/vendor/staff/RegistrationStep';
import { CheckCircle } from 'lucide-react';

const steps = [
  { number: 1, title: 'Email' },
  { number: 2, title: 'Verification' },
  { number: 3, title: 'Registration' },
];

export default function AddStaffPage() {
  const router = useRouter();
  const { currentStep, setCurrentStep, resetStore } = useStaffOnboardingStore();
  const [showSuccess, setShowSuccess] = React.useState(false);

  useEffect(() => {
    // Dynamically import to avoid SSR issues
    const { useSearchParams } = require('next/navigation');
    const searchParams = useSearchParams();
    const step = searchParams.get('step');
    if (step) {
      const stepNumber = parseInt(step, 10);
      if (stepNumber >= 1 && stepNumber <= 3) {
        setCurrentStep(stepNumber);
      }
    }
  }, [setCurrentStep]);

  const handleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      resetStore();
      router.push('/dashboard/vendor/staff');
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Staff Member Added Successfully!
            </h3>
            <p className="text-gray-600">
              The staff member has been onboarded and will receive their login credentials.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-2xl font-bold text-gray-900">Add New Staff Member</h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete the 3-step process to onboard a new staff member
            </p>
          </div>
          <div className="px-6">
            <StepIndicator currentStep={currentStep} steps={steps} />
          </div>
          <div className="px-6 pb-5">
            {currentStep === 1 && <EmailStep />}
            {currentStep === 2 && <OtpVerificationStep />}
            {currentStep === 3 && <RegistrationStep onSuccess={handleSuccess} />}
          </div>
        </div>
      </div>
    </div>
  );
}
