# DSA Practice Module — Complete Build Plan
> Module path: `apps/main/app/(main)/practice/dsa/`
> Actions: `apps/main/actions/(main)/practice/`
> Schema: `packages/prisma/schema/practice.prisma`
> Worker: `apps/coderzworker/` (Docker-based code execution)
> Last updated: April 2026

---

## What This Module Does

The DSA module lets students practice data structures & algorithms using a **Socratic AI method** combined with **spaced repetition**. Instead of just submitting code and seeing pass/fail, the student:
1. Picks a problem from a pattern-based library (Arrays, Sliding Window, Trees, DP, etc.)
2. Opens a workspace where the AI first asks them to explain their approach
3. The student explains (via voice or text), the AI challenges their thinking ("What if n = 10^6?")
4. Student writes code → CoderzWorker executes it → AI evaluates output + code together
5. AI gives Socratic feedback ("You passed 4/5 cases — what's the edge case you're missing?")
6. If brute force: AI pushes for optimal ("Good, but can you get to O(n log n)?")
7. After completion: problem is tracked with revision schedule (day 3, day 7, day 10)
8. On revision days: student gets notified and repeats the problem in a faster, tighter session

This is the only platform that combines: **voice explanation + AI Socratic questioning + compiler output evaluation + spaced repetition scheduling**. No competitor has this.

---

## Current State — What Is Already Built

### Pages
- `/practice/dsa` — Main DSA page. Shows today's plan (due revisions + new problems), user stats, pattern hierarchy, leaderboard.
- `/practice/dsa/[slug]` — Problem workspace. Code editor + chat panel + AI conversation.

### Key Actions (already implemented)
- `getDSATodayPlan()` — Calculates revision due + not started + remaining problems for today.
- `getDSAUserStats()` — Status breakdown: completed, in-progress, revision due, not started.
- `getDSAPatternHierarchy()` — Topic → pattern → sub-pattern tree.
- `getDSAProblemsWithFilters()` — Filtered problem list by pattern/sub-pattern/status.
- `addProblemToTracking()` / `removeProblemFromTracking()` — Add/remove from user's list.
- `markProblemDayComplete()` — Mark a revision day as done.
- `getDSATodayPlan()` — Returns due revisions + new problems for today's session.
- `getOrCreateSession()` — Creates/retrieves `PracticeUserSession` with starter code.
- `saveSessionProgress()` — Saves code, language, canvas, chat history.
- `updateSessionAfterAssess()` — Updates score, feedback, requirements met, marks completion.
- `getOrCreateDSAPhase()` — Gets current phase (phase 1: learning, phase 2: revision, phase 3: interview).
- `advanceDSASubPhase()` — Moves through sub-phases within a phase.
- `getScribeToken()` — ElevenLabs STT token for voice input.
- `generateTTSAudio()` — ElevenLabs TTS for AI responses (base64 mp3).

### Database Models (practice.prisma)
- `PracticeProblem` — Problem with slug, description, requirements, hints, starterCode per language, difficulty, tags, patterns.
- `PracticeUserSession` — User's session on a problem: code, language, attempts, bestScore, requirementsMet, chat history (JSON).
- `PracticeModuleProgress` — Module-level stats per user.
- `PracticeLeaderboard` — Per-module rankings.
- `DSAPattern` — Hierarchical pattern model: topic → pattern → sub-pattern.
- `UserDSAPreferences` — User's settings: problems per day, revision days ([3, 7, 10] or custom).
- `UserDSAProblemPhase` — Phase tracking per problem per user.
- `UserDSATrackingEntry` — Status (STARTED, FIRST_PASS_COMPLETE, REVISION_1_SCHEDULED, etc.), revision completion count, `nextDueAt` timestamp.
- `UserDSALearningProgress` — Pattern/sub-pattern completion tracking.

---

## What Needs to Be Built

### Phase A — The Workspace AI Conversation Loop (Most Critical Missing Piece)

The workspace (`/practice/dsa/[slug]`) has the code editor. What's missing is the **AI conversation panel** that does the Socratic coaching.

#### A1 — AI Conversation Panel Component

- [ ] **Create `dsa-ai-panel.tsx`** — A split-panel component within the workspace:
  - Left: Code editor (Monaco, already exists via `_components/workspace/practice-workspace.tsx`)
  - Right: AI conversation panel (similar to ChatGPT — scrollable message history, input at bottom)

- [ ] **Conversation flow states** — The panel has distinct phases:
  ```
  WAITING_FOR_EXPLANATION  → AI asks: "Describe your approach before coding."
  EXPLANATION_RECEIVED     → AI evaluates explanation, asks follow-up if incomplete
  BRUTE_FORCE_DETECTED     → AI accepts brute force, asks user to code it
  CODE_SUBMITTED           → AI waits for CoderzWorker result
  EVALUATING_OUTPUT        → AI receives output, gives Socratic feedback
  OPTIMAL_PUSH             → AI asks for better solution if brute force passed
  COMPLETED                → Problem solved, session scored
  ```

