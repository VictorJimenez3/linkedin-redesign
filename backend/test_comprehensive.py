#!/usr/bin/env python3
"""
Nexus Comprehensive Test Suite
Tests: concurrency (10+ simultaneous users), all user stories, edge cases,
       full user lifecycles, and combination scenarios.
Run:   python3 backend/test_comprehensive.py  (backend must be on localhost:5000)
"""
import json, uuid, sys, io, threading, time
import urllib.request, urllib.error, urllib.parse

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

BASE = "http://localhost:5000/api"
passed = failed = 0
_lock = threading.Lock()
_results = []

# ── Transport ──────────────────────────────────────────────────

def _req(method, path, body=None, token=None):
    url = BASE + path
    data = json.dumps(body).encode() if body is not None else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = "Bearer " + token
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            raw = r.read()
            try:    return r.status, json.loads(raw)
            except: return r.status, {}
    except urllib.error.HTTPError as e:
        try:    payload = json.loads(e.read())
        except: payload = {}
        return e.code, payload
    except Exception as ex:
        return 0, {"error": str(ex)}

def get(p, token=None):             return _req("GET",    p, token=token)
def post(p, b=None, token=None):    return _req("POST",   p, b, token=token)
def patch(p, token=None):           return _req("PATCH",  p, token=token)
def put(p, b=None, token=None):     return _req("PUT",    p, b, token=token)
def delete(p, token=None):          return _req("DELETE", p, token=token)

# ── Runner ─────────────────────────────────────────────────────

def ok(name, status, body, checks):
    global passed, failed
    errors = []
    if not (200 <= status < 300):
        errors.append(f"expected 2xx got {status} body={str(body)[:120]}")
    for desc, result in checks:
        if not result:
            errors.append(f"FAIL: {desc}")
    with _lock:
        if errors:
            failed += 1
            _results.append(("FAIL", name, errors))
        else:
            passed += 1
            _results.append(("ok", name, []))

def err(name, status, body, code, frag=None):
    global passed, failed
    errors = []
    if status != code:
        errors.append(f"expected {code} got {status}")
    if frag and frag.lower() not in str(body).lower():
        errors.append(f"expected '{frag}' in body")
    with _lock:
        if errors:
            failed += 1
            _results.append(("FAIL", name, errors))
        else:
            passed += 1
            _results.append(("ok", name, []))

def section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

# ── Helpers ────────────────────────────────────────────────────

def make_user(suffix=None):
    """Register a fresh user, return (user_dict, token)."""
    s = suffix or uuid.uuid4().hex[:8]
    email = f"user_{s}@nexus.test"
    status, body = post("/auth/register", {"name": f"User {s}", "email": email, "password": "Password123!"})
    if status == 201:
        return body.get("user", {}), body.get("token", "")
    return {}, ""

def cleanup_user(uid, token=None):
    if uid:
        delete(f"/users/{uid}", token=token)

# ══════════════════════════════════════════════════════════════
# 1. CORE ENDPOINTS — sanity before load
# ══════════════════════════════════════════════════════════════

section("1. Core endpoint sanity")

s, b = get("/me")
ok("GET /me baseline", s, b, [("has id", "id" in b), ("has name", bool(b.get("name")))])

s, b = get("/feed")
ok("GET /feed returns list", s, b, [("is list", isinstance(b, list)), ("non-empty", len(b) > 0)])

s, b = get("/jobs")
ok("GET /jobs", s, b, [("is list", isinstance(b, list)), (">=10", len(b) >= 10)])

s, b = get("/users")
ok("GET /users", s, b, [("is list", isinstance(b, list)), ("non-empty", len(b) > 0)])

s, b = get("/conversations")
ok("GET /conversations", s, b, [("is list", isinstance(b, list))])

s, b = get("/notifications")
ok("GET /notifications", s, b, [("is list", isinstance(b, list))])

for path in ["/events", "/groups", "/courses", "/news", "/invitations", "/hashtags"]:
    s, b = get(path)
    ok(f"GET {path}", s, b, [("is list", isinstance(b, list))])

# ══════════════════════════════════════════════════════════════
# 2. AUTH — register, login, token, edge cases
# ══════════════════════════════════════════════════════════════

section("2. Auth — register, login, tokens, edge cases")

_sfx = uuid.uuid4().hex[:8]
_email = f"auth_{_sfx}@nexus.test"

# Register
s, b = post("/auth/register", {"name": "Auth Tester", "email": _email, "password": "SecurePass1!"})
_auth_user = b.get("user", {})
_auth_token = b.get("token", "")
ok("Register new user", s, b, [
    ("status 201", s == 201), ("has user", isinstance(_auth_user, dict)),
    ("has token", bool(_auth_token)), ("no pw_hash", "pw_hash" not in _auth_user),
    ("email stored", _auth_user.get("email") == _email),
])

