import express from 'express';

import * as payrollController from '../controller/payrollController.js';
import * as authController from '../controller/authController.js';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'hr'),
    payrollController.getAllPayrolls
  )
  .post(
    authController.protect,
    authController.restrictTo('admin', 'hr'),
    payrollController.preventHrSelfModification,
    payrollController.createPayroll
  );
router
  .route('/:id')
  .get(payrollController.getPayroll)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'hr'),
    payrollController.preventHrSelfModification,
    payrollController.updatePayroll
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'hr'),
    payrollController.deletePayroll
  );

export default router;
