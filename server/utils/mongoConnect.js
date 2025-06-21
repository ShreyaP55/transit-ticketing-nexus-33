
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
    
    // Clear the model registry completely
    mongoose.deleteModel(/.*/)

    const MONGODB_URI = process.env.VITE_MONGODB_URI || process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error('MongoDB URI not found in environment variables');
    }

    await mongoose.connect(MONGODB_URI, {
      dbName: "transit-app",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("🚀 MongoDB connected successfully");
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    
    // Wait longer for models to be ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    console.error("🔍 Check your MONGODB_URI in .env file");
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
