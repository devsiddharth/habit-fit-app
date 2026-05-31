# Connecting React Frontend → Java Backend

## What changes when you switch from localStorage to the Java API

The only file you edit is `src/context/AuthContext.js` and `src/context/HabitContext.js`.
Replace the localStorage calls with fetch() calls to your Spring Boot API.

---

## Step 1 — Add .env variable

In your `.env` file add:
```
REACT_APP_API_URL=http://localhost:8080
```

---

## Step 2 — Replace AuthContext.js signIn / signUp

```js
const API = process.env.REACT_APP_API_URL;

// Sign up
const signUp = async ({ name, email, password }) => {
  const res  = await fetch(`${API}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  localStorage.setItem('hf_jwt', data.token);
  const u = { name: data.name, email: data.email, picture: data.picture, provider: data.provider };
  _persist(u);
  return u;
};

// Sign in
const signIn = async ({ email, password }) => {
  const res  = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  localStorage.setItem('hf_jwt', data.token);
  const u = { name: data.name, email: data.email, picture: data.picture, provider: data.provider };
  _persist(u);
  return u;
};

// Google
const signInWithGoogle = async ({ name, email, picture }) => {
  const res  = await fetch(`${API}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, picture })
  });
  const data = await res.json();
  localStorage.setItem('hf_jwt', data.token);
  const u = { name: data.name, email: data.email, picture: data.picture, provider: data.provider };
  _persist(u);
  return u;
};
```

---

## Step 3 — Replace HabitContext.js with API calls

```js
const API     = process.env.REACT_APP_API_URL;
const getJwt  = () => localStorage.getItem('hf_jwt');
const headers = () => ({
  'Content-Type':  'application/json',
  'Authorization': `Bearer ${getJwt()}`
});

// Load habits
useEffect(() => {
  if (!user) return;
  fetch(`${API}/api/habits`, { headers: headers() })
    .then(r => r.json())
    .then(setHabits);
}, [user]);

// Add habit
const addHabit = async (data) => {
  const res = await fetch(`${API}/api/habits`, {
    method: 'POST', headers: headers(), body: JSON.stringify(data)
  });
  const habit = await res.json();
  setHabits(prev => [...prev, habit]);
};

// Toggle
const toggleHabit = async (id) => {
  const res = await fetch(`${API}/api/habits/${id}/toggle`, {
    method: 'POST', headers: headers()
  });
  const updated = await res.json();
  setHabits(prev => prev.map(h => h.id === id ? updated : h));
};

// Calendar data
const fetchCalendar = async (from, to) => {
  const res = await fetch(`${API}/api/habits/calendar?from=${from}&to=${to}`, { headers: headers() });
  return res.json(); // { "2025-06-01": [1, 3], ... }
};
```

---

## API Endpoints Summary

| Method | URL                          | What it does                         |
|--------|------------------------------|--------------------------------------|
| POST   | /api/auth/signup             | Create account → returns JWT         |
| POST   | /api/auth/login              | Sign in → returns JWT                |
| POST   | /api/auth/google             | Google login → returns JWT           |
| GET    | /api/habits                  | Get all habits (today's done status) |
| POST   | /api/habits                  | Add new habit (streak=0)             |
| POST   | /api/habits/{id}/toggle      | Mark/unmark done today               |
| DELETE | /api/habits/{id}             | Soft-delete a habit                  |
| GET    | /api/habits/calendar?from&to | Calendar completion map              |
