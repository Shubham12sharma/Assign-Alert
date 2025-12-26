// src/store/notificationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    notifications: [],
    unreadCount: 0,
};

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        addNotification: (state, action) => {
            state.notifications.unshift({
                id: Date.now().toString(),
                ...action.payload,
                read: false,
                timestamp: new Date().toISOString(),
            });
            state.unreadCount += 1;
        },
        markAsRead: (state, action) => {
            const notif = state.notifications.find(n => n.id === action.payload);
            if (notif && !notif.read) {
                notif.read = true;
                state.unreadCount -= 1;
            }
        },
        markAllAsRead: (state) => {
            state.notifications.forEach(n => n.read = true);
            state.unreadCount = 0;
        },
    },
});

export const { addNotification, markAsRead, markAllAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;