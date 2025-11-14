import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, AlertCircle, UserPlus } from 'lucide-react';
import apiService from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import UserForm from '../components/UserForm';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, userId: null });
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // New states for view and edit functionality
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUsers();
      setUsers(response.data.doc || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err.message || 'Failed to load users');
      showToast('Failed to load users', 'error');
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

    // Status filter
    if (statusFilter) {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter((user) => user.active === isActive);
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = async (formData) => {
    try {
      setIsCreating(true);
      await apiService.signup(formData);
      showToast('User created successfully', 'success');
      loadUsers();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create user:', err);
      showToast(err.message || 'Failed to create user', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditUser = async (formData) => {
    if (!selectedUser) return;

    try {
      setIsEditing(true);
      await apiService.updateUser(selectedUser._id, formData);
      showToast('User updated successfully', 'success');
      loadUsers();
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to update user:', err);
      showToast(err.message || 'Failed to update user', 'error');
    } finally {
      setIsEditing(false);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm.userId) return;

    try {
      setDeleting(true);
      await apiService.deleteUser(deleteConfirm.userId, { active: false });
      setUsers(users.map((u) => (u._id === deleteConfirm.userId ? { ...u, active: false } : u)));
      setDeleteConfirm({ isOpen: false, userId: null });
      showToast('User deactivated successfully', 'success');
      loadUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
      showToast(err.message || 'Failed to delete user', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
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

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return '👨‍💼';
      case 'hr':
        return '👤';
      case 'employee':
        return '👥';
      default:
        return '❓';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and roles</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors font-medium"
        >
          <UserPlus className="w-5 h-5" />
          Create New User
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

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
                placeholder="Search users..."
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
              <option value="admin">Admin</option>
              <option value="hr">HR</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Results</label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-900">
              {filteredUsers.length} user(s)
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 text-lg">
              {users.length === 0 ? 'No users found' : 'No results matching your filters'}
            </p>
            {users.length === 0 && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First User
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
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
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 break-all">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getRoleIcon(user.role)}</span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{formatDate(user.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          title="View Details"
                          className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(user)}
                          title="Edit User"
                          className="text-green-600 hover:text-green-900 hover:bg-green-50 p-2 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, userId: user._id })}
                          title={user.active ? 'Deactivate' : 'Delete'}
                          className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded transition-colors"
                          disabled={!user.active}
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Create User Modal */}
      <Modal
        isOpen={isModalOpen}
        title="Create New User"
        onClose={() => setIsModalOpen(false)}
        maxWidth="max-w-lg"
      >
        <UserForm onSubmit={handleCreateUser} isLoading={isCreating} />
      </Modal>

      {/* View User Modal */}
      <Modal
        isOpen={isViewModalOpen}
        title="User Details"
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedUser(null);
        }}
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
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    selectedUser.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {selectedUser.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Created</p>
                <p className="text-gray-900">{formatDate(selectedUser.createdAt)}</p>
              </div>
            </div>

            {selectedUser.updatedAt && (
              <div className="text-sm">
                <p className="text-gray-600 font-medium">Last Updated</p>
                <p className="text-gray-900">{formatDate(selectedUser.updatedAt)}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        title="Edit User"
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        maxWidth="max-w-lg"
      >
        {selectedUser && (
          <UserForm
            onSubmit={handleEditUser}
            isLoading={isEditing}
            initialData={{
              name: selectedUser.name,
              email: selectedUser.email,
              role: selectedUser.role,
              // Note: We don't pre-fill password fields for security
            }}
            isEdit={true}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Deactivate User"
        message="Are you sure you want to deactivate this user? They will not be able to access the system."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, userId: null })}
        isDangerous={true}
        confirmText="Deactivate"
        isLoading={deleting}
      />

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
