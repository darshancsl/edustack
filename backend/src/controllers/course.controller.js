const { StatusCodes } = require("http-status-codes");
const Course = require("../models/Course");
const Joi = require("joi");
const {
  createCourseSchema,
  updateCourseSchema,
} = require("../validation/course.schema");

// Whitelist the fields we expose publicly
const PUBLIC_PROJECTION = {
  _id: 0,
  slug: 1,
  title: 1,
  subtitle: 1,
  heroImage: 1,
  price: 1,
  salePrice: 1,
  level: 1,
  language: 1,
  lastUpdated: 1,
  accessPeriod: 1,
  description: 1,
  whatYouWillLearn: 1,
  toc: 1,
  createdAt: 1,
  updatedAt: 1,
};

// GET /api/courses
// Query params: ?q=&level=&page=1&limit=12
const listCourses = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 12, 1),
      50
    );
    const skip = (page - 1) * limit;

    const q = (req.query.q || "").trim();
    const level = (req.query.level || "").trim();
    const category = (req.query.category || "").trim(); // NEW

    // sort
    const sortBy = req.query.sortBy || "updatedAt"; // 'updatedAt' | 'category' | 'price'
    const order = req.query.order || "desc"; // 'asc' | 'desc'
    const sort = {};
    if (["updatedAt", "category", "price"].includes(sortBy)) {
      sort[sortBy] = order === "asc" ? 1 : -1;
    } else {
      sort["updatedAt"] = -1;
    }

    const filter = {};
    if (q) {
      filter.$or = [
        { $text: { $search: q } },
        { title: { $regex: q, $options: "i" } },
        { subtitle: { $regex: q, $options: "i" } },
      ];
    }
    if (level && ["Beginner", "Intermediate", "Advanced"].includes(level)) {
      filter.level = level;
    }
    if (
      category &&
      ["category-1", "category-2", "category-3"].includes(category)
    ) {
      filter.category = category;
    }

    const [items, total] = await Promise.all([
      Course.find(filter, PUBLIC_PROJECTION)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(filter),
    ]);

    return res.json({ page, limit, total, items });
  } catch (err) {
    return next(err);
  }
};

// GET /api/courses/:slug
const getCourseBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const course = await Course.findOne({ slug }, PUBLIC_PROJECTION).lean();
    if (!course)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "Course not found" });
    return res.json(course);
  } catch (err) {
    return next(err);
  }
};

// POST /api/courses  (admin)
const createCourse = async (req, res, next) => {
  try {
    const payload = await createCourseSchema.validateAsync(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    // Prevent salePrice > price
    if (payload.salePrice && payload.salePrice >= payload.price) {
      return res.status(400).json({ msg: "salePrice must be less than price" });
    }

    const exists = await Course.findOne({ slug: payload.slug }).lean();
    if (exists) return res.status(409).json({ msg: "Slug already exists" });

    const created = await Course.create(payload);
    return res.status(201).json({ msg: "Course created", slug: created.slug });
  } catch (err) {
    if (err instanceof Joi.ValidationError) {
      return res.status(400).json({
        msg: "Validation failed",
        details: err.details.map((d) => d.message),
      });
    }
    return next(err);
  }
};

// PUT /api/courses/:slug  (admin)
const updateCourse = async (req, res, next) => {
  try {
    const payload = await updateCourseSchema.validateAsync(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (
      payload.salePrice &&
      payload.price &&
      payload.salePrice >= payload.price
    ) {
      return res.status(400).json({ msg: "salePrice must be less than price" });
    }

    // If slug changing, ensure unique
    const querySlug = req.params.slug;
    if (payload.slug && payload.slug !== querySlug) {
      const inUse = await Course.findOne({ slug: payload.slug }).lean();
      if (inUse)
        return res.status(409).json({ msg: "New slug already in use" });
    }

    const updated = await Course.findOneAndUpdate(
      { slug: querySlug },
      { $set: payload },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ msg: "Course not found" });

    return res.json({ msg: "Course updated", slug: updated.slug });
  } catch (err) {
    if (err instanceof Joi.ValidationError) {
      return res.status(400).json({
        msg: "Validation failed",
        details: err.details.map((d) => d.message),
      });
    }
    return next(err);
  }
};

const duplicateCourse = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const src = await Course.findOne({ slug }).lean();
    if (!src)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "Course not found" });

    // Generate a unique new slug
    const base = `${src.slug}-copy`;
    let candidate = base;
    let n = 1;
    // Ensure not colliding
    while (await Course.findOne({ slug: candidate }).lean()) {
      candidate = `${base}-${n++}`;
    }

    const copy = {
      ...src,
      _id: undefined,
      slug: candidate,
      title: `${src.title} (Copy)`,
      createdAt: undefined,
      updatedAt: undefined,
      lastUpdated: new Date(), // optional: now
    };

    const created = await Course.create(copy);
    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "Course duplicated", slug: created.slug });
  } catch (err) {
    return next(err);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const result = await Course.deleteOne({ slug });
    if (result.deletedCount === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ msg: "Course not found" });
    }
    return res.json({ msg: "Course deleted" });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  listCourses,
  getCourseBySlug,
  createCourse,
  updateCourse,
  duplicateCourse,
  deleteCourse,
};
