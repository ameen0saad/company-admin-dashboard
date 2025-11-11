import React, { useState, useEffect } from 'react';

export default function UserForm({ onSubmit, isLoading, initialData, isEdit = false }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: 'employee',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form with initial data when in edit mode
  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '', // Don't pre-fill passwords for security
        passwordConfirm: '',
        role: initialData.role || 'employee',
      });
    }
  }, [isEdit, initialData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Only validate password for new users
    if (!isEdit) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (!formData.passwordConfirm) {
        newErrors.passwordConfirm = 'Please confirm your password';
      } else if (formData.password !== formData.passwordConfirm) {
        newErrors.passwordConfirm = 'Passwords do not match';
      }
    }

    // Validate password if provided in edit mode (optional update)
    if (isEdit && formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (!formData.passwordConfirm) {
        newErrors.passwordConfirm = 'Please confirm your password';
      } else if (formData.password !== formData.passwordConfirm) {
        newErrors.passwordConfirm = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('role', formData.role);

      // Only append password if provided (for edit mode) or required (for create mode)
      if (formData.password) {
        data.append('password', formData.password);
        data.append('passwordConfirm', formData.passwordConfirm);
      }

      if (formData.photo) data.append('photo', formData.photo);

      onSubmit(data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="John Doe"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="john@example.com"
          disabled={isEdit} // Email shouldn't be changed in edit mode
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        {isEdit && <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="employee">Employee</option>
          <option value="hr">HR</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
        <input
          type="file"
          name="photo"
          accept="image/*"
          onChange={(e) => setFormData((prev) => ({ ...prev, photo: e.target.files[0] }))}
          className="w-full"
        />
        {isEdit && <p className="text-xs text-gray-500 mt-1">Leave empty to keep current photo</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {isEdit ? 'New Password (optional)' : 'Password'}
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={
              isEdit ? 'Enter new password (optional)' : 'Enter password (min 8 characters)'
            }
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        {isEdit && (
          <p className="text-xs text-gray-500 mt-1">
            Leave password fields empty to keep current password
          </p>
        )}
      </div>

      {formData.password && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm {isEdit ? 'New ' : ''}Password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.passwordConfirm ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={`Confirm ${isEdit ? 'new ' : ''}password`}
          />
          {errors.passwordConfirm && (
            <p className="text-red-500 text-xs mt-1">{errors.passwordConfirm}</p>
          )}
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
        >
          {isLoading
            ? isEdit
              ? 'Updating User...'
              : 'Creating User...'
            : isEdit
            ? 'Update User'
            : 'Create User'}
        </button>
      </div>
    </form>
  );
}
