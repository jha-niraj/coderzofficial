# CodeSage — AI-Powered Codebase Intelligence Platform

> **"Bring your code. Leave smarter."**

CodeSage is the module where developers drop a GitHub repo (or upload a zipped codebase) and immediately unlock a suite of AI tools built around *that specific project* — not generic advice, but deep intelligence derived from their actual code.

---

## Why "CodeSage"

- **Code** — the subject matter  
- **Sage** — wisdom, depth, expertise  
- It's memorable, it signals serious insight, and it doesn't overlap with any major competitor  
- Domain idea: `coderz.ai/codesage` or platform route `/codesage`

---

## Competitive Landscape (Why This Hasn't Been Done Right)

| Tool | What it does | Gap |
|------|-------------|-----|
| **Greptile** | GitHub repo Q&A API | API only, no UI, no interview/optimization modules |
| **Sourcegraph Cody** | IDE plugin for code search + chat | IDE-only, no web platform, no interview mode |
| **Cursor** | AI-native IDE | Full IDE required, not web-based, no optimization audit |
| **Snyk / DeepCode** | Security & vulnerability scan | Security-only, not holistic, no learning features |
| **CodeClimate** | Code quality metrics | Metrics only, no AI explanations, no interview mode |
| **SonarQube** | Code smells + bugs | Enterprise setup, heavy, no conversational interface |
| **Continue.dev** | Open-source AI code assistant | Self-hosted, IDE plugin, no learning/interview mode |

**The gap:** Nobody has built a **web-based, all-in-one codebase intelligence platform** that combines Q&A + optimization audit + mock interview + docs generation + architecture visualization — all in one project workspace, without needing an IDE.

---

## Platform Architecture

```
/codesage                          ← Module landing / dashboard
/codesage/new                      ← Upload / connect a repo
/codesage/c/[slug]                 ← Project home (module hub)
/codesage/c/[slug]/ask             ← AI Q&A about the codebase
/codesage/c/[slug]/optimize        ← Optimization scanner + action todos
/codesage/c/[slug]/interview       ← Mock interview based on codebase
/codesage/c/[slug]/explain         ← Architecture explainer + visual map
/codesage/c/[slug]/docs            ← Auto-generated documentation
/codesage/c/[slug]/security        ← Security vulnerability scan
/codesage/c/[slug]/refactor        ← Refactoring suggestions
/codesage/c/[slug]/learn           ← Structured learning path from the codebase
```

**Where to place this in the platform:**  
Put it under `/ai/codesage` to stay consistent with the existing `/ai/resume` pattern.  
All AI tools live under `/ai/`. The route becomes `/ai/codesage/c/[slug]/[module]`.

---

## Entry Flow — How a User Onboards a Project

```
┌─────────────────────────────────────────────────────────────────────┐
│                      /ai/codesage  (Dashboard)                      │
│                                                                     │
│   "Your Codebases"                          [+ Add Codebase]       │
│                                                                     │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│   │ my-saas-app │  │ auth-service │  │  [empty]    │               │
│   │  ● 6 modules│  │  ● 3 modules│  │  Add first  │               │
│   │  Updated 2h │  │  Updated 1d │  │  codebase   │               │
│   └─────────────┘  └─────────────┘  └─────────────┘               │
└─────────────────────────────────────────────────────────────────────┘

                              ↓ [+ Add Codebase]

┌─────────────────────────────────────────────────────────────────────┐
│                      /ai/codesage/new                               │
│                                                                     │
│   How do you want to add your project?                              │
│                                                                     │
│   ┌──────────────────┐    ┌──────────────────┐                     │
│   │  🔗 GitHub Repo  │    │  📦 Upload ZIP   │                     │
│   │  Paste URL or    │    │  Drop your       │                     │
│   │  connect account │    │  project folder  │                     │
│   └──────────────────┘    └──────────────────┘                     │
│                                                                     │
│   ⚠️  We exclude: node_modules, .git, build outputs               │
│   ✅  We support: Next.js, React, Node, Python, Go, monorepos      │
│                                                                     │
│   Project Name: [________________]   Visibility: [Private ▼]      │
│   Description:  [________________]                                 │
│                                                                     │
│   [  Process Codebase  →  ]                                        │
└─────────────────────────────────────────────────────────────────────┘

                              ↓ Processing

┌─────────────────────────────────────────────────────────────────────┐
│                        Processing...                                │
│                                                                     │
│   ✅ Files ingested (142 files)                                     │
│   ✅ Language detected: TypeScript, React (Next.js 15)             │
│   ✅ Dependencies parsed (package.json, pnpm-lock.yaml)            │
│   ✅ Architecture mapped (App Router, Prisma, REST APIs)           │
│   ⏳ Building vector index...                                       │
│                                                                     │
│   This takes ~30-60s for most projects                             │
└─────────────────────────────────────────────────────────────────────┘

                              ↓ Done → redirect to

/ai/codesage/c/my-saas-app   (Project Hub)
```

