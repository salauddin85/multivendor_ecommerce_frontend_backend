"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  MapPin, Phone, Mail, Clock, Users, Award, Globe, 
  ChevronRight, Building, Target, Shield, Zap,
  Linkedin, Facebook, Instagram, ExternalLink
} from "lucide-react";

interface Counters {
  clients: number;
  experts: number;
  countries: number;
  years: number;
}

interface ContactCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  content: string;
  link?: string;
  animationDelay: number;
}

interface SocialLink {
  platform: string;
  icon: React.ReactNode;
  url: string;
  color: string;
  description: string;
}

interface WhyChooseCard {
  title: string;
  icon: React.ReactNode;
  description: string;
  action: string;
  link?: string;
  highlight?: boolean;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ContactInfo: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [counters, setCounters] = useState<Counters>({
    clients: 0,
    experts: 0,
    countries: 0,
    years: 0
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Orange-500 color variables
  const primaryColor = "#f97316";
  const primaryLight = "rgba(249, 115, 22, 0.1)";

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            animateCounters();
          }
        });
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  const animateCounters = () => {
    const targetValues = { clients: 500, experts: 50, countries: 15, years: 5 };
    const intervals: { [key: string]: NodeJS.Timeout } = {};
    
    (Object.keys(targetValues) as Array<keyof typeof targetValues>).forEach(key => {
      let current = 0;
      const increment = targetValues[key] / 50;
      
      intervals[key] = setInterval(() => {
        current += increment;
        if (current >= targetValues[key]) {
          current = targetValues[key];
          clearInterval(intervals[key]);
        }
        
        setCounters(prev => ({
          ...prev,
          [key]: Math.floor(current)
        }));
      }, 30);
    });

    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  };

  const contactCards: ContactCard[] = [
    {
      icon: <MapPin size={28} />,
      title: "Office Location",
      description: "Visit us today",
      content: "House 1(Level 2), Road 3, Block A, Mirpur 11, Begum Rokeya Avenue, Dhaka-1216",
      animationDelay: 0
    },
    {
      icon: <Phone size={28} />,
      title: "Phone Support",
      description: "Call us 24/7",
      content: "+880 184 7293 000",
      link: "tel:+8801847293000",
      animationDelay: 0.1
    },
    {
      icon: <Mail size={28} />,
      title: "Email Address",
      description: "Send us an email",
      content: "care@talentracker.net",
      link: "mailto:care@talentracker.net",
      animationDelay: 0.2
    },
    {
      icon: <Clock size={28} />,
      title: "Working Hours",
      description: "Available for you",
      content: "Mon-Sat: 9AM-6PM",
      animationDelay: 0.3
    }
  ];

  const socialLinks: SocialLink[] = [
    {
      platform: "LinkedIn",
      icon: <Linkedin size={20} />,
      url: "https://linkedin.com/company/talentracker",
      color: "#0077B5",
      description: "Follow for professional updates"
    },
    {
      platform: "Facebook",
      icon: <Facebook size={20} />,
      url: "https://facebook.com/talentracker",
      color: "#1877F2",
      description: "Connect with our community"
    },
    {
      platform: "Instagram",
      icon: <Instagram size={20} />,
      url: "https://instagram.com/talentracker",
      color: "#E4405F",
      description: "See our culture & events"
    }
  ];

  const whyChooseCards: WhyChooseCard[] = [
    {
      title: "Need Immediate Assistance?",
      icon: <Phone size={24} />,
      description: "24/7 support available for urgent queries",
      action: "Call Now",
      link: "tel:+8801847293000",
      highlight: true
    },
    {
      title: "Modern Workplace Solutions",
      icon: <Building size={24} />,
      description: "State-of-the-art facilities for innovation",
      action: "Learn More"
    },
    {
      title: "Global Presence",
      icon: <Globe size={24} />,
      description: "Serving clients across 15+ countries",
      action: "View Locations"
    },
    {
      title: "Business Hours",
      icon: <Clock size={24} />,
      description: "Mon-Sat: 9AM-6PM | Emergency: 24/7",
      action: "Schedule Meeting"
    }
  ];

  const features: Feature[] = [
    {
      icon: <Shield size={24} />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security for your data"
    },
    {
      icon: <Zap size={24} />,
      title: "Fast Response",
      description: "Average response time under 2 hours"
    },
    {
      icon: <Target size={24} />,
      title: "Expert Solutions",
      description: "Tailored HR solutions for your business"
    },
    {
      icon: <Building size={24} />,
      title: "Global Network",
      description: "Serving clients across 15+ countries"
    }
  ];

  return (
    <div className="py-5 lg:py-6 relative" style={{ 
      background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"
    }}>
      {/* Orange Accent Background */}
      <div className="absolute top-0 left-0 right-0 h-96 opacity-5 z-0"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, #ea580c 100%)`,
        }}
      ></div>

      <div className="container relative z-10 mx-auto px-4">
        {/* Header Section */}
        <div className={`text-center mb-5 transition-all duration-600 ${
          isVisible ? 'animate-fadeInDown' : 'opacity-0'
        }`}>
          <span className="inline-flex items-center px-4 py-2 rounded-full mb-4"
            style={{ 
              backgroundColor: primaryLight,
              color: primaryColor
            }}>
            <span className="w-2 h-2 rounded-full mr-2" 
              style={{ backgroundColor: primaryColor }}></span>
            CONTACT INFORMATION
          </span>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Connect With <span style={{ color: primaryColor }}>Our Team</span>
          </h1>
          <p className="text-lg text-gray-600 mx-auto max-w-3xl">
            Building better workplaces starts with a conversation. Reach out to our team of HR professionals.
          </p>
        </div>

        {/* Contact Cards */}
        <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {contactCards.map((card, index) => (
            <div key={index} className="col-span-1">
              <div 
                className={`bg-white border-0 h-full shadow-md hover-lift transition-all duration-300 ${
                  isVisible ? 'animate-fadeInUp' : 'opacity-0'
                }`}
                style={{ 
                  animationDelay: `${card.animationDelay}s`,
                  animationFillMode: "both",
                  borderLeft: `4px solid ${primaryColor}`,
                  borderRadius: "12px"
                }}
              >
                <div className="p-4 flex flex-col h-full">
                  {/* Icon */}
                  <div className="mb-4">
                    <div className="rounded-full inline-flex items-center justify-center p-3"
                      style={{ backgroundColor: primaryLight }}>
                      <div style={{ color: primaryColor }}>
                        {card.icon}
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{card.description}</p>
                  
                  {card.link ? (
                    <a 
                      href={card.link}
                      className="no-underline mt-auto flex items-center justify-between"
                    >
                      <span className="font-medium" style={{ color: primaryColor }}>{card.content}</span>
                      <ChevronRight size={18} style={{ color: primaryColor }} />
                    </a>
                  ) : (
                    <p className="text-gray-900 font-medium mt-auto">{card.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section with Orange Theme */}
        <div className={`mb-5 ${isVisible ? 'animate-zoomIn' : 'opacity-0'}`}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-orange-500 text-white rounded-2xl overflow-hidden shadow-xl relative p-6 lg:p-8">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>
            
            <div className="text-center relative z-10">
              <div className="text-4xl font-bold mb-2">{counters.clients}+</div>
              <div className="text-orange-100">Happy Clients</div>
            </div>
            
            <div className="text-center relative z-10">
              <div className="text-4xl font-bold mb-2">{counters.experts}+</div>
              <div className="text-orange-100">HR Experts</div>
            </div>
            
            <div className="text-center relative z-10">
              <div className="text-4xl font-bold mb-2">{counters.countries}+</div>
              <div className="text-orange-100">Countries</div>
            </div>
            
            <div className="text-center relative z-10">
              <div className="text-4xl font-bold mb-2">{counters.years}+</div>
              <div className="text-orange-100">Years Experience</div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className={`grid grid-cols-1 gap-4 mb-5 ${
          isVisible ? 'animate-fadeInUp' : 'opacity-0'
        }`} style={{ animationDelay: "0.3s" }}>
          <div className="col-span-1">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Our Core Features</h3>
              <p className="text-gray-600">What makes us stand out</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="col-span-1">
                  <div className="bg-white border-0 shadow-md h-full hover-lift transition-all duration-300 rounded-xl">
                    <div className="p-4 text-center">
                      <div className="rounded-full inline-flex items-center justify-center p-3 mb-3"
                        style={{ backgroundColor: primaryLight }}>
                        <div style={{ color: primaryColor }}>
                          {feature.icon}
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h4>
                      <p className="text-gray-600 text-sm mb-0">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Social Links Section - Last Section */}
        <div className={`text-center ${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`}>
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Connect With Us</h3>
            <p className="text-gray-600">Follow TalenTracker on social media for updates and insights</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-center">
            {socialLinks.map((social, index) => (
              <div key={index} className="col-span-1">
                <a 
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border-0 shadow-md no-underline hover-lift h-full block rounded-xl transition-all duration-300"
                  style={{ 
                    borderTop: `4px solid ${social.color}`,
                  }}
                >
                  <div className="p-4 text-center">
                    <div className="mb-3">
                      <div className="rounded-full inline-flex items-center justify-center p-3"
                        style={{ 
                          backgroundColor: `${social.color}15`,
                          color: social.color
                        }}>
                        {social.icon}
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{social.platform}</h4>
                    <p className="text-gray-600 text-sm mb-3">{social.description}</p>
                    
                    <div className="flex items-center justify-center">
                      <span className="font-medium" style={{ color: social.color }}>
                        Visit Profile
                      </span>
                      <ExternalLink size={16} className="ml-2" style={{ color: social.color }} />
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
          
          <div className="mt-5">
            <p className="text-gray-600">
              Stay updated with the latest HR trends, job opportunities, and company news
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-lift {
          transition: all 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(249, 115, 22, 0.15) !important;
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
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
        
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fadeInDown {
          animation: fadeInDown 0.6s ease forwards;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease forwards;
        }
        
        .animate-zoomIn {
          animation: zoomIn 0.6s ease forwards;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease forwards;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.6s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default ContactInfo;