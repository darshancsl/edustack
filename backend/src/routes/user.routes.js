const router = require("express").Router();
const auth = require("../middleware/auth");
const rateLimit = require("express-rate-limit");
const { me } = require("../controllers/user.controller"); // existing
const {
  getProfileStatus,
  updateProfile,
  markProfileComplete,
  skipOnboarding,
} = require("../controllers/user.controller");

const profileLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/me", auth, me);
router.get("/profile-status", auth, profileLimiter, getProfileStatus);
router.put("/profile", auth, profileLimiter, updateProfile);
router.post("/complete-profile", auth, profileLimiter, markProfileComplete);
router.post("/skip-onboarding", auth, profileLimiter, skipOnboarding);

module.exports = router;
