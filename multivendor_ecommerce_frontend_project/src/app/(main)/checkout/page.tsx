"use client";

import { useCheckoutStore } from "@/store/checkout_product_store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { MapPin, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { createAddress, getAllAddress } from "@/actions/address.action";
import {
  getOrderDetails,
  applyCoupon,
  confirmOrder,
  initiatePayment,
  addExistingAddressToOrder,
} from "@/actions/order.action";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import Image from "next/image";

const FormField = ({
  label,
  name,
  placeholder,
  ...props
}: { label: string; name: string; placeholder?: string } & any) => (
  <div className="space-y-1">
    <Label htmlFor={name}>{label}</Label>
    <Field
      as={Input}
      id={name}
      name={name}
      placeholder={placeholder}
      {...props}
    />
    <ErrorMessage
      name={name}
      component="div"
      className="text-red-500 text-xs"
    />
  </div>
);

export default function CheckoutPage() {
  const { orderId, orderDetails, setOrderDetails, clearCheckout } =
    useCheckoutStore();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [customerNote, setCustomerNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [couponCode, setCouponCode] = useState("");
  const router = useRouter();

  const fetchAddresses = async () => {
    const res = await getAllAddress();
    if (res.success) {
      setAddresses(res.data);
    }
  };

  const fetchOrder = async (id: number) => {
    const res = await getOrderDetails(id);
    if (res.success) {
      setOrderDetails(res.data);
      if (res.data.shipping_address) {
        setSelectedAddress(
          typeof res.data.shipping_address === "object"
            ? res.data.shipping_address.id
            : res.data.shipping_address
        );
      }
    } else {
      toast.error("Failed to load order details");
    }
  };

  useEffect(() => {
    if (!orderId) {
      return;
    }

    async function loadData() {
      const [addrRes, orderRes] = await Promise.all([
        getAllAddress(),
        getOrderDetails(orderId as number),
      ]);

      if (addrRes.success) setAddresses(addrRes.data);
      if (orderRes.success) {
        setOrderDetails(orderRes.data);
        if (orderRes.data.shipping_address) {
          setSelectedAddress(
            typeof orderRes.data.shipping_address === "object"
              ? orderRes.data.shipping_address.id
              : orderRes.data.shipping_address
          );
        }
      } else {
        toast.error("Failed to load order details");
        router.push("/");
      }
    }

    loadData();
  }, [orderId, router, setOrderDetails]);

  // Exit confirmation logic
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (orderId) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [orderId]);

  const addressInitialValues = {
    name: "",
    phone: "",
    address_line: "",
    city: "",
    state: "",
    country: "Bangladesh",
    postal_code: "",
    type: "home",
    is_default: false,
  };

  const addressValidationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    phone: Yup.string()
      .required("Phone number is required")
      .matches(/^(?:\+88|88|0)?(1[3-9]\d{8})$/, "Invalid phone number format"),
    address_line: Yup.string().required("Address line is required"),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    country: Yup.string().required("Country is required"),
    postal_code: Yup.string().required("Postal code is required"),
    type: Yup.string().required("Address type is required"),
  });

  const handleAddAddress = async (
    addrValues: any,
    resetForm: any,
    setErrors: any
  ) => {
    if (!orderId) {
      router.push("/");
      return;
    };

    setIsAddingAddress(true);
    try {
      // Format phone number to +88 format
      const formattedValues = { ...addrValues };
      let phone = formattedValues.phone.trim();
      
      if (phone.startsWith("0")) {
        phone = `+88${phone}`;
      } else if (phone.startsWith("88")) {
        if (!phone.startsWith("+")) {
          phone = `+${phone}`;
        }
      } else if (!phone.startsWith("+")) {
        phone = `+880${phone}`;
      }
      formattedValues.phone = phone;

      const res = await createAddress(formattedValues, orderId);
      if (res.success) {
        toast.success("Address added!");
        await fetchAddresses();
        const addressId = typeof res.data === "object" ? res.data.id : res.data;
        setSelectedAddress(addressId);
        await fetchOrder(orderId); // Refetch order details
        resetForm();
      } else {
        if (res.data?.errors) {
          // Map backend errors to Formik format
          const formikErrors: any = {};
          Object.keys(res.data.errors).forEach((key) => {
            formikErrors[key] = Array.isArray(res.data.errors[key])
              ? res.data.errors[key][0]
              : res.data.errors[key];
          });
          setErrors(formikErrors);
          toast.error("Please fix the errors in the form.");
        } else {
          toast.error(res.message);
        }
      }
    } finally {
      setIsAddingAddress(false);
    }
  };

  const handleAddExistingAddress = async (addrId: number) => {
    if (!orderId) {
      router.push("/");
      return;
    }

    setIsAddingAddress(true);
    try {
      const res = await addExistingAddressToOrder(orderId, addrId);
      if (res.success) {
        toast.success("Address updated!");
        setSelectedAddress(addrId);
        setShowAddressModal(false);
        await fetchOrder(orderId);
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsAddingAddress(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!orderId || !couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const res = await applyCoupon(couponCode, orderId);
      if (res.success) {
        toast.success(res.message);
        await fetchOrder(orderId); // Refetch to get updated totals
        setCouponCode("");
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handlePlaceOrder = async () => {
      if (isPlacingOrder) return;
    if (!orderId) return;
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    setIsPlacingOrder(true);
    try {
      if (paymentMethod === "cash_on_delivery") {
        const res = await confirmOrder(orderId, paymentMethod, customerNote);
        if (res.success) {
          console.log(res);
          toast.success("Order placed successfully!");
          clearCheckout();
          router.replace(`/dashboard/customer/orders/${orderId}`);
        } else {
          toast.error(res.message);
        }
      } else if (paymentMethod === "online_payment") {
        const payRes = await initiatePayment(orderId, customerNote);
        if (payRes.success && payRes.data?.payment_url) {
          clearCheckout();
          window.location.replace(payRes.data.payment_url);
        } else {
          toast.error(payRes.message || "Failed to initiate payment");
        }
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleCancelCheckout = () => {
    clearCheckout();
    router.push("/");
  };

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="mb-4">
                  Cancel Checkout
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will clear your checkout progress. You will be
                    redirected to the homepage.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Shopping</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancelCheckout}>
                    Yes, Cancel
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Shipping Address</CardTitle>
                  <CardDescription>
                    Where should we deliver your order?
                  </CardDescription>
                </div>
                <Dialog
                  open={showAddressModal}
                  onOpenChange={setShowAddressModal}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MapPin className="mr-2 h-4 w-4" />
                      Select available addresses
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg w-[95%] sm:w-full">
                    <DialogHeader>
                      <DialogTitle>Select Address</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto p-1 relative">
                      {isAddingAddress && (
                        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                          <Loader2 className="animate-spin h-8 w-8 text-primary" />
                        </div>
                      )}
                      {addresses.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                          No addresses found.
                        </p>
                      ) : (
                        addresses.map((addr) => (
                          <div
                            key={addr.id}
                            className={`p-4 border rounded-lg cursor-pointer transition hover:border-primary ${
                              selectedAddress === addr.id
                                ? "border-primary bg-primary/5"
                                : "border-gray-200"
                            }`}
                            onClick={() => {
                              handleAddExistingAddress(addr.id);
                            }}
                          >
                            <p className="font-bold">{addr.name}</p>
                            <p className="text-sm">{addr.address_line}</p>
                            <p className="text-sm">
                              {addr.city}, {addr.state} - {addr.postal_code}
                            </p>
                            <p className="text-sm">{addr.phone}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedAddress ? (
                  <div className="p-4 border-2 border-primary rounded-lg bg-primary/5 flex justify-between items-center">
                    <div>
                      <p className="font-bold">
                        {addresses.find((a) => a.id === selectedAddress)?.name}
                      </p>
                      <p className="text-sm">
                        {
                          addresses.find((a) => a.id === selectedAddress)
                            ?.address_line
                        }
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAddress(null)}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Formik
                      initialValues={addressInitialValues}
                      validationSchema={addressValidationSchema}
                      onSubmit={async (
                        addrValues,
                        { resetForm, setErrors }
                      ) => {
                        handleAddAddress(addrValues, resetForm, setErrors);
                      }}
                    >
                      {({ handleSubmit: handleAddrSubmit, isSubmitting }) => (
                        <div className="space-y-4 border p-4 rounded-lg">
                          <h3 className="font-semibold text-sm">
                            Add New Address
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              label="Name"
                              name="name"
                              placeholder="John Doe"
                            />
                            <FormField
                              label="Phone"
                              name="phone"
                              placeholder="018XXXXXXXX"
                            />
                          </div>
                          <FormField
                            label="Address Line"
                            name="address_line"
                            placeholder="123, Street Name"
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              label="City"
                              name="city"
                              placeholder="Dhaka"
                            />
                            <FormField
                              label="State"
                              name="state"
                              placeholder="Dhaka"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              label="Country"
                              name="country"
                              placeholder="Bangladesh"
                            />
                            <FormField
                              label="Postal Code"
                              name="postal_code"
                              placeholder="1200"
                            />
                          </div>
                          <div className="flex gap-4 items-center">
                            <div className="flex items-center gap-2">
                              <Field
                                type="radio"
                                name="type"
                                value="home"
                                id="home"
                              />
                              <Label htmlFor="home">Home</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Field
                                type="radio"
                                name="type"
                                value="office"
                                id="office"
                              />
                              <Label htmlFor="office">Office</Label>
                            </div>
                            <div className="flex items-center gap-2 ml-auto">
                              <Field
                                type="checkbox"
                                name="is_default"
                                id="is_default"
                              />
                              <Label htmlFor="is_default">Default</Label>
                            </div>
                          </div>
                          <ErrorMessage
                            name="type"
                            component="div"
                            className="text-red-500 text-xs"
                          />
                          <Button
                            type="button"
                            onClick={() => handleAddrSubmit()}
                            className="w-full"
                            disabled={isAddingAddress || isSubmitting}
                          >
                            {isAddingAddress ? "Adding..." : "ADD ADDRESS"}
                          </Button>
                        </div>
                      )}
                    </Formik>
                  </div>
                )}

                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="customer_note">
                    Customer Note (Optional)
                  </Label>
                  <textarea
                    id="customer_note"
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Please deliver between 4-6 PM"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition ${
                      paymentMethod === "cash_on_delivery"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200"
                    }`}
                    onClick={() => setPaymentMethod("cash_on_delivery")}
                  >
                    <div className="flex items-center justify-between">
                      <Label className="font-bold cursor-pointer">
                        Cash on Delivery
                      </Label>
                      {paymentMethod === "cash_on_delivery" && (
                        <div className="h-4 w-4 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pay when you receive the product
                    </p>
                  </div>

                  <div
                    className={`p-4 border rounded-lg cursor-pointer transition ${
                      paymentMethod === "online_payment"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200"
                    }`}
                    onClick={() => setPaymentMethod("online_payment")}
                  >
                    <div className="flex items-center justify-between">
                      <Label className="font-bold cursor-pointer">
                        Online Payment
                      </Label>
                      {paymentMethod === "online_payment" && (
                        <div className="h-4 w-4 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pay securely via SSLCommerz
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Order #{orderDetails.order_number}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 max-h-96 overflow-y-auto p-1">
                  {orderDetails.items?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-3 p-3 border rounded-lg"
                    >
                      <div className="h-16 w-16 rounded overflow-hidden shrink-0 bg-gray-100">
                        {item.product?.main_image ? (
                          <Image
                            src={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${item.product.main_image}`}
                            alt={item.product_name}
                            className="object-cover h-full w-full"
                            width={64}
                            height={64}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {item.product_name}
                        </h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </p>
                          {item.variant_name && (
                            <p className="text-xs text-primary font-medium">
                              Variant: {item.variant_name}
                            </p>
                          )}
                        </div>
                        <p className="text-sm font-semibold mt-1">
                          ৳{(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {!orderDetails.coupon && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="coupon_code" className="text-xs">
                        Coupon Code
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter coupon"
                          className="h-9 text-xs"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-9 text-xs"
                          onClick={handleApplyCoupon}
                          disabled={isApplyingCoupon}
                        >
                          {isApplyingCoupon ? "..." : "Apply"}
                        </Button>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      ৳{parseFloat(orderDetails.subtotal).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      ৳{parseFloat(orderDetails.shipping_fee).toFixed(2)}
                    </span>
                  </div>
                  {parseFloat(orderDetails.discount) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">
                        -৳{parseFloat(orderDetails.discount).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>
                    ৳{parseFloat(orderDetails.total_amount).toFixed(2)}
                  </span>
                </div>

                <Button
                  type="button"
                  onClick={handlePlaceOrder}
                  className="w-full py-6 text-lg bg-orange-500 hover:bg-orange-600 cursor-pointer hover:shadow-lg hover:shadow-orange-500/50 transition duration-300 active:scale-95"
                  disabled={isPlacingOrder || !selectedAddress}
                >
                  {isPlacingOrder
                    ? "Processing..."
                    : paymentMethod === "cash_on_delivery"
                      ? "Place Order"
                      : `Pay ৳${parseFloat(orderDetails.total_amount).toFixed(2)}`}
                </Button>
                {!selectedAddress && (
                  <p className="text-[10px] text-red-500 text-center mt-1">
                    Please select or add a shipping address
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
