import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import apiService from '../services/api';
import Toast from '../components/Toast';

export default function MyPayroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalBonus: 0,
    totalDeduction: 0,
    count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [payrollRes, statsRes] = await Promise.all([
        apiService.getMyPayrolls('?sort=-year -month'),
        apiService.getMyPayrollsStats(),
      ]);
      setPayrolls(payrollRes.data.payrolls || payrollRes.data.doc || []);
      setStats(statsRes.data.stats || {});
    } catch (err) {
      console.error('Failed to load payroll data:', err);
      setError(err.message || 'Failed to load your payroll records');
      showToast('Failed to load payroll data', 'error');
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
      year: 'numeric',
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
        <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-32 animate-pulse"></div>
          ))}
        </div>
        <div className="bg-gray-200 rounded-xl h-96 animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Payroll</h1>
          <p className="text-gray-600 mt-1">View your payment history and statistics</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Failed to Load Payroll</h3>
            <p className="text-red-800">{error}</p>
            <button
              onClick={loadData}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Payroll</h1>
        <p className="text-gray-600 mt-1">View your payment history and statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Earned */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Total Earned</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {formatCurrency(stats.totalEarned)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {stats.count || 0} payroll record{stats.count !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Total Bonus */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Total Bonus</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {formatCurrency(stats.totalBonus)}
            </p>
            <p className="text-xs text-gray-500 mt-2">Bonus payments received</p>
          </div>
        </div>

        {/* Total Deductions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Total Deductions</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {formatCurrency(stats.totalDeduction)}
            </p>
            <p className="text-xs text-gray-500 mt-2">Total deductions applied</p>
          </div>
        </div>
      </div>

      {/* Payroll Records */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Payment History</h2>
        </div>

        {payrolls.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No payroll records found</p>
            <p className="text-sm text-gray-500 mt-1">Check back later for your payment records</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {payrolls.map((payroll) => (
              <div key={payroll._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {getMonthName(payroll.month)} {payroll.year}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Payment Date: {formatDate(payroll.paymentDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(payroll.netPay)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Net Pay</p>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold uppercase">Base Salary</p>
                    <p className="text-sm font-medium text-gray-900 mt-2">
                      {formatCurrency(payroll.employeeProfileId?.salary || 0)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 font-semibold uppercase">Bonus</p>
                    <p className="text-sm font-medium text-green-600 mt-2">
                      +{formatCurrency(payroll.bonus || 0)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 font-semibold uppercase">Deductions</p>
                    <p className="text-sm font-medium text-red-600 mt-2">
                      -{formatCurrency(payroll.deductions || 0)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 font-semibold uppercase">Net Pay</p>
                    <p className="text-sm font-bold text-green-600 mt-2">
                      {formatCurrency(payroll.netPay || 0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
