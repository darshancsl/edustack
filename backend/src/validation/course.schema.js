const Joi = require("joi");

const lesson = Joi.object({
  id: Joi.string().trim().required(),
  title: Joi.string().trim().required(),
  duration: Joi.string().trim().optional(),
});

const section = Joi.object({
  id: Joi.string().trim().required(),
  title: Joi.string().trim().required(),
  items: Joi.array().items(lesson).default([]),
});

const baseCourse = Joi.object({
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9-]+$/)
    .required(),
  title: Joi.string().trim().max(200).required(),
  subtitle: Joi.string().trim().max(500).allow(""),
  heroImage: Joi.string().uri().allow(""),
  price: Joi.number().min(0).required(),
  salePrice: Joi.number().min(0).optional(),
  level: Joi.string().valid("Beginner", "Intermediate", "Advanced").optional(),
  language: Joi.string().trim().default("English"),
  lastUpdated: Joi.date().optional(),
  description: Joi.string().trim().required(),
  category: Joi.string().valid('category-1','category-2','category-3').default('category-1'),
  accessPeriod: Joi.string()
    .valid('lifetime','30d','90d','180d','365d')
    .default('lifetime'),
  whatYouWillLearn: Joi.array().items(Joi.string().trim()).default([]),
  toc: Joi.array().items(section).default([]),
});

const createCourseSchema = baseCourse;
const updateCourseSchema = baseCourse.fork(
  ["slug", "title", "price", "description"],
  (schema) => schema.optional()
);

module.exports = { createCourseSchema, updateCourseSchema };
