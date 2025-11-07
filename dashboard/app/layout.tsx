"use client";

import "./globals.css";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  { label: "Paths", title: "Paths", subtitle: "See where traveller want to go", icon: "bi-signpost", href: "/paths" },
  { label: "Users", title: "Users Info", subtitle: "Manage user details", icon: "bi-person", href: "/users" },
  { label: "Settings", title: "System Settings", subtitle: "Customize your preferences", icon: "bi-gear", href: "/settings" },
  { label: "Media", title: "Media Library", subtitle: "Manage your media files", icon: "bi-image", href: "/media" },
  { label: "Logout", title: "Sign Out", subtitle: "End your session", icon: "bi-box-arrow-right", href: "/logout", isLogout: true },
];

export default function RootLayout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const currentPage = menuItems.find((item) => item.href === pathname);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const response = await fetch("https://trips-api.tselven.com/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        localStorage.removeItem("token");
        router.replace("/login");
      } else {
        console.error("Logout failed:", response.statusText);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    if (pathname === "/login") {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
    } else {
      setLoading(false);
    }
  }, [pathname, router]);

  if (pathname !== "/login" && loading) {
    return (
      <html lang="en">
        <body>
          <div>Loading...</div>
        </body>
      </html>
    );
  }

  if (pathname === "/login") {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="flex min-h-screen bg-gray-100">
        <aside className="fixed top-0 left-0 w-70 h-screen bg-black text-white flex flex-col overflow-y-auto">
          <div className="flex items-center gap-2 px-2 py-3 bg-black border-b border-gray-800">
            <div className="w-12 h-12 rounded overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-purple-300">Trip Planner</h1>
              <p className="text-xs text-gray-400">Management Panel</p>
            </div>
          </div>

          <nav className="flex-1 mt-2">
            {menuItems.map((item, index) => (
              <div key={item.label}>
                {item.isLogout ? (
                  <button
                    onClick={handleLogout}
                    className="block w-63 px-6 py-3 flex items-center gap-3 transition-all rounded-md mx-3 my-2 bg-gradient-to-r from-red-700 to-red-500 text-white hover:from-red-600 hover:to-red-400"
                  >
                    <i className={`bi ${item.icon} text-lg`}></i>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`h-11 block px-6 py-3 flex items-center gap-3 transition-all rounded-md mx-3 my-2 shadow-md transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-[0_10px_20px_rgba(128,0,255,0.6)] ${
                      pathname === item.href
                        ? "bg-gradient-to-r from-purple-700 to-purple-500 text-white"
                        : "bg-gradient-to-r from-gray-800 to-gray-700 hover:from-purple-600 hover:to-purple-400"
                    }`}
                  >
                    <i className={`bi ${item.icon} text-lg`}></i>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )}
                {index < menuItems.length - 1 && <hr className="border-gray-700 mx-3" />}
              </div>
            ))}
          </nav>
        </aside>

        <main className="flex-1 ml-64 p-6 overflow-y-auto min-h-screen">
          <div>{children}</div>
        </main>
      </body>
    </html>
  );
}