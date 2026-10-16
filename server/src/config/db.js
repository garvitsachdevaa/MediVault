import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from './env.js';

// Some networks (captive ISP / college wifi) refuse Node's SRV DNS lookups that
// the mongodb+srv:// scheme needs, causing "querySrv ECONNREFUSED". Point Node at
// reliable public DNS resolvers so the Atlas connection works on any network.
dns.setServers(['1.1.1.1', '8.8.8.8']);

export const connectDb = async () => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};
