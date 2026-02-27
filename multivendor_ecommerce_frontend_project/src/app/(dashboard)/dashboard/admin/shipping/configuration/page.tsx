import ShippingConfigurations from "@/components/dashboard/admin/Shipping/Configuration/ShippingConfigurations";
import axiosInstance from "@/lib/axios";
import { cookies } from "next/headers";

interface ShippingConfiguration {
  id: number;
  created_at: string;
  updated_at: string;
  location_name: string;
  shipping_fee: string;
}

interface ApiResponse {
  code: number;
  status: string;
  message: string;
  data: ShippingConfiguration[];
}

export default async function Page() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("access_token")?.value;

  let shippingConfigurations: ShippingConfiguration[] = [];

  try {
    const response = await axiosInstance.get<ApiResponse>(
      `/api/orders/v1/shipping_configuration/`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (response.data.code === 200) {
      shippingConfigurations = response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch shipping configurations:", error);
  }

  return (
    <div>
      <ShippingConfigurations initialData={shippingConfigurations} />
    </div>
  );
}