import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Building2, Users, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import DepartmentForm from '../components/DepartmentForm';
import DepartmentDetails from './DepartmentDetails';
import Toast from '../components/Toast';

export default function DepartmentsList() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, departmentId: null });
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [viewingDepartmentId, setViewingDepartmentId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDepartments();
      setDepartments(response.data.doc || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
      showToast('Failed to load departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (department = null) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDepartment(null);
  };

  const handleSubmit = async (formData) => {
    try {
      setIsSaving(true);
      if (editingDepartment) {
        await apiService.updateDepartment(editingDepartment._id, formData);
        showToast('Department updated successfully', 'success');
      } else {
        await apiService.createDepartment(formData);
        showToast('Department created successfully', 'success');
      }
      loadDepartments();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save department:', error);
      showToast(error.message || 'Failed to save department', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.departmentId) return;

    try {
      setDeleting(true);
      await apiService.deleteDepartment(deleteConfirm.departmentId);
      setDepartments(departments.filter((d) => d._id !== deleteConfirm.departmentId));
      setDeleteConfirm({ isOpen: false, departmentId: null });
      showToast('Department deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete department:', error);
      showToast(error.message || 'Failed to delete department', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const canManage = user?.role === 'admin' || user?.role === 'hr';

  // If viewing department details
  if (viewingDepartmentId) {
    return (
      <DepartmentDetails
        departmentId={viewingDepartmentId}
        onBack={() => setViewingDepartmentId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-1">Manage company departments</p>
        </div>
        {canManage && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Department
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-600">Loading departments...</div>
      ) : departments.length === 0 ? (
        <div className="p-8 text-center text-gray-600">No departments found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                {canManage && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingDepartmentId(dept._id)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenModal(dept)}
                      className="text-green-600 hover:text-green-900 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ isOpen: true, departmentId: dept._id })}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{dept.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{dept.description}</p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Employees</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{dept.employeeCount || 0}</span>
              </div>

              {dept.createdBy && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-600 font-semibold uppercase">Created by</p>
                  <p className="text-sm font-medium text-gray-900">{dept.createdBy?.name}</p>
                </div>
              )}

              {!canManage && (
                <button
                  onClick={() => setViewingDepartmentId(dept._id)}
                  className="w-full mt-4 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  View Details
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        title={editingDepartment ? 'Edit Department' : 'Add Department'}
        onClose={handleCloseModal}
        maxWidth="max-w-lg"
      >
        <DepartmentForm
          department={editingDepartment}
          onSubmit={handleSubmit}
          isLoading={isSaving}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Department"
        message="Are you sure you want to delete this department? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, departmentId: null })}
        isDangerous={true}
        isLoading={deleting}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
