import axios from 'axios';

// NOTE: The final exported `api` below will automatically select either a
// Cloudflare Workers endpoint or the default API URL.

/**
 * Cloudflare integration.
 * The application can point to a Cloudflare Workers endpoint by setting the
 * environment variable `VITE_CLOUDFLARE_API_URL`. If it is not defined we fall
 * back to `VITE_API_URL` (which may still point at a traditional backend).
 */
const cloudflareUrl = import.meta.env.VITE_CLOUDFLARE_API_URL ?? '';

// The axios instance will target the Cloudflare endpoint if provided, otherwise
// it uses the standard API URL.
export const api = axios.create({
  baseURL: cloudflareUrl || (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'),
});