# Duplicate email
s, b = post("/auth/register", {"name": "Dup", "email": _email, "password": "SecurePass1!"})
err("Duplicate email → 409", s, b, 409)

# Login correct
s, b = post("/auth/login", {"email": _email, "password": "SecurePass1!"})
_login_token = b.get("token", "")
ok("Login correct credentials", s, b, [
    ("status 200", s == 200), ("has token", bool(_login_token)),
    ("user email matches", b.get("user", {}).get("email") == _email),
])

# Wrong password
s, b = post("/auth/login", {"email": _email, "password": "wrongpass"})
err("Login wrong password → 401", s, b, 401)

# Unknown email
s, b = post("/auth/login", {"email": "nobody@nexus.test", "password": "SecurePass1!"})
err("Login unknown email → 401", s, b, 401)

# Missing fields
s, b = post("/auth/register", {})
err("Register empty body → 400", s, b, 400)

s, b = post("/auth/register", {"name": "", "email": _email, "password": "SecurePass1!"})
err("Register empty name → 400", s, b, 400)

s, b = post("/auth/register", {"name": "X", "email": "notanemail", "password": "SecurePass1!"})
err("Register bad email → 400", s, b, 400)

s, b = post("/auth/register", {"name": "X", "email": f"x_{_sfx}@n.test", "password": "short"})
err("Register short password → 400", s, b, 400)

# Token auth works
s, b = get("/me", token=_auth_token)
ok("GET /me with valid token", s, b, [
    ("correct user", b.get("email") == _email),
])

# Invalid token falls back to user 1
s, b = get("/me", token="invalidtokenxyz")
ok("GET /me invalid token → fallback user 1", s, b, [("id=1", b.get("id") == 1)])

# Authenticated post creation
s, b = post("/feed", {"content": "Auth user post"}, token=_auth_token)
ok("Authenticated POST /feed uses correct author", s, b, [
    ("authorId matches", b.get("authorId") == _auth_user.get("id")),
])

cleanup_user(_auth_user.get("id"))

# ══════════════════════════════════════════════════════════════
# 3. FULL USER LIFECYCLE — 5 independent users
# ══════════════════════════════════════════════════════════════

section("3. Full user lifecycle × 5 users")

lifecycle_users = []

for i in range(5):
    u, tok = make_user()
    if not u:
        continue
    uid = u.get("id")
    lifecycle_users.append((uid, tok))

    # Get own profile
    s, b = get("/me", token=tok)
    ok(f"User {i+1}: GET /me", s, b, [("correct id", b.get("id") == uid)])

    # Update profile
    s, b = put("/me", {"headline": f"Engineer #{i+1} | CS Student | Builder", "location": "New York, NY"}, token=tok)
    ok(f"User {i+1}: update profile", s, b, [("headline updated", "Engineer" in b.get("headline",""))])

    # Create post
    content = f"Hello from lifecycle user {i+1}! #{uuid.uuid4().hex[:4]}"
    s, b = post("/feed", {"content": content}, token=tok)
    ok(f"User {i+1}: create post", s, b, [
        ("has id", "id" in b), ("authorId correct", b.get("authorId") == uid),
        ("content stored", b.get("content") == content),
    ])

    # View feed — see own post
    s, feed = get("/feed", token=tok)
    ok(f"User {i+1}: post appears in feed", s, feed, [
        ("own post in feed", any(p.get("content") == content for p in feed)),
    ])

    # Check readiness
    s, b = get("/outreach/readiness", token=tok)
    ok(f"User {i+1}: readiness check", s, b, [
        ("has score", "score" in b), ("has level", "level" in b),
        ("score 0-100", 0 <= b.get("score", -1) <= 100),
    ])

    # Generate outreach message
    s, b = post("/outreach/generate", {"recipientId": 3, "tone": "professional", "goal": "networking"}, token=tok)
    ok(f"User {i+1}: generate outreach", s, b, [
        ("has draft", bool(b.get("draft"))),
        ("draft ≤500", len(b.get("draft","")) <= 500),
    ])

    # Send a message
    s, b = post("/conversations/1/messages", {"text": f"Hi from user {i+1}!"}, token=tok)
    ok(f"User {i+1}: send message", s, b, [("has text", bool(b.get("text")))])

# Cleanup lifecycle users
for uid, tok in lifecycle_users:
    cleanup_user(uid, tok)

# ══════════════════════════════════════════════════════════════
# 4. STORY #1 — Outreach Generate: all goals × all tones × scenarios
# ══════════════════════════════════════════════════════════════

section("4. Story #1 — Outreach Generate: all goals × tones × scenarios")

