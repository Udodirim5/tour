const express = require('express');

const tourController = require('./../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router();

// router.param( 'id', tourController.checkID );

// 5 BEST AND CHEAPEST
router
  .route('/top-5-cheap')
  .get(tourController.eliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

// THIS IS WHERE THE ROUTE FOR THE TOURS ARE HANDLED
router
  .route('/')
  // .get(authController.protect, tourController.getAllTours)
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.removeTour);

module.exports = router;
