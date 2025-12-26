// src/store/epicSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchEpics = createAsyncThunk(
    'epic/fetchEpics',
    async ({ communityId }, { rejectWithValue }) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 600));

            return mockEpics.filter(e => e.communityId === communityId || communityId === 'all');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const mockEpics = [
    {
        id: 'epic-1',
        title: 'AI-Powered Task Intelligence Platform',
        description: 'Build core AI features: priority prediction, workload balancer, risk alerts',
        status: 'in_progress',
        progress: 65,
        startDate: '2025-09-01',
        targetDate: '2026-03-31',
        communityId: 'branch-1',
        sprintCount: 3,
        completedSprints: 2,
        color: 'indigo',
    },
    {
        id: 'epic-2',
        title: 'Enterprise Security & Compliance',
        description: 'Implement JWT auth, RBAC, audit logs, data isolation',
        status: 'in_progress',
        progress: 80,
        startDate: '2025-10-01',
        targetDate: '2026-01-15',
        communityId: 'main-1',
        sprintCount: 2,
        completedSprints: 1,
        color: 'purple',
    },
    {
        id: 'epic-3',
        title: 'Multi-Branch Collaboration System',
        description: 'Hierarchical communities, cross-team visibility, invite system',
        status: 'planned',
        progress: 15,
        startDate: '2026-01-01',
        targetDate: '2026-06-30',
        communityId: 'main-1',
        sprintCount: 4,
        completedSprints: 0,
        color: 'blue',
    },
    {
        id: 'epic-4',
        title: 'Mobile App Launch (React Native)',
        description: 'Native iOS/Android apps with voice task creation',
        status: 'planned',
        progress: 0,
        startDate: '2026-04-01',
        targetDate: '2026-12-31',
        communityId: 'branch-2',
        sprintCount: 6,
        completedSprints: 0,
        color: 'green',
    },
];

const initialState = {
    epics: [],
    currentEpic: null,
    loading: false,
    error: null,
};

const epicSlice = createSlice({
    name: 'epic',
    initialState,
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
            .addCase(fetchEpics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setCurrentEpic } = epicSlice.actions;
export default epicSlice.reducer;