- [ ] **State management**: Use Zustand or React state to track which conversation phase we're in. The UI (input placeholder, button label, AI message content) should update based on current phase.

#### A2 — Voice Input for Explanation Phase

- [ ] **Microphone button** in the AI panel input area (for the explanation phase specifically).
- [ ] On click: calls `getScribeToken()` → opens ElevenLabs STT recorder → user speaks their approach → transcription comes back → shown as user message in the conversation.
- [ ] **Visual feedback**: Show recording indicator (pulsing red circle). Show transcription appearing as user speaks (real-time if ElevenLabs supports it, else after completion).
- [ ] After transcription: auto-send as user's explanation message.

#### A3 — AI Evaluation Action

- [ ] **Create `assess.action.ts`** `evaluateDSAApproach(sessionId, userMessage, phase, codeOutput?)`:
  - Takes the full conversation history + current phase + user's message.
  - If phase is `WAITING_FOR_EXPLANATION`: evaluate if the explanation is sufficient. If not, ask a follow-up. If brute force, accept and ask them to code it. If O(n²) for a problem that can be O(n), push gently.
  - If phase is `CODE_SUBMITTED`: run code through CoderzWorker (see A4). Pass output to AI.
  - If phase is `EVALUATING_OUTPUT`: take code + output + test results → give Socratic feedback. Which cases failed? What did they miss?
  - Returns `{ message: string, phase: ConversationPhase, isComplete: boolean, score?: number }`.

- [ ] **OpenAI system prompt per phase**:
  ```
  EXPLANATION phase: "You are a Socratic DSA mentor. The student is explaining their approach to [problem]. 
  Do NOT give them the answer. Ask clarifying questions. If they've described brute force, ask them 
  to code it and also think about whether it can be optimized. Evaluate completeness and correctness 
  of their thinking. Your response should be 1–3 sentences."
  
  OUTPUT phase: "The student's code produced the following output: [output]. 
  The expected output for the failing test case was: [expected]. 
  Do NOT tell them what's wrong. Ask them: 'What do you think is causing the difference?' 
  Hint progressively if they're stuck after 2 wrong guesses."
  
  OPTIMAL phase: "The student solved the problem in O(n²). The problem can be solved in O(n log n). 
  Ask them: 'What data structure could help reduce the inner loop?' 
  Do NOT tell them the answer — guide them through questions."
  ```

#### A4 — Code Execution via CoderzWorker

- [ ] **"Run Code" button** in the workspace → sends code + language to CoderzWorker.
  - POST `$NEXT_PUBLIC_WORKER_URL/api/v1/run` with `{ code, language, stdin: testInputs }`.
  - Show loading state: "Running your code..."
  - On success: show output panel below the code editor with stdout, stderr, execution time, memory.
  - On failure: show error message from the worker.

- [ ] **Test cases**: Each `PracticeProblem` has `requirements` (test cases). Display them as:
  - `Input → Expected Output → Your Output`
  - ✅ PASS (green) / ❌ FAIL (red) per test case.

- [ ] **"Submit to AI" button**: After running code, user decides to send the output to the AI for evaluation. This triggers `evaluateDSAApproach()` with the code + output + current conversation.

- [ ] **Hidden test cases**: Problems should have visible test cases (for debugging) and hidden test cases (for final assessment). Final score based on hidden cases.

#### A5 — Phase-Aware Instructions

Each phase has different UI and instructions:

- [ ] **Phase 1 (First Learning)**: No time pressure. AI is patient and asks clarifying questions. Hints are available.
- [ ] **Phase 2 (Revision — days 3, 7)**: Slightly faster pacing. AI expects the user to remember the approach. "You've done this before — walk me through your solution from memory."
- [ ] **Phase 3 (Interview Mode — day 10+)**: Strict interview simulation. 20-minute timer. AI acts as a real interviewer. Minimal hints. Direct scoring.

- [ ] **Phase indicator** in the workspace header: Shows current phase with description ("This is your first attempt" / "Revision Day 3" / "Interview Mode").

### Phase B — Spaced Repetition Notifications

The `UserDSATrackingEntry` model has `nextDueAt`. Now we need to actually notify users.

- [ ] **In-app notification** (Priority for launch):
  - A daily cron job (or Next.js cron route with `CRON_SECRET`) runs at 8 AM.
  - Queries all `UserDSATrackingEntry` where `nextDueAt <= today` and `status != COMPLETED`.
  - Creates a `Notification` record for each user: "📚 Time to revise: [Problem Name] — Day [X] revision due today."
  - The notification bell in the header shows these. Click takes them to the problem workspace.

- [ ] **Email notification** (Post-launch, but plan for it):
  - Same daily cron sends emails via Resend.
  - Subject: "Your DSA revision plan for today — 3 problems due"
  - Body: List of problems due with direct links.
  - Unsubscribe option.

