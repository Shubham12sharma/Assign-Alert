// src/store/taskSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks for task operations (replace with real Django API calls later)
export const fetchTasks = createAsyncThunk(
    'task/fetchTasks',
    async ({ communityId }, { rejectWithValue }) => {
        try {
            // TODO: Replace with real API
            // const response = await api.get(`/api/communities/${communityId}/tasks/`);
            // return response.data;

            await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network

            // Filter mock tasks by community (for now, all tasks belong to main)
            return mockTasks.filter(task => task.communityId === communityId || communityId === 'all');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createTask = createAsyncThunk(
    'task/createTask',
    async (taskData, { rejectWithValue }) => {
        try {
            // TODO: POST to Django backend
            await new Promise(resolve => setTimeout(resolve, 400));
            const newTask = {
                ...taskData,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                comments: [],
                activityLogs: [{ action: 'created task', user: 'Current User', timestamp: new Date().toISOString() }],
            };
            return newTask;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateTaskStatus = createAsyncThunk(
    'task/updateTaskStatus',
    async ({ taskId, newStatus }, { rejectWithValue }) => {
        try {
            // TODO: PATCH to backend
            await new Promise(resolve => setTimeout(resolve, 300));
            return { taskId, newStatus };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Comprehensive mock tasks based on your PDF
const mockTasks = [
    {
        id: '1',
        title: 'Fix authentication timeout issue',
        description: 'Users are being logged out too quickly in production.',
        priority: 'High',
        taskLevel: 'Hard',
        category: 'Bug',
        status: 'inProgress',
        assignee: { name: 'John Doe', avatar: null },
        dueDate: '2025-12-30',
        estimatedHours: 8,
        communityId: 'branch-1',
        tags: ['auth', 'security', 'urgent'],
        comments: [],
        attachments: [],
        activityLogs: [],
        createdAt: '2025-12-20',
    },
    {
        id: '2',
        title: 'Implement AI deadline risk predictor',
        description: 'Build backend endpoint for AI risk analysis.',
        priority: 'High',
        taskLevel: 'Hard',
        category: 'Feature',
        status: 'todo',
        assignee: { name: 'Jane Smith', avatar: null },
        dueDate: '2026-01-15',
        estimatedHours: 20,
        communityId: 'branch-1',
        tags: ['AI', 'backend', 'priority'],
        comments: [],
        attachments: [],
        activityLogs: [],
        createdAt: '2025-12-22',
    },
    {
        id: '3',
        title: 'Design new dashboard widgets',
        description: 'Create mockups for AI insights and sprint velocity.',
        priority: 'Medium',
        taskLevel: 'Medium',
        category: 'Design',
        status: 'review',
        assignee: { name: 'Alice Chen', avatar: null },
        dueDate: '2025-12-28',
        estimatedHours: 12,
        communityId: 'branch-1',
        tags: ['UI/UX', 'dashboard'],
        comments: [],
        attachments: ['mockup-v1.png'],
        activityLogs: [],
        createdAt: '2025-12-18',
    },
    {
        id: '4',
        title: 'Write user documentation for Kanban view',
        description: 'Document drag-and-drop, filters, and views.',
        priority: 'Low',
        taskLevel: 'Easy',
        category: 'Documentation',
        status: 'done',
        assignee: { name: 'Bob Wilson', avatar: null },
        dueDate: '2025-12-25',
        estimatedHours: 6,
        communityId: 'branch-2',
        tags: ['docs', 'onboarding'],
        comments: [],
        attachments: [],
        activityLogs: [],
        createdAt: '2025-12-10',
    },
    {
        id: '5',
        title: 'Set up CI/CD pipeline for frontend',
        description: 'Automate builds and deployments.',
        priority: 'Medium',
        taskLevel: 'Medium',
        category: 'Deployment',
        status: 'backlog',
        assignee: null,
        dueDate: null,
        estimatedHours: 10,
        communityId: 'branch-1',
        tags: ['devops', 'infrastructure'],
        comments: [],
        attachments: [],
        activityLogs: [],
        createdAt: '2025-12-15',
    },
];

const initialState = {
    tasks: [],
    currentTask: null,
    loading: false,
    error: null,
    filters: {
        priority: 'all',
        category: 'all',
        assignee: 'all',
        status: 'all',
    },
};

const taskSlice = createSlice({
    name: 'task',
    initialState,
    reducers: {
        setCurrentTask: (state, action) => {
            state.currentTask = action.payload;
        },
        clearCurrentTask: (state) => {
            state.currentTask = null;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = initialState.filters;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Tasks
            .addCase(fetchTasks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.tasks = action.payload;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to load tasks';
            })

            // Create Task
            .addCase(createTask.fulfilled, (state, action) => {
                state.tasks.unshift(action.payload);
            })

            // Update Status (from drag-and-drop)
            .addCase(updateTaskStatus.fulfilled, (state, action) => {
                const { taskId, newStatus } = action.payload;
                const task = state.tasks.find(t => t.id === taskId);
                if (task) {
                    task.status = newStatus;
                    task.activityLogs.push({
                        action: `moved to ${newStatus}`,
                        user: 'Current User',
                        timestamp: new Date().toISOString(),
                    });
                }
            });
    },
});

export const {
    setCurrentTask,
    clearCurrentTask,
    setFilters,
    clearFilters,
} = taskSlice.actions;

export default taskSlice.reducer;