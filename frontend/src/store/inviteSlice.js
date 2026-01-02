// src/store/inviteSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const mockInvites = [];

export const generateInvite = createAsyncThunk(
    'invite/generate',
    async ({ communityId, role = 'Member' }, { getState }) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        const invite = {
            id: Date.now().toString(),
            code,
            communityId,
            role,
            createdBy: getState().auth.user.name,
            createdAt: new Date().toISOString(),
            used: false,
        };
        mockInvites.push(invite);
        return invite;
    }
);

const inviteSlice = createSlice({
    name: 'invite',
    initialState: { invites: mockInvites, loading: false },
    extraReducers: (builder) => {
        builder
            .addCase(generateInvite.pending, (state) => {
                state.loading = true;
            })
            .addCase(generateInvite.fulfilled, (state, action) => {
                state.loading = false;
                state.invites.push(action.payload);
            });
    },
});

export default inviteSlice.reducer;