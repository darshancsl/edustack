const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");

// GET /api/users/me
const me = async (req, res) => {
  // req.user is set by auth middleware
  return res.json({ user: req.user });
};

// GET /api/users/profile-status
const getProfileStatus = async (req, res, next) => {
  try {
    const u = await User.findById(req.user.id).select(
      "profileCompleted onboardingSkipped profile name email"
    );
    return res.json({
      profileCompleted: u.profileCompleted,
      onboardingSkipped: u.onboardingSkipped,
      profile: u.profile,
      name: req.user.name,
      email: req.user.email,
    });
  } catch (e) {
    return next(e);
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    // whitelist fields
    const allowed = [
      "name",
      "profile.bio",
      "profile.avatarUrl",
      "profile.location",
    ];
    const body = req.body || {};

    // Build $set safely
    const $set = {};
    if (typeof body.name === "string") $set.name = body.name.trim();
    if (body.profile && typeof body.profile === "object") {
      if (typeof body.profile.bio === "string")
        $set["profile.bio"] = body.profile.bio.trim();
      if (typeof body.profile.avatarUrl === "string")
        $set["profile.avatarUrl"] = body.profile.avatarUrl.trim();
      if (typeof body.profile.location === "string")
        $set["profile.location"] = body.profile.location.trim();
    }

    // Optionally, auto-complete when key fields exist
    if (
      $set["profile.bio"] ||
      $set["profile.avatarUrl"] ||
      $set["profile.location"] ||
      $set.name
    ) {
      // if user now has both name and some bio, mark completed
      const current = await User.findById(req.user.id).select("name profile");
      const nextName = $set.name ?? current.name;
      const nextBio = $set["profile.bio"] ?? current?.profile?.bio ?? "";
      if (nextName && nextBio && nextBio.length >= 10) {
        $set.profileCompleted = true;
        $set.onboardingSkipped = false; // they actually did it
      }
    }

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { $set },
      { new: true, runValidators: true, projection: { password: 0 } }
    );

    return res.json({
      msg: "Profile updated",
      profileCompleted: updated.profileCompleted,
      onboardingSkipped: updated.onboardingSkipped,
      profile: updated.profile,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      },
    });
  } catch (e) {
    return next(e);
  }
};

// POST /api/users/complete-profile
const markProfileComplete = async (req, res, next) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { profileCompleted: true, onboardingSkipped: false } },
      { new: true, projection: { password: 0 } }
    );
    return res.json({
      msg: "Profile marked complete",
      profileCompleted: updated.profileCompleted,
    });
  } catch (e) {
    return next(e);
  }
};

// POST /api/users/skip-onboarding
const skipOnboarding = async (req, res, next) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { onboardingSkipped: true } },
      { new: true, projection: { password: 0 } }
    );
    return res.json({
      msg: "Onboarding skipped",
      onboardingSkipped: updated.onboardingSkipped,
    });
  } catch (e) {
    return next(e);
  }
};

module.exports = {
  me,
  getProfileStatus,
  updateProfile,
  markProfileComplete,
  skipOnboarding,
};
