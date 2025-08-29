const crypto = require("crypto");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const { signToken } = require("../utils/token");
const { sendMail } = require("../utils/mailer");
const Event = require('../models/Event');

// helper to create hashed verification token
function createEmailToken() {
  const raw = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hashed };
}

const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    // Always return generic success to avoid email enumeration
    const generic = {
      msg: "If an account exists and is not verified, a new verification email will be sent shortly.",
    };

    if (!email || !/@gmail\.com$/i.test(email)) {
      return res.status(StatusCodes.OK).json(generic);
    }

    const user = await User.findOne({ email }).select(
      "+verificationToken +verificationExpires"
    );
    if (!user || user.isVerified) {
      return res.status(StatusCodes.OK).json(generic);
    }

    const { raw, hashed } = createEmailToken();
    user.verificationToken = hashed;
    user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const verifyUrl = `${
      process.env.API_URL || "http://localhost:5001"
    }/api/auth/verify-email?token=${raw}`;
    await sendMail({
      to: user.email,
      subject: "Your new verification link",
      html: `
        <div>
          <p>Hi ${user.name},</p>
          <p>Here is your new verification link. It expires in 24 hours:</p>
          <p><a href="${verifyUrl}">Verify my email</a></p>
        </div>
      `,
    });

    return res.status(StatusCodes.OK).json(generic);
  } catch (err) {
    return next(err);
  }
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // minimal validation; frontend validates more strictly
    if (!name || !email || !password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "name, email and password are required" });
    }

    // optional: only allow Gmail emails; enforce server-side too
    if (!/@gmail\.com$/i.test(email)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Only Gmail addresses are allowed" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ msg: "Email already in use" });
    }

    const { raw, hashed } = createEmailToken();
    const user = await User.create({
      name,
      email,
      password,
      isVerified: false,
      verificationToken: hashed,
      verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    });
    await Event.create({ type: 'signup', userId: user._id, ts: new Date() });
    // Verification link hits backend and then redirects to frontend welcome
    const verifyUrl = `${
      process.env.API_URL || 'https://edustack-vyc5.onrender.com'
    }/api/auth/verify-email?token=${raw}`;

    await sendMail({
      to: user.email,
      subject: "Verify your email",
      html: `
        <div>
          <p>Hi ${user.name},</p>
          <p>Thanks for registering at EduStack. Please verify your email by clicking the link below:</p>
          <p><a href="${verifyUrl}">Verify my email</a></p>
          <p>This link expires in 24 hours.</p>
        </div>
      `,
    });

    return res.status(StatusCodes.CREATED).json({
      msg: "Registered successfully. Please check your email to verify your account.",
    });
  } catch (err) {
    return next(err);
  }
};

// GET /api/auth/verify-email?token=...
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).send("Invalid verification request");

    const hashed = crypto
      .createHash("sha256")
      .update(String(token))
      .digest("hex");
    const user = await User.findOne({
      verificationToken: hashed,
      verificationExpires: { $gt: new Date() },
    });

    if (!user)
      return res
        .status(400)
        .send("Verification link is invalid or has expired");

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    // ✅ new: issue a JWT so the Welcome page can be authenticated
    const jwt = signToken(user._id.toString());

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    // NOTE: token in URL is fine for dev; in production, prefer setting an httpOnly cookie.
    return res.redirect(`${appUrl}/welcome?verified=1&token=${jwt}`);
  } catch (err) {
    return next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "Invalid credentials" });

    // Block login until verified
    if (!user.isVerified) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ msg: "Please verify your email before logging in." });
    }

    const ok = await user.comparePassword(password);
    if (!ok)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: "Invalid credentials" });

    const token = signToken(user._id.toString());
    await Event.create({ type: 'login', userId: user._id, ts: new Date() });
    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    return next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const generic = {
      msg: "If an account exists, a password reset link will be sent shortly.",
    };

    // Make the response generic even if email missing/invalid
    if (!email || !/@gmail\.com$/i.test(email)) {
      return res.status(StatusCodes.OK).json(generic);
    }

    const user = await User.findOne({ email }).select(
      "+passwordResetToken +passwordResetExpires"
    );
    if (!user) {
      return res.status(StatusCodes.OK).json(generic);
    }

    const { raw, hashed } = createEmailToken();
    user.passwordResetToken = hashed;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await user.save();

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${raw}`;

    await sendMail({
      to: user.email,
      subject: "Reset your password",
      html: `
        <div>
          <p>Hi ${user.name},</p>
          <p>You requested to reset your password. Click the link below (valid for 1 hour):</p>
          <p><a href="${resetUrl}">Reset my password</a></p>
          <p>If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    });

    return res.status(StatusCodes.OK).json(generic);
  } catch (err) {
    return next(err);
  }
};

/** POST /api/auth/reset-password
 * Body: { token, password }
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password || password.length < 8) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Invalid reset request" });
    }
    const hashed = crypto
      .createHash("sha256")
      .update(String(token))
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: new Date() },
    }).select("+password");

    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Reset link is invalid or has expired" });
    }

    // Set new password (pre-save hook will hash it)
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // (Option A) Don’t auto-login. Ask user to login.
    return res.json({
      msg: "Password has been reset. You can now login with your new password.",
    });

    // (Option B) Auto-issue JWT here if you prefer:
    // const jwt = signToken(user._id.toString());
    // return res.json({ msg: 'Password reset', token: jwt });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  resendVerification,
  forgotPassword,
  resetPassword,
};
