const express = require('express');
const router = express.Router();
const { getAnnouncements, createAnnouncement, deleteAnnouncement, react, addComment, addReply, votePoll } = require('../controllers/announcementController');
const { protect, moderator, optionalAuth } = require('../middleware/auth');
const { upload, setFolder } = require('../middleware/upload');

router.get('/',                           optionalAuth, getAnnouncements);
router.post('/',                          protect, moderator, setFolder('announcements'), upload.array('images', 5), createAnnouncement);
router.delete('/:id',                     protect, moderator, deleteAnnouncement);
router.post('/:id/react',                 protect, react);
router.post('/:id/comment',               protect, addComment);
router.post('/:id/reply/:commentId',      protect, addReply);
router.post('/:id/vote',                  protect, votePoll);

module.exports = router;
