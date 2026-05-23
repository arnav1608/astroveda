const Testimonial = require('../models/Testimonial');

// @route  GET /api/testimonials  (public — approved only)
exports.getApproved = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json({ success: true, testimonials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/testimonials/all  (mod only)
exports.getAll = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json({ success: true, testimonials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/testimonials  (protected)
exports.submit = async (req, res) => {
  try {
    const { location, rating, text } = req.body;
    const t = await Testimonial.create({
      user: req.user._id,
      name: req.user.name,
      location: location || 'India',
      rating, text
    });
    res.status(201).json({ success: true, testimonial: t, message: 'Review submitted for approval.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PATCH /api/testimonials/:id/approve  (mod only)
exports.approve = async (req, res) => {
  try {
    const t = await Testimonial.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    res.json({ success: true, testimonial: t });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PATCH /api/testimonials/:id/reject  (mod only)
exports.reject = async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review rejected and removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
