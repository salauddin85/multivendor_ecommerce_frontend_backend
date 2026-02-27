"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  label?: string
}

export function PasswordInput({ value, onChange, placeholder = "Enter password", error, label }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="form-input pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}
