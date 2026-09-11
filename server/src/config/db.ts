import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!uri) {
    console.log('ℹ️  No MONGODB_URI or DATABASE_URL provided. Server running with embedded reactive in-memory store.');
    return null;
  }

  try {
    const conn = await mongoose.connect(uri, { dbName: 'seva' });
    console.log(`✅ MongoDB connected successfully to database: "${conn.connection.name}" on ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn('⚠️ MongoDB connection failed, falling back to embedded store:', error);
    return null;
  }
}

