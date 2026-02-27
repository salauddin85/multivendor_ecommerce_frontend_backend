import { ToastContainer } from "react-toastify";
import VendorDashboardLayoutClient from "@/components/dashboard/vendor/VendorDashboardLayoutClient";
export const experimental_styleIsolation = true;
export const metadata = {
  title: "EezzyMart - Vendor Dashboard",
  description: "EezzyMart - Dashboard",
};

export default async function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ToastContainer />
      <VendorDashboardLayoutClient permissions={[]}>
        {children}
      </VendorDashboardLayoutClient>
    </>
  );
}
