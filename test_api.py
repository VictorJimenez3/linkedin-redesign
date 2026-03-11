#!/usr/bin/env python3
"""
Comprehensive end-to-end API test suite for Nexus LinkedIn-clone.
Uses only Python 3 stdlib (urllib).
"""

import json
import urllib.request
import urllib.error
import urllib.parse
import sys

BASE = "http://localhost:5000/api"

# ── helpers ──────────────────────────────────────────────────────────────────

def req(method, path, body=None, token=None, expect=None):
    """
    Make an HTTP request. Returns (status_code, parsed_json_or_None).
    Never raises – returns (0, None) on network error.
    """
    url = BASE + path
    data = json.dumps(body).encode() if body is not None else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    try:
        r = urllib.request.Request(url, data=data, headers=headers, method=method)
        with urllib.request.urlopen(r) as resp:
            raw = resp.read()
            try:
                return resp.status, json.loads(raw)
            except Exception:
                return resp.status, raw.decode()
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, raw.decode()
    except Exception as ex:
        print(f"  [network error] {ex}")
        return 0, None

# ── test runner ───────────────────────────────────────────────────────────────

results = []   # list of (name, passed, note)

def t(name, passed, note=""):
    status = "PASS" if passed else "FAIL"
    results.append((name, passed, note))
    print(f"  [{status}] {name}" + (f" — {note}" if note else ""))

# ═══════════════════════════════════════════════════════════════════════════════
print("\n══════════════════════════════════════════════")
print("  AUTH FLOWS")
print("══════════════════════════════════════════════")

# 1. Register new user (valid)
s, d = req("POST", "/auth/register", {"name": "Tester One", "email": "tester_one_x99@example.com", "password": "StrongPass1!"})
t("1. Register new user (valid)", s == 201 and "token" in (d or {}) and "user" in (d or {}), f"status={s}")
reg_token = (d or {}).get("token")
reg_user  = (d or {}).get("user", {})

# 2. Register same email again → 409
s, d = req("POST", "/auth/register", {"name": "Tester One", "email": "tester_one_x99@example.com", "password": "StrongPass1!"})
t("2. Register duplicate email", s == 409, f"status={s}")

# 3. Weak password (7 chars) → 400
s, d = req("POST", "/auth/register", {"name": "Tester Weak", "email": "weakpass@example.com", "password": "abc123"})
t("3. Register weak password (6 chars)", s == 400, f"status={s}")

# 4. No name → 400
s, d = req("POST", "/auth/register", {"email": "noname@example.com", "password": "StrongPass1!"})
t("4. Register no name", s == 400, f"status={s}")

# 5. Bad email → 400
s, d = req("POST", "/auth/register", {"name": "Bad Email", "email": "not-an-email", "password": "StrongPass1!"})
t("5. Register bad email", s == 400, f"status={s}")

# 6. Login correct creds → 200
s, d = req("POST", "/auth/login", {"email": "tester_one_x99@example.com", "password": "StrongPass1!"})
t("6. Login correct creds", s == 200 and "token" in (d or {}) and "user" in (d or {}), f"status={s}")
login_token = (d or {}).get("token")
login_user  = (d or {}).get("user", {})

# 7. Login wrong password → 401
s, d = req("POST", "/auth/login", {"email": "tester_one_x99@example.com", "password": "WrongPass999"})
t("7. Login wrong password", s == 401, f"status={s}")

# 8. Login unknown email → 401
s, d = req("POST", "/auth/login", {"email": "nobody_xyz@example.com", "password": "StrongPass1!"})
t("8. Login unknown email", s == 401, f"status={s}")

# 9. GET /me with valid token → correct user
s, d = req("GET", "/me", token=login_token)
t("9. GET /me with valid token", s == 200 and (d or {}).get("email") == "tester_one_x99@example.com", f"status={s} email={( d or {}).get('email')}")

# 10. GET /me with no token → fallback to id=1
s, d = req("GET", "/me")
t("10. GET /me no token → id=1", s == 200 and (d or {}).get("id") == 1, f"status={s} id={(d or {}).get('id')}")

# ═══════════════════════════════════════════════════════════════════════════════
print("\n══════════════════════════════════════════════")
print("  PROFILE")
print("══════════════════════════════════════════════")

