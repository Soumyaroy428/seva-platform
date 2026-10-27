import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Ensure bufferCommands is true so operations during initial TLS handshake wait gracefully
mongoose.set('bufferCommands', true);

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!uri) {
    console.log('ℹ️  No MONGODB_URI or DATABASE_URL provided. Server running with embedded reactive in-memory store.');
    return null;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: 'seva',
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 20000,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log(`✅ MongoDB connected successfully to database: "${mongooseInstance.connection.name}" on ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    }).catch(err => {
      cached.promise = null;
      console.warn('⚠️ MongoDB connection failed, falling back to embedded store:', err.message);
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err: any) {
    cached.promise = null;
    console.warn('⚠️ MongoDB connection resolution error:', err.message);
    return null;
  }
}
