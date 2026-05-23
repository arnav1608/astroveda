// Run: node seed.js
// Seeds default products into MongoDB

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const defaultProducts = require('./utils/defaultProducts');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✦ Connected to MongoDB');

    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`⚠  ${count} products already exist. Skipping seed.`);
      console.log('   To reseed, run: node seed.js --force');
      if (!process.argv.includes('--force')) { process.exit(0); }
      await Product.deleteMany({});
      console.log('✓ Cleared existing products.');
    }

    await Product.insertMany(defaultProducts);
    console.log(`✓ Seeded ${defaultProducts.length} products successfully.`);
    process.exit(0);
  } catch (err) {
    console.error('✗ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
