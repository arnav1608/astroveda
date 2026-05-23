const Feedback = require('../models/Feedback');

// @route  POST /api/feedback  (public)
exports.submit = async (req, res) => {
  try {
    const { name, message } = req.body;
    if (!name || !message) return res.status(400).json({ success: false, message: 'Name and message required.' });
    const fb = await Feedback.create({ name, message });
    res.status(201).json({ success: true, message: 'Feedback submitted. Thank you!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/feedback  (mod only)
exports.getAll = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json({ success: true, feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PATCH /api/feedback/:id/read  (mod only)
exports.markRead = async (req, res) => {
  try {
    await Feedback.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true, message: 'Marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/feedback/:id  (mod only)
exports.remove = async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