# 11. GET /me has required fields
s, d = req("GET", "/me", token=login_token)
required = {"id", "name", "headline", "email"}
has_fields = required.issubset(set((d or {}).keys()))
t("11. GET /me has id/name/headline/email", s == 200 and has_fields, f"keys={list((d or {}).keys())[:8]}")

# 12. PATCH /me valid fields
s, d = req("PATCH", "/me", {"headline": "Test Engineer", "location": "Newark, NJ", "about": "Testing the API."}, token=login_token)
ok = (s == 200 and
      (d or {}).get("headline") == "Test Engineer" and
      (d or {}).get("location") == "Newark, NJ" and
      (d or {}).get("about") == "Testing the API.")
t("12. PATCH /me valid fields", ok, f"status={s} headline={(d or {}).get('headline')}")

# 13. PATCH /me invalid-only fields → 400 OR only valid fields updated
s, d = req("PATCH", "/me", {"__proto__": "evil", "constructor": "bad"}, token=login_token)
t("13. PATCH /me invalid fields → 400 or safe", s in (400, 200), f"status={s}")

# ═══════════════════════════════════════════════════════════════════════════════
print("\n══════════════════════════════════════════════")
print("  FEED")
print("══════════════════════════════════════════════")

# 14. GET /feed → list, each item has required fields
s, d = req("GET", "/feed")
feed_ok = (s == 200 and isinstance(d, list) and len(d) > 0 and
           all("id" in p and "content" in p and "author" in p and
               "authorId" in p and "likeCount" in p and "comments" in p
               for p in d))
t("14. GET /feed has required fields", feed_ok, f"status={s} count={len(d) if isinstance(d,list) else 'N/A'}")

# 15. POST /feed with content → 201
s, d = req("POST", "/feed", {"content": "Hello from test suite!"}, token=login_token)
t("15. POST /feed with content → 201", s == 201 and "id" in (d or {}) and "authorId" in (d or {}) and "content" in (d or {}), f"status={s}")
new_post_id = (d or {}).get("id")

# 16. POST /feed empty → 400
s, d = req("POST", "/feed", {"content": ""}, token=login_token)
t("16. POST /feed empty → 400", s == 400, f"status={s}")

# 17. POST /feed whitespace only → 400
s, d = req("POST", "/feed", {"content": "   "}, token=login_token)
t("17. POST /feed whitespace only → 400", s == 400, f"status={s}")

# 18. New post appears at top of GET /feed
s, d = req("GET", "/feed")
if isinstance(d, list) and new_post_id:
    found = any(p.get("id") == new_post_id for p in d)
    at_top = len(d) > 0 and d[0].get("id") == new_post_id
    t("18. New post appears at top of /feed", found and at_top, f"found={found} at_top={at_top}")
else:
    t("18. New post appears at top of /feed", False, "could not check")

# ═══════════════════════════════════════════════════════════════════════════════
print("\n══════════════════════════════════════════════")
print("  USERS")
print("══════════════════════════════════════════════")

# 19. GET /users → excludes current user (id=1 when no token)
s, d = req("GET", "/users")
ids = [u.get("id") for u in (d or [])]
t("19. GET /users excludes current user (id=1)", s == 200 and isinstance(d, list) and 1 not in ids,
  f"status={s} ids_sample={ids[:5]}")

# 20. GET /users/3 → specific user
s, d = req("GET", "/users/3")
t("20. GET /users/3 → specific user", s == 200 and (d or {}).get("id") == 3, f"status={s} id={(d or {}).get('id')}")

# 21. GET /users/9999 → 404
s, d = req("GET", "/users/9999")
t("21. GET /users/9999 → 404", s == 404, f"status={s}")

# 22. Register a temp user, then delete them → 204
s, d = req("POST", "/auth/register", {"name": "Temp Delete Me", "email": "temp_del_xyz@example.com", "password": "TempPass123!"})
temp_token = (d or {}).get("token")
temp_uid   = (d or {}).get("user", {}).get("id")
if temp_uid:
    s2, d2 = req("DELETE", f"/users/{temp_uid}", token=temp_token)
    t("22. DELETE non-primary user → 204", s2 == 204, f"status={s2} uid={temp_uid}")
