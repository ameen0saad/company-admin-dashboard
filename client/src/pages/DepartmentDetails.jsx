import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  AlertCircle,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  User,
  Plus,
  DollarSign,
  Search,
  X,
  CheckCircle,
} from 'lucide-react';
import apiService from '../services/api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

export default function DepartmentDetails({ departmentId, onBack }) {
  const [department, setDepartment] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [employeePayrolls, setEmployeePayrolls] = useState({}); // Track payrolls for each employee
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showCreatePayroll, setShowCreatePayroll] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [newEmployeeData, setNewEmployeeData] = useState({
    employeeId: '',
    salary: '',
    phone: '',
    dateOfBirth: '',
    joiningDate: new Date().toISOString().split('T')[0],
    address: '',
  });

  const [payrollData, setPayrollData] = useState({
    employeeProfileId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    bonus: 0,
    deductions: 0,
  });

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (departmentId) {
      loadDepartment();
      loadUnassignedUsers();
    }
  }, [departmentId]);

  const loadDepartment = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getDepartment(departmentId);
      const deptData = response.data.doc;
      setDepartment(deptData);

      // Extract employees from the department data
      if (deptData.employee) {
        const employeeList = Array.isArray(deptData.employee)
          ? deptData.employee
          : [deptData.employee];
        setEmployees(employeeList);

        // Load payroll data for each employee
        loadEmployeePayrolls(employeeList);
      }
    } catch (err) {
      console.error('Failed to load department:', err);
      setError(err.message || 'Failed to load department details');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeePayrolls = async (employeeList) => {
    try {
      const payrollPromises = employeeList.map(async (employee) => {
        try {
          // Get payrolls for this employee for current month and year
          const response = await apiService.getPayrolls(
            `?employeeProfileId=${employee._id}&month=${currentMonth}&year=${currentYear}`
          );
          return {
            employeeId: employee._id,
            payrolls: response.data?.doc || [],
          };
        } catch (err) {
          console.error(`Failed to load payrolls for employee ${employee._id}:`, err);
          return {
            employeeId: employee._id,
            payrolls: [],
          };
        }
      });

      const payrollResults = await Promise.all(payrollPromises);
      const payrollsMap = {};

      payrollResults.forEach((result) => {
        payrollsMap[result.employeeId] = result.payrolls;
      });

      setEmployeePayrolls(payrollsMap);
    } catch (err) {
      console.error('Failed to load employee payrolls:', err);
    }
  };

  const loadUnassignedUsers = async () => {
    try {
      const response = await apiService.getUnassignedUsers();
      setUnassignedUsers(response.data || []);
    } catch (err) {
      console.error('Failed to load unassigned users:', err);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddEmployee = async () => {
    try {
      setActionLoading(true);
      const employeeData = {
        ...newEmployeeData,
        department: departmentId,
        salary: Number(newEmployeeData.salary),
      };

      await apiService.createEmployee(employeeData);

      showToast('Employee added successfully', 'success');
      setShowAddEmployee(false);
      setNewEmployeeData({
        employeeId: '',
        salary: '',
        phone: '',
        dateOfBirth: '',
        joiningDate: new Date().toISOString().split('T')[0],
        address: '',
      });

      // Reload department data
      loadDepartment();
      loadUnassignedUsers();
    } catch (err) {
      console.error('Failed to add employee:', err);
      showToast(err.message || 'Failed to add employee', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreatePayroll = async () => {
    try {
      setActionLoading(true);
      await apiService.createPayroll(payrollData);

      showToast('Payroll created successfully', 'success');
      setShowCreatePayroll(false);
      setPayrollData({
        employeeProfileId: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        bonus: 0,
        deductions: 0,
      });

      // Reload payroll data for the employee
      if (selectedEmployee) {
        const response = await apiService.getPayrolls(
          `?employeeProfileId=${selectedEmployee._id}&month=${currentMonth}&year=${currentYear}`
        );
        setEmployeePayrolls((prev) => ({
          ...prev,
          [selectedEmployee._id]: response.data?.doc || [],
        }));
      }
    } catch (err) {
      console.error('Failed to create payroll:', err);
      showToast(err.message || 'Failed to create payroll', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenPayrollModal = (employee) => {
    setSelectedEmployee(employee);
    setPayrollData((prev) => ({
      ...prev,
      employeeProfileId: employee._id,
    }));
    setShowCreatePayroll(true);
  };

  // Check if employee has payroll for current month
  const hasCurrentMonthPayroll = (employeeId) => {
    const payrolls = employeePayrolls[employeeId] || [];
    return payrolls.some(
      (payroll) => payroll.month === currentMonth && payroll.year === currentYear
    );
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.employeeId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getMonthName = (month) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[month - 1] || 'Unknown';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-gray-200 rounded-xl h-64 animate-pulse"></div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-200 rounded-xl h-48 animate-pulse"></div>
            <div className="bg-gray-200 rounded-xl h-64 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Departments
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Error</h3>
            <p className="text-red-800">{error || 'Department not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Departments
      </button>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Department Details</h1>
        <p className="text-gray-600 mt-1">View complete department information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Info Card */}
        <div className="lg:col-span-1 space-y-6">
          {/* Main Info */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{department.name}</h2>
            </div>

            <div className="space-y-4 border-t border-gray-200 pt-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase">Total Employees</p>
                  <p className="text-lg font-bold text-gray-900">{department.employeeCount || 0}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <button
                onClick={() => setShowAddEmployee(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Employee
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Description
            </h3>
            <p className="text-gray-700 leading-relaxed">{department.description}</p>
          </div>

          {/* Created Info */}
          {department.createdBy && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm p-6 border border-green-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                Created By
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {department.createdBy.name?.charAt(0) || '?'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{department.createdBy.name}</p>
                  <p className="text-xs text-gray-600">{department.createdBy.email}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600">Created on {formatDate(department.createdAt)}</p>
            </div>
          )}

          {/* Updated Info */}
          {department.updatedBy && (
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl shadow-sm p-6 border border-amber-200">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                Updated By
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {department.updatedBy.name?.charAt(0) || '?'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{department.updatedBy.name}</p>
                  <p className="text-xs text-gray-600">{department.updatedBy.email}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600">
                Last updated on {formatDate(department.updatedAt)}
              </p>
            </div>
          )}
        </div>

        {/* Employees Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Department Employees ({filteredEmployees.length})
                </h3>
                <button
                  onClick={() => setShowAddEmployee(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Employee
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {employees.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No employees in this department yet</p>
                <button
                  onClick={() => setShowAddEmployee(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add First Employee
                </button>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-600">No results matching your search</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredEmployees.map((emp) => {
                  const hasPayroll = hasCurrentMonthPayroll(emp._id);

                  return (
                    <div key={emp._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            {emp.employeeId?.photo && emp.employeeId?.photo.startsWith('u') ? (
                              <img
                                src={`http://127.0.0.1:3000/img/users/${emp.employeeId?.photo}`}
                                alt={emp.employeeId?.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-semibold">
                                {emp.employeeId?.name?.charAt(0) || '?'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Employee Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-gray-900">
                                {emp.employeeId?.name || 'N/A'}
                              </h4>
                              <span
                                className={`px-2 py-0.5 text-xs font-medium rounded ${
                                  emp.employeeId?.role === 'admin'
                                    ? 'bg-red-100 text-red-800'
                                    : emp.employeeId?.role === 'hr'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {emp.employeeId?.role || 'N/A'}
                              </span>
                              {hasPayroll && (
                                <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                                  <CheckCircle className="w-3 h-3" />
                                  Paid
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleOpenPayrollModal(emp)}
                              disabled={hasPayroll}
                              className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors text-sm ${
                                hasPayroll
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                              title={
                                hasPayroll
                                  ? 'Payroll already created for this month'
                                  : 'Create payroll'
                              }
                            >
                              <DollarSign className="w-3 h-3" />
                              {hasPayroll ? 'Paid' : 'Payroll'}
                            </button>
                          </div>

                          <div className="space-y-2 mt-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <span className="break-all">{emp.employeeId?.email || 'N/A'}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <span>{emp.phone || 'N/A'}</span>
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100">
                              <div>
                                <p className="text-xs text-gray-600 font-semibold uppercase">
                                  Salary
                                </p>
                                <p className="text-sm font-medium text-gray-900 mt-1">
                                  ${emp.salary?.toLocaleString() || '0'}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-gray-600 font-semibold uppercase">
                                  Date of Birth
                                </p>
                                <p className="text-sm text-gray-900 mt-1">
                                  {formatDate(emp.dateOfBirth)}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-gray-600 font-semibold uppercase">
                                  Joined
                                </p>
                                <p className="text-sm text-gray-900 mt-1">
                                  {formatDate(emp.joiningDate)}
                                </p>
                              </div>
                            </div>

                            {emp.address && (
                              <div className="pt-2 border-t border-gray-100">
                                <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                                  Address
                                </p>
                                <p className="text-sm text-gray-900 line-clamp-2">{emp.address}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      <Modal
        isOpen={showAddEmployee}
        title="Add Employee to Department"
        onClose={() => setShowAddEmployee(false)}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
            <select
              value={newEmployeeData.employeeId}
              onChange={(e) =>
                setNewEmployeeData((prev) => ({ ...prev, employeeId: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose an employee</option>
              {unassignedUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} - {user.email}
                </option>
              ))}
            </select>
            {unassignedUsers.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">No unassigned users available</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
            <input
              type="number"
              value={newEmployeeData.salary}
              onChange={(e) => setNewEmployeeData((prev) => ({ ...prev, salary: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter salary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={newEmployeeData.phone}
              onChange={(e) => setNewEmployeeData((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter phone number"
            />
          </div>

          {/* Date of Birth Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              value={newEmployeeData.dateOfBirth}
              onChange={(e) =>
                setNewEmployeeData((prev) => ({ ...prev, dateOfBirth: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
            <input
              type="date"
              value={newEmployeeData.joiningDate}
              onChange={(e) =>
                setNewEmployeeData((prev) => ({ ...prev, joiningDate: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={newEmployeeData.address}
              onChange={(e) => setNewEmployeeData((prev) => ({ ...prev, address: e.target.value }))}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter address"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowAddEmployee(false)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddEmployee}
              disabled={actionLoading || !newEmployeeData.employeeId}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {actionLoading ? 'Adding...' : 'Add Employee'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Payroll Modal */}
      <Modal
        isOpen={showCreatePayroll}
        title="Create Payroll"
        onClose={() => setShowCreatePayroll(false)}
        maxWidth="max-w-md"
      >
        {selectedEmployee && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-900">
                {selectedEmployee.employeeId?.name}
              </p>
              <p className="text-xs text-gray-600">
                Base Salary: ${selectedEmployee.salary?.toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={payrollData.month}
                  onChange={(e) =>
                    setPayrollData((prev) => ({ ...prev, month: Number(e.target.value) }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {getMonthName(i + 1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  value={payrollData.year}
                  onChange={(e) =>
                    setPayrollData((prev) => ({ ...prev, year: Number(e.target.value) }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bonus</label>
              <input
                type="number"
                value={payrollData.bonus}
                onChange={(e) =>
                  setPayrollData((prev) => ({ ...prev, bonus: Number(e.target.value) }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deductions</label>
              <input
                type="number"
                value={payrollData.deductions}
                onChange={(e) =>
                  setPayrollData((prev) => ({ ...prev, deductions: Number(e.target.value) }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-green-900">Net Pay Calculation</p>
              <p className="text-lg font-bold text-green-800">
                $
                {(
                  selectedEmployee.salary +
                  payrollData.bonus -
                  payrollData.deductions
                ).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowCreatePayroll(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePayroll}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Creating...' : 'Create Payroll'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
