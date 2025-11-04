import React from 'react';
import { LayoutDashboard, Users, DollarSign, Building2, FileText, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ currentPage, setCurrentPage, isMobileOpen, setIsMobileOpen }) {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'hr', 'employee'],
    },
    { id: 'employees', label: 'Employees', icon: Users, roles: ['admin', 'hr'] },
    {
      id: 'payroll',
      label: 'Payroll',
      icon: DollarSign,
      roles: ['admin', 'hr', 'employee'],
    },
    {
      id: 'departments',
      label: 'Departments',
      icon: Building2,
      roles: ['admin', 'hr', 'employee'],
    },
    { id: 'audit', label: 'Audit Logs', icon: FileText, roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(user?.role));

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 z-50 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">HR System</h2>
                  <p className="text-xs text-gray-600 capitalize">{user?.role || 'User'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-600">{user?.email || 'user@example.com'}</p>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
