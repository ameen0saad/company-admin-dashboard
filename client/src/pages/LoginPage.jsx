import React, { useState } from 'react';
import { Building2, Mail, Lock, AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    // CRITICAL: Prevent form submission and page refresh
    e.preventDefault();
    e.stopPropagation();

    // Don't submit if already loading
    if (loading) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate inputs
      if (!email || !email.trim()) {
        setError('Please enter your email address');
        setLoading(false);
        return;
      }

      if (!password) {
        setError('Please enter your password');
        setLoading(false);
        return;
      }

      // Call login API
      const response = await apiService.login(email, password);

      // Verify response structure
      if (!response || !response.data || !response.data.user || !response.token) {
        setError('Invalid login response from server. Please try again.');
        setLoading(false);
        return;
      }

      // Store token and user info
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Show success message
      setSuccess(`Welcome back, ${response.data.user.name}!`);

      // Clear form
      setEmail('');
      setPassword('');
      setShowPassword(false);

      // Update auth context (this triggers redirect, not page refresh)
      login(response.data.user, response.token);

      setLoading(false);
    } catch (err) {
      console.error('Login error:', err);

      let errorMessage = 'Login failed. Please try again.';

      // Parse error messages
      if (err.message) {
        if (err.message.includes('401') || err.message.includes('Incorrect')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (err.message.includes('429') || err.message.includes('Too many')) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else if (err.message.includes('deactivated')) {
          errorMessage = 'Your account has been deactivated. Please contact support.';
        } else if (err.message.includes('not found')) {
          errorMessage = 'Email not found. Please check and try again.';
        } else if (err.message.includes('connect') || err.message.includes('ECONNREFUSED')) {
          errorMessage = 'Cannot connect to server. Please check your connection.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleClearError = () => {
    setError('');
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  const togglePasswordVisibility = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">HR Management</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {/* Error Message - Persistent & Dismissible */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-600 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              type="button"
              onClick={handleClearError}
              className="text-red-600 hover:text-red-900 flex-shrink-0 transition-colors"
              title="Dismiss error"
            >
              <span className="text-xl leading-none">×</span>
            </button>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-600 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-green-800">{success}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                placeholder="Enter your email"
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                disabled={loading}
                title={showPassword ? 'Hide password' : 'Show password'}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Credentials Info */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
            Demo Credentials
          </p>
          <div className="space-y-2">
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs font-medium text-green-900">Employee</p>
              <p className="text-xs text-green-700 font-mono break-all">emp@example.com</p>
              <p className="text-xs text-green-700 font-mono">password123</p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-center text-xs text-gray-500 mt-6">
          This is a secure HR Management System. Please keep your credentials confidential.
        </p>
      </div>
    </div>
  );
}
