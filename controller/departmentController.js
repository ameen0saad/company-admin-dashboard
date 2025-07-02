import Department from '../Model/departmentModel.js';
import EmployeeProfile from '../Model/employeeProfileModel.js';
import * as factory from './handlerFactory.js';

export const getAllDepartments = factory.getAll(Department);
export const createDepartment = factory.createOne(Department);
export const getDepartment = factory.getOne(Department);
export const updateDepartment = factory.updateOne(Department);
export const deleteDepartment = factory.deleteOne(Department);

export const getMyTeam = async (req, res, next) => {
  const employeeProfile = await EmployeeProfile.findOne({
    employeeId: req.user._id,
  });
  const myTeam = await EmployeeProfile.find({
    department: employeeProfile.department,
    employeeId: { $ne: req.user._id },
  });
  res.status(200).json({
    status: 'success',
    results: myTeam.length,
    data: {
      myTeam,
    },
  });
};
