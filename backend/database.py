"""
database.py — SQLite persistence layer for the Nexus backend.

Seeds from data/*.py on first init. All mutable data (posts, messages,
notifications) persists across restarts. Static reference data (jobs,
companies, users) is re-seeded each startup so seed changes are reflected.
"""

import sqlite3
import json
import time
import os
import hashlib

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
_DB_PATH = os.path.join(os.path.dirname(__file__), "nexus.db")


def _connect():
    conn = sqlite3.connect(_DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def _ts():
    return int(time.time() * 1000)


# ---------------------------------------------------------------------------
# Schema + seed
# ---------------------------------------------------------------------------
def init_db():
    """Create tables and seed from data/*.py. Safe to call multiple times."""
    from data import users as users_data
    from data import posts as posts_data
    from data import jobs as jobs_data
    from data import companies as companies_data
    from data import conversations as convs_data
    from data import notifications as notifs_data

    conn = _connect()
    c = conn.cursor()

    # -- Users ----------------------------------------------------------------
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id      INTEGER PRIMARY KEY,
            name    TEXT NOT NULL,
            email   TEXT UNIQUE NOT NULL,
            pw_hash TEXT NOT NULL,
            data    TEXT NOT NULL   -- full JSON blob
        )
    """)

    # -- Posts ----------------------------------------------------------------
    c.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            author_id   INTEGER NOT NULL,
            content     TEXT NOT NULL,
            created_at  INTEGER NOT NULL,
            data        TEXT NOT NULL   -- full JSON blob (reactions, comments, etc.)
        )
    """)

    # -- Jobs -----------------------------------------------------------------
    c.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            id   INTEGER PRIMARY KEY,
            data TEXT NOT NULL
        )
    """)

    # -- Companies ------------------------------------------------------------
    c.execute("""
        CREATE TABLE IF NOT EXISTS companies (
            id   INTEGER PRIMARY KEY,
            data TEXT NOT NULL
        )
    """)

    # -- Conversations --------------------------------------------------------
    c.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id   INTEGER PRIMARY KEY,
            data TEXT NOT NULL   -- metadata (participant, unreadCount, etc.)
        )
    """)

    # -- Messages -------------------------------------------------------------
    c.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER NOT NULL REFERENCES conversations(id),
            sender_id       INTEGER NOT NULL,
            text            TEXT NOT NULL,
            timestamp       INTEGER NOT NULL,
            is_read         INTEGER NOT NULL DEFAULT 0
        )
    """)

    # -- Notifications --------------------------------------------------------
    c.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id      INTEGER PRIMARY KEY,
            is_read INTEGER NOT NULL DEFAULT 0,
            data    TEXT NOT NULL
        )
    """)

    conn.commit()

    # ---- Seed users (always replace so data changes are reflected) ----------
    current = users_data.CURRENT_USER.copy()
    current.setdefault("email", "alex.johnson@gmail.com")
    _upsert_user(c, current["id"], current["name"], current["email"],
                 _hash_pw("password123"), current)

    for u in users_data.USERS:
        safe_name = u['name'].lower().replace(' ', '.').replace("'", '')
        email = f"{safe_name}@example.com"
        _upsert_user(c, u["id"], u["name"], email, _hash_pw("password123"), u)

    # ---- Seed jobs ----------------------------------------------------------
    c.execute("DELETE FROM jobs")
    for j in jobs_data.JOBS:
        c.execute("INSERT INTO jobs (id, data) VALUES (?, ?)",
                  (j["id"], json.dumps(j)))

    # ---- Seed companies -----------------------------------------------------
    c.execute("DELETE FROM companies")
    for co in companies_data.COMPANIES:
        c.execute("INSERT INTO companies (id, data) VALUES (?, ?)",
                  (co["id"], json.dumps(co)))

    # ---- Seed conversations (only if table is empty) -----------------------
    c.execute("SELECT COUNT(*) FROM conversations")
    if c.fetchone()[0] == 0:
        for conv in convs_data.get_conversations():
            meta = {k: v for k, v in conv.items() if k != "messages"}
            c.execute("INSERT INTO conversations (id, data) VALUES (?, ?)",
                      (conv["id"], json.dumps(meta)))
            for msg in conv.get("messages", []):
                c.execute("""
                    INSERT INTO messages
                        (conversation_id, sender_id, text, timestamp, is_read)
                    VALUES (?, ?, ?, ?, ?)
                """, (conv["id"], msg["senderId"],
                      msg["text"], msg["timestamp"],
                      1 if msg.get("isRead") else 0))

    # ---- Seed posts (only if empty) ----------------------------------------
    c.execute("SELECT COUNT(*) FROM posts")
    if c.fetchone()[0] == 0:
        for p in posts_data.get_posts():
            blob = {k: v for k, v in p.items()
                    if k not in ("id", "author_id", "content", "created_at")}
            c.execute("""
                INSERT INTO posts (id, author_id, content, created_at, data)
                VALUES (?, ?, ?, ?, ?)
            """, (p["id"], p["author"]["id"], p["content"],
                  p["timestamp"], json.dumps(blob)))

    # ---- Seed notifications (only if empty) ---------------------------------
    c.execute("SELECT COUNT(*) FROM notifications")
    if c.fetchone()[0] == 0:
        for n in notifs_data.NOTIFICATIONS:
            c.execute("""
                INSERT INTO notifications (id, is_read, data)
                VALUES (?, ?, ?)
            """, (n["id"], 1 if n.get("isRead") else 0, json.dumps(n)))

    conn.commit()
    conn.close()


