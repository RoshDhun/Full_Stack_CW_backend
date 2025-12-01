const express = require("express");
const router = express.Router();
const connectDB = require("../db");

// GET /search?q=...
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const lessons = db.collection("lessons");

    const q = (req.query.q || "").trim();

    let filter = {};

    if (q) {
      const regex = new RegExp(q, "i"); // case-insensitive

      filter = {
        $or: [
          { title: regex },     // match on lesson title
          { location: regex }   // and/or location
          // You can add more fields later if you store them as strings
        ]
      };
    }

    const results = await lessons.find(filter).toArray();
    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

module.exports = router;
