import api from "./api";

/**
 * List all criteria
 * Returns: Criteria[]
 */
export const listCriteria = async () => {
  return api.get("/forms");
};

/**
 * Get criteria by ID
 * Returns: Criteria
 */
export const getCriteria = async (id) => {
  return api.get(`/forms/${id}`);
};

/**
 * Create criteria
 * Returns: { id }
 */
export const createCriteria = async (data) => {
  return api.post("/forms", data);
};

/**
 * Update criteria (EDIT – same record)
 * Returns: { id }
 */
export const updateCriteria = async (id, data) => {
  return api.put(`/forms/${id}`, data);
};

/**
 * Render active criteria
 * Returns: { form_id, fields }
 */
export const renderCriteria = async () => {
  return api.get("/forms/active");
};
