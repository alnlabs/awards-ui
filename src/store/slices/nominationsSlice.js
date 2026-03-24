import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

/* =========================
   FETCH NOMINATIONS
========================= */
export const fetchNominations = createAsyncThunk(
  "nominations/fetchNominations",
  async (filters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters || {}).toString();
      const url = params ? `/nominations?${params}` : "/nominations";
      return await api.get(url); // ✅ ARRAY
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to fetch nominations");
    }
  }
);

/* =========================
   FETCH NOMINATION HISTORY
========================= */
export const fetchNominationHistory = createAsyncThunk(
  "nominations/fetchHistory",
  async (_, { rejectWithValue }) => {
    try {
      return await api.get("/nominations/history"); // ✅ ARRAY
    } catch (error) {
      return rejectWithValue(
        error?.error || "Failed to fetch nomination history"
      );
    }
  }
);

/* =========================
   FETCH NOMINATION BY ID
========================= */
export const fetchNominationById = createAsyncThunk(
  "nominations/fetchNominationById",
  async (id, { rejectWithValue }) => {
    try {
      return await api.get(`/nominations/${id}`); // ✅ OBJECT
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to fetch nomination");
    }
  }
);

/* =========================
   CREATE NOMINATION
========================= */
export const createNomination = createAsyncThunk(
  "nominations/createNomination",
  async (data, { rejectWithValue }) => {
    try {
      return await api.post("/nominations", data); // ✅ OBJECT
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to create nomination");
    }
  }
);

/* =========================
   UPDATE NOMINATION STATUS
========================= */
export const updateNominationStatus = createAsyncThunk(
  "nominations/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await api.patch(`/nominations/${id}/status`, { status }); // ✅ OBJECT
    } catch (error) {
      return rejectWithValue(
        error?.error || "Failed to update nomination status"
      );
    }
  }
);

/* =========================
   SUBMIT PANEL REVIEW
========================= */
export const submitPanelReview = createAsyncThunk(
  "nominations/submitReview",
  async ({ id, score, comments }, { rejectWithValue }) => {
    try {
      return await api.post(`/nominations/${id}/review`, {
        score,
        comments,
      }); // ✅ OBJECT
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to submit review");
    }
  }
);

/* =========================
   DELETE NOMINATION
========================= */
export const deleteNomination = createAsyncThunk(
  "nominations/deleteNomination",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/nominations/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to delete nomination");
    }
  }
);

/* =========================
   SLICE
========================= */
const nominationsSlice = createSlice({
  name: "nominations",
  initialState: {
    nominations: [],
    history: [],
    currentNomination: null,
    loading: false,
    error: null,
  },

  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentNomination: (state) => {
      state.currentNomination = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ---------- FETCH NOMINATIONS ---------- */
      .addCase(fetchNominations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNominations.fulfilled, (state, action) => {
        state.loading = false;
        state.nominations = action.payload || [];
      })
      .addCase(fetchNominations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- HISTORY ---------- */
      .addCase(fetchNominationHistory.fulfilled, (state, action) => {
        state.history = action.payload || [];
      })

      /* ---------- FETCH BY ID ---------- */
      .addCase(fetchNominationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNominationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentNomination = action.payload;
      })
      .addCase(fetchNominationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- CREATE ---------- */
      .addCase(createNomination.fulfilled, (state, action) => {
        state.nominations.push(action.payload);
      })

      /* ---------- UPDATE STATUS ---------- */
      .addCase(updateNominationStatus.fulfilled, (state, action) => {
        const index = state.nominations.findIndex(
          (n) => n.id === action.payload.id
        );

        if (index !== -1) {
          state.nominations[index] = action.payload;
        }

        if (state.currentNomination?.id === action.payload.id) {
          state.currentNomination = action.payload;
        }
      })

      /* ---------- DELETE ---------- */
      .addCase(deleteNomination.fulfilled, (state, action) => {
        state.nominations = state.nominations.filter((n) => n.id !== action.payload);
        state.history = state.history.filter((n) => n.id !== action.payload);
        if (state.currentNomination?.id === action.payload) {
          state.currentNomination = null;
        }
      });
  },
});

export const { clearError, clearCurrentNomination } = nominationsSlice.actions;

export default nominationsSlice.reducer;
