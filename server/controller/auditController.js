import AuditLog from '../Model/auditLogModel.js';
import AppError from '../utils/appError.js';
import * as factory from './handlerFactory.js';

export const getAllAudit = factory.getAll(AuditLog);
export const getAudit = factory.getOne(AuditLog);
export const notAllowed = (req, res, next) => {
  if (req.method === 'DELETE') return next(new AppError('Deletion not allowed', 403));
  if (req.method === 'POST') return next(new AppError('Create not allowed', 403));
  if (req.method === 'PATCH') return next(new AppError('Modification not allowed', 403));
};
