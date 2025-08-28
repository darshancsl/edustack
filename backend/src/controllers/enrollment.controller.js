const { StatusCodes } = require('http-status-codes');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { computeExpiresAt, isExpired } = require('../utils/access');

// GET /api/enrollments/me
const listMyEnrollments = async (req, res, next) => {
  try {
    const uid = req.user._id;
    const enrollments = await Enrollment.find({ userId: uid }).sort({ updatedAt: -1 }).lean();

    // join with minimal course info in one go
    const slugs = [...new Set(enrollments.map(e => e.courseSlug))];
    const courses = await Course.find({ slug: { $in: slugs } }, {
      _id: 0, slug: 1, title: 1, subtitle: 1, heroImage: 1, accessPeriod: 1, price: 1, salePrice: 1
    }).lean();
    const bySlug = Object.fromEntries(courses.map(c => [c.slug, c]));

    const items = enrollments.map(e => {
      const c = bySlug[e.courseSlug];
      return {
        course: c,
        progressPct: e.progressPct,
        lastLessonId: e.lastLessonId,
        purchasedAt: e.purchasedAt,
        expiresAt: e.expiresAt,
        expired: isExpired(e),
      };
    });

    return res.json({ items });
  } catch (err) { return next(err); }
};

// POST /api/enrollments/grant (admin/dev) { userId, courseSlug }
const grantEnrollment = async (req, res, next) => {
  try {
    const { userId, courseSlug } = req.body;
    if (!userId || !courseSlug) return res.status(400).json({ msg: 'userId and courseSlug are required' });

    const course = await Course.findOne({ slug: courseSlug }).lean();
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    const purchasedAt = new Date();
    const expiresAt = computeExpiresAt(course.accessPeriod, purchasedAt);

    const doc = await Enrollment.findOneAndUpdate(
      { userId, courseSlug },
      { $setOnInsert: { userId, courseSlug, purchasedAt, expiresAt } },
      { upsert: true, new: true }
    ).lean();

    return res.status(StatusCodes.CREATED).json({ msg: 'Enrollment granted', courseSlug, userId, expiresAt });
  } catch (err) { return next(err); }
};

// PATCH /api/enrollments/:slug/progress { progressPct, lastLessonId }
const updateProgress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { slug } = req.params;
    const { progressPct, lastLessonId } = req.body;

    const pct = Math.max(0, Math.min(100, Number(progressPct ?? 0)));
    const upd = await Enrollment.findOneAndUpdate(
      { userId, courseSlug: slug },
      { $set: { progressPct: pct, lastLessonId } },
      { new: true }
    ).lean();

    if (!upd) return res.status(404).json({ msg: 'Enrollment not found' });
    return res.json({ msg: 'Progress updated', progressPct: upd.progressPct, lastLessonId: upd.lastLessonId });
  } catch (err) { return next(err); }
};

const ownsCourse = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { slug } = req.params;
    const enr = await Enrollment.findOne({ userId, courseSlug: slug }).lean();
    return res.json({ owned: !!(enr && !isExpired(enr)) });
  } catch (e) { return next(e); }
};

module.exports = { listMyEnrollments, grantEnrollment, updateProgress, ownsCourse };
