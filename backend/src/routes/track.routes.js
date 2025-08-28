const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { track } = require('../controllers/track.controller');
const authOptional = require('../middleware/authOptional'); // middleware that sets req.user if token present, else continues

const limiter = rateLimit({ windowMs: 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
router.post('/', authOptional, limiter, track);
module.exports = router;
