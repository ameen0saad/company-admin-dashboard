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
} from 'lucide-react';
import apiService from '../services/api';

export default function DepartmentDetails({ departmentId, onBack }) {
  const [department, setDepartment] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (departmentId) {
      loadDepartment();
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
        setEmployees(Array.isArray(deptData.employee) ? deptData.employee : [deptData.employee]);
      }
    } catch (err) {
      console.error('Failed to load department:', err);
      setError(err.message || 'Failed to load department details');
    } finally {
      setLoading(false);
    }
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
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Department Employees ({filteredEmployees.length})
              </h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {employees.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No employees in this department yet</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-600">No results matching your search</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredEmployees.map((emp) => (
                  <div key={emp._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">
                          {emp.employeeId?.name?.charAt(0) || '?'}
                        </span>
                      </div>

                      {/* Employee Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
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

                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
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
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