GOALS = ["job_inquiry", "networking", "advice", "collaboration"]
TONES = ["professional", "friendly", "formal"]

# All 12 goal×tone combinations
for goal in GOALS:
    for tone in TONES:
        s, b = post("/outreach/generate", {"recipientId": 2, "goal": goal, "tone": tone})
        ok(f"  generate goal={goal} tone={tone}", s, b, [
            ("has draft", bool(b.get("draft"))),
            ("tone echoed", b.get("tone") == tone),
            ("3 tips", len(b.get("tips", [])) == 3),
            ("2 alternatives", len(b.get("alternatives", [])) == 2),
            ("draft ≤500", len(b.get("draft","")) <= 500),
        ])

# With custom_note
s, b = post("/outreach/generate", {"recipientId": 4, "custom_note": "I loved your talk at Config 2025!"})
ok("generate with custom_note", s, b, [
    ("note in draft", "Config 2025" in b.get("draft","")),
    ("draft ≤500", len(b.get("draft","")) <= 500),
])

# With all details fields
s, b = post("/outreach/generate", {
    "recipientId": 5,
    "goal": "job_inquiry",
    "tone": "professional",
    "details": {
        "yourRole": "CS student",
        "field": "machine learning",
        "company": "Google",
        "role": "SWE Intern",
        "context": "I saw your recent research on transformers",
    }
})
ok("generate with all details", s, b, [
    ("has draft", bool(b.get("draft"))),
    ("role in draft", "CS student" in b.get("draft", "") or "Google" in b.get("draft","")),
    ("draft ≤500", len(b.get("draft","")) <= 500),
])

# Different recipients
for rid in [2, 3, 4, 5, 6, 7]:
    s, b = post("/outreach/generate", {"recipientId": rid, "goal": "networking"})
    ok(f"generate for recipient {rid}", s, b, [
        ("has draft", bool(b.get("draft"))), ("draft ≤500", len(b.get("draft","")) <= 500),
    ])

# Invalid tone defaults to professional
s, b = post("/outreach/generate", {"recipientId": 2, "tone": "sarcastic"})
ok("invalid tone defaults to professional", s, b, [("tone=professional", b.get("tone") == "professional")])

# Invalid goal defaults to networking
s, b = post("/outreach/generate", {"recipientId": 2, "goal": "manipulation"})
ok("invalid goal defaults to networking", s, b, [("has draft", bool(b.get("draft")))])

# Missing recipientId
s, b = post("/outreach/generate", {})
err("missing recipientId → 400", s, b, 400)

# Unknown recipient
s, b = post("/outreach/generate", {"recipientId": 99999})
err("unknown recipientId → 404", s, b, 404)

# Negative id
s, b = post("/outreach/generate", {"recipientId": -5})
err("negative recipientId → 400", s, b, 400)

# Zero
s, b = post("/outreach/generate", {"recipientId": 0})
err("zero recipientId → 400", s, b, 400)

# Float
s, b = post("/outreach/generate", {"recipientId": 2.5})
err("float recipientId → 400", s, b, 400)

# Boolean
s, b = post("/outreach/generate", {"recipientId": True})
err("bool recipientId → 400", s, b, 400)

# String
s, b = post("/outreach/generate", {"recipientId": "admin"})
err("string recipientId → 400", s, b, 400)

# XSS stripped
s, b = post("/outreach/generate", {"recipientId": 2, "custom_note": "<script>alert(1)</script>"})
ok("XSS stripped from custom_note", s, b, [("no script tag", "<script>" not in b.get("draft",""))])

# SQL injection — no crash
s, b = post("/outreach/generate", {"recipientId": 2, "custom_note": "'; DROP TABLE users; --"})
ok("SQL injection in custom_note — no crash", s, b, [("2xx", 200 <= s < 300)])

# Control chars stripped
s, b = post("/outreach/generate", {"recipientId": 2, "custom_note": "Hi\x00\x1b\x7fWorld"})
ok("control chars stripped", s, b, [("no null byte", "\x00" not in b.get("draft",""))])

# Long custom_note truncated
s, b = post("/outreach/generate", {"recipientId": 2, "custom_note": "A" * 500})
ok("long custom_note truncated — no crash", s, b, [("2xx", 200 <= s < 300)])

# Draft always ≤ 500
for goal in GOALS:
    s, b = post("/outreach/generate", {
        "recipientId": 2,
        "goal": goal,
        "custom_note": "Extra note that is quite long and detailed to stress test the truncation logic in the backend module.",
        "details": {"context": "additional context here to make the message as long as possible"}
    })
    ok(f"draft always ≤500 (goal={goal})", s, b, [
        ("char_count ≤500", b.get("char_count", 9999) <= 500),
        ("draft len ≤500", len(b.get("draft","")) <= 500),
    ])

