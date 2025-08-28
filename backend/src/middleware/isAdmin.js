module.exports = function isAdmin(req, res, next) {
  // requires auth middleware to have set req.user
  if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
  if (req.user.role !== "admin")
    return res.status(403).json({ msg: "Admin access required" });
  return next();
};
