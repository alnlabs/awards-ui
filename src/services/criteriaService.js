import api from "./api";

/**
 * List all criteria
 * (Backend allows only ONE active criteria)
 */
export const listCriteria = () => {
  return api.get("/forms");
};

/**
 * Get criteria by ID (used for clone/view)
 */
export const getCriteria = (id) => {
  return api.get(`/forms/${id}`);
};

/**
 * Create criteria (create-only)
 */
export const createCriteria = (data) => {
  return api.post("/forms", data);
};

/**
 * Render active criteria
 * (used during nomination submission)
 */
export const renderCriteria = () => {
  return api.get("/forms/active/render");
};
