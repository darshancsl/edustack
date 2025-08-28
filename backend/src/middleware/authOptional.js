const auth = require('./auth');
module.exports = async (req, res, next) => {
  const authz = req.headers.authorization;
  if (!authz) return next();
  return auth(req, res, next); // reuse your auth to populate req.user
};
