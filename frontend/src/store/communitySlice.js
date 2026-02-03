import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import api from '../api/api';

// Simple 24-character hex mongo_id generator (for frontend)
function generateMongoId() {
    return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

export const fetchCommunities = createAsyncThunk('community/fetchAll', async () => {
    const response = await api.get('/communities/');
    return response.data;
});
export const setCommunityMembers = createAction('community/setCommunityMembers', (members) => ({
    payload: members,
}));

export const createCommunity = createAsyncThunk('community/create', async (communityData, { rejectWithValue }) => {
    try {
        // Generate mongo_id if not provided
        const mongoId = communityData.mongo_id || generateMongoId();

        const payload = {
            mongo_id: mongoId,
            name: communityData.name,
            parent: communityData.parent || null,
            members: communityData.members || [],
            member_count: communityData.member_count || 0,
        };

        const response = await api.post('/communities/', payload);
        return response.data;  // Includes the created community's mongo_id
    } catch (error) {
        return rejectWithValue(error.response?.data || error.message);
    }
});

const communitySlice = createSlice({
    name: 'community',
    initialState: {
        communities: [],
        currentCommunity: null,
        loading: false,
        error: null,  // Added for error handling
    },
    reducers: {
        setCurrentCommunity: (state, action) => {
            state.currentCommunity = action.payload;
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
                console.log('RAW COMMUNITIES FROM API:', action.payload);          // ← add this
                console.log('Type of payload:', typeof action.payload);            // ← add this
                console.log('First item keys (if exists):', action.payload[0] ? Object.keys(action.payload[0]) : 'empty array');
            })
            .addCase(setCommunityMembers, (state, action) => {
                state.realUsers = action.payload;
            })
            .addCase(fetchCommunities.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createCommunity.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCommunity.fulfilled, (state, action) => {
                state.loading = false;
                state.communities.push(action.payload);  // Add new community to list
                state.currentCommunity = action.payload.mongo_id;  // Optional: set as current
            })
            .addCase(createCommunity.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;  // e.g. mongo_id required error
            });
    },
});

export const { setCurrentCommunity } = communitySlice.actions;
export default communitySlice.reducer;