---

## Project Hub (`/c/[slug]`)

This is the command center for a specific project. Think of it like a GitHub repo page, but purely for AI-powered intelligence.

```
┌─────────────────────────────────────────────────────────────────────┐
│  ← Back   CodeSage / my-saas-app                    [⚙️ Settings] │
│                                                                     │
│  📁 my-saas-app   Next.js 15 · TypeScript · 142 files · 3 days ago│
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  📊 Quick Stats                                             │   │
│  │  142 files  |  18,400 lines  |  34 components  |  12 APIs  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │    💬    │ │    🔍    │ │    🎤    │ │    🗺️    │             │
│  │   Ask    │ │ Optimize │ │Interview │ │ Explain  │             │
│  │ Q&A Chat │ │  Audit   │ │  Mode    │ │   Arch   │             │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │    📄    │ │    🔒    │ │    🔄    │ │    📚    │             │
│  │   Docs   │ │ Security │ │ Refactor │ │  Learn   │             │
│  │  Writer  │ │   Scan   │ │ Advisor  │ │  Mode    │             │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Module 1 — Ask (`/c/[slug]/ask`)

> **"Chat with your codebase like it's a senior engineer"**

The foundational module. A chat interface where the AI has full context of the codebase and answers questions with actual file references, line numbers, and code snippets.

### What It Does
- Ask anything: "How does authentication work?", "Where is rate limiting implemented?", "What does the ProfileStrengthSheet component do?"
- AI responds with code snippets, file paths, and explanations
- Cites exact file paths and line numbers
- Remembers conversation history within a session
- Suggests follow-up questions based on context

### UI Flowchart

```
┌─────────────────────────────────────────────────────────────────────┐
│  CodeSage / my-saas-app / Ask                                       │
│                                                                     │
│  ┌─────────────────────────────────────────┐  ┌─────────────────┐ │
│  │                                         │  │  📁 File Tree   │ │
│  │  Ask anything about your codebase...    │  │                 │ │
│  │                                         │  │  > app/         │ │
│  │  💬 Chat Area                           │  │    > (main)/    │ │
│  │                                         │  │    > (auth)/    │ │
│  │  [User]: How does auth work here?       │  │  > components/  │ │
│  │                                         │  │  > lib/         │ │
│  │  [AI]: Authentication in this project   │  │  > actions/     │ │
│  │  uses NextAuth.js with credentials     │  │                 │ │
│  │  and OAuth providers.                   │  │  📌 Pinned      │ │
│  │                                         │  │  • auth config  │ │
│  │  Key files:                             │  │  • API routes   │ │
│  │  • `app/api/auth/[...nextauth]/         │  │  • DB schema    │ │
│  │    route.ts:1-45` — main config         │  │                 │ │
│  │  • `lib/auth.ts:23` — session           │  │  💡 Suggested   │ │
│  │    handling                             │  │  Questions:     │ │
│  │  • `middleware.ts:8` — route            │  │  • "How are     │ │
│  │    protection                           │  │    API routes   │ │
│  │                                         │  │    protected?"  │ │
│  │  [Code block shown inline]              │  │  • "What DB     │ │
│  │                                         │  │    is used?"    │ │
│  │  ─────────────────────────────          │  │  • "Where are   │ │
│  │  [Type your question...        ] [Send] │  │    env vars?"   │ │
│  └─────────────────────────────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Differentiators vs Competitors
- Greptile does this via API only — no clean consumer UI
- Cursor does it inside an IDE — requires install
- **CodeSage does it on the web, zero setup, with a file tree sidebar**

---

## Module 2 — Optimize (`/c/[slug]/optimize`)

