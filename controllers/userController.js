const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');

// THIS IS WHERE THE FUNCTION FOR CRUD OPERATIONS ARE DEFINED FOR THE USER TABLE
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // SENT RESPONSE
  res.status(200).json({
    requestedAt: req.requestTime,
    status: 'success',
    results: users.length,
    data: { users }
  });
});
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined'
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined'
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined'
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined'
  });
};
