const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  charity: { type: String, default: ""},
  subscriptionStatus: { type: String, default: "inactive" }
});

module.exports = mongoose.model("User", userSchema);