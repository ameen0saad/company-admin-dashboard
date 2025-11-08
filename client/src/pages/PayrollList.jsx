import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import PayrollForm from '../components/PayrollForm';
import Toast from '../components/Toast';

export default function PayrollList() {
  const [payrolls, setPayrolls] = useState([]);
  const [filteredPayrolls, setFilteredPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingPayroll, setViewingPayroll] = useState(null);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, payrollId: null });
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const { user, isEmployee } = useAuth();

  useEffect(() => {
    loadPayrolls();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payrolls, searchTerm, filterMonth, filterYear]);

  const loadPayrolls = async () => {
    try {
      setLoading(true);
      let response;
      if (isEmployee()) {
        response = await apiService.getMyPayrolls();
        setPayrolls(response.data.payrolls || response.data.doc || []);
      } else {
        response = await apiService.getPayrolls();
        setPayrolls(response.data.doc || []);
      }
    } catch (error) {
      console.error('Failed to load payrolls:', error);
      showToast('Failed to load payrolls', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = payrolls;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.employeeProfileId?.employeeId?.name?.toLowerCase().includes(searchLower) ||
          p.employeeProfileId?.employeeId?.email?.toLowerCase().includes(searchLower)
      );
    }

    // Month filter
    if (filterMonth) {
      filtered = filtered.filter((p) => p.month === parseInt(filterMonth));
    }

    // Year filter
    if (filterYear) {
      filtered = filtered.filter((p) => p.year === parseInt(filterYear));
    }

    setFilteredPayrolls(filtered);
  };

  const handleOpenModal = (payroll = null) => {
    setEditingPayroll(payroll);
    setViewingPayroll(null);
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (payroll) => {
    setViewingPayroll(payroll);
    setEditingPayroll(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPayroll(null);
    setViewingPayroll(null);
  };

  const handleSubmit = async (formData) => {
    try {
      setIsSaving(true);
      if (editingPayroll) {
        await apiService.updatePayroll(editingPayroll._id, formData);
        showToast('Payroll updated successfully', 'success');
      } else {
        await apiService.createPayroll(formData);
        showToast('Payroll created successfully', 'success');
      }
      loadPayrolls();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save payroll:', error);
      showToast(error.message || 'Failed to save payroll', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.payrollId) return;

    try {
      setDeleting(true);
      await apiService.deletePayroll(deleteConfirm.payrollId);
      setPayrolls(payrolls.filter((p) => p._id !== deleteConfirm.payrollId));
      setDeleteConfirm({ isOpen: false, payrollId: null });
      showToast('Payroll deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete payroll:', error);
      showToast(error.message || 'Failed to delete payroll', 'error');
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
          <h1 className="text-3xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-600 mt-1">
            {isEmployee() ? 'Your payment history' : 'Manage employee payroll'}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Payroll
          </button>
        )}
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
                placeholder="Search employee..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Months</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              type="number"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              min="2020"
              max={new Date().getFullYear()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Results</label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
              {filteredPayrolls.length} payroll(s)
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading payrolls...</div>
        ) : filteredPayrolls.length === 0 ? (
          <div className="p-8 text-center text-gray-600">No payroll records found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Period
                  </th>
                  {canManage && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Employee
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Base Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Bonus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Deductions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Net Pay
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayrolls.map((payroll) => (
                  <tr key={payroll._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {payroll.MonthName} {payroll.year}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">
                            {payroll.employeeProfileId?.employeeId?.name || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-600">
                            {payroll.employeeProfileId?.employeeId?.email}
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${payroll.employeeProfileId?.salary?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium">
                      +${payroll.bonus?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600 font-medium">
                      -${payroll.deductions?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      ${payroll.netPay?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(payroll.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenViewModal(payroll)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canManage && (
                          <>
                            <button
                              onClick={() => handleOpenModal(payroll)}
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({ isOpen: true, payrollId: payroll._id })
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

      {/* Modal for Create/Edit/View */}
      <Modal
        isOpen={isModalOpen}
        title={
          viewingPayroll ? 'Payroll Details' : editingPayroll ? 'Edit Payroll' : 'Create Payroll'
        }
        onClose={handleCloseModal}
        maxWidth="max-w-lg"
      >
        {viewingPayroll ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">Period</p>
                <p className="text-sm font-medium text-gray-900">
                  {viewingPayroll.MonthName} {viewingPayroll.year}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">Employee</p>
                <p className="text-sm font-medium text-gray-900">
                  {viewingPayroll.employeeProfileId?.employeeId?.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">Base Salary</p>
                <p className="text-sm font-medium text-gray-900">
                  ${viewingPayroll.employeeProfileId?.salary?.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">Bonus</p>
                <p className="text-sm font-medium text-green-600">
                  +${viewingPayroll.bonus?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">Deductions</p>
                <p className="text-sm font-medium text-red-600">
                  -${viewingPayroll.deductions?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">Net Pay</p>
                <p className="text-sm font-bold text-blue-600">
                  ${viewingPayroll.netPay?.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Payment Date</p>
              <p className="text-sm text-gray-900">
                {new Date(viewingPayroll.paymentDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        ) : (
          <PayrollForm payroll={editingPayroll} onSubmit={handleSubmit} isLoading={isSaving} />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Payroll"
        message="Are you sure you want to delete this payroll record? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, payrollId: null })}
        isDangerous={true}
        isLoading={deleting}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
