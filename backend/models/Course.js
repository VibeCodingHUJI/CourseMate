const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: { type: String },
  credits: { type: Number, default: 0 },
  instructor: { type: String },
  ta: { type: String },
  averageRating: { type: Number, default: 0 },
  averageDifficulty: { type: Number, default: 0 },
});

module.exports = mongoose.model('Course', courseSchema);
