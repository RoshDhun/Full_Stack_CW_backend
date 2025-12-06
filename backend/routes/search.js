// backend/routes/search.js
const express = require("express");
const router = express.Router();
const connectDB = require("../db");

/**
 * GET /search?q=...
 *
 * Full-text style search over the lessons collection.
 * - If q is empty → return ALL lessons.
 * - If q has text → match it (case-insensitive) against several string fields.
 */
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const lessons = db.collection("lessons");

    // Read query string: /search?q=...
    const q = (req.query.q || "").trim();

    let filter = {};

    if (q) {
      const regex = new RegExp(q, "i"); // case-insensitive

      // Match across multiple possible fields in your lesson documents.
      filter = {
        $or: [
          { title: regex },       // e.g. "Additional Mathematics"
          { subject: regex },     // if you stored it as "subject"
          { topic: regex },       // if you used "topic" in Mongo
          { location: regex },    // e.g. "Moka"
          // You can add more fields if they are stored as strings:
          // { priceString: regex },
          // { availability: regex }
        ]
      };
    }

    // When q is empty, filter = {} and we simply return all lessons.
    const results = await lessons.find(filter).toArray();

    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

module.exports = router;
