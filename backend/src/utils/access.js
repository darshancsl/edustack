const periodDays = (accessPeriod) => {
  switch (accessPeriod) {
    case '30d': return 30;
    case '90d': return 90;
    case '180d': return 180;
    case '365d': return 365;
    default: return null; // lifetime
  }
};

const computeExpiresAt = (accessPeriod, purchasedAt = new Date()) => {
  const days = periodDays(accessPeriod);
  if (!days) return undefined; // lifetime
  return new Date(purchasedAt.getTime() + days * 24 * 60 * 60 * 1000);
};

const isExpired = (enrollment) => {
  return !!(enrollment.expiresAt && enrollment.expiresAt <= new Date());
};

module.exports = { periodDays, computeExpiresAt, isExpired };
