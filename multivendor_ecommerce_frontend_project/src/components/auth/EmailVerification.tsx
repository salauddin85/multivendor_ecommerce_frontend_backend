"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { sendOtp, verifyEmail } from "@/services/auth.service";
import { AxiosError } from "axios";

interface EmailVerificationProps {
  onVerified: (email: string) => void;
  title?: string;
  description?: string;
  defaultEmail?: string;
}

export default function EmailVerification({
  onVerified,
  title = "Verify your email",
  description = "We'll send a 6-digit code to your email.",
  defaultEmail = "",
}: EmailVerificationProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState({ send: false, verify: false });

  async function handleSend() {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    try {
      setLoading((s) => ({ ...s, send: true }));
      await sendOtp({ email });
      setIsOtpSent(true);
      toast.success("OTP sent to your email");
    } catch (e: unknown) {
      const err = e as AxiosError<any>;
      const message = err?.response?.data?.errors?.email[0];
      if (
        message == "Email already verified. Please proceed to registration."
      ) {
        toast.error("Email already verified. Please proceed to registration.");
        onVerified(email);
      } else if (message == "Email already exists.") {
        toast.error("Email already exist. please login");
      }
    } finally {
      setLoading((s) => ({ ...s, send: false }));
    }
  }

  async function handleVerify() {
    if (!email || !otp || otp.length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }
    try {
      setLoading((s) => ({ ...s, verify: true }));
      await verifyEmail({ email, otp: Number(otp) });
      toast.success("Email verified");
      onVerified(email);
    } catch (e: unknown) {
      // const err = e as { response?: { data?: { message?: string } } };
      // const message = err?.response?.data?.message || ;
      toast.error("Invalid or expired OTP");
    } finally {
      setLoading((s) => ({ ...s, verify: false }));
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-[1fr_auto] items-center gap-2">
        <Input
          id="otp"
          placeholder="OTP"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          disabled={!isOtpSent}
          maxLength={6}
        />
        <Button type="button" onClick={handleSend} disabled={loading.send}>
          {!isOtpSent
            ? loading.send
              ? "Sending..."
              : "Send"
            : loading.send
            ? "Resending..."
            : "Resend"}
        </Button>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleVerify}
          disabled={loading.verify || !isOtpSent}
        >
          {loading.verify ? "Verifying..." : "Verify & Continue"}
        </Button>
      </div>
    </div>
  );
}
