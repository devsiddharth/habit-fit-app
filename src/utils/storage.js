// ─────────────────────────────────────────────────────────────────────────────
// storage.js — the only browser-storage keys the app uses now.
//
// Since the Java backend owns ALL data (users, habits, completions in MySQL),
// the browser keeps just: the JWT and lightweight UI preferences.
// ─────────────────────────────────────────────────────────────────────────────

const KEY_TOKEN     = 'hf_jwt';
const KEY_SETTINGS  = 'hf_settings';

/* ── JWT (single source of truth for the session) ─────────────────────────── */
// Delegates to api.js so there is exactly one writer of this key.
export { getToken as getSession, setToken as saveSession, clearToken as clearSession } from './api';

/* ── UI settings (local-only preference, not synced) ──────────────────────── */
export const loadSettings = () => {
  try { return JSON.parse(localStorage.getItem(KEY_SETTINGS)) || {}; }
  catch { return {}; }
};

export const saveSettings = (s) => localStorage.setItem(KEY_SETTINGS, JSON.stringify(s));
