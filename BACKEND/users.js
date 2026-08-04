import mongoose from "mongoose";
import express from "express";

// ── Model ──────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["user", "moderator", "admin"], default: "user" },
  skills: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", userSchema);

// ── Controller ─────────────────────────────────────────
export const createUser = async (req, res) => {
  const { name, email, role, skills = [] } = req.body;
  try {
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = await User.create({ name, email: email.toLowerCase(), role: role || "user", skills });
    res.status(201).json({ user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (req, res) => {
  const { skills = [], role, email } = req.body;
  try {
    if (!email) return res.status(400).json({ message: "Email is required" });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (skills.length) user.skills = skills;
    if (role) user.role = role;
    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ── Routes ─────────────────────────────────────────────
export const userRoutes = express.Router();
userRoutes.get("/users", getUsers);
userRoutes.post("/users", createUser);
userRoutes.post("/update-user", updateUser);
