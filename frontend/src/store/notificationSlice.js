// src/store/notificationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/api';

export const fetchNotifications = createAsyncThunk(
    'notification/fetchAll',
    async () => {
        const response = await api.get('/alerts/');
        return response.data;
    }
);

export const markAsRead = createAsyncThunk(
    'notification/markAsRead',
    async (alertId) => {
        await api.patch(`/alerts/${alertId}/`, { read: true });
        return alertId;
    }
);

export const markAllAsRead = createAsyncThunk(
    'notification/markAllAsRead',
    async (_, { getState }) => {
        const { notifications } = getState().notification;
        const unread = notifications.filter(n => !n.read);
        await Promise.all(
            unread.map(alert => api.patch(`/alerts/${alert.id}/`, { read: true }))
        );
        return unread.map(a => a.id);
    }
);

const notificationSlice = createSlice({
    name: 'notification',
    initialState: {
        notifications: [],
        unreadCount: 0,
        loading: false,
    },
    reducers: {
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            if (!action.payload.read) state.unreadCount += 1;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.notifications = action.payload;
                state.unreadCount = action.payload.filter(n => !n.read).length;
            })
            .addCase(markAsRead.fulfilled, (state, action) => {
                const alert = state.notifications.find(n => n.id === action.payload);
                if (alert && !alert.read) {
                    alert.read = true;
                    state.unreadCount -= 1;
                }
            })
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.notifications.forEach(n => n.read = true);
                state.unreadCount = 0;
            });
    },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;