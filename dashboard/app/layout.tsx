"use client"; // Required for usePathname()

import "./globals.css";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// Bootstrap icons
import "bootstrap-icons/font/bootstrap-icons.css";

interface LayoutProps {
  children: ReactNode;
}

const menuItems = [
  { label: "Dashboard", title: "Dashboard Overview", subtitle: "Welcome back!", icon: "bi-speedometer2", href: "/" },
  { label: "Places", title: "Explore Places", subtitle: "Find your next adventure", icon: "bi-geo-alt", href: "/places" },
  { label: "Hotels & Restaurants", title: "Stay & Dine", subtitle: "Discover comfort and taste", icon: "bi-building", href: "/hotels" },
  { label: "Events", title: "Upcoming Events", subtitle: "Don’t miss what’s happening", icon: "bi-calendar-event", href: "/events" },
  { label: "Guiders", title: "Tour Guiders", subtitle: "Meet the experts", icon: "bi-person-badge", href: "/guiders" },
  { label: "Ratings", title: "Ratings & Reviews", subtitle: "See what travellers say", icon: "bi-star", href: "/ratings" },
  { label: "Traveller", title: "Traveller Info", subtitle: "Manage traveller details", icon: "bi-person", href: "/traveller" },
  { label: "Settings", title: "System Settings", subtitle: "Customize your preferences", icon: "bi-gear", href: "/settings" },
];

export default function RootLayout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true); // To prevent flashing

  // Find current page info
  const currentPage = menuItems.find(item => item.href === pathname);

  useEffect(() => {
    // Skip token check for login page
    if (pathname === "/login") {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login"); // redirect if token not found
    } else {
      setLoading(false);
    }
  }, [pathname, router]);

  // Prevent layout flashing before token check
  if (pathname !== "/login" && loading) {
    return null;
  }

  // Render login page without layout
  if (pathname === "/login") {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }

  // Render protected pages with sidebar layout
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="fixed top-0 left-0 w-64 h-screen bg-black text-white flex flex-col overflow-y-auto">
          {/* Logo / Header */}
          <div className="flex items-center gap-2 px-2 py-3 bg-black border-b border-gray-800">
            <div className="w-12 h-12 rounded overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-purple-300">Trip Planner</h1>
              <p className="text-xs text-gray-400">Management Panel</p>
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 mt-2">
            {menuItems.map((item, index) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className={`block px-6 py-3 flex items-center gap-3 transition-all rounded-md mx-3 my-2 
                    ${pathname === item.href
                      ? "bg-gradient-to-r from-purple-700 to-purple-500 text-white"
                      : "hover:from-purple-600 hover:to-purple-400 bg-gradient-to-r from-gray-800 to-gray-700"}`}
                >
                  <i className={`bi ${item.icon} text-lg`}></i>
                  <span className="font-medium">{item.label}</span>
                </Link>
                {index < menuItems.length - 1 && <hr className="border-gray-700 mx-3" />}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-6 overflow-y-auto min-h-screen">
          {/* Dynamic Page Header */}
          

          {/* Page Content */}
          <div>{children}</div>
        </main>
      </body>
    </html>
  );
}