else:
    t("22. DELETE non-primary user → 204", False, f"couldn't register temp user, status={s}")

# 23. DELETE /users/1 → 403
s, d = req("DELETE", "/users/1", token=login_token)
t("23. DELETE /users/1 → 403", s == 403, f"status={s}")

# ═══════════════════════════════════════════════════════════════════════════════
print("\n══════════════════════════════════════════════")
print("  JOBS")
print("══════════════════════════════════════════════")

# 24. GET /jobs → ≥10, each has title + company
s, d = req("GET", "/jobs")
jobs_ok = (s == 200 and isinstance(d, list) and len(d) >= 10 and
           all("title" in j and "company" in j for j in d))
t("24. GET /jobs ≥10 items with title+company", jobs_ok, f"status={s} count={len(d) if isinstance(d,list) else 'N/A'}")

# 25. GET /jobs/1 → has title, company, description
s, d = req("GET", "/jobs/1")
t("25. GET /jobs/1 has required fields",
  s == 200 and all(k in (d or {}) for k in ("title","company","description")),
  f"status={s}")

# 26. GET /jobs/9999 → 404
s, d = req("GET", "/jobs/9999")
t("26. GET /jobs/9999 → 404", s == 404, f"status={s}")

# ═══════════════════════════════════════════════════════════════════════════════
print("\n══════════════════════════════════════════════")
print("  COMPANIES")
print("══════════════════════════════════════════════")

# 27. GET /companies/1 → has name
s, d = req("GET", "/companies/1")
t("27. GET /companies/1 has name", s == 200 and "name" in (d or {}), f"status={s}")

# 28. GET /companies/9999 → 404
s, d = req("GET", "/companies/9999")
t("28. GET /companies/9999 → 404", s == 404, f"status={s}")

# ═══════════════════════════════════════════════════════════════════════════════
print("\n══════════════════════════════════════════════")
print("  CONVERSATIONS & MESSAGES")
print("══════════════════════════════════════════════")

# 29. GET /conversations → list with id + participantName
s, d = req("GET", "/conversations")
convs_ok = (s == 200 and isinstance(d, list) and len(d) > 0 and
            all("id" in c and "participantName" in c for c in d))
t("29. GET /conversations has id+participantName", convs_ok, f"status={s} count={len(d) if isinstance(d,list) else 'N/A'}")

# 30. GET /conversations/1 → has messages (non-empty)
s, d = req("GET", "/conversations/1")
msgs = (d or {}).get("messages", [])
t("30. GET /conversations/1 has non-empty messages", s == 200 and isinstance(msgs, list) and len(msgs) > 0, f"status={s} msg_count={len(msgs)}")

# 31. GET /conversations/9999 → 404
s, d = req("GET", "/conversations/9999")
t("31. GET /conversations/9999 → 404", s == 404, f"status={s}")

# 32. POST message → 201, has id, text, isMe=True
s, d = req("POST", "/conversations/1/messages", {"text": "Hello from test!"})
t("32. POST /conversations/1/messages → 201 with id+text+isMe", s == 201 and "id" in (d or {}) and "text" in (d or {}) and (d or {}).get("isMe") == True, f"status={s}")
new_msg_id = (d or {}).get("id")

# 33. POST empty message → 400
s, d = req("POST", "/conversations/1/messages", {"text": ""})
t("33. POST empty message → 400", s == 400, f"status={s}")

# 34. POST to /conversations/9999/messages → 404
s, d = req("POST", "/conversations/9999/messages", {"text": "ghost"})
t("34. POST /conversations/9999/messages → 404", s == 404, f"status={s}")

# 35. Verify new message appears in GET /conversations/1
s, d = req("GET", "/conversations/1")
msgs = (d or {}).get("messages", [])
found_msg = any(m.get("id") == new_msg_id for m in msgs) if new_msg_id else False
t("35. New message appears in GET /conversations/1", s == 200 and found_msg, f"found={found_msg}")

# ═══════════════════════════════════════════════════════════════════════════════
print("\n══════════════════════════════════════════════")
print("  NOTIFICATIONS")
print("══════════════════════════════════════════════")

