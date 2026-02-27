'use client';
import React from "react";
import { useRouter } from "next/navigation";
import "./about.css";

const AboutPage: React.FC = () => {
  const router = useRouter();

  const handleShopNow = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50/30 overflow-hidden eezzymart-about-container">
      {/* Hero Section with Animation */}
      <section className="pt-16 md:pt-20 lg:pt-24 px-4 relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 eezzymart-about-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 eezzymart-about-pulse eezzymart-about-delay-2000"></div>
        </div>
        
        <div className="max-w-4xl mx-auto sm:px-6 relative">
          <div className="eezzymart-about-fade-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-gray-900 relative">
              About 
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent ml-2">
                EezzyMart
              </span>
              <div className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-orange-600 to-amber-600 rounded-full eezzymart-about-expand"></div>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 max-w-2xl eezzymart-about-fade-up eezzymart-about-delay-300">
              Making online shopping simple, fast, and affordable for everyone
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pb-20 sm:px-6 py-8 md:py-16 lg:py-20 relative">
        
        {/* Stats Section with Animation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 eezzymart-about-fade-up eezzymart-about-delay-600">
          {[
            { number: "10K+", label: "Happy Customers" },
            { number: "1000+", label: "Products" },
            { number: "24/7", label: "Support" },
            { number: "100%", label: "Secure" },
          ].map((stat, index) => (
            <div 
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center eezzymart-about-stat-card border border-orange-100"
            >
              <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-1">{stat.number}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* About Section 1 with Reveal Animation */}
        <section className="mb-12 md:mb-16 eezzymart-about-section">
          <div className="relative">
            <div className="absolute -left-4 top-0 w-1 h-0 bg-gradient-to-b from-orange-600 to-amber-600 eezzymart-about-reveal-line"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed pl-6 eezzymart-about-slide-right">
              <span className="font-semibold text-orange-600 text-2xl">&ldquo;</span>
              EezzyMart.com is focused on online retail business & wholesales
              business combining both B2C (Business-to-Consumer) and B2B
              (Business-to-Business) channels to offer products to consumers and
              businesses with a vision to redefine the way people shop online. We
              also created Market place for thousands of SMEs and entrepreneurs
              along with Virtual Shop for companies and entrepreneurs to explore
              their businesses in a digital, smart and cost effective way. Our
              goal is to create a seamless, user-friendly shopping experience for
              both retail customers and business partners by offering a wide range
              of sustainable products—from daily household items to bulk
              purchasing options for businesses.
              <span className="font-semibold text-orange-600 text-2xl">&rdquo;</span>
            </p>
          </div>
        </section>

        {/* About Section 2 with Reveal Animation */}
        <section className="mb-12 md:mb-16 eezzymart-about-section">
          <div className="relative bg-gradient-to-r from-orange-50/50 to-transparent p-6 rounded-2xl eezzymart-about-hover-card">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-200 rounded-full filter blur-3xl opacity-20 eezzymart-about-glow"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed eezzymart-about-float">
              EezzyMart.com plans to connect millions of household customers by
              offering own products under own brand name and sourcing products
              directly from ethical manufacturer, suppliers and distributors.
              EezzyMart.com will run entirely online through a user-friendly
              e-commerce platform, leveraging social media, content marketing, and
              influencer partnerships to drive sales.
            </p>
          </div>
        </section>

        {/* About Section 3 with Animation */}
        <section className="mb-12 md:mb-16">
          <div className="flex items-start gap-4 eezzymart-about-slide-left">
            <div className="flex-shrink-0 w-1 h-16 bg-gradient-to-b from-orange-600 to-amber-600 rounded-full eezzymart-about-accent-line"></div>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed italic">
              Our focus is on affordability, reliability, a seamless,
              user-friendly experience & <span className="font-bold text-orange-600">&quot;eezzy&quot;</span> for everyone.
              EezzyMart.com is an online portal available 24 X 7.
            </p>
          </div>
        </section>

        {/* Why EezzyMart Section with Interactive Cards */}
        <section className="mt-20">
          <div className="text-center mb-10 eezzymart-about-fade-up">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 relative inline-block">
              Why Eezzymart?
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-orange-600 to-amber-600 rounded-full eezzymart-about-title-underline"></div>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-6">
              Because we make online shopping eezzy! Whether you&apos;re upgrading
              your lifestyle, shopping for family needs, or finding the perfect
              gift, Eezzymart is here to make it effortless and enjoyable.
            </p>
          </div>

          {/* Interactive Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 mt-12">
            {[
              { title: "It's Simple", icon: "✨", delay: "" },
              { title: "It's Fast", icon: "⚡", delay: "200" },
              { title: "It's Affordable", icon: "💰", delay: "400" },
            ].map((item, index) => (
              <div
                key={index}
                className={`group relative eezzymart-about-fade-up ${item.delay ? `eezzymart-about-delay-${item.delay}` : ''}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="relative bg-white rounded-2xl p-8 text-center eezzymart-about-feature-card border border-orange-100">
                  <div className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-orange-600 to-amber-600 text-white text-3xl font-bold mx-auto mb-5 transform group-hover:rotate-12 transition-transform duration-500 eezzymart-about-icon">
                    {item.icon}
                  </div>
                  <p className="text-xl font-bold text-gray-900 mb-2">{item.title}</p>
                  <div className="w-12 h-1 bg-gradient-to-r from-orange-600 to-amber-600 mx-auto rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 eezzymart-about-card-underline"></div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center eezzymart-about-fade-up">
            <div className="relative inline-block group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity eezzymart-about-cta-glow"></div>
              <button 
                onClick={handleShopNow}
                className="relative bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-4 rounded-full text-lg font-semibold eezzymart-about-cta-button"
              >
                Start Shopping Now
              </button>
            </div>
            <p className="text-gray-600 mt-4 text-sm">Join thousands of happy customers today!</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;