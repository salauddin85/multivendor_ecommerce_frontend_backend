/* eslint-disable  */
// @ts-nocheck
"use client";

import { Children, useEffect, useState } from "react";
import {
  Menu,
  Home,
  LogOut,
  Bell,
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  FilePenLine,
  UserPlus,
  LinkIcon,
  Flower,
  Contact,
  Quote,
  UserCheck,
  ShieldIcon,
  Settings,
  Newspaper,
  UserPlus2,
  BookMarked,
  Logs,
  Briefcase,
  Image as ImageIcon,
  icons,
} from "lucide-react";
import Link from "next/link";

import { toast } from "react-toastify";
import Image from "next/image";
import "./style.css";
import { useRouter } from "next/navigation";
import { get_me, logoutUser } from "@/lib/auth.actions";
import { useUserStore } from "@/store/user.store";
import { filterNavigationByPermissions } from "@/lib/utility_functions";
const navItems = [
  { href: "/dashboard/vendor/", label: "Home", icon: Home },
  {
    icon: ShieldIcon,
    label: "Roles Management",
    href: "#",
    urls: ["/dashboard/vendor/roles/", "/dashboard/vendor/roles/profile"],
    children: [
      { href: "/dashboard/vendor/roles", label: "Roles" },
      { href: "/dashboard/vendor/roles/profile", label: "My Roles" },
    ],
  },
  {
    href: "/dashboard/vendor/profile",
    label: "Profile Management",
    icon: UserCheck,
  },
  {
    href: "/dashboard/vendor/store",
    label: "Store Management",
    icon: Settings,
  },
  {
    icon: UserPlus2,
    label: "Staff Management",
    href: "#",
    urls: ["/dashboard/vendor/staff/"],
    children: [
      { href: "/dashboard/vendor/staff/", label: "Staff" },
      { href: "/dashboard/vendor/staff/add/", label: "Add Staff" },

    ],
  },
  
  {
    icon: ImageIcon,
    label: "Products Management",
    href: "#",
    children: [
      {
        href: "/dashboard/vendor/products/add/",
        label: "Add product",
        icon: Briefcase,
      },
      {
        href: "/dashboard/vendor/products/variants/add/",
        label: "Add product variant",
        icon: ImageIcon,
      },
      {
        href: "/dashboard/vendor/products/attributes/add/",
        label: "Add product attribute",
        icon: ImageIcon,
      },
      {
        href: "/dashboard/vendor/products/",
        label: "View products",
        icon: ImageIcon,
      },
      {
        href: "/dashboard/vendor/products/variants/",
        label: "View product variants",
        icon: ImageIcon,
      },
      {
        href: "/dashboard/vendor/products/attributes/",
        label: "View product attributes",
        icon: ImageIcon,
      },
    ],
  },
  {
    href: "#",
    label: "Orders Management",
    icon: BookMarked,
    children: [{ href: "/dashboard/vendor/orders/", label: "Orders" }],
  },
  {
    href: "#",
    label: "Wallets Management",
    icon: BookMarked,
    children: [{ href: "/dashboard/vendor/wallets/", label: "Wallets" }],
  },
  {
    href: "#",
    label: "Analytics",
    icon: BookMarked,
    children: [{ href: "/dashboard/vendor/analytics/", label: "Analytics" }],
  },
  // activity log
  {
    href: "#",
    label: "My Activity Logs",
    icon: Logs,
    children: [{ href: "/dashboard/vendor/activity_logs/", label: "Activity Logs" }],
  },
];
export default function VendorDashboardLayoutClient({
  children,
  permissions,
}: {
  children: React.ReactNode;
  permissions: any;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [navigation, setNavigation] = useState([]);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const router = useRouter();

  const { userType, userData, setUserData, setUser } = useUserStore();
  const handleFetchData = async () => {
    const fetchedData = await get_me();

    if (!fetchedData.error) {
      setUser(fetchedData.data.user.user_type);
      setUserData(fetchedData.data.user);
      const filteredNav = filterNavigationByPermissions(navItems, fetchedData?.data.permissions);
      setNavigation(filteredNav);
    }
  };

  useEffect(() => {
    handleFetchData();
  }, []);
  const handleParentClick = (e: React.MouseEvent, item: any, index: number) => {
    if (item.children && item.children.length > 0) {
      e.preventDefault();
      setExpandedItems((prev) => ({
        ...prev,
        [index]: !prev[index],
      }));
      if (collapsed) {
        setCollapsed(false);
      }
    } else if (item.href && item.href !== "#") {
      return;
    }
  };

  const handleIconClick = (e: React.MouseEvent, item: any, index: number) => {
    if (collapsed && window.innerWidth < 1024) {
      e.preventDefault();
      if (item.children && item.children.length > 0) {
        setExpandedItems((prev) => ({
          ...prev,
          [index]: !prev[index],
        }));
      } else if (item.href && item.href !== "#") {
        window.location.href = item.href;
      }
    }
  };
  const handleLogOut = async () => {
    try {
      const response = await logoutUser();

      if (response.success) {
        setUserData(null);
        setUser(null);
        toast.success(response.message);
        window.location.href = "/";
      } else {
        console.log(response);
        toast.error(response.message);
      }
    } catch (err) {
      console.log(err);
      toast.error("Log Out Failed");
    }
  };

  const hasChildren = (item: any) => item.children && item.children.length > 0;
  return (
    <div className="flex h-screen w-screen bg-linear-to-b from-orange-50 to-white overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:relative pb-2 top-0 left-0 h-screen z-40 flex flex-col bg-linear-to-b from-orange-500 via-orange-500 to-orange-600 transition-all duration-300 overflow-hidden ${
          sidebarOpen
            ? collapsed
              ? "w-20"
              : "w-64"
            : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "w-20" : "w-64"}`}
      >
        <div
          className={`flex items-center justify-between px-4 py-4 border-b border-orange-700 shrink-0 h-16`}
        >
          {!collapsed && (
            <h1 className="text-white font-bold text-lg">Vendor Dashboard</h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white hover:bg-orange-600 p-1 rounded transition-colors"
          >
            {collapsed ? <ChevronRight size={25} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto sidebar-scrollbar py-6 px-0 overflow-x-hidden">
          {navigation?.map((item: any, i: number) => (
            <div key={i}>
              {!hasChildren(item) ? (
                <Link
                  href={item.href}
                  className={`flex hover:bg-orange-500/50 transition-colors group duration-200 items-center py-3 relative w-full ${
                    collapsed ? "justify-center px-2" : "px-4"
                  }`}
                >
                  <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                    <item.icon size={20} className="text-white" />
                  </div>
                  {!collapsed && (
                    <span className="text-white text-sm font-medium ml-4 truncate group-hover:translate-x-1 transition-transform">
                      {item.label}
                    </span>
                  )}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {item.label}
                    </div>
                  )}
                </Link>
              ) : (
                <button
                  onClick={(e) => {
                    handleParentClick(e, item, i);
                    handleIconClick(e, item, i);
                  }}
                  className={`flex hover:bg-orange-500/50 transition-colors group duration-200 items-center py-3 relative w-full cursor-pointer ${
                    collapsed ? "justify-center px-2" : "px-4"
                  }`}
                >
                  <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                    <item.icon size={20} className="text-white" />
                  </div>
                  {!collapsed && (
                    <div className="flex items-center flex-1">
                      <span className="text-white text-sm font-medium ml-4 truncate group-hover:translate-x-1 transition-transform">
                        {item.label}
                      </span>
                      {hasChildren(item) && (
                        <ChevronDown
                          size={16}
                          className={`text-white ml-auto transition-transform duration-300 ${
                            expandedItems[i] ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  )}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {item.label}
                    </div>
                  )}
                </button>
              )}

              {hasChildren(item) && expandedItems[i] && !collapsed && (
                <div className="bg-orange-700/30 border-l-2 border-orange-400">
                  {item.children.map((child, childIdx) => (
                    <Link
                      key={childIdx}
                      href={child.href}
                      className="flex items-center py-2 px-4 ml-4 text-white text-sm hover:bg-orange-500/50 transition-colors group rounded-r"
                    >
                      <span className="w-2 h-2 rounded-full bg-orange-300 shrink-0 mr-3" />
                      <span className="truncate group-hover:translate-x-1 transition-transform">
                        {child.label}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div
          className={`border-t border-orange-700 p-4 shrink-0 h-16 flex items-center justify-center ${
            collapsed ? "px-2" : ""
          }`}
        >
          {!collapsed ? (
            <div className="flex items-center gap-2 w-full hover:bg-orange-500/50 overflow-x-hidden px-1 py-3 rounded-lg transition-colors">
              <button
                onClick={() => {
                  handleLogOut();
                }}
                className="w-10 h-10 cursor-pointer rounded-full bg-white/30 hover:bg-white hover:text-black text-white flex items-center justify-center transition-colors"
              >
                <LogOut size={16} />
              </button>
              <div className="text-left">
                <p className="text-sm font-medium text-white">
                  {userData?.first_name} {userData?.last_name}
                </p>
                <p className="text-xs text-orange-200">
                  {userData?.email}
                </p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                handleLogOut();
              }}
              className="w-8 h-8 cursor-pointer rounded-full bg-white/30 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>
      <div className="hidden lg:flex lg:flex-1 lg:flex-col w-full h-full overflow-hidden">
        <header className="sticky top-0 z-20 h-16 bg-linear-to-r from-orange-50 to-orange-100 border-b border-gray-200 shadow-sm flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-lg flex-1 max-w-md">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 hover:bg-orange-200 rounded-lg transition-colors text-orange-600 cursor-pointer">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="relative">
              <div
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="w-9 h-9 rounded-full border-2 border-orange-500 flex items-center justify-center text-white font-bold cursor-pointer hover:shadow-lg transition-shadow"
              >
                <ShieldIcon size={24} className="text-orange-600" />
              </div>

              {profileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                  <button
                    onClick={() => {
                      router.push(
                        `/dashboard/${
                          userType == "store_owner" ? "company" : userType
                        }/reset-password`
                      );
                      setProfileDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-slate-700 text-sm cursor-pointer hover:bg-slate-100 transition-colors flex items-center gap-2"
                  >
                    <Settings size={16} className="text-slate-500" />
                    Reset Password
                  </button>
                  <button
                    onClick={() => {
                      handleLogOut();
                      setProfileDropdown(false);
                    }}
                    className="w-full cursor-pointer px-4 py-2 text-left text-red-700 text-sm hover:bg-red-100 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={16} className="text-red-500" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-linear-to-br from-orange-50 via-white to-orange-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      <div className="flex lg:hidden flex-1 flex-col w-full h-full overflow-hidden">
        <header className="sticky top-0 z-20 h-16 bg-linear-to-r from-orange-50 to-orange-100 border-b border-gray-200 shadow-sm flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-lg flex-1 max-w-md">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 hover:bg-orange-200 rounded-lg transition-colors text-orange-600 cursor-pointer">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="relative">
              <div
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="w-9 h-9 rounded-full border-2 border-orange-500 flex items-center justify-center text-white font-bold cursor-pointer hover:shadow-lg transition-shadow"
              >
                <ShieldIcon size={24} className="text-orange-600" />
              </div>

              {profileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                  <button
                    onClick={() => {
                      router.push(
                        `/dashboard/${
                          userType == "store_owner" ? "company" : userType
                        }/reset-password`
                      );
                      setProfileDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-slate-700 text-sm cursor-pointer hover:bg-slate-100 transition-colors flex items-center gap-2"
                  >
                    <Settings size={16} className="text-slate-500" />
                    Reset Password
                  </button>
                  <button
                    onClick={() => {
                      handleLogOut();
                      setProfileDropdown(false);
                    }}
                    className="w-full cursor-pointer px-4 py-2 text-left text-red-700 text-sm hover:bg-red-100 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={16} className="text-red-500" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-linear-to-br from-orange-50 via-white to-orange-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
