import express from 'express';
import path from 'path';
import employeeRoutes from './routes/employeeRoutes.js';
import department from './routes/departmentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import auditRoutes from './routes/auditLogRoutes.js';
import companyStatesRoutes from './routes/companyStatesRoutes.js';
import globalErrorHandler from './controller/errorController.js';
import AppError from './utils/appError.js';

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  console.log('This project works on ' + process.env.NODE_ENV);
  next();
});

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/departments', department);
app.use('/api/v1/payrolls', payrollRoutes);
app.use('/api/v1/audits', auditRoutes);
app.use('/api/v1/company', companyStatesRoutes);

app.all('*split', (req, res, next) => {
  console.log('Hello from 404 middleware');
  throw new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
});

app.use(globalErrorHandler);

export default app;