> **"Your codebase's honest performance review"**

This is the killer differentiator. The AI scans the entire codebase and produces a prioritized, actionable todo list of real improvements — not vague "improve code quality" advice. Actual specifics.

### What It Does
- Scans all files on first load, then incrementally re-checks on demand
- Produces categories: Performance, Architecture, Code Quality, DX (Developer Experience), Accessibility, Bundle Size
- Each issue has: file path + line, problem description, **exact fix suggestion with code diff**, effort estimate (Easy/Medium/Hard), impact (High/Medium/Low)
- Filter by category, effort, or impact
- Mark issues as Done / Ignored / Snoozed
- Re-scan triggers when you dismiss or fix items

### UI Flowchart

```
┌─────────────────────────────────────────────────────────────────────┐
│  CodeSage / my-saas-app / Optimize                   [🔄 Re-scan]  │
│                                                                     │
│  📊 Optimization Score: 67/100                                      │
│  ████████████████░░░░░░░░  Last scanned: 2h ago                    │
│                                                                     │
│  Filters: [All ▼]  Impact: [All ▼]  Effort: [All ▼]  [🔍 Search] │
│                                                                     │
│  ┌─── 🔴 HIGH IMPACT ──────────────────────────────────────────┐   │
│  │                                                              │   │
│  │  ⚡ Performance · Easy · High Impact                        │   │
│  │  Missing image optimization in 8 components                 │   │
│  │  app/(main)/profile/page.tsx:142                            │   │
│  │  > Using <img> instead of Next.js <Image>. This skips lazy  │   │
│  │    loading and automatic size optimization.                 │   │
│  │  [▶ See Fix] [✅ Mark Done] [🙈 Ignore]                    │   │
│  │                                                              │   │
│  │  🏗️ Architecture · Medium · High Impact                    │   │
│  │  API calls directly in client components (no SWR/React Query│   │
│  │  components/profile/profile-sidebar.tsx:67                  │   │
│  │  > Move data fetching to server components or use SWR for   │   │
│  │    caching. Current approach re-fetches on every render.    │   │
│  │  [▶ See Fix] [✅ Mark Done] [🙈 Ignore]                    │   │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─── 🟡 MEDIUM IMPACT ────────────────────────────────────────┐   │
│  │  🎨 Code Quality · Easy · Medium Impact                     │   │
│  │  23 unused imports across the codebase                      │   │
│  │  [▶ See All Files] [✅ Auto-fix All]                        │   │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─── ✅ RESOLVED (12) ────────────────────────────────────────┐   │
│  │  [Collapsed — click to expand]                              │   │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

                  ↓ [▶ See Fix] opens a side panel:

┌─────────────────────────────────────────────────────────────┐
│  Fix: Missing image optimization                            │
│  File: components/profile/profile-avatar.tsx:14             │
│                                                             │
│  BEFORE                                                     │
│  ┌─────────────────────────────────────────┐               │
│  │ - <img src={user.image} alt="avatar" /> │               │
│  └─────────────────────────────────────────┘               │
│                                                             │
│  AFTER                                                      │
│  ┌─────────────────────────────────────────┐               │
│  │ + import Image from "next/image"        │               │
│  │ + <Image src={user.image} alt="avatar"  │               │
│  │ +        width={40} height={40} />      │               │
│  └─────────────────────────────────────────┘               │
│                                                             │
│  Why: Next.js Image component automatically optimizes       │
│  format (WebP/AVIF), lazy loads, and prevents layout shift  │
│                                                             │
│  [📋 Copy Fix]  [✅ Mark Done]  [🙈 Ignore]               │
└─────────────────────────────────────────────────────────────┘
```

### Optimization Categories
1. **Performance** — N+1 queries, missing memoization, heavy re-renders, bundle size bloat
2. **Architecture** — wrong data-fetching patterns, tight coupling, missing abstraction
3. **Code Quality** — dead code, overly complex functions, missing types
4. **Security** — exposed env vars, unvalidated inputs, weak auth patterns
5. **DX** — missing error boundaries, no loading states, poor TypeScript usage
6. **Accessibility** — missing aria labels, poor color contrast, keyboard navigation
7. **Bundle Size** — large dependencies, missing dynamic imports, unoptimized assets

---

## Module 3 — Interview (`/c/[slug]/interview`)

