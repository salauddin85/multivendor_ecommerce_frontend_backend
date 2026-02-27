// app/deals/page.tsx
export const dynamic = "force-dynamic";
import DealsPage from "@/components/Deals/DealsPage";
import axiosInstance from "@/lib/axios";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deals | Best Offers & Discounts",
  description:
    "Explore the latest flash sales, exclusive coupon codes, and category discounts. Save more on your favorite products with our best deals.",
};

type PageProps = {
  searchParams?: {
    page?: string;
  };
};

export default async function Page() {
  
  let coupons = null;

  try {
    const response = await axiosInstance.get("/api/coupons/v1/coupons/active/");
    coupons = response.data;
    // console.log(coupons);
  } catch (error) {
    console.error("Failed to fetch coupons list:", error);
  }

  return (
    <div>
      <DealsPage coupons={coupons} />
    </div>
  );
}