import EmployeeProfile from '../Model/employeeProfileModel.js';
import User from '../Model/userModel.js';
import AppError from '../utils/appError.js';
import * as factory from './handlerFactory.js';

export const getAllEmployees = factory.getAll(EmployeeProfile);
export const createEmployee = factory.createOne(EmployeeProfile);
export const getEmployee = factory.getOne(EmployeeProfile);
export const updateEmployee = factory.updateOne(EmployeeProfile);

export const getMyProfile = async (req, res, next) => {
  const employeeProfile = await EmployeeProfile.findOne({
    employeeId: req.user._id,
  });

  if (!employeeProfile) {
    throw new AppError(
      'This user has an account but does not have an employee profile yet. Please contact HR to complete the registration.',
      404
    );
  }

  res.status(200).json({
    status: 'success',
    data: { employeeProfile },
  });
};

export const deleteEmployee = async (req, res, next) => {
  const employee = await EmployeeProfile.findByIdAndUpdate(
    req.params.id,
    { active: false },
    { runValidators: true, new: true }
  );
  if (!employee) throw new AppError('No Employee found with that ID');
  res.status(204).json({
    status: 'success',
  });
};

export const restrictProfileForAdmin = async (req, res, next) => {
  const user = await User.findById(req.body.employeeId);
  if (!user) throw new AppError('there is no user with that ID ', 400);
  if (user.role == 'admin')
    throw new AppError('Cannot create profile for admin users.', 403);
  next();
};

export const preventHrOnHrProfileAccess = async (req, res, next) => {
  const employeeId = req.params.id || req.body.employeeId;
  const isHr = req.user.role;

  if (!employeeId) throw new AppError('No employee ID provided', 400);

  const employeeProfile = await EmployeeProfile.findById(employeeId);

  if (!employeeProfile) throw new AppError('No User found with that ID', 400);

  const userRole = employeeProfile.employeeId.role;

  if (userRole === 'hr' && isHr === 'hr')
    throw new AppError(
      'Hr cannot create or update profile for another Hr ',
      403
    );
  next();
};
