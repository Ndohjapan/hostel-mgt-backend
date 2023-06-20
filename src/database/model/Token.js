const mongoose = require("mongoose");

// Define the schema for the session collection
const RefreshTokenSchema = new mongoose.Schema({
  token: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId
  },
  expires: Date,
  device: {
    model: String,
    os: String,
    architecture: String,
    browser: String,
    browserVersion: String
  }
});

RefreshTokenSchema.methods.isExpired = function() {
  const today = new Date();
  return this.expires < today;
};

module.exports = mongoose.model("token", RefreshTokenSchema);