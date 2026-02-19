// src/store/epicSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/api';

// filters: e.g. { community: communityId }
export const fetchEpics = createAsyncThunk('epic/fetchAll', async (filters = {}) => {
    const response = await api.get('/epics/', { params: filters });
    return response.data;
});

export const createEpic = createAsyncThunk('epic/create', async (epicData, { rejectWithValue }) => {
    try {
        const response = await api.post('/epics/', epicData);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data || 'Failed to create epic');
    }
});

export const deleteEpic = createAsyncThunk(
    'epic/delete',
    async (epicId, { rejectWithValue }) => {
        try {
            await api.delete(`/epics/${epicId}/`);
            return epicId;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to delete epic');
        }
    }
);

export const updateEpic = createAsyncThunk(
    'epic/update',
    async ({ id, updates }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/epics/${id}/`, updates);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to update epic');
        }
    }
);

export const linkSprintToEpic = createAsyncThunk(
    'epic/linkSprint',
    async ({ epicId, sprintId, link }, { getState, rejectWithValue }) => {
        try {
            // Fetch current epic from state to compute new sprintIds
            // Linking is controlled by Sprint model: update sprint.epic
            const response = await api.patch(`/sprints/${sprintId}/`, {
                epic: link ? epicId : null,
            });
            return response.data; // updated sprint
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to link sprint');
        }
    }
);

const epicSlice = createSlice({
    name: 'epic',
    initialState: { epics: [], loading: false, currentEpic: null },
    reducers: {
        setCurrentEpic: (state, action) => {
            state.currentEpic = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEpics.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchEpics.fulfilled, (state, action) => {
                state.loading = false;
                state.epics = action.payload;
            })
            .addCase(fetchEpics.rejected, (state) => {
                state.loading = false;
            })
            .addCase(createEpic.fulfilled, (state, action) => {
                state.epics.unshift(action.payload);
            })
            .addCase(deleteEpic.fulfilled, (state, action) => {
                const id = action.payload;
                state.epics = state.epics.filter((e) => e.id !== id);
                if (state.currentEpic && state.currentEpic.id === id) {
                    state.currentEpic = null;
                }
            })
            .addCase(updateEpic.fulfilled, (state, action) => {
                const updated = action.payload;
                const idx = state.epics.findIndex((e) => e.id === updated.id);
                if (idx !== -1) {
                    state.epics[idx] = updated;
                }
                if (state.currentEpic && state.currentEpic.id === updated.id) {
                    state.currentEpic = updated;
                }
            })
            // When linking/unlinking, we get back an updated Sprint – epic stats
            // are recomputed on the backend when epics are fetched again.
            .addCase(linkSprintToEpic.fulfilled, () => {
                // no-op here; caller can refetch sprints/epics if needed
            });
    },
});

export const { setCurrentEpic } = epicSlice.actions;
export default epicSlice.reducer;