import React, { useState, useEffect } from 'react';
import { UserX, Mail, UserCheck, Search, Filter, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import apiService from '../services/api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

export default function InactiveUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [activateConfirm, setActivateConfirm] = useState({
    isOpen: false,
    userId: null,
    userName: '',
    userEmail: '',
  });

  useEffect(() => {
    loadInactiveUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, roleFilter]);

  const loadInactiveUsers = async () => {
    try {
      setLoading(true);
      // Assuming your API has a way to filter inactive users
      const response = await apiService.getInactiveUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to load inactive users:', error);
      showToast('Failed to load inactive users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)
      );
    }

    // Role filter
    if (roleFilter) {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleActivateClick = (user) => {
    setActivateConfirm({
      isOpen: true,
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
    });
  };

  const handleActivateConfirm = async () => {
    try {
      setActionLoading(true);
      await apiService.updateUser(activateConfirm.userId, { active: true });
      showToast(`User ${activateConfirm.userName} activated successfully`, 'success');

      // Remove from list
      setUsers((prev) => prev.filter((user) => user._id !== activateConfirm.userId));
      setFilteredUsers((prev) => prev.filter((user) => user._id !== activateConfirm.userId));

      // Close modals
      setIsModalOpen(false);
      setActivateConfirm({ isOpen: false, userId: null, userName: '', userEmail: '' });
    } catch (error) {
      console.error('Failed to activate user:', error);
      showToast(error.message || 'Failed to activate user', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateCancel = () => {
    setActivateConfirm({ isOpen: false, userId: null, userName: '', userEmail: '' });
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleSendActivationEmail = async (user) => {
    try {
      setActionLoading(true);
      // Implement your email service call here
      await apiService.sendActivationEmail(user._id);
      showToast('Activation email sent successfully', 'success');
    } catch (error) {
      console.error('Failed to send activation email:', error);
      showToast('Failed to send activation email', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'hr':
        return 'bg-purple-100 text-purple-800';
      case 'employee':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getAllRoles = () => {
    const roles = new Set(users.map((user) => user.role));
    return Array.from(roles).sort();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="bg-gray-200 rounded-xl h-20 animate-pulse"></div>
        <div className="bg-gray-200 rounded-xl h-96 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inactive Users</h1>
        <p className="text-gray-600 mt-1">Manage and activate suspended user accounts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              <p className="text-sm text-gray-600">Total Inactive</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <UserX className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.role === 'hr').length}
              </p>
              <p className="text-sm text-gray-600">HR Users</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserX className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.role === 'employee').length}
              </p>
              <p className="text-sm text-gray-600">Employees</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <UserX className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.role === 'admin').length}
              </p>
              <p className="text-sm text-gray-600">Admins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Roles</option>
              {getAllRoles().map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Results</label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-900">
              {filteredUsers.length} user(s)
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadInactiveUsers}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Refresh List
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading inactive users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <UserCheck className="w-12 h-12 text-green-300 mx-auto mb-3" />
            <p className="text-gray-600 text-lg">
              {users.length === 0 ? 'No inactive users found' : 'No results matching your filters'}
            </p>
            <p className="text-gray-500 text-sm mt-1">All user accounts are currently active</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                          {user.photo && user.photo.startsWith('u') ? (
                            <img
                              src={`https://company-admin-dashboard.vercel.app/img/users/${user.photo}`}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-semibold">
                              {user.name?.charAt(0) || '?'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded capitalize ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <UserX className="w-3 h-3 mr-1" />
                        Inactive
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{formatDate(user.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleActivateClick(user)}
                          disabled={actionLoading}
                          className="text-green-600 hover:text-green-900 hover:bg-green-50 p-2 rounded transition-colors disabled:opacity-50"
                          title="Activate user"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSendActivationEmail(user)}
                          disabled={actionLoading}
                          className="text-purple-600 hover:text-purple-900 hover:bg-purple-50 p-2 rounded transition-colors disabled:opacity-50"
                          title="Send activation email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activation Confirmation Dialog */}
      <ConfirmDialog
        isOpen={activateConfirm.isOpen}
        title="Activate User"
        message={`Are you sure you want to activate ${activateConfirm.userName} (${activateConfirm.userEmail})? They will be able to access the system immediately.`}
        onConfirm={handleActivateConfirm}
        onCancel={handleActivateCancel}
        isDangerous={false}
        confirmText="Activate"
        cancelText="Cancel"
        isLoading={actionLoading}
      />

      {/* User Details Modal */}
      <Modal
        isOpen={isModalOpen}
        title="User Details"
        onClose={() => setIsModalOpen(false)}
        maxWidth="max-w-md"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                {selectedUser.photo && selectedUser.photo.startsWith('u') ? (
                  <img
                    src={`https://company-admin-dashboard.vercel.app/img/users/${selectedUser.photo}`}
                    alt={selectedUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-lg">
                    {selectedUser.name?.charAt(0) || '?'}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h3>
                <p className="text-gray-600">{selectedUser.email}</p>
                <span
                  className={`mt-1 px-2 py-1 text-xs font-medium rounded capitalize ${getRoleColor(
                    selectedUser.role
                  )}`}
                >
                  {selectedUser.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 font-medium">Status</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Inactive
                </span>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Created</p>
                <p className="text-gray-900">{formatDate(selectedUser.createdAt)}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">Actions</p>
              <div className="space-y-2">
                <button
                  onClick={() => handleActivateClick(selectedUser)}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  Activate User
                </button>
                <button
                  onClick={() => handleSendActivationEmail(selectedUser)}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  <Mail className="w-4 h-4" />
                  Send Activation Email
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