> **"Get grilled on YOUR code, not textbook examples"**

This is unique to everything out there. Nobody is doing mock technical interviews based on a user's actual codebase. The AI generates interview questions directly from the code, then evaluates answers in real-time.

### What It Does
- AI analyzes the codebase and generates relevant technical questions
- Questions range from "Explain this design pattern" to "Why did you use X here?" to "How would you improve this function?"
- 3 interview modes: **Explain** (understand the code), **Defend** (justify architectural choices), **Improve** (suggest better approaches)
- Real-time AI evaluation of voice/text answers
- Final report with score + detailed feedback
- Generates a sharable interview summary

### Question Types Generated
| Type | Example |
|------|---------|
| Architecture | "Your auth middleware runs before all routes. Walk me through how session validation works here." |
| Trade-offs | "You're using Prisma with direct DB calls in server actions. What are the trade-offs vs. a repository pattern?" |
| Debugging | "If a user reported that their profile completion score shows 0% even after filling all fields, how would you debug this?" |
| Improvement | "Looking at your ProfileStrengthSheet component, how would you refactor the score calculation?" |
| Security | "Your API endpoints use session checking. How would you harden this against token theft?" |

### UI Flowchart

```
┌─────────────────────────────────────────────────────────────────────┐
│  CodeSage / my-saas-app / Interview                                 │
│                                                                     │
│  ┌────── Step 1: Configure Interview ────────────────────────────┐ │
│  │                                                               │ │
│  │  Interview Type                                               │ │
│  │  ◉ Explain Mode     — "Walk me through your code"            │ │
│  │  ○ Defend Mode      — "Justify your architectural choices"   │ │
│  │  ○ Improve Mode     — "How would you make this better?"      │ │
│  │  ○ Full Stack       — Mix of all three                       │ │
│  │                                                               │ │
│  │  Difficulty:  [Junior ○  ●Mid  ○ Senior]                    │ │
│  │  Duration:    [15 min ▼]                                     │ │
│  │  Focus Area:  [Whole Codebase ▼]   (or pick a module/folder) │ │
│  │                                                               │ │
│  │  [  Start Interview  →  ]                                    │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘

                              ↓ Start

┌─────────────────────────────────────────────────────────────────────┐
│  Interview in Progress         ⏱️ 03:42          [⏸ Pause] [⏹ End] │
│                                                                     │
│  Question 2 of 8                                                    │
│  ████████░░░░░░░░░░░░  Progress                                    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  📋 Code Context                                            │   │
│  │                                                             │   │
│  │  // profile-strength-sheet.tsx:141-143                      │   │
│  │  const calculatedScore = Math.round(                        │   │
│  │    (items.filter(i => i.completed).length / items.length)   │   │
│  │    * 100                                                     │   │
│  │  );                                                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  🎤 Interviewer:                                                    │
│  "I see you calculate the profile completion score dynamically      │
│  from an items array rather than using the stored DB value.         │
│  Why did you make this design choice, and what are the trade-offs?" │
│                                                                     │
│  Your Answer:                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  [Type your answer here, or use 🎤 voice mode...]          │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [  Submit Answer  →  ]   [⏭ Skip]                                 │
└─────────────────────────────────────────────────────────────────────┘

                              ↓ After all questions

┌─────────────────────────────────────────────────────────────────────┐
│  Interview Complete! 🎉                                             │
│                                                                     │
│  Overall Score: 78/100                                              │
│  ████████████████████░░░░                                          │
│                                                                     │
│  📊 Breakdown                                                       │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Technical Accuracy     ████████████░░░  82%               │    │
│  │  Communication Clarity  ███████████░░░░  74%               │    │
│  │  Design Thinking        ████████████░░░  80%               │    │
│  │  Depth of Knowledge     ██████████░░░░░  68%               │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  💪 Strengths                                                       │
│  • Strong understanding of React component lifecycle               │
│  • Good reasoning about server vs. client components               │
│                                                                     │
│  📈 Areas to Improve                                               │
│  • Database query optimization knowledge needs deepening           │
│  • Could elaborate more on security considerations                 │
│                                                                     │
│  [📋 View Detailed Report]  [🔄 Retry]  [📤 Share Summary]        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Module 4 — Explain (`/c/[slug]/explain`)

> **"Understand any codebase in 10 minutes"**

Perfect for onboarding to a new project, or understanding your own legacy code. Generates a visual architecture map and plain-English explanations of how everything connects.

### What It Does
- Auto-generates an interactive architecture diagram (boxes = modules, arrows = data flow)
- Plain-English summary of what the project does, how it's structured, what each major piece does
- Click any component/file in the diagram → get instant AI explanation
- "Explain Like I'm New" mode for juniors
- "Explain the Data Flow" mode showing how a request travels through the system

### UI Flowchart

```
┌─────────────────────────────────────────────────────────────────────┐
│  CodeSage / my-saas-app / Explain                                   │
│                                                                     │
│  [📝 Summary]  [🗺️ Architecture Map]  [🔄 Data Flow]  [📂 Modules]│
│                                                                     │
│  ┌────── Architecture Map ─────────────────────────────────────┐   │
│  │                                                             │   │
│  │     [Browser / Client]                                      │   │
│  │          │                                                  │   │
│  │          ▼                                                  │   │
│  │  ┌───────────────────┐     ┌──────────────────────┐        │   │
│  │  │   Next.js App     │────▶│   Server Actions /   │        │   │
│  │  │   (App Router)    │     │   API Routes         │        │   │
│  │  └───────────────────┘     └──────────────────────┘        │   │
│  │          │                          │                       │   │
│  │          ▼                          ▼                       │   │
│  │  ┌───────────────┐        ┌─────────────────────┐          │   │
│  │  │  NextAuth.js  │        │     Prisma ORM      │          │   │
│  │  │  Auth Layer   │        │   (PostgreSQL)      │          │   │
│  │  └───────────────┘        └─────────────────────┘          │   │
│  │                                    │                        │   │
│  │                                    ▼                        │   │
│  │                          ┌──────────────────┐               │   │
│  │                          │   Neon / Supabase│               │   │
│  │                          │   Database       │               │   │
│  │                          └──────────────────┘               │   │
│  │                                                             │   │
│  │  Click any box to get an AI explanation →                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌────── Module Summary ─────────────────────────────────────────┐ │
│  │  This is a full-stack SaaS platform for developers. It uses   │ │
│  │  Next.js 15 App Router with server actions for data mutations. │ │
│  │  Authentication is handled by NextAuth.js. The database layer  │ │
│  │  uses Prisma ORM with a PostgreSQL database hosted on Neon.    │ │
│  │                                                               │ │
│  │  Main feature areas: Profile Management, Resume Builder,      │ │
│  │  AI Tools (Pathfinder, Studio, Resume AI), and a hiring flow. │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Module 5 — Docs (`/c/[slug]/docs`)

