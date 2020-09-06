const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
//const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour needs a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'The maximum length of name is 40 characters'],
      minlength: [10, 'The minimum length of name is 10 characters'],
      // validate: [
      //   validator.isAlpha,
      //   'the name of the tour must be alphanumeric',
      // ],
    },
    duration: {
      type: Number,
      required: [true, 'A tour needs a duration'],
    },
    slug: String,
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour needs a GroupSize'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour needs a Difficulty'],
      trim: true,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty can only be easy, medium, or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'the highest rating could only be 5'],
      min: [1, 'the lowest rating could only be 1'],
      set: (value) => Math.round(value * 10) / 10, // 4.66666 to 46.6666 to 47.7 to 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour needs a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        // the validator function will only work on new docs not on updating docs
        validator: function (value) {
          return value < this.price;
        },
        message:
          'The DiscountPrice ({VALUE}) must be less than or equal to the price',
      },
    },
    summary: { type: String, trim: true, required: true },
    description: { type: String, trim: true },
    imageCover: {
      type: String,
      required: [true, 'A tour needs an cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      dafault: Date.now,
      select: false,
    },
    startDates: [Date],
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      // longitude then latitude
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    secretTour: {
      type: Boolean,
      default: false,
    },
    /*guides: Array, //use this in case of embedding document*/
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
// const self = this;
// tourSchema.virtual('durationWeeks').get(() => {
//   return self.duration / 7;
// });
// Document Middle wares are used on save() and create() before and after creation of document
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', async function (next) {
//   const guidePromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidePromises);
//   next();
// });

// tourSchema.pre('save', function (next) {
//   console.log('will post this document');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// Querry Middleware
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  //this.start = Date.now();
  next();
});
// in querry middleware the this awlays refers to the current querry
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

// tourSchema.post(/^find/, function (docs, next) {
//   console.log(` the querry took ${Date.now() - this.start} milliseconds`);
//   console.log(docs);
//   next();
// });

// Aggregate Middlewares
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   //console.log(this.pipeline());
//   next();
// });

// required: [true of false, error string]
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
