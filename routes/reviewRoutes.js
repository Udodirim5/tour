const express = require('express');

const reviewController = require('./../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserId,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide', 'user'),
    reviewController.updateReview
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide', 'user'),
    reviewController.deleteReview
  );

module.exports = router;
