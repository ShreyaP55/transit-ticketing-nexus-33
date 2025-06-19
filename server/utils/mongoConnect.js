
import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

// Fix Mongoose deprecation warning
mongoose.set('strictQuery', false);

export const connect = async () => {
  if (mongoose.connection.readyState >= 1) {
    console.log("✅ MongoDB already connected");
    return;
  }

  try {
    // Clear any existing models to prevent issues
    Object.keys(mongoose.models).forEach(key => {
      delete mongoose.models[key];
    });

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "transit-app",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("🚀 MongoDB connected successfully");
    
    // Wait a moment for models to be ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
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
