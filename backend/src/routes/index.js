const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/users", require("./user.routes"));
router.use("/courses", require("./course.routes"));
router.use('/enrollments', require('./enrollment.routes'));
router.use('/checkout', require('./checkout.routes'));
router.use('/track', require('./track.routes'));
router.use('/analytics', require('./analytics.routes'));

module.exports = router;
