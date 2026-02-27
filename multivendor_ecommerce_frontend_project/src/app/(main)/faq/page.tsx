"use client";

import * as React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  ShoppingBag,
  CreditCard,
  Lock,
  Truck,
  HelpCircle,
  Smartphone,
  BadgeCheck,
  DollarSign,
  Timer,
  PackageCheck,
  RefreshCw,
  Shield,
  Gift,
} from "lucide-react";

const FAQPage: React.FC = () => {
  return (
    <div className="min-h-screen  py-10 px-4  md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <section className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            EezzyMart FAQs
          </h1>
          <p className="text-gray-500 mt-2 text-base md:text-lg">
            Quick answers to common questions for buyers and sellers.
          </p>
        </section>

        {/* Accordion */}
        <Accordion
          type="single"
          collapsible
          className="w-full rounded-md border border-gray-100 divide-y divide-gray-100"
        >
          <AccordionItem value="what-is-eezzymart">
            <AccordionTrigger className="py-4 px-4 flex items-center gap-3 text-lg font-medium text-gray-900 hover:no-underline">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
              What is EezzyMart?
            </AccordionTrigger>
            <AccordionContent className="px-9 pb-4 text-gray-700 text-base leading-relaxed">
              EezzyMart is an all-in-one e-commerce marketplace offering
              everything from daily essentials to electronics and fashion —
              connecting trusted sellers with buyers across Bangladesh.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="how-to-order">
            <AccordionTrigger className="py-4 px-4 flex items-center gap-3 text-lg font-medium text-gray-900 hover:no-underline">
              <CreditCard className="w-5 h-5 text-orange-600" />
              How do I place an order?
            </AccordionTrigger>
            <AccordionContent className="px-9 pb-4 text-gray-700 text-base leading-relaxed">
              Browse products, add items to your cart, fill in delivery details,
              choose a payment method, and confirm your order — that’s it!
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="need-account">
            <AccordionTrigger className="py-4 px-4 flex items-center gap-3 text-lg font-medium text-gray-900 hover:no-underline">
              <HelpCircle className="w-5 h-5 text-orange-600" />
              Do I need an account to shop?
            </AccordionTrigger>
            <AccordionContent className="px-9 pb-4 text-gray-700 text-base leading-relaxed">
              You can browse freely without an account, but you’ll need one to
              place orders, save favorites, or track deliveries.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="authentic-products">
            <AccordionTrigger className="py-4 px-4 flex items-center gap-3 text-lg font-medium text-gray-900 hover:no-underline">
              <BadgeCheck className="w-5 h-5 text-orange-600" />
              Are all products genuine?
            </AccordionTrigger>
            <AccordionContent className="px-9 pb-4 text-gray-700 text-base leading-relaxed">
              Absolutely! Every product and seller is verified to meet our
              quality standards. Counterfeit items are strictly prohibited.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="shipping">
            <AccordionTrigger className="py-4 px-4 flex items-center gap-3 text-lg font-medium text-gray-900 hover:no-underline">
              <Truck className="w-5 h-5 text-orange-600" />
              How long does delivery take?
            </AccordionTrigger>
            <AccordionContent className="px-9 pb-4 text-gray-700 text-base leading-relaxed">
              Inside Dhaka: 1–2 business days. <br />
              Outside Dhaka: 2–4 business days. <br />
              You’ll receive a tracking number once your order ships.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="payment-methods">
            <AccordionTrigger className="py-4 px-4 flex items-center gap-3 text-lg font-medium text-gray-900 hover:no-underline">
              <DollarSign className="w-5 h-5 text-orange-600" />
              What payment options are available?
            </AccordionTrigger>
            <AccordionContent className="px-9 pb-4 text-gray-700 text-base leading-relaxed">
              We accept bKash, Nagad, Rocket, debit/credit cards, and Cash on
              Delivery (in select areas). All payments are encrypted and secure.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="secure-transactions">
            <AccordionTrigger className="py-4 px-4 flex items-center gap-3 text-lg font-medium text-gray-900 hover:no-underline">
              <Shield className="w-5 h-5 text-orange-600" />
              Is shopping on EezzyMart safe?
            </AccordionTrigger>
            <AccordionContent className="px-9 pb-4 text-gray-700 text-base leading-relaxed">
              100% safe. We use SSL encryption, secure servers, and verified
              payment gateways to protect your data and transactions.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="track-order">
            <AccordionTrigger className="py-4 px-4 flex items-center gap-3 text-lg font-medium text-gray-900 hover:no-underline">
              <PackageCheck className="w-5 h-5 text-orange-600" />
              How do I track my order?
            </AccordionTrigger>
            <AccordionContent className="px-9 pb-4 text-gray-700 text-base leading-relaxed">
              Once shipped, you’ll receive an SMS or email with a tracking link
              for real-time updates on your delivery.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cancel-order">
            <AccordionTrigger className="py-4 px-4 flex items-center gap-3 text-lg font-medium text-gray-900 hover:no-underline">
              <RefreshCw className="w-5 h-5 text-orange-600" />
              Can I cancel or change an order?
            </AccordionTrigger>
            <AccordionContent className="px-9 pb-4 text-gray-700 text-base leading-relaxed">
              Yes, before the order is shipped. Once dispatched, you can request
              a return or exchange after delivery.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="privacy">
            <AccordionTrigger className="py-4 px-4 flex items-center gap-3 text-lg font-medium text-gray-900 hover:no-underline">
              <Lock className="w-5 h-5 text-orange-600" />
              How does EezzyMart protect my data?
            </AccordionTrigger>
            <AccordionContent className="px-9 pb-4 text-gray-700 text-base leading-relaxed">
              We comply with Bangladesh’s Digital Security Act and our Privacy
              Policy. Your data is encrypted and never sold to third parties.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="mobile-app">
            <AccordionTrigger className="py-4 px-4 flex items-center gap-3 text-lg font-medium text-gray-900 hover:no-underline">
              <Smartphone className="w-5 h-5 text-orange-600" />
              Does EezzyMart have a mobile app?
            </AccordionTrigger>
            <AccordionContent className="px-9 pb-4 text-gray-700 text-base leading-relaxed">
              Yes! Download our Android or iOS app for a faster, smoother
              shopping experience with real-time tracking and deals.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="offers">
            <AccordionTrigger className="py-4 px-4 flex items-center gap-3 text-lg font-medium text-gray-900 hover:no-underline">
              <Gift className="w-5 h-5 text-orange-600" />
              Do you offer discounts or rewards?
            </AccordionTrigger>
            <AccordionContent className="px-9 pb-4 text-gray-700 text-base leading-relaxed">
              Absolutely! Enjoy flash sales, seasonal discounts, and exclusive
              loyalty rewards for registered members.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Footer Note */}
        <div className="text-center mt-10 text-gray-600 text-sm">
          Still have questions?{" "}
          <span className="text-orange-600 font-medium">
            Contact our support team — we’re happy to help!
          </span>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
