const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI environment variable is missing");
    }

    // Connect with auto-fallback to admin authSource for MongoDB Atlas clusters
    const options = {};
    if (!uri.includes("authSource=")) {
      options.authSource = "admin";
    }

    const conn = await mongoose.connect(uri, options);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
