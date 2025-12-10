// backend/db.js
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

if (!process.env.MONGO_URI) {
  throw new Error("❌ MONGO_URI is missing. Set it in Render environment variables.");
}

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,   // ensure TLS is always enabled for Atlas SRV URLs
});

let db;

/**
 * Connect to MongoDB Atlas and return the database.
 * Uses a singleton pattern so only one connection is created.
 */
async function connectDB() {
  if (db) return db;

  try {
    console.log("🔌 Connecting to MongoDB Atlas...");
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