def _hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


def _upsert_user(c, uid, name, email, pw_hash, data_dict):
    c.execute("""
        INSERT INTO users (id, name, email, pw_hash, data)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            name=excluded.name,
            email=excluded.email,
            data=excluded.data
    """, (uid, name, email, pw_hash, json.dumps(data_dict)))


# ---------------------------------------------------------------------------
# User functions
# ---------------------------------------------------------------------------
def get_current_user():
    """Return the logged-in user (always id=1 in this demo)."""
    return get_user_by_id(1)


def get_all_users():
    conn = _connect()
    rows = conn.execute("SELECT data FROM users WHERE id != 1").fetchall()
    conn.close()
    return [json.loads(r["data"]) for r in rows]


def get_user_by_id(user_id):
    conn = _connect()
    row = conn.execute("SELECT data FROM users WHERE id=?",
                       (int(user_id),)).fetchone()
    conn.close()
    return json.loads(row["data"]) if row else None


def create_user(name: str, email: str, password: str):
    """
    Create a new user. Raises ValueError if email already taken.
    Returns the new user dict.
    """
    conn = _connect()
    existing = conn.execute("SELECT id FROM users WHERE email=?",
                            (email.lower(),)).fetchone()
    if existing:
        conn.close()
        raise ValueError("email_taken")

    pw_hash = _hash_pw(password)
    # Auto-increment id beyond existing max
    max_id = conn.execute("SELECT MAX(id) FROM users").fetchone()[0] or 0
    new_id = max_id + 1
    user = {
        "id": new_id,
        "name": name,
        "email": email.lower(),
        "headline": "",
        "location": "",
        "connections": 0,
        "followers": 0,
        "avatarColor": "#0F5DBD",
        "isPremium": False,
        "openToWork": False,
        "about": "",
        "experience": [],
        "education": [],
        "skills": [],
    }
    conn.execute("""
        INSERT INTO users (id, name, email, pw_hash, data)
        VALUES (?, ?, ?, ?, ?)
    """, (new_id, name, email.lower(), pw_hash, json.dumps(user)))
    conn.commit()
    conn.close()
    return user


def delete_user(user_id: int):
    """
    Delete a user by id. Raises ValueError if trying to delete id=1.
    Returns True on success, False if user not found.
    """
    if int(user_id) == 1:
        raise ValueError("cannot_delete_primary_user")
    conn = _connect()
    row = conn.execute("SELECT id FROM users WHERE id=?",
                       (int(user_id),)).fetchone()
    if not row:
        conn.close()
        return False
    conn.execute("DELETE FROM users WHERE id=?", (int(user_id),))
    conn.commit()
    conn.close()
    return True