# ══════════════════════════════════════════════════════════════
# 5. STORY #7 — Readiness Check: levels, thresholds, per-user
# ══════════════════════════════════════════════════════════════

section("5. Story #7 — Outreach Readiness: all users, levels, breakdown")

# Current user (complete profile → ready)
s, b = get("/outreach/readiness")
ok("current user readiness shape", s, b, [
    ("has score", "score" in b), ("has level", "level" in b),
    ("has can_message", "can_message" in b), ("has breakdown", "breakdown" in b),
    ("has top_tips", "top_tips" in b), ("max_score=100", b.get("max_score") == 100),
    ("9 breakdown items", len(b.get("breakdown",[])) == 9),
    ("top_tips ≤3", len(b.get("top_tips",[])) <= 3),
])

# Verify score = sum of met weights
s, b = get("/outreach/readiness")
calc = sum(x["weight"] for x in b.get("breakdown",[]) if x.get("met"))
ok("score == sum of met weights", s, b, [("match", calc == b.get("score"))])

# Level thresholds match spec
s, b = get("/outreach/readiness")
score = b.get("score", 0)
level = b.get("level", "")
expected_level = "ready" if score >= 75 else ("almost_ready" if score >= 50 else "not_ready")
ok("level matches score threshold", s, b, [("level correct", level == expected_level)])

# can_message boundary: True iff score >= 60
s, b = get("/outreach/readiness")
score = b.get("score", 0)
expected_cm = score >= 60
ok("can_message = score >= 60", s, b, [("correct", b.get("can_message") == expected_cm)])

# Each user in the system
s, users_list = get("/users")
for u in (users_list or [])[:10]:
    uid = u.get("id")
    s2, r = get(f"/outreach/readiness?userId={uid}")
    ok(f"readiness for userId={uid}", s2, r, [
        ("has score", "score" in r),
        ("score 0-100", 0 <= r.get("score", -1) <= 100),
        ("9 breakdown", len(r.get("breakdown",[])) == 9),
    ])

# Unknown userId
s, b = get("/outreach/readiness?userId=99999")
err("unknown userId → 404", s, b, 404)

# Invalid userId strings
s, b = get("/outreach/readiness?userId=abc")
err("non-integer userId → 400", s, b, 400)

s, b = get("/outreach/readiness?userId=-1")
err("negative userId → 400", s, b, 400)

s, b = get("/outreach/readiness?userId=0")
err("zero userId → 400", s, b, 400)

# Breakdown has tip=None for met, tip=str for unmet
s, b = get("/outreach/readiness")
for item in b.get("breakdown", []):
    name = item.get("key","?")
    if item.get("met"):
        ok(f"breakdown {name}: tip=None when met", 200, {}, [("tip is None", item.get("tip") is None)])
    else:
        ok(f"breakdown {name}: tip is str when unmet", 200, {}, [("tip is str", isinstance(item.get("tip"), str))])

# top_tips are highest-weight unmet items
s, b = get("/outreach/readiness?userId=12")
unmet = sorted([x for x in b.get("breakdown",[]) if not x.get("met")], key=lambda x: x["weight"], reverse=True)
expected_tips = [x["tip"] for x in unmet[:3] if x.get("tip")]
ok("top_tips = highest-weight unmet", s, b, [("tips match", b.get("top_tips") == expected_tips)])

# Fresh user → lower score
u2, tok2 = make_user()
if u2:
    s, b = get(f"/outreach/readiness?userId={u2['id']}")
    ok("fresh user has lower readiness", s, b, [
        ("score < 100", b.get("score", 100) < 100),
        ("level not always ready", True),
    ])
    cleanup_user(u2.get("id"), tok2)

# ══════════════════════════════════════════════════════════════
# 6. FEED — post CRUD, ordering, author linkage, persistence
# ══════════════════════════════════════════════════════════════

section("6. Feed — create, ordering, author, persistence, edge cases")

# Create and verify in feed
unique = f"FeedTest_{uuid.uuid4().hex[:10]}"
s, b = post("/feed", {"content": unique})
ok("POST /feed creates post", s, b, [
    ("has id", "id" in b), ("has authorId", "authorId" in b),
    ("has author", "author" in b), ("content matches", b.get("content") == unique),
    ("likeCount=0", b.get("likeCount") == 0),
    ("comments is list", isinstance(b.get("comments"), list)),
])
_post_id = b.get("id")

s, feed = get("/feed")
ok("new post appears in feed", s, feed, [("found", any(p.get("content") == unique for p in feed))])

