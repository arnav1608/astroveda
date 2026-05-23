const mongoose = require('mongoose');

const RashiSchema = new mongoose.Schema({
  month:     { type: String, required: true },   // e.g. "June 2025"
  updatedBy: { type: String, default: 'Dr. Rajesh R Shastrijee' },
  signs: {
    Mesh:      { career: String, love: String, health: String, remedy: String },
    Vrishabh:  { career: String, love: String, health: String, remedy: String },
    Mithun:    { career: String, love: String, health: String, remedy: String },
    Kark:      { career: String, love: String, health: String, remedy: String },
    Simha:     { career: String, love: String, health: String, remedy: String },
    Kanya:     { career: String, love: String, health: String, remedy: String },
    Tula:      { career: String, love: String, health: String, remedy: String },
    Vrishchik: { career: String, love: String, health: String, remedy: String },
    Dhanu:     { career: String, love: String, health: String, remedy: String },
    Makar:     { career: String, love: String, health: String, remedy: String },
    Kumbh:     { career: String, love: String, health: String, remedy: String },
    Meen:      { career: String, love: String, health: String, remedy: String },
  },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Rashi', RashiSchema);
