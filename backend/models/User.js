const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String, required: [true, 'Name is required'], trim: true, maxlength: [80, 'Name too long']
  },
  username: {
    type: String, required: true, unique: true, lowercase: true, trim: true,
    match: [/^[a-z0-9_]+$/, 'Username can only have letters, numbers, underscores']
  },
  mobile: {
    type: String, required: [true, 'Mobile number is required'], unique: true,
    match: [/^\d{10}$/, 'Enter valid 10-digit mobile number']
  },
  password: {
    type: String, required: [true, 'Password is required'], minlength: 6, select: false
  },
  role: {
    type: String, enum: ['user', 'moderator'], default: 'user'
  },
  bio:        { type: String, default: '', maxlength: 300 },
  location:   { type: String, default: '' },
  age:        { type: Number, min: 1, max: 120 },
  interests:  [{ type: String }],
  avatar:     { type: String, default: '' },
  coverPhoto: { type: String, default: '' },
  suspended:  { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
UserSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', UserSchema);
