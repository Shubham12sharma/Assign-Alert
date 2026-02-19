// src/store/sprintSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/api';

// filters: e.g. { epic: epicId } or { community: communityId }
export const fetchSprints = createAsyncThunk('sprint/fetchAll', async (filters = {}) => {
  const response = await api.get('/sprints/', { params: filters });
  return response.data;
});

export const createSprint = createAsyncThunk('sprint/create', async (sprintData, { rejectWithValue }) => {
  try {
    const response = await api.post('/sprints/', sprintData);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to create sprint');
  }
});

export const updateSprint = createAsyncThunk('sprint/update', async ({ id, updates }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/sprints/${id}/`, updates);
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to update sprint');
  }
});

export const deleteSprint = createAsyncThunk('sprint/delete', async (sprintId, { rejectWithValue }) => {
    try {
        await api.delete(`/sprints/${sprintId}/`);
        return sprintId;
    } catch (err) {
        return rejectWithValue(err.response?.data || 'Failed to delete sprint');
    }
});

const sprintSlice = createSlice({
  name: 'sprint',
  initialState: { sprints: [], currentSprint: null, loading: false },
  reducers: {
    setCurrentSprint: (state, action) => {
      state.currentSprint = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSprints.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSprints.fulfilled, (state, action) => {
        state.loading = false;
        state.sprints = action.payload;
      })
      .addCase(fetchSprints.rejected, (state) => {
        state.loading = false;
      });
    builder.addCase(createSprint.fulfilled, (state, action) => {
      state.sprints.unshift(action.payload);
    });
    builder.addCase(updateSprint.fulfilled, (state, action) => {
      const updated = action.payload;
      const idx = state.sprints.findIndex((s) => s.id === updated.id);
      if (idx !== -1) state.sprints[idx] = updated;
    });
    builder.addCase(deleteSprint.fulfilled, (state, action) => {
        state.sprints = state.sprints.filter((s) => s.id !== action.payload);
    });
  },
});

export const { setCurrentSprint } = sprintSlice.actions;
export default sprintSlice.reducer;