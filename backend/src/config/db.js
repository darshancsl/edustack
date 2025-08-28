const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI missing from environment");

  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      await mongoose.connect(uri, {
        // modern mongoose doesn't require many options
        serverSelectionTimeoutMS: 5000,
      });
      console.log("[mongo] connected");
      break;
    } catch (err) {
      attempts += 1;
      console.error(`[mongo] connect attempt ${attempts} failed:`, err.message);
      if (attempts >= maxAttempts) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, attempts * 1000));
    }
  }
};

module.exports = { connectDB };
