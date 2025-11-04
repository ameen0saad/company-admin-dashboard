import React, { useState, useEffect } from 'react';
import { Users, UserPlus, DollarSign, Building2 } from 'lucide-react';
import apiService from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await apiService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  const statCards = [
    {
      title: 'Total Employees',
      value: stats?.employeesCount || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'HR Staff',
      value: stats?.hrCount || 0,
      icon: UserPlus,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Payroll',
      value: `$${(stats?.totalPayrollThisMonth || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Departments',
      value: stats?.Departments?.length || 0,
      icon: Building2,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here is what is happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
              <p className="text-sm text-gray-600 mt-1">{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {stats?.Departments && stats.Departments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Departments Overview</h2>
          <div className="space-y-3">
            {stats.Departments.slice(0, 5).map((dept, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900">{dept.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{dept.employeeCount}</div>
                  <div className="text-xs text-gray-600">employees</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
