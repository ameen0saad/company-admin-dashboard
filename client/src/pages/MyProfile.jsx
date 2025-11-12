import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Calendar, Briefcase, Building2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

export default function MyProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getMyProfile();
      setProfile(response.data.employeeProfile);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gray-200 rounded-xl h-64 animate-pulse"></div>
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-200 rounded-xl h-48 animate-pulse"></div>
            <div className="bg-gray-200 rounded-xl h-32 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Your employee information</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-1">No Employee Profile</h3>
            <p className="text-yellow-800">
              {error ||
                "You don't have an employee profile yet. Please contact HR to complete your registration."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Your employee information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Info Card */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
              {user.photo.startsWith('u') ? (
                <img
                  src={`http://127.0.0.1:3000/img/users/${user?.photo}`}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold">{user?.name?.charAt(0) || '?'}</span>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name || 'N/A'}</h2>
            <p className="text-sm text-gray-600 capitalize mt-1">{user?.role || 'N/A'}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-600">Email</p>
                <p className="text-sm font-medium text-gray-900 break-all">
                  {user?.email || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-600">Phone</p>
                <p className="text-sm font-medium text-gray-900">{profile.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-2">
                Status
              </p>
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Active Employee
              </span>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Employment Details */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Employment Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                    Department
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {profile.department?.name || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                    Salary
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    ${profile.salary?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                    Joining Date
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatDate(profile.joiningDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                    Date of Birth
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatDate(profile.dateOfBirth)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                  Address
                </h4>
                <p className="text-gray-900 leading-relaxed">{profile.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {profile.createdAt && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-2">
                Profile Created
              </p>
              <p className="text-sm text-gray-900">{formatDate(profile.createdAt)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
