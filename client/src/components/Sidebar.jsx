import React from 'react';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Building2,
  FileText,
  LogOut,
  X,
  Home,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ currentPage, setCurrentPage, isMobileOpen, setIsMobileOpen }) {
  const { user, logout } = useAuth();

  // Menu items organized by role
  const getMenuItems = () => {
    const adminItems = [
      {
        id: 'dashboard',
        label: 'Company Status',
        icon: BarChart3,
        roles: ['admin'],
      },
      {
        id: 'departments',
        label: 'Departments',
        icon: Building2,
        roles: ['admin'],
      },
      {
        id: 'users',
        label: 'Users',
        icon: Users,
        roles: ['admin'],
      },
      {
        id: 'employees',
        label: 'Employees',
        icon: Users,
        roles: ['admin'],
      },

      {
        id: 'InactiveUsers',
        label: 'Inactive Users',
        icon: Users,
        roles: ['admin'],
      },
      {
        id: 'unassignedUsers',
        label: 'Unassigned Users',
        icon: Users,
        roles: ['admin'],
      },
      {
        id: 'payroll',
        label: 'Payroll',
        icon: DollarSign,
        roles: ['admin'],
      },
      {
        id: 'audit',
        label: 'Audit Logs',
        icon: FileText,
        roles: ['admin'],
      },
    ];

    const hrItems = [
      {
        id: 'dashboard',
        label: 'Company Status',
        icon: BarChart3,
        roles: ['hr'],
      },
      {
        id: 'employees',
        label: 'Employees',
        icon: Users,
        roles: ['hr'],
      },
      {
        id: 'unassignedUsers',
        label: 'Unassigned Users',
        icon: Users,
        roles: ['hr'],
      },
      {
        id: 'departments',
        label: 'Departments',
        icon: Building2,
        roles: ['hr'],
      },
      {
        id: 'payroll',
        label: 'Payroll',
        icon: DollarSign,
        roles: ['hr'],
      },
      {
        id: 'myPayroll',
        label: 'My Payroll',
        icon: DollarSign,
        roles: ['hr'],
      },
      {
        id: 'myTeam',
        label: 'My Team',
        icon: Users,
        roles: ['hr'],
      },
      {
        id: 'myProfile',
        label: 'My Profile',
        icon: Users,
        roles: ['hr'],
      },
    ];

    const employeeItems = [
      {
        id: 'employeeHomepage',
        label: 'Home',
        icon: Home,
        roles: ['employee'],
      },
      {
        id: 'myPayroll',
        label: 'My Payroll',
        icon: DollarSign,
        roles: ['employee'],
      },
      {
        id: 'myTeam',
        label: 'My Team',
        icon: Users,
        roles: ['employee'],
      },
      {
        id: 'myProfile',
        label: 'My Profile',
        icon: Users,
        roles: ['employee'],
      },
    ];

    if (user?.role === 'admin') return adminItems;
    if (user?.role === 'hr') return hrItems;
    if (user?.role === 'employee') return employeeItems;
    return [];
  };

  const menuItems = getMenuItems();

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
          {/* Logo Section */}
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

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.length > 0 ? (
              menuItems.map((item) => (
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
              ))
            ) : (
              <p className="text-center text-gray-500 text-sm py-4">No menu items available</p>
            )}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-600">{user?.email || 'user@example.com'}</p>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
