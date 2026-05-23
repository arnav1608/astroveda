const Achievement = require('../models/Achievement');

// @route  GET /api/achievements/:section  (public)
exports.getSection = async (req, res) => {
  try {
    const { section } = req.params;
    const ach = await Achievement.findOne({ section });
    res.json({ success: true, items: ach ? ach.items : [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/achievements/:section  (mod only)
exports.addItem = async (req, res) => {
  try {
    const { section } = req.params;
    const image = req.file ? `/uploads/achievements/${req.file.filename}` : '';
    let ach = await Achievement.findOne({ section });
    if (!ach) ach = new Achievement({ section, items: [] });
    ach.items.push({ ...req.body, image });
    await ach.save();
    res.status(201).json({ success: true, items: ach.items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/achievements/:section/:itemId  (mod only)
exports.updateItem = async (req, res) => {
  try {
    const { section, itemId } = req.params;
    const ach = await Achievement.findOne({ section });
    if (!ach) return res.status(404).json({ success: false, message: 'Not found.' });
    const item = ach.items.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    if (req.file) req.body.image = `/uploads/achievements/${req.file.filename}`;
    Object.assign(item, req.body);
    await ach.save();
    res.json({ success: true, items: ach.items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/achievements/:section/:itemId  (mod only)
exports.deleteItem = async (req, res) => {
  try {
    const { section, itemId } = req.params;
    const ach = await Achievement.findOne({ section });
    if (!ach) return res.status(404).json({ success: false, message: 'Not found.' });
    ach.items = ach.items.filter(i => i._id.toString() !== itemId);
    await ach.save();
    res.json({ success: true, message: 'Item deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