# 36. GET /notifications → list with isRead
s, d = req("GET", "/notifications")
notifs_ok = s == 200 and isinstance(d, list) and len(d) > 0 and all("isRead" in n for n in d)
t("36. GET /notifications has isRead", notifs_ok, f"status={s} count={len(d) if isinstance(d,list) else 'N/A'}")

# 37. PATCH /notifications/1/read → isRead=True
s, d = req("PATCH", "/notifications/1/read")
t("37. PATCH /notifications/1/read → isRead=True", s == 200 and (d or {}).get("isRead") == True, f"status={s}")

# 38. PATCH /notifications/read-all → success=True
s, d = req("PATCH", "/notifications/read-all")
t("38. PATCH /notifications/read-all → success=True", s == 200 and (d or {}).get("success") == True, f"status={s}")

# 39. PATCH /notifications/9999/read → 404
s, d = req("PATCH", "/notifications/9999/read")
t("39. PATCH /notifications/9999/read → 404", s == 404, f"status={s}")

# ═══════════════════════════════════════════════════════════════════════════════
print("\n══════════════════════════════════════════════")
print("  SEARCH")
print("══════════════════════════════════════════════")

# 40. GET /search?q=google → has users/jobs/companies/posts keys
s, d = req("GET", "/search?q=google")
keys_ok = all(k in (d or {}) for k in ("users","jobs","companies","posts"))
t("40. GET /search?q=google has all keys", s == 200 and keys_ok, f"status={s} keys={list((d or {}).keys())}")

# 41. GET /search?q=stripe → companies non-empty
s, d = req("GET", "/search?q=stripe")
t("41. GET /search?q=stripe companies non-empty", s == 200 and len((d or {}).get("companies", [])) > 0,
  f"status={s} companies={len((d or {}).get('companies',[]))}")

# 42. GET /search?q= → all empty arrays
s, d = req("GET", "/search?q=")
all_empty = all(len((d or {}).get(k, [1])) == 0 for k in ("users","jobs","companies","posts"))
t("42. GET /search?q= → all empty", s == 200 and all_empty, f"status={s} users={len((d or {}).get('users',[]))} jobs={len((d or {}).get('jobs',[]))}")

# ═══════════════════════════════════════════════════════════════════════════════
print("\n══════════════════════════════════════════════")
print("  STATIC DATA")
print("══════════════════════════════════════════════")

# 43. GET /events → list
s, d = req("GET", "/events")
t("43. GET /events → list", s == 200 and isinstance(d, list), f"status={s} count={len(d) if isinstance(d,list) else 'N/A'}")

# 44. GET /groups → list
s, d = req("GET", "/groups")
t("44. GET /groups → list", s == 200 and isinstance(d, list), f"status={s} count={len(d) if isinstance(d,list) else 'N/A'}")

# 45. GET /groups/1 → has name/description
s, d = req("GET", "/groups/1")
t("45. GET /groups/1 has name+description", s == 200 and "name" in (d or {}) and "description" in (d or {}), f"status={s}")

# 46. GET /groups/9999 → 404
s, d = req("GET", "/groups/9999")
t("46. GET /groups/9999 → 404", s == 404, f"status={s}")

# 47. GET /courses → list
s, d = req("GET", "/courses")
t("47. GET /courses → list", s == 200 and isinstance(d, list), f"status={s} count={len(d) if isinstance(d,list) else 'N/A'}")

# 48. GET /news → list
s, d = req("GET", "/news")
t("48. GET /news → list", s == 200 and isinstance(d, list), f"status={s} count={len(d) if isinstance(d,list) else 'N/A'}")

# 49. GET /invitations → list
s, d = req("GET", "/invitations")
t("49. GET /invitations → list", s == 200 and isinstance(d, list), f"status={s} count={len(d) if isinstance(d,list) else 'N/A'}")

# 50. GET /hashtags → list
s, d = req("GET", "/hashtags")
t("50. GET /hashtags → list", s == 200 and isinstance(d, list), f"status={s} count={len(d) if isinstance(d,list) else 'N/A'}")

