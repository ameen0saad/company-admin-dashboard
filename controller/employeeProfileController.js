import EmployeeProfile from '../Model/employeeProfileModel.js';
import User from '../Model/userModel.js';
import AppError from '../utils/appError.js';
import * as factory from './handlerFactory.js';

// TODO : Get All EmployeesProfiles
export const getAllEmployees = factory.getAll(EmployeeProfile);

// TODO : Create  EmployeesProfile
export const createEmployee = factory.createOne(EmployeeProfile);

// TODO : Get  EmployeesProfile
export const getEmployee = factory.getOne(EmployeeProfile);

// TODO : Update  EmployeesProfile
export const updateEmployee = factory.updateOne(EmployeeProfile);

// TODO : Delete  EmployeesProfile and make soft delete for user
export const deleteEmployee = async (req, res, next) => {
  const employeeProfileId = req.params.id;
  const profile = await EmployeeProfile.findById(employeeProfileId).select('employeeId');

  if (!profile) {
    return next(new AppError('No employee profile found with that ID', 404));
  }
  const userId = profile.employeeId;

  const employeeProfile = await EmployeeProfile.findByIdAndDelete(employeeProfileId);
  // TODO : Log audit trail for delete operation , for employee profile and user
  await factory.logAudit({
    action: 'delete',
    modelName: EmployeeProfile.modelName,
    documentId: employeeProfileId,
    user: req.user._id,
    before: employeeProfile,
  });

  await User.findByIdAndUpdate(userId, { active: false });

  await factory.logAudit({
    action: 'update',
    modelName: User.modelName,
    documentId: userId,
    user: req.user._id,
    before: { active: true },
    after: { active: false },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

// TODO : Get profile for current logged-in user
export const getMyProfile = async (req, res, next) => {
  const employeeProfile = await EmployeeProfile.findOne({
    employeeId: req.user._id,
  });

  if (!employeeProfile) {
    return next(
      new AppError(
        'This user has an account but does not have an employee profile yet. Please contact HR to complete the registration.',
        404
      )
    );
  }

  res.status(200).json({
    status: 'success',
    data: { employeeProfile },
  });
};
// TODO : Require employee profile for doing operations
export const requireEmployeeProfile = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    const employeeProfile = await EmployeeProfile.findOne({ employeeId: req.user._id });
    if (!employeeProfile)
      return next(
        new AppError(
          'You must create your employee profile before accessing this feature. Please contact HR if the issue persists.',
          403
        )
      );
  }

  next();
};

// TODO : Prevent HR from creating a profile for Admin
export const restrictProfileForAdmin = async (req, res, next) => {
  const user = await User.findById(req.body.employeeId);
  if (!user) return next(new AppError('there is no user with that ID ', 400));
  if (user.role == 'admin') return next(new AppError('Cannot create profile for admin', 403));
  next();
};

// TODO : Prevent HR from accessing another HR's profile
export const preventHrOnHrProfileAccess = async (req, res, next) => {
  const employeeId = req.params.id || req.body.employeeId;
  const isHr = req.user.role;

  if (!employeeId) return next(new AppError('No employee ID provided', 400));

  const employeeProfile = await EmployeeProfile.findById(employeeId);

  if (!employeeProfile) return next(new AppError('No User found with that ID', 400));

  const userRole = employeeProfile.employeeId.role;

  if (userRole === 'hr' && isHr === 'hr')
    return next(new AppError('Hr cannot create or update profile for another HR ', 403));
  next();
};
