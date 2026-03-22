# Nexus — Test & Database Report

**Date:** March 10, 2026  
**Scope:** Database structure, backend API tests, frontend API contract tests. No frontend code was changed.

---

## 1. Database Structure (Dev Spec Aligned)

### 1.1 Schema Overview

All mutable data is stored in SQLite (`backend/nexus.db`) with:

- **Primary keys** on every main table (`id INTEGER PRIMARY KEY`).
- **Foreign keys** with appropriate cascades so posts and related records are tied to account records; nothing is hardcoded in the data layer.

| Table            | Primary Key | Key Relationships |
|------------------|-------------|--------------------|
| `users`          | `id`        | —                  |
| `posts`          | `id`        | `author_id` → `users(id)` ON DELETE CASCADE |
| `conversations`  | `id`        | `participant_id` → `users(id)` ON DELETE CASCADE |
| `messages`       | `id`        | `conversation_id` → `conversations(id)`, `sender_id` → `users(id)` |
| `notifications`  | `id`        | —                  |
| `jobs`           | `id`        | —                  |
| `companies`      | `id`        | —                  |

### 1.2 Posts and Account Records

- **Posts are stored with account records:** each row in `posts` has `author_id NOT NULL REFERENCES users(id) ON DELETE CASCADE`.
- Seed data is loaded from `backend/data/*.py` (e.g. `data/posts.py`, `data/users.py`); no post or user content is hardcoded in `database.py`.
- Feed is built by joining `posts` with `users` so every post has a resolvable author (name, headline) from the DB.

### 1.3 Changes Made in This Pass

- **`backend/database.py`:** `posts.author_id` defined as `NOT NULL` so every post must reference a user.
- **`backend/app.py`:** Removed hardcoded `sender_id=1` in `POST /api/conversations/:id/messages`; sender is now taken from `get_current_user()` so the message is tied to the current account.

---

## 2. Backend Test Suite (`backend/test_api.py`)

Run with the backend on `http://localhost:5000`:

```bash
python3 backend/app.py   # in one terminal
python3 backend/test_api.py
```

### 2.1 Test Categories

| Section | Description |
|--------|-------------|
| **Existing GET endpoints** | `/me`, `/users`, `/users/:id`, `/feed`, `/jobs`, `/jobs/:id`, `/companies/:id`, `/conversations`, `/conversations/:id`, `/notifications`, `/events`, `/groups`, `/news`, `/invitations`, `/hashtags` |
| **Search** | `/search?q=` (users, jobs, companies, posts); empty query; Bug #2 (companies included) |
| **Profile readiness** | `/profile-readiness` shape (score, sections, fixes) — Bug #1 |
| **PATCH notifications** | Mark one read, mark all read, 404 for unknown id |
| **POST /feed** | Create post, empty/whitespace → 400, unicode content, no body |
| **POST /conversations/:id/messages** | Send message, empty text → 400, unknown conv → 404 |
| **Database — posts with accounts** | Every post has `authorId`; every `authorId` resolves to a user; new post has `authorId` = current user; feed newest-first; post shape (author, content, comments, likeCount) |
| **Persistence** | New post appears in feed; notification read state persists |
| **Account CRUD** | Register (201, no password in response), duplicate email → 409, validation (name, email, password), GET/DELETE user, delete → 404, cannot delete user 1 → 403 |
| **Story #1 Outreach** | Valid generate, missing/unknown recipientId, invalid tone fallback, custom_note in draft, draft ≤ 500 chars |
| **Story #2 Outreach** | Readiness score/level/can_message/breakdown/top_tips, unknown userId → 404, top_tips ≤ 3, breakdown 9 items |
| **Security / input** | XSS in custom_note, SQL-injection-like string, negative/float/string/boolean/zero recipientId, long custom_note truncated, negative/non-integer userId, control chars stripped, malicious goal default |
| **Register edge cases** | Empty body, empty name, malformed email, short password, XSS in name (accepted; sanitize on output) |

### 2.2 Test Count

**89** test cases covering success paths, validation, 400/404/409/403, persistence, and security.

---

## 3. Frontend Contract Tests (`backend/test_frontend_contract.py`)

These tests call the same endpoints the frontend uses (as in `js/api.js`) and assert the **response shapes** the UI expects. No frontend files were modified.

Run:

```bash
python3 backend/test_frontend_contract.py
```

### 3.1 Contract Coverage

- **getMe()** — `id`, `name`, `headline`, `experience`, `education`, `skills`.
- **getUsers() / getUser(id)** — list of objects with `id`, `name`; single user shape.
- **getFeed() / createPost(content)** — list of posts with `id`, `author`, `content`, `comments`, `likeCount`, `authorId`; create returns same shape.
- **getJobs() / getJob(id)** — list and detail with `id`, `title`, `company`.
- **getCompany(id)** — `id`, `name`.
- **getConversations() / getConversation(id)** — list with participant info; detail with `messages` array.
- **getNotifications() / markRead() / markAllRead()** — list with `id`, `isRead`; PATCH returns notification; read-all returns `success`.
- **search(q)** — `users`, `jobs`, `companies`, `posts`.
- **getProfileReadiness()** — `score`, `sections`, `fixes`.
- **getOutreachReadiness() / generateOutreachMessage()** — readiness: `score`, `level`, `can_message`, `breakdown`, `top_tips`; generate: `draft`, `tips`, `alternatives`.
- **register() / deleteUser()** — register returns user with `id`, no `password`; delete returns 204.
- **sendMessage(id, text)** — returns message with `id`, `text`.
- **Static endpoints** — `/events`, `/groups`, `/courses`, `/news`, `/invitations`, `/hashtags` return arrays.
- **Known gaps** — 404 for unknown user; `/feed` always returns an array.

If a contract test fails, the **backend response shape** no longer matches what the frontend expects; fix the API or document the change for the frontend.

---

## 4. How to Run All Tests and Re-check

1. **Start backend:**
   `python3 backend/app.py`
   (ensure nothing else is using port 5000).

2. **Backend API tests:**
   `python3 backend/test_api.py`
   Exit code 0 = all passed.

3. **Frontend contract tests:**
   `python3 backend/test_frontend_contract.py`
   Exit code 0 = all passed.

4. **Manual frontend check:**  
   Open `app.html` (or `http://localhost:5000/` with the backend running), use Feed, Profile, Network, Jobs, Messaging, Notifications, Search, and Outreach flows. No frontend code was changed, so existing behavior should be unchanged; contract tests guard the API shape the frontend relies on.

---

## 5. Summary

| Item | Status |
|------|--------|
| Database with PKs and FKs per dev spec | Done (all main tables have `id` PK; posts/conversations/messages reference users). |
| Posts stored with account records | Done (`posts.author_id` NOT NULL, FK to `users`). |
| No hardcoded data in DB layer | Done (seed from `data/*.py`; feed from DB). |
| Hardcoded sender_id removed | Done (messages use current user from DB). |
| Backend test coverage | Done (90+ cases: CRUD, persistence, outreach, security, DB/post/account). |
| Frontend contract tests | Done (all api.js endpoints; no FE changes). |
| Frontend code changed | None. |

**Conclusion:** The database is structured with primary keys and foreign keys as intended; posts are stored with account records and nothing is hardcoded in the data layer. Backend and frontend-contract test suites cover the API from multiple angles; run both with the backend on port 5000 and use this report as the reference for what is tested.
