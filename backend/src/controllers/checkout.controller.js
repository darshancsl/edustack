const Order = require('../models/Order');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { computeExpiresAt } = require('../utils/access');
const Event = require('../models/Event');

const ENABLE_STRIPE = (process.env.ENABLE_STRIPE || 'false').toLowerCase() === 'true';
let stripe = null;
if (ENABLE_STRIPE) {
  stripe = require('stripe')(process.env.STRIPE_SECRET);
}

// Common helpers
async function getCourseOr404(slug, res) {
  const course = await Course.findOne({ slug }).lean();
  if (!course) {
    res.status(404).json({ msg: 'Course not found' });
    return null;
  }
  return course;
}

// --- DEV checkout (instant purchase) ---
// POST /api/checkout/dev/purchase { courseSlug }
const devPurchase = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { courseSlug } = req.body;
    const course = await getCourseOr404(courseSlug, res);
    if (!course) return;

    const amount = (course.salePrice ?? course.price) || 0;

    const order = await Order.create({
      userId, courseSlug, amount, provider: 'dev', status: 'paid'
    });

    // Grant enrollment
    const purchasedAt = new Date();
    const expiresAt = computeExpiresAt(course.accessPeriod, purchasedAt);
    await Enrollment.findOneAndUpdate(
      { userId, courseSlug },
      { $setOnInsert: { userId, courseSlug, purchasedAt, expiresAt, pricePaid: amount, currency: process.env.CURRENCY || 'USD' } },
      { upsert: true, new: true }
    );
    await Event.create({
      type: 'purchase',
      userId,
      courseSlug,
      amount, currency: process.env.CURRENCY || 'USD',
      ts: new Date()
    });

    return res.status(201).json({ msg: 'Enrolled successfully (dev)', orderId: order._id, courseSlug });
  } catch (err) {
    return next(err);
  }
};

// --- Stripe: create PaymentIntent ---
// POST /api/checkout/stripe/create-intent { courseSlug }
const createStripeIntent = async (req, res, next) => {
  try {
    if (!ENABLE_STRIPE) return res.status(400).json({ msg: 'Stripe disabled in this environment' });

    const userId = req.user._id;
    const { courseSlug } = req.body;
    const course = await getCourseOr404(courseSlug, res);
    if (!course) return;

    const amount = Math.round(((course.salePrice ?? course.price) || 0) * 100); // cents

    const pi = await stripe.paymentIntents.create({
      amount,
      currency: process.env.CURRENCY?.toLowerCase() || 'usd',
      metadata: { userId: String(userId), courseSlug },
      automatic_payment_methods: { enabled: true },
    });

    // Track order in 'created' state
    const order = await Order.create({
      userId,
      courseSlug,
      amount: amount / 100,
      currency: process.env.CURRENCY || 'USD',
      provider: 'stripe',
      status: 'created',
      stripePaymentIntentId: pi.id,
    });

    return res.status(201).json({ clientSecret: pi.client_secret, orderId: order._id });
  } catch (err) {
    return next(err);
  }
};

// --- Stripe webhook: payment succeeded → grant enrollment ---
// POST /api/webhooks/stripe
const handleStripeWebhook = async (req, res) => {
  if (!ENABLE_STRIPE) return res.status(400).end();
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    const userId = pi.metadata?.userId;
    const courseSlug = pi.metadata?.courseSlug;

    if (userId && courseSlug) {
      const order = await Order.findOneAndUpdate(
        { stripePaymentIntentId: pi.id },
        { $set: { status: 'paid', stripeReceiptUrl: pi.charges?.data?.[0]?.receipt_url } },
        { new: true }
      );

      const course = await Course.findOne({ slug: courseSlug }).lean();
      if (course) {
        const purchasedAt = new Date();
        const expiresAt = computeExpiresAt(course.accessPeriod, purchasedAt);
        await Enrollment.findOneAndUpdate(
          { userId, courseSlug },
          { $setOnInsert: { userId, courseSlug, purchasedAt, expiresAt, pricePaid: order.amount, currency: order.currency } },
          { upsert: true, new: true }
        );
      }
      await Event.create({
        type: 'purchase',
        userId,
        courseSlug,
        amount,
        currency: process.env.CURRENCY || 'USD',
        ts: new Date()
      });
    }
  }

  res.json({ received: true });
};

module.exports = { devPurchase, createStripeIntent, handleStripeWebhook };
