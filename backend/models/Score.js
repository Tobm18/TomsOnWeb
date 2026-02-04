const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Score",
  new mongoose.Schema(
    { playerName: String, score: Number },
    { timestamps: true }
  )
);