// src/store/epicSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/api';

export const fetchEpics = createAsyncThunk('epic/fetchAll', async (communityId) => {
    const response = await api.get('/epics/', { params: { community: communityId } });
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

export const linkSprintToEpic = createAsyncThunk(
    'epic/linkSprint',
    async ({ epicId, sprintId, link }, { getState, rejectWithValue }) => {
        try {
            // Fetch current epic from state to compute new sprintIds
            const { epic } = getState();
            const targetEpic = epic.epics.find((e) => e.id === epicId);
            if (!targetEpic) throw new Error('Epic not found');

            const currentSprintIds = Array.isArray(targetEpic.sprintIds) ? [...targetEpic.sprintIds] : [];
            let updatedSprintIds;
            if (link) {
                updatedSprintIds = Array.from(new Set([...currentSprintIds, sprintId]));
            } else {
                updatedSprintIds = currentSprintIds.filter((id) => id !== sprintId);
            }

            const response = await api.patch(`/epics/${epicId}/`, { sprintIds: updatedSprintIds });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to link sprint');
        }
    }
);

const epicSlice = createSlice({
    name: 'epic',
    initialState: { epics: [], loading: false, currentEpic: null },
    extraReducers: (builder) => {
        builder.addCase(fetchEpics.fulfilled, (state, action) => {
            state.epics = action.payload;
        });
        builder.addCase(createEpic.fulfilled, (state, action) => {
            state.epics.unshift(action.payload);
        });
        builder.addCase(linkSprintToEpic.fulfilled, (state, action) => {
            const updatedEpic = action.payload;
            const idx = state.epics.findIndex((e) => e.id === updatedEpic.id);
            if (idx !== -1) state.epics[idx] = updatedEpic;
        });
    },
    reducers: {
        setCurrentEpic: (state, action) => {
            state.currentEpic = action.payload;
        },
    },
});

export const { setCurrentEpic } = epicSlice.actions;
export default epicSlice.reducer;