// src/store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Full mock users with different roles
const mockUsers = [
    {
        id: 'super1',
        name: 'Shubham Sharma',
        email: 'shubham@assignalert.com',
        role: 'Super Admin',
        communities: ['main-1', 'branch-1', 'branch-2'],
    },
    {
        id: 'admin1',
        name: 'Jane Smith',
        email: 'jane@mumbai.assignalert.com',
        role: 'Admin',
        communities: ['branch-1'],
    },
    {
        id: 'member1',
        name: 'John Doe',
        email: 'john@engineering.assignalert.com',
        role: 'Member',
        communities: ['branch-1'],
    },
    {
        id: 'guest1',
        name: 'Guest User',
        email: 'guest@example.com',
        role: 'Guest',
        communities: ['branch-1'],
    },
];

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email }, { rejectWithValue }) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const user = mockUsers.find(
                u => u.email.toLowerCase() === email.toLowerCase()
            );

            if (!user) {
                return rejectWithValue('Invalid email');
            }

            return user;
        } catch (error) {
            return rejectWithValue('Login failed');
        }
    }
);



const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    mode: 'corporate', 
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
        setPersonalMode: (state) => {
            state.mode = 'personal';
        },
        setCorporateMode: (state) => {
            state.mode = 'corporate';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Login failed';
            });
    },
});

export const { logout, setPersonalMode, setCorporateMode } = authSlice.actions;
export default authSlice.reducer;