// backend/db.js
const { MongoClient } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGO_URI);

let db;

/**
 * Connect to MongoDB Atlas and return the FScoursework database.
 * Uses a singleton pattern so the connection is reused.
 */
async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db("FScoursework"); // <-- this must match the DB name in Atlas
    console.log("Connected to MongoDB Atlas");
  }
  return db;
}

module.exports = connectDB;
