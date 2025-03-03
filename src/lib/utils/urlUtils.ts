/**
 * Gets the full URL with the base path prefix for GitHub Pages
 * @param path The path to append to the base path
 * @returns The full URL with the base path
 */
export function getBaseUrl(path: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${cleanPath}`;
}

/**
 * Gets the asset URL with the base path prefix for GitHub Pages
 * @param path The asset path to append to the base path
 * @returns The full asset URL with the base path
 */
export function getAssetUrl(path: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${cleanPath}`;
} 