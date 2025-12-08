// backend/routes/lessons.js
const express = require("express");
const router = express.Router();
const connectDB = require("../db");

/**
 * GET /lessons
 * Returns all lessons as JSON.
 */
router.get("/", async (req, res) => {
  console.log("✅ GET /lessons route hit");     // DEBUG

  try {
    const db = await connectDB();
    const lessonsCol = db.collection("lessons");

    const lessons = await lessonsCol.find({}).toArray();
    return res.json(lessons);
  } catch (err) {
    console.error("Error fetching lessons:", err);
    return res.status(500).json({ error: "Failed to fetch lessons" });
  }
});

/**
 * PUT /lessons/:id
 * Updates any attribute of a lesson (title, location, price, spaces, etc.).
 */
router.put("/:id", async (req, res) => {
  console.log("✅ PUT /lessons/:id route hit with id =", req.params.id); // DEBUG

  try {
    const lessonId = parseInt(req.params.id, 10);
    if (Number.isNaN(lessonId)) {
      return res.status(400).json({ error: "Lesson ID must be a number" });
    }

    const { title, location, price, spaces } = req.body || {};

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (location !== undefined) updateFields.location = location;
    if (price !== undefined) updateFields.price = price;
    if (spaces !== undefined) updateFields.spaces = spaces;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        error: "No valid fields provided to update (title, location, price, spaces)"
      });
    }

    const db = await connectDB();
    const lessonsCol = db.collection("lessons");

    const result = await lessonsCol.updateOne(
      { id: lessonId },          // your lessons have numeric id
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: `Lesson with ID ${lessonId} not found` });
    }

    const updatedLesson = await lessonsCol.findOne({ id: lessonId });

    return res.json({
      message: "Lesson updated successfully",
      lesson: updatedLesson
    });
  } catch (err) {
    console.error("Error updating lesson:", err);
    return res.status(500).json({ error: "Failed to update lesson" });
  }
});

module.exports = router;
