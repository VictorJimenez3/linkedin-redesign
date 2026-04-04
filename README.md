# Nexus — LinkedIn Redesign
**CS485 AI-Assisted Software Engineering — Spring 2026**
Team: Krishi Shah, Dhyani Shah

A LinkedIn-style professional networking SPA built with vanilla JavaScript + React (CDN), backed by a Flask + SQLite REST API.

---

## Running the App

### 1. Install dependencies

```bash
pip3 install -r backend/requirements.txt
```

> On macOS with Homebrew Python you may need: `pip3 install --break-system-packages -r backend/requirements.txt`

Python 3.10+ required. Dependencies: `flask>=3.0`, `flask-cors>=4.0`.

### 2. Start the backend

```bash
python3 backend/app.py
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
python3 backend/test_api.py

# Frontend API contract tests
python3 backend/test_frontend_contract.py
```

---

## Resetting the Database

```bash
rm backend/nexus.db
python3 backend/app.py
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



# Testing — P5 

# Running Frontend Tests — MessagingPage.js

## Prerequisites

Make sure you have the following installed before running the tests:

- **Node.js** v18 or higher — https://nodejs.org
- **npm** (comes bundled with Node.js)

## Install Dependencies

From the root of the frontend directory, run:

```bash
npm install
```

This will install all required packages, including:

- `jest` — the test runner and assertion framework
- `@testing-library/react` — renders React components in a simulated browser environment
- `@testing-library/jest-dom` — adds custom matchers like `toBeInTheDocument()`
- `babel-jest` + React/JSX preset — allows Jest to parse JSX syntax

If any of these are missing, install them manually:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom babel-jest @babel/preset-env @babel/preset-react
```

## Running the Tests

To run the full test suite once and see results in the terminal:

```bash
npx jest --watchAll=false
```

To run tests and generate a code coverage report:

```bash
npx jest --coverage --watchAll=false
```

The coverage report will print to the terminal and also be saved to the `coverage/` folder as an HTML report you can open in a browser:

```bash
open coverage/lcov-report/index.html
```

## Test File Location

```
tests/MessagingPage_test.js
```

## What Is Being Tested

This test file covers `js/components/pages/MessagingPage.js`, including:

- Conversation loading and auto-selection
- Sending messages (optimistic updates, trimming, error handling)
- Profile Readiness panel (loading states, API success/failure, refresh)
- Outreach Guide panel (goal selection, step navigation, variant cycling, message insertion)
- Pure functions: `computeGuidePreview` and `mockBackendGetProfileReadiness`
