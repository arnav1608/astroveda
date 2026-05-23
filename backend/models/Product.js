const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  emoji:    { type: String, default: '✨' },
  category: {
    type: String, required: true,
    enum: ['gemstones', 'rudraksha', 'yantras', 'spiritual']
  },
  planet:   { type: String, default: '' },
  benefits: { type: String, default: '' },
  desc:     { type: String, required: true },
  detail:   { type: String, default: '' },
  price:    { type: Number, required: true, min: 0 },
  image:    { type: String, default: '' },
  inStock:  { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  order:    { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
