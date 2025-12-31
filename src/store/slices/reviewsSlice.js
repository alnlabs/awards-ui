import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  submitTaskReview,
  getMyPanelAssignments,
  getMyTaskReviews,
  getPanelAssignmentReviews,
  getPanelAssignmentSummary,
} from "../../services/reviewService";

/**
 * State shape is PANEL-ASSIGNMENT centric
 */

const initialState = {
  myAssignments: [], // PANEL → dashboard (/panel-assignments/my)
  myReviews: {}, // assignmentId -> [reviews]
  assignmentReviews: {}, // assignmentId -> [reviews] (HR)
  summaries: {}, // assignmentId -> summary (HR)
  loading: false,
  error: null,
};

/* =====================
   THUNKS
===================== */

/* -------- PANEL → Submit Review -------- */
export const submitReview = createAsyncThunk(
  "reviews/submitReview",
  async (payload, { rejectWithValue }) => {
    try {
      return await submitTaskReview(payload);
    } catch (error) {
      return rejectWithValue(
        error?.error || error?.message || "Failed to submit review"
      );
    }
  }
);

/* -------- PANEL → My Assignments -------- */
export const fetchMyAssignments = createAsyncThunk(
  "reviews/fetchMyAssignments",
  async (_, { rejectWithValue }) => {
    try {
      return await getMyPanelAssignments(); // ✅ array
    } catch (error) {
      return rejectWithValue(
        error?.error || error?.message || "Failed to fetch assignments"
      );
    }
  }
);

/* -------- PANEL → My Reviews (per assignment) -------- */
export const fetchMyReviews = createAsyncThunk(
  "reviews/fetchMyReviews",
  async (panelAssignmentId, { rejectWithValue }) => {
    try {
      return {
        panelAssignmentId,
        data: await getMyTaskReviews(panelAssignmentId),
      };
    } catch (error) {
      return rejectWithValue(
        error?.error || error?.message || "Failed to fetch my reviews"
      );
    }
  }
);

/* -------- HR → All Reviews for Assignment -------- */
export const fetchAssignmentReviews = createAsyncThunk(
  "reviews/fetchAssignmentReviews",
  async (panelAssignmentId, { rejectWithValue }) => {
    try {
      return {
        panelAssignmentId,
        data: await getPanelAssignmentReviews(panelAssignmentId),
      };
    } catch (error) {
      return rejectWithValue(
        error?.error || error?.message || "Failed to fetch assignment reviews"
      );
    }
  }
);

/* -------- HR → Assignment Summary -------- */
export const fetchAssignmentSummary = createAsyncThunk(
  "reviews/fetchAssignmentSummary",
  async (panelAssignmentId, { rejectWithValue }) => {
    try {
      return {
        panelAssignmentId,
        data: await getPanelAssignmentSummary(panelAssignmentId),
      };
    } catch (error) {
      return rejectWithValue(
        error?.error || error?.message || "Failed to fetch summary"
      );
    }
  }
);

/* =====================
   SLICE
===================== */

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearReviewError(state) {
      state.error = null;
    },
    clearAssignmentData(state, action) {
      delete state.myReviews[action.payload];
      delete state.assignmentReviews[action.payload];
      delete state.summaries[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder

      /* ---- Submit Review ---- */
      .addCase(submitReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---- My Assignments ---- */
      .addCase(fetchMyAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.myAssignments = action.payload;
      })
      .addCase(fetchMyAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---- My Reviews ---- */
      .addCase(fetchMyReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyReviews.fulfilled, (state, action) => {
        const { panelAssignmentId, data } = action.payload;
        state.loading = false;
        state.myReviews[panelAssignmentId] = data;
      })
      .addCase(fetchMyReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---- Assignment Reviews (HR) ---- */
      .addCase(fetchAssignmentReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignmentReviews.fulfilled, (state, action) => {
        const { panelAssignmentId, data } = action.payload;
        state.loading = false;
        state.assignmentReviews[panelAssignmentId] = data;
      })
      .addCase(fetchAssignmentReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---- Assignment Summary (HR) ---- */
      .addCase(fetchAssignmentSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignmentSummary.fulfilled, (state, action) => {
        const { panelAssignmentId, data } = action.payload;
        state.loading = false;
        state.summaries[panelAssignmentId] = data;
      })
      .addCase(fetchAssignmentSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReviewError, clearAssignmentData } = reviewsSlice.actions;

export default reviewsSlice.reducer;
