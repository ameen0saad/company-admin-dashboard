import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmployeeForm from '../components/EmployeeForm';
import Toast from '../components/Toast';

export default function UnassignedUsers() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, userId: null });
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    loadUsers();
    loadDepartments();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUnassignedUsers();
      setUsers(response.data || []);
    } catch (err) {
      console.error('Failed to load unassigned users:', err);
      setError(err.message || 'Failed to load unassigned users');
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await apiService.getDepartments();
      setDepartments(response.data.doc || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const filteredUsers = users.filter((u) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(searchLower) || u.email?.toLowerCase().includes(searchLower)
    );
  });

  const handleOpenModal = (u) => {
    setViewingUser(u);
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setViewingUser(null);
    setEditingEmployee(null);
  };

  const handleCreateEmployee = async (formData) => {
    try {
      setIsSaving(true);
      // Make sure we're using the correct user ID from viewingUser
      const updatedFormData = {
        ...formData,
        employeeId: viewingUser._id,
      };

      await apiService.createEmployee(updatedFormData);
      showToast('Employee profile created successfully', 'success');
      loadUsers();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to create employee:', error);
      showToast(error.message || 'Failed to create employee profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.userId) return;

    try {
      setDeleting(true);
      await apiService.deleteUser(deleteConfirm.userId);
      setUsers(users.filter((u) => u._id !== deleteConfirm.userId));
      setDeleteConfirm({ isOpen: false, userId: null });
      showToast('User deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete user:', error);
      showToast(error.message || 'Failed to delete user', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const canManage = user?.role === 'admin' || user?.role === 'hr';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Unassigned Users</h1>
          <p className="text-gray-600 mt-1">Users without employee profiles</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading unassigned users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            {users.length === 0
              ? 'No unassigned users found. All users have employee profiles!'
              : 'No results matching your search'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                  {canManage && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                          {u.photo && u.photo.startsWith('u') ? (
                            <img
                              src={`https://company-admin-dashboard.vercel.app/img/users/${u.photo}`}
                              alt={u.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-semibold">
                              {u.name?.charAt(0) || '?'}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{u.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">No profile yet</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 break-all">
                      {u.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                          u.role === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : u.role === 'hr'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {u.role || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(u)}
                            className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded transition-colors"
                            title="Create employee profile"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ isOpen: true, userId: u._id })}
                            className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        title={`Create Profile for ${viewingUser?.name || 'User'}`}
        onClose={handleCloseModal}
        maxWidth="max-w-lg"
      >
        {viewingUser && (
          <div className="space-y-4">
            {/* User Info Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Name</p>
                  <p className="text-sm font-medium text-gray-900">{viewingUser.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Email</p>
                  <p className="text-sm font-medium text-gray-900 break-all">{viewingUser.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Role</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{viewingUser.role}</p>
                </div>
              </div>
            </div>

            {/* Employee Form */}
            {/* Employee Form with pre-selected user */}
            <EmployeeForm
              employee={{
                employeeId: {
                  _id: viewingUser._id,
                  name: viewingUser.name,
                  email: viewingUser.email,
                  role: viewingUser.role,
                },
              }}
              departments={departments}
              onSubmit={handleCreateEmployee}
              isLoading={isSaving}
            />
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, userId: null })}
        isDangerous={true}
        isLoading={deleting}
      />

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