> **"Auto-generate documentation that doesn't suck"**

One of the most-hated tasks in engineering. CodeSage scans the codebase and produces structured, readable documentation — not just JSDoc comments, but actual human-readable docs.

### What It Does
- Generates: README, API reference, component docs, architecture docs
- Inline code examples pulled directly from the actual codebase
- Export as Markdown, HTML, or push directly to GitHub as a `docs/` folder
- Update mode — re-runs only on changed files
- "Quick README" — single-click README generator with badges, setup instructions, usage

### Doc Types Generated
```
📁 Generated Docs
├── README.md              ← Project overview, setup, env vars
├── ARCHITECTURE.md        ← High-level design decisions
├── API.md                 ← All API routes with params/responses
├── COMPONENTS.md          ← UI component library reference
├── DATABASE.md            ← Schema overview, model relationships
└── CONTRIBUTING.md        ← How to contribute, code style guide
```

### UI Flowchart

```
┌─────────────────────────────────────────────────────────────────────┐
│  CodeSage / my-saas-app / Docs                                      │
│                                                                     │
│  [⚡ Quick README]  [📚 Full Docs]  [🔧 API Reference]  [📤 Export]│
│                                                                     │
│  ┌────── Doc Navigator ─────┐  ┌──────── Preview ────────────────┐ │
│  │                          │  │                                  │ │
│  │  📄 README.md     ●      │  │  # my-saas-app                  │ │
│  │  🏗️  ARCHITECTURE.md     │  │                                  │ │
│  │  🔌 API.md               │  │  A developer productivity       │ │
│  │  🧩 COMPONENTS.md        │  │  platform built with Next.js 15  │ │
│  │  🗄️  DATABASE.md          │  │  and TypeScript.                │ │
│  │  🤝 CONTRIBUTING.md      │  │                                  │ │
│  │                          │  │  ## Quick Start                 │ │
│  │  [+ Generate More]       │  │  ```bash                        │ │
│  │                          │  │  pnpm install                   │ │
│  └──────────────────────────┘  │  pnpm dev                       │ │
│                                │  ```                             │ │
│                                │                                  │ │
│                                │  [✏️ Edit]  [📋 Copy]  [💾 Save] │ │
│                                └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Module 6 — Security (`/c/[slug]/security`)

> **"Find the holes before attackers do"**

Security-focused scan specifically tuned for common web vulnerabilities in the detected stack (Next.js, Node, etc.) rather than generic warnings.

### What It Detects
| Category | Examples |
|----------|---------|
| **Auth vulnerabilities** | Missing session validation, exposed admin routes, JWT misuse |
| **Input validation** | Unvalidated user input in server actions, SQL injection vectors |
| **Secrets exposure** | Hardcoded API keys, env vars logged to console |
| **CORS misconfiguration** | Overly permissive origins |
| **Dependency vulnerabilities** | Known CVEs in package.json dependencies |
| **XSS vectors** | `dangerouslySetInnerHTML` misuse, unescaped user content |
| **Rate limiting** | API routes without rate limiting |
| **CSRF** | State-changing actions without CSRF protection |

### UI Flowchart

```
┌─────────────────────────────────────────────────────────────────────┐
│  CodeSage / my-saas-app / Security                  [🔄 Re-scan]   │
│                                                                     │
│  Security Score: 72/100     Risk Level: 🟡 Medium                  │
│                                                                     │
│  ┌─── 🔴 CRITICAL (1) ──────────────────────────────────────────┐  │
│  │  🔑 Hardcoded secret found                                   │  │
│  │  lib/payment.ts:34 — API key appears to be hardcoded        │  │
│  │  Confidence: High                                            │  │
│  │  [▶ Details] [✅ False Positive]                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─── 🟠 HIGH (3) ──────────────────────────────────────────────┐  │
│  │  🚫 API route /api/admin lacks authentication check          │  │
│  │  🔓 User input not validated before DB insert in 2 actions   │  │
│  │  📡 CORS allows all origins (*)                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─── 🟡 MEDIUM (7) ────────────────────────────────────────────┐  │
│  │  [Collapsed — 7 issues]                                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─── 📦 Dependencies ──────────────────────────────────────────┐  │
│  │  3 packages with known CVEs    [View Details]                │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Module 7 — Refactor (`/c/[slug]/refactor`)

