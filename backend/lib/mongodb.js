const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose;

  if (global._mongoPromise) return global._mongoPromise;

  global._mongoPromise = mongoose.connect(MONGO_URI, { });
  await global._mongoPromise;
  return mongoose;
}

module.exports = { connectToDatabase };
