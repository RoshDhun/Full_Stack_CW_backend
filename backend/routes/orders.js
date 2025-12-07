// backend/routes/orders.js
const express = require("express");
const router = express.Router();
const connectDB = require("../db");

/**
 * POST /orders
 * Body example:
 * {
 *   "name": "Jane Doe",
 *   "phone": "57901234",
 *   "items": [
 *      { "lessonId": 1, "spaces": 2 },
 *      { "lessonId": 3, "spaces": 1 }
 *   ]
 * }
 */
router.post("/", async (req, res) => {
  try {
    // Debug: confirm route is hit and body is parsed
    console.log("📩 POST /orders called with body:", req.body);

    const { name, phone, items } = req.body || {};

    // Basic validation
    if (!name || !phone || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Missing name, phone, or items." });
    }

    const db = await connectDB();
    const lessonsCol = db.collection("lessons");
    const ordersCol = db.collection("orders");

    // ----------------------------------------
    // 1. CHECK IF ENOUGH SPACES ARE AVAILABLE
    // ----------------------------------------
    for (const item of items) {
      // Find lesson by numeric id (id field in lessons collection)
      const lesson = await lessonsCol.findOne({ id: item.lessonId });

      if (!lesson) {
        return res.status(400).json({
          error: `Lesson with ID ${item.lessonId} does not exist`
        });
      }

      if (lesson.spaces < item.spaces) {
        return res.status(400).json({
          error: `Not enough spaces for lesson ID ${item.lessonId}. Available: ${lesson.spaces}`
        });
      }
    }

    // ----------------------------------------
    // 2. DECREASE SPACES IN LESSONS COLLECTION
    // ----------------------------------------
    for (const item of items) {
      await lessonsCol.updateOne(
        { id: item.lessonId },
        { $inc: { spaces: -item.spaces } } // uses "spaces" (plural)
      );
    }

    // ----------------------------------------
    // 3. SAVE ORDER DOCUMENT IN "orders" COLLECTION
    // ----------------------------------------
    const orderDoc = {
      name,
      phone,
      items: items.map(i => ({
        lessonId: i.lessonId,
        spaces: i.spaces
      })),
      createdAt: new Date()
    };

    const result = await ordersCol.insertOne(orderDoc);

    return res.status(201).json({
      message: "Order saved successfully. Spaces updated.",
      orderId: result.insertedId
    });

  } catch (err) {
    console.error("Error saving order:", err);
    return res.status(500).json({ error: "Failed to save order" });
  }
});

/**
 * GET /orders
 * Retrieve all orders (for testing)
 */
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const ordersCol = db.collection("orders");
    const orders = await ordersCol.find({}).sort({ createdAt: -1 }).toArray();
    return res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

module.exports = router;
