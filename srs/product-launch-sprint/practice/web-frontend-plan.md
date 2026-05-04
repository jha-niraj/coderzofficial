# Web Frontend Practice Module — Complete Build Plan
> Module path: `apps/main/app/(main)/practice/web-frontend/`
> Actions: `apps/main/actions/(main)/practice/` (shared)
> Last updated: April 2026

---

## What This Module Does

Web Frontend practice covers the concepts and coding skills required for frontend engineering interviews: HTML/CSS, JavaScript fundamentals, React, browser APIs, performance optimization, accessibility, and frontend system design. Unlike DSA which has a clear pass/fail based on test cases, frontend practice combines:
- **Concept questions** (MCQ + written) — "What is the event loop? How does closure work?"
- **Coding challenges** — "Build a debounce function", "Implement infinite scroll", "Fix this React re-render issue"
- **UI implementation** — "Build this component from a screenshot/spec" (evaluated by AI)
- **AI conversation** — Socratic discussion about browser internals, React patterns, performance

---

## Current State — What Is Already Built

### Pages
- `/practice/web-frontend` — Module landing page.
- `/practice/web-frontend/[slug]` — Problem workspace (shared workspace component).

### Actions
- `getProblemsForModule('WEB_FRONTEND')` — Fetches problems filtered by module type.
- `getOrCreateSession()` — Creates session.
- `saveSessionProgress()` — Saves code + chat history.
- `assess.action.ts` — Has `WEB_FRONTEND` system prompt.

### Problem Types (from `PracticeProblem` schema)
Problems can be typed as:
- `CODING` — Write JavaScript/TypeScript code (evaluated by CoderzWorker + AI)
- `CONCEPTUAL` — Explain a concept (evaluated by AI only)
- `UI_IMPLEMENTATION` — Build a UI component (evaluated by AI looking at rendered output)
- `DEBUG` — Fix broken code (evaluated by CoderzWorker + AI)
- `OPTIMIZATION` — Improve performance of given code (AI evaluates approach + code)

---

## What Needs to Be Built

### Priority 1 — Problem Categories & Content

The most pressing need is having enough problems across the right categories.

- [ ] **Seed `PracticeProblem` records for WEB_FRONTEND**:
  - Minimum 60 problems:

  **JavaScript Fundamentals (15 problems):**
  - Implement debounce, throttle from scratch
  - Implement Promise.all, Promise.race from scratch
  - Implement a deep clone function
  - Explain and demonstrate closure with a practical example
  - Implement event delegation
  - Implement a simple event emitter (pub/sub)
  - Flatten nested array without Array.flat()
  - Implement curry function
  - Memoization implementation
  - Explain and demonstrate the event loop (written explanation evaluated by AI)

  **React & Component Design (15 problems):**
  - Build a custom useDebounce hook
  - Build a custom useLocalStorage hook
  - Implement infinite scroll with IntersectionObserver
  - Fix a React re-render performance issue (given buggy code)
  - Implement a virtualized list (render only visible items)
  - Build a form with validation (no library)
  - Implement drag-and-drop without a library
  - Build a Modal component with portal and focus trap
  - Implement optimistic UI updates
  - Context vs Redux — explain with example

  **CSS & Layout (10 problems):**
  - Center a div (5 different methods)
  - Build a responsive grid layout
  - Build a navbar that collapses to hamburger menu
  - Implement CSS animations (loading spinner, progress bar)
  - Explain BEM naming convention and refactor given CSS

  **Browser APIs & Performance (10 problems):**
  - Implement lazy loading for images
  - Implement service worker for offline caching
  - Measure and improve Largest Contentful Paint
  - Implement virtual scrolling
  - Explain how browser rendering pipeline works

  **Frontend System Design (10 problems):**
  - Design a real-time collaborative text editor (like Google Docs frontend)
  - Design a notifications system UI
  - Design a YouTube-like video player component
  - Design a data table with virtual scrolling + sorting + filtering

### Priority 2 — AI Evaluation for Frontend

Frontend problems are harder to evaluate than DSA because there's no single correct answer.

