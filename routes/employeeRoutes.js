import express from 'express';
import * as employeeProfileController from '../controller/employeeProfileController.js';
import * as authController from '../controller/authController.js';
import payrollRoutes from './payrollRoutes.js';

const router = express.Router();

router
  .route('/myProfile')
  .get(authController.protect, employeeProfileController.getMyProfile);

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'hr'),
    employeeProfileController.getAllEmployees
  )
  .post(
    authController.protect,
    authController.restrictTo('admin', 'hr'),
    employeeProfileController.restrictProfileForAdmin,
    employeeProfileController.createEmployee
  );

router
  .route('/:id')
  .get(authController.protect, employeeProfileController.getEmployee)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'hr'),
    employeeProfileController.preventHrOnHrProfileAccess,
    employeeProfileController.updateEmployee
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'hr'),
    employeeProfileController.preventHrOnHrProfileAccess,
    employeeProfileController.deleteEmployee
  );
router.use('/:employeeId/payrolls', payrollRoutes);
export default router;