> **"Your senior engineer's code review, on demand"**

Proactive refactoring suggestions that improve the code without changing behavior. Different from Optimize (which is about performance/architecture) — this is purely about code quality and maintainability.

### What It Suggests
- Functions over 50 lines that can be decomposed
- Duplicate code that can be extracted into utilities
- Complex conditionals that can be simplified
- TypeScript improvements (better generics, stricter types)
- React patterns (custom hooks extraction, compound components)
- Naming improvements

### UI Flowchart

```
┌─────────────────────────────────────────────────────────────────────┐
│  CodeSage / my-saas-app / Refactor                                  │
│                                                                     │
│  ┌─── By File ────────────────────────────────────────────────────┐ │
│  │                                                                │ │
│  │  📄 components/profile/sheets/add-project-sheet.tsx           │ │
│  │     3 suggestions                                             │ │
│  │                                                               │ │
│  │  🔵 Extract custom hook: useProjectForm()                     │ │
│  │     Lines 50-110 can be extracted to reduce component size    │ │
│  │     Complexity: Medium · Impact: Code Readability             │ │
│  │     [▶ See Refactored Version]                               │ │
│  │                                                               │ │
│  │  🔵 Duplicate link/media handlers                            │ │
│  │     Link and media update handlers follow identical patterns  │ │
│  │     Can be merged into a generic updateArrayItem() helper     │ │
│  │     [▶ See Refactored Version]                               │ │
│  │                                                               │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Module 8 — Learn (`/c/[slug]/learn`)

> **"Turn any codebase into a structured learning curriculum"**

Especially valuable for juniors onboarding to a project, or for developers who want to deeply understand a codebase before contributing. The AI generates a structured learning path.

### What It Does
- Generates a guided "course" through the codebase from beginner to deep understanding
- Organized into chapters: Setup → Core Concepts → Key Modules → Advanced Patterns
- Each chapter has: reading material, code walkthroughs, mini-quizzes
- Progress tracking — mark chapters as done
- "Explain this to me" mode where you paste any code snippet and get a breakdown

### UI Flowchart

```
┌─────────────────────────────────────────────────────────────────────┐
│  CodeSage / my-saas-app / Learn                                     │
│                                                                     │
│  Your Learning Path                          Progress: 3/12 done   │
│  ██████░░░░░░░░░░░░░░  25%                                          │
│                                                                     │
│  Chapter 1: Project Overview               ✅ Done                 │
│  Chapter 2: Authentication Deep Dive       ✅ Done                 │
│  Chapter 3: Database Schema & Relations    ✅ Done                 │
│  Chapter 4: Server Actions Pattern         → In Progress           │
│  Chapter 5: Profile Module                 🔒 Locked               │
│  Chapter 6: AI Integrations                🔒 Locked               │
│  ...                                                                │
│                                                                     │
│  ┌────── Chapter 4: Server Actions ──────────────────────────────┐ │
│  │                                                               │ │
│  │  📖 Reading (5 min)                                          │ │
│  │  This project uses Next.js Server Actions for all data       │ │
│  │  mutations. Let's look at how they're structured...          │ │
│  │                                                               │ │
│  │  [Code examples from actions/(main)/user/profile.action.ts]  │ │
│  │                                                               │ │
│  │  🧠 Quiz: Why does `updateUserSkills` use `revalidatePath`?  │ │
│  │  ○ For security                                              │ │
│  │  ● To invalidate the Next.js cache after mutation            │ │
│  │  ○ It's required by TypeScript                               │ │
│  │  ○ For error handling                                        │ │
│  │                                                               │ │
│  │  [← Previous]  [Submit Answer]  [Next Chapter →]            │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Bonus Module — Compare (`/c/[slug]/compare`)

