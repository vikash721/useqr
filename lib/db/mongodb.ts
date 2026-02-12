import { MongoClient, type MongoClientOptions } from "mongodb";

const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 1,
};

declare global {
   
  var _mongoClient: MongoClient | undefined;
}

/**
 * Singleton MongoClient for serverless (Next.js). Reuse across hot reloads.
 * Exported for transactional operations (e.g. delete QR + analytics atomically).
 */
export function getClient(): MongoClient {
  if (global._mongoClient) {
    return global._mongoClient;
  }
  const connectionUri = process.env.MONGODB_URI;
  if (!connectionUri) throw new Error("Missing MONGODB_URI in environment.");
  const client = new MongoClient(connectionUri, options);
  global._mongoClient = client;
  return client;
}

/**
 * Get the default database. Use this in server code (API routes, server actions).
 */
export async function getDb() {
  const client = getClient();
  return client.db();
}
