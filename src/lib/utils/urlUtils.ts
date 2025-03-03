/**
 * Get the base URL for the application
 * This handles both development and production environments
 */
export function getBaseUrl(): string {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Get the current URL
    const url = window.location.href;
    // Remove any trailing slash
    return url.replace(/\/$/, '');
  }

  // For server-side rendering, use environment variables
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

  // If we have a base URL, use it
  if (baseUrl) {
    return baseUrl.replace(/\/$/, '');
  }

  // Otherwise, construct from base path
  return basePath ? `/${basePath.replace(/^\/|\/$/g, '')}` : '';
}

/**
 * Get the full URL for an asset
 * This ensures assets are loaded from the correct path in both development and production
 */
export function getAssetUrl(path: string): string {
  const baseUrl = getBaseUrl();
  // Remove leading slash from path if it exists
  const cleanPath = path.replace(/^\//, '');
  return `${baseUrl}/${cleanPath}`;
}

/**
 * Get the full URL for an API endpoint
 * This ensures API calls are made to the correct path in both development and production
 */
export function getApiUrl(path: string): string {
  const baseUrl = getBaseUrl();
  // Remove leading slash from path if it exists
  const cleanPath = path.replace(/^\//, '');
  return `${baseUrl}/api/${cleanPath}`;
}

/**
 * Check if we're in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Get the current path without the base path
 */
export function getCurrentPath(): string {
  if (!isBrowser()) return '';
  
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const path = window.location.pathname;
  
  if (!basePath) return path;
  
  return path.replace(new RegExp(`^/${basePath}`), '') || '/';
} 