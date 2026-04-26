const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['Summary', 'Exam', 'Homework', 'Other'], default: 'Summary' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Material', materialSchema);
