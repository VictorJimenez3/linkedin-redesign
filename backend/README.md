# Nexus Backend

Flask + SQLite REST API powering the Nexus professional-network SPA.
Implements **User Story #1** (Outreach Message Guidance) and **User Story #7** (Outreach Readiness Check).

---

## Dependencies

| Library | Version | Purpose |
|---|---|---|
| `flask` | ≥ 3.0 | HTTP server, routing, JSON responses |
| `flask-cors` | ≥ 4.0 | Cross-Origin Resource Sharing (frontend on file:// or different port) |
| Python stdlib | 3.10+ | `sqlite3`, `hashlib`, `secrets`, `json`, `re`, `time`, `os` |

No other external libraries are required. No paid external services are called in P4 — the outreach module uses a template-based mock (see `outreach.py`). In P5 the mock can be swapped for an AWS Bedrock call by replacing the body of `_call_ai()` in `outreach.py`.

---

## Database

The backend uses a single **SQLite** database file at `backend/nexus.db`.

### Tables

| Table | Description |
|---|---|
| `users` | All user accounts — seeded from `data/users.py` on startup; new accounts appended via `/api/auth/register` |
| `posts` | Feed posts — seeded once from `data/posts.py`; new posts appended via `POST /api/feed` |
| `jobs` | Job listings — re-seeded on every startup from `data/jobs.py` |
| `companies` | Company records — re-seeded on every startup from `data/companies.py` |
| `conversations` | Message thread metadata — seeded once from `data/conversations.py` |
| `messages` | Individual chat messages — seeded once; new messages appended via `POST /api/conversations/:id/messages` |
| `notifications` | Activity notifications — seeded once from `data/notifications.py`; read-state mutated via PATCH |
| `sessions` | Auth session tokens — written on login/register; read to identify current user |

**WAL mode** is enabled (`PRAGMA journal_mode=WAL`) so multiple concurrent readers never block each other — supports the required 10 simultaneous frontend users.

---

## Install

```bash
# From the repo root
pip install flask flask-cors
```

Python 3.10 or later is required (uses `str.removeprefix`).

---

## Start

```bash
# From the repo root
python backend/app.py
```

The server starts on **http://localhost:5000** with threading enabled (handles 10+ simultaneous requests).

Output:
```
Starting Nexus Backend on http://localhost:5000
App:  http://localhost:5000/
API:  http://localhost:5000/api/
```

Open `index.html` in a browser to reach the login/signup page, or `app.html` directly if you already have a session token stored.

---

## Stop

Press `Ctrl-C` in the terminal running `app.py`.

---

## Reset (wipe all data and re-seed)

```bash
rm backend/nexus.db
python backend/app.py   # re-creates and re-seeds the database on startup
```

This resets all posts, messages, notifications, sessions, and user accounts (including any registered test users) back to the seed data.

---

## API Overview

All routes are prefixed with `/api`.

### Auth
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account — body: `{name, email, password}` → `{user, token}` |
| `POST` | `/api/auth/login` | Sign in — body: `{email, password}` → `{user, token}` |

Authenticated requests must include `Authorization: Bearer <token>` header. Unauthenticated requests fall back to the demo user (id=1).

### Users / Profile
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/me` | Current user profile |
| `PUT/PATCH` | `/api/me` | Update profile fields (`name`, `headline`, `location`, `about`, `pronouns`, `industry`) |
| `GET` | `/api/users` | All users except current user |
| `GET` | `/api/users/:id` | Single user by id |
| `DELETE` | `/api/users/:id` | Delete user (cannot delete id=1) |

### Feed
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/feed` | All posts, newest first |
| `POST` | `/api/feed` | Create post — body: `{content}` |

### Jobs & Companies
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/jobs` | All job listings |
| `GET` | `/api/jobs/:id` | Single job |
| `GET` | `/api/companies/:id` | Company detail |

### Messaging
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/conversations` | All conversation summaries |
| `GET` | `/api/conversations/:id` | Full conversation with messages |
| `POST` | `/api/conversations/:id/messages` | Send message — body: `{text}` |

### Notifications
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/notifications` | All notifications |
| `PATCH` | `/api/notifications/:id/read` | Mark one as read |
| `PATCH` | `/api/notifications/read-all` | Mark all as read |

### User Story #1 — Outreach Message Guidance
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/outreach/generate` | Generate personalised outreach draft. Body: `{recipientId, tone?, goal?, custom_note?, details?}` → `{draft, char_count, tone, tips, alternatives}` |

`tone` ∈ `{professional, friendly, formal}` (default: `professional`)
`goal` ∈ `{job_inquiry, networking, advice, collaboration}` (default: `networking`)
`details` object keys: `recipient`, `yourRole`, `field`, `company`, `role`, `context`

### User Story #7 — Outreach Readiness Check
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/outreach/readiness` | Profile readiness for current user |
| `GET` | `/api/outreach/readiness?userId=<id>` | Profile readiness for any user |

Returns `{score, max_score, level, can_message, breakdown, top_tips}`.
`level` ∈ `{ready, almost_ready, not_ready}`
`can_message` is `true` when `score >= 60`.

### Misc (read-only reference data)
`GET /api/events`, `/api/groups`, `/api/groups/:id`, `/api/courses`, `/api/news`, `/api/invitations`, `/api/hashtags`, `/api/search?q=`

---

## Running Tests

The backend must be running before executing tests.

```bash
# Terminal 1 — start backend
python backend/app.py

# Terminal 2 — run tests
python backend/test_api.py
```

Tests use only Python stdlib (`urllib`, `json`) — no pytest or requests needed.

### Test coverage
- All GET/POST/PATCH endpoints
- User Story #1 — T1.1–T1.6 (outreach generate)
- User Story #7 — T7.1–T7.7 (outreach readiness)
- Auth — register, login, token-authenticated requests
- Account CRUD — create, find, delete
- Input validation and security edge cases (XSS, SQL injection strings, control characters)
- Persistence — data survives across multiple requests
