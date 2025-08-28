const router = require("express").Router();
const {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

const resendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per IP/hour
  standardHeaders: true,
  legacyHeaders: false,
  // rate-limit per IP+email to be safer
  keyGenerator: (req, _res) =>
    `${req.ip}:${(req.body?.email || "").toLowerCase()}`,
});

const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1h window
  max: 15, // 5 attempts / IP+email / hour
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, _res) =>
    `${req.ip}:${(req.body?.email || "").toLowerCase()}`,
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/verify-email", verifyLimiter, verifyEmail);
router.post("/resend-verification", resendLimiter, resendVerification);
router.post("/forgot-password", forgotLimiter, forgotPassword);
router.post(
  "/reset-password",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }),
  resetPassword
);

module.exports = router;
