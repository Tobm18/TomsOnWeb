const { connectToDatabase } = require('../../lib/mongodb');
const Score = require('../../models/Score');

module.exports = async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const scores = await Score.find().sort({ score: -1 }).lean();
      return res.status(200).json(scores);
    }

    if (req.method === 'POST') {
      const { game, playerName, score } = req.body;
      
      if (!game || !playerName || score === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Find existing score for this player in this game
      let existingScore = await Score.findOne({ game, playerName });

      if (existingScore) {
        // Update only if new score is higher
        if (score > existingScore.score) {
          existingScore.score = score;
          await existingScore.save();
        }
        return res.status(200).json(existingScore);
      } else {
        // Create new entry
        const doc = await Score.create({ game, playerName, score });
        return res.status(201).json(doc);
      }
    }

    res.setHeader('Allow', 'GET,POST');
    return res.status(405).end('Method Not Allowed');
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
