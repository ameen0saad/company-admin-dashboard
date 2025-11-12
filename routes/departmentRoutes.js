import express from 'express';

import * as departmentController from '../controller/departmentController.js';
import * as authController from '../controller/authController.js';

const router = express.Router();
router.route('/myTeam').get(authController.protect, departmentController.getMyTeam);

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'hr'),
    departmentController.getAllDepartments
  )
  .post(
    authController.protect,
    authController.restrictTo('admin', 'hr'),
    departmentController.createDepartment
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'hr'),
    departmentController.getDepartment
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'hr'),
    departmentController.updateDepartment
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'hr'),
    departmentController.deleteDepartment
  );

export default router;
