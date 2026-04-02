const mongoose = require("mongoose");

const charitySchema = new mongoose.Schema({
  name: String,
  description: String
});

module.exports = mongoose.model("Charity", charitySchema);