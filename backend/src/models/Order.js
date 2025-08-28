const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  courseSlug: { type: String, index: true, required: true },

  amount: { type: Number, required: true, min: 0 }, // cents for Stripe, but we’ll keep dollars for dev simplicity
  currency: { type: String, default: process.env.CURRENCY || 'USD' },

  provider: { type: String, enum: ['dev', 'stripe'], default: 'dev' },
  status: { type: String, enum: ['created', 'paid', 'failed', 'refunded', 'canceled'], default: 'created', index: true },

  // Stripe fields
  stripePaymentIntentId: { type: String },
  stripeReceiptUrl: { type: String },
}, { timestamps: true });

orderSchema.index({ userId: 1, courseSlug: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);
