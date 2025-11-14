const API_BASE_URL = 'https://company-admin-dashboard.vercel.app/api/v1';

export const apiService = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const isFormData = options.body instanceof FormData;

    const headers = {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...options.headers,
    };

    // Always add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

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

      // Handle error responses
      if (!response.ok) {
        // Handle 401 Unauthorized - clear auth but DON'T redirect
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Don't redirect here - let the component handle it
          throw new Error(data?.message || 'Unauthorized: Invalid email or password');
        }

        // Handle other errors
        const errorMessage = data?.message || data?.error || `Error: ${response.status}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      // Re-throw the error so the component can handle it
      throw error;
    }
  },

  // ==================== AUTHENTICATION ====================

  login: (email, password) =>
    apiService.request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => apiService.request('/users/logout'),

  signup: (formData) =>
    apiService.request('/users/signup', {
      method: 'POST',
      body: formData,
    }),

  forgotPassword: (email) =>
    apiService.request('/users/forgotPassword', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyOTP: (otp) =>
    apiService.request('/users/verifyOTP', {
      method: 'POST',
      body: JSON.stringify({ otp }),
    }),

  resetPassword: (newPassword, confirmPassword, token) =>
    apiService.request('/users/resetPassword', {
      method: 'PATCH',
      body: JSON.stringify({ newPassword, confirmPassword }),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  updatePassword: (currentPassword, newPassword, confirmPassword) =>
    apiService.request('/users/updatePassword', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    }),

  // ==================== USERS ====================

  getUsers: (params = '') => apiService.request(`/users${params}`),

  getUser: (id) => apiService.request(`/users/${id}`),

  getUnassignedUsers: () => apiService.request('/users/unassigned'),

  getInactiveUsers: () => apiService.request(`/users/inactive`),

  updateUser: (id, data) => {
    const isFormData = data instanceof FormData;
    const body = isFormData ? data : JSON.stringify(data);

    return apiService.request(`/users/${id}`, {
      method: 'PATCH',
      body: body,
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    });
  },
  deleteUser: (id, data) => {
    const isFormData = data instanceof FormData;
    const body = isFormData ? data : JSON.stringify(data);

    return apiService.request(`/users/${id}`, {
      method: 'DELETE',
      body: body,
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
    });
  },

  deleteUser: (id) => apiService.request(`/users/${id}`, { method: 'DELETE' }),

  sendActivationEmail: (userId) =>
    apiService.request(`/users/${userId}/send-activation-email`, {
      method: 'POST',
    }),

  getNotifications: () =>
    apiService.request('/users/notifications', {
      method: 'GET',
    }),

  getUserStats: () =>
    apiService.request('/users/stats', {
      method: 'GET',
    }),

  // ==================== EMPLOYEE PROFILES ====================

  getEmployees: (params = '') => apiService.request(`/employees${params}`),

  getEmployee: (id) => apiService.request(`/employees/${id}`),

  getMyProfile: () => apiService.request('/employees/myProfile'),

  createEmployee: (data) =>
    apiService.request('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateEmployee: (id, data) =>
    apiService.request(`/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteEmployee: (id) => apiService.request(`/employees/${id}`, { method: 'DELETE' }),

  // ==================== DEPARTMENTS ====================

  getDepartments: (params = '') => apiService.request(`/departments${params}`),

  getDepartment: (id) => apiService.request(`/departments/${id}`),

  getMyTeam: () => apiService.request('/departments/myTeam'),

  getMyDepartment: () => apiService.request('/departments/myDepartment'),

  createDepartment: (data) =>
    apiService.request('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateDepartment: (id, data) =>
    apiService.request(`/departments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteDepartment: (id) => apiService.request(`/departments/${id}`, { method: 'DELETE' }),

  // ==================== PAYROLL ====================

  getPayrolls: (params = '?sort=-year,-month') => apiService.request(`/payrolls${params}`),

  getPayroll: (id) => apiService.request(`/payrolls/${id}`),

  getMyPayrolls: (params) =>
    apiService.request(`/payrolls/my-payrolls${params}`).then((response) => {
      return {
        data: {
          payrolls: response.data?.payrolls || response.data?.doc || [],
          doc: response.data?.payrolls || response.data?.doc || [],
        },
      };
    }),
  getMyPayrollsStats: () => apiService.request(`/payrolls/my-payrolls-stats`),

  createPayroll: (data) =>
    apiService.request('/payrolls', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePayroll: (id, data) =>
    apiService.request(`/payrolls/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deletePayroll: (id) => apiService.request(`/payrolls/${id}`, { method: 'DELETE' }),

  // ==================== AUDIT LOGS ====================

  getAuditLogs: (params = '?sort=-timestamp') => apiService.request(`/audits${params}`),

  getAuditLog: (id) => apiService.request(`/audits/${id}`),

  // ==================== COMPANY STATS ====================

  getStats: () => apiService.request('/company/company-states'),

  // ==================== HELPER METHODS ====================

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

export default apiService;
