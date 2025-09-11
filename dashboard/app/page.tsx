"use client";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Users, Settings } from "lucide-react";

export default function Dashboard() {
  return (
    
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {/* Card 1 */}
      <Card className="rounded-2xl shadow-md hover:shadow-lg transition">
        <CardContent className="p-6 flex flex-col items-center">
          <Users className="h-10 w-10 text-indigo-600 mb-4" />
          <h2 className="text-lg font-semibold">Users</h2>
          <p className="text-sm text-gray-500">Manage and view all users</p>
        </CardContent>
      </Card>

      {/* Card 2 */}
      <Card className="rounded-2xl shadow-md hover:shadow-lg transition">
        <CardContent className="p-6 flex flex-col items-center">
          <BarChart3 className="h-10 w-10 text-green-600 mb-4" />
          <h2 className="text-lg font-semibold">Analytics</h2>
          <p className="text-sm text-gray-500">Track performance & stats</p>
        </CardContent>
      </Card>

      {/* Card 3 */}
      <Card className="rounded-2xl shadow-md hover:shadow-lg transition">
        <CardContent className="p-6 flex flex-col items-center">
          <Settings className="h-10 w-10 text-orange-600 mb-4" />
          <h2 className="text-lg font-semibold">Settings</h2>
          <p className="text-sm text-gray-500">Update app configurations</p>
        </CardContent>
      </Card>
    </div>
  );
}
