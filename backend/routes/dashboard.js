const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController');
const { protect, moderator } = require('../middleware/auth');

router.get('/stats', protect, moderator, getStats);

module.exports = router;
