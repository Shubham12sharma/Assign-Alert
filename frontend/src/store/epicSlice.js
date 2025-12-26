// src/store/epicSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

/* =========================
   FETCH EPICS
========================= */
export const fetchEpics = createAsyncThunk(
    'epic/fetchEpics',
    async ({ communityId }, { rejectWithValue }) => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 600)); // simulate API

            return mockEpics.filter(
                (e) => e.communityId === communityId || communityId === 'all'
            );
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/* =========================
   CREATE EPIC
========================= */
export const createEpic = createAsyncThunk(
    'epic/createEpic',
    async (epicData, { rejectWithValue }) => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 500)); // simulate API

            const newEpic = {
                ...epicData,
                id: Date.now().toString(),
                progress: 0,
                sprintCount: 0,
                completedSprints: 0,
                sprintIds: [], // Initialize sprintIds array
            };

            return newEpic;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/* =========================
   LINK/UNLINK SPRINT TO EPIC
========================= */
export const linkSprintToEpic = createAsyncThunk(
    'epic/linkSprint',
    async ({ epicId, sprintId, link }, { rejectWithValue, getState }) => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 300)); // simulate API

            // Access full state here in the thunk (allowed)
            const { sprint } = getState();
            const linkedSprints = sprint.sprints.filter((s) =>
                link
                    ? /* when linking */ false // will be recalculated in reducer
                    : sprint.sprints // placeholder; actual calculation in reducer
            );

            return { epicId, sprintId, link, linkedSprints };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/* =========================
   MOCK DATA
========================= */
const mockEpics = [
    {
        id: 'epic-1',
        sprintIds: [],
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
        sprintIds: [],
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
        sprintIds: [],
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
        sprintIds: [],
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

/* =========================
   SLICE
========================= */
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
        // Fetch epics
        builder
            .addCase(fetchEpics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEpics.fulfilled, (state, action) => {
                state.loading = false;
                state.epics = action.payload;
            })
            .addCase(fetchEpics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create epic
            .addCase(createEpic.pending, (state) => {
                state.loading = true;
            })
            .addCase(createEpic.fulfilled, (state, action) => {
                state.loading = false;
                state.epics.unshift(action.payload); // add to top
            })
            .addCase(createEpic.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Link/Unlink sprint
            .addCase(linkSprintToEpic.fulfilled, (state, action) => {
                const { epicId, sprintId, link, linkedSprints } = action.payload;
                const epic = state.epics.find((e) => e.id === epicId);

                if (epic) {
                    if (link) {
                        if (!epic.sprintIds.includes(sprintId)) {
                            epic.sprintIds.push(sprintId);
                        }
                    } else {
                        epic.sprintIds = epic.sprintIds.filter((id) => id !== sprintId);
                    }

                    // Recalculate progress, counts based on current linked sprints
                    const currentLinked = linkedSprints.filter((s) =>
                        epic.sprintIds.includes(s.id)
                    );

                    epic.progress =
                        currentLinked.length > 0
                            ? Math.round(
                                currentLinked.reduce((sum, s) => sum + s.progress, 0) /
                                currentLinked.length
                            )
                            : 0;

                    epic.completedSprints = currentLinked.filter(
                        (s) => s.status === 'completed'
                    ).length;

                    epic.sprintCount = epic.sprintIds.length;
                }
            });
    },
});

export const { setCurrentEpic } = epicSlice.actions;
export default epicSlice.reducer;