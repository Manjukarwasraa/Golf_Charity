const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  score: Number,
  date: Date
});

module.exports = mongoose.model("Score", scoreSchema);