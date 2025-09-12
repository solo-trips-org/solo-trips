"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function DashboardPage() {
  const pathname = usePathname();
  const [pageInfo, setPageInfo] = useState({ title: "", subtitle: "" });

  // Find current page info from menuItems (assuming menuItems is accessible)
  const menuItems = [
    { label: "Dashboard", title: "Dashboard Overview", subtitle: "Welcome back!", icon: "bi-speedometer2", href: "/" },
    // ... other menu items
  ];

  useEffect(() => {
    const currentPage = menuItems.find(item => item.href === pathname);
    if (currentPage) {
      setPageInfo({ title: currentPage.title, subtitle: currentPage.subtitle });
    }
  }, [pathname]);

  return (
    <div>
      {/* Page Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{pageInfo.title}</h1>
        <p className="text-sm text-gray-500">{pageInfo.subtitle}</p>
      </header>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sample Dashboard Card 1 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Total Trips</h2>
          <p className="text-3xl font-bold text-purple-600">142</p>
          <p className="text-sm text-gray-500">+12% from last month</p>
        </div>

        {/* Sample Dashboard Card 2 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Active Travellers</h2>
          <p className="text-3xl font-bold text-purple-600">89</p>
          <p className="text-sm text-gray-500">+5% from last week</p>
        </div>

        {/* Sample Dashboard Card 3 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Upcoming Events</h2>
          <p className="text-3xl font-bold text-purple-600">23</p>
          <p className="text-sm text-gray-500">Next event in 3 days</p>
        </div>
      </div>
    </div>
  );
}