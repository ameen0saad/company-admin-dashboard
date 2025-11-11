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
} from 'lucide-react';
import apiService from '../services/api';

export default function EmployeeDashboard() {
  const [employee, setEmployee] = useState(null);
  const [recentPayrolls, setRecentPayrolls] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPayrolls: 0,
    leaveBalance: 15,
    pendingTasks: 3,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load employee profile
      const profileResponse = await apiService.getMyProfile();
      console.log(profileResponse.data.employeeProfile);
      setEmployee(profileResponse.data.employeeProfile);

      // Load recent payrolls
      const payrollsResponse = await apiService.getMyPayrolls('?limit=3&sort=-paymentDate');
      setRecentPayrolls(payrollsResponse.data?.doc || []);

      // Load notifications
      const notificationsResponse = await apiService.getNotifications();
      setNotifications(notificationsResponse.data?.slice(0, 5) || []);

      // Mock data for demonstration
      setUpcomingEvents([
        { id: 1, title: 'Team Meeting', date: '2025-01-15', type: 'meeting' },
        { id: 2, title: 'Performance Review', date: '2025-01-20', type: 'review' },
        { id: 3, title: 'Training Session', date: '2025-01-25', type: 'training' },
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-gray-200 rounded w-1/4 animate-pulse"></div>
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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {employee.name || 'Employee'}!</h1>
            <p className="text-blue-100 mt-1">Here's what's happening with your account today</p>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-sm">Department</p>
            <p className="font-semibold">{employee?.department?.name || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Salary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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

        {/* Leave Balance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Leave Balance</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.leaveBalance} days</p>
              <p className="text-xs text-gray-500 mt-1">Remaining this year</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending Tasks</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingTasks}</p>
              <p className="text-xs text-gray-500 mt-1">Require attention</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payrolls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Recent Payrolls</h2>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            {recentPayrolls.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No payroll records found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPayrolls.map((payroll) => (
                  <div
                    key={payroll._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(payroll.paymentDate).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        Bonus: {formatCurrency(payroll.bonus)} • Deductions:{' '}
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
            <button className="w-full mt-4 px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
              View All Payrolls
            </button>
          </div>
        </div>

        {/* Upcoming Events & Notifications */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Upcoming Events</h2>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        event.type === 'meeting'
                          ? 'bg-blue-100'
                          : event.type === 'review'
                          ? 'bg-green-100'
                          : 'bg-purple-100'
                      }`}
                    >
                      <Calendar
                        className={`w-5 h-5 ${
                          event.type === 'meeting'
                            ? 'text-blue-600'
                            : event.type === 'review'
                            ? 'text-green-600'
                            : 'text-purple-600'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                <Bell className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-4">
                    <CheckCircle className="w-8 h-8 text-green-300 mx-auto mb-2" />
                    <p className="text-gray-600">All caught up!</p>
                    <p className="text-sm text-gray-500">No new notifications</p>
                  </div>
                ) : (
                  notifications.map((notification, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          notification.type === 'alert' ? 'bg-red-100' : 'bg-blue-100'
                        }`}
                      >
                        {notification.type === 'alert' ? (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        ) : (
                          <Bell className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="w-6 h-6 text-blue-600" />
            <span className="text-sm font-medium">My Profile</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <DollarSign className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium">Payroll</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="w-6 h-6 text-orange-600" />
            <span className="text-sm font-medium">Leave Request</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <User className="w-6 h-6 text-purple-600" />
            <span className="text-sm font-medium">Team Directory</span>
          </button>
        </div>
      </div>
    </div>
  );
}
