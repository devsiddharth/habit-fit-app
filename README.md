# 🏋️ HABIT.FIT — Daily Habit Tracker (Full Stack)

React JS frontend · **Java 21 + Spring Boot 4** backend · MySQL 8 · JWT security · Docker

> Every new user starts from zero — zero habits, zero streaks, zero achievements.
> All data now lives in **MySQL**, owned by a real **Java Spring Boot REST API** — not localStorage.

---

## ⚡ Quick Start (3 terminals)

### 1. Start MySQL (Docker)

```bash
docker compose up -d db
```
MySQL 8.4 on **localhost:3308** (user `habitfit` / password `habitfit`, database `habitfit`).
Tables are created automatically by Hibernate on first backend start.

### 2. Start the Java backend

```bash
cd backend
MYSQL_PORT=3308 ./mvnw spring-boot:run        # Windows Git Bash / macOS / Linux
# Windows PowerShell:  $env:MYSQL_PORT=3308; ./mvnw spring-boot:run
```
API on **http://localhost:8091** (8080/8090 are avoided because other Docker projects often use them).

### 3. Start React

```bash
npm install
npm start
```
App on **http://localhost:3000** (CRA auto-opens it).

### One-liner alternative (everything in Docker)

```bash
docker compose up -d --build
# backend on http://localhost:8091 — frontend still runs via npm start
```

Optional database UI:
```bash
docker compose --profile tools up -d phpmyadmin   # → http://localhost:8085 (server: db, user: root, pass: rootpass)
```

---

## 🧱 Tech Stack — mapped to the resume

| Resume skill | Where it lives in this repo |
|---|---|
| **Java / Modern Java** | Java 21, Streams API (`toList()`), `var`-friendly records, `LocalDate/LocalDateTime`, text blocks, Lombok — `backend/src/main/java/com/habitfit/**` |
| **Java core / OOP** | Layered architecture: `entity → repository → service → controller`, interfaces, builders, encapsulation |
| **Spring Boot** | `HabitfitBackendApplication`, `application.properties`, spring-boot-maven-plugin |
| **Spring Security + JWT** | `SecurityConfig` (stateless filter chain, BCrypt), `JwtUtil` (jjwt), `JwtAuthFilter` |
| **REST APIs** | `AuthController`, `HabitController` — JSON in/out, proper status codes (201/204/401/404/409) |
| **JPA / Hibernate** | `User`, `Habit`, `Completion` entities, relationships, indexes, unique constraints |
| **Spring Data** | `UserRepository`, `HabitRepository`, `CompletionRepository` with derived + `@Query` methods |
| **MySQL / SQL** | Dockerized MySQL 8.4, utf8mb4 (emoji-safe), foreign keys, indexes |
| **Maven** | `backend/pom.xml`, `mvnw` wrapper, multi-stage Dockerfile build |
| **Docker** | `docker-compose.yml` (MySQL + backend + phpMyAdmin), `backend/Dockerfile` |
| **React JS** | `src/` — hooks (`useState/useEffect/useMemo/useCallback/useContext`), Context API, React Router |
| **JavaScript / HTML5 / CSS3** | `src/utils/api.js` (fetch + JWT), `public/index.html`, `src/styles/global.css` (variables, keyframes, media queries) |
| **JWT (frontend)** | Token persisted in `localStorage`, auto-attached, session restore via `/api/auth/me` |

---

## 📡 API Endpoints

| Method | URL | Auth | What it does |
|--------|-----|------|--------------|
| POST | `/api/auth/signup` | — | Create account → `{ token, name, email, ... }` |
| POST | `/api/auth/login` | — | Sign in → JWT |
| POST | `/api/auth/google` | — | Google profile upsert → JWT |
| GET | `/api/auth/me` | JWT | Session restore (who am I) |
| GET | `/api/habits` | JWT | All active habits + today's `done` flag |
| POST | `/api/habits` | JWT | Add habit (streak=0, completion=0) |
| POST | `/api/habits/{id}/toggle` | JWT | Mark/unmark done today; streak & % recomputed server-side |
| DELETE | `/api/habits/{id}` | JWT | Soft delete (history kept) |
| GET | `/api/habits/calendar?from&to` | JWT | `{ days: { "YYYY-MM-DD": [habitId...] }, totalHabits }` |

**Try it with curl:**
```bash
# signup
curl -X POST http://localhost:8091/api/auth/signup -H "Content-Type: application/json" \
  -d '{"name":"Sid","email":"sid@example.com","password":"secret123"}'

# add a habit (use the token from above)
curl -X POST http://localhost:8091/api/habits -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" -d '{"name":"Morning Run","goal":"30 mins","icon":"🏃","color":"#22d3a8"}'
```

---

## 📁 Project Structure

