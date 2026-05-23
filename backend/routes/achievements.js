const express = require('express');
const router = express.Router();
const { getSection, addItem, updateItem, deleteItem } = require('../controllers/achievementController');
const { protect, moderator } = require('../middleware/auth');
const { upload, setFolder } = require('../middleware/upload');

router.get('/:section',               getSection);
router.post('/:section',              protect, moderator, setFolder('achievements'), upload.single('image'), addItem);
router.put('/:section/:itemId',       protect, moderator, setFolder('achievements'), upload.single('image'), updateItem);
router.delete('/:section/:itemId',    protect, moderator, deleteItem);

module.exports = router;
