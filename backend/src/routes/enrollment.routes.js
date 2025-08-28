const router = require('express').Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const rateLimit = require('express-rate-limit');
const { listMyEnrollments, grantEnrollment, updateProgress, ownsCourse } = require('../controllers/enrollment.controller');

const meLimiter = rateLimit({ windowMs: 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
const adminLimiter = rateLimit({ windowMs: 5 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });

router.get('/me', auth, meLimiter, listMyEnrollments);
router.post('/grant', auth, isAdmin, adminLimiter, grantEnrollment);
router.patch('/:slug/progress', auth, meLimiter, updateProgress);
router.get('/:slug/owned', auth, meLimiter, ownsCourse);

module.exports = router;
