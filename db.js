const mongoose = require("mongoose");
require('dotenv').config();

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(
      `${process.env.MONGO_URL}/Tiffin_Dashboard`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        writeConcern: { w: 'majority' },
      }
    );
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectToMongoDB;
