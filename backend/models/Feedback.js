const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  message: { type: String, required: true },
  read:    { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);
