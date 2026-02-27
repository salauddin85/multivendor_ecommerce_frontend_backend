"use client"

import { ResetPasswordForm } from "@/components/dashboard/reset_password/ResetPasswordForm"
import { Lock } from "lucide-react"

export default function ChangePasswordPage() {
  return (
    <main className="min-h-screen  flex items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
          <p className="text-gray-600">Update your password to keep your account secure</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <ResetPasswordForm />
        </div>
        <p className="text-center text-sm text-gray-600">
          Go back to{" "}
          <a href="/dashboard/" className="text-blue-600 font-medium hover:underline">
            Dashboard
          </a>
        </p>
      </div>
    </main>
  )
}
