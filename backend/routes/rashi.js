const express = require('express');
const router = express.Router();
const { getActive, getAll, create, update, remove } = require('../controllers/rashiController');
const { protect, moderator } = require('../middleware/auth');

router.get('/active', getActive);
router.get('/',       protect, moderator, getAll);
router.post('/',      protect, moderator, create);
router.put('/:id',    protect, moderator, update);
router.delete('/:id', protect, moderator, remove);

module.exports = router;
