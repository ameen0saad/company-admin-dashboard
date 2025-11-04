import express from 'express';
import qs from 'qs';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import path from 'path';

import employeeRoutes from './routes/employeeRoutes.js';
import department from './routes/departmentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import auditRoutes from './routes/auditLogRoutes.js';
import companyStatesRoutes from './routes/companyStatesRoutes.js';
import globalErrorHandler from './controller/errorController.js';
import AppError from './utils/appError.js';
import { __dirname } from './utils/path.js';

const app = express();
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5500'],
    credentials: true,
  })
);

app.use(express.json());
app.use(helmet());

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

app.use(hpp({ whitelist: ['sort', 'page', 'limit'] }));

//app.use(mongoSanitize());
// app.use(xss());

app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  console.log('This project works on ' + process.env.NODE_ENV);
  next();
});

// Add this to your app.js
app.set('query parser', (str) => {
  return qs.parse(str);
});

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/departments', department);
app.use('/api/v1/payrolls', payrollRoutes);
app.use('/api/v1/audits', auditRoutes);
app.use('/api/v1/company', companyStatesRoutes);

app.all('*split', (req, res, next) => {
  console.log('Hello from 404 middleware');
  return next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
