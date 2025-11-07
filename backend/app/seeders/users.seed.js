import { User } from "../models/user.model.js";

export const seedUsers = async () => {
  await User.deleteMany();

  const users = [
    {
      username: "admin",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
    },
    {
      username: "tselven",
      email: "contact@tselven.com",
      password: "password123",
      role: "user",
    },
    {
      username: "jane_doe",
      email: "jane@example.com",
      password: "password123",
      role: "user",
    },
    {
      username: "selva",
      email: "selva@example.com",
      password: "password123",
      role: "user",
    },
    {
      username: "sri_admin",
      email: "sriadmin@example.com",
      password: "password123",
      role: "admin",
    },
  ];

  // Use create (not insertMany) so pre-save middleware (password hashing) runs
  for (const user of users) {
    const newUser = new User(user);
    await newUser.save();
  }

  console.log("✅ Seeded default Users (admin + sample users)!");
};
