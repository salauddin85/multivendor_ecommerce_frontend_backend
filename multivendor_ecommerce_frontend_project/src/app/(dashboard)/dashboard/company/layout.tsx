import { ToastContainer } from "react-toastify";

import CompanyDashboardLayoutClient from "@/components/dashboard/company/CompanyDashboardLayoutClient";
export const experimental_styleIsolation = true;
export const metadata = {
  title: "EezzyMart - Company Dashboard",
  description:
    "EezzyMart - Dashboard",
};

export default async function CompanyDashboardLayout({ children }: { children: React.ReactNode }) {
  // const authUser = await get_me();
  // if (!authUser?.error) {
  //   if (authUser?.data?.user.user_type !== "admin") {
  //     redirect("/");
  //   }
  // } else {
  //   redirect("/");
  // }

  return (
    <>
      <ToastContainer />
      <CompanyDashboardLayoutClient permissions={[]}>
        {children}
      </CompanyDashboardLayoutClient>
    </>
  );
}
