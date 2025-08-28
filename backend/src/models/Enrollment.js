const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    courseSlug: { type: String, index: true, required: true },

    // access windows
    purchasedAt: { type: Date, default: () => new Date() },
    expiresAt: { type: Date }, // null/undefined = lifetime

    // learning metadata (extend later)
    progressPct: { type: Number, min: 0, max: 100, default: 0 },
    lastLessonId: { type: String }, // maps to Course.toc[].items[].id

    // pricing snapshot (optional, handy for receipts)
    pricePaid: { type: Number, min: 0 },
    currency: { type: String, default: 'USD' },
  },
  { timestamps: true }
);

// one enrollment per (user, course)
enrollmentSchema.index({ userId: 1, courseSlug: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
