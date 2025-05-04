
// This file is meant for server-side usage only
// In a browser environment, it will not function, as MongoDB requires Node.js

import { MongoClient, ServerApiVersion } from 'mongodb';

// This code will never actually run in the browser environment
// It's kept for reference or potential server-side use
const getMongoClient = () => {
  console.warn("MongoDB cannot connect directly from browser environments");
  return null;
};

export default getMongoClient;
