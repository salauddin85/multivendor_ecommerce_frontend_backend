'use client'
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  CopyIcon,
  TagIcon,
  TrendingUpIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  AlertCircleIcon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

interface Coupon {
  id: number;
  code: string;
  type: "percentage" | "fixed";
  value: string;
  min_order_amount: string;
  usage_limit: number;
  usage_count: number;
  valid_from: string;
  valid_to: string;
  status: "active" | "inactive";
  created_at: string;
}

interface ApiResponse {
  code: number;
  status: string;
  message: string;
  data: Coupon[];
}

export default function DealsPage({ coupons }: { coupons: ApiResponse | null }) {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState("active");

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysRemaining = (validTo: string) => {
    const now = new Date();
    const endDate = new Date(validTo);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getDiscountText = (coupon: Coupon) => {
    const value = parseFloat(coupon.value);
    if (coupon.type === "percentage") {
      return `${value}% OFF`;
    }
    return `$${value} OFF`;
  };

  const getDiscountAmount = (coupon: Coupon) => {
    const value = parseFloat(coupon.value);
    if (coupon.type === "percentage") {
      return `${value}%`;
    }
    return `$${value}`;
  };

  const getUsagePercentage = (coupon: Coupon) => {
    return (coupon.usage_count / coupon.usage_limit) * 100;
  };

  // Safely extract coupons array from the API response
  const couponList = coupons?.data || [];
  
  const activeCoupons = couponList.filter(
    (coupon) => coupon.status === "active"
  );
  const expiredCoupons = couponList.filter(
    (coupon) => coupon.status !== "active"
  );

  // Show page even when loading or no coupons - removed early returns
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Hero Section - No margin bottom */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 py-16">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <SparklesIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Limited Time Offers</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Exclusive Deals & Coupons
            </h1>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Discover amazing discounts and save big on your favorite products
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5" />
                <span>Verified Deals</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUpIcon className="h-5 w-5" />
                <span>Daily Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5" />
                <span>10k+ Happy Users</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Show loading state only if coupons is null */}
        {!coupons ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading deals...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Active Deals Count Badge */}
            <div className="mb-8 flex justify-end">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="px-3 py-1">
                  <span className="text-orange-500 font-semibold">
                    {activeCoupons.length}
                  </span>{" "}
                  Active Deals
                </Badge>
              </div>
            </div>

            {/* Featured Deals Alert - Only show if there are active coupons */}
            {activeCoupons.length > 0 && (
              <Alert className="mb-8 border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/50">
                <SparklesIcon className="h-5 w-5 text-orange-500" />
                <AlertTitle className="text-orange-700 dark:text-orange-300">
                  🔥 Hot Deals Available!
                </AlertTitle>
                <AlertDescription className="text-orange-600 dark:text-orange-400">
                  Grab these exclusive offers before they expire. Limited time only!
                </AlertDescription>
              </Alert>
            )}

            {/* Coupons Grid */}
            <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="active">Active Deals ({activeCoupons.length})</TabsTrigger>
                <TabsTrigger value="expired">Expired ({expiredCoupons.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-6">
                {activeCoupons.length === 0 ? (
                  <div className="text-center py-16">
                    <TagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      No Active Deals
                    </h3>
                    <p className="text-gray-500">
                      Check back later for new exciting offers!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeCoupons.map((coupon) => {
                      const daysRemaining = getDaysRemaining(coupon.valid_to);
                      const usagePercentage = getUsagePercentage(coupon);
                      const discountAmount = getDiscountAmount(coupon);
                      const discountText = getDiscountText(coupon);

                      return (
                        <Card
                          key={coupon.id}
                          className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-orange-500/20"
                        >
                          {/* Discount Badge */}
                          <div className="absolute top-4 right-4">
                            <div className="relative">
                              <div className="absolute inset-0 bg-orange-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                              <Badge className="relative bg-orange-500 text-white px-3 py-1 text-sm font-bold">
                                {discountAmount}
                              </Badge>
                            </div>
                          </div>

                          {/* Card Header */}
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <TagIcon className="h-5 w-5 text-orange-500" />
                              </div>
                              <CardTitle className="text-xl font-mono">
                                {coupon.code}
                              </CardTitle>
                            </div>
                            <CardDescription className="flex items-center gap-2 text-base">
                              <span className="font-semibold text-orange-500">
                                {discountText}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm">
                                Min. ৳{coupon.min_order_amount}
                              </span>
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            {/* Progress Bar */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Usage</span>
                                <span className="font-medium">
                                  {coupon.usage_count}/{coupon.usage_limit}
                                </span>
                              </div>
                              <Progress
                                value={usagePercentage}
                                className="h-2 bg-gray-100 dark:bg-gray-800"
                              />
                            </div>

                            {/* Date Info */}
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-gray-500">
                                <CalendarIcon className="h-4 w-4" />
                                <span>
                                  Valid from {formatDate(coupon.valid_from)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <ClockIcon className="h-4 w-4 text-orange-500" />
                                <span className="font-medium text-orange-500">
                                  {daysRemaining === 0
                                    ? "Expires today!"
                                    : `${daysRemaining} days remaining`}
                                </span>
                              </div>
                            </div>
                          </CardContent>

                          <CardFooter className="pt-2">
                            <div className="w-full space-y-2">
                              <Button
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200 group/btn relative overflow-hidden"
                                onClick={() => handleCopyCode(coupon.code)}
                              >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                  {copiedCode === coupon.code ? (
                                    <>
                                      <CheckCircleIcon className="h-4 w-4" />
                                      Copied!
                                    </>
                                  ) : (
                                    <>
                                      <CopyIcon className="h-4 w-4" />
                                      Copy Code
                                    </>
                                  )}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-200" />
                              </Button>
                              <Link href="/products" className="block w-full">
                                <Button
                                  variant="outline"
                                  className="w-full border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950 dark:hover:text-orange-300 transition-colors"
                                >
                                  Shop Now
                                </Button>
                              </Link>
                            </div>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="expired">
                {expiredCoupons.length === 0 ? (
                  <div className="text-center py-16">
                    <CheckCircleIcon className="h-16 w-16 text-green-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      No Expired Coupons
                    </h3>
                    <p className="text-gray-500">
                      All your coupons are active and ready to use!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {expiredCoupons.map((coupon) => (
                      <Card
                        key={coupon.id}
                        className="opacity-60 grayscale hover:opacity-80 transition-opacity"
                      >
                        <CardHeader>
                          <CardTitle className="text-xl font-mono">
                            {coupon.code}
                          </CardTitle>
                          <CardDescription>
                            {getDiscountText(coupon)} • Min. ${coupon.min_order_amount}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Badge variant="outline" className="text-red-500 border-red-200">
                            Expired
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}