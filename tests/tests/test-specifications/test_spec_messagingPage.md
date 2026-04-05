# Test Specification Document — MessagingPage.js
**Framework:** Jest + React Testing Library | **Target Coverage:** ≥ 80% | **Updated Version**

---

## Test Type Legend

| Type | Name | What it means in this file |
|------|------|---------------------------|
| BB | Black Box | Tested using only inputs and expected outputs — no reading of internal code required. We treat the function as a sealed box. |
| WB | White Box | Written by reading the actual source code line by line and targeting every if/else branch, guard clause, try/catch, and return path we can see. |
| GB | Gray Box | Uses knowledge of internal thresholds to design boundary inputs (e.g. testing at length 34 and 35 around a known threshold of 35). |
| EP | Equivalence Partitioning | Inputs are grouped into buckets that produce identical behavior. One representative test per bucket — no need to test every value in the group. |
| RG | Regression | Protects a specific edge case or past bug from silently reappearing after future code changes. |

---

## 1. Purpose

This document defines the unit-test specification for `MessagingPage.js`. Every test was verified line-by-line against the actual source code. No test covers functionality that does not exist. No two tests are duplicates or significantly overlapping. Gray box boundary tests have been added for all numeric thresholds in `mockBackendGetProfileReadiness`. All external dependencies are mocked.

**FeedPage.js is excluded from mutation testing and has no tests in this suite.**

Target: ≥ 80% mutation score on `MessagingPage.js`.

---

## 2. Functions Under Test

| Function | Description |
|----------|-------------|
| `MessagingPage()` | Main component. Fetches conversations via useFetch. Auto-selects first conversation. Marks messages read on mount. Scrolls to bottom on message change. |
| `selectConversation(id)` | Sets selectedId and msgLoading:true. Calls API.getConversation(id). On success: sets messages from data.messages (defaults []). On failure: sets messages to []. |
| `sendMessage()` | Guard: returns if draft.trim() falsy OR selectedId null. Clears draft, appends optimistic message, calls API.sendMessage. On failure: showToast error. |
| `openProfileReadiness()` | Toggles activePanel 'score'/null via functional setState. Checks stale activePanel: if was 'score', returns early. Otherwise calls loadProfileReadiness({refresh:false}). |
| `loadProfileReadiness({ refresh })` | Sets readinessLoading:true. Try: API call, sets readiness, optional toast. Catch: mock fallback, sets error, optional toast. Finally: readinessLoading:false. |
| `openOutreachGuide()` | Toggles activePanel 'guide'/null. Returns if selectedId null. Initializes fresh guide state for conversation if none exists. |
| `setGuideState(patch)` | No-op if selectedId null. Shallow-merges patch into guideStateByConv[selectedId]. |
| `setGuideDetailsPatch(patch)` | No-op if selectedId null. Deep-merges patch into details sub-object of guideStateByConv[selectedId]. |
| `computeGuidePreview(state)` | Returns '' if state null, goal falsy, or no templates. Otherwise calls template(state.details \|\| {}) at variantIdx % variants.length. |
| `selectGoal(goalKey)` | Sets goal=goalKey, step=2, variantIdx=0. Computes and stores preview. Calls setGuideState. |
| `nextStep()` | No state → no-op. Step1+no goal → toast. Step1+goal → step 2. Step2 → step 3 + preview. Step3 → falls through silently. |
| `backStep()` | No state → no-op. step > 1 → decrements. step === 1 → nothing (condition false). |
| `cycleVariant()` | No state/goal → no-op. No templates → no-op. Advances variantIdx with modulo, recomputes preview. |
| `updateGuidePreviewManual(value)` | No state → no-op. Otherwise calls setGuideState({preview: value}). |
| `applyGuideMessage()` | No state → no-op. Empty/whitespace preview → info toast. Otherwise sets draft, success toast, closes panel. |
| `mockBackendGetProfileReadiness(user, opts)` | Pure function. Builds 6 sections. Applies jitter if opts.jitter. Clamps scores. Evaluates headline/about/skills thresholds for fix statuses. Returns {score, sections, fixes}. |
| `ProfileReadinessPanel` | Renders score ring, status label, section bars, fix list based on score thresholds (≥80 good, ≥70 warn, else bad). |
| `OutreachGuidePanel` | Renders step 1/2/3 content, tips panel, selected goal class, tone/variant label, navigation buttons. |

