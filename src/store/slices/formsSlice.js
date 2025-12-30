import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchForms = createAsyncThunk(
  'forms/fetchForms',
  async (cycleId, { rejectWithValue }) => {
    try {
      const url = cycleId ? `/forms?cycle_id=${cycleId}` : '/forms';
      const response = await api.get(url);
      return response.data || [];
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to fetch forms');
    }
  }
);

export const fetchFormById = createAsyncThunk(
  'forms/fetchFormById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/forms/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to fetch form');
    }
  }
);

export const fetchFormForCycle = createAsyncThunk(
  'forms/fetchFormForCycle',
  async (cycleId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/forms/cycle/${cycleId}/render`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to fetch form');
    }
  }
);

export const createForm = createAsyncThunk(
  'forms/createForm',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/forms', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to create form');
    }
  }
);

const formsSlice = createSlice({
  name: 'forms',
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
      .addCase(fetchForms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchForms.fulfilled, (state, action) => {
        state.loading = false;
        state.forms = action.payload;
      })
      .addCase(fetchForms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFormById.fulfilled, (state, action) => {
        state.currentForm = action.payload;
      })
      .addCase(fetchFormForCycle.fulfilled, (state, action) => {
        state.currentForm = action.payload;
      })
      .addCase(createForm.fulfilled, (state, action) => {
        state.forms.push(action.payload);
      });
  },
});

export const { clearError, clearCurrentForm } = formsSlice.actions;
export default formsSlice.reducer;

