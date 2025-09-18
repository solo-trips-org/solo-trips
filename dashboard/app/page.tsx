"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface AnalyticsData {
  totals: {
    users: number;
    places: number;
    hotels: number;
    guides: number;
    events: number;
  };
  ratings: {
    places: string;
    hotels: string;
    guides: string;
    events: string;
  };
  recent: {
    newUsers: number;
    newPlaces: number;
    newHotels: number;
    newEvents: number;
  };
}

export default function DashboardPage() {
  const pathname = usePathname();
  const [pageInfo, setPageInfo] = useState({ title: "", subtitle: "" });
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const menuItems = [
    {
      label: "Dashboard",
      title: "Dashboard Overview",
      subtitle: "Welcome back!",
      icon: "bi-speedometer2",
      href: "/",
    },
  ];

  useEffect(() => {
    const currentPage = menuItems.find((item) => item.href === pathname);
    if (currentPage) {
      setPageInfo({ title: currentPage.title, subtitle: currentPage.subtitle });
    }
  }, [pathname]);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch("https://trips-api.tselven.com/api/analytics", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();
        setAnalytics(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    }
    fetchAnalytics();
  }, []);

  const cards = analytics ? [
    { title: "Total Users", url: "/users", value: analytics.totals.users, recent: analytics.recent.newUsers },
    { title: "Total Places", url: "/places", value: analytics.totals.places, recent: analytics.recent.newPlaces },
    { title: "Total Hotels", url: "/hotels", value: analytics.totals.hotels, recent: analytics.recent.newHotels },
    { title: "Total Events", url: "/events", value: analytics.totals.events, recent: analytics.recent.newEvents },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6 md:p-8">
      {/* Page Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{pageInfo.title}</h1>
        {pageInfo.subtitle && <p className="text-gray-400">{pageInfo.subtitle}</p>}
      </header>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <Link key={idx} href={card.url} className="block">
            <div
              className="bg-white p-6 rounded-2xl shadow-md 
                transition-transform duration-300 ease-in-out
                hover:scale-105 hover:shadow-[0_10px_20px_rgba(128,0,255,0.6)] cursor-pointer"
            >
              <h2 className="text-lg font-semibold text-gray-700">{card.title}</h2>
              <p className="text-3xl font-bold text-purple-600">{card.value}</p>
              <p className="text-sm text-gray-500">+{card.recent} new this week</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
