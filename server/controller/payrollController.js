import Payroll from '../Model/payrollModel.js';
import EmployeeProfile from '../Model/employeeProfileModel.js';
import User from '../Model/userModel.js';
import * as factory from './handlerFactory.js';
import AppError from '../utils/appError.js';
import APIFeatures from '../utils/ApiFeatures.js';
import { Email } from '../utils/email.js';

export const getAllPayrolls = factory.getAll(Payroll);
export const getPayroll = factory.getOne(Payroll);
export const createPayroll = async (req, res, next) => {
  delete req.body.createdBy;
  req.body.createdBy = req.user._id;

  const payroll = await Payroll.create(req.body);
  await factory.logAudit({
    action: 'create',
    modelName: Payroll.modelName,
    documentId: payroll._id,
    user: req.user._id,
  });

  const employeeProfile = await EmployeeProfile.findById(req.body.employeeProfileId);
  if (!employeeProfile) {
    return next(new AppError('No Employee Profile found with that ID', 404));
  }

  const user = await User.findById(employeeProfile.employeeId);
  if (!user) {
    return next(new AppError('No User found for this Employee Profile', 404));
  }

  await new Email(user, null).sendPayroll(payroll, employeeProfile);

  res.status(201).json({
    status: 'success',
    data: {
      payroll,
    },
  });
};

export const updatePayroll = factory.updateOne(Payroll);
export const deletePayroll = factory.deleteOne(Payroll);

// TODO : get all payrolls for a specific employee
export const getMyPayrolls = async (req, res, next) => {
  const employeeProfile = await EmployeeProfile.findOne({
    employeeId: req.user._id,
  });
  if (!employeeProfile) {
    return next(new AppError('No Employee Profile found for this user', 404));
  }

  const features = new APIFeatures(
    Payroll.find({ employeeProfileId: employeeProfile._id }).select('-createdBy -updatedBy -__v'),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const payrolls = await features.query;
  if (!payrolls || payrolls.length === 0) {
    return next(new AppError('No Payrolls found for this employee', 404));
  }
  res.status(200).json({
    status: 'success',
    results: payrolls.length,
    data: {
      payrolls,
    },
  });
};
export const getMyPayrollsStats = async (req, res, next) => {
  const employeeProfile = await EmployeeProfile.findOne({
    employeeId: req.user._id,
  });

  if (!employeeProfile) {
    return next(new AppError('No Employee Profile found for this user', 404));
  }

  const stats = await Payroll.aggregate([
    {
      $match: { employeeProfileId: employeeProfile._id },
    },
    {
      $group: {
        _id: null,
        totalEarned: { $sum: { $ifNull: ['$netPay', 0] } },
        totalBonus: { $sum: { $ifNull: ['$bonus', 0] } },
        totalDeduction: { $sum: { $ifNull: ['$deductions', 0] } },
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0] || {
        totalEarned: 0,
        totalBonus: 0,
        totalDeduction: 0,
        count: 0,
      },
    },
  });
};

export const preventHrSelfModification = async (req, res, next) => {
  let payroll;
  if (req.params.id) {
    payroll = await Payroll.findById(req.params.id);
    if (!payroll) return next(new AppError('No found Payroll with that ID : ', 400));
  }
  const employeeId =
    payroll?.employeeProfileId._id || req.body?.employeeProfileId || req.params?.employeeId;

  if (!employeeId) {
    return next(new AppError('No employee ID provided', 400));
  }

  const employeeProfile = await EmployeeProfile.findById(employeeId);
  if (!employeeProfile) return next(new AppError('No Employee found with that ID  ', 400));

  const employeeRole = employeeProfile.employeeId.role;

  if (employeeRole == 'hr' && req.user.role === 'hr')
    return next(new AppError('HR cannot assign bonus or payroll to themselves', 403));

  next();
};
