# Nexus — LinkedIn Redesign
**CS485 AI-Assisted Software Engineering — Spring 2026**
Team: Krishi Shah, Dhyani Shah, Saanvi Elaty, Victor Jimenez 

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

See the **Testing** section below for full instructions on running frontend and backend unit tests locally.

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



---

## Testing

### Frontend Unit Tests

**Framework:** Jest + React Testing Library (jsdom)

**Files under test:**
- `js/components/pages/FeedPage.js` — 61 tests
- `js/components/pages/MessagingPage.js`

**Test files:**
- `tests/tests/test-files/FeedPage.test.js`
- `tests/tests/test-files/MessagingPage.test.js`

#### Prerequisites

- **Node.js** v18 or higher — https://nodejs.org
- **npm** (comes bundled with Node.js)

No running backend required — all API calls are mocked.

#### Install dependencies

From the repo root:

```bash
npm install
```

This installs:
- `jest` — test runner and assertion framework
- `@testing-library/react` — renders React components in jsdom
- `@testing-library/jest-dom` — matchers like `toBeInTheDocument()`
- `babel-jest`, `@babel/preset-env`, `@babel/preset-react` — JSX transformation
- `jest-environment-jsdom` — browser-like environment for Node

#### Run all frontend tests

```bash
npm test
```

#### Run a specific test file

```bash
npx jest FeedPage
npx jest MessagingPage
```

#### Run with coverage report

```bash
npm run test:coverage
```

Coverage report prints to the terminal. An HTML version is saved to `coverage/lcov-report/index.html`.

---

### Backend Unit Tests

**Framework:** pytest

**Files under test:**
- `backend/database.py` — 86 tests
- `backend/app.py` — 83 tests

**Test files:**
- `tests/tests/test-files/test_database.py`
- `tests/tests/test-files/test_app.py`

**Test specs:**
- `tests/tests/test-specifications/test_spec_database.md`
- `tests/tests/test-specifications/test_spec_app.md`

#### Prerequisites

- **Python 3.10+**
- **pip**

No running backend required — `test_database.py` uses an in-memory SQLite DB and `test_app.py` mocks all database/outreach calls via `monkeypatch`.

#### Install dependencies

```bash
pip3 install -r backend/requirements.txt
pip3 install pytest pytest-cov
```

#### Run database tests

```bash
cd backend
pytest tests/test_database.py -v
```

#### Run app/route tests

```bash
cd backend
pytest tests/test_app.py -v
```

#### Run with coverage report

```bash
cd backend
pytest tests/test_database.py --cov=database --cov-report=term-missing
pytest tests/test_app.py --cov=app --cov-report=term-missing
```
