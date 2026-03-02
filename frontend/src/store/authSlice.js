// src/store/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/api";
import { fetchCommunities } from "./communitySlice";  // ← import this

/* ------------------ LOGIN ------------------ */
export const loginUser = createAsyncThunk(
    "auth/login",
    async (credentials, { dispatch, rejectWithValue }) => {
        try {
            const res = await api.post("/token/", credentials);
            const data = res.data;

            // Save tokens
            if (data.access) localStorage.setItem("access_token", data.access);
            if (data.refresh) localStorage.setItem("refresh_token", data.refresh);

            // Immediately fetch full user profile (includes communities)
            const userRes = await api.get("/api/me/");
            const fullUser = userRes.data;

            // Also trigger communities fetch (important!)
            dispatch(fetchCommunities());

            return {
                tokens: { access: data.access, refresh: data.refresh },
                user: fullUser,
            };
        } catch (err) {
            return rejectWithValue(err.response?.data || { detail: "Login failed" });
        }
    }
);

/* ------------------ FETCH CURRENT USER ------------------ */
export const fetchCurrentUser = createAsyncThunk(
    "auth/me",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/api/me/");
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Failed to fetch user");
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState: {
        tokens: null,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        authReady: false,
        mode: "corporate",
    },

    reducers: {
        logout(state) {
            state.tokens = null;
            state.user = null;
            state.isAuthenticated = false;
            state.authReady = false;
            state.mode = "corporate";
            localStorage.clear();
        },
        setCorporateMode(state) {
            state.mode = "corporate";
            localStorage.setItem("app_mode", "corporate");
        },
        setPersonalMode(state) {
            state.mode = "personal";
            localStorage.setItem("app_mode", "personal");
        },
    },

    extraReducers: (builder) => {
        builder
            // LOGIN
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.tokens = action.payload.tokens;
                state.user = {
                    ...action.payload.user,
                    communities: action.payload.user.communities || [],
                };
                state.isAuthenticated = true;
                state.authReady = true;

                const savedMode = localStorage.getItem("app_mode");
                state.mode = savedMode || "corporate";
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.detail || "Login failed";
            })

            // FETCH USER
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.user = {
                    ...action.payload,
                    communities: action.payload.communities || [],
                };
                state.isAuthenticated = true;
                state.authReady = true;

                const savedMode = localStorage.getItem("app_mode");
                if (savedMode) state.mode = savedMode;
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.authReady = true;
            });
    },
});

export const { logout, setCorporateMode, setPersonalMode } = authSlice.actions;
export default authSlice.reducer;