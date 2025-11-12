import express from 'express';
import * as employeeProfileController from '../controller/employeeProfileController.js';
import * as authController from '../controller/authController.js';

const router = express.Router();

router
  .route('/myProfile')
  .get(
    authController.protect,
    employeeProfileController.requireEmployeeProfile,
    employeeProfileController.getMyProfile
  );

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'hr'),
    employeeProfileController.requireEmployeeProfile,
    employeeProfileController.getAllEmployees
  )
  .post(
    authController.protect,
    authController.restrictTo('admin', 'hr'),
    employeeProfileController.requireEmployeeProfile,
    employeeProfileController.restrictProfileForAdmin,
    employeeProfileController.createEmployee
  );

router
  .route('/:id')
  .get(authController.protect, employeeProfileController.getEmployee)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'hr'),
    employeeProfileController.requireEmployeeProfile,
    employeeProfileController.preventHrOnHrProfileAccess,
    employeeProfileController.updateEmployee
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'hr'),
    employeeProfileController.requireEmployeeProfile,
    employeeProfileController.preventHrOnHrProfileAccess,
    employeeProfileController.deleteEmployee
  );

export default router;
