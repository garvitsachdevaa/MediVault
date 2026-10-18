import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

// A single-node replica set so Mongoose transactions work in tests (standalone
// MongoDB rejects transactions) — matching Atlas, which supports them.
let mongod;

export const connectTestDb = async () => {
  mongod = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(mongod.getUri());
};

export const clearTestDb = async () => {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
};

export const disconnectTestDb = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
};
