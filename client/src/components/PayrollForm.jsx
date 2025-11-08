import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

export default function PayrollForm({ payroll, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    employeeProfileId: '',
    bonus: '0',
    deductions: '0',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(false);

  useEffect(() => {
    if (payroll) {
      setFormData({
        employeeProfileId: payroll.employeeProfileId?._id || '',
        bonus: payroll.bonus || '0',
        deductions: payroll.deductions || '0',
        month: payroll.month || new Date().getMonth() + 1,
        year: payroll.year || new Date().getFullYear(),
      });
    }
    loadEmployees();
  }, [payroll]);

  const loadEmployees = async () => {
    try {
      setEmpLoading(true);
      const response = await apiService.getEmployees();
      setEmployees(response.data.doc || []);
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setEmpLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'month' || name === 'year' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
        <select
          name="employeeProfileId"
          value={formData.employeeProfileId}
          onChange={handleChange}
          required
          disabled={empLoading || !!payroll}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        >
          <option value="">Select employee</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.employeeId?.name} - {emp.department?.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
          <select
            name="month"
            value={formData.month}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="2020"
            max={new Date().getFullYear()}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bonus</label>
        <input
          type="number"
          name="bonus"
          value={formData.bonus}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0.00"
          step="0.01"
          min="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Deductions</label>
        <input
          type="number"
          name="deductions"
          value={formData.deductions}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0.00"
          step="0.01"
          min="0"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
      >
        {isLoading ? 'Saving...' : 'Save Payroll'}
      </button>
    </form>
  );
}
