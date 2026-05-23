const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  author: { type: String, default: 'Anonymous' },
  text:   { type: String, required: true },
  likes:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies: [{
    user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    author: { type: String, default: 'Anonymous' },
    text:   { type: String, required: true },
    likes:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const PollOptionSchema = new mongoose.Schema({
  text:  { type: String, required: true },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const AnnouncementSchema = new mongoose.Schema({
  author:   { type: String, default: 'Dr. Rajesh R Shastrijee' },
  type: {
    type: String,
    enum: ['announcement', 'event', 'wisdom', 'offer', 'poll'],
    default: 'announcement'
  },
  emoji:    { type: String, default: '📢' },
  text:     { type: String, required: true },
  link:     { type: String, default: '' },
  images:   [{ type: String }],
  video:    { type: String, default: '' },
  poll:     { options: [PollOptionSchema] },
  likes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  hearts:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [CommentSchema],
  pinned:   { type: Boolean, default: false },
  active:   { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
