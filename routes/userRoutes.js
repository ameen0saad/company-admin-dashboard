import express from 'express';
import * as userController from '../controller/userController.js';
import * as authController from '../controller/authController.js';

const router = express.Router();

router.route('/login').post(authController.login);
router.route('/logout').get(authController.logout);

router.route('/resetPassword').patch(authController.resetPassword);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/verifyOTP').post(authController.verifyOTP);

router.use(authController.protect); //TODO : Protect all routes after this middleware
router.route('/updatePassword').patch(authController.updatePassword);
router
  .route('/unassigned')
  .get(
    authController.restrictTo('admin', 'hr'),
    userController.getUnassignedUsers
  );

router.use(authController.restrictTo('admin'));
router
  .route('/signup')
  .post(
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    authController.signup
  );
router.route('/').get(userController.getAllUsers);
router
  .route('/:id')
  .patch(
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateUser
  )
  .get(userController.getUser);
router.route('/:id').delete(userController.deleteUser);

export default router;
