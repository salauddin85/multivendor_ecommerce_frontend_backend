import { ToastContainer } from "react-toastify";
import AdminDashboardLayoutClient from "@/components/dashboard/admin/AdminDashboardLayoutClient";
import { get_me } from "@/actions/authorization";
import { redirect } from "next/navigation";
export const experimental_styleIsolation = true;
export const metadata = {
  title: "EezzyMart - Admin Dashboard",
  description: "EezzyMart - Admin Dashboard",
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const authUser = await get_me();
  if (authUser?.error) {
    redirect("/");
  }
  return (
    <>
      <ToastContainer />
      <AdminDashboardLayoutClient permissions={authUser?.data?.permissions || []}>
        {children}
      </AdminDashboardLayoutClient>
    </>
  );
}
