const Product = require('../models/Product');

// @route  GET /api/products  (public)
exports.getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};
    if (category && category !== 'all') query.category = category;
    if (search) query.$or = [
      { name: new RegExp(search, 'i') },
      { desc: new RegExp(search, 'i') },
      { planet: new RegExp(search, 'i') },
      { benefits: new RegExp(search, 'i') }
    ];
    const products = await Product.find(query).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/products/:id  (public)
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/products  (mod only)
exports.createProduct = async (req, res) => {
  try {
    const image = req.file ? `/uploads/products/${req.file.filename}` : '';
    const product = await Product.create({ ...req.body, image });
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/products/:id  (mod only)
exports.updateProduct = async (req, res) => {
  try {
    const update = { ...req.body };
    if (req.file) update.image = `/uploads/products/${req.file.filename}`;
    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/products/:id  (mod only)
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/products/seed  (mod only — seed default products)
exports.seedProducts = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    if (count > 0) return res.json({ success: true, message: `Products already seeded (${count} exist).` });

    const defaults = require('../utils/defaultProducts');
    await Product.insertMany(defaults);
    res.json({ success: true, message: `${defaults.length} products seeded.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
