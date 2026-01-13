import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/api';

export const fetchTasks = createAsyncThunk('task/fetchTasks', async (_, { getState }) => {
  const { auth } = getState();
  const response = await api.get('/tasks/');
  return response.data;
});

export const fetchPersonalTasks = createAsyncThunk('task/fetchPersonalTasks', async (_, { getState, rejectWithValue }) => {
  try {
    const response = await api.get('/tasks/?personal=true');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to fetch personal tasks');
  }
});

export const createTask = createAsyncThunk('task/createTask', async (taskData) => {
  const response = await api.post('/tasks/', taskData);
  return response.data;
});

export const updateTaskStatus = createAsyncThunk(
  'task/updateTaskStatus',
  async ({ taskId, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/`, { status });
      return response.data; // return updated task
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to update task');
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
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      // Personal tasks
      .addCase(fetchPersonalTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPersonalTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchPersonalTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      });
      // add comment
      builder.addCase(addCommentToTask.fulfilled, (state, action) => {
        const { taskId, comment } = action.payload;
        const task = state.tasks.find((t) => t.id === taskId);
        if (task) {
          task.comments = task.comments || [];
          task.comments.push(comment);
        }
      });
      // update task
      builder.addCase(updateTaskStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.tasks.findIndex((t) => t.id === updated.id);
        if (idx !== -1) state.tasks[idx] = updated;
      });
  },
});

export default taskSlice.reducer;