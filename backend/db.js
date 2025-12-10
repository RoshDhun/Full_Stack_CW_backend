// backend/db.js
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

if (!process.env.MONGO_URI) {
  throw new Error("❌ MONGO_URI is missing. Set it in Render environment variables.");
}

// MongoDB Atlas connection string
const uri = process.env.MONGO_URI;

// Mongo client with stable API (required by Atlas)
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: false,
  },
});

let db;

/**
 * Connect to MongoDB Atlas and return the selected database.
 * Uses a singleton so only ONE connection is created.
 */
async function connectDB() {
  if (db) return db;

  try {
    console.log("⏳ Connecting to MongoDB Atlas...");

    await client.connect();

    const dbName = process.env.DB_NAME || "FScoursework";
    db = client.db(dbName);

    console.log(`✅ Connected to MongoDB Atlas (DB: ${dbName})`);
    return db;

  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    throw err;
  }
}

module.exports = connectDB;
