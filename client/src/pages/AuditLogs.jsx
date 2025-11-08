import React, { useState, useEffect } from 'react';
import { FileText, Eye, AlertCircle, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import apiService from '../services/api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [viewingLog, setViewingLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    before: true,
    after: true,
  });

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, searchTerm, actionFilter, modelFilter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAuditLogs();
      setLogs(response.data.doc || []);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      showToast('Failed to load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely get user data
  const getUserData = (user) => {
    if (!user) return { name: 'System', email: 'N/A', initial: 'S', role: null };
    if (typeof user === 'string')
      return { name: 'Unknown User', email: user, initial: '?', role: null };
    return {
      name: user.name || 'Unknown',
      email: user.email || 'N/A',
      initial: user.name?.charAt(0) || '?',
      role: user.role || null,
    };
  };

  const applyFilters = () => {
    let filtered = logs;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((log) => {
        const userData = getUserData(log.user);
        return (
          userData.name?.toLowerCase().includes(searchLower) ||
          log.model?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Action filter
    if (actionFilter) {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }

    // Model filter
    if (modelFilter) {
      filtered = filtered.filter((log) => log.model === modelFilter);
    }

    setFilteredLogs(filtered);
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = async (logId) => {
    try {
      setLoadingDetails(true);
      const response = await apiService.getAuditLog(logId);
      setViewingLog(response.data.doc);
      setIsModalOpen(true);
      setExpandedSections({ before: true, after: true });
    } catch (error) {
      console.error('Failed to load audit log details:', error);
      showToast('Failed to load audit details', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Safe JSON formatting function
  const formatJSON = (obj) => {
    try {
      if (obj === null || obj === undefined) return 'N/A';
      if (typeof obj === 'string') return obj;
      if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
      if (typeof obj === 'object') {
        return JSON.stringify(obj, null, 2);
      }
      return String(obj);
    } catch (error) {
      console.error('Error formatting data:', error);
      return 'Unable to display data';
    }
  };

  // Safe function to extract document ID from complex objects
  const getDocumentId = (documentId) => {
    if (!documentId) return 'N/A';
    if (typeof documentId === 'string') return documentId;
    if (typeof documentId === 'object' && documentId._id) {
      return documentId._id;
    }
    return 'N/A';
  };

  const getAllModels = () => {
    const models = new Set(logs.map((log) => log.model));
    return Array.from(models).sort();
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
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
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600 mt-1">Track all system changes and activities</p>
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
                placeholder="Search by user or model..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Models</option>
              {getAllModels().map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Results</label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-900">
              {filteredLogs.length} log(s)
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading audit logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 text-lg">
              {logs.length === 0 ? 'No audit logs found' : 'No results matching your filters'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.map((log) => {
                  const userData = getUserData(log.user);
                  return (
                    <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded inline-block ${getActionColor(
                              log.action
                            )}`}
                          >
                            {log.action.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">{log.model}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-xs">
                              {userData.initial}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{userData.name}</p>
                            <p className="text-xs text-gray-600">{userData.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{formatDate(log.timestamp)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleViewDetails(log._id)}
                          disabled={loadingDetails}
                          className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded transition-colors inline-flex disabled:opacity-50"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={isModalOpen}
        title={`${viewingLog?.action?.toUpperCase()} - ${viewingLog?.model}`}
        onClose={() => setIsModalOpen(false)}
        maxWidth="max-w-2xl"
      >
        {loadingDetails ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : viewingLog ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Action</p>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded inline-block ${getActionColor(
                    viewingLog.action
                  )}`}
                >
                  {viewingLog.action.toUpperCase()}
                </span>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Model</p>
                <p className="text-sm font-medium text-gray-900">{viewingLog.model}</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Document ID</p>
                <p className="text-sm text-gray-900 break-all font-mono text-xs">
                  {getDocumentId(viewingLog.documentId)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Timestamp</p>
                <p className="text-sm text-gray-900">{formatDate(viewingLog.timestamp)}</p>
              </div>
            </div>

            {/* User Info */}
            {viewingLog?.user &&
              (() => {
                const userData = getUserData(viewingLog.user);
                return (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-semibold text-gray-900 uppercase mb-3">
                      User Information
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{userData.initial}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{userData.name}</p>
                          <p className="text-xs text-gray-600">{userData.email}</p>
                        </div>
                      </div>
                      {userData.role && (
                        <div className="bg-white rounded px-3 py-2">
                          <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Role</p>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded capitalize inline-block ${
                              userData.role === 'admin'
                                ? 'bg-red-100 text-red-800'
                                : userData.role === 'hr'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {userData.role}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

            {/* Changes Section */}
            {viewingLog.changes && Object.keys(viewingLog.changes).length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-semibold text-gray-900 uppercase mb-3">Changes Made</p>
                <div className="space-y-2">
                  {Object.entries(viewingLog.changes).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-2">{key}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-2 rounded border border-red-200">
                          <p className="text-xs text-red-600 font-semibold mb-1">From:</p>
                          <pre className="text-xs text-gray-900 font-mono break-all bg-red-50 p-1 rounded overflow-auto max-h-32">
                            {formatJSON(value?.from)}
                          </pre>
                        </div>
                        <div className="bg-white p-2 rounded border border-green-200">
                          <p className="text-xs text-green-600 font-semibold mb-1">To:</p>
                          <pre className="text-xs text-gray-900 font-mono break-all bg-green-50 p-1 rounded overflow-auto max-h-32">
                            {formatJSON(value?.to)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Before Data */}
            {viewingLog.before && (
              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={() => toggleSection('before')}
                  className="w-full flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors mb-2"
                >
                  <p className="text-sm font-semibold text-gray-900 uppercase">Before Data</p>
                  {expandedSections.before ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {expandedSections.before && (
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-64 border border-gray-700">
                    {formatJSON(viewingLog.before)}
                  </pre>
                )}
              </div>
            )}

            {/* After Data */}
            {viewingLog.after && (
              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={() => toggleSection('after')}
                  className="w-full flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors mb-2"
                >
                  <p className="text-sm font-semibold text-gray-900 uppercase">After Data</p>
                  {expandedSections.after ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {expandedSections.after && (
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-64 border border-gray-700">
                    {formatJSON(viewingLog.after)}
                  </pre>
                )}
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
