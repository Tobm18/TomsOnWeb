const { connectToDatabase } = require('../../lib/mongodb');
const User = require('../../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const TOKEN_NAME = 'token';

function setTokenCookie(res, token) {
  const maxAge = 7 * 24 * 60 * 60; // seconds
  const cookie = `${TOKEN_NAME}=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  res.setHeader('Set-Cookie', cookie);
}

module.exports = async (req, res) => {
  try {
    await connectToDatabase();
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).end('Method Not Allowed');
    }

    const { username, email, password } = req.body || {};
    if (!username || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    // Validate username length
    if (typeof username === 'string' && username.length > 20) {
      return res.status(400).json({ message: 'Username must be at most 20 characters' });
    }

    // Check for existing email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(409).json({ message: 'Email already in use' });

    // Use normalized lowercase username for case-insensitive uniqueness
    const normalized = (typeof username === 'string') ? username.toLowerCase() : username;
    const existingUsername = await User.findOne({ usernameLower: normalized });
    if (existingUsername) return res.status(409).json({ message: 'Username already in use' });

    const hashed = await bcrypt.hash(password, 10);
    let user;
    try {
      user = await User.create({ username, usernameLower: normalized, email, password: hashed });
    } catch (createErr) {
      // Handle duplicate key errors that might occur from race conditions
      if (createErr && createErr.code === 11000) {
        if (createErr.keyPattern && createErr.keyPattern.usernameLower) {
          return res.status(409).json({ message: 'Username already in use' });
        }
        if (createErr.keyPattern && createErr.keyPattern.email) {
          return res.status(409).json({ message: 'Email already in use' });
        }
        return res.status(409).json({ message: 'Duplicate key error' });
      }
      throw createErr;
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    setTokenCookie(res, token);

    return res.status(201).json({ id: user._id, username: user.username, email: user.email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
