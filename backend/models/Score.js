const mongoose = require("mongoose");

const ScoreSchema = new mongoose.Schema(
    {
      game: { type: String, index: true },
      playerName: { type: String, index: true }, 
      score: { type: Number, index: true }
    },
    { timestamps: true }
  );

ScoreSchema.index({ game: 1, playerName: 1 });
ScoreSchema.index({ game: 1, score: -1 });

module.exports = mongoose.model("Score", ScoreSchema);