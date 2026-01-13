// src/store/inviteSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/api';

export const generateInvite = createAsyncThunk(
    'invite/generate',
    async ({ communityId, role = 'Member' }) => {
        // Your backend should have an endpoint for this
        const response = await api.post('/communities/generate-invite/', {
            community: communityId,
            role,
        });
        return response.data;
    }
);

export const fetchPendingInvites = createAsyncThunk(
    'invite/fetchPending',
    async () => {
        const response = await api.get('/invites/pending/');
        return response.data;
    }
);

const inviteSlice = createSlice({
    name: 'invite',
    initialState: {
        invites: [],
        pendingInvites: [],
        loading: false,
    },
    extraReducers: (builder) => {
        builder
            .addCase(generateInvite.fulfilled, (state, action) => {
                state.invites.push(action.payload);
            })
            .addCase(fetchPendingInvites.fulfilled, (state, action) => {
                state.pendingInvites = action.payload;
            });
    },
});

export default inviteSlice.reducer;