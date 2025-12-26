// src/store/sprintSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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

const mockSprints = [
    {
        id: 'sprint-1',
        name: 'December 2025 Monthly Sprint',
        goal: 'Complete AI Task Assistant MVP and fix critical bugs',
        startDate: '2025-12-01',
        endDate: '2025-12-31',
        type: 'monthly',
        communityId: 'branch-1',
        velocity: 48,
        completedPoints: 32,
        totalPoints: 60,
        progress: 53,
        status: 'active',
        retrospective: 'Good velocity, but need better backlog grooming.',
        weeklySprints: [
            { id: 'week-1', name: 'Week 1 (Dec 1-7)', progress: 80 },
            { id: 'week-2', name: 'Week 2 (Dec 8-14)', progress: 65 },
            { id: 'week-3', name: 'Week 3 (Dec 15-21)', progress: 45 },
            { id: 'week-4', name: 'Week 4 (Dec 22-31)', progress: 30 },
        ],
    },
    {
        id: 'sprint-2',
        name: 'Q4 2025 Product Launch Sprint',
        goal: 'Prepare for enterprise client demo and documentation',
        startDate: '2025-10-01',
        endDate: '2025-12-31',
        type: 'quarterly',
        communityId: 'branch-2',
        velocity: 72,
        completedPoints: 72,
        totalPoints: 80,
        progress: 90,
        status: 'completed',
        retrospective: 'On track. Excellent team coordination.',
        weeklySprints: [],
    },
];

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
                state.currentSprint = action.payload.find(s => s.status === 'active') || action.payload[0];
            })
            .addCase(fetchSprints.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setCurrentSprint } = sprintSlice.actions;
export default sprintSlice.reducer;