---

## 3. Unit Test Specification Table

### MessagingPage Component Tests

| # | Function | Test Purpose | Input / Setup | Expected Output | Type |
|---|----------|-------------|---------------|-----------------|------|
| 1 | MessagingPage() | Shows loading spinner while conversations fetch | useFetch returns { loading:true, data:null } | LoadingSpinner with 'Loading messages...' rendered | BB |
| 2 | MessagingPage() | Renders participant name when conversations load | useFetch returns [{ id:1, participantName:'Alice' }] | 'Alice' appears in DOM | BB |
| 3 | MessagingPage() | Auto-selects first conversation when selectedId is null | conversations=[{id:1},{id:2}], no prior selection | API.getConversation called with id 1 | WB |
| 4 | MessagingPage() | Does not auto-select if selectedId already set | selectedId='2' before conversations load | API.getConversation not called again | WB |
| 5 | MessagingPage() | Calls setUnreadMessages(0) once on mount | Component mounts | setUnreadMessages called exactly once with 0 | WB |
| 6 | MessagingPage() | Scrolls to bottom when messages state changes | messages state updated | scrollIntoView({ behavior:'smooth' }) called | WB |
| 7 | selectConversation(id) | Sets selectedId immediately on call | Click Bob conversation | selectedId === Bob's id, heading shows 'Bob' | WB |
| 8 | selectConversation(id) | Sets msgLoading:true before API resolves | Call selectConversation before promise resolves | 'Loading conversation…' visible before resolve | WB |
| 9 | selectConversation(id) | Sets messages from data.messages on success | API resolves { messages:[{id:99,text:'Secret Message'}] } | 'Secret Message' appears in DOM | WB |
| 10 | selectConversation(id) | Defaults to [] when data.messages is absent | API resolves {} (no messages key) | messages===[], msgLoading:false | RG |
| 11 | selectConversation(id) | Sets messages to [] on API rejection | API.getConversation rejects | messages===[], msgLoading:false | WB |
| 12 | sendMessage() | No-op for empty string — EP bucket: invalid draft | draft='', selectedId='conv1' | API.sendMessage not called | EP |
| 13 | sendMessage() | No-op for whitespace only — EP bucket: invalid draft | draft='   ', selectedId='conv1' | API.sendMessage not called | EP |
| 14 | sendMessage() | No-op when selectedId is null — EP bucket: no target | draft='Hello', selectedId=null | API.sendMessage not called | EP |
| 15 | sendMessage() | Clears draft state before API call | draft='Hello', selectedId='conv1' | draft==='' after function runs | WB |
| 16 | sendMessage() | Appends optimistic message with correct shape | draft='Hello', selectedId='conv1' | messages includes { text:'Hello', isMe:true } | WB |
| 17 | sendMessage() | Sends trimmed text to API — not raw draft | draft=' Hello ', selectedId='conv1' | API.sendMessage called with 'Hello' not ' Hello ' | RG |
| 18 | sendMessage() | Calls showToast on API rejection | API.sendMessage rejects | showToast('Failed to send message', 'error') called | WB |
| 19 | openProfileReadiness() | Sets activePanel to 'score' when null | activePanel=null | activePanel becomes 'score', loadProfileReadiness called | WB |
| 20 | openProfileReadiness() | Sets activePanel to null when was 'score' (toggle off) | activePanel='score' | activePanel becomes null, loadProfileReadiness NOT called again | RG |
| 21 | loadProfileReadiness() | Sets readinessLoading:true at start | Call loadProfileReadiness({refresh:false}) | 'Calculating score…' visible before await resolves | WB |
| 22 | loadProfileReadiness() | Sets readiness from API on success | API resolves { score:85, sections:[], fixes:[] } | '85' in DOM, loading gone | BB |
| 23 | loadProfileReadiness() | No showToast when refresh:false and API succeeds | API resolves, refresh:false | showToast not called | WB |
| 24 | loadProfileReadiness() | showToast 'Score refreshed' when refresh:true + success | API resolves, refresh:true | showToast('Score refreshed', 'success') called | WB |
| 25 | loadProfileReadiness() | Uses mock fallback and sets readinessError on failure | API.getProfileReadiness rejects | error message visible, readiness set to mock | WB |
| 26 | loadProfileReadiness() | showToast 'Score refreshed (mock)' when refresh:true + failure | API rejects, refresh:true | showToast('Score refreshed (mock)', 'info') called | WB |
| 27 | loadProfileReadiness() | readinessLoading:false in finally on success | API resolves | 'Calculating score…' gone after completion | RG |
| 28 | loadProfileReadiness() | readinessLoading:false in finally on failure | API rejects | 'Calculating score…' gone after completion | RG |
| 29 | openOutreachGuide() | Toggles activePanel to 'guide' when null | activePanel=null, selectedId set | guide panel visible, score panel not | WB |
| 30 | openOutreachGuide() | Toggles activePanel to null when was 'guide' | activePanel='guide', selectedId set | guide panel closes | WB |
| 31 | openOutreachGuide() | Returns without touching guideState when selectedId null | selectedId=null | guideStateByConv unchanged, panel not shown | WB |
| 32 | openOutreachGuide() | Initializes fresh state for new conversation | selectedId='conv1', no existing state | step 1 goal selection shown | WB |
| 33 | openOutreachGuide() | Does not overwrite existing guide state | selectedId='conv1', existing state at step 2 | step 2 still shown on reopen | WB |
| 34 | setGuideState(patch) | No-op when selectedId is null | selectedId=null | guideStateByConv unchanged | WB |
| 35 | setGuideState(patch) | Shallow-merges patch, preserves other keys | existing { step:1, goal:null }, patch={ step:2 } | step===2, goal still preserved | WB |
| 36 | setGuideDetailsPatch(patch) | No-op when selectedId is null | selectedId=null | guideStateByConv unchanged | WB |
| 37 | setGuideDetailsPatch(patch) | Deep-merges into details only, preserves other detail fields | existing details={ recipient:'', field:'CS' }, patch={ recipient:'Alice' } | recipient==='Alice', field still==='CS' | WB |
| 41 | computeGuidePreview (via UI) | Returns filled template for valid goal and details | goal='advice', details={ recipient:'Frank' } | String containing 'Frank' and template phrase | BB |
| 42 | cycleVariant() | Uses variantIdx modulo to wrap around variants | goal='advice', cycle through 2 variants | v1→v2→v1 text cycle | WB |
| 43 | selectGoal(goalKey) | Sets goal, resets step:2 and variantIdx:0 | Existing variantIdx=1, select new goal | variantIdx reset to 0, v1 of 2 shown | WB |
| 44 | selectGoal(goalKey) | Computes and stores non-empty preview after goal set | goalKey='followup' | preview non-empty, length > 12 | BB |
| 45 | nextStep() | No-op when no guide state for selectedId | guideStateByConv={} | Step 1 stays, no advance | WB |
| 46 | nextStep() | Step1 + no goal: shows info toast, step unchanged | step=1, goal=null | showToast('Pick a goal to continue', 'info'), step still 1 | WB |
| 47 | nextStep() | Step1 + goal: advances step to 2 | step=1, goal='advice' | step becomes 2, personalize form shown | WB |
| 48 | nextStep() | Step2: advances to step 3 and computes preview | step=2, goal='advice' | step becomes 3, textarea shown | WB |
| 49 | nextStep() | Step3: falls through silently, no state change | step=3, goal='advice' | 'Done' button shown, no 'Next →' | WB |
| 51 | backStep() | Decrements step when step > 1 | step=2 | step becomes 1, goal selection shown | WB |
| 52 | backStep() | Does nothing when step is already 1 | step=1 | Back button hidden (visibility:hidden) | WB |
| 56 | cycleVariant() | Advances variantIdx by 1 | goal='advice', variantIdx=0 (2 templates) | variantIdx becomes 1, 'v2 of 2' shown | WB |
| 57 | cycleVariant() | Wraps variantIdx to 0 at last template | goal='advice', variantIdx=1 | variantIdx becomes 0, 'v1 of 2' shown | WB |
| 58 | cycleVariant() | Recomputes preview after cycling | goal='advice', details={ recipient:'Dave' } | preview updated, contains 'Dave', differs from v0 | WB |
| 59 | updateGuidePreviewManual(v) | No-op when no guide state | selectedId=null | textarea not in DOM | WB |
| 60 | updateGuidePreviewManual(v) | Sets preview to the exact string provided | value='My custom message' | preview === 'My custom message' | BB |
| 61 | applyGuideMessage() | No-op when no guide state | selectedId=null | 'Use this message →' not in DOM | WB |
| 62 | applyGuideMessage() | Info toast when preview is empty string | preview='' | showToast('Nothing to insert yet', 'info') | EP |
| 63 | applyGuideMessage() | Info toast when preview is whitespace only | preview='   ' | showToast('Nothing to insert yet', 'info'), draft unchanged | EP |
| 64 | applyGuideMessage() | Sets draft to trimmed preview on success | preview='  Hello world  ' | draft === 'Hello world' | WB |
| 65 | applyGuideMessage() | Shows success toast and closes panel | preview='Hello Custom' | showToast success called, panel closed | WB |
| CX1 | MessagingPage() | Search box filters conversation list (case-insensitive) | search='ali', data has 'Alice' and 'Bob' | Alice visible, Bob hidden | WB |
| CX2 | MessagingPage() | Write button triggers toast | Click 'Write' | showToast('New message — coming soon') | WB |
| CX3 | MessagingPage() | Settings button triggers toast | Click 'Settings' | showToast('Settings — coming soon') | WB |
| CX4 | MessagingPage() | Enter key in composer triggers sendMessage | keyDown Enter in input with text | API.sendMessage called with trimmed text | WB |
| CX5 | openOutreachGuide() | Guide close button sets activePanel to null | Click ✕ in guide panel | Guide panel closed | WB |
| CX6 | openProfileReadiness() | Score panel close button sets activePanel to null | Click ✕ in score panel | Score panel closed | WB |
| CX7 | openProfileReadiness() | 'Continue messaging' button closes score panel | Click 'Continue messaging' | Score panel closed | WB |
| CX8 | selectGoal() | Keyboard Enter on goal tile selects the goal | keyDown Enter on 'Job / Internship' tile | step advances to 2 | WB |
| CX9 | selectConversation() | Renders sent message (isMe:true) | API resolves with isMe:true message | Message text in DOM | WB |
| CX10 | MessagingPage() | formatTime called with message timestamp | API resolves with timestamp | formatTime called with exact timestamp value | WB |
| E1 | sendMessage() | No-op when draft empty AND selectedId null | Both conditions false | API.sendMessage not called | EP |
| E2 | selectConversation() | Reloads messages even if same ID clicked twice | Click same conv twice | API.getConversation called both times | RG |
| E3 | openOutreachGuide() | Switches from score panel to guide panel | activePanel='score', click guide | score panel gone, guide panel open | WB |
| E6 | nextStep() | Advances to step 3 from step 2 | On step 2, click Next | step 3 shown, step 2 gone | WB |
| E7 | applyGuideMessage() | Info toast when preview is only whitespace | preview='   ' | showToast('Nothing to insert yet', 'info') | EP |

