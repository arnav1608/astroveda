const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      mobile: user.mobile,
      role: user.role,
      bio: user.bio,
      location: user.location,
      interests: user.interests,
      avatar: user.avatar,
    }
  });
};

module.exports = { generateToken, sendTokenResponse };
