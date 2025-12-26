// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import communityReducer from './communitySlice';
import taskReducer from './taskSlice';
import sprintReducer from './sprintSlice'; 
import epicReducer from './epicSlice'; 

export const store = configureStore({
    reducer: {
        auth: authReducer,
        community: communityReducer,
        task: taskReducer,
        sprint: sprintReducer,
        epic: epicReducer,
    },
});