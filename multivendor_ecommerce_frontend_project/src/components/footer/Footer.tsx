"use client";

import Link from "next/link";
import {
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useState } from "react";
import axiosintence from "@/lib/axios";
import { toast } from "react-toastify";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);

    try {
      const response = await axiosintence.post("/api/notifications/v1/notifications/subscriber/", {
        email: email
      });

      if (response.data.code === 201) {
        toast.success(response.data.message || "Successfully subscribed!");
        setEmail(""); // Clear email on success
      }
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code outside 2xx
        const { data } = error.response;
        
        if (error.response.status === 400) {
          // Handle field validation errors
          if (data.errors) {
            // Check for email field error
            if (data.errors.email) {
              toast.error(data.errors.email[0] || "Invalid email address");
            } else {
              // Handle other validation errors
              Object.keys(data.errors).forEach((field) => {
                toast.error(`${field}: ${data.errors[field][0]}`);
              });
            }
          } else {
            toast.error(data.message || "Validation failed");
          }
        } else if (error.response.status === 500) {
          // Server error
          toast.error("Server error occurred. Please try again later.");
        } else {
          // Other status codes
          toast.error(data.message || "Something went wrong");
        }
      } else if (error.request) {
        // The request was made but no response received
        toast.error("No response from server. Please check your connection.");
      } else {
        // Something happened in setting up the request
        toast.error("Request failed. Please try again.");
      }
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-white border-t border-gray-200 text-gray-700">
      {/* 🔶 Top: socials + newsletter */}
      <div className="bg-linear-to-r from-orange-600 via-orange-500 to-orange-600 text-white px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Social Icons with Enhanced Hover Effects */}
          <div className="flex items-center gap-4">
            <span className="font-semibold text-sm tracking-wide">FOLLOW US:</span>
            <div className="flex gap-3">
              <SocialIcon href="#" icon={Facebook} label="Facebook" />
              <SocialIcon href="#" icon={Twitter} label="Twitter" />
              <SocialIcon href="#" icon={Youtube} label="YouTube" />
              <SocialIcon href="#" icon={Linkedin} label="LinkedIn" />
              <SocialIcon href="#" icon={Instagram} label="Instagram" />
            </div>
          </div>

          {/* Enhanced Newsletter Subscription */}
          <form onSubmit={handleSubscribe} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                required
                className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-white/95 backdrop-blur-sm text-gray-800 placeholder:text-gray-500 border-2 border-transparent focus:border-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 shadow-lg"
                disabled={isSubscribing}
              />
            </div>
            <button
              type="submit"
              disabled={isSubscribing}
              className="group relative px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-medium rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isSubscribing ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    Subscribe
                    <Send size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </form>
        </div>
      </div>

      {/* 🧩 Middle: info sections */}
      <Card className="max-w-7xl mx-auto border-none shadow-none px-6 py-10">
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-8 p-0">
          {/* Logo & contact */}
          <div className="col-span-2 md:col-span-1 ">
            <div className="mb-4">
              <Link href="/">
                <Image
                  src="/assets/images/color_logo.jpeg"
                  alt="E-Com logo"
                  width={260}
                  height={80}
                />
              </Link>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2 items-start">
                <MapPin size={16} className="block mt-1 text-orange-600" />
                <span>San Luis Potosí, Centro Historico, SPL, Mexico</span>
              </li>
              <li className="flex gap-2 items-center">
                <Phone size={16} className="text-orange-600" />
                <span>+0214 0315 215</span>
              </li>
              <li className="flex gap-2 items-center">
                <Mail size={16} className="text-orange-600" />
                <span>contact@supermarket.com</span>
              </li>
              <li className="flex gap-2 items-center">
                <Clock size={16} className="text-orange-600" />
                <span>Open: 8:00AM - 6:00PM</span>
              </li>
            </ul>
          </div>

          {/* Info Columns */}
          <FooterColumn
            title="Information"
            links={[
              { title: "About Us", route: "/about" },
              { title: "FAQs", route: "/faq" },
              { title: "Policies", route: "/policies" },
              { title: "Privacy Policy", route: "/privacy-policy" },
            ]}
          />

          <FooterColumn
            title="Services"
            links={[
              { title: "Contact Us", route: "/contact" },
              { title: "Return & Refund", route: "/return-refund" },
              { title: "Support 24/7", route: "/support" },
              { title: "Warranty", route: "/warranty" },
            ]}
          />
        </CardContent>
      </Card>

      {/* 💳 Bottom */}
      <div className="border-t border-gray-200 py-4 text-center text-sm text-gray-500 bg-gray-50">
        <p>
          © 2026{" "}
          <span className="font-semibold text-orange-600">EezzyMart</span>.
          All rights reserved. Designed by{" "}
          <span className="text-orange-600">eezzymart.com</span>
        </p>
      </div>
    </footer>
  );
}

/* 🔸 Social Icon Component with Enhanced Hover Effects */
function SocialIcon({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="group relative w-9 h-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-white/20"
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon */}
      <Icon
        size={18}
        className="relative z-10 text-white group-hover:text-orange-600 group-hover:scale-125 transition-all duration-300"
      />
      
      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500" />
    </Link>
  );
}

/* 🔸 Footer Column Component with Animated Bottom Bar */
function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { title: string; route: string }[];
}) {
  return (
    <div>
      <h3 className="font-semibold mb-3 border-b-2 border-orange-500 inline-block pb-1">
        {title}
      </h3>
      <ul className="space-y-2 text-sm">
        {links.map((link) => (
          <li key={link.title}>
            <Link
              href={link.route}
              className="group relative inline-block py-1 hover:text-orange-600 transition-colors duration-300"
            >
              <span className="relative z-10">{link.title}</span>
              
              {/* Animated bottom bar */}
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-orange-500 to-orange-600 group-hover:w-full transition-all duration-300 ease-out" />
              
              {/* Subtle glow effect */}
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-orange-400 blur-sm opacity-0 group-hover:w-full group-hover:opacity-70 transition-all duration-300 ease-out" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}