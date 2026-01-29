// src/store/inviteSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/api';

// ───────────────────────────────────────────────
// Thunks
// ───────────────────────────────────────────────

export const generateInvite = createAsyncThunk(
    'invites/generate',
    async ({ communityId, role = 'Member' }, { rejectWithValue }) => {
        if (!communityId) {
            return rejectWithValue('Community ID is required to generate an invite');
        }

        try {
            const response = await api.post(
                `/communities/${communityId}/generate-invite/`,
                { role }
            );
            return response.data; // { invite_link, code, ... }
        } catch (error) {
            // Return backend error detail if available
            return rejectWithValue(
                error.response?.data?.detail ||
                error.response?.data ||
                'Failed to generate invite. Please try again.'
            );
        }
    }
);

export const fetchPendingInvites = createAsyncThunk(
    'invites/fetchPending',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/invites/pending/');
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.detail ||
                'Failed to fetch pending invites.'
            );
        }
    }
);

// Optional: you can add more thunks later (acceptInvite, revokeInvite, etc.)

// ───────────────────────────────────────────────
// Slice
// ───────────────────────────────────────────────

const inviteSlice = createSlice({
    name: 'invites', // ← plural feels more natural

    initialState: {
        invites: [],             // generated invites (history / recent)
        pendingInvites: [],      // invites waiting to be accepted
        currentInvite: null,     // ← useful to show just-generated invite
        loading: false,
        error: null,
    },

    reducers: {
        // Optional: clear after showing success
        clearCurrentInvite(state) {
            state.currentInvite = null;
        },
        clearError(state) {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder
            // ── generateInvite ──────────────────────────────────────
            .addCase(generateInvite.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(generateInvite.fulfilled, (state, action) => {
                state.loading = false;
                state.invites.push(action.payload);
                state.currentInvite = action.payload; // ← handy for showing the new link immediately
                state.error = null;
            })
            .addCase(generateInvite.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload; // string error message
            })

            // ── fetchPendingInvites ─────────────────────────────────
            .addCase(fetchPendingInvites.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPendingInvites.fulfilled, (state, action) => {
                state.loading = false;
                state.pendingInvites = action.payload;
                state.error = null;
            })
            .addCase(fetchPendingInvites.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearCurrentInvite, clearError } = inviteSlice.actions;
export default inviteSlice.reducer;