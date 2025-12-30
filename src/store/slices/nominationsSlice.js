import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchNominations = createAsyncThunk(
  'nominations/fetchNominations',
  async (filters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters || {}).toString();
      const url = params ? `/nominations?${params}` : '/nominations';
      const response = await api.get(url);
      return response.data || [];
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to fetch nominations');
    }
  }
);

export const fetchNominationHistory = createAsyncThunk(
  'nominations/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/nominations/history');
      return response.data || [];
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to fetch nomination history');
    }
  }
);

export const fetchNominationById = createAsyncThunk(
  'nominations/fetchNominationById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/nominations/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to fetch nomination');
    }
  }
);

export const createNomination = createAsyncThunk(
  'nominations/createNomination',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/nominations', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to create nomination');
    }
  }
);

export const updateNominationStatus = createAsyncThunk(
  'nominations/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/nominations/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to update nomination status');
    }
  }
);

export const submitPanelReview = createAsyncThunk(
  'nominations/submitReview',
  async ({ id, score, comments }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/nominations/${id}/review`, {
        score,
        comments,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.error || 'Failed to submit review');
    }
  }
);

const nominationsSlice = createSlice({
  name: 'nominations',
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
      .addCase(fetchNominations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNominations.fulfilled, (state, action) => {
        state.loading = false;
        state.nominations = action.payload;
      })
      .addCase(fetchNominations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchNominationHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      })
      .addCase(fetchNominationById.fulfilled, (state, action) => {
        state.currentNomination = action.payload;
      })
      .addCase(createNomination.fulfilled, (state, action) => {
        state.nominations.push(action.payload);
      })
      .addCase(updateNominationStatus.fulfilled, (state, action) => {
        const index = state.nominations.findIndex(n => n.id === action.payload.id);
        if (index !== -1) {
          state.nominations[index] = action.payload;
        }
        if (state.currentNomination?.id === action.payload.id) {
          state.currentNomination = action.payload;
        }
      });
  },
});

export const { clearError, clearCurrentNomination } = nominationsSlice.actions;
export default nominationsSlice.reducer;