> **"How does my code stack up?"**

An advanced module that compares your codebase against best practices for the detected stack (e.g., Next.js 15 App Router conventions) and shows you where you're aligned vs. deviating and whether those deviations are intentional trade-offs or gaps.

Not a linting tool — more like a **senior engineer comparing your approach to how top-tier companies handle similar problems**.

---

## Technical Implementation Plan

### Stack for CodeSage Backend

```
User uploads GitHub URL or ZIP
         │
         ▼
File Ingestion Service
• Clone repo (github URL) / unzip (upload)
• Filter: exclude node_modules, .git, dist, .next
• Detect: language, framework, package manager
• Parse: package.json, prisma schema, env.example
         │
         ▼
Chunking & Indexing
• Split files into semantic chunks (function-level for .ts/.tsx)
• Generate embeddings (OpenAI text-embedding-3-small or Voyage)
• Store in vector DB (Pinecone / pgvector)
• Store raw file tree and metadata in Postgres
         │
         ▼
Per-Module Analyzers
• Ask: RAG pipeline — embed query → retrieve relevant chunks → LLM answer with citations
• Optimize: Full-scan analysis prompt with structured JSON output per issue
• Interview: Codebase-aware question generator → answer evaluator
• Security: Pattern matching + LLM analysis on high-risk file patterns
• Docs: Section-by-section doc generator
• Learn: Curriculum builder from architecture graph
```

### Database Models Needed

```prisma
model CodebaseProject {
  id          String   @id @default(cuid())
  userId      String
  name        String
  slug        String   @unique
  description String?
  sourceType  String   // "github" | "upload"
  sourceUrl   String?  // github URL
  fileCount   Int?
  detectedStack Json?  // { framework, language, packageManager }
  indexedAt   DateTime?
  createdAt   DateTime @default(now())
  
  sessions    CodebaseSession[]
  issues      OptimizationIssue[]
  interviews  CodebaseInterview[]
  learningProgress LearningProgress[]
}

model CodebaseSession {
  id         String   @id @default(cuid())
  projectId  String
  module     String   // "ask" | "optimize" | "interview" etc.
  messages   Json[]   // for ask module
  createdAt  DateTime @default(now())
}

model OptimizationIssue {
  id         String   @id @default(cuid())
  projectId  String
  category   String   // "performance" | "security" etc.
  severity   String   // "critical" | "high" | "medium" | "low"
  title      String
  filePath   String
  lineNumber Int?
  description String
  suggestion  String
  status     String   @default("open") // "open" | "done" | "ignored"
  createdAt  DateTime @default(now())
}

model CodebaseInterview {
  id          String   @id @default(cuid())
  projectId   String
  mode        String   // "explain" | "defend" | "improve"
  difficulty  String
  score       Int?
  questions   Json     // array of { question, answer, feedback, score }
  completedAt DateTime?
  createdAt   DateTime @default(now())
}
```

