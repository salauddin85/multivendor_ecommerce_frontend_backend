"use client";
import { useAuth } from "@/hooks/useAuth";
import MobileNavbar from "./MobileNavbar";
import DesktopNavbar from "./DekstopNavbar";

const Header = () => {
  useAuth();
  return (
    <div
      className="w-full bg-white shadow-sm bg-cover bg-center"
      style={{
        backgroundImage: "url('/assets/images/bg-header.jpg')",
      }}
    >
     <div className="md:hidden">
      <MobileNavbar />
     </div>
     <div className="hidden md:block">
      <DesktopNavbar />
     </div>
    </div>
  );
};

export default Header;
