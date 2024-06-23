const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [100, 'tour name must not exceed 50 characters'],
      minlength: [8, 'tour name must not be less than 8 characters']
    },

    slug: String,

    duration: { type: Number, required: [true, 'A tour must have a duration'] },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },

    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty must be easy, medium or difficult'
      }
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'must not be less than 1'],
      max: [5, 'must not exceed 5'],
      set: val => Math.round(val * 10) / 10
    },

    ratingsQuantity: {
      type: Number,
      default: 0
    },

    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },

    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },

    summary: {
      type: String,
      required: [true, 'A tour must have a description'],
      trim: true
    },

    description: {
      type: String,
      required: [true, 'A tour must have a description'],
      trim: true
    },

    imageCover: {
      type: String,
      required: [true, 'A tour must have at least one image']
    },

    images: { String },

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },

    secretTour: {
      type: Boolean,
      default: false
    },

    startDates: [Date],

    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },

    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],

    // guides: {
    //   // For Embedding
    //   type: Array
    //   }
    guides: [
      // For referencing
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A tour must have a guide']
      }
    ]
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// Virtual Populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// DOCUMENT MIDDLEWARE:
// can only run before .save(); or .create(); and will not work when trying to update the data
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// // Embedding document in another
// tourSchema.pre('save', async function(next) {
//   if (!this.guides || !Array.isArray(this.guides)) {
//     return next();
//   }

//   try {
//     const guidesPromises = this.guides.map(id => User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// QUERY MIDDLEWARE
// the middleware that determine the specific user that can have access to a particular data from the database
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

// AGGREGAtE MIDDLEWARE
// Pre-aggregation middleware
// tourSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
