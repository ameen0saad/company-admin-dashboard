import Payroll from '../Model/payrollModel.js';
import EmployeeProfile from '../Model/employeeProfileModel.js';
import User from '../Model/userModel.js';
import * as factory from './handlerFactory.js';
import AppError from '../utils/appError.js';

export const getAllPayrolls = factory.getAll(Payroll);
export const getPayroll = factory.getOne(Payroll);
export const createPayroll = factory.createOne(Payroll);
export const updatePayroll = factory.updateOne(Payroll);
export const deletePayroll = factory.deleteOne(Payroll);

export const preventHrSelfModification = async (req, res, next) => {
  let payroll;
  if (req.params.id) {
    payroll = await Payroll.findById(req.params.id);
    if (!payroll) throw new AppError('No found Payroll with that ID : ', 400);
  }
  const employeeId =
    req.body.employeeProfileId ||
    req.params.employeeId ||
    payroll.employeeProfileId;

  if (!employeeId) {
    throw new AppError('No employee ID provided', 400);
  }

  const employeeProfile = await EmployeeProfile.findById(employeeId);
  if (!employeeProfile)
    throw new AppError('No Employee found with that ID  ', 400);

  const employeeRole = employeeProfile.employeeId.role;

  if (employeeRole == 'hr' && req.user.role === 'hr')
    throw new AppError('HR cannot assign bonus or payroll to themselves', 403);

  next();
};
