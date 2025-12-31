import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

import {
  createPanel,
  listPanels,
  getPanelById,
  updatePanel,
  addPanelMember,
  updatePanelMember as updatePanelMemberApi,
  addPanelTask,
  updatePanelTask as updatePanelTaskApi,
  removePanelMember,
  removePanelTask,
  deletePanel as deletePanelApi,
} from "../../services/panelService";

const initialState = {
  panels: [],
  panelById: {},
  loading: false,
  error: null,
};

/* ============================
   THUNKS
============================ */

/** List panels */
export const fetchPanels = createAsyncThunk(
  "panels/fetchPanels",
  async (_, { rejectWithValue }) => {
    try {
      return await listPanels(); // ✅ array
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to fetch panels");
    }
  }
);

/** Get panel by ID */
export const fetchPanelById = createAsyncThunk(
  "panels/fetchPanelById",
  async (panelId, { rejectWithValue }) => {
    try {
      return await getPanelById(panelId); // ✅ object
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to fetch panel");
    }
  }
);

/** Create panel */
export const createNewPanel = createAsyncThunk(
  "panels/createPanel",
  async (payload, { rejectWithValue }) => {
    try {
      return await createPanel(payload); // ✅ object
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to create panel");
    }
  }
);

/** Update panel */
export const updateExistingPanel = createAsyncThunk(
  "panels/updatePanel",
  async ({ panelId, payload }, { rejectWithValue }) => {
    try {
      return await updatePanel(panelId, payload); // ✅ object
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to update panel");
    }
  }
);

/** Delete panel */
export const deletePanel = createAsyncThunk(
  "panels/deletePanel",
  async (panelId, { rejectWithValue }) => {
    try {
      await deletePanelApi(panelId);
      return panelId;
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to delete panel");
    }
  }
);

/** Add panel member */
export const addMemberToPanel = createAsyncThunk(
  "panels/addMember",
  async ({ panelId, payload }, { rejectWithValue }) => {
    try {
      return {
        panelId,
        member: await addPanelMember(panelId, payload),
      };
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to add member");
    }
  }
);

/** Update panel member */
export const updatePanelMember = createAsyncThunk(
  "panels/updateMember",
  async ({ panelId, memberId, payload }, { rejectWithValue }) => {
    try {
      return {
        panelId,
        memberId,
        member: await updatePanelMemberApi(panelId, memberId, payload),
      };
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to update member");
    }
  }
);

/** Remove panel member */
export const removeMemberFromPanel = createAsyncThunk(
  "panels/removeMember",
  async ({ panelId, memberId }, { rejectWithValue }) => {
    try {
      await removePanelMember(panelId, memberId);
      return { panelId, memberId };
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to remove member");
    }
  }
);

/** Add panel task */
export const addTaskToPanel = createAsyncThunk(
  "panels/addTask",
  async ({ panelId, payload }, { rejectWithValue }) => {
    try {
      return {
        panelId,
        task: await addPanelTask(panelId, payload),
      };
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to add task");
    }
  }
);

/** Update panel task */
export const updatePanelTask = createAsyncThunk(
  "panels/updateTask",
  async ({ panelId, taskId, payload }, { rejectWithValue }) => {
    try {
      return {
        panelId,
        taskId,
        task: await updatePanelTaskApi(panelId, taskId, payload),
      };
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to update task");
    }
  }
);

/** Remove panel task */
export const removeTaskFromPanel = createAsyncThunk(
  "panels/removeTask",
  async ({ panelId, taskId }, { rejectWithValue }) => {
    try {
      await removePanelTask(panelId, taskId);
      return { panelId, taskId };
    } catch (error) {
      return rejectWithValue(error?.error || "Failed to remove task");
    }
  }
);

/* ============================
   SLICE
============================ */

const panelsSlice = createSlice({
  name: "panels",
  initialState,
  reducers: {
    clearPanelsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchPanels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPanels.fulfilled, (state, action) => {
        state.loading = false;
        state.panels = action.payload;
      })
      .addCase(fetchPanels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      .addCase(fetchPanelById.fulfilled, (state, action) => {
        state.panelById[action.payload.id] = action.payload;
      })

      .addCase(createNewPanel.fulfilled, (state, action) => {
        state.panels.unshift(action.payload);
        state.panelById[action.payload.id] = action.payload;
        toast.success("Panel created");
      })

      .addCase(updateExistingPanel.fulfilled, (state, action) => {
        state.panelById[action.payload.id] = action.payload;
        state.panels = state.panels.map((p) =>
          p.id === action.payload.id ? action.payload : p
        );
        toast.success("Panel updated");
      })

      .addCase(deletePanel.fulfilled, (state, action) => {
        state.panels = state.panels.filter((p) => p.id !== action.payload);
        delete state.panelById[action.payload];
        toast.success("Panel deleted");
      })

      .addCase(addMemberToPanel.fulfilled, (state, action) => {
        const panel = state.panelById[action.payload.panelId];
        if (panel) {
          panel.members = panel.members || [];
          panel.members.push(action.payload.member);
        }
      })

      .addCase(updatePanelMember.fulfilled, (state, action) => {
        const panel = state.panelById[action.payload.panelId];
        if (panel?.members) {
          panel.members = panel.members.map((m) =>
            m.id === action.payload.memberId ? action.payload.member : m
          );
        }
      })

      .addCase(removeMemberFromPanel.fulfilled, (state, action) => {
        const panel = state.panelById[action.payload.panelId];
        if (panel?.members) {
          panel.members = panel.members.filter(
            (m) => m.id !== action.payload.memberId
          );
        }
      })

      .addCase(addTaskToPanel.fulfilled, (state, action) => {
        const panel = state.panelById[action.payload.panelId];
        if (panel) {
          panel.tasks = panel.tasks || [];
          panel.tasks.push(action.payload.task);
        }
      })

      .addCase(updatePanelTask.fulfilled, (state, action) => {
        const panel = state.panelById[action.payload.panelId];
        if (panel?.tasks) {
          panel.tasks = panel.tasks.map((t) =>
            t.id === action.payload.taskId ? action.payload.task : t
          );
        }
      })

      .addCase(removeTaskFromPanel.fulfilled, (state, action) => {
        const panel = state.panelById[action.payload.panelId];
        if (panel?.tasks) {
          panel.tasks = panel.tasks.filter(
            (t) => t.id !== action.payload.taskId
          );
        }
      });
  },
});

export const { clearPanelsError } = panelsSlice.actions;
export default panelsSlice.reducer;
