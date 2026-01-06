import api from "./api";

export const authService = {
  /* =====================
     Register
  ===================== */
  register: async (payload) => {
    return api.post("/auth/register", payload);
  },

  /* =====================
     Login
  ===================== */
  login: async (email, password, role) => {
    const payload = { email, password };
    if (role) {
      payload.role = role;
    }
    const data = await api.post("/auth/login", payload);

    // data = { access_token, user }
    if (data?.access_token) {
      localStorage.setItem("token", data.access_token);
    }

    if (data?.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  },

  /* =====================
     Get current user
  ===================== */
  getMe: async () => {
    const data = await api.get("/auth/me");

    // data = user object
    if (data) {
      localStorage.setItem("user", JSON.stringify(data));
    }

    return data;
  },

  /* =====================
     Forgot password
  ===================== */
  forgotPassword: async (email, securityQuestions) => {
    return api.post("/auth/forgot-password", {
      email,
      security_questions: securityQuestions,
    });
  },

  /* =====================
     Reset password
  ===================== */
  resetPassword: async (email, newPassword, token) => {
    return api.post("/auth/reset-password", {
      email,
      new_password: newPassword,
      token,
    });
  },

  /* =====================
     Logout
  ===================== */
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  /* =====================
     Local helpers
  ===================== */
  getToken: () => localStorage.getItem("token"),

  getUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },
};