### ProfileReadinessPanel Score Threshold Tests

| # | Function | Test Purpose | Input / Setup | Expected Output | Type |
|---|----------|-------------|---------------|-----------------|------|
| M1 | ProfileReadinessPanel | score exactly 80 → label 'Ready' | score=80 | 'Ready' in DOM, not 'Almost there' | WB |
| M2 | ProfileReadinessPanel | score 79 → label 'Almost there' | score=79 | 'Almost there' in DOM, not 'Ready' | WB |
| M3 | ProfileReadinessPanel | score exactly 70 → label 'Almost there' | score=70 | 'Almost there' in DOM, not 'Needs improvement' | WB |
| M4 | ProfileReadinessPanel | score 69 → label 'Needs improvement' | score=69 | 'Needs improvement' in DOM | WB |
| M5 | ProfileReadinessPanel | score 0 → label 'Needs improvement' | score=0 | 'Needs improvement' in DOM | WB |
| M6 | ProfileReadinessPanel | score 100 → label 'Ready' | score=100 | 'Ready' in DOM | WB |
| M7 | ProfileReadinessPanel | fix status 'done' renders 'Done' label | fixes=[{status:'done'}] | 'Done' in DOM, not 'Fix' | WB |
| M8 | ProfileReadinessPanel | fix status 'bad' renders 'Fix' label | fixes=[{status:'bad'}] | 'Fix' in DOM, not 'Done' | WB |
| M9 | ProfileReadinessPanel | section bars render correct percentage labels | sections with scores 90/70/50 | '90%', '70%', '50%' in DOM | WB |
| M10 | openProfileReadiness() | Does not reload score when panel already open (toggle off) | Click score btn twice | API.getProfileReadiness called once, not twice | WB |
| M11 | MessagingPage() | Search 'ALI' matches 'alice' — both sides lowercased | participantName='ALICE', search='alice' | ALICE shown, bob hidden | WB |
| M12 | MessagingPage() | Search 'BOB' matches 'bob' — search query lowercased | participantName='bob', search='BOB' | bob shown, Alice hidden | WB |
| M13 | useEffect (preview sync) | Preview auto-updates when details change on step 2 | Change recipient on step 2, advance | textarea contains new name | WB |
| M14 | useEffect (preview sync) | Preview auto-updates after going back and changing details | Change recipient after back, advance to step 3 | textarea contains updated name | WB |
| M15 | OutreachGuidePanel | Step 1 shows goal selection, not steps 2 or 3 | On step 1 | goal tiles visible, personalize/review not shown | WB |
| M16 | OutreachGuidePanel | Step 2 shows personalize form after goal selected | After selecting goal | personalize form visible, not step 1 or 3 | WB |
| M17 | OutreachGuidePanel | Step 3 shows review after next from step 2 | After next on step 2 | review/textarea visible, not step 1 or 2 | WB |
| M18 | OutreachGuidePanel | Selected goal tile has 'selected' class, others do not | Select 'Job / Internship', go back | job tile has 'selected', advice tile does not | WB |
| M19 | OutreachGuidePanel | Shows tips after goal selected, placeholder before | Open guide, then select goal | tips shown after selection | WB |
| M20 | OutreachGuidePanel | Shows 'Done' on step 3, not 'Next →' | On step 3 | 'Done' button present, 'Next →' absent | WB |
| M21 | cycleVariant() | Single-variant goal wraps back to same text | goal='mentor' (1 variant), cycle | text unchanged, 'v1 of 1' stays | WB |
| M22 | openOutreachGuide() | Switching from score to guide closes score | activePanel='score', click guide | score closed, guide open, API not called again | WB |
| M23 | MessagingPage() | Conversation with no participantName renders 'Unknown' | data=[{id:1}] no participantName | 'Unknown' in DOM | BB |
| M24 | ProfileReadinessPanel | Renders 'No score available' when readiness null | API resolves null | 'No score available.' in DOM | BB |
| M25 | ProfileReadinessPanel | window.location.hash set to '#profile' by 'Go to profile' | Click all 'Go to profile' buttons | window.location.hash === '#profile' | WB |

