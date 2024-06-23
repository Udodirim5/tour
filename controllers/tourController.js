const Tour = require('./../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.eliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
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

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  // Validate latitude and longitude
  if (!lat || !lng || Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) {
    return next(
      new AppError(
        'Please provide valid latitude and longitude in the format lat,lng',
        400
      )
    );
  }

  // Validate distance
  if (Number.isNaN(Number(distance))) {
    return next(new AppError('Please provide a valid distance', 400));
  }

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[Number(lng), Number(lat)], radius] }
    }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  // Validate latitude and longitude
  if (!lat || !lng || Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) {
    return next(
      new AppError(
        'Please provide valid latitude and longitude in the format lat,lng',
        400
      )
    );
  }

  // Calculate the multiplier based on the unit
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001; // meters to miles or kilometers

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [Number(lng), Number(lat)]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier, // Convert distance to the desired unit
        spherical: true
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});
