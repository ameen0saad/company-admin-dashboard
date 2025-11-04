import React, { useState, useEffect } from 'react';
import { Plus, Building2, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

export default function DepartmentsList() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await apiService.getDepartments();
      setDepartments(response.data.doc || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const canManage = user?.role === 'admin' || user?.role === 'hr';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-1">Manage company departments</p>
        </div>
        {canManage && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <Plus className="w-5 h-5" />
            Add Department
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-600">Loading departments...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                {canManage && (
                  <div className="flex items-center gap-2">
                    <button className="text-green-600 hover:text-green-900">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{dept.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{dept.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-600">Employees</span>
                <span className="text-lg font-bold text-gray-900">{dept.employeeCount || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
