// backend/routes/users.js
// Coursework authentication — stores email + password in MongoDB

const express = require("express");
const router = express.Router();

// ✔ Use same DB connector as lessons/orders/search
const connectDB = require("../db");

// --------------------------------------------------
// POST /users/signup
// --------------------------------------------------
router.post("/signup", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // ✔ connectDB() returns the MongoDB DATABASE (not client)
    const db = await connectDB();
    const usersCol = db.collection("users");

    // Check if user already exists
    const existing = await usersCol.findOne({ email });
    if (existing) {
      return res.status(409).json({
        error: "An account with this email already exists.",
      });
    }

    // Insert user (plain password allowed for coursework)
    const result = await usersCol.insertOne({
      email,
      password,
      createdAt: new Date(),
    });

    return res.status(201).json({
      ok: true,
      userId: result.insertedId,
      message: "User created successfully.",
    });

  } catch (err) {
    console.error("❌ Error in POST /users/signup:", err);
    return res.status(500).json({
      error: "Server error while creating user.",
    });
  }
});

// --------------------------------------------------
// POST /users/login
// --------------------------------------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const db = await connectDB();
    const usersCol = db.collection("users");

    // Look for user
    const user = await usersCol.findOne({ email });

    // Check credentials
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    return res.json({
      ok: true,
      userId: user._id,
      email: user.email,
    });

  } catch (err) {
    console.error("❌ Error in POST /users/login:", err);
    return res.status(500).json({
      error: "Server error while logging in.",
    });
  }
});

module.exports = router;
