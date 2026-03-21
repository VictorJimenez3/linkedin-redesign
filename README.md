# Nexus — LinkedIn Redesign
**CS485 AI-Assisted Software Engineering — Spring 2026**
Team: Krishi Shah, Dhyani Shah

A LinkedIn-style professional networking SPA built with vanilla JavaScript + React (CDN), backed by a Flask + SQLite REST API.

---

## Running the App

### 1. Install dependencies

```bash
pip install -r backend/requirements.txt
```

Python 3.10+ required.

### 2. Start the backend

```bash
python backend/app.py
```

### 3. Open the app

Visit **http://localhost:5000** in your browser.

- **Login:** `alex.johnson@gmail.com` / `password123`
- Or click **Join now** to register a new account

---

## Running the Tests

The backend must be running first.

```bash
# Unit + user story tests (89 tests)
python backend/test_api.py

# Frontend API contract tests
python backend/test_frontend_contract.py
```

---

## Resetting the Database

```bash
rm backend/nexus.db
python backend/app.py
```

---

## User Stories Implemented

| Story | Description | Endpoint |
|-------|-------------|----------|
| #1 — Outreach Message Guidance | Generate a personalized outreach message draft for a recipient | `POST /api/outreach/generate` |
| #2 — Outreach Readiness Check | Score your profile completeness before messaging someone | `GET /api/outreach/readiness` |

To use Story #1: go to **Messaging**, select a conversation, click **Outreach Guide**.
To use Story #2: go to **Messaging** and click **Readiness Score**, or view your **Profile**.

---

## Project Structure

```
backend/
  app.py          — Flask routes (API Gateway)
  outreach.py     — Outreach message + readiness logic (Stories #1 & #2)
  database.py     — SQLite persistence layer
  test_api.py     — Backend unit + user story tests
  test_frontend_contract.py — API contract tests
  requirements.txt
  README.md       — Full backend API reference

js/
  api.js          — All frontend API calls (window.API)
  components/     — React components (pages, modals, nav)

index.html        — Login / signup page
app.html          — Main SPA shell
css/style.css     — Stylesheet
```

---

## Backend API (Summary)

Full reference in [backend/README.md](backend/README.md).

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/me` | Current user |
| GET | `/api/feed` | Posts feed |
| POST | `/api/feed` | Create post |
| GET | `/api/jobs` | Job listings |
| GET | `/api/conversations` | Message threads |
| POST | `/api/conversations/:id/messages` | Send message |
| POST | `/api/outreach/generate` | **Story #1** — generate outreach draft |
| GET | `/api/outreach/readiness` | **Story #2** — profile readiness score |