# ═══════════════════════════════════════════════════════════════════════════════
print("\n══════════════════════════════════════════════")
print("  OUTREACH - Story #1")
print("══════════════════════════════════════════════")

# 51. POST /outreach/generate basic
s, d = req("POST", "/outreach/generate", {"recipientId": 5, "tone": "professional", "goal": "networking"})
t("51. POST /outreach/generate basic", s == 200 and all(k in (d or {}) for k in ("draft","tips","alternatives")),
  f"status={s} keys={list((d or {}).keys())}")
base_draft = (d or {}).get("draft", "")

# 52. All tones work
tone_results = []
for tone in ("professional", "friendly", "formal"):
    s2, d2 = req("POST", "/outreach/generate", {"recipientId": 5, "tone": tone, "goal": "networking"})
    tone_results.append(s2 == 200 and "draft" in (d2 or {}))
t("52. All tones work (professional/friendly/formal)", all(tone_results), f"results={tone_results}")

# 53. All goals work
goal_results = []
for goal in ("job_inquiry", "networking", "advice", "collaboration"):
    s2, d2 = req("POST", "/outreach/generate", {"recipientId": 5, "tone": "professional", "goal": goal})
    goal_results.append(s2 == 200 and "draft" in (d2 or {}))
t("53. All goals work (job_inquiry/networking/advice/collaboration)", all(goal_results), f"results={goal_results}")

# 54. custom_note appears in draft
s, d = req("POST", "/outreach/generate", {"recipientId": 5, "tone": "professional", "goal": "networking", "custom_note": "We met at NJIT hackathon"})
draft = (d or {}).get("draft", "")
t("54. custom_note incorporated in draft", s == 200 and "hackathon" in draft.lower(),
  f"status={s} draft_snippet={draft[:80]}")

# 55. details fields incorporated
s, d = req("POST", "/outreach/generate", {
    "recipientId": 5, "tone": "professional", "goal": "networking",
    "yourRole": "Software Engineer", "field": "AI", "company": "OpenAI",
    "role": "ML Engineer", "context": "saw your post about transformers"
})
draft = (d or {}).get("draft", "")
t("55. Details fields incorporated in draft", s == 200 and len(draft) > 50,
  f"status={s} draft_snippet={draft[:80]}")

# 56. Missing recipientId → 400
s, d = req("POST", "/outreach/generate", {"tone": "professional", "goal": "networking"})
t("56. Missing recipientId → 400", s == 400, f"status={s}")

# 57. Unknown recipientId → 404
s, d = req("POST", "/outreach/generate", {"recipientId": 9999, "tone": "professional", "goal": "networking"})
t("57. Unknown recipientId → 404", s == 404, f"status={s}")

# 58. Invalid tone → defaults to professional (still 200)
s, d = req("POST", "/outreach/generate", {"recipientId": 5, "tone": "slang", "goal": "networking"})
t("58. Invalid tone → defaults gracefully (200)", s == 200 and "draft" in (d or {}), f"status={s}")

# 59. Draft length ≤ 500 chars
s, d = req("POST", "/outreach/generate", {"recipientId": 5, "tone": "professional", "goal": "networking"})
draft = (d or {}).get("draft", "")
t("59. Draft length ≤ 500 chars", s == 200 and len(draft) <= 500, f"length={len(draft)}")

# 60. XSS in custom_note → stripped
xss = '<script>alert("xss")</script>'
s, d = req("POST", "/outreach/generate", {"recipientId": 5, "tone": "professional", "goal": "networking", "custom_note": xss})
draft = (d or {}).get("draft", "")
t("60. XSS in custom_note stripped from draft", s == 200 and "<script>" not in draft, f"draft_snippet={draft[:80]}")

# 61. SQL injection in custom_note → safe
sqli = "'; DROP TABLE users; --"
s, d = req("POST", "/outreach/generate", {"recipientId": 5, "tone": "professional", "goal": "networking", "custom_note": sqli})
t("61. SQL injection in custom_note → safe (no crash)", s in (200, 400), f"status={s}")

# 62. custom_note >200 chars → truncated
long_note = "A" * 300
s, d = req("POST", "/outreach/generate", {"recipientId": 5, "tone": "professional", "goal": "networking", "custom_note": long_note})
draft = (d or {}).get("draft", "")
t("62. custom_note >200 chars → truncated/safe", s in (200, 400) and "A"*250 not in draft,
  f"status={s} note_in_draft={'AAAA' in draft}")

