// Centralized API base URL for production/dev compatibility
// In dev: Vite proxy handles /api → localhost:5000
// In production: VITE_API_URL points to Render backend
export const API_BASE = import.meta.env.VITE_API_URL ?? '';
