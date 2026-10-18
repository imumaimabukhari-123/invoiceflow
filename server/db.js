// Connects to MongoDB once and reuses the connection (important on Vercel, where each
// request may run in a fresh function but warm functions keep their memory).
import mongoose from "mongoose";

let pending = null;

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing. Add it to the .env file.");
  pending ??= mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 }).catch((err) => {
    pending = null;
    throw err;
  });
  await pending;
}
