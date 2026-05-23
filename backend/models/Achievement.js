const mongoose = require('mongoose');

const AchievementItemSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  subtitle: { type: String, default: '' },
  desc:     { type: String, default: '' },
  image:    { type: String, default: '' },
  year:     { type: String, default: '' },
  order:    { type: Number, default: 0 },
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
