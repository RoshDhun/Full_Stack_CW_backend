// backend/routes/search.js
const express = require("express");
const router = express.Router();
const connectDB = require("../db");

// GET /search?q=...
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const lessons = db.collection("lessons"); // keep your existing collection

    // Read the query text from URL: /search?q=...
    const q = (req.query.q || "").trim();

    let filter = {};

    if (q) {
      const regex = new RegExp(q, "i"); // case-insensitive search

      filter = {
        $or: [
          { title: regex },      // e.g. "Mathematics"
          { subject: regex },    // if your DB includes a subject field
          { location: regex },   // e.g. "Moka"
          // Add more if your lesson documents store them as STRINGS:
          // { price: regex },
          // { availability: regex }
        ]
      };
    }

    // If q is empty → filter={} → returns ALL lessons
    const results = await lessons.find(filter).toArray();

    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

module.exports = router;
