/**
 * Read a query-string parameter as a trimmed string.
 * Returns undefined when absent, empty, repeated (array) or not a string,
 * so callers can never hit string methods on arrays/objects.
 */
export const queryString = (value, maxLength = 100) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (trimmed === '' || trimmed.length > maxLength) return undefined;
  return trimmed;
};

export const MAX_SEARCH_LENGTH = 100;
