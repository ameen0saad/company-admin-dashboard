import React, { useState, useEffect } from 'react';
import {
  Calendar,
  DollarSign,
  User,
  FileText,
  Clock,
  TrendingUp,
  Bell,
  Mail,
  CheckCircle,
  AlertTriangle,
  Building2,
  Phone,
  MapPin,
} from 'lucide-react';
import apiService from '../services/api';
import Toast from '../components/Toast';

export default function EmployeeHomepage() {
  const [employee, setEmployee] = useState(null);
  const [recentPayrolls, setRecentPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({
    totalPayrolls: 0,
    leaveBalance: 15,
    pendingTasks: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load employee profile
      const profileResponse = await apiService.getMyProfile();
      if (profileResponse.data.employeeProfile) {
        setEmployee(profileResponse.data.employeeProfile);
      }

      // Load recent payrolls
      try {
        const payrollsResponse = await apiService.getMyPayrolls('?limit=5&sort=-paymentDate');
        setRecentPayrolls(payrollsResponse.data?.payrolls || []);
        setStats((prev) => ({
          ...prev,
          totalPayrolls: payrollsResponse.data?.payrolls?.length || 0,
        }));
      } catch (err) {
        console.error('Failed to load payrolls:', err);
        setRecentPayrolls([]);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError(error.message || 'Failed to load dashboard');
      showToast('Failed to load employee data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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
        <div className="h-32 bg-gray-200 rounded-xl w-full animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-32 animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-200 rounded-xl h-96 animate-pulse"></div>
          <div className="bg-gray-200 rounded-xl h-96 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your employee portal</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Error Loading Dashboard</h3>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {employee?.employeeId?.name}!</h1>
            <p className="text-blue-100 mt-1">Here's an overview of your employment details</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-blue-200 text-sm">Department</p>
            <p className="font-semibold">{employee?.department?.name || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Salary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Current Salary</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(employee?.salary || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Monthly</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Payrolls Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Payroll Records</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPayrolls}</p>
              <p className="text-xs text-gray-500 mt-1">Total records</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Join Date Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Tenure</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {Math.floor(
                  (Date.now() - new Date(employee?.joiningDate)) / (1000 * 60 * 60 * 24 * 365)
                ) || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Years employed</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employment Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Employment Information</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Department</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {employee?.department?.name || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Salary</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {formatCurrency(employee?.salary || 0)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Joining Date</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {formatDate(employee?.joiningDate)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Date of Birth</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {formatDate(employee?.dateOfBirth)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Email</p>
                <p className="text-sm font-medium text-gray-900 mt-1 break-all">
                  {employee?.employeeId?.email || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Phone</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{employee?.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Address</p>
                <p className="text-sm text-gray-900 mt-1">{employee?.address || 'N/A'}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-2">
                Status
              </p>
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Active Employee
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payrolls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Payroll Records</h2>
          <DollarSign className="w-5 h-5 text-gray-400" />
        </div>

        {recentPayrolls.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No payroll records found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPayrolls.map((payroll) => (
              <div
                key={payroll._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {getMonthName(payroll.month)} {payroll.year}
                  </p>
                  <p className="text-sm text-gray-600">
                    Base: {formatCurrency(payroll.employeeProfileId?.salary || 0)} • Bonus:{' '}
                    {formatCurrency(payroll.bonus)} • Deductions:{' '}
                    {formatCurrency(payroll.deductions)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(payroll.netPay)}</p>
                  <p className="text-xs text-gray-500">Net Pay</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
