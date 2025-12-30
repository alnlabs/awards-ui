import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchCycles = createAsyncThunk(
  'cycles/fetchCycles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/cycles');
      return response.data || [];
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to fetch cycles');
    }
  }
);

export const fetchCycleById = createAsyncThunk(
  'cycles/fetchCycleById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/cycles/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to fetch cycle');
    }
  }
);

export const createCycle = createAsyncThunk(
  'cycles/createCycle',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/cycles', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to create cycle');
    }
  }
);

export const updateCycle = createAsyncThunk(
  'cycles/updateCycle',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/cycles/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to update cycle');
    }
  }
);

const cyclesSlice = createSlice({
  name: 'cycles',
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
      .addCase(fetchCycles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCycles.fulfilled, (state, action) => {
        state.loading = false;
        state.cycles = action.payload;
      })
      .addCase(fetchCycles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCycleById.fulfilled, (state, action) => {
        state.currentCycle = action.payload;
      })
      .addCase(createCycle.fulfilled, (state, action) => {
        state.cycles.push(action.payload);
      })
      .addCase(updateCycle.fulfilled, (state, action) => {
        const index = state.cycles.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.cycles[index] = action.payload;
        }
        if (state.currentCycle?.id === action.payload.id) {
          state.currentCycle = action.payload;
        }
      });
  },
});

export const { clearError } = cyclesSlice.actions;
export default cyclesSlice.reducer;

