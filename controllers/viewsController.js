const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get Tour Data From The Collection
  const tours = await Tour.find();
  // 2) Build Template
  // 3) Render That Template Using Pug
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get The Data, For The Requested Tour (Including Reviews)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'rating review user'
  });
  // 2) Build Template
  // 3) Render That Template Using Pug
  res.status(200).render('tour', {
    title: 'The Forest Hiker',
    tour
  });
});
