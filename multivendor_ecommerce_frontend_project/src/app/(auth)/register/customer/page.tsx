"use client"
import { useRouter } from "next/navigation"
import { useRegisterStore } from "@/lib/store"
import { CustomerForm } from "@/components/auth/customer-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function CustomerRegisterPage() {
  const router = useRouter()
  const store = useRegisterStore()

  if (!store.email) {
    router.push("/register")
    return null
  }

  return (
    <div className="auth-container">
      <div className="auth-card p-8 max-w-md w-full">
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

        <h1 className="auth-header">Register as Customer</h1>
        <p className="auth-subtext">Complete your profile information</p>

        <div className="flex gap-2 mb-6 border-b border-border">
          <Link href="/register/customer" className="tab-button active">
            Customer
          </Link>
          {/* <Link href="/register/vendor" className="tab-button">
            Vendor
          </Link>
          <Link href="/register/company" className="tab-button">
            Company
          </Link> */}
        </div>

        <CustomerForm />
      </div>
    </div>
  );
}
