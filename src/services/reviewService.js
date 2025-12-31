import api from "./api";

/**
 * Review Service
 *
 * RULES:
 * - Service ALWAYS returns business data
 * - Never returns axios response
 * - Centralized response format assumed:
 *   { status, message, error, data }
 */

/* =====================================================
   PANEL MEMBER → Submit / Update Task Review
   POST /panel-assignments/{assignment_id}/tasks/{task_id}/review
===================================================== */
export const submitTaskReview = async ({
  panelAssignmentId,
  taskId,
  score,
  comment,
}) => {
  const res = await api.post(
    `/panel-assignments/${panelAssignmentId}/tasks/${taskId}/review`,
    { score, comment }
  );

  return res.data; // ✅ business data only
};

/* =====================================================
   PANEL MEMBER → My Assignments
   GET /panel-assignments/my
===================================================== */
export const getMyPanelAssignments = async () => {
  const res = await api.get("/panel-assignments/my");
  return res.data; // ✅ array of assignments
};

/* =====================================================
   HR / PANEL → All Reviews for Assignment
   GET /panel-assignments/{assignment_id}/reviews
===================================================== */
export const getPanelAssignmentReviews = async (panelAssignmentId) => {
  const res = await api.get(`/panel-assignments/${panelAssignmentId}/reviews`);
  return res.data;
};

/* =====================================================
   PANEL MEMBER → My Reviews for Assignment
   GET /panel-assignments/{assignment_id}/my-reviews
===================================================== */
export const getMyTaskReviews = async (panelAssignmentId) => {
  const res = await api.get(
    `/panel-assignments/${panelAssignmentId}/my-reviews`
  );
  return res.data;
};

/* =====================================================
   HR → Assignment Summary
   GET /panel-assignments/{assignment_id}/summary
===================================================== */
export const getPanelAssignmentSummary = async (panelAssignmentId) => {
  const res = await api.get(`/panel-assignments/${panelAssignmentId}/summary`);
  return res.data;
};
