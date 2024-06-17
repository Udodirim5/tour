const Review = require('./../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const review = await Review.find();

  // SENT RESPONSE
  res.status(200).json({
    requestedAt: req.requestTime,
    status: 'success',
    results: review.length,
    data: { review }
  });
});
exports.setTourUserId = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
