// ─────────────────────────────────────────────────────────────────────────────
// api.js — thin fetch wrapper for the Java Spring Boot backend
//
// All requests go through here so error handling, the JWT header, and the
// base URL live in ONE place.
//
//   - REACT_APP_API_URL is optional. Empty = same origin (e.g. served BY the
//     backend or via a reverse proxy). Default while developing: localhost:8091.
//   - ApiError carries the backend's JSON message so the UI can show it 1:1.
// ─────────────────────────────────────────────────────────────────────────────

const BASE = (process.env.REACT_APP_API_URL || 'http://localhost:8091').replace(/\/+$/, '');

const TOKEN_KEY = 'hf_jwt';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const getToken     = () => localStorage.getItem(TOKEN_KEY);
export const setToken     = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken   = () => localStorage.removeItem(TOKEN_KEY);

function headers(auth = true) {
  const h = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) h.Authorization = `Bearer ${token}`;
  }
  return h;
}

/** Core request helper. Throws ApiError with the backend's message on failure. */
async function request(method, path, body, auth = true) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: headers(auth),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Network-level failure: backend down, DNS, CORS refusal, etc.
    throw new ApiError('Cannot reach the server. Is the Java backend running on :8091?', 0);
  }

  if (res.status === 204) return null;

  let data = null;
  try { data = await res.json(); } catch { /* non-JSON error body */ }

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) ||
      (res.status === 401 ? 'Session expired. Please sign in again.' : `Request failed (${res.status}).`);
    throw new ApiError(message, res.status);
  }
  return data;
}

/* ── Auth ─────────────────────────────────────────────────────────────────── */

export const apiSignup = (payload)   => request('POST', '/api/auth/signup', payload, false);
export const apiLogin  = (payload)   => request('POST', '/api/auth/login',  payload, false);
export const apiGoogle = (payload)   => request('POST', '/api/auth/google', payload, false);
export const apiMe     = ()          => request('GET',  '/api/auth/me');

/* ── Habits ───────────────────────────────────────────────────────────────── */

export const apiGetHabits   = ()               => request('GET',  '/api/habits');
export const apiAddHabit    = (payload)        => request('POST', '/api/habits', payload);
export const apiToggleHabit = (id)             => request('POST', `/api/habits/${id}/toggle`);
export const apiDeleteHabit = (id)             => request('DELETE', `/api/habits/${id}`);

/** Calendar map: { days: { "YYYY-MM-DD": [habitId, ...] }, totalHabits: n } */
export const apiCalendar = (from, to) =>
  request('GET', `/api/habits/calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
