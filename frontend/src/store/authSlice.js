// src/store/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: {
        name: 'John Doe',
        role: 'Member', // or 'Admin', 'Super Admin'
    },
    isAuthenticated: true,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
});

export default authSlice.reducer;