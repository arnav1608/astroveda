const Rashi = require('../models/Rashi');

// @route  GET /api/rashi/active  (public)
exports.getActive = async (req, res) => {
  try {
    const rashi = await Rashi.findOne({ active: true }).sort({ createdAt: -1 });
    if (!rashi) return res.status(404).json({ success: false, message: 'No active Rashi guidance found.' });
    res.json({ success: true, rashi });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/rashi  (mod only — all)
exports.getAll = async (req, res) => {
  try {
    const rashis = await Rashi.find().sort({ createdAt: -1 });
    res.json({ success: true, rashis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/rashi  (mod only)
exports.create = async (req, res) => {
  try {
    // Deactivate all previous
    await Rashi.updateMany({}, { active: false });
    const rashi = await Rashi.create({ ...req.body, active: true });
    res.status(201).json({ success: true, rashi });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/rashi/:id  (mod only)
exports.update = async (req, res) => {
  try {
    const rashi = await Rashi.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!rashi) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, rashi });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/rashi/:id  (mod only)
exports.remove = async (req, res) => {
  try {
    await Rashi.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
