const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // ✅ email verification
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    verificationExpires: { type: Date, select: false },
    profileCompleted: { type: Boolean, default: false },
    onboardingSkipped: { type: Boolean, default: false },
    profile: {
      bio: { type: String, default: "", maxlength: 500 },
      avatarUrl: { type: String, default: "" },
      location: { type: String, default: "", maxlength: 120 },
    },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function preSave(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
