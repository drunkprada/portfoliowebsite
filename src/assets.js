// Public files are copied as-is by Vite. Use the same base as the built page.
export const publicAsset = path => (import.meta.env?.BASE_URL ?? './') + path;
