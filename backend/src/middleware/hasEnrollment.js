const Enrollment = require('../models/Enrollment');
const { isExpired } = require('../utils/access');

module.exports = async function hasEnrollment(req, res, next) {
  const userId = req.user?._id;
  const slug = req.params.slug || req.body.courseSlug;
  if (!userId || !slug) return res.status(400).json({ msg: 'Missing user or course slug' });
  const enr = await Enrollment.findOne({ userId, courseSlug: slug }).lean();
  if (!enr || isExpired(enr)) return res.status(403).json({ msg: 'No active access' });
  req.enrollment = enr;
  return next();
};
