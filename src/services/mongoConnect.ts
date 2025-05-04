
// MongoDB cannot connect directly from browser environments - use REST API endpoints instead
const getMongoClient = () => {
  console.warn(
    "IMPORTANT: MongoDB connections require a Node.js backend server environment. The browser cannot directly connect to MongoDB.\n" +
    "For this application, please ensure you have set up a proper backend API server that can connect to MongoDB.\n" +
    "The current application is configured to use REST API endpoints defined in src/services/api.ts"
  );
  return null;
};

export default getMongoClient;

// Note: To properly use MongoDB with this application, you would need:
// 1. A backend server (Node.js/Express) running separately from this frontend
// 2. REST API endpoints on that server that connect to MongoDB
// 3. Configure your .env with the proper API_URL pointing to your backend

/*
// Example backend server connection pattern:
import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export async function connectToMongo() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db();
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
}
*/
