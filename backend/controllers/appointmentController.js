const Appointment = require('../models/Appointment');
const { generateBookingId } = require('../utils/helpers');

// @route  POST /api/appointments  (protected)
exports.createAppointment = async (req, res) => {
  try {
    const { name, mobile, email, service, dob, birthTime, birthCity, birthDistrict, birthState, message } = req.body;

    const prices = {
      'Free Consultation': 0,
      'Detailed Jyotish Vishleshan': 2500,
      'Kundli Nirman (Birth Chart)': 1500,
    };
    const price = prices[service] ?? 0;
    const bookingId = generateBookingId();

    const appointment = await Appointment.create({
      bookingId, user: req.user._id,
      name, mobile, email, service, price,
      isFree: price === 0,
      dob, birthTime, birthCity, birthDistrict, birthState,
      message
    });

    res.status(201).json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/appointments/mine  (protected — own bookings)
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/appointments  (mod only)
exports.getAllAppointments = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 50;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const query  = {};
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { mobile: new RegExp(search) }, { bookingId: new RegExp(search, 'i') }];
    if (status) query.status = status;

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ success: true, total, page, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PATCH /api/appointments/:id/status  (mod only)
exports.updateStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const apt = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, ...(notes && { notes }) },
      { new: true }
    );
    if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    res.json({ success: true, appointment: apt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/appointments/:id  (mod only)
exports.deleteAppointment = async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Appointment deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
