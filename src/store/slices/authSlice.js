import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";
import toast from "react-hot-toast";

/* =====================
   Initial State
===================== */
const initialState = {
  user: authService.getUser(), // from localStorage
  token: authService.getToken(), // from localStorage
  loading: false,
  error: null,
};

/* =====================
   Thunks
===================== */

/**
 * LOGIN
 * authService.login → returns { access_token }
 * authService.getMe → returns user object
 */
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const authData = await authService.login(email, password);
      // authData = { access_token }

      const user = await authService.getMe();

      return {
        token: authData.access_token,
        user,
      };
    } catch (error) {
      return rejectWithValue(error?.error || "Login failed");
    }
  }
);

/**
 * REGISTER
 * Returns created user OR success message (depends on backend)
 */
export const register = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      return await authService.register(data);
    } catch (error) {
      return rejectWithValue(error?.error || "Registration failed");
    }
  }
);

/**
 * GET CURRENT USER
 */
export const getMe = createAsyncThunk(
  "auth/getMe",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getMe();
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to fetch user");
    }
  }
);

/* =====================
   Slice
===================== */

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      authService.logout();
    },
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ---------- LOGIN ---------- */
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- REGISTER ---------- */
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- GET ME ---------- */
      .addCase(getMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      /* ---------- SWITCH ROLE ---------- */
      .addCase(switchRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(switchRole.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(switchRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const switchRole = createAsyncThunk(
  "auth/switchRole",
  async (role, { rejectWithValue }) => {
    try {
      const toastId = toast.loading(`Switching to ${role} view...`);
      const response = await authService.switchRole(role);
      
      const user = await authService.getMe();
      
      toast.success(`Switched to ${role} view`, { id: toastId });
      return {
        token: response.access_token,
        user
      };
    } catch (error) {
      toast.error(error?.error || "Role switch failed");
      return rejectWithValue(error?.error || "Role switch failed");
    }
  }
);

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
