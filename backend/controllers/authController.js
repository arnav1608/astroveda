const User = require('../models/User');
const { sendTokenResponse } = require('../utils/token');
const { generateUsername } = require('../utils/helpers');

// @route  POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { name, mobile, password } = req.body;

    // Check duplicate mobile
    const existing = await User.findOne({ mobile });
    if (existing) return res.status(400).json({ success: false, message: 'Mobile number already registered.' });

    // Auto-generate unique username
    let username = generateUsername(name);
    while (await User.findOne({ username })) {
      username = generateUsername(name);
    }

    const user = await User.create({ name, mobile, password, username });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide credentials.' });
    }

    // Find by mobile or username
    const user = await User.findOne({
      $or: [{ mobile: identifier }, { username: identifier.toLowerCase() }]
    }).select('+password');

    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    if (user.suspended) return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/auth/mod-login  (moderator)
exports.modLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username === process.env.MOD_USERNAME && password === process.env.MOD_PASSWORD) {
      // Try to find/create mod user in DB
      let mod = await User.findOne({ role: 'moderator' });
      if (!mod) {
        mod = await User.create({
          name: 'Dr. Rajesh R Shastrijee',
          username: 'admin_shastrijee',
          mobile: '8863038229',
          password: process.env.MOD_PASSWORD,
          role: 'moderator'
        });
      }
      return sendTokenResponse(mod, 200, res);
    }
    return res.status(401).json({ success: false, message: 'Invalid moderator credentials.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
