import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiGetHabits, apiAddHabit, apiToggleHabit, apiDeleteHabit, apiCalendar, ApiError } from '../utils/api';

const Ctx = createContext(null);

const normalize = (h) => ({
  id: h.id,
  name: h.name,
  goal: h.goal || 'Daily',
  icon: h.icon || '🎯',
  color: h.color || '#22d3a8',
  colorDim: h.colorDim || 'rgba(34,211,168,0.12)',
  streak: h.streak ?? 0,
  completion: h.completion ?? 0,
  done: !!h.done,
  createdAt: h.createdAt,
});

/**
 * Global habit state, sourced from the Java backend (MySQL).
 * completionMap = { "YYYY-MM-DD": [habitId, ...] } — powers the calendar,
 * stats, and achievements exactly as before, but now persisted server-side.
 */
export function HabitProvider({ children }) {
  const { user } = useAuth();
  const [habits,        setHabits]        = useState([]);
  const [completionMap, setCompletionMap] = useState({});
  const [error,         setError]         = useState('');
  const [loading,       setLoading]       = useState(false);

  const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // ── Load from API when user logs in ────────────────────────────────────────
  useEffect(() => {
    if (!user) { setHabits([]); setCompletionMap({}); return; }

    let cancelled = false;
    setLoading(true);
    setError('');

    (async () => {
      try {
        const [habitList, cal] = await Promise.all([apiGetHabits(), fetchCalendar()]);
        if (cancelled) return;
        setHabits(habitList.map(normalize));

        const map = {};
        Object.entries(cal.days || {}).forEach(([day, ids]) => { map[day] = ids; });
        setCompletionMap(map);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load habits.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user?.email]);

  // ── Calendar fetch (last ~13 months so past months are navigable) ──────────
  const fetchCalendar = useCallback(async () => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 12, 1);
    const to   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return apiCalendar(fmt(from), fmt(to));
  }, []);

  // ── Commands (each returns the fresh server state) ─────────────────────────
  const addHabit = useCallback(async (data) => {
    const created = await apiAddHabit(data);
    setHabits(prev => [...prev, normalize(created)]);
    return created;
  }, []);

  const toggleHabit = useCallback(async (id) => {
    // Optimistic flip for snappy UI; server response overrides it.
    let nowDone = false;
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      nowDone = !h.done;
      return { ...h, done: nowDone };
    }));

    try {
      const updated = await apiToggleHabit(id);
      setHabits(prev => prev.map(h => (h.id === id ? { ...h, streak: updated.streak, completion: updated.completion, done: updated.done } : h)));
    } catch (err) {
      // Revert on failure
      setHabits(prev => prev.map(h => (h.id === id ? { ...h, done: !nowDone } : h)));
      setError(err.message || 'Toggle failed.');
      throw err;
    }

    // Refresh the calendar map (today's bucket changed; streaks may shift)
    try {
      const cal = await fetchCalendar();
      const map = {};
      Object.entries(cal.days || {}).forEach(([day, ids]) => { map[day] = ids; });
      setCompletionMap(map);
    } catch { /* non-fatal */ }
  }, [fetchCalendar]);

  const deleteHabit = useCallback(async (id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    try {
      await apiDeleteHabit(id);
      const cal = await fetchCalendar();
      const map = {};
      Object.entries(cal.days || {}).forEach(([day, ids]) => { map[day] = ids; });
      setCompletionMap(map);
    } catch (err) {
      setError(err.message || 'Delete failed.');
      throw err;
    }
  }, [fetchCalendar]);

  // ── Computed values (same shape as before) ─────────────────────────────────
  const todayDone  = habits.filter(h => h.done).length;
  const todayTotal = habits.length;
  const todayPct   = todayTotal ? Math.round((todayDone / todayTotal) * 100) : 0;
  const bestStreak = habits.length ? Math.max(...habits.map(h => h.streak)) : 0;

  return (
    <Ctx.Provider value={{
      habits, completionMap, loading, error,
      addHabit, toggleHabit, deleteHabit,
      todayDone, todayTotal, todayPct, bestStreak,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useHabits = () => useContext(Ctx);
