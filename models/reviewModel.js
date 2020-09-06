const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      trim: true,
      required: [true, 'Review cannot be empty!!'],
      /*maxlength: [100, 'The maximum length of review is 100 characters'],*/
      minlength: [10, 'The minimum length of name is 10 characters'],
    },
    rating: {
      type: Number,
      default: 4.5,
      max: [5, 'the highest rating could only be 5'],
      min: [1, 'the lowest rating could only be 1'],
    },
    createdAt: {
      type: Date,
      dafault: Date.now,
      select: false,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review should belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review should belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//Querry Middleware
reviewSchema.pre(/^find/, function (next) {
  //   this.populate({
  //     path: 'user',
  //     select: 'name',
  //   }).populate({
  //     path: 'tour',
  //     select: 'name photo',
  //   });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

//Aggregate pipeline
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  //console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // this points to current review state
  // we cannot use Review.calcAverageRatings because it is not defined yet
  //this.constructor also means the current models
  this.constructor.calcAverageRatings(this.tour);
  // post middlewares dont have access to nest coz they dont need it
});

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  //console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

// reviewSchema.post(/save|^findOne/, async (doc, next) => {
//   await doc.constructor.calcAverageRating(doc.tour);
//   next();
// });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
