import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Sidebar from "@/components/dashboard/customer/Sidebar";
import Header from "@/components/dashboard/customer/Header";
import { ToastContainer } from "react-toastify";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Customer Dashboard",
  description: "Account management",
};

export default function CustomerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.className} min-h-dvh flex flex-col`}>
        <ToastContainer />
        <Header />
        <div className="container mx-auto px-4">
          <div className="md:flex gap-6">
            <Sidebar />
            <main className="flex-1 py-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
