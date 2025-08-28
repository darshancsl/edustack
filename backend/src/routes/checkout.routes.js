const router = require('express').Router();
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const { devPurchase, createStripeIntent } = require('../controllers/checkout.controller');

const limiter = rateLimit({ windowMs: 60 * 1000, max: 50, standardHeaders: true, legacyHeaders: false });

router.post('/dev/purchase', auth, limiter, devPurchase);
router.post('/stripe/create-intent', auth, limiter, createStripeIntent);

module.exports = router;
