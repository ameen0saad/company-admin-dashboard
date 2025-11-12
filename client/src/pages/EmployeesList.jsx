import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmployeeForm from '../components/EmployeeForm';
import Toast from '../components/Toast';

export default function EmployeesList() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, employeeId: null });
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await apiService.getEmployees();
      setEmployees(response.data.doc || []);
    } catch (error) {
      console.error('Failed to load employees:', error);
      showToast('Failed to load employees', 'error');
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

  const filteredEmployees = employees.filter((emp) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      emp.employeeId?.name?.toLowerCase().includes(searchLower) ||
      emp.employeeId?.email?.toLowerCase().includes(searchLower) ||
      emp.department?.name?.toLowerCase().includes(searchLower)
    );
  });

  const handleOpenModal = (employee = null) => {
    setEditingEmployee(employee);
    setViewingEmployee(null);
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (employee) => {
    setViewingEmployee(employee);
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setViewingEmployee(null);
  };

  const handleSubmit = async (formData) => {
    try {
      setIsSaving(true);
      if (editingEmployee) {
        await apiService.updateEmployee(editingEmployee._id, formData);
        showToast('Employee updated successfully', 'success');
      } else {
        await apiService.createEmployee(formData);
        showToast('Employee created successfully', 'success');
      }
      loadEmployees();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save employee:', error);
      showToast(error.message || 'Failed to save employee', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.employeeId) return;

    try {
      setDeleting(true);
      await apiService.deleteEmployee(deleteConfirm.employeeId);
      setEmployees(employees.filter((e) => e._id !== deleteConfirm.employeeId));
      setDeleteConfirm({ isOpen: false, employeeId: null });
      showToast('Employee deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete employee:', error);
      showToast(error.message || 'Failed to delete employee', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const canManage = user?.role === 'admin' || user?.role === 'hr';

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-1">Manage your workforce</p>
        </div>
        {canManage && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Employee
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search employees..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading employees...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-8 text-center text-gray-600">No employees found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                          {employee.employeeId?.photo.startsWith('u') ? (
                            <img
                              src={`http://127.0.0.1:3000/img/users/${employee.employeeId?.photo}`}
                              alt={employee.employeeId?.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-semibold">
                              {employee.employeeId?.name?.charAt(0) || '?'}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.employeeId?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.employeeId?.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                        {employee.department?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {employee.employeeId?.role || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{employee.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${employee.salary?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(employee.joiningDate)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenViewModal(employee)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canManage && (
                          <>
                            <button
                              onClick={() => handleOpenModal(employee)}
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({ isOpen: true, employeeId: employee._id })
                              }
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        title={
          viewingEmployee
            ? `${viewingEmployee.employeeId?.name} - Details`
            : editingEmployee
            ? 'Edit Employee'
            : 'Add Employee'
        }
        onClose={handleCloseModal}
        maxWidth="max-w-lg"
      >
        {viewingEmployee ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Name</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {viewingEmployee.employeeId?.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Email</p>
                <p className="text-sm text-gray-900 mt-1 break-all">
                  {viewingEmployee.employeeId?.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Department</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {viewingEmployee.department?.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Role</p>
                <p className="text-sm font-medium text-gray-900 mt-1 capitalize">
                  {viewingEmployee.employeeId?.role}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Salary</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  ${viewingEmployee.salary?.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Phone</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{viewingEmployee.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-600 font-semibold uppercase">Address</p>
                <p className="text-sm text-gray-900 mt-1">{viewingEmployee.address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Date of Birth</p>
                <p className="text-sm text-gray-900 mt-1">
                  {formatDate(viewingEmployee.dateOfBirth)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Joining Date</p>
                <p className="text-sm text-gray-900 mt-1">
                  {formatDate(viewingEmployee.joiningDate)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <EmployeeForm
            employee={editingEmployee}
            departments={departments}
            onSubmit={handleSubmit}
            isLoading={isSaving}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, employeeId: null })}
        isDangerous={true}
        isLoading={deleting}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
