// src/lib/mongodb.ts
import * as Sentry from "@sentry/nextjs";
import mongoose from "mongoose";

/**
 * ==========================================
 * MongoDB Connection
 * ==========================================
 * Ensures a single connection is used across
 * the Next.js app (avoids multiple connections in dev)
 */

// Important: do NOT throw at module-evaluation time.
// Next.js may import server modules during build to analyze routes.
// We validate the env var at connection time instead.
const MONGODB_URI = process.env.MONGODB_URI || "";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Store connection globally (Next.js hot reload friendly)
const globalForMongoose = global as typeof globalThis & { mongoose?: MongooseCache };

// Ensure `cached` is always initialized (strict TS friendly)
const cached: MongooseCache =
  globalForMongoose.mongoose ??
  (globalForMongoose.mongoose = { conn: null, promise: null });

export async function connectToDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI || MONGODB_URI;
  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable in .env");
  }

  try {
    if (!cached.promise) {
      cached.promise = mongoose.connect(uri).then((m) => m);
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    // Do not attach the Mongo URI (contains credentials). Capture just the error.
    Sentry.withScope((scope) => {
      scope.setTag("feature", "db");
      scope.setTag("service", "mongodb");
      Sentry.captureException(error);
    });

    throw error;
  }
}
