import mongoose from 'mongoose';
import { setUseMock } from '../models/dbHelper.js';

const connectDB = async () => {
  try {
    // Set connection timeout to 2 seconds so local fallback is fast
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/academiapro', {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    setUseMock(false);
  } catch (error) {
    console.warn(`\n[WARNING] MongoDB connection failed: ${error.message}`);
    console.warn(`[WARNING] Switching to local JSON Database fallback (/database/mockDb.json)`);
    console.warn(`[WARNING] Make sure to populate the database by running: npm run seed\n`);
    setUseMock(true);
  }
};

export default connectDB;