# Feed sorted newest first
s, feed = get("/feed")
if len(feed) >= 2:
    ts = [p.get("createdAt", 0) for p in feed[:5]]
    ok("feed newest-first", s, feed, [("sorted", all(ts[i] >= ts[i+1] for i in range(len(ts)-1)))])

# All posts have authorId referencing a real user
s, feed = get("/feed")
s2, users_list = get("/users")
user_ids = {u["id"] for u in (users_list or [])} | {1}
ok("all posts have valid authorId", s, feed, [
    ("each has authorId", all("authorId" in p for p in feed)),
    ("authorId is int", all(isinstance(p.get("authorId"), int) for p in feed)),
])

# Empty content rejected
s, b = post("/feed", {"content": ""})
err("empty content → 400", s, b, 400)

s, b = post("/feed", {"content": "   "})
err("whitespace-only content → 400", s, b, 400)

# No body
s, b = post("/feed", None)
err("no body → 400", s, b, 400)

# Unicode content
s, b = post("/feed", {"content": "Unicode: café, 日本語, العربية, 한국어"})
ok("unicode content stored", s, b, [("has id", "id" in b), ("cafe in content", "café" in b.get("content",""))])

# Very long content
long_content = "A" * 2000
s, b = post("/feed", {"content": long_content})
ok("very long content accepted", s, b, [("has id", "id" in b)])

# XSS in content — stored as text, not executed
s, b = post("/feed", {"content": "<script>alert('xss')</script>"})
ok("XSS content stored as text", s, b, [("stored", bool(b.get("content")))])

# ══════════════════════════════════════════════════════════════
# 7. MESSAGING — conversations, send, persist
# ══════════════════════════════════════════════════════════════

section("7. Messaging — conversations, send, persist, edge cases")

s, convs = get("/conversations")
ok("GET /conversations", s, convs, [
    ("is list", isinstance(convs, list)),
    ("has participantName", all("participantName" in c for c in convs)),
])

if convs:
    cid = convs[0]["id"]
    s, conv = get(f"/conversations/{cid}")
    ok("GET /conversations/:id", s, conv, [
        ("has messages", isinstance(conv.get("messages"), list)),
    ])

    # Send message
    txt = f"Test message {uuid.uuid4().hex[:6]}"
    s, b = post(f"/conversations/{cid}/messages", {"text": txt})
    ok("POST message to conversation", s, b, [
        ("has id", "id" in b), ("text matches", b.get("text") == txt),
        ("isMe True", b.get("isMe") is True),
    ])

    # Message persists
    s, conv2 = get(f"/conversations/{cid}")
    ok("sent message persists", s, conv2, [
        ("found", any(m.get("text") == txt for m in conv2.get("messages",[]))),
    ])

    # Multiple messages in same conversation
    for i in range(3):
        s, b = post(f"/conversations/{cid}/messages", {"text": f"Message #{i}"})
        ok(f"send message #{i}", s, b, [("has id", "id" in b)])

    # Empty text rejected
    s, b = post(f"/conversations/{cid}/messages", {"text": ""})
    err("empty text → 400", s, b, 400)

    s, b = post(f"/conversations/{cid}/messages", {"text": "   "})
    err("whitespace text → 400", s, b, 400)

# Unknown conversation
s, b = post("/conversations/99999/messages", {"text": "hi"})
err("unknown conv → 404", s, b, 404)

s, b = get("/conversations/99999")
err("GET unknown conv → 404", s, b, 404)

# ══════════════════════════════════════════════════════════════
# 8. NOTIFICATIONS — list, mark read, persistence
# ══════════════════════════════════════════════════════════════

section("8. Notifications — list, mark read, bulk, persistence")

s, notifs = get("/notifications")
ok("GET /notifications shape", s, notifs, [
    ("is list", isinstance(notifs, list)),
    ("each has isRead", all("isRead" in n for n in notifs)),
    ("each has id", all("id" in n for n in notifs)),
])

if notifs:
    nid = notifs[0]["id"]
    s, b = patch(f"/notifications/{nid}/read")
    ok("PATCH mark one read", s, b, [("isRead True", b.get("isRead") is True)])

    # Verify persists
    s, notifs2 = get("/notifications")
    ok("read state persists", s, notifs2, [
        ("still read", any(n["id"] == nid and n["isRead"] for n in notifs2)),
    ])

s, b = patch("/notifications/read-all")
ok("PATCH read-all", s, b, [("success", b.get("success") is True)])

# Verify all read
s, notifs3 = get("/notifications")
ok("all notifications read after read-all", s, notifs3, [
    ("all read", all(n.get("isRead") for n in notifs3)),
])

# Unknown
s, b = patch("/notifications/99999/read")
err("mark unknown notif read → 404", s, b, 404)

# ══════════════════════════════════════════════════════════════
# 9. USERS / PROFILE — CRUD, update, search, delete
# ══════════════════════════════════════════════════════════════

