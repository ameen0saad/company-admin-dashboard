import React, { useState, useEffect } from 'react';
import { Users, UserPlus, DollarSign, Building2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
      setError(err.message || 'Failed to load company status');
    } finally {
      setLoading(false);
    }
  };

  // Only admin and hr can access this page
  if (!user || !['admin', 'hr'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only available for Admin and HR staff.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Company Status</h1>
          <p className="text-gray-600 mt-1">Overview of company operations</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Failed to Load Statistics</h3>
            <p className="text-red-800">{error}</p>
            <button
              onClick={loadStats}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Employees',
      value: stats?.employeesCount || 0,
      icon: Users,
      color: 'bg-blue-500',
      description: 'Active employees',
    },
    {
      title: 'HR Staff',
      value: stats?.hrCount || 0,
      icon: UserPlus,
      color: 'bg-purple-500',
      description: 'HR team members',
    },
    {
      title: 'Total Payroll',
      value: `$${(stats?.totalPayrollThisMonth || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      description: 'This month',
    },
    {
      title: 'Departments',
      value: stats?.Departments?.length || 0,
      icon: Building2,
      color: 'bg-orange-500',
      description: 'Company divisions',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Company Status</h1>
        <p className="text-gray-600 mt-1">
          Real-time overview of company operations and statistics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
              <p className="text-sm text-gray-600 mt-1">{card.title}</p>
              <p className="text-xs text-gray-500 mt-1">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Payroll Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-600 font-semibold uppercase mb-2">Total Payroll</p>
          <p className="text-3xl font-bold text-green-600">
            ${(stats?.totalPayrollThisMonth || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-2">This month's net pay</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-600 font-semibold uppercase mb-2">Total Bonus</p>
          <p className="text-3xl font-bold text-blue-600">
            ${(stats?.totalBonusThisMonth || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-2">This month's bonus</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-600 font-semibold uppercase mb-2">Total Deductions</p>
          <p className="text-3xl font-bold text-red-600">
            ${(stats?.totalDeductionsThisMonth || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-2">This month's deductions</p>
        </div>
      </div>

      {/* Departments Overview */}
      {stats?.Departments && stats.Departments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Departments Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.Departments.map((dept, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{dept.name}</p>
                      <p className="text-xs text-gray-600">Department</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{dept.employeeCount}</div>
                    <div className="text-xs text-gray-600">employees</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Employee Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 font-semibold">Total Employees</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.employeesCount || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-semibold">Admins</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.adminCount || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-semibold">HR Staff</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.hrCount || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-semibold">Inactive</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {stats?.nonActiveEmployeesCount || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
