'use client';
import React, { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStaffOnboardingStore } from '@/store/staffOnboardingStore';
import { staffOnboardingApi } from '@/app/api/staffOnboardingApi';

export const EmailStep: React.FC = () => {
  const router = useRouter();
  const { email, setEmail, setIsLoading, setError, nextStep, isLoading, error } =
    useStaffOnboardingStore();
  const [localEmail, setLocalEmail] = useState(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!localEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await staffOnboardingApi.sendOtp({ email: localEmail });
      // console.log('OTP sent successfully:', result);
      setEmail(localEmail);
      nextStep();
      // Navigate to OTP step
      router.push('/dashboard/vendor/staff/add?step=2');
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 ">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Enter Staff Email
            </h3>
            <p className="text-sm text-gray-600">
              We'll send a verification code to this email address
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={localEmail}
                onChange={(e) => setLocalEmail(e.target.value)}
                placeholder="staff@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                disabled={isLoading}
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                'Send Verification Code'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};