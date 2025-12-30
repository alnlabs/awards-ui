import api from './api';

export const authService = {
  // Register
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.status === 'success' && response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me');
    if (response.status === 'success' && response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response;
  },

  // Forgot password
  forgotPassword: async (email, securityQuestions) => {
    const response = await api.post('/auth/forgot-password', {
      email,
      security_questions: securityQuestions,
    });
    return response;
  },

  // Reset password
  resetPassword: async (email, newPassword, token) => {
    const response = await api.post('/auth/reset-password', {
      email,
      new_password: newPassword,
      token,
    });
    return response;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Get stored user
  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