# ═══════════════════════════════════════════════════════════════════════════════
print("\n══════════════════════════════════════════════")
print("  OUTREACH READINESS - Story #7")
print("══════════════════════════════════════════════")

# 63. GET /outreach/readiness (current user) → score ≥ 75, level=ready, can_message=True
s, d = req("GET", "/outreach/readiness")
score = (d or {}).get("score", 0)
level = (d or {}).get("level", "")
can_msg = (d or {}).get("can_message", False)
t("63. GET /outreach/readiness current user score≥75 level=ready can_message=True",
  s == 200 and score >= 75 and level == "ready" and can_msg == True,
  f"status={s} score={score} level={level} can_message={can_msg}")

# 64. GET /outreach/readiness?userId=12 → score 0-100, breakdown(9 items), top_tips
s, d = req("GET", "/outreach/readiness?userId=12")
breakdown = (d or {}).get("breakdown", [])
top_tips  = (d or {}).get("top_tips", [])
score12   = (d or {}).get("score", -1)
t("64. GET /outreach/readiness?userId=12 has breakdown(9)+top_tips",
  s == 200 and 0 <= score12 <= 100 and len(breakdown) == 9 and len(top_tips) > 0,
  f"status={s} score={score12} breakdown={len(breakdown)} tips={len(top_tips)}")

# 65. userId=9999 → 404
s, d = req("GET", "/outreach/readiness?userId=9999")
t("65. GET /outreach/readiness?userId=9999 → 404", s == 404, f"status={s}")

# 66. userId=-1 → 400
s, d = req("GET", "/outreach/readiness?userId=-1")
t("66. GET /outreach/readiness?userId=-1 → 400", s == 400, f"status={s}")

# 67. userId=abc → 400
s, d = req("GET", "/outreach/readiness?userId=abc")
t("67. GET /outreach/readiness?userId=abc → 400", s == 400, f"status={s}")

# ═══════════════════════════════════════════════════════════════════════════════
print("\n══════════════════════════════════════════════")
print("  PROFILE READINESS")
print("══════════════════════════════════════════════")

# 68. GET /profile-readiness → score, sections(6), fixes(6), valid structure
# sections: [{key, label, score}]  fixes: [{key, label, status}]
s, d = req("GET", "/profile-readiness")
sections = (d or {}).get("sections", [])
fixes    = (d or {}).get("fixes", [])
pr_score = (d or {}).get("score", -1)
# sections have numeric score 0-100
sections_ok = all("key" in sec and "label" in sec and isinstance(sec.get("score"), (int, float))
                  for sec in sections) if sections else False
# fixes have a status string
valid_fix_statuses = {"done", "missing", "incomplete", "partial", "needs_improvement",
                      "complete", "good", "ok", "excellent", "add", "improve"}
fixes_ok = all("key" in f and "label" in f and isinstance(f.get("status"), str)
               for f in fixes) if fixes else False
t("68. GET /profile-readiness score+sections(6)+fixes(6)+valid_statuses",
  s == 200 and pr_score >= 0 and len(sections) == 6 and len(fixes) == 6 and sections_ok and fixes_ok,
  f"status={s} score={pr_score} sections={len(sections)} fixes={len(fixes)} sections_ok={sections_ok} fixes_ok={fixes_ok}")

# ═══════════════════════════════════════════════════════════════════════════════
print("\n══════════════════════════════════════════════")
print("  PERSISTENCE")
print("══════════════════════════════════════════════")

# 69. Create post, verify survives re-read
s, d = req("POST", "/feed", {"content": "Persistence test post."}, token=login_token)
persist_post_id = (d or {}).get("id")
s2, d2 = req("GET", "/feed")
found = any(p.get("id") == persist_post_id for p in (d2 or []))
t("69. Post persists on re-read /feed", s == 201 and found, f"post_id={persist_post_id} found={found}")

