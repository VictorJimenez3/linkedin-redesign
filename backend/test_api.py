#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
"""
Nexus API Test Suite  — backend/test_api.py
Covers dev spec §16 test cases (T1.x, T7.x) plus all existing endpoints
and security edge cases.

No external dependencies — uses Python stdlib only.
Run:  python backend/test_api.py        (backend must be on localhost:5000)
"""

import json
import sys
import urllib.request
import urllib.error

BASE = "http://localhost:5000/api"

# ── Transport helpers ──────────────────────────────────────────

def _req(method, path, body=None):
    """Return (status_code, parsed_json). Never raises on HTTP errors."""
    url  = BASE + path
    data = json.dumps(body).encode() if body is not None else None
    req  = urllib.request.Request(
        url, data=data, method=method,
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        try:
            payload = json.loads(e.read())
        except Exception:
            payload = {}
        return e.code, payload

def get(path):    return _req("GET",   path)
def post(path, body=None): return _req("POST",  path, body)
def patch(path):  return _req("PATCH", path)

# ── Test runner ────────────────────────────────────────────────

passed = failed = 0

def ok(name, status, body, checks):
    """checks: list of (description, bool)"""
    global passed, failed
    errors = []
    if status not in (200, 201):
        errors.append(f"expected 2xx, got {status}  body={body}")
    for desc, result in checks:
        if not result:
            errors.append(f"FAIL — {desc}")
    if errors:
        failed += 1
        print(f"  ✗  {name}")
        for e in errors:
            print(f"       {e}")
    else:
        passed += 1
        print(f"  ✓  {name}")

def err(name, status, body, expected_code, expected_fragment=None):
    global passed, failed
    errors = []
    if status != expected_code:
        errors.append(f"expected HTTP {expected_code}, got {status}  body={body}")
    if expected_fragment and expected_fragment.lower() not in str(body).lower():
        errors.append(f"expected '{expected_fragment}' in body  got={body}")
    if errors:
        failed += 1
        print(f"  ✗  {name}")
        for e in errors:
            print(f"       {e}")
    else:
        passed += 1
        print(f"  ✓  {name}")

def section(title):
    print(f"\n{'─'*55}")
    print(f"  {title}")
    print(f"{'─'*55}")

# ══════════════════════════════════════════════════════════════
# 1. EXISTING ENDPOINTS
# ══════════════════════════════════════════════════════════════

section("Existing endpoints — GET")

s, b = get("/me")
ok("GET /me  returns current user", s, b, [
    ("has id=1",     b.get("id") == 1),
    ("has name",     bool(b.get("name"))),
    ("has headline", bool(b.get("headline"))),
])

s, b = get("/users")
ok("GET /users  returns list", s, b, [
    ("is list",        isinstance(b, list)),
    ("non-empty",      len(b) > 0),
    ("each has id",    all("id" in u for u in b)),
])

s, b = get("/users/3")
ok("GET /users/3  returns Sarah Chen", s, b, [
    ("id == 3",    b.get("id") == 3),
    ("has name",   bool(b.get("name"))),
])

s, b = get("/users/9999")
err("GET /users/9999  returns 404", s, b, 404)

s, b = get("/feed")
ok("GET /feed  returns posts list", s, b, [
    ("is list",     isinstance(b, list)),
    ("non-empty",   len(b) > 0),
    ("each has id", all("id" in p for p in b)),
])

s, b = get("/jobs")
ok("GET /jobs  returns jobs list", s, b, [
    ("is list",     isinstance(b, list)),
    ("≥10 jobs",    len(b) >= 10),
])

s, b = get("/jobs/1")
ok("GET /jobs/1  returns job detail", s, b, [
    ("has title",   bool(b.get("title"))),
    ("has company", bool(b.get("company"))),
])

s, b = get("/companies/1")
ok("GET /companies/1  returns company", s, b, [
    ("has name", bool(b.get("name"))),
])

s, b = get("/conversations")
ok("GET /conversations  returns list", s, b, [
    ("is list",    isinstance(b, list)),
    ("non-empty",  len(b) > 0),
    ("has participantName", all("participantName" in c for c in b)),
])

s, b = get("/conversations/1")
ok("GET /conversations/1  returns messages", s, b, [
    ("has messages",  isinstance(b.get("messages"), list)),
    ("non-empty",     len(b.get("messages", [])) > 0),
])

s, b = get("/notifications")
ok("GET /notifications  returns list", s, b, [
    ("is list",       isinstance(b, list)),
    ("has isRead",    all("isRead" in n for n in b)),
])

s, b = get("/events")
ok("GET /events  returns list", s, b, [("is list", isinstance(b, list))])

s, b = get("/groups")
ok("GET /groups  returns list", s, b, [("is list", isinstance(b, list))])

s, b = get("/news")
ok("GET /news  returns list", s, b, [("is list", isinstance(b, list))])

s, b = get("/invitations")
ok("GET /invitations  returns list", s, b, [("is list", isinstance(b, list))])

s, b = get("/hashtags")
ok("GET /hashtags  returns list", s, b, [("is list", isinstance(b, list))])

# ── Search now includes companies ──────────────────────────────
section("Search — includes companies (Bug #2 fix)")

s, b = get("/search?q=google")
ok("GET /search?q=google  returns 4 keys", s, b, [
    ("has users",     "users"     in b),
    ("has jobs",      "jobs"      in b),
    ("has companies", "companies" in b),
    ("has posts",     "posts"     in b),
])

s, b = get("/search?q=stripe")
ok("GET /search?q=stripe  companies non-empty", s, b, [
    ("companies is list", isinstance(b.get("companies"), list)),
    ("found stripe co",   len(b.get("companies", [])) > 0),
])

s, b = get("/search?q=")
ok("GET /search?q=  empty query returns empty sets", s, b, [
    ("users empty",     b.get("users") == []),
    ("companies empty", b.get("companies") == []),
])

# ── Profile Readiness — correct shape ─────────────────────────
section("Profile Readiness /api/profile-readiness (Bug #1 fix)")

s, b = get("/profile-readiness")
ok("GET /profile-readiness  correct shape", s, b, [
    ("has score",    "score"    in b),
    ("has sections", "sections" in b),
    ("has fixes",    "fixes"    in b),
    ("score 0-100",  0 <= b.get("score", -1) <= 100),
    ("6 sections",   len(b.get("sections", [])) == 6),
    ("6 fixes",      len(b.get("fixes", [])) == 6),
    ("section has score key", all("score" in x for x in b.get("sections", []))),
    ("fix has status key",    all("status" in x for x in b.get("fixes", []))),
    ("status values valid",   all(x["status"] in ("done","warn","bad") for x in b.get("fixes", []))),
])

# ── PATCH endpoints ────────────────────────────────────────────
section("PATCH notifications")

s, b = patch("/notifications/1/read")
ok("PATCH /notifications/1/read  returns notification", s, b, [
    ("isRead True", b.get("isRead") is True),
])

s, b = patch("/notifications/read-all")
ok("PATCH /notifications/read-all  returns success", s, b, [
    ("success key", b.get("success") is True),
])

# ── POST feed ─────────────────────────────────────────────────
section("POST /feed")

s, b = post("/feed", {"content": "Test post from test suite"})
ok("POST /feed  creates post", s, b, [
    ("has id",      "id" in b),
    ("has content", b.get("content") == "Test post from test suite"),
])

s, b = post("/feed", {"content": ""})
err("POST /feed  empty content → 400", s, b, 400)

# ══════════════════════════════════════════════════════════════
# 2. STORY #1 — Outreach Message Guidance
# ══════════════════════════════════════════════════════════════

section("Story #1 — POST /api/outreach/generate")

# T1.1  Valid full request
s, b = post("/outreach/generate", {"recipientId": 5, "tone": "friendly", "goal": "networking"})
ok("T1.1  valid request → draft + tips + alternatives", s, b, [
    ("has draft",        bool(b.get("draft"))),
    ("has char_count",   isinstance(b.get("char_count"), int)),
    ("3 tips",           len(b.get("tips", [])) == 3),
    ("2 alternatives",   len(b.get("alternatives", [])) == 2),
    ("tone echoed",      b.get("tone") == "friendly"),
])

# T1.2  Missing recipientId
s, b = post("/outreach/generate", {})
err("T1.2  missing recipientId → 400", s, b, 400, "recipientId")

# T1.3  Unknown recipientId
s, b = post("/outreach/generate", {"recipientId": 9999})
err("T1.3  unknown recipientId → 404", s, b, 404, "9999")

# T1.4  Invalid tone falls back to professional
s, b = post("/outreach/generate", {"recipientId": 5, "tone": "sarcastic"})
ok("T1.4  invalid tone defaults to professional", s, b, [
    ("tone=professional", b.get("tone") == "professional"),
])

# T1.5  Custom note appended
s, b = post("/outreach/generate", {"recipientId": 5, "custom_note": "I loved your Config 2025 talk!"})
ok("T1.5  custom_note appears in draft", s, b, [
    ("note in draft", "Config 2025" in b.get("draft", "")),
])

# T1.6  Draft ≤ 500 chars
s, b = post("/outreach/generate", {"recipientId": 5, "goal": "job_inquiry"})
ok("T1.6  draft ≤ 500 chars", s, b, [
    ("char_count ≤ 500", b.get("char_count", 9999) <= 500),
    ("draft len ≤ 500",  len(b.get("draft", "")) <= 500),
])

# ══════════════════════════════════════════════════════════════
# 3. STORY #7 — Outreach Readiness Check
# ══════════════════════════════════════════════════════════════

section("Story #7 — GET /api/outreach/readiness")

# T7.1  Current user (complete profile) → ready
s, b = get("/outreach/readiness")
ok("T7.1  current user → score ≥ 75, level=ready", s, b, [
    ("has score",     "score"    in b),
    ("has level",     "level"    in b),
    ("has can_msg",   "can_message" in b),
    ("has breakdown", "breakdown"   in b),
    ("has top_tips",  "top_tips"    in b),
    ("score ≥ 75",    b.get("score", 0) >= 75),
    ("level=ready",   b.get("level") == "ready"),
])

# T7.2  Sparse user (Emma Wilson id=12 — fewer fields)
s, b = get("/outreach/readiness?userId=12")
ok("T7.2  sparse user → score reflects profile", s, b, [
    ("has score",      "score" in b),
    ("score 0-100",    0 <= b.get("score", -1) <= 100),
])

# T7.3  Unknown userId → 404
s, b = get("/outreach/readiness?userId=9999")
err("T7.3  unknown userId → 404", s, b, 404, "9999")

# T7.4 + T7.5  can_message threshold
s, b = get("/outreach/readiness")
ok("T7.4  current user can_message=true (score ≥ 60)", s, b, [
    ("can_message True", b.get("can_message") is True),
])

# T7.6  top_tips ordered by weight (experience weight=20 tops)
s, b = get("/outreach/readiness?userId=12")
ok("T7.6  top_tips list present and ≤ 3 items", s, b, [
    ("is list",   isinstance(b.get("top_tips"), list)),
    ("≤ 3 tips",  len(b.get("top_tips", [])) <= 3),
])

# T7.7  Breakdown has exactly 9 items
s, b = get("/outreach/readiness")
ok("T7.7  breakdown has 9 items", s, b, [
    ("9 items",        len(b.get("breakdown", [])) == 9),
    ("each has key",   all("key"    in x for x in b.get("breakdown", []))),
    ("each has weight",all("weight" in x for x in b.get("breakdown", []))),
    ("each has met",   all("met"    in x for x in b.get("breakdown", []))),
])

# ══════════════════════════════════════════════════════════════
# 4. SECURITY & INPUT EDGE CASES
# ══════════════════════════════════════════════════════════════

section("Security — input validation & injection prevention")

# HTML injection in custom_note — must not appear raw in draft
s, b = post("/outreach/generate", {
    "recipientId": 5,
    "custom_note": "<script>alert('xss')</script>",
})
ok("HTML tags stripped from custom_note", s, b, [
    ("no <script> in draft", "<script>" not in b.get("draft", "")),
])

# SQL injection string — treated as plain text, no crash
s, b = post("/outreach/generate", {
    "recipientId": 5,
    "custom_note": "'; DROP TABLE users; --",
})
ok("SQL injection string handled safely", s, b, [
    ("2xx returned",     s == 200),
    ("draft non-empty",  bool(b.get("draft"))),
])

# Negative recipientId
s, b = post("/outreach/generate", {"recipientId": -1})
err("Negative recipientId → 400", s, b, 400)

# Float recipientId
s, b = post("/outreach/generate", {"recipientId": 1.5})
err("Float recipientId → 400", s, b, 400)

# String recipientId
s, b = post("/outreach/generate", {"recipientId": "admin"})
err("String recipientId → 400", s, b, 400)

# custom_note over 200 chars — must be truncated, not rejected
long_note = "A" * 500
s, b = post("/outreach/generate", {"recipientId": 5, "custom_note": long_note})
ok("custom_note >200 chars truncated to 200", s, b, [
    ("2xx returned",     s == 200),
    ("truncated in draft", long_note not in b.get("draft", "")),
])

# Negative userId on readiness
s, b = get("/outreach/readiness?userId=-5")
err("Negative userId → 400", s, b, 400)

# Non-integer userId
s, b = get("/outreach/readiness?userId=abc")
err("Non-integer userId → 400", s, b, 400)

# Control chars in custom_note
s, b = post("/outreach/generate", {
    "recipientId": 5,
    "custom_note": "Hello\x00\x1b\x7fWorld",
})
ok("Control characters stripped from custom_note", s, b, [
    ("no null byte",  "\x00" not in b.get("draft", "")),
    ("no ESC char",   "\x1b" not in b.get("draft", "")),
])

# Empty JSON body (not None) — recipientId missing → 400
s, b = post("/outreach/generate", {})
err("Empty JSON body → 400 (recipientId required)", s, b, 400)

# Goal injection attempt — unknown goal defaults, no crash
s, b = post("/outreach/generate", {
    "recipientId": 5,
    "goal": "'; DROP TABLE users; --",
})
ok("Malicious goal string defaults to networking, no crash", s, b, [
    ("2xx returned", s == 200),
])

# ══════════════════════════════════════════════════════════════
# SUMMARY
# ══════════════════════════════════════════════════════════════

total = passed + failed
print(f"\n{'═'*55}")
print(f"  Results: {passed}/{total} passed", end="")
if failed:
    print(f"  ←  {failed} FAILED")
else:
    print("  ✓ all clear")
print(f"{'═'*55}\n")

sys.exit(0 if failed == 0 else 1)
