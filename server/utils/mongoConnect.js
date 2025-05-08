
import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

export const connect = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log("✅ MongoDB already connected");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "transit-app",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("🚀 MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw new Error("MongoDB connection failed");
  }
};

export const disconnect = async () => {
  try {
    await mongoose.disconnect();
    console.log("📌 MongoDB disconnected");
  } catch (error) {
    console.error("❌ MongoDB disconnect error:", error);
  }
};
