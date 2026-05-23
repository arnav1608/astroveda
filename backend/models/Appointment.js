const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  bookingId: {
    type: String, unique: true,
    default: () => 'AV' + Date.now().toString().slice(-6).toUpperCase()
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:    { type: String, required: true, trim: true },
  mobile:  { type: String, required: true },
  email:   { type: String, default: '' },
  service: {
    type: String, required: true,
    enum: ['Free Consultation', 'Detailed Jyotish Vishleshan', 'Kundli Nirman (Birth Chart)']
  },
  price:   { type: Number, default: 0 },
  isFree:  { type: Boolean, default: false },

  // Birth Details
  dob:           { type: String, required: true },
  birthTime:     { type: String, required: true },
  birthCity:     { type: String, required: true },
  birthDistrict: { type: String, required: true },
  birthState:    { type: String, default: '' },

  message: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  paymentScreenshot: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
