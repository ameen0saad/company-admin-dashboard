import AuditLog from '../Model/auditLogModel.js';
import AppError from '../utils/appError.js';
import * as factory from './handlerFactory.js';

export const getAllAudit = factory.getAll(AuditLog);
export const getAudit = factory.getOne(AuditLog);
export const notAllowed = (req, res, next) => {
  if (req.method === 'DELETE') throw new AppError('Deletion not allowed', 403);
  if (req.method === 'POST') throw new AppError('Create not allowed', 403);
  if (req.method === 'PATCH')
    throw new AppError('Modification not allowed', 403);
};