### File Tree Structure in Codebase

```
apps/main/app/(main)/ai/codesage/
├── page.tsx                          ← Dashboard (list of user's projects)
├── new/
│   └── page.tsx                      ← Add new project (GitHub URL / upload)
└── c/
    └── [slug]/
        ├── page.tsx                  ← Project hub (module grid)
        ├── layout.tsx                ← Shared layout with project header
        ├── ask/
        │   └── page.tsx
        ├── optimize/
        │   └── page.tsx
        ├── interview/
        │   └── page.tsx
        ├── explain/
        │   └── page.tsx
        ├── docs/
        │   └── page.tsx
        ├── security/
        │   └── page.tsx
        ├── refactor/
        │   └── page.tsx
        └── learn/
            └── page.tsx

apps/main/actions/(main)/codesage/
├── project.action.ts                 ← Create, get, delete projects
├── ask.action.ts                     ← RAG Q&A
├── optimize.action.ts                ← Run/fetch optimization scan
├── interview.action.ts               ← Generate questions, submit answers
├── security.action.ts                ← Security scan
└── docs.action.ts                    ← Doc generation

apps/main/components/codesage/
├── project-card.tsx
├── module-grid.tsx
├── ask-chat.tsx
├── optimize-issue-card.tsx
├── interview-question.tsx
├── architecture-diagram.tsx
└── learn-chapter.tsx
```

---

## Phased Launch Plan

### Phase 1 — MVP (Build First)
- [ ] Project ingestion (GitHub URL + basic ZIP)
- [ ] Ask module (RAG Q&A with file citations)
- [ ] Optimize module (top 20 checks for Next.js/React)
- [ ] Interview module (3 question types, text only)

### Phase 2 — Depth
- [ ] Explain module (architecture diagram)
- [ ] Security module
- [ ] Docs module (README + API docs)
- [ ] Voice mode for interview

### Phase 3 — Social & Monetization
- [ ] Shareable interview summary cards
- [ ] Public project pages (`/codesage/public/[slug]`)
- [ ] Team mode (multiple users on same project)
- [ ] Credits system — X free scans/month, paid for more
- [ ] Integrations — GitHub webhook to auto-rescan on push

---

## What Makes This The Best

| Feature | CodeSage | Greptile | Cursor | SonarQube | CodeClimate |
|---------|----------|----------|--------|-----------|-------------|
| Web-based (no install) | ✅ | API only | ❌ IDE | ❌ Self-hosted | ✅ |
| Q&A with file citations | ✅ | ✅ | ✅ | ❌ | ❌ |
| Codebase mock interview | ✅ | ❌ | ❌ | ❌ | ❌ |
| Actionable fix diffs | ✅ | ❌ | ✅ | Partial | ❌ |
| Architecture visualization | ✅ | ❌ | ❌ | ❌ | ❌ |
| Auto-generated docs | ✅ | ❌ | ❌ | ❌ | ❌ |
| Structured learning path | ✅ | ❌ | ❌ | ❌ | ❌ |
| GitHub ZIP upload | ✅ | ❌ | N/A | ❌ | ❌ |
| Turborepo / monorepo aware | ✅ | Partial | ✅ | Partial | ❌ |
| Consumer-friendly pricing | ✅ | $$$ API | $20/mo | $$$ | $$$ |

**The unique angle:** CodeSage is the only tool targeting **individual developers** who want to learn from, improve, and interview on their own codebase — without installing an IDE extension or paying enterprise prices. It's a web app. You paste a GitHub link. You get instant intelligence.

---

*Created: 2026-04-29 | Status: Blueprint / Pre-build*
