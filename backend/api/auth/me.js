const { connectToDatabase } = require('../../lib/mongodb');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const TOKEN_NAME = 'token';

function parseCookies(req) {
  const header = req.headers && req.headers.cookie;
  if (!header) return {};
  return header.split(';').map(c => c.split('=')).reduce((acc, [k, ...v]) => {
    acc[k.trim()] = decodeURIComponent(v.join('='));
    return acc;
  }, {});
}

module.exports = async (req, res) => {
  await connectToDatabase();
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).end('Method Not Allowed');
    }

    const cookies = parseCookies(req);
    const token = cookies[TOKEN_NAME];
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Not authenticated' });

    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