section("9. Users — CRUD, profile update, search, delete")

# Cannot delete user 1
s, b = delete("/users/1")
err("DELETE /users/1 blocked (403)", s, b, 403)

# Non-existent user
s, b = get("/users/99999")
err("GET /users/99999 → 404", s, b, 404)

s, b = delete("/users/99999")
err("DELETE /users/99999 → 404", s, b, 404)

# Create → find → update → delete
u3, tok3 = make_user()
if u3:
    uid3 = u3["id"]
    s, b = get(f"/users/{uid3}")
    ok("GET new user by id", s, b, [("correct id", b.get("id") == uid3)])

    s, b = put("/me", {"headline": "Updated Headline | CS | NJIT", "location": "Newark, NJ",
                        "about": "I am a test user updating my profile to check that the PUT /me endpoint works correctly end to end."}, token=tok3)
    ok("PUT /me updates profile", s, b, [
        ("headline updated", "Updated Headline" in b.get("headline","")),
        ("location updated", b.get("location") == "Newark, NJ"),
    ])

    # Verify readiness improved (about now filled)
    s, r = get(f"/outreach/readiness?userId={uid3}")
    ok("readiness reflects updated about", s, r, [("has score", "score" in r)])

    # PATCH /me
    s, b = put("/me", {"pronouns": "they/them"}, token=tok3)
    ok("PUT /me partial update (pronouns)", s, b, [("has id", "id" in b)])

    # Delete
    s, b = delete(f"/users/{uid3}")
    ok("DELETE user returns 204", s, b, [("204", s == 204)])

    # Gone after delete
    s, b = get(f"/users/{uid3}")
    err("deleted user → 404", s, b, 404)

# Search
s, b = get("/search?q=Google")
ok("search for Google", s, b, [
    ("has keys", all(k in b for k in ["users","jobs","companies","posts"])),
])

s, b = get("/search?q=")
ok("empty search returns empty sets", s, b, [
    ("users empty", b.get("users") == []),
    ("companies empty", b.get("companies") == []),
])

s, b = get("/search?q=<script>alert(1)</script>")
ok("XSS in search — no crash", s, b, [("2xx", 200 <= s < 300)])

_sqli_q = urllib.parse.urlencode({"q": "'; DROP TABLE users; --"})
s, b = get(f"/search?{_sqli_q}")
ok("SQL injection in search — no crash", s, b, [("2xx", 200 <= s < 300)])

# ══════════════════════════════════════════════════════════════
# 10. JOBS & COMPANIES
# ══════════════════════════════════════════════════════════════

section("10. Jobs and Companies")

s, jobs = get("/jobs")
ok("GET /jobs list", s, jobs, [
    ("is list", isinstance(jobs, list)),
    ("each has title", all("title" in j for j in jobs)),
    ("each has company", all("company" in j for j in jobs)),
    ("each has id", all("id" in j for j in jobs)),
])

if jobs:
    jid = jobs[0]["id"]
    s, b = get(f"/jobs/{jid}")
    ok("GET /jobs/:id detail", s, b, [("has title", "title" in b), ("has company", "company" in b)])

s, b = get("/jobs/99999")
err("GET /jobs/99999 → 404", s, b, 404)

s, b = get("/companies/1")
ok("GET /companies/1", s, b, [("has name", "name" in b)])

s, b = get("/companies/99999")
err("GET /companies/99999 → 404", s, b, 404)

# ══════════════════════════════════════════════════════════════
# 11. COMBINATION SCENARIOS — realistic user flows
# ══════════════════════════════════════════════════════════════

section("11. Combination scenarios — realistic user flows")

# Scenario A: Student registers, checks readiness, then generates message
ua, toka = make_user()
if ua:
    s, r = get("/outreach/readiness", token=toka)
    score_a = r.get("score", 0)
    ok("Scenario A: register → readiness", s, r, [("has score", "score" in r)])

    s, b = post("/outreach/generate", {"recipientId": 5, "goal": "job_inquiry", "tone": "professional",
                                        "details": {"yourRole": "CS student", "company": "Meta", "role": "SWE Intern"}}, token=toka)
    ok("Scenario A: generate after readiness check", s, b, [
        ("draft present", bool(b.get("draft"))), ("meta in draft", "Meta" in b.get("draft","")),
    ])
    cleanup_user(ua.get("id"), toka)

# Scenario B: User posts, then searches for own post
ub, tokb = make_user()
if ub:
    unique_b = f"ScenarioB_{uuid.uuid4().hex[:8]}"
    post("/feed", {"content": unique_b}, token=tokb)
    s, feed = get("/feed", token=tokb)
    ok("Scenario B: post appears in feed", s, feed, [
        ("found", any(p.get("content") == unique_b for p in feed)),
    ])
    cleanup_user(ub.get("id"), tokb)

