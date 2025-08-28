const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  type: { type: String, required: true, index: true },       // 'page_view' | 'login' | 'purchase' | 'signup'
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  anonId: { type: String, index: true },                      // UUID from client before login
  sessionId: { type: String, index: true },                   // rotate per session
  path: { type: String },                                     // '/courses', '/courses/:slug'
  referrer: { type: String },
  userAgent: { type: String },
  courseSlug: { type: String, index: true },                  // for purchase/course events
  amount: { type: Number },                                   // numeric (USD)
  currency: { type: String, default: 'USD' },

  // timestamps
  ts: { type: Date, default: () => new Date(), index: true },
}, { timestamps: true });

eventSchema.index({ type: 1, ts: 1 });
eventSchema.index({ courseSlug: 1, ts: 1 });
eventSchema.index({ anonId: 1, ts: 1 });

module.exports = mongoose.model('Event', eventSchema);
