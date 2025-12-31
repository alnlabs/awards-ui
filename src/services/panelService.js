import api from "./api";

/**
 * Panel Service
 *
 * Panels are reusable templates that define:
 * - Reviewers (panel members)
 * - Review criteria (panel tasks)
 *
 * Panels are NOT nomination-specific.
 * They are assigned later via nominations API.
 */

/* ============================
   PANELS
============================ */

/**
 * Create a panel (HR)
 *
 * POST /api/v1/panels
 * Returns: Panel
 */
export const createPanel = (payload) => {
  return api.post("/panels", payload);
};

/**
 * List all panels
 *
 * GET /api/v1/panels
 * Returns: Panel[]
 */
export const listPanels = () => {
  return api.get("/panels");
};

/**
 * Get a single panel
 *
 * GET /api/v1/panels/{panel_id}
 * Returns: Panel
 */
export const getPanelById = (panelId) => {
  return api.get(`/panels/${panelId}`);
};

/**
 * Update panel
 *
 * PUT /api/v1/panels/{panel_id}
 * Returns: Panel
 */
export const updatePanel = (panelId, payload) => {
  return api.put(`/panels/${panelId}`, payload);
};

/**
 * Delete panel
 *
 * DELETE /api/v1/panels/{panel_id}
 * Returns: void
 */
export const deletePanel = (panelId) => {
  return api.delete(`/panels/${panelId}`);
};

/* ============================
   PANEL MEMBERS
============================ */

/**
 * Add member to panel
 *
 * POST /api/v1/panels/{panel_id}/members
 * Returns: PanelMember
 */
export const addPanelMember = (panelId, payload) => {
  return api.post(`/panels/${panelId}/members`, payload);
};

/**
 * Update panel member (role)
 *
 * PUT /api/v1/panels/{panel_id}/members/{member_id}
 * Returns: PanelMember
 */
export const updatePanelMember = (panelId, memberId, payload) => {
  return api.put(`/panels/${panelId}/members/${memberId}`, payload);
};

/**
 * Remove panel member
 *
 * DELETE /api/v1/panels/{panel_id}/members/{member_id}
 * Returns: void
 */
export const removePanelMember = (panelId, memberId) => {
  return api.delete(`/panels/${panelId}/members/${memberId}`);
};

/* ============================
   PANEL TASKS (CRITERIA)
============================ */

/**
 * Add task (criteria) to panel
 *
 * POST /api/v1/panels/{panel_id}/tasks
 * Returns: PanelTask
 */
export const addPanelTask = (panelId, payload) => {
  return api.post(`/panels/${panelId}/tasks`, payload);
};

/**
 * Update panel task (criteria)
 *
 * PUT /api/v1/panels/{panel_id}/tasks/{task_id}
 * Returns: PanelTask
 */
export const updatePanelTask = (panelId, taskId, payload) => {
  return api.put(`/panels/${panelId}/tasks/${taskId}`, payload);
};

/**
 * Remove panel task (criteria)
 *
 * DELETE /api/v1/panels/{panel_id}/tasks/{task_id}
 * Returns: void
 */
export const removePanelTask = (panelId, taskId) => {
  return api.delete(`/panels/${panelId}/tasks/${taskId}`);
};
