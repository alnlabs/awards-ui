import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  listCriteria,
  getCriteria,
  createCriteria,
  updateCriteria,
  renderCriteria,
} from "../../services/criteriaService";

/* =====================
   Async Thunks
===================== */

/**
 * List all criteria
 * Payload = Criteria[]
 */
export const fetchCriteria = createAsyncThunk(
  "criteria/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await listCriteria(); // ✅ business data
    } catch (err) {
      return rejectWithValue(err?.error || "Failed to fetch criteria");
    }
  }
);

/**
 * Get criteria by ID
 * Payload = Criteria
 */
export const fetchCriteriaById = createAsyncThunk(
  "criteria/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await getCriteria(id); // ✅ business data
    } catch (err) {
      return rejectWithValue(err?.error || "Failed to fetch criteria");
    }
  }
);

/**
 * Create criteria
 * Payload = { id }
 */
export const createCriteriaAction = createAsyncThunk(
  "criteria/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await createCriteria(payload); // ✅ business data
    } catch (err) {
      return rejectWithValue(err?.error || "Failed to create criteria");
    }
  }
);

/**
 * Update criteria (EDIT)
 * Payload = { id }
 */
export const updateCriteriaAction = createAsyncThunk(
  "criteria/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await updateCriteria(id, payload); // ✅ business data
    } catch (err) {
      return rejectWithValue(err?.error || "Failed to update criteria");
    }
  }
);

/**
 * Render active criteria
 * Payload = { form_id, fields }
 */
export const fetchActiveCriteria = createAsyncThunk(
  "criteria/renderActive",
  async (_, { rejectWithValue }) => {
    try {
      return await renderCriteria(); // ✅ business data
    } catch (err) {
      return rejectWithValue(err?.error || "Failed to load active criteria");
    }
  }
);

/* =====================
   Slice
===================== */

const criteriaSlice = createSlice({
  name: "criteria",

  initialState: {
    list: [],
    current: null,
    active: null,
    loading: false,
    error: null,
  },

  reducers: {
    clearCriteriaError: (state) => {
      state.error = null;
    },
    clearCurrentCriteria: (state) => {
      state.current = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ---------- Fetch All ---------- */
      .addCase(fetchCriteria.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCriteria.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCriteria.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- Fetch By ID ---------- */
      .addCase(fetchCriteriaById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCriteriaById.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchCriteriaById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- Create ---------- */
      .addCase(createCriteriaAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCriteriaAction.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.list.unshift(action.payload);
        }
      })
      .addCase(createCriteriaAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- Update ---------- */
      .addCase(updateCriteriaAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCriteriaAction.fulfilled, (state, action) => {
        state.loading = false;

        const updated = action.payload;
        state.current = updated;

        const index = state.list.findIndex((c) => c.id === updated.id);
        if (index !== -1) {
          state.list[index] = updated;
        }
      })
      .addCase(updateCriteriaAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- Render Active ---------- */
      .addCase(fetchActiveCriteria.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveCriteria.fulfilled, (state, action) => {
        state.loading = false;
        state.active = action.payload;
      })
      .addCase(fetchActiveCriteria.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCriteriaError, clearCurrentCriteria } =
  criteriaSlice.actions;

export default criteriaSlice.reducer;
