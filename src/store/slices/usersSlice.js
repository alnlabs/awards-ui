import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import toast from "react-hot-toast";

/* =====================
   THUNKS
===================== */

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (filters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters || {}).toString();
      const url = params ? `/users?${params}` : "/users";
      const response = await api.get(url);
      // API returns paginated response: { items: [], total, skip, limit }
      return response;
    } catch (error) {
      return rejectWithValue(
        error?.error || error?.message || "Failed to fetch users"
      );
    }
  }
);

export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (id, { rejectWithValue }) => {
    try {
      return await api.get(`/users/${id}`); // ✅ object
    } catch (error) {
      return rejectWithValue(
        error?.error || error?.message || "Failed to fetch user"
      );
    }
  }
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (data, { rejectWithValue }) => {
    try {
      return await api.post("/users", data); // ✅ created user
    } catch (error) {
      return rejectWithValue(
        error?.error || error?.message || "Failed to create user"
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await api.patch(`/users/${id}`, data); // ✅ updated user
    } catch (error) {
      return rejectWithValue(
        error?.error || error?.message || "Failed to update user"
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error?.error || error?.message || "Failed to delete user"
      );
    }
  }
);

export const bulkDeleteUsers = createAsyncThunk(
  "users/bulkDeleteUsers",
  async (userIds, { rejectWithValue }) => {
    try {
      const response = await api.post("/users/bulk-delete", {
        user_ids: userIds,
      });
      // Return the response data to be used in the fulfilled case
      return response;
    } catch (error) {
      const errorMsg = error?.error || error?.message || "Failed to bulk delete users";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

/* =====================
   SLICE
===================== */

const usersSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    totalCount: 0,
    currentUser: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearCurrentUser(state) {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ---------- Fetch Users ---------- */
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        // API returns { items: [], total, skip, limit }
        state.users = Array.isArray(action.payload.items) ? action.payload.items : [];
        state.totalCount = action.payload.total || 0;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- Fetch User By ID ---------- */
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      })

      /* ---------- Create ---------- */
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })

      /* ---------- Update ---------- */
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser?.id === action.payload.id) {
          state.currentUser = action.payload;
        }
      })

      /* ---------- Delete ---------- */
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      })

      /* ---------- Bulk Delete ---------- */
      .addCase(bulkDeleteUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(bulkDeleteUsers.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload;

        // Show the appropriate message from the backend
        toast.success(response.message);

        // Refresh the user list by triggering a re-fetch
        // The actual user removal will happen in the component after navigation
      })
      .addCase(bulkDeleteUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

/* =====================
   SELECTORS
===================== */

// Get all users
export const selectUsers = (state) => state.users.users;

// Get user by ID (SAFE)
export const selectUserById = (state, userId) =>
  state.users.users.find((u) => u.id === userId) || null;

// Map users by ID (FAST LOOKUP)
export const selectUsersById = (state) => {
  const map = {};
  state.users.users.forEach((u) => {
    map[u.id] = u;
  });
  return map;
};

export const { clearError, clearCurrentUser } = usersSlice.actions;
export default usersSlice.reducer;