- [ ] **`evaluateFrontendCode()` action**:
  - For CODING problems: run code through CoderzWorker (Node.js runner for JS/TS). Check against test cases. Also pass code to AI for quality evaluation (readability, edge cases, browser compatibility, performance).
  - For CONCEPTUAL problems: pass user's written answer to AI for evaluation. AI gives 0–10 score with specific feedback on what was correct/missing.
  - For UI_IMPLEMENTATION: this is complex — for now, evaluate the code itself (not rendered output). AI checks if the implementation is correct in theory.
  - For DEBUG problems: run the fixed code through CoderzWorker. Check if it passes the test cases that were failing.
  - For OPTIMIZATION problems: run both original and optimized code, compare execution time + memory. AI evaluates if the approach is correct.

- [ ] **Socratic AI for conceptual questions**:
  - When user answers a conceptual question: AI doesn't just say correct/incorrect.
  - AI asks follow-up: "You mentioned closures capture by reference — can you give me an example where that causes a bug?"
  - Same Socratic approach as DSA — push for depth.

### Priority 3 — Workspace UI for Frontend

The generic `practice-workspace.tsx` needs frontend-specific enhancements:

- [ ] **Browser preview panel** (for UI problems):
  - An iframe that renders the student's HTML/CSS/JS code in real-time.
  - Shows the rendered UI side-by-side with the code editor.
  - Update preview on Ctrl+Enter (not on every keystroke — too expensive).
  - Uses a sandboxed iframe with no network access.

- [ ] **Multi-file support** (for React problems):
  - Some problems need multiple files (component.jsx + styles.css + test.js).
  - Minimal file tabs in the editor (not a full VSCode — just 2–3 files).

- [ ] **Console output panel**: For JS problems, show console.log output without needing a full browser. Use CoderzWorker to execute and capture stdout.

### Priority 4 — Topic Organization

- [ ] **Topic/category hierarchy** for web frontend:
  ```
  JavaScript Core
  ├── Closures & Scope
  ├── Async (Promises, async/await, event loop)
  ├── Prototype & Classes
  ├── Functional Programming
  └── ES6+ Features
  
  React & Modern Frontend
  ├── Hooks & State
  ├── Performance (memo, useMemo, useCallback)
  ├── Patterns (HOC, render props, compound components)
  └── Testing
  
  CSS & Styling
  ├── Layout (Flexbox, Grid)
  ├── Responsive Design
  └── Animations
  
  Browser & Web APIs
  ├── DOM Manipulation
  ├── Web Storage & Cookies
  ├── Service Workers & PWA
  └── Performance APIs
  
  Frontend System Design
  └── (large problems, evaluated differently)
  ```

### Priority 5 — Spaced Repetition (Same as DSA)

- [ ] Revision scheduling: day 3, day 7, day 10 for each solved problem.
- [ ] Conceptual problems are quicker to revise — just the explanation, no coding.
- [ ] "Flash card mode" for conceptual questions — quick 5-minute revision sessions.

---

## File Checklist

```
apps/main/
├── app/(main)/practice/web-frontend/
│   ├── page.tsx                                  ✅ exists
│   └── [slug]/page.tsx                           ⚠️  exists, needs browser preview panel
│
├── app/(main)/practice/_components/workspace/
│   ├── practice-workspace.tsx                   ✅ exists
│   ├── browser-preview-panel.tsx               ❌  needs to be CREATED
│   └── console-output-panel.tsx               ❌  needs to be CREATED (or shared with DSA)
│
└── actions/(main)/practice/
    └── assess.action.ts                        ⚠️  has WEB_FRONTEND prompt, needs frontend-specific evaluation
```

---

## Implementation Order

1. Seed 60 frontend problems across all categories
2. `evaluateFrontendCode()` — code execution + AI quality evaluation
3. Conceptual question AI evaluation with Socratic follow-up
4. Browser preview iframe panel for UI problems
5. Console output panel for JS execution
6. Spaced repetition scheduling
7. Flash card mode for quick conceptual revision
8. Topic/category hierarchy in the UI
