const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

// 1) GLOBAL MIDDLEWARES
// Set security HTTP header
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limiting the request from one IP per hour
const limiter = rateLimit({
  max: 500, // TODO: Adjust the value to meet the requirement of the specific application
  timeWindowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour'
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10kb' })); // TODO: Adjust the value to meet the requirement of the specific application

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS attacks
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price'
      //,
      // 'priceDiscount',
      // 'summary',
      // 'description',
      // 'imageCover',
      // 'images',
      // 'createdAt',
      // 'updatedAt',
      // 'startDates',
      // 'startLocation',
      // 'startLocation.type',
      // 'startLocation.coordinates',
      // 'startLocation.address',
      // 'startLocation.description',
      // 'locations',
      // 'locations.type',
      // 'locations.coordinates',
      // 'locations.address',
      // 'locations.description',
      // 'locations.day'
    ]
  })
);

// Serving static file
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3)  ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// 4)  ERROR HANDLER
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