### mockBackendGetProfileReadiness Pure Function Tests

| # | Function | Test Purpose | Input / Setup | Expected Output | Type |
|---|----------|-------------|---------------|-----------------|------|
| 66 | mockBackendGetProfileReadiness() | Returns object with keys: score, sections, fixes | user={}, opts={} | Exactly 3 keys | BB |
| 67 | mockBackendGetProfileReadiness() | Score is clamped 0–100 | user={}, opts={} | 0 <= score <= 100 | BB |
| 68 | mockBackendGetProfileReadiness() | Returns exactly 6 sections with correct keys | user={}, opts={} | sections.length===6, keys: photo/headline/about/exp/edu/skills | BB |
| 69 | mockBackendGetProfileReadiness() | Base scores exact without jitter | user={}, opts={ jitter:false } | [67,42,30,60,90,55] | WB |
| 70 | mockBackendGetProfileReadiness() | Handles null user without throwing — EP bucket | user=null, opts={} | Returns valid {score,sections,fixes}, no error | EP |
| 71 | mockBackendGetProfileReadiness() | GB boundary: headline length 34 — stays 'bad' | headline='x'.repeat(34) | headline fix status === 'bad' | GB |
| 72 | mockBackendGetProfileReadiness() | GB boundary: headline length 35 — upgrades to 'warn' | headline='x'.repeat(35) | headline fix status === 'warn' | GB |
| 73 | mockBackendGetProfileReadiness() | GB boundary: headline length 54 — stays 'warn' | headline='x'.repeat(54) | headline fix status === 'warn' | GB |
| 74 | mockBackendGetProfileReadiness() | GB boundary: headline length 55 — upgrades to 'done' | headline='x'.repeat(55) | headline fix status === 'done' | GB |
| 75 | mockBackendGetProfileReadiness() | GB boundary: about length 119 — stays 'bad' | about='x'.repeat(119) | about fix status === 'bad' | GB |
| 76 | mockBackendGetProfileReadiness() | GB boundary: about length 120 — upgrades to 'warn' | about='x'.repeat(120) | about fix status === 'warn' | GB |
| 77 | mockBackendGetProfileReadiness() | GB boundary: about length 169 — stays 'warn' | about='x'.repeat(169) | about fix status === 'warn' | GB |
| 78 | mockBackendGetProfileReadiness() | GB boundary: about length 170 — upgrades to 'done' | about='x'.repeat(170) | about fix status === 'done' | GB |
| 79 | mockBackendGetProfileReadiness() | GB boundary: skillCount 7 — stays 'warn' | skills=Array(7).fill('s') | skills fix status === 'warn' | GB |
| 80 | mockBackendGetProfileReadiness() | GB boundary: skillCount 8 — upgrades to 'done' | skills=Array(8).fill('s') | skills fix status === 'done' | GB |
| 81 | mockBackendGetProfileReadiness() | EP bucket: skills is non-array truthy — skillCount is 1 | skills='JavaScript' | skills fix NOT 'done' | EP |
| E8 | mockBackendGetProfileReadiness() | EC: skills is 0 (falsy number) → count is 0 | skills=0 | skills fix === 'warn', not 'done' | EP |
| E9 | mockBackendGetProfileReadiness() | EC: all thresholds met simultaneously → all 'done' | headline≥55, about≥170, skills≥8 | headline/about/skills all 'done' | EP |
| E10 | mockBackendGetProfileReadiness() | EC: empty string skills → count is 0 | skills='' | skills fix === 'warn' | EP |
| M26 | mockBackendGetProfileReadiness() | Score equals average of section scores (not sum) | user={}, jitter:false | score===57, not 344 | WB |
| M27 | mockBackendGetProfileReadiness() | photo fix boundary: score 57 < 60 → status 'warn' | user={}, jitter:false | photo.status==='warn', not 'done' | WB |
| M28 | mockBackendGetProfileReadiness() | Jitter range is ±2: stays close to base values | jitter:true, 20 runs | all section scores within ±2 of base | WB |
| M29 | mockBackendGetProfileReadiness() | Education fix always 'done' by default | user={}, jitter:false | edu.status==='done' | WB |
| M30 | mockBackendGetProfileReadiness() | Experience fix always 'warn' by default | user={}, jitter:false | exp.status==='warn' | WB |
| M31 | mockBackendGetProfileReadiness() | Returns exactly 6 fixes with expected keys in order | user={}, jitter:false | fixes keys: photo/headline/about/skills/exp/edu | WB |

