import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";

// Bootstrap icons (make sure to install bootstrap-icons)
import "bootstrap-icons/font/bootstrap-icons.css";

interface LayoutProps {
  children: ReactNode;
}

const menuItems = [
  { label: "Dashboard", icon: "bi-speedometer2", href: "/" },
  { label: "Places", icon: "bi-geo-alt", href: "/places" },
  { label: "Hotels & Restaurants", icon: "bi-building", href: "/hotels" },
  { label: "Events", icon: "bi-calendar-event", href: "/events" },
  { label: "Guiders", icon: "bi-person-badge", href: "/guiders" },
  { label: "Ratings", icon: "bi-star", href: "/ratings" },
  { label: "Traveller", icon: "bi-person", href: "/traveller" },
  { label: "Settings", icon: "bi-gear", href: "/settings" },
];

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-black text-white flex flex-col">
          {/* Logo / Header */}
          <div className="flex items-center gap-2 px-2 py-3 bg-black border-b border-gray-800">
            {/* Logo / Header */}
                {/* Logo Image */}
                <div className="w-30 h-30 rounded overflow-hidden flex items-center justify-center">
                  <img 
                    src="/logo.png" 
                    alt="Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Logo Name */}
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
                  className="block px-6 py-3 flex items-center gap-3 
                             bg-gradient-to-r from-purple-700 to-purple-500
                             hover:from-purple-600 hover:to-purple-400 
                             transition-all rounded-md mx-3 my-2"
                >
                  <i className={`bi ${item.icon} text-lg`}></i>
                  <span className="font-medium">{item.label}</span>
                </Link>
                {/* Divider except last */}
                {index < menuItems.length - 1 && (
                  <hr className="border-gray-700 mx-3" />
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          

          <div className="mt-6">{children}</div>
        </main>
      </body>
    </html>
  );
}