- [ ] **"Today's Plan" card on the DSA main page**:
  - Already: `getDSATodayPlan()` is implemented.
  - Make sure this card is prominent at the top of `/practice/dsa`.
  - Show: `X revision due` (orange badge) + `Y new problems` (green badge).
  - One-click "Start Today's Session" that opens the first due revision.

- [ ] **Streak integration**: If user completes today's plan (all due revisions + at least 1 new problem), award a streak point and XP bonus.

### Phase C — Problem Library & Seeding

- [ ] **Seed the `PracticeProblem` library**:
  - Minimum 150 problems across all DSA patterns.
  - Every problem needs: title, slug, description, requirements (test cases with input/output), hints (3 levels), starterCode for each language (JS, Python, Java, C++).
  - Problems should be tagged with: difficulty (EASY/MEDIUM/HARD), patterns, sub-patterns.
  - Reference NeetCode 150 list as a starting point for which problems to include.

- [ ] **Seed `DSAPattern` hierarchy** (already has seed scripts in `packages/prisma/`):
  - Verify the hierarchy is complete: Arrays, Strings, Hashing, Two Pointers, Sliding Window, Stack, Binary Search, Linked List, Trees, Heap/Priority Queue, Backtracking, Graph, DP, Greedy, Intervals, Math & Geometry, Bit Manipulation.
  - Each pattern should have 5–15 sub-patterns.
  - Each sub-pattern should have 5–10 problems.

### Phase D — Workspace UX Polish

- [ ] **Language selector**: Dropdown to switch between JS, Python, Java, C++. Switching reloads starter code for the selected language.
- [ ] **Code persistence**: Code is auto-saved every 30 seconds via `saveSessionProgress()`. "Last saved X seconds ago" indicator.
- [ ] **Problem description panel**: Left panel (or collapsible overlay) with:
  - Problem title, difficulty badge.
  - Description with examples.
  - Visible test cases with input/output.
  - Hints accordion (Hint 1 → Hint 2 → Hint 3, each revealed individually, each costs 0.5 credits).
  - Requirements checklist (check off what you've implemented).
- [ ] **Keyboard shortcuts**: `Ctrl+Enter` to run code. `Ctrl+Shift+Enter` to submit.
- [ ] **Font size / theme**: Dark/light theme for code editor. Font size slider.

### Phase E — Leaderboard & Gamification

- [ ] **Leaderboard** at `/practice/dsa` (already in schema):
  - Global DSA leaderboard: ranked by `totalXP` from DSA activity.
  - Show: rank, username, avatar, problems solved, avg score, streak.
  - Filter by: this week, this month, all-time.

- [ ] **XP rewards for DSA**:
  - First attempt completion: 50 XP.
  - Revision completion: 20 XP per revision day.
  - Perfect score (all test cases pass): 25 XP bonus.
  - Streak bonus: +10% XP per consecutive day.

- [ ] **Problem completion badges**:
  - "Array Master" — Completed all Array problems.
  - "DP Warrior" — Completed 20+ DP problems.
  - "Speed Solver" — Solved a HARD problem in under 20 minutes in Phase 3.

---

## File Checklist

```
apps/main/
├── app/(main)/practice/dsa/
│   ├── page.tsx                                  ✅ exists, verify today's plan prominence
│   ├── [slug]/page.tsx                           ⚠️  exists, needs AI panel wiring
│   └── _components/ (DSA-specific components from main practice dir)
│       ├── dsa-page-client.tsx                   ✅ exists
│       ├── dsa-workspace.tsx                     ⚠️  exists, needs AI conversation panel
│       ├── dsa-ai-panel.tsx                      ❌  needs to be CREATED
│       └── dsa-today-plan-card.tsx               ⚠️  check if exists, make prominent
│
├── app/(main)/practice/_components/workspace/
│   ├── practice-workspace.tsx                    ✅ exists (Monaco editor)
│   └── (code runner output panel)               ❌  needs to be CREATED
│
├── actions/(main)/practice/
│   ├── dsa.action.ts                            ✅ complete (776 lines)
│   ├── dsa-phase.action.ts                      ✅ complete
│   ├── practice.action.ts                       ✅ complete
│   ├── assess.action.ts                         ⚠️  exists, needs DSA Socratic evaluation
│   ├── voice.action.ts                          ✅ complete (STT + TTS)
│   └── (notification cron action)              ❌  needs to be CREATED
│
└── packages/prisma/seeds/
    └── dsa-problems-seed.ts                     ⚠️  may exist partially, needs 150 problems
```

---

## Implementation Order

1. `dsa-ai-panel.tsx` component — conversation panel with phase state machine
2. `evaluateDSAApproach()` in `assess.action.ts` — OpenAI Socratic evaluation per phase
3. Code execution integration — wire "Run Code" button to CoderzWorker + show test results
4. "Submit to AI" button — send code + output to AI conversation
5. Voice input for explanation phase — wire `getScribeToken()` to microphone button
6. Phase indicator in workspace header
7. Spaced repetition notification cron
8. Today's plan card + streak integration
9. Problem library seeding (150 problems minimum)
10. Leaderboard + XP rewards
