const Tour = require('./../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.eliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  // SENT RESPONSE
  res.status(200).json({
    requestedAt: req.requestTime,
    status: 'success',
    results: tours.length,
    data: { tours }
  });
});

exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgRating: 1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  // Extract the year parameter
  const yearParam = req.params.year;

  // Validate the year parameter
  // if (!yearParam || isNaN(yearParam) || !Number.isFinite(Number(yearParam))) {
  //   return res.status(400).json({
  //     status: 'fail',
  //     message: 'Invalid year parameter. Please provide a valid year.'
  //   });
  // }

  const year = parseInt(yearParam, 10);
  const nextYear = year + 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${nextYear}-01-01`) // Exclusive end
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' }, // Group by month
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' } // Push the entire document
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0 // Exclude the _id field from the output
      }
    },
    {
      $sort: { numTourStarts: -1 } // Sort by numTourStarts in ascending order
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: {
      plan
    }
  });
});
