import express from 'express';
import rateLimit from 'express-rate-limit';

import * as userController from '../controller/userController.js';
import * as authController from '../controller/authController.js';

const loginLimiter = rateLimit({
  max: 5,
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  message: 'Too many login attempts, please try again after 15 minutes.',
});
const forgotPasswordLimiter = rateLimit({
  windowMs: 1 * 60 * 60 * 1000, // 1 ساعة
  max: 3, // 3 محاولات في الساعة
  message: 'Too many password reset requests from this IP, please try again after an hour.',
});

const router = express.Router();

router.route('/login').post(loginLimiter, authController.login);
router.route('/logout').get(authController.logout);

// router.route('/forgotPassword').post(forgotPasswordLimiter, authController.forgotPassword);
// router.route('/resetPassword').patch(authController.resetPassword);
// router.route('/verifyOTP').post(authController.verifyOTP);

router.use(authController.protect); //TODO : Protect all routes after this middleware
router.route('/updatePassword').patch(authController.updatePassword);
router
  .route('/unassigned')
  .get(authController.restrictTo('admin', 'hr'), userController.getUnassignedUsers);

router.use(authController.restrictTo('admin'));
router
  .route('/signup')
  .post(userController.uploadUserPhoto, userController.resizeUserPhoto, authController.signup);
router.route('/').get(userController.getAllUsers);
router.route('/inactive').get(userController.getInactiveUsers);
router
  .route('/:id')
  .patch(userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateUser)
  .get(userController.getUser);
router.route('/:id').delete(userController.deleteUser);

export default router;
