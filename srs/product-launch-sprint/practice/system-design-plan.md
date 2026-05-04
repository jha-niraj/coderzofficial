# System Design Practice Module — Complete Build Plan
> Module path: `apps/main/app/(main)/practice/system-design/`
> Actions: `apps/main/actions/(main)/practice/` (shared with DSA)
> Components: `_components/workspace/excalidraw-canvas.tsx`, `sd-component-library.tsx`
> Last updated: April 2026

---

## What This Module Does

System Design practice is fundamentally different from DSA. There is no "correct code" — the evaluation is about the quality of the student's thinking: requirements gathering, API design, database schema decisions, high-level vs. low-level architecture, scalability tradeoffs. The AI acts as a **real interviewer and mentor** — it challenges the student's decisions, asks clarifying questions, and evaluates their design in real-time using the Excalidraw canvas as a shared visual medium.

The flow:
1. Student picks a system design problem (e.g., "Design WhatsApp", "Design a URL Shortener", "Design Netflix")
2. Workspace opens with Excalidraw canvas + AI chat panel
3. AI walks the student through structured phases: Requirements → API Design → Data Modeling → HLD → LLD → Scalability
4. In each phase, AI asks questions and evaluates student's responses + canvas drawings
5. After completion, AI gives a structured scorecard

---

## Current State — What Is Already Built

### Pages
- `/practice/system-design` — Module landing page (lists SD problems).
- `/practice/system-design/[slug]` — Problem workspace.

### Components
- `excalidraw-canvas.tsx` — Excalidraw integration component (canvas for drawing diagrams).
- `sd-component-library.tsx` — Library of pre-made system design components (databases, load balancers, caches, queues, etc.) to drag onto the canvas.
- `practice-workspace.tsx` — The parent workspace component (handles layout, may be shared with DSA).

### Actions (shared with practice module)
- `getOrCreateSession()` — Creates session for SD problems too.
- `saveSessionProgress()` — Saves canvas state (JSON) + chat history.
- `assess.action.ts` — Has `MODULE_SYSTEM_PROMPTS` for SYSTEM_DESIGN. The canvas topology extraction (Excalidraw JSON parsing) is partially implemented.
- `voice.action.ts` — STT + TTS available (same as DSA).

---

## What Needs to Be Built

### Phase A — Interview Phase Structure

The AI needs to guide the student through a structured 6-phase system design interview.

- [ ] **Phase state machine** in the workspace:
  ```
  PHASE_1_REQUIREMENTS       → Functional + non-functional requirements
  PHASE_2_API_DESIGN         → API endpoints, request/response schemas
  PHASE_3_DATA_MODELING      → Database schema, data models, relationships
  PHASE_4_HIGH_LEVEL_DESIGN  → HLD: microservices/monolith, major components, data flow
  PHASE_5_LOW_LEVEL_DESIGN   → LLD: specific component internals, algorithms, edge cases
  PHASE_6_SCALABILITY        → Bottlenecks, caching strategy, sharding, CDN, monitoring
  COMPLETED                  → Scorecard
  ```

- [ ] **Phase progression**: AI decides when to advance to the next phase based on the student's responses. If requirements are incomplete, AI stays in Phase 1 and asks follow-up questions. When satisfied, AI says "Good — let's move to API design."

- [ ] **Phase timer indicator** in the header: Shows which phase and time spent. Real interviews have a 45-minute total time limit.

- [ ] **Canvas phase context**: Each phase has an expected canvas component:
  - Phase 3 (Data Modeling): Student should draw tables with columns.
  - Phase 4 (HLD): Student should draw boxes (services) with arrows (data flow).
  - Phase 5 (LLD): Student should draw detailed internals of 1–2 components.

### Phase B — AI Instructor Actions

- [ ] **`evaluateSystemDesign(sessionId, userMessage, phase, canvasJSON?)` action**:
  - Takes the current phase, user's text message, and optionally the current Excalidraw canvas JSON.
  - OpenAI parses the canvas to understand what the student has drawn (which components exist, how they connect).
  - AI evaluates the message + canvas together.
  - Returns a response that either:
    - Challenges a decision ("You've used SQL here — given the write volume you described, would NoSQL be better? Why or why not?")
    - Asks for something missing ("You haven't defined how the notification service connects to the user service. Walk me through that.")
    - Validates a good decision ("Using a message queue here is correct — can you explain why?")
    - Advances the phase ("Good requirements. Let's move to API design.")

- [ ] **Phase-specific system prompts**:
  ```
  PHASE_1: "You are a system design interviewer. The student is defining requirements for: [problem].
  Ask about: scale (users, requests/day), latency requirements, consistency vs availability tradeoffs,
  core features vs nice-to-have. Push back if they jump ahead without establishing scale.
  Do NOT design the system for them."
  
  PHASE_3: "The student has drawn the following database schema on the canvas: [parsed canvas].
  Evaluate if: tables are normalized, relationships are correct, indexes are appropriate for the
  query patterns they described. Ask about sharding strategy if the data volume is high."
  
  PHASE_4: "The student has drawn the following HLD: [parsed canvas].
  Check if: single points of failure are addressed, load balancing is present, caching layer
  exists for read-heavy operations, async operations use a message queue."
  ```

