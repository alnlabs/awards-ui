import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

/* =====================
   ASYNC THUNKS
===================== */

/* ---------- CURRENT AWARDS (ALL ROLES) ---------- */
export const fetchCurrentAwards = createAsyncThunk(
  "awards/fetchCurrent",
  async (_, { rejectWithValue }) => {
    try {
      return await api.get("/awards/current"); // ✅ api already returns data
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to fetch current awards");
    }
  }
);

/* ---------- AWARDS HISTORY (HR) ---------- */
export const fetchAwardsHistory = createAsyncThunk(
  "awards/fetchHistory",
  async (_, { rejectWithValue }) => {
    try {
      return await api.get("/awards/history");
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to fetch awards history");
    }
  }
);

/* ---------- HR – NOMINATIONS WITH SCORES ---------- */
export const fetchNominationsWithScores = createAsyncThunk(
  "awards/fetchNominationsWithScores",
  async (cycleId, { rejectWithValue }) => {
    try {
      return await api.get(`/awards/cycle/${cycleId}/nominations-with-scores`);
    } catch (error) {
      return rejectWithValue(
        error?.error || "Failed to fetch nominations with scores"
      );
    }
  }
);

/* ---------- HR – CREATE AWARD ---------- */
export const createAward = createAsyncThunk(
  "awards/createAward",
  async (data, { rejectWithValue }) => {
    try {
      return await api.post("/awards", data);
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to create award");
    }
  }
);

/* ---------- HR – FINALIZE CYCLE ---------- */
export const finalizeCycleAwards = createAsyncThunk(
  "awards/finalizeCycle",
  async (cycleId, { rejectWithValue }) => {
    try {
      return await api.post(`/awards/cycle/${cycleId}/finalize`);
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to finalize awards");
    }
  }
);

/* =====================
   SLICE
===================== */

const awardsSlice = createSlice({
  name: "awards",
  initialState: {
    /* UI DEPENDENCIES */
    current: [], // Dashboard, Awards page
    history: [], // HR
    currentAward: null, // ViewAward

    /* HR WORKFLOW */
    nominationsWithScores: [],

    loading: false,
    error: null,
  },

  reducers: {
    clearAwardsError(state) {
      state.error = null;
    },
    clearCurrentAward(state) {
      state.currentAward = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ---------- CURRENT ---------- */
      .addCase(fetchCurrentAwards.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentAwards.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload || [];
      })
      .addCase(fetchCurrentAwards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- HISTORY ---------- */
      .addCase(fetchAwardsHistory.fulfilled, (state, action) => {
        state.history = action.payload || [];
      })

      /* ---------- NOMINATIONS WITH SCORES ---------- */
      .addCase(fetchNominationsWithScores.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNominationsWithScores.fulfilled, (state, action) => {
        state.loading = false;
        state.nominationsWithScores = action.payload || [];
      })
      .addCase(fetchNominationsWithScores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- CREATE AWARD ---------- */
      .addCase(createAward.fulfilled, (state, action) => {
        if (action.payload) {
          state.current.push(action.payload);
        }
      })

      /* ---------- FINALIZE ---------- */
      .addCase(finalizeCycleAwards.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export const { clearAwardsError, clearCurrentAward } = awardsSlice.actions;

export default awardsSlice.reducer;
