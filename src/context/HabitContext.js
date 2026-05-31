import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  loadHabits, saveHabits,
  loadCompletions, saveCompletions,
  todayKey
} from '../utils/storage';

const Ctx = createContext(null);

export function HabitProvider({ children }) {
  const { user } = useAuth();
  const [habits,        setHabits]        = useState([]);  // always [] for new users
  const [completionMap, setCompletionMap] = useState({});  // { "YYYY-MM-DD": [id,id] }

  // ── Load from storage when user changes ──────────────────────────────────
  useEffect(() => {
    if (!user) { setHabits([]); setCompletionMap({}); return; }
    const h = loadHabits(user.email);         // returns [] for new users
    const c = loadCompletions(user.email);    // returns {} for new users
    // Sync today's done flags onto habit objects
    const today = todayKey();
    const todayIds = new Set(c[today] || []);
    setHabits(h.map(habit => ({ ...habit, done: todayIds.has(habit.id) })));
    setCompletionMap(c);
  }, [user]);

  // ── Persist whenever habits or completions change ─────────────────────────
  useEffect(() => {
    if (!user) return;
    saveHabits(user.email, habits);
  }, [habits, user]);

  useEffect(() => {
    if (!user) return;
    saveCompletions(user.email, completionMap);
  }, [completionMap, user]);

  // ── Add habit — starts with streak=0, completion=0 ───────────────────────
  const addHabit = useCallback((data) => {
    const habit = {
      id:         Date.now(),
      name:       data.name,
      goal:       data.goal || 'Daily',
      icon:       data.icon || '🎯',
      color:      data.color || '#22d3a8',
      colorDim:   data.colorDim || 'rgba(34,211,168,0.12)',
      streak:     0,      // ← always 0 for a brand-new habit
      completion: 0,      // ← always 0
      done:       false,
      createdAt:  todayKey(),
    };
    setHabits(prev => [...prev, habit]);
    return habit;
  }, []);

  // ── Toggle daily completion ───────────────────────────────────────────────
  const toggleHabit = useCallback((id) => {
    const today = todayKey();

    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const nowDone = !h.done;

      // Recalculate streak:
      // If marking done   → streak + 1
      // If un-marking     → streak - 1 (min 0)
      const newStreak = nowDone
        ? h.streak + 1
        : Math.max(0, h.streak - 1);

      // Recalculate completion % based on completionMap history
      return { ...h, done: nowDone, streak: newStreak };
    }));

    // Update completionMap for today
    setCompletionMap(prev => {
      const existing = [...(prev[today] || [])];
      const habit    = habits.find(h => h.id === id);
      if (!habit) return prev;
      const nowDone  = !habit.done;
      const updated  = nowDone
        ? [...new Set([...existing, id])]
        : existing.filter(x => x !== id);
      return { ...prev, [today]: updated };
    });
  }, [habits]);

  // ── Delete habit ──────────────────────────────────────────────────────────
  const deleteHabit = useCallback((id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    // Also remove from all completions
    setCompletionMap(prev => {
      const copy = { ...prev };
      Object.keys(copy).forEach(date => {
        copy[date] = copy[date].filter(x => x !== id);
      });
      return copy;
    });
  }, []);

  // ── Computed values ───────────────────────────────────────────────────────
  const todayDone    = habits.filter(h => h.done).length;
  const todayTotal   = habits.length;
  const todayPct     = todayTotal ? Math.round((todayDone / todayTotal) * 100) : 0;
  const bestStreak   = habits.length ? Math.max(...habits.map(h => h.streak)) : 0;

  return (
    <Ctx.Provider value={{
      habits, completionMap,
      addHabit, toggleHabit, deleteHabit,
      todayDone, todayTotal, todayPct, bestStreak,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useHabits = () => useContext(Ctx);
