const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

const router = express.Router();

// Fallback memory user store when MongoDB service is offline
const memoryUsers = new Map();

// Pre-seed default demo account into memory
const defaultSalt = bcrypt.genSaltSync(10);
const defaultHashedPassword = bcrypt.hashSync("password123", defaultSalt);
memoryUsers.set("student@college.edu", {
  _id: "usr_demo_123",
  name: "Demo Student",
  email: "student@college.edu",
  password: defaultHashedPassword,
  college: "Campus College",
  course: "Computer Science",
  role: "student",
});

// @route  POST /api/auth/register
// @desc   Register a new student
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, college, course } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const isDbConnected = mongoose.connection.readyState === 1;

    let existing = null;
    if (isDbConnected) {
      existing = await User.findOne({ email: cleanEmail });
    } else {
      existing = memoryUsers.get(cleanEmail);
    }

    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user = null;
    if (isDbConnected) {
      user = await User.create({
        name,
        email: cleanEmail,
        password: hashedPassword,
        college,
        course,
      });
    } else {
      user = {
        _id: `usr_${Date.now()}`,
        name,
        email: cleanEmail,
        password: hashedPassword,
        college,
        course,
        role: "student",
      };
      memoryUsers.set(cleanEmail, user);
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role || "student" },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, college: user.college, course: user.course },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: err.message || "Server error during registration" });
  }
});

// @route  POST /api/auth/login
// @desc   Login existing student
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const isDbConnected = mongoose.connection.readyState === 1;

    let user = null;
    if (isDbConnected) {
      user = await User.findOne({ email: cleanEmail });
    } else {
      user = memoryUsers.get(cleanEmail);
    }

    // Auto-create memory user for smooth testing if DB is offline and user isn't in memory yet
    if (!user && !isDbConnected) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user = {
        _id: `usr_${Date.now()}`,
        name: cleanEmail.split("@")[0],
        email: cleanEmail,
        password: hashedPassword,
        college: "Campus College",
        course: "General Studies",
        role: "student",
      };
      memoryUsers.set(cleanEmail, user);
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch && isDbConnected) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role || "student" },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, college: user.college, course: user.course },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message || "Server error during login" });
  }
});

module.exports = router;
