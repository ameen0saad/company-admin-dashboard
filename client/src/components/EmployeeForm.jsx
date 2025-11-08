import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

export default function EmployeeForm({ employee, departments, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    employeeId: '',
    department: '',
    salary: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    joiningDate: new Date().toISOString().split('T')[0],
  });

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setFormData({
        employeeId: employee.employeeId?._id || '',
        department: employee.department?._id || '',
        salary: employee.salary || '',
        phone: employee.phone || '',
        address: employee.address || '',
        dateOfBirth: employee.dateOfBirth?.split('T')[0] || '',
        joiningDate: employee.joiningDate?.split('T')[0] || '',
      });
    }
    loadUsers();
  }, [employee]);

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await apiService.getUnassignedUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Employee is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.salary) {
      newErrors.salary = 'Salary is required';
    } else if (isNaN(formData.salary) || formData.salary <= 0) {
      newErrors.salary = 'Salary must be a positive number';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone is required';
    }

    if (!formData.address) {
      newErrors.address = 'Address is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.joiningDate) {
      newErrors.joiningDate = 'Joining date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Employee Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Employee User *
        </label>
        <select
          name="employeeId"
          value={formData.employeeId}
          onChange={handleChange}
          disabled={usersLoading || !!employee}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 ${
            errors.employeeId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">{usersLoading ? 'Loading users...' : 'Select employee'}</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name} ({user.email}) - {user.role}
            </option>
          ))}
        </select>
        {errors.employeeId && <p className="text-red-500 text-xs mt-1">{errors.employeeId}</p>}
      </div>

      {/* Department Assignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Assign to Department *
        </label>
        <select
          name="department"
          value={formData.department}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.department ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select department</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>
        {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
      </div>

      {/* Salary */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Salary *</label>
        <input
          type="number"
          name="salary"
          value={formData.salary}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.salary ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="0.00"
          step="0.01"
          min="0"
        />
        {errors.salary && <p className="text-red-500 text-xs mt-1">{errors.salary}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="+1234567890"
        />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.address ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Street address"
        />
        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
        <input
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
      </div>

      {/* Joining Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date *</label>
        <input
          type="date"
          name="joiningDate"
          value={formData.joiningDate}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.joiningDate ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.joiningDate && <p className="text-red-500 text-xs mt-1">{errors.joiningDate}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
      >
        {isLoading ? 'Saving...' : 'Save Employee'}
      </button>
    </form>
  );
}
