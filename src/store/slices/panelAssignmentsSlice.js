import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

/* =====================================================
   THUNKS
===================================================== */

/**
 * HR → Assign panels to nomination
 */
export const assignPanelsToNomination = createAsyncThunk(
  "panelAssignments/assignPanelsToNomination",
  async ({ nominationId, panelIds }, { rejectWithValue }) => {
    try {
      return await api.post(
        `/panel-assignments/nomination/${nominationId}/assign`,
        { panel_ids: panelIds }
      );
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to assign panels");
    }
  }
);

/**
 * HR → Fetch assignments for a nomination  ✅ FIX ADDED
 */
export const fetchAssignmentsForNomination = createAsyncThunk(
  "panelAssignments/fetchAssignmentsForNomination",
  async (nominationId, { rejectWithValue }) => {
    try {
      return await api.get(`/panel-assignments/nomination/${nominationId}`); // ✅ ARRAY
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to fetch assigned panels");
    }
  }
);

/**
 * PANEL → Fetch my assignments
 */
export const fetchMyPanelAssignments = createAsyncThunk(
  "panelAssignments/fetchMyPanelAssignments",
  async (_, { rejectWithValue }) => {
    try {
      return await api.get("/panel-assignments/my"); // ✅ ARRAY
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to fetch assignments");
    }
  }
);

/**
 * PANEL → Submit / update task review
 */
export const submitTaskReview = createAsyncThunk(
  "panelAssignments/submitTaskReview",
  async ({ assignmentId, taskId, score, comment }, { rejectWithValue }) => {
    try {
      return await api.post(
        `/panel-assignments/${assignmentId}/tasks/${taskId}/review`,
        { score, comment }
      );
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to submit review");
    }
  }
);

/* =====================================================
   SLICE
===================================================== */

const panelAssignmentsSlice = createSlice({
  name: "panelAssignments",
  initialState: {
    myAssignments: [],

    // HR view
    assignmentsByNomination: {},

    assigning: false,
    loading: false,
    error: null,
  },

  reducers: {
    clearPanelAssignmentState(state) {
      state.assigning = false;
      state.loading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ================= HR → Assign Panels ================= */
      .addCase(assignPanelsToNomination.pending, (state) => {
        state.assigning = true;
        state.error = null;
      })
      .addCase(assignPanelsToNomination.fulfilled, (state) => {
        state.assigning = false;
      })
      .addCase(assignPanelsToNomination.rejected, (state, action) => {
        state.assigning = false;
        state.error = action.payload;
      })

      /* ================= HR → Assignments for Nomination ================= */
      .addCase(fetchAssignmentsForNomination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignmentsForNomination.fulfilled, (state, action) => {
        state.loading = false;
        const nominationId = action.meta.arg;
        state.assignmentsByNomination[nominationId] = action.payload;
      })
      .addCase(fetchAssignmentsForNomination.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= PANEL → My Assignments ================= */
      .addCase(fetchMyPanelAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyPanelAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.myAssignments = action.payload;
      })
      .addCase(fetchMyPanelAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= PANEL → Submit Review ================= */
      .addCase(submitTaskReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitTaskReview.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(submitTaskReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPanelAssignmentState } = panelAssignmentsSlice.actions;

export default panelAssignmentsSlice.reducer;
