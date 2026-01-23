/**
 * Formats a date string or object into a human-readable locale format.
 * Handles "YYYY-MM-DD" strings to avoid UTC-shift issues.
 * 
 * @param {string|Date} dateValue - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
export const formatDate = (dateValue, options = { dateStyle: 'medium' }) => {
  if (!dateValue) return "";
  
  let date;
  if (typeof dateValue === 'string' && dateValue.includes('-') && !dateValue.includes('T')) {
    // If it's a YYYY-MM-DD string, replace - with / to force local timezone parsing
    date = new Date(dateValue.replace(/-/g, '/'));
  } else {
    date = new Date(dateValue);
  }

  if (isNaN(date.getTime())) return String(dateValue);

  return date.toLocaleString(undefined, options);
};

/**
 * Formats a datetime string into a human-readable format.
 */
export const formatDateTime = (dateValue) => {
  return formatDate(dateValue, { 
    dateStyle: 'medium', 
    timeStyle: 'short' 
  });
};
