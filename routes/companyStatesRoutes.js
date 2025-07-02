import express from 'express';

import * as companyStatesController from '../controller/companyStatesController.js';
import * as authController from '../controller/authController.js';

const router = express.Router();
router.use(authController.protect, authController.restrictTo('admin', 'hr'));
router.get('/company-states', companyStatesController.getStats);

export default router;
