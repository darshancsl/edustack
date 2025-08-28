const { startOfDay, subDays } = require('date-fns');
const Event = require('../models/Event');
const Order = require('../models/Order');

const parseRange = (req) => {
  const days = Math.min(Math.max(parseInt(req.query.days || '30', 10), 1), 365);
  const to = new Date();
  const from = subDays(startOfDay(to), days - 1); // include today
  return { from, to, days };
};

// GET /api/analytics/summary?days=30
const summary = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req);

    const [visits, logins, signups, purchasesAgg, revenueAgg, dauAgg] = await Promise.all([
      Event.countDocuments({ type: 'page_view', ts: { $gte: from, $lte: to } }),
      Event.countDocuments({ type: 'login', ts: { $gte: from, $lte: to } }),
      Event.countDocuments({ type: 'signup', ts: { $gte: from, $lte: to } }),
      Event.countDocuments({ type: 'purchase', ts: { $gte: from, $lte: to } }),
      Event.aggregate([
        { $match: { type: 'purchase', ts: { $gte: from, $lte: to } } },
        { $group: { _id: null, sum: { $sum: '$amount' } } },
      ]),
      Event.aggregate([
        { $match: { type: 'login', ts: { $gte: from, $lte: to } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$ts' } }, users: { $addToSet: '$userId' } } },
        { $project: { _id: 1, count: { $size: '$users' } } },
      ]),
    ]);

    const revenue = revenueAgg[0]?.sum || 0;
    const dau = dauAgg.reduce((acc, d) => acc + d.count, 0) / Math.max(dauAgg.length, 1);

    return res.json({ visits, logins, signups, purchases: purchasesAgg, revenue, dau });
  } catch (e) { return next(e); }
};

// GET /api/analytics/timeseries?metric=visits|logins|purchases|revenue&days=30
const timeseries = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req);
    const metric = (req.query.metric || 'visits');

    const map = {
      visits: { match: { type: 'page_view' }, project: { val: { $literal: 1 } } },
      logins: { match: { type: 'login' }, project: { val: { $literal: 1 } } },
      purchases: { match: { type: 'purchase' }, project: { val: { $literal: 1 } } },
      revenue: { match: { type: 'purchase' }, project: { val: '$amount' } },
    };
    const cfg = map[metric] || map.visits;

    const rows = await Event.aggregate([
      { $match: { ...cfg.match, ts: { $gte: from, $lte: to } } },
      { $project: { day: { $dateToString: { format: '%Y-%m-%d', date: '$ts' } }, val: cfg.project.val } },
      { $group: { _id: '$day', sum: { $sum: '$val' } } },
      { $sort: { _id: 1 } },
    ]);

    return res.json({ items: rows.map(r => ({ day: r._id, value: r.sum })) });
  } catch (e) { return next(e); }
};

// GET /api/analytics/top-courses?days=30&limit=5
const topCourses = async (req, res, next) => {
  try {
    const { from, to } = parseRange(req);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '5', 10), 1), 20);

    const rows = await Event.aggregate([
      { $match: { type: 'purchase', ts: { $gte: from, $lte: to } } },
      { $group: { _id: '$courseSlug', revenue: { $sum: '$amount' }, sales: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
      { $limit: limit },
    ]);

    return res.json({ items: rows.map(r => ({ courseSlug: r._id, revenue: r.revenue, sales: r.sales })) });
  } catch (e) { return next(e); }
};

// GET /api/analytics/recent-orders?limit=10
const recentOrders = async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
    const orders = await Order.find({ status: 'paid' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('_id courseSlug amount currency userId createdAt')
      .lean();
    return res.json({ items: orders });
  } catch (e) { return next(e); }
};

module.exports = { summary, timeseries, topCourses, recentOrders };
