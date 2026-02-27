"use client";

import * as React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const PoliciesPage: React.FC = () => {
  return (
    <div className="min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <section className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            EezzyMart Policies
          </h1>
          <p className="text-gray-500 mt-2 text-base md:text-lg">
            Transparency and trust are at the heart of everything we do.
          </p>
        </section>

        {/* Accordion */}
        <Accordion
          type="single"
          collapsible
          className="w-full divide-y divide-gray-200 border-t border-b border-gray-200"
        >
          {/* Buyer Policy */}
          <AccordionItem value="buyer">
            <AccordionTrigger className="py-4 text-lg font-medium text-gray-900 hover:no-underline">
              Buyer Policy
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-700 leading-relaxed text-base">
              <p className="mb-4">
                We value every customer and aim to create a safe, reliable, and
                enjoyable shopping experience. This Buyer Policy outlines your
                rights, responsibilities, and our commitments when you shop with
                us.
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  <strong>Eligibility:</strong> You must be at least 18 years
                  old or have parental consent. Provide accurate info and comply
                  with all policies.
                </li>
                <li>
                  <strong>Order Placement & Confirmation:</strong> Orders can be
                  placed through our website or app; confirmation will be sent
                  by email or SMS.
                </li>
                <li>
                  <strong>Payments:</strong> All prices include applicable
                  taxes. We accept multiple secure payment options.
                </li>
                <li>
                  <strong>Shipping:</strong> Orders ship in 1–2 days within
                  Dhaka, 2–4 days outside.
                </li>
                <li>
                  <strong>Cancellation:</strong> Only possible before dispatch.
                </li>
                <li>
                  <strong>Product Quality:</strong> All products are genuine and
                  sourced from trusted suppliers.
                </li>
                <li>
                  <strong>Privacy:</strong> Your data is securely stored; we
                  never share without consent.
                </li>
                <li>
                  <strong>Support:</strong> 9 AM–6 PM, Sunday–Saturday.
                </li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          {/* Seller Policy */}
          <AccordionItem value="seller">
            <AccordionTrigger className="py-4 text-lg font-medium text-gray-900 hover:no-underline">
              Seller Policy
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-700 leading-relaxed text-base">
              <p className="mb-4">
                Welcome to EezzyMart’s Seller Community! This policy ensures a
                transparent and customer-focused marketplace.
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Must be a registered business with valid documents.</li>
                <li>List products accurately with genuine descriptions.</li>
                <li>
                  Only new and authentic products are allowed—no counterfeit
                  goods.
                </li>
                <li>Follow fair pricing and transparent promotions.</li>
                <li>Dispatch orders on time with proper tracking info.</li>
                <li>Honor all returns and refunds per EezzyMart policy.</li>
                <li>
                  Maintain professionalism and comply with all legal standards.
                </li>
                <li>
                  Violations or fraudulent activity may result in account
                  suspension.
                </li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          {/* Third Party Policy */}
          <AccordionItem value="third-party">
            <AccordionTrigger className="py-4 text-lg font-medium text-gray-900 hover:no-underline">
              Third-Party Policy
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-700 leading-relaxed text-base">
              <p className="mb-4">
                This applies to all service providers, vendors, and affiliates
                working with EezzyMart.
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Comply with all applicable laws and regulations.</li>
                <li>
                  Conduct business ethically — no fraud, bribery, or
                  discrimination.
                </li>
                <li>
                  Protect customer and company data with strict confidentiality.
                </li>
                <li>
                  Deliver high-quality, legally compliant goods or services.
                </li>
                <li>Respect all intellectual property rights.</li>
                <li>Ensure transparent billing and financial integrity.</li>
                <li>Report any security breach within 24 hours.</li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          {/* Virtual Shop Policy */}
          <AccordionItem value="virtual">
            <AccordionTrigger className="py-4 text-lg font-medium text-gray-900 hover:no-underline">
              Virtual Shop Policy
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-700 leading-relaxed text-base">
              <p className="mb-4">
                Guidelines for Virtual Shop Owners operating on the EezzyMart
                platform.
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Only verified businesses or individuals may open shops.</li>
                <li>
                  Virtual spaces operate under paid subscription or rental
                  models.
                </li>
                <li>Follow EezzyMart’s branding and listing guidelines.</li>
                <li>
                  Provide accurate, genuine, and fairly priced product listings.
                </li>
                <li>Maintain strong customer service and timely delivery.</li>
                <li>
                  Comply with data privacy, IP rights, and business ethics.
                </li>
                <li>
                  Non-compliance may result in suspension or shop termination.
                </li>
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default PoliciesPage;
