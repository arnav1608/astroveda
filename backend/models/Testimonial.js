const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:     { type: String, required: true },
  location: { type: String, default: 'India' },
  rating:   { type: Number, required: true, min: 1, max: 5 },
  text:     { type: String, required: true, minlength: 20 },
  status:   { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', TestimonialSchema);