### computeGuidePreview Pure Function Tests

| # | Function | Test Purpose | Input / Setup | Expected Output | Type |
|---|----------|-------------|---------------|-----------------|------|
| 38 | computeGuidePreview() | Returns '' when state is null | null | '' | BB |
| 39 | computeGuidePreview() | Returns '' when state.goal is falsy | { goal:null } | '' | BB |
| 40 | computeGuidePreview() | Returns '' when goal has no templates | { goal:'nonexistent' } | '' | BB |
| E4 | computeGuidePreview() | state.details undefined → uses empty object fallback | { goal:'advice', variantIdx:0 } | Contains '[Name]', non-empty | EP |
| E5 | computeGuidePreview() | variantIdx exactly 0 → returns first template output | { goal:'advice', variantIdx:0, details:{ recipient:'Bob' } } | Contains 'Hi Bob' | EP |
| T1 | computeGuidePreview() | variantIdx 1 returns second template, distinct from first | goal='advice', compare v0 vs v1 | v0 ≠ v1, both contain recipient | WB |
| T2 | computeGuidePreview() | Large variantIdx wraps correctly via modulo | variantIdx=99, 2 templates | Same as 99 % 2 | WB |
| T3 | computeGuidePreview() | advice v1: uses all fallback placeholders when empty | goal='advice', v0, details={} | Contains '[Name]', '[your name/major]', '[their field]' | BB |
| T4 | computeGuidePreview() | advice v1: uses all provided details, no fallbacks | goal='advice', v0, full details | Contains names, no '[Name]' etc. | BB |
| T5 | computeGuidePreview() | advice v2: uses '[Name]', '[your name]', '[field]' fallbacks | goal='advice', v1, details={} | Contains fallback placeholders | BB |
| T6 | computeGuidePreview() | job v1: uses '[role]', '[Company]', '[skill/area]' fallbacks | goal='job', v0, details={} | Contains all job fallback placeholders | BB |
| T7 | computeGuidePreview() | job v1: uses all provided details, no fallbacks | goal='job', v0, full details | Contains provided values, no placeholders | BB |
| T8 | computeGuidePreview() | job v2: uses '[Company]' and '[field]' fallbacks | goal='job', v1, details={} | Contains job v2 fallback placeholders | BB |
| T9 | computeGuidePreview() | network v1: uses fallback placeholders when empty | goal='network', v0, details={} | Contains '[Name]', '[your name/major]', '[field]' | BB |
| T10 | computeGuidePreview() | network v1: uses provided details, no fallbacks | goal='network', v0, full details | Contains provided values | BB |
| T11 | computeGuidePreview() | network v2: professional tone uses fallbacks | goal='network', v1, details={} | Contains fallback placeholders | BB |
| T12 | computeGuidePreview() | mentor: uses fallback placeholders when empty | goal='mentor', v0, details={} | Contains '[Name]', '[your name/major]', '[field]' | BB |
| T13 | computeGuidePreview() | mentor: uses provided details, no fallbacks | goal='mentor', v0, full details | Contains provided values | BB |
| T14 | computeGuidePreview() | followup: uses '[topic]' and 'recently' fallbacks | goal='followup', v0, details={} | Contains '[topic]', 'recently' | BB |
| T15 | computeGuidePreview() | followup: uses provided context and field, no fallbacks | goal='followup', v0, full context | Contains context values, no '[topic]' | BB |
| T16 | computeGuidePreview() | referral: uses all fallback placeholders when empty | goal='referral', v0, details={} | Contains all 5 referral placeholders | BB |
| T17 | computeGuidePreview() | referral: uses all provided details, no fallbacks | goal='referral', v0, full details | Contains all provided values, no placeholders | BB |
| T18 | computeGuidePreview() | All goals and all variants produce non-empty output | Loop all goals × all variants | Every result is non-empty string | BB |

