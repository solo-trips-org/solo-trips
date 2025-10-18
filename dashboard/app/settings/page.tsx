"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Setting {
  _id: string;
  key: string;
  name: string;
  value: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // Fetch all settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://trips-api.tselven.com/api/settings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setSettings(data.data);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle input change
  const handleChange = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  // Save one setting
  const handleSave = async (setting: Setting) => {
    setSavingKey(setting.key);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://trips-api.tselven.com/api/settings/${setting.key}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ value: setting.value }),
        }
      );

      if (!res.ok) throw new Error("Failed to update setting");

      await res.json();
    } catch (error) {
      console.error("Error updating setting:", error);
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6 md:p-8 max-w-7xl mx-auto space-y-6">
  <h1 className="text-2xl font-bold tracking-tight mb-6">App Settings</h1>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {settings.map((setting) => (
      <Card key={setting._id} className="shadow-md w-full">
        <CardHeader>
          <CardTitle className="text-lg font-medium">{setting.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Input
            value={setting.value}
            onChange={(e) => handleChange(setting.key, e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => handleSave(setting)}
            disabled={savingKey === setting.key}
          >
            {savingKey === setting.key ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save"
            )}
          </Button>
        </CardContent>
      </Card>
    ))}
  </div>
</div>

  );
}
