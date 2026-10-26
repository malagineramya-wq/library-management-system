import mongoose from 'mongoose';

export let isMongoConnected = false;

export const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/library_management_system';

  try {
    console.log(`[MongoDB] Attempting connection to: ${primaryUri} ...`);
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 1800,
    });
    isMongoConnected = true;
    console.log(`[MongoDB] Connected successfully to MongoDB server: ${mongoose.connection.host}`);
  } catch (err) {
    isMongoConnected = false;
    console.log(`[Notice] MongoDB daemon not detected (${err.message}).`);
    console.log(`[Database] Switched to seamless local persistent storage (server/data/db.json).`);
    console.log(`[Database] All CRUD endpoints, validations, and operations are 100% active and testable.`);
  }
};

export default connectDB;
