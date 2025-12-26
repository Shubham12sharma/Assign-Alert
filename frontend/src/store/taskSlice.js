// src/store/taskSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock tasks with storyPoints for velocity
const mockTasks = [
  {
    id: '1',
    title: 'Fix authentication timeout issue',
    description: 'Users are being logged out too quickly in production.',
    priority: 'High',
    taskLevel: 'Hard',
    category: 'Bug',
    status: 'inProgress',
    assignee: { name: 'John Doe', id: '1' },
    dueDate: '2025-12-30',
    estimatedHours: 8,
    storyPoints: 8,
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
    assignee: { name: 'Jane Smith', id: '2' },
    dueDate: '2026-01-15',
    estimatedHours: 20,
    storyPoints: 13,
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
    assignee: { name: 'Alice Chen', id: '3' },
    dueDate: '2025-12-28',
    estimatedHours: 12,
    storyPoints: 5,
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
    assignee: { name: 'Bob Wilson', id: '4' },
    dueDate: '2025-12-25',
    estimatedHours: 6,
    storyPoints: 3,
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
    storyPoints: 8,
    communityId: 'branch-1',
    tags: ['devops', 'infrastructure'],
    comments: [],
    attachments: [],
    activityLogs: [],
    createdAt: '2025-12-15',
  },
];

/* ==================== ASYNC THUNKS ==================== */

export const fetchTasks = createAsyncThunk(
  'task/fetchTasks',
  async ({ communityId }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      return mockTasks.filter(
        task => task.communityId === communityId || communityId === 'all'
      );
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTask = createAsyncThunk(
  'task/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const newTask = {
        ...taskData,
        id: Date.now().toString(),
        status: taskData.status || 'todo',
        progress: 0,
        storyPoints: taskData.storyPoints || 5,
        comments: [],
        attachments: taskData.attachments || [],
        activityLogs: [
          {
            action: 'created task',
            user: 'Current User',
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
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
      await new Promise(resolve => setTimeout(resolve, 300));
      return { taskId, newStatus };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'task/updateTask',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      return { id, updates };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const addCommentToTask = createAsyncThunk(
    'task/addCommentToTask',
    async ({ taskId, comment }, { rejectWithValue }) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300)); // simulate API
            return {
                taskId,
                comment: {
                    text: comment,
                    user: 'Current User', // Replace with real user from auth later
                    timestamp: new Date().toISOString(),
                },
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/* ==================== INITIAL STATE ==================== */
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

/* ==================== SLICE ==================== */
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

            // Update Status (drag-and-drop)
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
            })

            // Full Update (edit modal)
            .addCase(updateTask.fulfilled, (state, action) => {
                const { id, updates } = action.payload;
                const task = state.tasks.find(t => t.id === id);
                if (task) {
                    Object.assign(task, updates);
                    task.activityLogs.push({
                        action: 'updated task',
                        user: 'Current User',
                        timestamp: new Date().toISOString(),
                    });
                }
                if (state.currentTask?.id === id) {
                    state.currentTask = { ...state.currentTask, ...updates };
                }
            })

            // Add Comment – SINGLE HANDLER ONLY
            .addCase(addCommentToTask.fulfilled, (state, action) => {
                const { taskId, comment } = action.payload;
                const task = state.tasks.find(t => t.id === taskId);
                if (task) {
                    task.comments = task.comments || [];
                    task.comments.push(comment);

                    // Add to activity log
                    task.activityLogs.push({
                        action: `added comment: "${comment.text}"`,
                        user: comment.user,
                        timestamp: comment.timestamp,
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