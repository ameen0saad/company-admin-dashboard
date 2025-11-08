const API_BASE_URL = 'http://127.0.0.1:3000/api/v1';

export const apiService = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const isFormData = options.body instanceof FormData;

    const headers = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(!isFormData && { 'Content-Type': 'application/json' }), // <== مهم جدًا
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // ==================== AUTHENTICATION ====================

  // Login
  login: (email, password) =>
    apiService.request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Logout
  logout: () => apiService.request('/users/logout'),

  // Signup (Admin only)
  signup: (formData) =>
    apiService.request('/users/signup', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    }),

  // Forgot Password
  forgotPassword: (email) =>
    apiService.request('/users/forgotPassword', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // Verify OTP
  verifyOTP: (otp) =>
    apiService.request('/users/verifyOTP', {
      method: 'POST',
      body: JSON.stringify({ otp }),
    }),

  // Reset Password
  resetPassword: (newPassword, confirmPassword, token) =>
    apiService.request('/users/resetPassword', {
      method: 'PATCH',
      body: JSON.stringify({ newPassword, confirmPassword }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }),

  // Update Password (Logged in user)
  updatePassword: (currentPassword, newPassword, confirmPassword) =>
    apiService.request('/users/updatePassword', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    }),

  // ==================== USERS ====================

  // Get all users (Admin only)
  getUsers: (params = '') => apiService.request(`/users${params}`),

  // Get single user (Admin only)
  getUser: (id) => apiService.request(`/users/${id}`),

  // Get unassigned users (Admin/HR)
  getUnassignedUsers: () => apiService.request('/users/unassigned'),

  // Get inactive users (Admin only)
  getInactiveUsers: (params = '') => apiService.request(`/users/inactive${params}`),

  // Update user (Admin only)
  updateUser: (id, formData) =>
    apiService.request(`/users/${id}`, {
      method: 'PATCH',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    }),

  // Delete user (soft delete - Admin only)
  deleteUser: (id) => apiService.request(`/users/${id}`, { method: 'DELETE' }),

  // ==================== EMPLOYEE PROFILES ====================

  // Get all employee profiles (Admin/HR)
  getEmployees: (params = '') => apiService.request(`/employees${params}`),

  // Get single employee profile
  getEmployee: (id) => apiService.request(`/employees/${id}`),

  // Get my profile (Current logged-in user)
  getMyProfile: () => apiService.request('/employees/myProfile'),

  // Create employee profile (Admin/HR)
  createEmployee: (data) =>
    apiService.request('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update employee profile (Admin/HR)
  updateEmployee: (id, data) =>
    apiService.request(`/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Delete employee profile (Admin/HR)
  deleteEmployee: (id) => apiService.request(`/employees/${id}`, { method: 'DELETE' }),

  // ==================== DEPARTMENTS ====================

  // Get all departments
  getDepartments: (params = '') => apiService.request(`/departments${params}`),

  // Get single department
  getDepartment: (id) => apiService.request(`/departments/${id}`),

  // Get my team (Same department employees)
  getMyTeam: () => apiService.request('/departments/myTeam'),

  // Create department (Admin/HR)
  createDepartment: (data) =>
    apiService.request('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update department (Admin/HR)
  updateDepartment: (id, data) =>
    apiService.request(`/departments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Delete department (Admin/HR)
  deleteDepartment: (id) => apiService.request(`/departments/${id}`, { method: 'DELETE' }),

  // ==================== PAYROLL ====================

  // Get all payrolls (Admin/HR)
  getPayrolls: (params = '') => apiService.request(`/payrolls${params}`),

  // Get single payroll (Admin/HR)
  getPayroll: (id) => apiService.request(`/payrolls/${id}`),

  // Get my payrolls (Current logged-in employee)
  getMyPayrolls: (params = '') => apiService.request(`/payrolls/my-payrolls${params}`),

  // Create payroll (Admin/HR)
  createPayroll: (data) =>
    apiService.request('/payrolls', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update payroll (Admin/HR)
  updatePayroll: (id, data) =>
    apiService.request(`/payrolls/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Delete payroll (Admin/HR)
  deletePayroll: (id) => apiService.request(`/payrolls/${id}`, { method: 'DELETE' }),

  // ==================== AUDIT LOGS ====================

  // Get all audit logs (Admin only)
  getAuditLogs: (params = '?sort=-timestamp') => apiService.request(`/audits${params}`),

  // Get single audit log (Admin only)
  getAuditLog: (id) => apiService.request(`/audits/${id}`),

  // ==================== COMPANY STATS ====================

  // Get company statistics (Admin/HR)
  getStats: () => apiService.request('/company/company-states'),

  // ==================== HELPER METHODS ====================

  // Build query string from params object
  buildQueryString: (params) => {
    if (!params || Object.keys(params).length === 0) return '';
    const query = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        query.append(key, params[key]);
      }
    });
    return `?${query.toString()}`;
  },

  // Upload file helper
  uploadFile: async (endpoint, formData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },
};

// Export commonly used query builders
export const queryBuilders = {
  // Pagination
  pagination: (page = 1, limit = 10) => ({ page, limit }),

  // Sorting
  sort: (field, order = 'asc') => ({ sort: order === 'desc' ? `-${field}` : field }),

  // Filtering
  filter: (filters) => filters,

  // Field selection
  fields: (fieldArray) => ({ fields: fieldArray.join(',') }),

  // Date range
  dateRange: (startDate, endDate) => ({
    createdAt: { gte: startDate, lte: endDate },
  }),

  // Search by role
  roleFilter: (role) => ({ role }),

  // Search by department
  departmentFilter: (departmentId) => ({ department: departmentId }),

  // Month/Year filter for payroll
  payrollPeriod: (month, year) => ({ month, year }),
};

export default apiService;