```
habit-fit-app/
├── public/index.html                 ← single HTML shell
├── src/
│   ├── index.js                      ← boots React (+ optional Google provider)
│   ├── App.jsx                       ← routes + auth guard
│   ├── styles/global.css             ← all styling (CSS variables, animations)
│   ├── utils/
│   │   ├── api.js                    ← fetch wrapper: JWT header + typed errors
│   │   ├── storage.js                ← localStorage: token + UI settings only
│   │   └── achievements.js           ← achievement unlock logic (from real data)
│   ├── context/
│   │   ├── AuthContext.js            ← signup/login/google/me → JWT session
│   │   └── HabitContext.js           ← habits + completionMap from the API
│   ├── components/                   ← Sidebar, AddHabitModal, StreakRing, Confetti, Toast, GoogleIcon
│   └── pages/                        ← Login, Signup, Dashboard, Statistics, Insights, Profile
├── backend/                          ← JAVA SPRING BOOT (Maven project)
│   ├── pom.xml                       ← Spring Boot 4.1.1, Java 21, jjwt, MySQL driver
│   ├── Dockerfile                    ← multi-stage Maven build → slim JRE image
│   └── src/main/java/com/habitfit/
│       ├── entity/                   ← User, Habit, Completion (JPA)
│       ├── repository/               ← Spring Data interfaces
│       ├── service/                  ← AuthService, HabitService (streak math lives here)
│       ├── controller/               ← REST endpoints
│       ├── security/                 ← JwtUtil, JwtAuthFilter
│       ├── config/                   ← SecurityConfig, GlobalExceptionHandler
│       └── dto/                      ← request/response payloads (bean validation)
├── docker-compose.yml                ← MySQL + backend (+ phpMyAdmin)
└── .env.example                      ← REACT_APP_API_URL, REACT_APP_GOOGLE_CLIENT_ID
```

---

## 🌐 Deployment (GitHub Pages)

The live site is the **static React frontend** hosted on GitHub Pages:

> **https://devsiddharth.github.io/habit-fit-app/**

> ⚠️ **Important:** GitHub Pages serves static files only — the Java Spring Boot backend and
> MySQL **cannot run there**. The Pages site is a demo/frontend preview: signup and login will
> only work while you also run the backend locally (`docker compose up -d db` + `./mvnw
> spring-boot:run`) and CORS is limited to `localhost:3000`. For a public full-stack deploy,
> host the backend on a service like Render/Fly.io with a managed MySQL and point
> `REACT_APP_API_URL` at it.

Deploy or update the site with:

```bash
npm run deploy        # builds the frontend and pushes ./build to the gh-pages branch
```

This works because:
- `homepage` in `package.json` is set to `.` so all asset URLs resolve under `/habit-fit-app/`
- routing uses `HashRouter`, which needs no server-side rewrites on Pages

One-time repo setting: **Settings → Pages → Source: Deploy from a branch → branch `gh-pages` / root**.

---

## 🔐 Google Sign-In (optional)

The app works fully without it. To enable:

1. https://console.cloud.google.com → APIs & Services → Credentials → **OAuth 2.0 Client ID**
2. Authorised JavaScript origin: `http://localhost:3000`
3. Put the client ID in `.env`: `REACT_APP_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com`
4. Restart `npm start` — the "Continue with Google" buttons appear.
5. Backend receives the verified profile (`/api/auth/google`), upserts the user, issues your app's JWT.

> Production note: for real deployments, send the Google **ID token** to the backend and verify it
> with Google's public keys server-side, rather than trusting profile fields.

---

## 🧠 How a toggle works now (end to end)

1. Click a habit row in `DashboardPage` → `handleToggle(id)`
2. `HabitContext.toggleHabit` flips `done` optimistically for instant UI
3. `POST /api/habits/{id}/toggle` with `Authorization: Bearer <jwt>`
4. `JwtAuthFilter` validates the token → `HabitController` resolves the user from MySQL
5. `HabitService.toggle`: insert/delete a `completions` row (unique per habit+day), then **recompute
   streak** (consecutive days ending today/yesterday) and **completion %** from real history
6. Response replaces the optimistic state; the calendar map refreshes
7. Statistics page, insights, and achievements all derive from the same server data — on any device

---

## 🧪 E2E browser test

A headless-Chrome smoke test drives the real user journey (signup → add habit → toggle →
reload persistence → statistics → insights → sign out → re-login) and takes screenshots:

```bash
# 1) MySQL up                        2) backend on :8091                3) frontend on :3001
docker compose up -d db              cd backend && ./mvnw spring-boot:run   PORT=3001 BROWSER=none npm start

# 4) run the test (uses local Chrome via puppeteer-core)
node e2e/browser-test.mjs            # PASS/FAIL summary + screenshots in e2e/shots/
```

---

## 🚀 What every new user gets

- ✅ Zero habits, zero streaks, zero achievements — all achievements start locked
- ✅ Fresh data everywhere (account is a MySQL row, not a localStorage bucket)
- ✅ Their real name on the dashboard; BCrypt-hashed password; stateless JWT
- ✅ Same account works from any browser — no more device-locked data
