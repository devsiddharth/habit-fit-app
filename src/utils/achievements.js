// ─────────────────────────────────────────────────────────────────────────────
// achievements.js
// Every achievement starts LOCKED for every new user.
// They unlock automatically based on real data — no fake pre-unlocks.
// ─────────────────────────────────────────────────────────────────────────────

export const ACHIEVEMENT_DEFS = [
  { id: 'first_habit',   icon: '🌱', name: 'First Step',       desc: 'Add your first habit',           color: '#22d3a8' },
  { id: 'first_done',    icon: '✅', name: 'Done!',             desc: 'Complete a habit for the first time', color: '#818cf8' },
  { id: 'streak_3',      icon: '🔥', name: '3-Day Spark',       desc: 'Get a 3-day streak',             color: '#f97316' },
  { id: 'streak_7',      icon: '⚡', name: '7-Day Warrior',     desc: 'Get a 7-day streak',             color: '#E8B84B' },
  { id: 'streak_14',     icon: '🏆', name: 'Consistency King',  desc: '14-day streak',                  color: '#E8B84B' },
  { id: 'streak_30',     icon: '⭐', name: 'Unstoppable',       desc: '30-day streak',                  color: '#E8B84B' },
  { id: 'streak_50',     icon: '💎', name: 'Legend',            desc: '50-day streak',                  color: '#60a5fa' },
  { id: 'perfect_day',   icon: '🎯', name: 'Perfect Day',       desc: 'Complete ALL habits in one day', color: '#22d3a8' },
  { id: 'five_habits',   icon: '📋', name: 'Goal Setter',       desc: 'Add 5 habits',                   color: '#f472b6' },
  { id: 'ten_habits',    icon: '🗂️', name: 'Habit Master',      desc: 'Add 10 habits',                  color: '#f472b6' },
];

// Returns a Set of unlocked achievement IDs based on real user data
export const computeUnlocked = ({ habits, completionMap }) => {
  const unlocked = new Set();

  const allStreaks   = habits.map(h => h.streak);
  const maxStreak    = allStreaks.length ? Math.max(...allStreaks) : 0;
  const totalHabits  = habits.length;

  // Check all-done days
  let hasPerfectDay = false;
  Object.values(completionMap).forEach(ids => {
    if (habits.length > 0 && ids.length >= habits.length) hasPerfectDay = true;
  });

  const anyDone = Object.values(completionMap).some(ids => ids.length > 0);

  if (totalHabits >= 1)  unlocked.add('first_habit');
  if (anyDone)           unlocked.add('first_done');
  if (maxStreak >= 3)    unlocked.add('streak_3');
  if (maxStreak >= 7)    unlocked.add('streak_7');
  if (maxStreak >= 14)   unlocked.add('streak_14');
  if (maxStreak >= 30)   unlocked.add('streak_30');
  if (maxStreak >= 50)   unlocked.add('streak_50');
  if (hasPerfectDay)     unlocked.add('perfect_day');
  if (totalHabits >= 5)  unlocked.add('five_habits');
  if (totalHabits >= 10) unlocked.add('ten_habits');

  return unlocked;
};
