"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Maximize2, Minimize2, ExternalLink, Compass } from "lucide-react";

const GoogleMap: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (mapContainerRef.current?.requestFullscreen) {
        mapContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleGetDirections = () => {
    const address = encodeURIComponent("House 1(Level 2), Road 3, Block A, Mirpur 11, Begum Rokeya Avenue, Dhaka-1216");
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
  };

  const handleOpenInNewTab = () => {
    window.open("https://www.google.com/maps/place/TalenTracker+Limited/@23.8161229,90.3666723,17z/data=!3m1!4b1!4m6!3m5!1s0x3755c0d6f3cd97f1:0xf61907388a238e9c!8m2!3d23.8161229!4d90.3666723!16s%2Fg%2F11t1xg8c83?entry=ttu", '_blank');
  };

  return (
    <div className="w-full">
      <div className="relative">
        {/* Map Container */}
        <div 
          ref={mapContainerRef}
          className={`relative rounded-2xl overflow-hidden shadow-lg transition-all duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            height: isExpanded ? "600px" : "400px",
            transition: "height 0.3s ease, opacity 0.5s ease"
          }}
        >
          {/* Loading Overlay */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-orange-500 border-t-transparent mb-3"></div>
                <p className="text-gray-600 mb-0">Loading map...</p>
              </div>
            </div>
          )}

          {/* Google Map Iframe */}
          <iframe
            ref={mapRef}
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d645.2472469304993!2d90.36667228136606!3d23.816122871721785!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c0d6f3cd97f1%3A0xf61907388a238e9c!2sTalenTracker%20Limited!5e0!3m2!1sen!2sbd!4v1766299327205!5m2!1sen!2sbd"
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="TalenTracker Location on Google Maps"
            style={{ filter: isLoaded ? "none" : "blur(5px)" }}
          />

          {/* Map Controls */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <button
              onClick={handleGetDirections}
              className="bg-white hover:bg-gray-100 shadow-md rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ width: "40px", height: "40px" }}
              title="Get Directions"
            >
              <Navigation size={18} className="text-orange-500" />
            </button>
            
            <button
              onClick={handleOpenInNewTab}
              className="bg-white hover:bg-gray-100 shadow-md rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ width: "40px", height: "40px" }}
              title="Open in New Tab"
            >
              <ExternalLink size={18} className="text-orange-500" />
            </button>
            
            <button
              onClick={handleFullscreen}
              className="bg-white hover:bg-gray-100 shadow-md rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ width: "40px", height: "40px" }}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={18} className="text-orange-500" /> : <Maximize2 size={18} className="text-orange-500" />}
            </button>
          </div>

          {/* Location Info Card */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex">
              <div className="w-full lg:w-1/2">
                <div className="bg-white border-0 shadow-xl rounded-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                  <div className="p-3">
                    <div className="flex items-start">
                      <div className="bg-orange-500 text-white rounded-full p-2 mr-3">
                        <MapPin size={24} />
                      </div>
                      <div className="flex-grow">
                        <h5 className="font-bold text-gray-900 mb-1">TalenTracker Headquarters</h5>
                        <p className="text-gray-600 text-sm mb-2">Mirpur 11, Dhaka-1216, Bangladesh</p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleGetDirections}
                            className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-2 rounded-lg flex items-center transition-all duration-200 hover:shadow-md"
                          >
                            <Navigation size={16} className="mr-1" />
                            Get Directions
                          </button>
                          <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white text-sm px-3 py-2 rounded-lg transition-all duration-200"
                          >
                            {isExpanded ? "Collapse" : "Expand"} Map
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map Overlay Effect */}
          <div className="absolute top-0 left-0 w-full h-1/4" style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 100%)"
          }}></div>
          <div className="absolute bottom-0 left-0 w-full h-1/4" style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.1) 0%, transparent 100%)"
          }}></div>
        </div>

        {/* Map Attribution */}
        <div className="flex justify-between items-center mt-3">
          <p className="text-gray-600 text-sm mb-0 flex items-center">
            <Compass size={14} className="mr-1 text-orange-500" />
            Interactive map showing our office location
          </p>
          <div className="flex items-center">
            <span className="text-gray-600 text-sm mr-2">Live Location</span>
            <span className="bg-green-50 text-green-600 text-xs px-2 py-1 rounded-full flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
              Active
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        iframe {
          transition: filter 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default GoogleMap;