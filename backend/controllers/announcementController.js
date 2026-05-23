const Announcement = require('../models/Announcement');

// @route  GET /api/announcements  (public)
exports.getAnnouncements = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const total = await Announcement.countDocuments({ active: true });
    const posts = await Announcement.find({ active: true })
      .sort({ pinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ success: true, total, page, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/announcements  (mod only)
exports.createAnnouncement = async (req, res) => {
  try {
    const { type, text, link, pinned } = req.body;
    const typeEmojis = { announcement:'📢', event:'🌙', wisdom:'✨', offer:'🎁', poll:'📊' };
    const images = req.files ? req.files.map(f => `/uploads/announcements/${f.filename}`) : [];

    let poll;
    if (type === 'poll' && req.body.pollOptions) {
      const opts = JSON.parse(req.body.pollOptions);
      poll = { options: opts.map(o => ({ text: o, votes: [] })) };
    }

    const post = await Announcement.create({
      type, emoji: typeEmojis[type] || '📢',
      text, link, images, poll,
      pinned: pinned === 'true' || pinned === true
    });
    res.status(201).json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/announcements/:id  (mod only)
exports.deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/announcements/:id/react  (protected)
exports.react = async (req, res) => {
  try {
    const { type } = req.body; // 'like' or 'heart'
    const post = await Announcement.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    const uid = req.user._id;
    const field = type === 'heart' ? 'hearts' : 'likes';
    const idx = post[field].indexOf(uid);
    if (idx > -1) post[field].splice(idx, 1);
    else post[field].push(uid);
    await post.save();
    res.json({ success: true, likes: post.likes.length, hearts: post.hearts.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/announcements/:id/comment  (protected)
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Announcement.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    post.comments.push({ user: req.user._id, author: req.user.name, text });
    await post.save();
    res.json({ success: true, comments: post.comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/announcements/:id/reply/:commentId  (protected)
exports.addReply = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Announcement.findById(req.params.id);
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });
    comment.replies.push({ user: req.user._id, author: req.user.name, text });
    await post.save();
    res.json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/announcements/:id/vote  (protected)
exports.votePoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const post = await Announcement.findById(req.params.id);
    if (!post || !post.poll) return res.status(400).json({ success: false, message: 'Not a poll.' });
    // Check already voted
    const alreadyVoted = post.poll.options.some(o => o.votes.includes(req.user._id));
    if (alreadyVoted) return res.status(400).json({ success: false, message: 'Already voted.' });
    post.poll.options[optionIndex].votes.push(req.user._id);
    await post.save();
    res.json({ success: true, poll: post.poll });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
