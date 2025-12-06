// backend/server.js

// --------------------------------------
// 1. Core imports
// --------------------------------------
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// --------------------------------------
// 2. Local modules
// --------------------------------------
const connectDB = require('./db');
const searchRouter = require('./routes/search');

// --------------------------------------
// 3. App setup
// --------------------------------------
const app = express();
const PORT = process.env.PORT || 3000;

// --------------------------------------
// 4. Middleware
// --------------------------------------
app.use(cors({
  origin: '*',        // allow all front-ends (safe for coursework)
}));

app.use(express.json()); // allows JSON body parsing

// --------------------------------------
// 5. Routes
// --------------------------------------

// Main SEARCH API for coursework (Full-Text Style Search)
app.use('/search', searchRouter);

// Health-check route
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Full Stack Coursework backend is running',
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