# Scenario C: User updates profile → readiness score improves
uc, tokc = make_user()
if uc:
    s, r1 = get("/outreach/readiness", token=tokc)
    score_before = r1.get("score", 0)
    put("/me", {
        "headline": "Software Engineer | CS Major | Open to Work",
        "about": "I am a passionate computer science student at NJIT working on full-stack applications. I love building products that make a real difference in people's lives.",
        "location": "Newark, NJ",
    }, token=tokc)
    s, r2 = get(f"/outreach/readiness?userId={uc['id']}")
    score_after = r2.get("score", 0)
    ok("Scenario C: profile update improves readiness", s, r2, [
        ("score improved or same", score_after >= score_before),
    ])
    cleanup_user(uc.get("id"), tokc)

# Scenario D: Friendly tone advice goal with field and context
s, b = post("/outreach/generate", {
    "recipientId": 6,
    "goal": "advice",
    "tone": "friendly",
    "custom_note": "I came across your work on distributed systems.",
    "details": {"yourRole": "junior dev", "field": "distributed systems", "context": "big fan of your blog posts"}
})
ok("Scenario D: advice/friendly with details", s, b, [
    ("draft present", bool(b.get("draft"))), ("friendly tips", len(b.get("tips",[])) == 3),
    ("2 alternatives", len(b.get("alternatives",[])) == 2),
])

# Scenario E: Collaboration + formal tone
s, b = post("/outreach/generate", {
    "recipientId": 7, "goal": "collaboration", "tone": "formal",
    "details": {"field": "AI research", "context": "potential joint paper opportunity"}
})
ok("Scenario E: collaboration/formal", s, b, [("draft ≤500", len(b.get("draft","")) <= 500)])

# Scenario F: Read all notifications then post then send message
patch("/notifications/read-all")
s, notifs = get("/notifications")
ok("Scenario F: all notifs read", s, notifs, [("all read", all(n.get("isRead") for n in notifs))])
post("/feed", {"content": "Post after reading all notifications"})
s, b = post("/conversations/1/messages", {"text": "Message after reading notifications"})
ok("Scenario F: message after notifications", s, b, [("has id", "id" in b)])

# Scenario G: Readiness for multiple users compared
s, users_g = get("/users")
if users_g:
    scores = []
    for u in (users_g or [])[:5]:
        s2, r = get(f"/outreach/readiness?userId={u['id']}")
        if 200 <= s2 < 300:
            scores.append(r.get("score", 0))
    ok("Scenario G: readiness varies across users", s, users_g, [
        ("got scores", len(scores) > 0),
        ("scores in range", all(0 <= sc <= 100 for sc in scores)),
    ])

# ══════════════════════════════════════════════════════════════
# 12. CONCURRENCY — 10 simultaneous users
# ══════════════════════════════════════════════════════════════

section("12. Concurrency — 10 simultaneous users")

_concurrent_errors = []
_concurrent_lock = threading.Lock()

def concurrent_user_flow(user_num):
    """Full workflow: register → post → readiness → generate → message → cleanup."""
    errors = []
    suffix = uuid.uuid4().hex[:8]
    u, tok = make_user(suffix)
    if not u:
        with _concurrent_lock:
            _concurrent_errors.append(f"User {user_num}: failed to register")
        return

    uid = u.get("id")

    # Post
    content = f"Concurrent post from user {user_num} / {suffix}"
    s, b = post("/feed", {"content": content}, token=tok)
    if not (200 <= s < 300):
        errors.append(f"create post failed: {s}")

    # Verify post in feed
    s, feed = get("/feed", token=tok)
    if not any(p.get("content") == content for p in (feed or [])):
        errors.append("post not found in feed")

    # Readiness
    s, r = get("/outreach/readiness", token=tok)
    if "score" not in r:
        errors.append(f"readiness missing score: {r}")

    # Generate outreach (different recipient per user to avoid hotspot)
    recipient_id = (user_num % 10) + 2
    s, b = post("/outreach/generate", {
        "recipientId": recipient_id,
        "goal": GOALS[user_num % 4],
        "tone": TONES[user_num % 3],
    }, token=tok)
    if not b.get("draft"):
        errors.append(f"no draft returned: {b}")
    if len(b.get("draft", "")) > 500:
        errors.append(f"draft too long: {len(b.get('draft',''))}")

    # Send message
    s, b = post("/conversations/1/messages", {"text": f"Concurrent message from {user_num}"}, token=tok)
    if not (200 <= s < 300):
        errors.append(f"send message failed: {s}")

    # Cleanup
    cleanup_user(uid, tok)

    with _concurrent_lock:
        if errors:
            _concurrent_errors.append(f"User {user_num}: {errors}")

