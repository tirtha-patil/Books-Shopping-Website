const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bookstore";
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log("MongoDB connected successfully to:", uri);
  } catch (err) {
    console.warn("⚠️ MongoDB connection warning:", err.message);
    console.warn("Backend server will run with resilient fallback mode so API requests do not crash.");
  }
};

module.exports = connectDB;
