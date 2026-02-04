const { connectToDatabase } = require('../../lib/mongodb');
const Score = require('../../models/Score');

module.exports = async (req, res) => {
  await connectToDatabase();

  try {
    if (req.method === 'GET') {
      const scores = await Score.find().sort({ score: -1 }).limit(10);
      return res.status(200).json(scores);
    }

    if (req.method === 'POST') {
      const doc = await Score.create(req.body);
      return res.status(201).json(doc);
    }

    res.setHeader('Allow', 'GET,POST');
    return res.status(405).end('Method Not Allowed');
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
