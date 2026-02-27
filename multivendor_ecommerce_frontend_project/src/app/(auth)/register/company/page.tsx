"use client"
import { useRouter } from "next/navigation"
import { useRegisterStore } from "@/lib/store"
import { CompanyForm } from "@/components/auth/company-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function CompanyRegisterPage() {
  const router = useRouter()
  const store = useRegisterStore()

  if (!store.email) {
    router.push("/register")
    return null
  }

  return (
    <div className="auth-container">
      <div className="auth-card p-8 max-w-2xl w-full">
        <button
          onClick={() => {
            store.reset();
            router.push("/");
          }}
          className="flex items-center gap-2 text-primary cursor-pointer hover:opacity-80 mb-6 transition"
        >
          <ArrowLeft size={18} />
          Back to Homepage
        </button>

        <h1 className="auth-header">Register as Company</h1>
        <p className="auth-subtext">Complete your company information</p>

        <div className="flex gap-2 mb-6 border-b border-border overflow-x-auto">
          <Link
            href="/register/customer"
            className="tab-button whitespace-nowrap"
          >
            Customer
          </Link>
          <Link
            href="/register/vendor"
            className="tab-button whitespace-nowrap"
          >
            Vendor
          </Link>
          <Link
            href="/register/company"
            className="tab-button active whitespace-nowrap"
          >
            Company
          </Link>
        </div>

        <CompanyForm />
      </div>
    </div>
  );
}
