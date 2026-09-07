const mongoose = require('mongoose');

const FaqSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true, maxlength: 300 },
  answer: { type: String, required: true, trim: true, maxlength: 5000 },
  keywords: [{ type: String, trim: true, maxlength: 100 }],
  category: { type: String, trim: true, default: 'general', maxlength: 60 },
  isActive: { type: Boolean, default: true, index: true },
  priority: { type: Number, default: 0, min: 0, max: 100 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

FaqSchema.index({ isActive: 1, priority: -1, updatedAt: -1 });

module.exports = mongoose.model('Faq', FaqSchema);
