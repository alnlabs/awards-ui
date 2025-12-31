import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

/* =====================================================
   FETCH BULK JOBS (LIST)
===================================================== */
export const fetchBulkJobs = createAsyncThunk(
  "bulkJobs/fetchBulkJobs",
  async (_, { rejectWithValue }) => {
    try {
      return await api.get("/bulk-jobs"); // ✅ ARRAY
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to fetch bulk jobs");
    }
  }
);

/* =====================================================
   FETCH SINGLE BULK JOB
===================================================== */
export const fetchBulkJobById = createAsyncThunk(
  "bulkJobs/fetchBulkJobById",
  async (jobId, { rejectWithValue }) => {
    try {
      return await api.get(`/bulk-jobs/${jobId}`); // ✅ OBJECT
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to fetch bulk job");
    }
  }
);

/* =====================================================
   CANCEL BULK JOB
===================================================== */
export const cancelBulkJob = createAsyncThunk(
  "bulkJobs/cancelBulkJob",
  async (jobId, { rejectWithValue }) => {
    try {
      await api.post(`/bulk-jobs/${jobId}/cancel`);
      return jobId; // business-only return
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to cancel job");
    }
  }
);

/* =====================================================
   SLICE
===================================================== */
const bulkJobsSlice = createSlice({
  name: "bulkJobs",
  initialState: {
    jobs: [],
    currentJob: null,
    loading: false,
    error: null,
  },

  reducers: {
    clearBulkJobsError: (state) => {
      state.error = null;
    },
    clearCurrentBulkJob: (state) => {
      state.currentJob = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ================= FETCH JOBS ================= */
      .addCase(fetchBulkJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBulkJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload || []; // ✅ SAFE
      })
      .addCase(fetchBulkJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= FETCH BY ID ================= */
      .addCase(fetchBulkJobById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBulkJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchBulkJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= CANCEL JOB ================= */
      .addCase(cancelBulkJob.fulfilled, (state, action) => {
        const job = state.jobs.find((j) => j.id === action.payload);
        if (job) {
          job.status = "cancelled";
        }
      });
  },
});

export const { clearBulkJobsError, clearCurrentBulkJob } =
  bulkJobsSlice.actions;

export default bulkJobsSlice.reducer;
