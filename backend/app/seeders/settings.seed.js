import Setting from "../models/setting.model.js";

export const seedSettings = async () => {
  await Setting.deleteMany();

  const settings = [
    {
      key: "app_name",
      name: "App Name",
      value: "Solo Trips",
    },
    {
      key: "app_logo",
      name: "App Logo",
      value: "https://example.com/assets/app-logo.png",
    },
    {
      key: "app_version",
      name: "App Version",
      value: "1.0.0",
    },
    {
      key: "support_email",
      name: "Support Email",
      value: "support@solotrips.com",
    },
    {
      key: "support_phone",
      name: "Support Phone",
      value: "+94 77 123 4567",
    },
  ];

  await Setting.insertMany(settings);
  console.log("✅ Seeded default mobile app settings!");
};
