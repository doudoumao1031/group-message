/**
 * Utility functions for API URL construction
 */

/**
 * Get the base API URL using the environment variable
 * @returns The base API URL
 */
export function getApiBaseUrl(): string {
  const host = process.env.NEXT_PUBLIC_HOST || 'localhost';
  return `http://${host}:9999/api/v1`;
}

/**
 * Get the full API URL for a specific endpoint
 * @param endpoint The API endpoint path
 * @returns The full API URL
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
}

// Common API endpoints
export const API_ENDPOINTS = {
  IMPORT_MESSAGE: 'import/message',
  SEARCH_USER: 'search/user',
  GET_DIALOG_LAST_DATE: 'getdialoglastdate'
};