# ---------------------------------------------------------------------------
# Post functions
# ---------------------------------------------------------------------------
def get_all_posts():
    conn = _connect()
    rows = conn.execute(
        "SELECT id, author_id, content, created_at, data FROM posts ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    result = []
    for r in rows:
        blob = json.loads(r["data"])
        post = {
            "id": r["id"],
            "content": r["content"],
            "timestamp": r["created_at"],
            **blob,
        }
        result.append(post)
    return result


def create_post(author_id: int, content: str):
    """Create a new post. Returns the full post dict."""
    user = get_user_by_id(author_id)
    author_blob = {
        "id": user["id"],
        "name": user["name"],
        "headline": user.get("headline", ""),
        "avatarColor": user.get("avatarColor", "#0F5DBD"),
    }
    now = _ts()
    blob = {
        "author": author_blob,
        "reactions": {"like": 0, "celebrate": 0, "love": 0,
                      "support": 0, "insightful": 0, "funny": 0},
        "totalReactions": 0,
        "comments": 0,
        "reposts": 0,
        "isLiked": False,
        "isSaved": False,
        "reactionType": None,
        "type": "text",
        "tags": [],
        "commentsList": [],
    }
    conn = _connect()
    c = conn.cursor()
    c.execute("""
        INSERT INTO posts (author_id, content, created_at, data)
        VALUES (?, ?, ?, ?)
    """, (author_id, content, now, json.dumps(blob)))
    new_id = c.lastrowid
    conn.commit()
    conn.close()
    return {"id": new_id, "content": content, "timestamp": now, **blob}


# ---------------------------------------------------------------------------
# Job functions
# ---------------------------------------------------------------------------
def get_all_jobs():
    conn = _connect()
    rows = conn.execute("SELECT data FROM jobs ORDER BY id").fetchall()
    conn.close()
    return [json.loads(r["data"]) for r in rows]


def get_job_by_id(job_id: int):
    conn = _connect()
    row = conn.execute("SELECT data FROM jobs WHERE id=?",
                       (int(job_id),)).fetchone()
    conn.close()
    return json.loads(row["data"]) if row else None


# ---------------------------------------------------------------------------
# Company functions
# ---------------------------------------------------------------------------
def get_company_by_id(company_id: int):
    conn = _connect()
    row = conn.execute("SELECT data FROM companies WHERE id=?",
                       (int(company_id),)).fetchone()
    conn.close()
    return json.loads(row["data"]) if row else None


# ---------------------------------------------------------------------------
# Conversation + message functions
# ---------------------------------------------------------------------------
def get_all_conversations():
    """Return conversation summaries (no messages list)."""
    conn = _connect()
    rows = conn.execute("SELECT id, data FROM conversations ORDER BY id").fetchall()
    conn.close()
    result = []
    for r in rows:
        meta = json.loads(r["data"])
        meta["id"] = r["id"]
        result.append(meta)
    return result


def get_conversation_by_id(conv_id: int):
    """Return full conversation including messages list."""
    conn = _connect()
    row = conn.execute("SELECT data FROM conversations WHERE id=?",
                       (int(conv_id),)).fetchone()
    if not row:
        conn.close()
        return None
    meta = json.loads(row["data"])
    meta["id"] = int(conv_id)

    msg_rows = conn.execute("""
        SELECT id, sender_id, text, timestamp, is_read
        FROM messages WHERE conversation_id=? ORDER BY timestamp ASC
    """, (int(conv_id),)).fetchall()
    conn.close()

    meta["messages"] = [
        {
            "id": m["id"],
            "senderId": m["sender_id"],
            "text": m["text"],
            "timestamp": m["timestamp"],
            "isRead": bool(m["is_read"]),
        }
        for m in msg_rows
    ]
    return meta


def send_message(conv_id: int, sender_id: int, text: str):
    """Append a message to a conversation. Returns the new message dict."""
    now = _ts()
    conn = _connect()

    # Verify conversation exists
    row = conn.execute("SELECT data FROM conversations WHERE id=?",
                       (int(conv_id),)).fetchone()
    if not row:
        conn.close()
        return None

    c = conn.cursor()
    c.execute("""
        INSERT INTO messages (conversation_id, sender_id, text, timestamp, is_read)
        VALUES (?, ?, ?, ?, 0)
    """, (int(conv_id), int(sender_id), text, now))
    new_id = c.lastrowid

    # Update conversation metadata (lastMessage, lastTimestamp)
    meta = json.loads(row["data"])
    meta["lastMessage"] = text
    meta["lastTimestamp"] = now
    c.execute("UPDATE conversations SET data=? WHERE id=?",
              (json.dumps(meta), int(conv_id)))

    conn.commit()
    conn.close()
    return {
        "id": new_id,
        "senderId": int(sender_id),
        "text": text,
        "timestamp": now,
        "isRead": False,
    }


# ---------------------------------------------------------------------------
# Notification functions
# ---------------------------------------------------------------------------
def get_all_notifications():
    conn = _connect()
    rows = conn.execute(
        "SELECT id, is_read, data FROM notifications ORDER BY id"
    ).fetchall()
    conn.close()
    result = []
    for r in rows:
        n = json.loads(r["data"])
        n["isRead"] = bool(r["is_read"])
        result.append(n)
    return result


def mark_notification_read(notif_id: int):
    conn = _connect()
    row = conn.execute("SELECT data FROM notifications WHERE id=?",
                       (int(notif_id),)).fetchone()
    if not row:
        conn.close()
        return None
    conn.execute("UPDATE notifications SET is_read=1 WHERE id=?",
                 (int(notif_id),))
    conn.commit()
    n = json.loads(row["data"])
    n["isRead"] = True
    conn.close()
    return n


def mark_all_notifications_read():
    conn = _connect()
    conn.execute("UPDATE notifications SET is_read=1")
    conn.commit()
    conn.close()


# ---------------------------------------------------------------------------
# Search
# ---------------------------------------------------------------------------
def search(q: str):
    """Full-text search across users, jobs, companies, and posts."""
    q_lower = q.lower().strip()
    if not q_lower:
        return {"users": [], "jobs": [], "companies": [], "posts": [], "query": q}

    conn = _connect()

    # Users
    user_rows = conn.execute("SELECT data FROM users WHERE id != 1").fetchall()
    users = [
        json.loads(r["data"]) for r in user_rows
        if q_lower in json.loads(r["data"]).get("name", "").lower()
        or q_lower in json.loads(r["data"]).get("headline", "").lower()
        or q_lower in json.loads(r["data"]).get("location", "").lower()
    ]

    # Jobs
    job_rows = conn.execute("SELECT data FROM jobs").fetchall()
    jobs = [
        json.loads(r["data"]) for r in job_rows
        if q_lower in json.loads(r["data"]).get("title", "").lower()
        or q_lower in json.loads(r["data"]).get("company", "").lower()
        or q_lower in json.loads(r["data"]).get("location", "").lower()
    ]

    # Companies
    co_rows = conn.execute("SELECT data FROM companies").fetchall()
    companies = [
        json.loads(r["data"]) for r in co_rows
        if q_lower in json.loads(r["data"]).get("name", "").lower()
        or q_lower in json.loads(r["data"]).get("industry", "").lower()
    ]

    # Posts
    post_rows = conn.execute(
        "SELECT id, author_id, content, created_at, data FROM posts"
    ).fetchall()
    posts = []
    for r in post_rows:
        if q_lower in r["content"].lower():
            blob = json.loads(r["data"])
            posts.append({"id": r["id"], "content": r["content"],
                          "timestamp": r["created_at"], **blob})

    conn.close()
    return {
        "users": users,
        "jobs": jobs,
        "companies": companies,
        "posts": posts,
        "query": q,
    }
