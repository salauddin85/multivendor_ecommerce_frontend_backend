"use client"

import type React from "react"
import { useRef, useEffect } from "react"

interface EmailOTPInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
}

export function EmailOTPInput({ value, onChange, length = 6 }: EmailOTPInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (inputs.current[0]) {
      inputs.current[0].focus()
    }
  }, [])

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return

    const newValue = value.split("")
    newValue[index] = val
    const result = newValue.join("")

    onChange(result.slice(0, length))

    if (val && index < length - 1) {
      inputs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;

    onChange(pastedData);

    const nextIndex =
      pastedData.length < length ? pastedData.length : length - 1;
    inputs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array(length)
        .fill(0)
        .map((_, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el
            }}
            type="text"
            maxLength={1}
            value={value[i] || ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className="otp-input"
          />
        ))}
    </div>
  )
}
