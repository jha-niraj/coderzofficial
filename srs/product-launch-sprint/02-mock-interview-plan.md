# Mock Interview Module — Complete Build Plan
> Module path: `apps/main/app/(main)/mock/`
> Actions path: `apps/main/actions/(main)/mockvoice/`
> Last updated: April 2026

---

## What This Module Does

The Mock Interview module lets students practice job interviews with an AI voice agent powered by ElevenLabs ConvAI. A student selects an interview type, pays credits, the platform creates an ElevenLabs conversation session with custom variables (their name, target role, level, resume content), the student speaks with the AI agent in real-time, and after completion the platform retrieves the transcript + AI analysis to show a structured feedback report.

---

## Current State — What Is Already Built

### Pages
- `/mock` — Hub page showing 5 interview modes. Voice Mock is ACTIVE. Video Mock, Peer-to-Peer, Connect, Expert Mentorship show "Coming Soon". 
- `/mock/voice` — Landing page for voice mocks. Shows categories in sidebar, admin mock cards in main area, session history.
- `/mock/voice/interview/[sessionId]` — Active interview session page. Connects to ElevenLabs ConvAI widget.
- `/mock/voice/results/[sessionId]` — Post-interview results page. Currently shows raw transcript + basic analysis.

### Server Actions (`actions/(main)/mockvoice/`)
- **`session.action.ts`** — `createMockVoiceSession()`: Full transaction. Validates user credits → creates `MockVoiceSession` in DB → deducts credits atomically → injects ElevenLabs variables (username, target position, level, knowledge base, resume content) → returns `{ sessionId, agentId, variables }`.
- **`voice.action.ts`** — `getAdminMocksByCategory()`, `getAllAdminMocksGrouped()`, `getFeaturedAdminMocks()`: Fetches `MockInterviewVoice` records from DB with pagination and category grouping.
- **`conversation.action.ts`** — `getConversationDetails()`, `processConversationCompletion()`: Fetches conversation from ElevenLabs API, polls until status is `done`, stores `transcript` + `analysis` JSON in `MockVoiceSession`.
- **`review.action.ts`** — Rating submission and retrieval.
- **`stats.action.ts`** — Aggregate session stats for a user.

### Database Models (`packages/prisma/schema/mock.prisma`)
- `MockInterviewVoice` — Admin-created interview templates. Has `agentId`, `knowledgeBase`, `creditsRequired`, `duration`, `questionsCount`, `byAdmin`, `isFeatured`, `tags`, `category`, `difficulty`.
- `MockVoiceSession` — User's interview session. Has `conversationId`, `agentId`, `status` (CREATED/ACTIVE/COMPLETED/FAILED), `transcript` (JSON), `analysis` (JSON), `userRating`, `creditsUsed`, `reportedIssues`.
- `MockVoiceRating` — Per-user rating for a mock template.

### ElevenLabs Integration
- Agent is created on the ElevenLabs platform (not via API). The `agentId` is stored in `MockInterviewVoice`.
- Variables passed at session creation: `username`, `target_position`, `level`, `description`, `knowledge_base`, `resume_content`.
- After conversation ends, `processConversationCompletion()` polls the ElevenLabs API for the transcript and analysis JSON.
- Voice STT token: `getScribeToken()` in `voice.action.ts` for speech-to-text.
- TTS for AI feedback: `generateTTSAudio()` in `voice.action.ts` (returns base64 mp3).

### Components
- `voice-main-content.tsx` — Main content area showing mock cards, filters, session history.
- `voice-sidebar.tsx` — Category/difficulty navigation sidebar.
- `mock-interview-card.tsx` — Individual mock card with title, category, difficulty, credits, duration.
- `create-mock-sheet.tsx` — Sheet for creating a custom mock (admin-defined or user-custom).
- `purchase-mock-sheet.tsx` — Credits confirmation before starting a session.
- `session-card.tsx` — Past session card in history.
- `review-sheet.tsx` — Modal for submitting a star rating + written feedback.
- `mock-categories.ts` — Constants for categories: TECHNICAL, BEHAVIORAL, SYSTEM_DESIGN, HR, FULL_STACK, DATA_SCIENCE, DEVOPS, PRODUCT_MANAGEMENT.

---

## What Needs to Be Built / Fixed

### Priority 1 — Session Analysis Scorecard (Most Critical Gap)

**Current problem:** The results page shows raw ElevenLabs transcript and unstructured AI analysis JSON. This is not useful to a student.

**What to build:** A structured post-interview scorecard that evaluates the student on specific rubric dimensions.

