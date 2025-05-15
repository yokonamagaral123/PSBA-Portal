const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");

// Ensure JWT_SECRET is defined
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables");
}

// Employee login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // Check if the user's role is not "employee"
    if (user.role !== "employee") {
      return res.status(403).json({ success: false, message: "Access denied. Not an employee." });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Return token and user info
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: { email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Error during employee login:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin login route
router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  try {
    // Find the user by email and role
    const user = await User.findOne({ email, role: "admin" });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Return token and user info
    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      user: { email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Error during admin login:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// HR login route
router.post("/hr/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("HR login request received:", { email });

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email, role: "hr" });
    if (!user) {
      console.log("HR user not found");
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("HR login successful");
    return res.status(200).json({
      success: true,
      message: "HR login successful",
      token,
      user: { email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Error during HR login:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;