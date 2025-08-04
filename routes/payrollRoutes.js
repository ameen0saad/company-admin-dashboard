import express from 'express';

import * as payrollController from '../controller/payrollController.js';
import * as authController from '../controller/authController.js';
import * as employeeProfileController from '../controller/employeeProfileController.js';

const router = express.Router();

router.use(authController.protect);
router
  .route('/')
  .get(
    authController.restrictTo('admin', 'hr'),
    employeeProfileController.requireEmployeeProfile,
    payrollController.getAllPayrolls
  )
  .post(
    authController.restrictTo('admin', 'hr'),
    employeeProfileController.requireEmployeeProfile,
    payrollController.preventHrSelfModification,
    payrollController.createPayroll
  );

router
  .route('/my-payrolls')
  .get(employeeProfileController.requireEmployeeProfile, payrollController.getMyPayrolls);
router
  .route('/:id')
  .get(
    authController.restrictTo('admin', 'hr'),
    payrollController.preventHrSelfModification,
    payrollController.getPayroll
  )
  .patch(
    authController.restrictTo('admin', 'hr'),
    payrollController.preventHrSelfModification,
    payrollController.updatePayroll
  )
  .delete(
    authController.restrictTo('admin', 'hr'),
    employeeProfileController.requireEmployeeProfile,
    payrollController.deletePayroll
  );

export default router;
