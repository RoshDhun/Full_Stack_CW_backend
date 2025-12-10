// backend/server.js

// --------------------------------------
// 1. Core imports
// --------------------------------------
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// --------------------------------------
// 2. Local modules
// --------------------------------------
const connectDB = require("./db");
const searchRouter = require("./routes/search");
const ordersRouter = require("./routes/orders");
const lessonsRouter = require("./routes/lessons");
const usersRouter = require("./routes/users"); // 🔐 signup/login

// --------------------------------------
// 3. App setup
// --------------------------------------
const app = express();
const PORT = process.env.PORT || 3000;

// --------------------------------------
// 3.5 URL NORMALISER (fix /lessons%0A etc.)
// --------------------------------------
app.use((req, res, next) => {
  const orig = req.url || "";

  // Remove encoded newline (%0A), real newlines, and trailing spaces
  let cleaned = orig.replace(/%0A/gi, "");
  cleaned = cleaned.replace(/[\r\n]+/g, "");
  cleaned = cleaned.replace(/\s+$/g, "");

  if (orig !== cleaned) {
    console.log(
      "URL normalised:",
      JSON.stringify(orig),
      "=>",
      JSON.stringify(cleaned)
    );
    req.url = cleaned;

    req.originalUrl = cleaned; // keep logger output in sync
  }

  next();
});

// --------------------------------------
// 4. Middleware
// --------------------------------------

// Allow front-end access from anywhere (fine for coursework)
app.use(
  cors({
    origin: "*",
  })
);

// Parse JSON request bodies
app.use(express.json());

// ------------ LOGGER MIDDLEWARE (REQUIRED BY COURSEWORK) ------------

// Outputs all requests to the server console
app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log("---- LOGGER ----");
  console.log("Time:", now);
  console.log("Method:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Query:", req.query);
  console.log("Body:", req.body);
  console.log("----------------");
  next();
});

// ------------ STATIC FILE MIDDLEWARE (REQUIRED BY COURSEWORK) ------------

// Returns lesson images from backend/images or an error if not found
app.get("/images/:fileName", (req, res) => {
  const fileName = req.params.fileName;
  const imagePath = path.join(__dirname, "images", fileName);

  fs.access(imagePath, (err) => {
    if (err) {
      console.log(`❌ Image not found: ${imagePath}`);
      return res.status(404).json({ error: "Image not found" });
    }
    res.sendFile(imagePath);
  });
});

// --------------------------------------
// 5. Routes
// --------------------------------------

// Lessons API – GET + PUT (e.g. GET /lessons, PUT /lessons/1)
app.use("/lessons", lessonsRouter);

// Main SEARCH API (e.g. GET /search?text=math)
app.use("/search", searchRouter);

// Orders API – POST /orders
app.use("/orders", ordersRouter);

// Users API – POST /users/signup, POST /users/login
app.use("/users", usersRouter);

// Simple health-check
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Full Stack Coursework backend is running",
  });
});

// --------------------------------------
// 6. Connect to MongoDB Atlas, then start server
// --------------------------------------
(async () => {
  try {
    await connectDB(); // uses MONGO_URI + DB_NAME from env
    console.log("Connected to MongoDB Atlas");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    // Render will treat this as a failed deploy if we exit here
    process.exit(1);
  }
})();
