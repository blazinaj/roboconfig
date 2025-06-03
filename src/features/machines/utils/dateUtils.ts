// Helper function to ensure a value is a Date object
export const ensureDate = (date: any): Date | null => {
  if (!date) return null;
  if (date instanceof Date) return date;
  // If it's a string or number, try to convert it to a Date
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? null : parsed;
};

// Helper function to format dates safely
export const formatDate = (date: any): string => {
  const dateObj = ensureDate(date);
  return dateObj ? dateObj.toLocaleDateString() : 'Not scheduled';
};