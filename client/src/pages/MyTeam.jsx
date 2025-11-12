import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, MapPin, Calendar, AlertCircle, Search, Building2 } from 'lucide-react';
import apiService from '../services/api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

export default function MyTeam() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingMember, setViewingMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getMyTeam();
      console.log(response);
      setTeam(response.data.myTeam || []);
    } catch (err) {
      console.error('Failed to load team:', err);
      setError(err.message || 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const filteredTeam = team.filter(
    (member) =>
      member.employeeId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employeeId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleViewDetails = (member) => {
    setViewingMember(member);
    setIsModalOpen(true);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Team</h1>
        <p className="text-gray-600 mt-1">View your department colleagues</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Error Loading Team</h3>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {team.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Team Members */}
      {filteredTeam.length === 0 ? (
        <div className="bg-gray-50 rounded-xl shadow-sm p-12 text-center border border-gray-200">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            {team.length === 0 ? 'No team members found' : 'No results matching your search'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeam.map((member) => (
            <div
              key={member._id}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleViewDetails(member)}
            >
              {/* Header with Avatar */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  {member.employeeId.photo.startsWith('u') ? (
                    <img
                      src={`http://127.0.0.1:3000/img/users/${member.employeeId?.photo}`}
                      alt={member.employeeId?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {member.employeeId?.name?.charAt(0) || '?'}
                    </span>
                  )}
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                    member.employeeId?.role === 'admin'
                      ? 'bg-red-100 text-red-800'
                      : member.employeeId?.role === 'hr'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {member.employeeId?.role || 'N/A'}
                </span>
              </div>

              {/* Name and Title */}
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {member.employeeId?.name || 'N/A'}
              </h3>
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                <Building2 className="w-4 h-4" />
                <span>{member.department?.name || 'N/A'}</span>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-4"></div>

              {/* Contact Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-gray-600 break-all">
                    {member.employeeId?.email || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{member.phone || 'N/A'}</span>
                </div>

                {member.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600 line-clamp-2">{member.address}</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-4"></div>

              {/* Employment Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-1">
                    Joined
                  </p>
                  <p className="text-sm text-gray-900">{formatDate(member.joiningDate)}</p>
                </div>
              </div>

              {/* View Details Link */}
              <button className="w-full mt-4 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {team.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            Showing <span className="font-semibold">{filteredTeam.length}</span> of{' '}
            <span className="font-semibold">{team.length}</span> team member(s)
          </p>
        </div>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={isModalOpen}
        title={`${viewingMember?.employeeId?.name} - Team Member Details`}
        onClose={() => setIsModalOpen(false)}
        maxWidth="max-w-lg"
      >
        {viewingMember && (
          <div className="space-y-6">
            {/* Personal Info */}
            <div>
              <p className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Personal Information
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Name</p>
                  <p className="text-sm text-gray-900">{viewingMember.employeeId?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Email</p>
                  <p className="text-sm text-gray-900 break-all">
                    {viewingMember.employeeId?.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Phone</p>
                  <p className="text-sm text-gray-900">{viewingMember.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Role</p>
                  <p className="text-sm text-gray-900 capitalize">
                    {viewingMember.employeeId?.role || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Employment Info */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Employment Information
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Department</p>
                  <p className="text-sm text-gray-900">{viewingMember.department?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">Joining Date</p>
                  <p className="text-sm text-gray-900">{formatDate(viewingMember.joiningDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                    Date of Birth
                  </p>
                  <p className="text-sm text-gray-900">{formatDate(viewingMember.dateOfBirth)}</p>
                </div>
              </div>
            </div>

            {/* Address */}
            {viewingMember.address && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                  Address
                </p>
                <p className="text-sm text-gray-900">{viewingMember.address}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
