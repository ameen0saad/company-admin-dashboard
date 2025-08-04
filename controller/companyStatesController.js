import User from '../Model/userModel.js';
import EmployeeProfile from '../Model/employeeProfileModel.js';
import Payroll from '../Model/payrollModel.js';
import Department from '../Model/departmentModel.js';

export const getStats = async (req, res, next) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  console.log('Current Month:', typeof currentMonth);
  console.log('Current Year:', currentYear);

  const [
    employeesCount,
    hrCount,
    adminCount,
    nonActiveEmployeesCount,
    newUsersThisMonth,
    payrollStats,
    departmentStats,
  ] = await Promise.all([
    EmployeeProfile.countDocuments(),
    User.countDocuments({ role: 'hr' }),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ active: false }),
    User.countDocuments({
      createdAt: {
        $gte: new Date(currentYear, currentDate.getMonth(), 1),
        $lt: new Date(currentYear, currentDate.getMonth() + 1, 1),
      },
    }),
    Payroll.aggregate([
      { $match: { month: currentMonth, year: currentYear } },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: '$netPay' },
          totalBonus: { $sum: '$bonus' },
          totalDeductions: { $sum: '$deductions' },
        },
      },
    ]),
    Department.find().select('name employeeCount ').sort({ employeeCount: -1 }),
  ]);
  const pay = Payroll.find({});
  console.log('Payroll Stats:', payrollStats);
  res.status(200).json({
    status: 'success',
    data: {
      employeesCount,
      hrCount,
      adminCount,
      nonActiveEmployeesCount,
      newUsersThisMonth,
      totalPayrollThisMonth: payrollStats[0]?.totalPaid || 0,
      totalBonusThisMonth: payrollStats[0]?.totalBonus || 0,
      totalDeductionsThisMonth: payrollStats[0]?.totalDeductions || 0,
      Departments: departmentStats || 'No Data',
    },
  });
};
