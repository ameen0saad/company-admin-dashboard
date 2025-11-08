import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Building2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

export default function EmployeeDetails({ employeeId, onBack }) {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (employeeId) {
      loadEmployee();
    }
  }, [employeeId]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getEmployee(employeeId);
      setEmployee(response.data.doc);
    } catch (err) {
      console.error('Failed to load employee:', err);
      setError(err.message || 'Failed to load employee details');
    } finally {
      setLoading(false);
    }
  };

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
          <div className="bg-gray-200 rounded-xl h-64 animate-pulse"></div>
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-200 rounded-xl h-48 animate-pulse"></div>
            <div className="bg-gray-200 rounded-xl h-32 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Employees
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Error</h3>
            <p className="text-red-800">{error || 'Employee not found'}</p>
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
        Back to Employees
      </button>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Employee Details</h1>
        <p className="text-gray-600 mt-1">View complete employee information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Info Card */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
              <span className="text-3xl font-bold">
                {employee.employeeId?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {employee.employeeId?.name || 'N/A'}
            </h2>
            <p className="text-sm text-gray-600 capitalize mt-1">
              {employee.employeeId?.role || 'N/A'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-600">Email</p>
                <p className="text-sm font-medium text-gray-900 break-all">
                  {employee.employeeId?.email || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-600">Phone</p>
                <p className="text-sm font-medium text-gray-900">{employee.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-2">
                Status
              </p>
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Employment Details */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Employment Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                    Department
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {employee.department?.name || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                    Salary
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    ${employee.salary?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                    Joining Date
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatDate(employee.joiningDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                    Date of Birth
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatDate(employee.dateOfBirth)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                  Address
                </h4>
                <p className="text-gray-900 leading-relaxed">{employee.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Created Info */}
          <div className="grid grid-cols-2 gap-4">
            {employee.createdBy && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-2">
                  Created By
                </p>
                <p className="text-sm text-gray-900 font-medium">{employee.createdBy?.name}</p>
                <p className="text-xs text-gray-600">{employee.createdBy?.email}</p>
              </div>
            )}
            {employee.createdAt && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-2">
                  Created At
                </p>
                <p className="text-sm text-gray-900">{formatDate(employee.createdAt)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
