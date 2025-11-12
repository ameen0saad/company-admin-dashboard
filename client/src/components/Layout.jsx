import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Dashboard from '../pages/Dashboard';
import EmployeesList from '../pages/EmployeesList';
import PayrollList from '../pages/PayrollList';
import MyPayroll from '../pages/MyPayroll';
import DepartmentsList from '../pages/DepartmentsList';
import AuditLogs from '../pages/AuditLogs';
import MyTeam from '../pages/MyTeam';
import MyProfile from '../pages/MyProfile';
import UserManagement from '../pages/UserManagement';
import UnassignedUsers from '../pages/UnassignedUsers';
import InactiveUsers from '../pages/InactiveUsers';
import EmployeeDashboard from '../pages/EmployeeHomepage';

export default function Layout() {
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    // Set default page based on role
    if (user?.role === 'employee') return 'employeeHomepage';
    if (user?.role === 'hr' || user?.role === 'admin') return 'dashboard';
    return 'employeeHomepage';
  });

  // Update default page if role changes
  useEffect(() => {
    if (user?.role === 'employee') {
      setCurrentPage('employeeHomepage');
    } else if (user?.role === 'hr' || user?.role === 'admin') {
      setCurrentPage('dashboard');
    }
  }, [user?.role]);

  const renderPage = () => {
    switch (currentPage) {
      // Admin/HR - Company Status Dashboard
      case 'dashboard':
        if (user?.role === 'admin' || user?.role === 'hr') {
          return <Dashboard />;
        }
        return <EmployeeDashboard />;

      // Employees List (Admin/HR only)
      case 'employees':
        if (user?.role === 'admin' || user?.role === 'hr') {
          return <EmployeesList />;
        }
        return <EmployeeDashboard />;

      case 'payroll':
        if (user?.role === 'admin' || user?.role === 'hr') {
          return <PayrollList />;
        }
        return <EmployeeDashboard />;

      // My Payroll (All roles)
      case 'myPayroll':
        return <MyPayroll />;

      // Departments (All roles)
      case 'departments':
        return <DepartmentsList />;

      // Audit Logs (Admin only)
      case 'audit':
        if (user?.role === 'admin') {
          return <AuditLogs />;
        }
        return <EmployeeDashboard />;

      // My Team (HR/Employee)
      case 'myTeam':
        if (user?.role === 'hr' || user?.role === 'employee') {
          return <MyTeam />;
        }
        return <EmployeeDashboard />;

      // My Profile (All roles)
      case 'myProfile':
        return <MyProfile />;

      // Users Management (Admin only)
      case 'users':
        if (user?.role === 'admin') {
          return <UserManagement />;
        }
        return <EmployeeDashboard />;

      // Unassigned Users (Admin/HR only)
      case 'unassignedUsers':
        if (user?.role === 'admin' || user?.role === 'hr') {
          return <UnassignedUsers />;
        }
        return <EmployeeDashboard />;

      // Inactive Users (Admin only)
      case 'InactiveUsers':
        if (user?.role === 'admin') {
          return <InactiveUsers />;
        }
        return <EmployeeDashboard />;

      // Employee Homepage
      case 'employeeHomepage':
        return <EmployeeDashboard />;

      default:
        // Default based on role
        if (user?.role === 'employee') {
          return <EmployeeDashboard />;
        }
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4 ml-auto">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-600 capitalize">{user?.role || 'Role'}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">{user?.name?.charAt(0) || 'U'}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{renderPage()}</main>
      </div>
    </div>
  );
}
