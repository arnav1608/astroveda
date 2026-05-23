const express = require('express');
const router = express.Router();
const { getApproved, getAll, submit, approve, reject } = require('../controllers/testimonialController');
const { protect, moderator } = require('../middleware/auth');

router.get('/',           getApproved);
router.get('/all',        protect, moderator, getAll);
router.post('/',          protect, submit);
router.patch('/:id/approve', protect, moderator, approve);
router.patch('/:id/reject',  protect, moderator, reject);

module.exports = router;
