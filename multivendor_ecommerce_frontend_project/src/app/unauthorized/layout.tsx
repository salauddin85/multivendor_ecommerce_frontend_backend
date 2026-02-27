import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});
export const metadata: Metadata = {
  title: "Access Denied",
  description: "",
};
import { ToastContainer } from "react-toastify";
import React from "react";

export default function UnAuthorizedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.className} min-h-dvh flex flex-col`}>
        <main className="flex-1">{children}</main>
        <Toaster />
        <ToastContainer />
      </body>
    </html>
  );
}
