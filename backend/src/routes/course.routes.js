const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const {
  listCourses,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
  duplicateCourse,
} = require("../controllers/course.controller");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

const courseListLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/", courseListLimiter, listCourses);
router.get("/:slug", courseListLimiter, getCourseBySlug);

// Admin secured
router.post("/", auth, isAdmin, adminLimiter, createCourse);
router.put("/:slug", auth, isAdmin, adminLimiter, updateCourse);
router.delete("/:slug", auth, isAdmin, adminLimiter, deleteCourse);
router.post("/:slug/duplicate", auth, isAdmin, adminLimiter, duplicateCourse);

module.exports = router;
