const User        = require('../models/User');
const Appointment = require('../models/Appointment');
const Product     = require('../models/Product');
const Announcement= require('../models/Announcement');
const Testimonial = require('../models/Testimonial');
const Feedback    = require('../models/Feedback');

// @route  GET /api/dashboard/stats  (mod only)
exports.getStats = async (req, res) => {
  try {
    const [users, appointments, products, posts, pendingReviews, unreadFeedback] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Appointment.countDocuments(),
      Product.countDocuments(),
      Announcement.countDocuments({ active: true }),
      Testimonial.countDocuments({ status: 'pending' }),
      Feedback.countDocuments({ read: false }),
    ]);

    const revenueData = await Appointment.aggregate([
      { $match: { status: { $in: ['Confirmed', 'Completed'] } } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);
    const revenue = revenueData[0]?.total || 0;

    const recentBookings = await Appointment.find()
      .sort({ createdAt: -1 }).limit(5);
    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 }).limit(5).select('-password');

    res.json({
      success: true,
      stats: { users, appointments, products, posts, pendingReviews, unreadFeedback, revenue },
      recentBookings,
      recentUsers
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
