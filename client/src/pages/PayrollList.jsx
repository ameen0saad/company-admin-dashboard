import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

export default function PayrollList() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadPayrolls();
  }, []);

  const loadPayrolls = async () => {
    try {
      const response =
        user?.role === 'employee'
          ? await apiService.getMyPayrolls()
          : await apiService.getPayrolls();
      setPayrolls(response.data.payrolls || response.data.doc || []);
    } catch (error) {
      console.error('Failed to load payrolls:', error);
    } finally {
      setLoading(false);
    }
  };

  const canManage = user?.role === 'admin' || user?.role === 'hr';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'employee' ? 'Your payment history' : 'Manage employee payroll'}
          </p>
        </div>
        {canManage && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <Plus className="w-5 h-5" />
            Create Payroll
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading payrolls...</div>
        ) : payrolls.length === 0 ? (
          <div className="p-8 text-center text-gray-600">No payroll records found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Period
                  </th>
                  {canManage && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Employee
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Bonus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Deductions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Net Pay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payrolls.map((payroll) => (
                  <tr key={payroll._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {payroll.MonthName} {payroll.year}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {payroll.employeeProfileId?.name || 'N/A'}
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-green-600 font-medium">
                      +${payroll.bonus?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600 font-medium">
                      -${payroll.deductions?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      ${payroll.netPay?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(payroll.paymentDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
