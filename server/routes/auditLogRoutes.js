import express from 'express';
import * as auditController from '../controller/auditController.js';
import * as authController from '../controller/authController.js';

const router = express.Router();
router.use(authController.protect, authController.restrictTo('admin'));
router.get('/', auditController.getAllAudit);
router.get('/:id', auditController.getAudit);
router.all('*split', auditController.notAllowed);
export default router;
