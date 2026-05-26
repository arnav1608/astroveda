// ============================================
// AstroVeda – Seed Script
// Creates only the moderator user and achievement sections.
// Run: node seed.js
// ============================================
require('dotenv').config();
const mongoose  = require('mongoose');
const bcrypt    = require('bcryptjs');
const User        = require('./models/User');
const Achievement = require('./models/Achievement');
const Announcement = require('./models/Announcement');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // ── FIX 3: Clear ALL demo/default data ────────────────────────────────────
  console.log('Clearing demo data...');
  await Announcement.deleteMany({});
  await Achievement.deleteMany({});
  console.log('Demo data cleared.');

  // ── Create achievement section documents (empty — mod adds real ones) ───────
  const sections = ['awards', 'certificates', 'medals', 'photos'];
  for (const section of sections) {
    const exists = await Achievement.findOne({ section });
    if (!exists) {
      await Achievement.create({ section, items: [] });
      console.log(`Created empty achievement section: ${section}`);
    }
  }

  // ── Create moderator user ─────────────────────────────────────────────────
  const modExists = await User.findOne({ username: 'admin' });
  if (!modExists) {
    const hash = await bcrypt.hash(process.env.MOD_PASSWORD || 'astroveda2024', 10);
    await User.create({
      name:     'Dr. Rajesh R Shastrijee',
      username: 'admin',
      mobile:   process.env.WHATSAPP_NUMBER || '8863038229',
      password: hash,
      role:     'moderator',
    });
    console.log('Moderator user created: admin / astroveda2024');
  } else {
    console.log('Moderator user already exists.');
  }

  console.log('Seed complete. Database is clean and ready for production.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
