const User = require('../models/User');

// @route  GET /api/users  (mod only)
exports.getAllUsers = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || '';
    const query = search
      ? { $or: [{ name: new RegExp(search, 'i') }, { mobile: new RegExp(search) }, { username: new RegExp(search, 'i') }] }
      : {};
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ success: true, total, page, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/users/:id  (mod only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/users/profile  (own profile)
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, location, age, interests } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, location, age, interests },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/users/:id/suspend  (mod only)
exports.toggleSuspend = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    user.suspended = !user.suspended;
    await user.save();
    res.json({ success: true, suspended: user.suspended, message: `User ${user.suspended ? 'suspended' : 'activated'}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/users/:id  (mod only)
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/users/avatar  (own, upload)
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
    const url = `/uploads/avatars/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user.id, { avatar: url });
    res.json({ success: true, avatar: url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
