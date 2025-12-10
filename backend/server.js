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
  const orig = req.url;

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
    req.originalUrl = cleaned;
  }

  next();
});

// --------------------------------------
// 4. Middleware
// --------------------------------------

// Allow front-end access
app.use(cors({ origin: "*" }));

// Parse JSON request bodies
app.use(express.json());

// ------------ LOGGER MIDDLEWARE (REQUIRED BY COURSEWORK) ------------
// Logs every request to the console so you can inspect/explain it
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
// Returns lesson images or an error message if the image does not exist
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
app.use("/lessons", lessonsRouter);   // GET + PUT lessons
app.use("/search", searchRouter);     // Search lessons
app.use("/orders", ordersRouter);     // POST orders
app.use("/users", usersRouter);       // 🔐 signup + login

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
    await connectDB();
    console.log("Connected to MongoDB Atlas");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();
