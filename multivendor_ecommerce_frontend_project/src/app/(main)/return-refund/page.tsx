"use client";

import * as React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const ReturnRefundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <section className="text-center mb-10">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
            Return & Refund Policy
          </h1>
          <p className="text-gray-500 mt-2 text-base md:text-lg">
            We value your satisfaction and aim to make returns and refunds
            simple and fair.
          </p>
        </section>

        <Accordion
          type="single"
          collapsible
          className="w-full divide-y divide-gray-200 border-t border-b border-gray-200"
        >
          {/* Eligibility */}
          <AccordionItem value="eligibility">
            <AccordionTrigger className="py-4 text-lg font-medium text-gray-900 hover:no-underline">
              1. Eligibility for Returns
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-700 leading-relaxed text-base space-y-3">
              <p>
                You can request a return if:
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>The product is damaged, defective, or faulty.</li>
                  <li>The product does not match the description.</li>
                  <li>The wrong product was delivered.</li>
                </ul>
              </p>

              <p className="font-semibold text-gray-900">Conditions:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Return requests must be made within 7 days of delivery (unless
                  otherwise specified).
                </li>
                <li>
                  The product must be unused, in original condition, and include
                  all original packaging, accessories, and documents.
                </li>
                <li>
                  <strong>Note:</strong> Certain items (like perishable goods,
                  personal care, or intimate apparel) may not be eligible for
                  return due to hygiene reasons.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* Return Process */}
          <AccordionItem value="process">
            <AccordionTrigger className="py-4 text-lg font-medium text-gray-900 hover:no-underline">
              2. Return Process
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-700 leading-relaxed text-base">
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  Log in to your EezzyMart account and go to{" "}
                  <strong>Orders &gt; Return/Exchange</strong>.
                </li>
                <li>Select the product and provide the reason for return.</li>
                <li>
                  Our support team will review your request and give return
                  pickup or drop instructions.
                </li>
                <li>
                  Once received and inspected, your refund will be processed.
                </li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          {/* Refund Process */}
          <AccordionItem value="refund">
            <AccordionTrigger className="py-4 text-lg font-medium text-gray-900 hover:no-underline">
              3. Refund Process
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-700 leading-relaxed text-base space-y-3">
              <p>
                Refunds are issued to the original payment method within 7–10
                business days after we receive and approve the returned item.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  For Cash on Delivery (COD), refunds will be made via bank
                  transfer, mobile banking, or as store credit.
                </li>
                <li>
                  Delivery charges are non-refundable unless the item was
                  defective, damaged, or incorrect.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* Exchange Policy */}
          <AccordionItem value="exchange">
            <AccordionTrigger className="py-4 text-lg font-medium text-gray-900 hover:no-underline">
              4. Exchange Policy
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-700 leading-relaxed text-base">
              <p>
                If you receive a defective or wrong product, you can request an
                exchange instead of a refund.
              </p>
              <p>
                Exchanges depend on stock availability. If the replacement isn’t
                available, a full refund will be issued.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Cancellation Policy */}
          <AccordionItem value="cancel">
            <AccordionTrigger className="py-4 text-lg font-medium text-gray-900 hover:no-underline">
              5. Cancellation Policy
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-700 leading-relaxed text-base space-y-2">
              <p>
                Orders can be cancelled <strong>before shipment</strong> via
                your account or by contacting support.
              </p>
              <p>
                Once shipped, cancellation isn’t possible — but you can initiate
                a return after delivery.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Damaged or Faulty */}
          <AccordionItem value="damaged">
            <AccordionTrigger className="py-4 text-lg font-medium text-gray-900 hover:no-underline">
              6. Damaged or Faulty Products
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-700 leading-relaxed text-base">
              <p>
                If your product is damaged or faulty, notify us immediately with
                photos of the issue.
              </p>
              <p>
                We’ll arrange a replacement or full refund, including applicable
                delivery charges.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Exceptions */}
          <AccordionItem value="exceptions">
            <AccordionTrigger className="py-4 text-lg font-medium text-gray-900 hover:no-underline">
              7. Exceptions
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-700 leading-relaxed text-base">
              <p>
                The following items are <strong>non-returnable</strong> unless
                defective:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Perishable food items</li>
                <li>Personal care products (hygiene reasons)</li>
                <li>Digital or downloadable content</li>
                <li>Customized or personalized products</li>
                <li>Undergarments</li>
              </ul>
              <p>
                These exclusions will always be mentioned on the product page.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default ReturnRefundPage;
