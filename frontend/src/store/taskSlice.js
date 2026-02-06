import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/api';

// Fetch community tasks with filter
export const fetchTasks = createAsyncThunk(
  'task/fetchTasks',
  async (communityId = null, { rejectWithValue }) => {
    try {
      let url = '/tasks/';
      if (communityId && communityId !== 'all') {
        url += `?community=${communityId}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch tasks');
    }
  }
);

// Fetch personal tasks
export const fetchPersonalTasks = createAsyncThunk(
  'task/fetchPersonalTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tasks/?personal=true');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch personal tasks');
    }
  }
);

export const createTask = createAsyncThunk(
  'task/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await api.post('/tasks/', taskData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to create task');
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'task/updateTaskStatus',
  async ({ taskId, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/`, { status });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to update task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'task/updateTask',
  async ({ taskId, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'task/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${taskId}/`);
      return taskId;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to delete task');
    }
  }
);

export const addCommentToTask = createAsyncThunk(
  'task/addCommentToTask',
  async ({ taskId, comment }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tasks/${taskId}/comments/`, { text: comment });
      return { taskId, comment: response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to add comment');
    }
  }
);

const taskSlice = createSlice({
  name: 'task',
  initialState: {
    tasks: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      // Fetch community tasks – MERGE, don't replace
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        const incoming = Array.isArray(action.payload) ? action.payload : [];
        incoming.forEach((newTask) => {
          const index = state.tasks.findIndex((t) => t.id === newTask.id);
          if (index !== -1) {
            state.tasks[index] = { ...state.tasks[index], ...newTask };
          } else {
            state.tasks.push(newTask);
          }
        });
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch personal tasks – same merge logic
      .addCase(fetchPersonalTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPersonalTasks.fulfilled, (state, action) => {
        state.loading = false;
        const incoming = Array.isArray(action.payload) ? action.payload : [];
        incoming.forEach((newTask) => {
          const index = state.tasks.findIndex((t) => t.id === newTask.id);
          if (index !== -1) {
            state.tasks[index] = { ...state.tasks[index], ...newTask };
          } else {
            state.tasks.push(newTask);
          }
        });
      })
      .addCase(fetchPersonalTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create – add to front
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      })

      // Update status
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.tasks.findIndex((t) => t.id === updated.id);
        if (index !== -1) {
          state.tasks[index] = { ...state.tasks[index], ...updated };
        }
      })

      .addCase(updateTask.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.tasks.findIndex((t) => t.id === updated.id);
        if (index !== -1) {
          state.tasks[index] = { ...state.tasks[index], ...updated };
        }
      })

      .addCase(deleteTask.fulfilled, (state, action) => {
        const id = action.payload;
        state.tasks = state.tasks.filter(t => t.id !== id);
      })

      // Add comment
      .addCase(addCommentToTask.fulfilled, (state, action) => {
        const { taskId, comment } = action.payload;
        const task = state.tasks.find((t) => t.id === taskId);
        if (task) {
          task.comments = task.comments || [];
          task.comments.push(comment);
        }
      });
  },
});

export default taskSlice.reducer;