- [ ] **Create a post-session analysis action** in `conversation.action.ts`:
  - After `processConversationCompletion()` stores the transcript, trigger an OpenAI call (GPT-4o).
  - Pass the full transcript + the mock's `category` and `difficulty` to OpenAI.
  - Use a structured JSON schema output with these dimensions:
    ```json
    {
      "overallScore": 0-100,
      "dimensions": {
        "technicalAccuracy": { "score": 0-10, "feedback": "..." },
        "communicationClarity": { "score": 0-10, "feedback": "..." },
        "problemApproach": { "score": 0-10, "feedback": "..." },
        "depthOfKnowledge": { "score": 0-10, "feedback": "..." },
        "confidenceAndPacing": { "score": 0-10, "feedback": "..." }
      },
      "strengths": ["...", "..."],
      "improvements": ["...", "..."],
      "keyMoments": [{ "timestamp": "...", "quote": "...", "comment": "..." }],
      "recommendedNextSteps": ["...", "..."]
    }
    ```
  - Store this structured scorecard in `MockVoiceSession.analysis` (it's already a JSON field).

- [ ] **Rebuild the results page** (`/mock/voice/results/[sessionId]/page.tsx`):
  - Show `overallScore` as a circular progress indicator (big, prominent).
  - Show each dimension as a horizontal progress bar with score + one-line feedback below it.
  - "Strengths" section with green tags.
  - "Areas to Improve" section with amber tags.
  - "Key Moments" section — expandable transcript quotes with AI comments.
  - "Recommended Next Steps" — 3 actionable items with links to relevant practice content.
  - Show the full transcript in a collapsible section at the bottom.
  - Show `creditsUsed`, `duration`, `category`, `difficulty` in a summary card at top.

- [ ] **Add a loading/polling state** on the results page:
  - Analysis takes 10–30 seconds after conversation ends.
  - Show a skeleton with "Analyzing your interview..." and an animated progress bar.
  - Poll `getConversationDetails()` every 3 seconds until `status === 'COMPLETED'`.
  - Once complete, trigger `processConversationCompletion()` + analysis action.

### Priority 2 — ElevenLabs Agent Setup Per Category

**Current problem:** A single generic `agentId` may be used for all categories. Each category needs a specialized agent with the right knowledge base and interview style.

- [ ] **Create 8 specialized ElevenLabs agents** (one per category) on the ElevenLabs platform:
  - `TECHNICAL` — SWE technical questions (algorithms, system design, code review)
  - `BEHAVIORAL` — STAR method questions (leadership, conflict, teamwork)
  - `SYSTEM_DESIGN` — Architecture, scalability, database choices
  - `HR` — Company fit, salary negotiation, career goals
  - `FULL_STACK` — Frontend + backend combined technical
  - `DATA_SCIENCE` — ML concepts, statistics, Python, model evaluation
  - `DEVOPS` — CI/CD, cloud, containers, monitoring
  - `PRODUCT_MANAGEMENT` — Product sense, metrics, roadmap prioritization

- [ ] **Seed `MockInterviewVoice` records** for each agent with:
  - Correct `agentId` from ElevenLabs platform
  - `knowledgeBase` string with role-specific context
  - `creditsRequired` (suggest: 5 credits per session)
  - `duration` (suggest: 20 minutes)
  - `questionsCount` (suggest: 8–10 questions)
  - `byAdmin: true`, `isFeatured: true` for initial templates

- [ ] **Set environment variables** for each agent ID:
  - `ELEVENLABS_AGENT_TECHNICAL`, `ELEVENLABS_AGENT_BEHAVIORAL`, etc.
  - Or store them as seeded DB records — currently stored in DB which is the right approach.

### Priority 3 — Interview Session Page UX

**Current problem:** The active interview page (`/mock/voice/interview/[sessionId]`) uses the raw ElevenLabs ConvAI widget. The UX needs polish.

- [ ] **Session timer** — Show elapsed time vs. total session duration. Warn at 2 minutes remaining.
- [ ] **Live transcript display** — Show the conversation transcript updating in real-time (use ElevenLabs ConvAI events if available, or poll every 5 seconds).
- [ ] **Audio level indicator** — Visual waveform showing the user is being heard (microphone activity).
- [ ] **"End Interview" button** — Prominent button to finish early. Confirm dialog ("Are you sure? Your session will be analyzed based on what you've said so far.").
- [ ] **Connection status indicator** — Green/red dot showing WebSocket connection to ElevenLabs is active.
- [ ] **Pre-interview checklist modal** — Before the session starts, show:
  - Microphone permission check
  - Quick tips ("Speak clearly", "Take your time", "Think out loud")
  - Confirm credits being deducted
  - "Start Interview" CTA button

### Priority 4 — Custom Mock Creation

**Current problem:** `create-mock-sheet.tsx` exists but the flow for a user to create a custom mock interview is not fully wired.

- [ ] **Custom mock creation flow**:
  - User fills out: target role, company name (optional), interview round type, difficulty, specific topics to be tested.
  - Platform generates a `knowledgeBase` string using OpenAI based on the provided inputs.
  - Uses a pre-assigned "custom" ElevenLabs agent ID (one per difficulty level is sufficient).
  - Creates a `MockInterviewVoice` record with `byAdmin: false`.
  - Deducts higher credits for custom mocks (suggest: 10 credits).

- [ ] **Validate the custom mock creation action** in `voice.action.ts`:
  - `createCustomMock()`: Takes role, topics, difficulty → generates knowledge_base via OpenAI → creates DB record → returns mock ID for immediate session start.

### Priority 5 — Session History & Stats

- [ ] **Session history on voice mock landing page**:
  - Show last 5 sessions with: date, mock title, overall score, duration.
  - Link each to its results page.
  - "View All Sessions" link to a full history page.

- [ ] **User stats sidebar widget**:
  - Total sessions completed
  - Average overall score (trend: up or down vs. last 5 sessions)
  - Most practiced category
  - Best performing dimension

- [ ] **Implement `stats.action.ts`** (currently file exists but needs full implementation):
  - `getUserMockStats(userId)`: Returns aggregate stats from `MockVoiceSession`.
  - `getSessionHistory(userId, limit, cursor)`: Paginated session history.
  - `getCategoryBreakdown(userId)`: Sessions per category with avg scores.

### Priority 6 — Credit System Integration

- [ ] Verify `createMockVoiceSession()` deducts credits correctly and handles insufficient credits gracefully (show friendly error, link to purchase).
- [ ] Verify `MockVoiceSession` with `status: FAILED` triggers a credit refund.
- [ ] Add a "refund pending" state if ElevenLabs conversation never started.
- [ ] Show credit cost prominently before starting (currently in `purchase-mock-sheet.tsx` — verify it's working).

### Priority 7 — Rating & Feedback Loop

- [ ] **Wire `review-sheet.tsx`** to `review.action.ts`:
  - After viewing results, prompt user: "How was this interview? Rate it 1–5 stars."
  - Store in `MockVoiceRating`.
  - Use ratings to surface best-rated mocks in the UI (sort by `MockInterviewVoice.popularity`).

- [ ] **Report issues flow**:
  - "Report a Problem" button on results page.
  - Stores issue description in `MockVoiceSession.reportedIssues` (JSON array).
  - Admin can view reported issues in the admin panel.

### Priority 8 — Admin Mock Management (Admin App)

- [ ] **Admin panel for creating mock templates** (`apps/admin/app/(main)/main/mocks/`):
  - Form to create a new `MockInterviewVoice` record.
  - Fields: title, description, category, difficulty, agentId, knowledgeBase, creditsRequired, duration, questionsCount, tags, isFeatured.
  - List of all mocks with edit/delete/toggle featured.
  - View sessions for each mock template.

### Priority 9 — Job-Context Mocks (Integration with Hiring Platform)

**Future enhancement — not required for launch:**
- When a student applies to a job on the main platform, offer a "Practice for this interview" option.
- Uses the company's `InterviewProcess` + `InterviewRound` data from `hiring.prisma`.
- Creates a `JobMockSession` linking the mock to the specific job application.

---

## File Checklist

```
apps/main/
├── app/(main)/mock/
│   ├── voice/
│   │   ├── _constants/mock-categories.ts          ✅ exists
│   │   ├── _components/voice-main-content.tsx      ✅ exists, needs stats widget
│   │   ├── _components/voice-sidebar.tsx           ✅ exists
│   │   ├── interview/[sessionId]/page.tsx          ✅ exists, needs UX polish
│   │   ├── results/[sessionId]/page.tsx            ⚠️  exists, needs scorecard rebuild
│   │   └── page.tsx                               ✅ exists
│   └── _components/
│       ├── mock-interview-card.tsx                 ✅ exists
│       ├── create-mock-sheet.tsx                   ⚠️  exists, custom mock flow incomplete
│       ├── purchase-mock-sheet.tsx                 ✅ exists, verify credit integration
│       ├── session-card.tsx                        ✅ exists
│       └── review-sheet.tsx                        ⚠️  exists, wire to review action
│
├── actions/(main)/mockvoice/
│   ├── session.action.ts                          ✅ complete
│   ├── voice.action.ts                            ⚠️  needs createCustomMock()
│   ├── conversation.action.ts                     ⚠️  needs OpenAI scorecard analysis
│   ├── review.action.ts                           ⚠️  needs wiring to UI
│   └── stats.action.ts                            ⚠️  needs full implementation
│
└── types/interview.ts                             ✅ exists, may need scorecard type
```

---

## Implementation Order

1. OpenAI scorecard analysis in `conversation.action.ts` + scorecard type definition
2. Rebuild results page with structured scorecard UI
3. Add polling/loading state on results page
4. Wire `review.action.ts` to UI (`review-sheet.tsx`)
5. Implement `stats.action.ts` + add stats widget to voice landing
6. Session page UX: timer, pre-interview checklist, live transcript
7. Seed 8 category agents + `MockInterviewVoice` records
8. Custom mock creation flow
9. Admin mock management panel
