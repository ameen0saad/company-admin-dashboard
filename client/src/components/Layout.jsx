import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Dashboard from '../pages/Dashboard';
import EmployeesList from '../pages/EmployeesList';
import PayrollList from '../pages/PayrollList';
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
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'employees':
        return <EmployeesList />;
      case 'payroll':
        return <PayrollList />;
      case 'departments':
        return <DepartmentsList />;
      case 'audit':
        return <AuditLogs />;
      case 'myTeam':
        return <MyTeam />;
      case 'myProfile':
        return <MyProfile />;
      case 'users':
        return <UserManagement />;
      case 'unassignedUsers':
        return <UnassignedUsers />;
      case 'InactiveUsers':
        return <InactiveUsers />;
      case 'employeeHomepage':
        return <EmployeeDashboard />;
      default:
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