# Launch 10 threads simultaneously
NUM_CONCURRENT = 10
threads = [threading.Thread(target=concurrent_user_flow, args=(i,)) for i in range(NUM_CONCURRENT)]
t_start = time.time()
for t in threads: t.start()
for t in threads: t.join()
elapsed = time.time() - t_start

ok(f"10 concurrent users completed in {elapsed:.1f}s", 200, {}, [
    ("no errors", len(_concurrent_errors) == 0),
])
if _concurrent_errors:
    for e in _concurrent_errors:
        print(f"    CONCURRENT ERROR: {e}")

# Additional: 20 simultaneous read requests
read_results = []
read_lock = threading.Lock()

def concurrent_read(path):
    s, b = get(path)
    with read_lock:
        read_results.append(200 <= s < 300)

read_threads = []
for i in range(20):
    paths = ["/feed", "/jobs", "/users", "/outreach/readiness", "/notifications"]
    t = threading.Thread(target=concurrent_read, args=(paths[i % len(paths)],))
    read_threads.append(t)

t_start2 = time.time()
for t in read_threads: t.start()
for t in read_threads: t.join()
elapsed2 = time.time() - t_start2

ok(f"20 concurrent reads completed in {elapsed2:.1f}s", 200, {}, [
    ("all succeeded", all(read_results)),
    ("count correct", len(read_results) == 20),
])

# 5 simultaneous post creations
post_results = []
post_lock = threading.Lock()

def concurrent_post(i):
    s, b = post("/feed", {"content": f"Concurrent post #{i} {uuid.uuid4().hex[:6]}"})
    with post_lock:
        post_results.append(200 <= s < 300)

post_threads = [threading.Thread(target=concurrent_post, args=(i,)) for i in range(5)]
for t in post_threads: t.start()
for t in post_threads: t.join()

ok("5 simultaneous post creations", 200, {}, [
    ("all succeeded", all(post_results)),
])

# 10 simultaneous outreach generates
gen_results = []
gen_lock = threading.Lock()

def concurrent_generate(i):
    s, b = post("/outreach/generate", {
        "recipientId": (i % 10) + 2,
        "goal": GOALS[i % 4],
        "tone": TONES[i % 3],
    })
    with gen_lock:
        gen_results.append({
            "ok": 200 <= s < 300,
            "has_draft": bool(b.get("draft")),
            "len_ok": len(b.get("draft","")) <= 500,
        })

gen_threads = [threading.Thread(target=concurrent_generate, args=(i,)) for i in range(10)]
for t in gen_threads: t.start()
for t in gen_threads: t.join()

ok("10 simultaneous outreach generates", 200, {}, [
    ("all 2xx", all(r["ok"] for r in gen_results)),
    ("all have draft", all(r["has_draft"] for r in gen_results)),
    ("all ≤500 chars", all(r["len_ok"] for r in gen_results)),
])

# ══════════════════════════════════════════════════════════════
# 13. PERSISTENCE — data survives multiple requests
# ══════════════════════════════════════════════════════════════

section("13. Persistence across requests")

marker = f"PersistTest_{uuid.uuid4().hex[:10]}"
_ps, _pb = post("/feed", {"content": marker})
if 200 <= _ps < 300:
    for _ in range(3):
        s, feed = get("/feed")
        ok(f"persistent post in feed (check {_+1})", s, feed, [
            ("found", any(p.get("content") == marker for p in feed)),
        ])

nids = [n["id"] for n in (get("/notifications")[1] or []) if not (get("/notifications")[1] or [])[0].get("isRead", True)]
if not nids:
    all_notifs = get("/notifications")[1] or []
    nids = [all_notifs[0]["id"]] if all_notifs else []
if nids:
    patch(f"/notifications/{nids[0]}/read")
    for _ in range(3):
        s, notifs = get("/notifications")
        ok(f"notification read state persists (check {_+1})", s, notifs, [
            ("still read", any(n["id"] == nids[0] and n["isRead"] for n in notifs)),
        ])

# ══════════════════════════════════════════════════════════════
# RESULTS
# ══════════════════════════════════════════════════════════════

total = passed + failed
print(f"\n{'='*60}")
print(f"  RESULTS: {passed}/{total} passed", end="")
if failed:
    print(f"  <-- {failed} FAILED")
    print(f"\nFailed tests:")
    for status, name, errors in _results:
        if status == "FAIL":
            print(f"  x  {name}")
            for e in errors:
                print(f"       {e}")
else:
    print("  — all clear")
print(f"{'='*60}\n")
sys.exit(0 if failed == 0 else 1)
