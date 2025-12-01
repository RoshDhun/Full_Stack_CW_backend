// backend/server.js

// 1. Core imports
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 2. Local modules
const connectDB = require('./db');
const searchRouter = require('./routes/search');

// 3. App setup
const app = express();
const PORT = process.env.PORT || 3000;

// 4. Middleware
app.use(cors({
  origin: '*',          // you can restrict to 'http://127.0.0.1:5500' if you want
}));
app.use(express.json());

// 5. Routes
//   Your coursework route that returns lessons from MongoDB Atlas
app.use('/search', searchRouter);

//   Simple health-check route
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Full Stack Coursework backend is running',
  });
});

// 6. Connect to MongoDB first, then start the server
(async () => {
  try {
    await connectDB(); // makes sure MongoDB connection works
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
