import mongoose from "mongoose";
import { User } from "../models/user.model.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json({ "success": "true", "users": users });
    } catch {
        res.status(500).json({ "success": "false", "error": "Internal Server Error" });
    }
};

export const getUser = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ "error": "User not found" });
    }
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ "error": "User not found" });
        }
        res.status(200).json({ "success": "true", "user": user });
    } catch {
        res.status(500).json({ "error": "Internal Server Error" });
    }
}

export const addUser = async (req, res) => {
    const user = req.body;
    if (!user.username || !user.email || !user.password) {
        return res.status(400).json({ "error": "Username, email, and password are required" });
    }
    const newUser = new User(user);

    try {
        await newUser.save();
        res.status(201).json({ "success": "true", data: newUser });
    } catch {
        res.status(500).json({ "error": "Internal Server Error" });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const user = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ "error": "User not found" });
    }
    try {
        const updatedUser = await User.findByIdAndUpdate(id, user, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ "error": "User not found" });
        }
        res.status(200).json({ "success": "true", data: updatedUser });
        
    }catch {
        res.status(500).json({ "error": "Internal Server Error" });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ "error": "User not found" });
    }
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ "error": "User not found" });
        }
        res.status(200).json({ "success": "true", data: deletedUser });
    } catch {
        res.status(500).json({ "error": "Internal Server Error" });
    }
};

/**
 * Update profile (non-sensitive fields only)
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id; // assuming user is authenticated via middleware (JWT/session)
    if(!userId){
        return res.status(401).json({error: "You must be authenticate to update profile"})
    }
    // Allowed fields to update
    const allowedUpdates = ["firstName", "lastName", "gender", "profile"];
    const updates = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password"); // remove password from response

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};