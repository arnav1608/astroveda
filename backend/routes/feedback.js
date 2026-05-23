const express = require('express');
const router = express.Router();
const { submit, getAll, markRead, remove } = require('../controllers/feedbackController');
const { protect, moderator } = require('../middleware/auth');

router.post('/',          submit);
router.get('/',           protect, moderator, getAll);
router.patch('/:id/read', protect, moderator, markRead);
router.delete('/:id',     protect, moderator, remove);

module.exports = router;
