import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/api";

export const loginUser = createAsyncThunk(
    "auth/login",
    async (credentials) => {
        const res = await api.post("/token/", credentials);
        return res.data;
    }
);

// Provide a compatibility alias `login` because some components import { login }
export const login = loginUser;

/* ------------------ /me/ ------------------ */
export const fetchCurrentUser = createAsyncThunk(
    "auth/me",
    async () => {
        const res = await api.get("/me/");
        return res.data;
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState: {
        tokens: null,
        user: null,
        isAuthenticated: false,
        loading: false,
        mode: "personal",
    },

    reducers: {
        logout(state) {
            state.tokens = null;
            state.user = null;
            state.isAuthenticated = false;
        },
    },

    extraReducers: (builder) => {
        builder

            /* ---------- LOGIN ---------- */
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;

                // Support both response shapes: { tokens: {...}, user: {...} } or { access, refresh }
                const tokens = action.payload.tokens || action.payload;

                state.tokens = tokens;

                // Normalize user object and ensure communities is always an array
                const user = action.payload.user || null;
                state.user = user
                    ? { ...user, communities: user.communities || [] }
                    : null;

                state.isAuthenticated = !!state.user;

                // Persist tokens to localStorage so other parts of the app (api interceptors, routing)
                // can read them immediately after login
                if (tokens?.access) localStorage.setItem('access_token', tokens.access);
                if (tokens?.refresh) localStorage.setItem('refresh_token', tokens.refresh);

                // Default mode decision
                state.mode = (state.user?.communities?.length > 0) ? "community" : "personal";
            })
            .addCase(loginUser.rejected, (state) => {
                state.loading = false;
            })

            /* ---------- /me/ ---------- */
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                // 🔴 DO NOT OVERWRITE EXISTING USER
                state.user = {
                    ...state.user,
                    ...action.payload,
                };
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
