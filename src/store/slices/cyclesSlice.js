import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

/* =========================
   FETCH ALL CYCLES
========================= */
export const fetchCycles = createAsyncThunk(
  "cycles/fetchCycles",
  async (_, { rejectWithValue }) => {
    try {
      return await api.get("/cycles"); // ✅ ARRAY
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to fetch cycles");
    }
  }
);

/* =========================
   FETCH CYCLE BY ID
========================= */
export const fetchCycleById = createAsyncThunk(
  "cycles/fetchCycleById",
  async (id, { rejectWithValue }) => {
    try {
      return await api.get(`/cycles/${id}`); // ✅ OBJECT
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to fetch cycle");
    }
  }
);

/* =========================
   CREATE CYCLE
========================= */
export const createCycle = createAsyncThunk(
  "cycles/createCycle",
  async (data, { rejectWithValue }) => {
    try {
      return await api.post("/cycles", data); // ✅ CREATED OBJECT
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to create cycle");
    }
  }
);

/* =========================
   UPDATE CYCLE
========================= */
export const updateCycle = createAsyncThunk(
  "cycles/updateCycle",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await api.patch(`/cycles/${id}`, data); // ✅ UPDATED OBJECT
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to update cycle");
    }
  }
);

/* =========================
   SLICE
========================= */
const cyclesSlice = createSlice({
  name: "cycles",
  initialState: {
    cycles: [],
    currentCycle: null,
    loading: false,
    error: null,
  },

  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ---------- FETCH ALL ---------- */
      .addCase(fetchCycles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCycles.fulfilled, (state, action) => {
        state.loading = false;
        state.cycles = action.payload || []; // ✅ SAFE
      })
      .addCase(fetchCycles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- FETCH BY ID ---------- */
      .addCase(fetchCycleById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCycleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCycle = action.payload;
      })
      .addCase(fetchCycleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- CREATE ---------- */
      .addCase(createCycle.fulfilled, (state, action) => {
        state.cycles.push(action.payload);
      })

      /* ---------- UPDATE ---------- */
      .addCase(updateCycle.fulfilled, (state, action) => {
        const updated = action.payload;

        const index = state.cycles.findIndex((c) => c.id === updated.id);

        if (index !== -1) {
          state.cycles[index] = updated;
        }

        if (state.currentCycle?.id === updated.id) {
          state.currentCycle = updated;
        }
      });
  },
});

export const { clearError } = cyclesSlice.actions;
export default cyclesSlice.reducer;
