const Event = require('../models/Event');

const track = async (req, res, next) => {
  try {
    const { type, anonId, sessionId, path, referrer, courseSlug, amount, currency } = req.body || {};
    if (!type) return res.status(400).json({ msg: 'type is required' });

    await Event.create({
      type,
      anonId,
      sessionId,
      path,
      referrer,
      courseSlug,
      amount,
      currency,
      userAgent: req.headers['user-agent'],
      userId: req.user?._id, // if authenticated, we store it
      ts: new Date(),
    });

    // small response to make sendBeacon happy
    return res.json({ ok: true });
  } catch (e) { return next(e); }
};
module.exports = { track };
