import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchAwardsHistory = createAsyncThunk(
  'awards/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/awards/history');
      return response.data || [];
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to fetch awards history');
    }
  }
);

export const fetchCurrentAwards = createAsyncThunk(
  'awards/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/awards/current');
      return response.data || [];
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to fetch current awards');
    }
  }
);

export const fetchAwardById = createAsyncThunk(
  'awards/fetchAwardById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/awards/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to fetch award');
    }
  }
);

export const createAward = createAsyncThunk(
  'awards/createAward',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/awards', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to create award');
    }
  }
);

export const finalizeCycleAwards = createAsyncThunk(
  'awards/finalizeCycle',
  async (cycleId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/awards/cycle/${cycleId}/finalize`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to finalize awards');
    }
  }
);

export const fetchNominationsWithScores = createAsyncThunk(
  'awards/fetchNominationsWithScores',
  async (cycleId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/awards/cycle/${cycleId}/nominations-with-scores`);
      return response.data || [];
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to fetch nominations with scores');
    }
  }
);

const awardsSlice = createSlice({
  name: 'awards',
  initialState: {
    history: [],
    current: [],
    nominationsWithScores: [],
    currentAward: null,
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
      .addCase(fetchAwardsHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      })
      .addCase(fetchCurrentAwards.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(fetchAwardById.fulfilled, (state, action) => {
        state.currentAward = action.payload;
      })
      .addCase(fetchNominationsWithScores.fulfilled, (state, action) => {
        state.nominationsWithScores = action.payload;
      })
      .addCase(createAward.fulfilled, (state, action) => {
        state.current.push(action.payload);
      });
  },
});

export const { clearError } = awardsSlice.actions;
export default awardsSlice.reducer;

