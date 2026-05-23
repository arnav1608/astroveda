const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateProfile, toggleSuspend, deleteUser, uploadAvatar } = require('../controllers/userController');
const { protect, moderator } = require('../middleware/auth');
const { upload, setFolder } = require('../middleware/upload');

router.get('/',           protect, moderator, getAllUsers);
router.get('/:id',        protect, moderator, getUserById);
router.put('/profile',    protect, updateProfile);
router.put('/:id/suspend',protect, moderator, toggleSuspend);
router.delete('/:id',     protect, moderator, deleteUser);
router.post('/avatar',    protect, setFolder('avatars'), upload.single('avatar'), uploadAvatar);

module.exports = router;
