// src/store/sprintSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock sprints (your existing data)
const mockSprints = [
  // ... your mock data ...
];

export const fetchSprints = createAsyncThunk(
  'sprint/fetchSprints',
  async ({ communityId }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 700));
      return mockSprints.filter(s => s.communityId === communityId || communityId === 'all');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createSprint = createAsyncThunk(
  'sprint/createSprint',
  async (sprintData, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newSprint = {
        ...sprintData,
        id: Date.now().toString(),
        progress: 0,
        velocity: 0,
        status: 'planned',
      };
      return newSprint;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ADD THIS: Update Sprint Thunk
export const updateSprint = createAsyncThunk(
  'sprint/updateSprint',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      return { id, updates };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  sprints: [],
  currentSprint: null,
  loading: false,
  error: null,
};

const sprintSlice = createSlice({
  name: 'sprint',
  initialState,
  reducers: {
    setCurrentSprint: (state, action) => {
      state.currentSprint = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSprints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSprints.fulfilled, (state, action) => {
        state.loading = false;
        state.sprints = action.payload;
        if (!state.currentSprint) {
          state.currentSprint = action.payload.find(s => s.status === 'active') || action.payload[0];
        }
      })
      .addCase(fetchSprints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSprint.fulfilled, (state, action) => {
        state.sprints.unshift(action.payload);
      })
      // ADD THIS: Handle updateSprint
      .addCase(updateSprint.fulfilled, (state, action) => {
        const { id, updates } = action.payload;
        const index = state.sprints.findIndex(s => s.id === id);
        if (index !== -1) {
          state.sprints[index] = { ...state.sprints[index], ...updates };
        }
        if (state.currentSprint?.id === id) {
          state.currentSprint = { ...state.currentSprint, ...updates };
        }
      });
  },
});

export const { setCurrentSprint } = sprintSlice.actions;
export default sprintSlice.reducer;