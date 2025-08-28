const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // stable id for client
    title: { type: String, required: true },
    duration: { type: String }, // e.g., "12m"
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    items: { type: [lessonSchema], default: [] },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    subtitle: { type: String, trim: true, maxlength: 500 },
    category: {
      type: String,
      enum: ["category-1", "category-2", "category-3"],
      default: "category-1",
      index: true,
    },
    accessPeriod: {
      type: String,
      enum: ['lifetime', '30d', '90d', '180d', '365d'],
      default: 'lifetime',
      index: true,
    },
    heroImage: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"] },
    language: { type: String, default: "English" },
    lastUpdated: { type: Date },
    description: { type: String, required: true },
    whatYouWillLearn: { type: [String], default: [] },
    toc: { type: [sectionSchema], default: [] },
    // future: category, tags, author, duration, rating, enrollments, etc.
  },
  { timestamps: true }
);

// Useful indexes
courseSchema.index({ slug: 1 }, { unique: true });
courseSchema.index({ title: "text", subtitle: "text", description: "text" });

module.exports = mongoose.model("Course", courseSchema);
