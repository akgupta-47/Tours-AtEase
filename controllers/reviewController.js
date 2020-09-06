const Review = require('../models/reviewModel');
//const catchAsync = require('../utils/catchAsync');
//const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.setReviewUserIds = (req, res, next) => {
  // Allow nested routes to
  if (!req.body.tour) req.body.tour = req.params.tourId;
  // we get user from req of protect middleware
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.getReview = factory.getOne(Review);
exports.deleteReview = factory.deleteOne(Review);
