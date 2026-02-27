import { getAllAddress } from "@/actions/address.action";
import AddressBookClient from "@/components/dashboard/customer/address/AddressBookClient";

export default async function AddressPage() {
  const response = await getAllAddress();

  if (!response.success) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        Failed to load addresses. Please try again later.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <AddressBookClient addresses={response.data} />
    </div>
  );
}
