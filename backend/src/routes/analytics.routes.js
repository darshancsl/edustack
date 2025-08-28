const router = require('express').Router();
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const rateLimit = require('express-rate-limit');
const { summary, timeseries, topCourses, recentOrders } = require('../controllers/analytics.controller');

const limiter = rateLimit({ windowMs: 30 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });

router.get('/summary', auth, isAdmin, limiter, summary);
router.get('/timeseries', auth, isAdmin, limiter, timeseries);
router.get('/top-courses', auth, isAdmin, limiter, topCourses);
router.get('/recent-orders', auth, isAdmin, limiter, recentOrders);

module.exports = router;
