# 🏋️ HABIT.FIT v2 — Daily Habit Tracker

> Hackathon Edition · Problem Statement 6 · Fresh start for every user

---

## ⚡ Run in 3 commands

```bash
cd habit-tracker-v2
npm install
npm start
```
Opens at → **http://localhost:3000**

---

## 📁 Project Structure

```
habit-tracker-v2/
├── public/
│   └── index.html                    ← The ONE HTML file (shell)
├── src/
│   ├── index.js                      ← Boots React into index.html
│   ├── App.jsx                       ← Routes + auth guard
│   ├── styles/global.css             ← ALL CSS in one file
│   ├── utils/
│   │   ├── storage.js                ← localStorage helpers
│   │   └── achievements.js           ← Achievement unlock logic
│   ├── context/
│   │   ├── AuthContext.js            ← Global: who is logged in
│   │   └── HabitContext.js           ← Global: habits + completions
│   ├── components/
│   │   ├── Sidebar.jsx               ← Desktop navigation
│   │   ├── AddHabitModal.jsx         ← Add habit form
│   │   ├── StreakRing.jsx            ← Animated SVG ring
│   │   ├── Confetti.jsx              ← Celebration particles
│   │   ├── Toast.jsx                 ← Notification popup
│   │   └── GoogleIcon.jsx            ← Google SVG logo
│   └── pages/
│       ├── LoginPage.jsx             ← Sign in
│       ├── SignupPage.jsx            ← Create account
│       ├── DashboardPage.jsx         ← Home dashboard
│       ├── StatisticsPage.jsx        ← Interactive calendar + stats
│       ├── InsightsPage.jsx          ← AI insights + achievements
│       └── ProfilePage.jsx           ← Profile + settings
├── backend/
│   ├── schema.sql                    ← Run in MySQL Workbench
│   ├── HabitTrackerAPI.java          ← Spring Boot backend code
│   └── HOW_TO_CONNECT_FRONTEND_TO_BACKEND.md
└── .env.example
```

---

## 🗄️ MySQL Setup

1. Open **MySQL Workbench**
2. Connect to your local server
3. Menu → **File → Open SQL Script** → select `backend/schema.sql`
4. Click the ⚡ **Execute All** button
5. Database `habitfit` is created with 3 tables: `users`, `habits`, `completions`

---

## 🔐 Google Sign-In Setup

1. Go to https://console.cloud.google.com
2. APIs & Services → Credentials → Create OAuth 2.0 Client ID
3. Authorised JS origins: `http://localhost:3000`
4. Copy the Client ID
5. Rename `.env.example` to `.env` and paste it in

---

## 🧠 HOW IT ALL WORKS — Plain English

### HTML — The Skeleton
HTML is like the bones of a webpage. Every element is a "tag":
- `<div>` = a box/container
- `<button>` = clickable button
- `<input>` = text field
- `<p>` = paragraph

In this app there is only ONE HTML file (`public/index.html`) with one line that matters:
```html
<div id="root"></div>
```
React fills this empty box with everything you see.

---

### CSS — The Appearance
CSS tells the browser how elements look: color, size, spacing, animations.
It works by "selecting" HTML elements and applying rules:
```css
.card {                          /* select anything with class="card" */
  background: #141820;           /* dark background */
  border-radius: 14px;           /* rounded corners */
  padding: 20px;                 /* inner spacing */
}
```
CSS Variables (`:root { --gold: #E8B84B }`) let you reuse colors everywhere.
`@keyframes` defines animations — the streak ring, confetti, fade-up cards.
`@media` makes it responsive — different layouts for mobile vs desktop.

---

### React — The Brain
React is JavaScript that builds HTML dynamically. Instead of writing HTML by hand,
you write **components** — functions that return HTML-like code (called JSX):

```jsx
function HabitRow({ habit }) {
  return (
    <div className="habit-row">     ← this becomes <div class="habit-row">
      <span>{habit.icon}</span>     ← {} means "insert JavaScript value here"
      <span>{habit.name}</span>
    </div>
  );
}
```

**useState** = memory inside a component. When it changes, the UI re-renders:
```js
const [habits, setHabits] = useState([]);   // habits starts as empty array
setHabits([...habits, newHabit]);           // update → component re-renders
```

**useEffect** = "run this code when something changes":
```js
useEffect(() => {
  loadHabitsFromStorage();   // runs when user logs in
}, [user]);                  // dependency: re-runs when 'user' changes
```

**Context** = global state shared across all components (no need to pass props down).
`AuthContext` holds who is logged in. `HabitContext` holds the habits list.
Any component can read from them with `useAuth()` or `useHabits()`.

---

### How a method gets called — Step by step

**Example: User clicks "Add Habit"**

1. User taps the **Add Habit** button in `DashboardPage.jsx`
2. `onClick={onAddHabit}` fires → sets `showModal = true` in `App.jsx`
3. `App.jsx` renders `<AddHabitModal />` because `showModal` is now true
4. User fills in the form, clicks **Save Habit**
5. `submit()` function runs inside `AddHabitModal.jsx`
6. It calls `addHabit(data)` from `HabitContext`
7. `addHabit` creates a new object with `streak: 0, completion: 0`
8. Calls `setHabits(prev => [...prev, habit])` — React re-renders
9. `useEffect` detects habits changed → saves to localStorage
10. Dashboard re-renders showing the new habit in the list

**Example: User toggles a habit done**

1. User taps a habit row
2. `onClick={() => handleToggle(h.id)}` fires
3. `handleToggle` triggers confetti if marking done
4. Calls `toggleHabit(id)` from `HabitContext`
5. `setHabits` updates the habit's `done` and `streak` values
6. `setCompletionMap` adds today's date → habit ID to the map
7. Both `useEffect`s save changes to localStorage
8. `StatisticsPage` calendar automatically reflects new data next visit

---

## 🚀 What every new user gets

- ✅ Zero habits (completely fresh start)
- ✅ Zero streaks
- ✅ Zero achievements (all locked)
- ✅ Their real name displayed everywhere after signup
- ✅ Their own private data (keyed by email in localStorage)
- ✅ Interactive calendar starts empty — fills as they track

---

## 🔮 Next: Java Backend

Run the Java Spring Boot app alongside React.
All data moves from localStorage → MySQL.
See `backend/HOW_TO_CONNECT_FRONTEND_TO_BACKEND.md`
