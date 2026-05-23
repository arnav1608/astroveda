const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, seedProducts } = require('../controllers/productController');
const { protect, moderator } = require('../middleware/auth');
const { upload, setFolder } = require('../middleware/upload');

router.get('/',         getProducts);
router.get('/:id',      getProduct);
router.post('/',        protect, moderator, setFolder('products'), upload.single('image'), createProduct);
router.put('/:id',      protect, moderator, setFolder('products'), upload.single('image'), updateProduct);
router.delete('/:id',   protect, moderator, deleteProduct);
router.post('/seed',    protect, moderator, seedProducts);

module.exports = router;
