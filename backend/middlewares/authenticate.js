const catchAsyncError = require("./catchAsyncError");
const ErrorHandler = require('../utils/errorHandler');
const User = require('../models/userModels');
const jwt = require('jsonwebtoken');

exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
  // Check if token is present in Authorization header
  const { authorization } = req.headers;

  // If no token is found in the header
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new ErrorHandler('Login first to handle this resource', 401));
  }

  // Get the token from the Authorization header
  const token = authorization.split(' ')[1]; // 'Bearer <token>'

  // Verify the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Attach the user to the request object
  req.user = await User.findById(decoded.id);

  next();
});

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler(`Role ${req.user.role} is not allowed`, 401));
    }
    next();
  };
};


