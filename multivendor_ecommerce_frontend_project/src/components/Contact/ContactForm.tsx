"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquareMore,
  Send,
  CheckCircle,
  User,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Globe,
  Clock,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-toastify";

interface FormData {
  full_name: string;
  email: string;
  phone_number: string;
  subject: string;
  message: string;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    email: "",
    phone_number: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 },
    );

    if (formRef.current) {
      observer.observe(formRef.current);
    }

    return () => {
      if (formRef.current) {
        observer.unobserve(formRef.current);
      }
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post(
        "/api/contacts/v1/contacts/",
        formData,
      );

      if (response.status === 201) {
        toast.success(
          "Message sent successfully! We'll get back to you soon.",
        );
        setSubmitSuccess(true);

        // Reset form
        setFormData({
          full_name: "",
          email: "",
          phone_number: "",
          subject: "",
          message: "",
        });

        // Reset success state
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Something went wrong!";
      toast.error(` ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="py-5 py-lg-6 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23f97316' fill-opacity='0.02' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="container position-relative mx-auto px-4">
        <div
          ref={formRef}
          className={`flex justify-center transition-opacity duration-600 ${
            isVisible ? "animate-fadeInUp" : "opacity-0"
          }`}
        >
          <div className="w-full lg:w-10/12">
            <div className="text-center mb-5">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                Get In <span className="text-orange-500">Touch</span>
              </h2>
              <p className="text-lg text-gray-600 mx-auto max-w-2xl">
                Connect with our experts to build a better workplace. We're here
                to help you transform your business.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 justify-center">
          {/* Contact Information Card */}
          <div className="lg:col-span-4">
            <div
              className={`bg-white rounded-2xl shadow-xl h-full ${
                isVisible ? "animate-fadeInLeft" : "opacity-0"
              }`}
              style={{ animationDelay: "0.2s" }}
            >
              <div className="p-4 lg:p-5">
                <div className="text-center mb-4">
                  <div
                    className="bg-gray-900 text-white rounded-full inline-flex items-center justify-center mb-3"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <MessageSquareMore size={36} />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">Contact Information</h3>
                  <p className="text-gray-600">Reach out through any channel</p>
                </div>

                <div className="mb-4">
                  <div className="flex items-start mb-4">
                    <div className="bg-orange-100 rounded-full p-3 mr-3">
                      <Phone size={20} className="text-orange-500" />
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900 mb-1">Phone Number</h5>
                      <a
                        href="tel:+8801847293000"
                        className="text-orange-500 hover:text-orange-600 text-lg no-underline"
                      >
                        +880 184 7293 000
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start mb-4">
                    <div className="bg-orange-100 rounded-full p-3 mr-3">
                      <Mail size={20} className="text-orange-500" />
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900 mb-1">Email Address</h5>
                      <a
                        href="mailto:care@talentracker.net"
                        className="text-orange-500 hover:text-orange-600 no-underline"
                      >
                        care@talentracker.net
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-orange-100 rounded-full p-3 mr-3">
                      <MapPin size={20} className="text-orange-500" />
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900 mb-1">Office Address</h5>
                      <p className="mb-0 text-sm">
                        House 1(Level 2), Road 3, Block A, Mirpur 11, Begum
                        Rokeya Avenue, Dhaka-1216
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h5 className="font-bold text-gray-900 mb-3 flex items-center">
                    <Globe className="mr-2" size={20} />
                    Global Presence
                  </h5>
                  <div className="flex items-center">
                    <div className="flex-grow">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-orange-500 rounded-full"
                          style={{ width: "85%" }}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-3">
                      <span className="font-bold text-gray-900">15+</span>
                      <span className="text-gray-500 text-xs block">
                        Countries
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Card */}
          <div className="lg:col-span-8">
            <div
              className={`bg-white rounded-2xl shadow-xl h-full ${
                isVisible ? "animate-fadeInRight" : "opacity-0"
              }`}
              style={{ animationDelay: "0.4s" }}
            >
              <div className="p-4 lg:p-5">
                <div className="mb-4">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                    Send Us a Message
                    <Send
                      className="ml-2 text-orange-500"
                      size={28}
                    />
                  </h3>
                  <p className="text-gray-600">
                    Fill out the form below and we'll respond within 24 hours.
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">
                        <User size={16} className="inline mr-2" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-gray-900 mb-2">
                        <Mail size={16} className="inline mr-2" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block font-medium text-gray-900 mb-2">
                        <Phone size={16} className="inline mr-2" />
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                        placeholder="+880 123 456 7890"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-gray-900 mb-2">
                        Subject (Optional)
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                        placeholder="How can we help?"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block font-medium text-gray-900 mb-2">
                      <MessageCircle size={16} className="inline mr-2" />
                      Your Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all resize-none"
                      placeholder="Tell us about your project or inquiry..."
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 px-4 rounded-lg font-bold text-white transition-all duration-300 flex items-center justify-center ${
                      submitSuccess
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    } ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Processing...
                      </>
                    ) : submitSuccess ? (
                      <>
                        <CheckCircle className="mr-2" size={24} />
                        Message Sent Successfully!
                      </>
                    ) : (
                      <>
                        <Send className="mr-2" size={24} />
                        Send Message Now
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-0 text-center">
                    <i className="bi bi-shield-check mr-1"></i>
                    Your information is secure. We respect your privacy and
                    never share your data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Contact Bar */}
        <div
          className={`mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 ${
            isVisible ? "animate-fadeInUp" : "opacity-0"
          }`}
          style={{ animationDelay: "0.6s" }}
        >
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="p-4 text-center">
              <div className="text-orange-500 mb-2">
                <Phone size={24} className="mx-auto" />
              </div>
              <h6 className="font-bold mb-1 text-gray-900">Call Support</h6>
              <a
                href="tel:+8801847293000"
                className="text-orange-500 hover:text-orange-600 no-underline"
              >
                +880 184 7293 000
              </a>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="p-4 text-center">
              <div className="text-orange-500 mb-2">
                <Mail size={24} className="mx-auto" />
              </div>
              <h6 className="font-bold mb-1 text-gray-900">Email Support</h6>
              <a
                href="mailto:care@talentracker.net"
                className="text-orange-500 hover:text-orange-600 no-underline"
              >
                care@talentracker.net
              </a>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="p-4 text-center">
              <div className="text-orange-500 mb-2">
                <Clock size={24} className="mx-auto" />
              </div>
              <h6 className="font-bold mb-1 text-gray-900">Response Time</h6>
              <p className="mb-0 font-medium text-orange-500">
                Within 2 Hours
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease forwards;
        }

        .animate-fadeInLeft {
          animation: fadeInLeft 0.6s ease forwards;
        }

        .animate-fadeInRight {
          animation: fadeInRight 0.6s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default ContactForm;