- [ ] **Canvas-aware evaluation**: Parse Excalidraw JSON to extract:
  - List of elements (rectangles = services, arrows = connections, text labels = names)
  - Connection graph (which services talk to which)
  - Layer structure (CDN → Load Balancer → App Server → DB hierarchy)
  - Send this structured representation to OpenAI for evaluation (not raw JSON — it's too noisy)

### Phase C — Excalidraw Canvas Polish

- [ ] **Pre-built system design components** in `sd-component-library.tsx`:
  - Client (browser, mobile app)
  - CDN
  - Load Balancer
  - API Gateway
  - Service/Microservice (generic box)
  - Cache (Redis, Memcached)
  - SQL Database (PostgreSQL, MySQL)
  - NoSQL Database (MongoDB, Cassandra)
  - Message Queue (Kafka, RabbitMQ)
  - Object Storage (S3)
  - Search (Elasticsearch)
  - Auth Service
  - Monitoring (Grafana, DataDog)
  These should be draggable from the sidebar onto the canvas.

- [ ] **Canvas auto-save**: Save canvas state every 15 seconds via `saveSessionProgress()`. "Canvas saved" toast.

- [ ] **Canvas submission to AI**: "Send canvas to AI" button — triggers AI evaluation of the current canvas state.

- [ ] **AI annotations on canvas** (advanced, post-launch): AI adds colored comments to specific components on the canvas ("⚠️ This is a single point of failure").

### Phase D — Problem Library & Seeding

- [ ] **Seed `PracticeProblem` records for System Design**:
  - 30–50 problems across difficulty levels.
  - Each problem needs:
    - Clear problem statement ("Design WhatsApp — a messaging app for 500M users")
    - Scale constraints ("1B messages/day, 500M users, 99.99% uptime SLA")
    - Key requirements to hit (used for scoring rubric)
    - Hints per phase
    - Reference solution (for AI to grade against — not shown to student)
  
  **Suggested problem list:**
  - EASY: URL Shortener, Pastebin, Rate Limiter, Key-Value Store
  - MEDIUM: Twitter Feed, WhatsApp, Dropbox, YouTube, Uber
  - HARD: Google Docs (collaborative editing), Distributed Cache, Search Autocomplete, Stock Exchange, Web Crawler

### Phase E — Scorecard & Feedback

After the session is complete:

- [ ] **Post-session scorecard** (same structure as mock interview):
  ```json
  {
    "overallScore": 0-100,
    "phases": {
      "requirements": { "score": 0-20, "feedback": "..." },
      "apiDesign": { "score": 0-15, "feedback": "..." },
      "dataModeling": { "score": 0-20, "feedback": "..." },
      "highLevelDesign": { "score": 0-25, "feedback": "..." },
      "scalability": { "score": 0-20, "feedback": "..." }
    },
    "strengths": ["..."],
    "weaknesses": ["..."],
    "canvasEvaluation": "Your HLD was correct but missing a caching layer...",
    "recommendedStudyTopics": ["Consistent Hashing", "CAP Theorem", "Database Sharding"]
  }
  ```

- [ ] **Canvas screenshot in results**: Capture the final canvas state and show it in the results page as a reference.

### Phase F — Spaced Repetition (Same as DSA)

- [ ] Revisit system design problems on days 7, 14, 30.
- [ ] Revision sessions: shorter — just AI asks about 3 key decisions the student made last time. No full redesign needed.

---

## File Checklist

```
apps/main/
├── app/(main)/practice/system-design/
│   ├── page.tsx                                  ✅ exists
│   └── [slug]/page.tsx                           ⚠️  exists, needs phase state machine + AI panel
│
├── app/(main)/practice/_components/workspace/
│   ├── excalidraw-canvas.tsx                     ✅ exists, needs canvas-to-AI submission
│   ├── sd-component-library.tsx                 ⚠️  exists, needs more pre-built components
│   └── sd-ai-panel.tsx                          ❌  needs to be CREATED (phase-aware chat)
│
└── actions/(main)/practice/
    └── assess.action.ts                         ⚠️  has SD prompt, needs canvas parsing & phase evaluation
```

---

## Implementation Order

1. Phase state machine in workspace (6 phases with clear transitions)
2. SD AI panel with phase-aware prompts
3. Canvas JSON parsing to extract component graph for AI evaluation
4. Pre-built SD component library (20+ standard components)
5. Canvas auto-save integration
6. System design problem library seeding (30 problems)
7. Post-session scorecard (phase-by-phase breakdown)
8. Spaced repetition scheduling for SD problems
