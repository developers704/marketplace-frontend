/** Derive Socket.IO origin from API base URL (same host as uploads + REST). */
export function getSocketOrigin(baseApi: string): string {
  const raw = String(baseApi || '').trim().replace(/\/$/, '');
  try {
    return new URL(raw).origin;
  } catch {
    return raw;
  }
}
