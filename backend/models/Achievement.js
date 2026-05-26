const mongoose = require('mongoose');

const AchievementItemSchema = new mongoose.Schema({
  title:     { type: String, default: '' },
  subtitle:  { type: String, default: '' },
  desc:      { type: String, default: '' },
  image:     { type: String, default: '' }, // stores URL path OR base64 data URI
  imageUrl:  { type: String, default: '' }, // external URL fallback
  year:      { type: String, default: '' },
  order:     { type: Number, default: 0 },
});

const AchievementSchema = new mongoose.Schema({
  section: {
    type: String,
    enum: ['awards', 'certificates', 'medals', 'photos'],
    required: true
  },
  items: [AchievementItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Achievement', AchievementSchema);