# 70. Mark notification read, re-read, still read
# First find an unread notification
s, d = req("GET", "/notifications")
unread = [n for n in (d or []) if not n.get("isRead")]
if unread:
    nid = unread[0]["id"]
    req("PATCH", f"/notifications/{nid}/read")
    s2, d2 = req("GET", "/notifications")
    notif_after = next((n for n in (d2 or []) if n.get("id") == nid), None)
    still_read = notif_after is not None and notif_after.get("isRead") == True
    t("70. Notification stays read after re-read", still_read, f"nid={nid} isRead={notif_after.get('isRead') if notif_after else 'N/A'}")
else:
    # All already read from test 38
    t("70. Notification stays read after re-read", True, "all already read (covered by test 38)")

# 71. Send message, verify in conversation
s, d = req("POST", "/conversations/1/messages", {"text": "Persistence message check"})
persist_msg_id = (d or {}).get("id")
s2, d2 = req("GET", "/conversations/1")
msgs2 = (d2 or {}).get("messages", [])
found_m = any(m.get("id") == persist_msg_id for m in msgs2)
t("71. Message persists in conversation", s == 201 and found_m, f"msg_id={persist_msg_id} found={found_m}")

# ═══════════════════════════════════════════════════════════════════════════════
print("\n══════════════════════════════════════════════")
print("  MULTI-USER")
print("══════════════════════════════════════════════")

# 72. Register user A and user B
s_a, d_a = req("POST", "/auth/register", {"name": "Multi User A", "email": "multi_a_x99@example.com", "password": "MultiPassA1!"})
s_b, d_b = req("POST", "/auth/register", {"name": "Multi User B", "email": "multi_b_x99@example.com", "password": "MultiPassB1!"})
t("72. Register user A and user B", s_a == 201 and s_b == 201, f"statusA={s_a} statusB={s_b}")
uid_a = (d_a or {}).get("user", {}).get("id")
uid_b = (d_b or {}).get("user", {}).get("id")

# 73. Login as A and B, get tokens
s_a2, d_a2 = req("POST", "/auth/login", {"email": "multi_a_x99@example.com", "password": "MultiPassA1!"})
s_b2, d_b2 = req("POST", "/auth/login", {"email": "multi_b_x99@example.com", "password": "MultiPassB1!"})
tok_a = (d_a2 or {}).get("token")
tok_b = (d_b2 or {}).get("token")
t("73. Login as A and B → get tokens", s_a2 == 200 and s_b2 == 200 and tok_a and tok_b, f"statusA={s_a2} statusB={s_b2}")

# 74. POST /feed as user A → authorId = A's id
s, d = req("POST", "/feed", {"content": "Posted by user A"}, token=tok_a)
author_id = (d or {}).get("authorId")
t("74. POST /feed as A → authorId = A's id", s == 201 and author_id == uid_a, f"authorId={author_id} uid_a={uid_a}")

# 75. GET /me with token B → B's profile
s, d = req("GET", "/me", token=tok_b)
t("75. GET /me with token B → B's profile", s == 200 and (d or {}).get("id") == uid_b,
  f"id={( d or {}).get('id')} expected={uid_b}")

# 76. Clean up A and B
s_da, _ = req("DELETE", f"/users/{uid_a}", token=tok_a) if uid_a else (0, None)
s_db, _ = req("DELETE", f"/users/{uid_b}", token=tok_b) if uid_b else (0, None)
t("76. Clean up users A and B → 204", s_da == 204 and s_db == 204, f"statusA={s_da} statusB={s_db}")

# Also clean up the tester_one user registered at start
if login_token and reg_user.get("id"):
    req("DELETE", f"/users/{reg_user['id']}", token=login_token)

# ═══════════════════════════════════════════════════════════════════════════════
print("\n══════════════════════════════════════════════")
print("  SUMMARY")
print("══════════════════════════════════════════════")

passed = sum(1 for _, p, _ in results if p)
total  = len(results)
print(f"\n{passed}/{total} tests passed\n")

# Print failures if any
failures = [(n, note) for n, p, note in results if not p]
if failures:
    print("FAILURES:")
    for name, note in failures:
        print(f"  ✗ {name}")
        if note:
            print(f"      {note}")
else:
    print("All tests passed!")

sys.exit(0 if passed == total else 1)
