// ─────────────────────────────────────────────────────────────────────────────
// storage.js  —  All localStorage read/write helpers
//
// HOW IT WORKS (plain words):
//   localStorage is like a small notepad built into every browser.
//   You give it a "key" (a name) and a "value" (some text / JSON).
//   It stays saved even after you close the tab.
//
//   We prefix every key with the user's email so two different users
//   on the same computer never see each other's data.
//
//   Every new user starts with ZERO habits, ZERO streaks.
// ─────────────────────────────────────────────────────────────────────────────

const KEY_USER     = 'hf_user';
const KEY_ACCOUNTS = 'hf_accounts';
const habitsKey    = (email) => `hf_habits_${email}`;
const completions  = (email) => `hf_completions_${email}`;   // { "2025-06-01": [1,3] }

/* ── Session user ───────────────────────────────────────────────────────── */
export const saveSession  = (user) => localStorage.setItem(KEY_USER, JSON.stringify(user));
export const loadSession  = ()     => { try { return JSON.parse(localStorage.getItem(KEY_USER)); } catch { return null; } };
export const clearSession = ()     => localStorage.removeItem(KEY_USER);

/* ── Accounts (email/password) ──────────────────────────────────────────── */
export const loadAccounts = () => { try { return JSON.parse(localStorage.getItem(KEY_ACCOUNTS)) || []; } catch { return []; } };
export const saveAccounts = (arr) => localStorage.setItem(KEY_ACCOUNTS, JSON.stringify(arr));

/* ── Habits (fresh [] for every new user) ───────────────────────────────── */
export const loadHabits = (email) => {
  try { return JSON.parse(localStorage.getItem(habitsKey(email))) || []; }
  catch { return []; }
};
export const saveHabits = (email, habits) =>
  localStorage.setItem(habitsKey(email), JSON.stringify(habits));

/* ── Daily completions ──────────────────────────────────────────────────── */
// completionMap = { "YYYY-MM-DD": [habitId, habitId, ...] }
export const loadCompletions = (email) => {
  try { return JSON.parse(localStorage.getItem(completions(email))) || {}; }
  catch { return {}; }
};
export const saveCompletions = (email, map) =>
  localStorage.setItem(completions(email), JSON.stringify(map));

/* ── Today's date key ───────────────────────────────────────────────────── */
export const todayKey = () => new Date().toISOString().slice(0, 10); // "2025-06-01"
