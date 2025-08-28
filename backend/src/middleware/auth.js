const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'No token, authorization denied' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Token is not valid' });
    }
    return next();
  } catch (err) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;
