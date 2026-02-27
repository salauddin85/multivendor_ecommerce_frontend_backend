"use client";

import * as React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen  bg-white py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto px-4">
        <section className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Privacy Policy
          </h1>
          <p className="text-gray-500 mt-2 text-base md:text-lg">
            At EezzyMart, your privacy and trust are our top priorities.
          </p>
        </section>

        <Accordion
          type="single"
          collapsible
          className="w-full divide-y divide-gray-200 border-t border-b border-gray-200"
        >
          <AccordionItem value="overview">
            <AccordionTrigger className="py-4 text-lg font-medium text-gray-900 hover:no-underline">
              Overview
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-700 leading-relaxed text-base space-y-3">
              <p>
                At EezzyMart, your privacy and trust are our top priorities.
                This Privacy Policy explains how we collect, use, share, and
                protect your personal information when you use our e-commerce
                platform, mobile app, or related services (collectively referred
                to as the “Platform”).
              </p>
              <p>
                By using EezzyMart, you agree to the terms outlined in this
                Privacy Policy.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="info">
            <AccordionTrigger className="py-4 text-lg font-medium text-gray-900 hover:no-underline">
              1. Information We Collect
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-700 leading-relaxed text-base space-y-3">
              <p>
                We collect information to provide better services and a smooth
                shopping experience.
              </p>
              <h4 className="font-semibold text-gray-900">
                a. Information You Provide to Us
              </h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Full Name</li>
                <li>Contact Information (phone, email, address)</li>
                <li>Account credentials (username and password)</li>
                <li>
                  Payment details (securely processed via authorized gateways)
                </li>
                <li>Delivery and billing addresses</li>
                <li>Product reviews or feedback</li>
                <li>Business documents (for sellers or virtual shop owners)</li>
              </ul>

              <h4 className="font-semibold text-gray-900">
                b. Information Collected Automatically
              </h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Device details (IP address, browser, OS)</li>
                <li>Usage data (pages visited, clicks, time spent)</li>
                <li>Location data (if enabled)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <h4 className="font-semibold text-gray-900">
                c. Information from Third Parties
              </h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Payment and delivery service providers</li>
                <li>Marketing or affiliate partners</li>
                <li>Government or legal authorities (if required)</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="usage">
            <AccordionTrigger className="py-4 text-lg font-medium text-gray-900 hover:no-underline">
              2. How We Use Your Information
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-700 leading-relaxed text-base">
              <ul className="list-disc list-inside space-y-1">
                <li>Process and deliver your orders.</li>
                <li>Communicate about your account or support requests.</li>
                <li>
                  Provide personalized product recommendations and offers.
                </li>
                <li>Improve website, app, and customer experience.</li>
                <li>Verify user identity for sellers or shop owners.</li>
                <li>Detect and prevent fraud or unauthorized use.</li>
                <li>Comply with applicable laws in Bangladesh.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="sharing">
            <AccordionTrigger className="py-4 text-lg font-medium text-gray-900 hover:no-underline">
              3. Sharing Your Information
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-700 leading-relaxed text-base space-y-3">
              <p>
                EezzyMart never sells or rents your personal data. We only share
                with trusted partners for legitimate business purposes:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Payment processors – to process secure transactions</li>
                <li>Logistics partners – to deliver your orders</li>
                <li>
                  Marketing or analytics providers – to enhance user experience
                </li>
                <li>Regulatory authorities – when legally required</li>
              </ul>
              <p>
                All third parties follow strict data protection and
                confidentiality agreements.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="security">
            <AccordionTrigger className="py-4 text-lg font-medium text-gray-900 hover:no-underline">
              4. Data Security
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-700 leading-relaxed text-base space-y-3">
              <p>
                EezzyMart uses industry-standard security practices, including
                SSL encryption, secure servers, and restricted employee access
                to sensitive data.
              </p>
              <p>
                While we work to protect your data, no system is completely
                risk-free. Keep your credentials safe and do not share them with
                others.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="rights">
            <AccordionTrigger className="py-4 text-lg font-medium text-gray-900 hover:no-underline">
              5. Your Rights
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-700 leading-relaxed text-base space-y-2">
              <p>
                Under Bangladesh’s Digital Security Act (2018), you have rights
                to:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Access and correct your personal data</li>
                <li>Request deletion of inaccurate information</li>
                <li>Withdraw marketing consent</li>
                <li>Object to certain processing</li>
                <li>Request data usage details</li>
              </ul>
              <p>
                Contact us:{" "}
                <span className="text-orange-600">privacy@eezzymart.com</span>
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cookies">
            <AccordionTrigger className="py-4 text-lg font-medium text-gray-900 hover:no-underline">
              6. Cookies and Tracking
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-700 leading-relaxed text-base">
              <p>
                We use cookies to recognize returning users, save preferences,
                analyze site performance, and show personalized offers. You can
                disable cookies in browser settings, but some functions may not
                work properly.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="retention">
            <AccordionTrigger className="py-4 text-lg font-medium text-gray-900 hover:no-underline">
              7. Data Retention
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-700 leading-relaxed text-base">
              <p>
                We retain your data only as long as needed to complete
                transactions, comply with laws, or resolve disputes. Once no
                longer required, data is securely deleted or anonymized.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="children">
            <AccordionTrigger className="py-4 text-lg font-medium text-gray-900 hover:no-underline">
              8. Children’s Privacy
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-700 leading-relaxed text-base">
              <p>
                EezzyMart is for users aged 18 and above. We don’t knowingly
                collect data from children. If such data is found, it’s deleted
                immediately.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="transfers">
            <AccordionTrigger className="py-4 text-lg font-medium text-gray-900 hover:no-underline">
              9. International Data Transfers
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-700 leading-relaxed text-base">
              <p>
                If your data is processed outside Bangladesh, we ensure adequate
                protection via secure transfer agreements and compliance with
                global privacy standards.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="updates">
            <AccordionTrigger className="py-4 text-lg font-medium text-gray-900 hover:no-underline">
              10. Updates to This Policy
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-700 leading-relaxed text-base">
              <p>
                We may update this Privacy Policy periodically. All updates will
                be posted with a new “Last Updated” date. Continued use of
                EezzyMart implies acceptance of the revised terms.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
