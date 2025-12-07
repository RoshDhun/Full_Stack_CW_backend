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
const ordersRouter = require('./routes/orders'); // <-- NEW: orders route

// --------------------------------------
// 3. App setup
// --------------------------------------
const app = express();
const PORT = process.env.PORT || 3000;

// --------------------------------------
// 4. Middleware
// --------------------------------------
app.use(cors({
  // For coursework it's fine to allow everything.
  // If you want, you can restrict this to your front-end origin.
  origin: '*',
}));

// Parse incoming JSON bodies
app.use(express.json());

// --------------------------------------
// 5. Routes
// --------------------------------------

// Main SEARCH API for coursework (Full-Text Style Search)
app.use('/search', searchRouter);

// Orders API – saves orders into MongoDB "orders" collection
app.use('/orders', ordersRouter);

// Simple health-check route
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
    console.log('Connected to MongoDB Atlas');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
})();
