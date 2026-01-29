export const USER_ROLES = {
  HR: 'HR',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
  PANEL: 'PANEL',
};

export const CYCLE_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  FINALIZED: 'FINALIZED',
};

export const NOMINATION_STATUS = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  HR_REVIEW: 'HR_REVIEW',
  PANEL_REVIEW: 'PANEL_REVIEW',
  FINALIZED: 'FINALIZED',
};

export const STATUS_COLORS = {
  // Cycle Statuses
  DRAFT: 'secondary',
  ACTIVE: 'info',
  OPEN: 'success',
  CLOSED: 'dark',
  FINALIZED: 'primary',
  
  // Nomination Statuses
  SUBMITTED: 'info',
  PANEL_REVIEW: 'warning',
  HR_REVIEW: 'primary',
  APPROVED: 'success',
  REJECTED: 'danger',
  COMPLETED: 'success',
};

