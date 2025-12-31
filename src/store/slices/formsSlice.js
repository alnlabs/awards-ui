import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

/* =========================
   FETCH FORMS (OPTIONAL CYCLE)
========================= */
export const fetchForms = createAsyncThunk(
  "forms/fetchForms",
  async (cycleId, { rejectWithValue }) => {
    try {
      const url = cycleId ? `/forms?cycle_id=${cycleId}` : "/forms";
      return await api.get(url); // ✅ ARRAY
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to fetch forms");
    }
  }
);

/* =========================
   FETCH FORM BY ID
========================= */
export const fetchFormById = createAsyncThunk(
  "forms/fetchFormById",
  async (id, { rejectWithValue }) => {
    try {
      return await api.get(`/forms/${id}`); // ✅ OBJECT
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to fetch form");
    }
  }
);

/* =========================
   FETCH FORM FOR CYCLE (RENDER)
========================= */
export const fetchFormForCycle = createAsyncThunk(
  "forms/fetchFormForCycle",
  async (cycleId, { rejectWithValue }) => {
    try {
      return await api.get(`/forms/cycle/${cycleId}/render`); // ✅ OBJECT
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to fetch form");
    }
  }
);

/* =========================
   CREATE FORM
========================= */
export const createForm = createAsyncThunk(
  "forms/createForm",
  async (data, { rejectWithValue }) => {
    try {
      return await api.post("/forms", data); // ✅ CREATED OBJECT
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to create form");
    }
  }
);

/* =========================
   SLICE
========================= */
const formsSlice = createSlice({
  name: "forms",
  initialState: {
    forms: [],
    currentForm: null,
    loading: false,
    error: null,
  },

  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentForm: (state) => {
      state.currentForm = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ---------- FETCH FORMS ---------- */
      .addCase(fetchForms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchForms.fulfilled, (state, action) => {
        state.loading = false;
        state.forms = action.payload || []; // ✅ SAFE
      })
      .addCase(fetchForms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- FETCH BY ID ---------- */
      .addCase(fetchFormById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFormById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentForm = action.payload;
      })
      .addCase(fetchFormById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- FETCH FOR CYCLE ---------- */
      .addCase(fetchFormForCycle.fulfilled, (state, action) => {
        state.currentForm = action.payload;
      })

      /* ---------- CREATE ---------- */
      .addCase(createForm.fulfilled, (state, action) => {
        state.forms.push(action.payload);
      });
  },
});

export const { clearError, clearCurrentForm } = formsSlice.actions;
export default formsSlice.reducer;