---

## 4. Mocking Strategy

| Dependency | Mock Approach |
|-----------|---------------|
| AppContext | Wrap in test context provider. jest.fn() for showToast and setUnreadMessages. currentUser as plain object. |
| useFetch | jest.mock() returning controllable { data, loading, error } per test. |
| API.getConversation | jest.fn() — Promise.resolve({messages:[...]}) or Promise.reject() per test. |
| API.sendMessage | jest.fn() — resolved for happy path, rejected for error toast test. |
| API.getProfileReadiness | jest.fn() — resolved with mock data or rejected to trigger fallback. |
| mockBackendGetProfileReadiness | Tested as a pure standalone function — no mocking needed. |
| _OUTREACH_TEMPLATES | Real templates used directly in computeGuidePreview tests — pure function. |
| scrollIntoView | jest.fn() assigned via window.HTMLElement.prototype.scrollIntoView. |

---

## 5. Coverage Notes

Tests 1–E7 cover all 16 original functions across every execution branch. Tests M1–M31 target surviving mutants identified via Stryker mutation testing, specifically:

- **Score threshold mutations** (L587/588/647): ProfileReadinessPanel `>= 80`, `>= 70` boundaries tested at 80, 79, 70, 69, 0, 100
- **Fix status rendering** (L671): `status === 'done'` vs `'bad'`/`'warn'` branch
- **Search toLowerCase** (L262): Both sides of case-insensitive comparison tested
- **Template fallback strings** (L806–L849): All `||` fallback placeholders tested with and without provided values for all 6 goals
- **Arithmetic in mockBackend** (L713/723/725): Jitter ±2 range, score = average not sum
- **photo fix boundary** (L728): score >= 60 threshold
- **useEffect preview sync** (L243/249/252): step 2 and step 3 conditions
- **Step dot indicators** (L470/472/474): step === 1/2/3 content visibility

**FeedPage.js NoCoverage mutants are intentionally excluded** — FeedPage.js is not in the `mutate` list and has no tests in this suite.

Target: ≥ 80% mutation score on MessagingPage.js.