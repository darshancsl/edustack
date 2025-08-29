require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { connectDB } = require("./config/db");
const { notFound, errorHandler } = require("./middleware/error");
const routes = require("./routes"); // ✅ this must be a Router (function)
const checkoutController = require('./controllers/checkout.controller');

const app = express();

app.use(helmet());

const allowedOrigins = [process.env.CORS_ORIGIN, "https://edustack-dl.netlify.app/"];

app.use(
  cors({
    origin(origin, cb) {
      // allow non-browser tools (no origin) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), checkoutController.handleStripeWebhook);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
  });
})();
