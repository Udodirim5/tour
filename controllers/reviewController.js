const Review = require('./../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const review = await Review.find();

  // SENT RESPONSE
  res.status(200).json({
    requestedAt: req.requestTime,
    status: 'success',
    results: review.length,
    data: { review }
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { review }
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  // Allow nested routes
  // if (req.params.tourId) {
  //   req.body.tour = req.params.tourId;
  // }
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  // Create a new review
  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'created',
    data: { review: newReview }
  });
});
