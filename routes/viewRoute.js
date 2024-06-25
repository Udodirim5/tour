const express = require('express');
const authController = require('../controllers/authController');
const viewsController = require('./../controllers/viewsController');

const router = express.Router();

router.use(authController.isLoggedIn);

router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.getLoginForm);
router.get('/signUp', viewsController.getSignUpForm);
// router.get('/me', authController.protect, viewsController.getAccount);

module.exports = router;
