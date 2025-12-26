// src/store/communitySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching communities (replace with real API later)
export const fetchCommunities = createAsyncThunk(
    'community/fetchCommunities',
    async (_, { rejectWithValue }) => {
        try {
            // TODO: Replace with real API call to Django backend
            // const response = await api.get('/api/communities/');
            // return response.data;

            // Mock delay to simulate API
            await new Promise(resolve => setTimeout(resolve, 500));

            // Realistic mock data based on your PDF structure
            return mockCommunitiesData;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Mock hierarchical data (Main Community + Sub-communities)
const mockCommunitiesData = [
    {
        id: 'main-1',
        name: 'Acme Corporation',
        type: 'main',
        description: 'Headquarters - Main Organization',
        memberCount: 156,
        createdAt: '2024-01-15',
        isMain: true,
        subCommunities: [
            {
                id: 'branch-1',
                name: 'Mumbai Branch',
                type: 'branch',
                description: 'Regional office in Mumbai',
                memberCount: 48,
                createdAt: '2024-03-20',
                subCommunities: [
                    { id: 'team-1', name: 'Engineering Team', type: 'team', memberCount: 22 },
                    { id: 'team-2', name: 'Sales Team', type: 'team', memberCount: 15 },
                    { id: 'team-3', name: 'Design Team', type: 'team', memberCount: 11 },
                ],
            },
            {
                id: 'branch-2',
                name: 'Delhi Branch',
                type: 'branch',
                description: 'Regional office in Delhi',
                memberCount: 62,
                createdAt: '2024-04-10',
                subCommunities: [
                    { id: 'team-4', name: 'Product Team', type: 'team', memberCount: 18 },
                    { id: 'team-5', name: 'Marketing Team', type: 'team', memberCount: 14 },
                    { id: 'team-6', name: 'HR & Operations', type: 'team', memberCount: 30 },
                ],
            },
            {
                id: 'dept-1',
                name: 'Central IT Department',
                type: 'department',
                description: 'Cross-branch IT support',
                memberCount: 20,
                createdAt: '2024-02-01',
                subCommunities: [],
            },
        ],
    },
];

const initialState = {
    communities: [],           // All loaded communities (usually just the main one + subs)
    currentCommunity: null,    // Selected/active community
    loading: false,
    error: null,
};

const communitySlice = createSlice({
    name: 'community',
    initialState,
    reducers: {
        setCurrentCommunity: (state, action) => {
            state.currentCommunity = action.payload;
        },
        clearCurrentCommunity: (state) => {
            state.currentCommunity = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCommunities.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCommunities.fulfilled, (state, action) => {
                state.loading = false;
                state.communities = action.payload;
                // Auto-select main community if exists
                state.currentCommunity = action.payload.find(c => c.isMain) || action.payload[0] || null;
            })
            .addCase(fetchCommunities.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to load communities';
            });
    },
});

export const { setCurrentCommunity, clearCurrentCommunity } = communitySlice.actions;

export default communitySlice.reducer;