# 🌐 Web Dev Practice Module — Complete Blueprint

> **Routes:**  
> - Frontend: `/mock/practice/web/frontend/[problemSlug]`  
> - Backend: `/mock/practice/web/backend/[problemSlug]`  
> **Workspace Type:** Code Editor + Live Preview (Frontend) / API Tester (Backend)  
> **Purpose:** Real-world web development skills practice with AI code review

---

## Table of Contents

1. [Why Web Dev Needs Its Own Workspace](#1-why-web-dev-needs-its-own-workspace)
2. [Frontend Track — Layout & Wireframe](#2-frontend-track--layout--wireframe)
3. [Backend Track — Layout & Wireframe](#3-backend-track--layout--wireframe)
4. [Frontend Assessment Flow](#4-frontend-assessment-flow)
5. [Backend Assessment Flow](#5-backend-assessment-flow)
6. [AI Prompt Engineering for Web Dev](#6-ai-prompt-engineering-for-web-dev)
7. [Problem Categories](#7-problem-categories)
8. [Voice Interaction for Web Dev](#8-voice-interaction-for-web-dev)
9. [User Flow Diagrams](#9-user-flow-diagrams)
10. [Example Walkthroughs](#10-example-walkthroughs)

---

## 1. Why Web Dev Needs Its Own Workspace

Web development problems differ from DSA and System Design in fundamental ways:

| Aspect | DSA | System Design | Web Dev |
|--------|-----|---------------|---------|
| **What's Built** | Algorithm | Architecture | Working code |
| **Assessment** | Approach correctness | Design completeness | Code quality + behavior |
| **Key Skills** | Logic, optimization | Trade-offs, scale | Patterns, best practices |
| **Visual Output** | None | Diagram | UI / API response |
| **Common Issues** | Wrong algorithm | Missing components | Bad patterns, no error handling |
| **AI Focus** | Algorithm guidance | Architecture review | Code review + security |

### The Two Tracks

```
┌──────────────────────────────────────────────────────────────────┐
│                    WEB DEV PRACTICE                               │
│                                                                  │
│  ┌───────────────────────┐  ┌───────────────────────────┐       │
│  │   FRONTEND TRACK       │  │   BACKEND TRACK            │       │
│  │                         │  │                            │       │
│  │  Code Editor            │  │  Code Editor               │       │
│  │  + Live Preview         │  │  + API Tester              │       │
│  │  + AI Chat              │  │  + AI Chat                 │       │
│  │                         │  │                            │       │
│  │  Problems:              │  │  Problems:                 │       │
│  │  • React Components     │  │  • REST APIs               │       │
│  │  • State Management     │  │  • Authentication          │       │
│  │  • API Integration      │  │  • Database Queries        │       │
│  │  • Accessibility        │  │  • Middleware               │       │
│  │  • CSS/Layout           │  │  • Error Handling          │       │
│  │  • Performance          │  │  • Caching Strategies      │       │
│  │                         │  │                            │       │
│  │  /web/frontend/[slug]   │  │  /web/backend/[slug]       │       │
│  └───────────────────────┘  └───────────────────────────┘       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Track — Layout & Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ◀ Practice    Web › Frontend › Accessible Dropdown         🔊 OFF  ⏱     │
├──────────┬─────────────────────┬──────────────┬─────────────────────────────┤
│          │                     │              │                             │
│ PROBLEM  │   CODE EDITOR       │ LIVE PREVIEW │   AI MENTOR                 │
│          │                     │              │                             │
│ Build an │  Tabs: [JS] [CSS]  │  ┌────────┐  │  ┌───────────────────────┐  │
│ access-  │                     │  │        │  │  │ 🤖 You're building   │  │
│ ible     │  // Dropdown.jsx    │  │ Select │  │  │ an accessible        │  │
│ dropdown │  export default     │  │ ─────  │  │  │ dropdown. Think      │  │
│ component│  function Dropdown  │  │ Opt 1  │  │  │ about:               │  │
│          │  ({ options }) {    │  │ Opt 2  │  │  │ • Keyboard nav       │  │
│ Require- │    const [open,    │  │ Opt 3  │  │  │ • ARIA attributes    │  │
│ ments:   │    setOpen] =      │  │        │  │  │ • Focus management   │  │
│          │    useState(false)  │  │        │  │  │                       │  │
│ ☐ Keyboard│                    │  └────────┘  │  │ Hit "Run & Assess"   │  │
│   nav    │                     │              │  │ when ready!           │  │
│ ☐ ARIA   │                     │  Status:     │  └───────────────────────┘  │
│   labels │                     │  Renders ✅  │                             │
│ ☐ Focus  │                     │  No errors   │  ┌───────────────────────┐  │
│   trap   │                     │              │  │ Requirements Check:   │  │
│ ☐ ESC    │                     │              │  │ ☐ Keyboard nav       │  │
│   close  │                     │              │  │ ☐ ARIA attributes    │  │
│ ☐ Click  │                     │              │  │ ☐ Focus management   │  │
│   outside│                     │              │  │ ☐ ESC to close       │  │
│   close  │                     │              │  │ ☐ Click outside      │  │
│          │  [▶ Run & Assess]   │              │  └───────────────────────┘  │
│          │                     │              │                             │
├──────────┴─────────────────────┴──────────────┴─────────────────────────────┤
│  Attempt: 1  │  Requirements Met: 0/5  │  💡 Hints available              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Frontend Editor Features

- **Multi-file tabs:** JSX/TSX, CSS, test file (read-only)
- **Live Preview:** Real-time rendering of the component using an iframe sandbox
- **Hot Reload:** Preview updates as user types (debounced)
- **Browser DevTools Lite:** Console output visible in preview panel
- **Responsive Toggle:** Test at mobile/tablet/desktop widths

### How Live Preview Works

```
┌──────────────────────────────────────────────────────────────────┐
│              FRONTEND LIVE PREVIEW ARCHITECTURE                  │
│                                                                  │
│  User Code              Sandboxed iframe          Preview        │
│  ┌──────────┐          ┌──────────────┐         ┌──────────┐   │
│  │ JSX Code │──build──▶│ Bundled JS   │──render─▶│ Component│   │
│  │ CSS Code │──inject─▶│ + Styles     │         │ Output   │   │
│  └──────────┘          └──────────────┘         └──────────┘   │
│                                                                  │
│  We use an iframe with sandboxed execution:                     │
│  • User's React code is transpiled in-browser (via esbuild-wasm │
│    or SWC-wasm)                                                  │
│  • Injected into a sandboxed iframe                              │
│  • Console.log/errors captured and displayed                     │
│  • No access to parent page (security)                           │
│                                                                  │
│  For simpler problems (HTML/CSS only):                           │
│  • Direct injection into iframe srcdoc                          │
│  • No bundling needed                                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Backend Track — Layout & Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ◀ Practice    Web › Backend › JWT Auth Middleware           🔊 OFF  ⏱     │
├──────────┬──────────────────────────────┬───────────────────────────────────┤
│          │                              │                                   │
│ PROBLEM  │     CODE EDITOR              │     AI MENTOR                     │
│          │                              │                                   │
│ Build    │  // middleware/auth.js       │  ┌─────────────────────────────┐  │
│ JWT      │                              │  │ 🤖 You're building a JWT   │  │
│ Auth     │  export function             │  │ auth middleware for an     │  │
│ Middle-  │  authMiddleware(req,         │  │ Express.js API.            │  │
│ ware     │  res, next) {                │  │                             │  │
│          │    const token =             │  │ Key considerations:        │  │
│ Require- │    req.headers.auth          │  │ • Token extraction         │  │
│ ments:   │                              │  │ • Verification             │  │
│          │    if (!token) {             │  │ • Error responses          │  │
│ ☐ Extract│      return res              │  │ • Payload attachment       │  │
│   JWT    │      .status(401)            │  │                             │  │
│ ☐ Verify │      .json({err: "No"})     │  │ Hit "Run & Assess"!        │  │
│ ☐ Handle │    }                         │  └─────────────────────────────┘  │
│   errors │                              │                                   │
│ ☐ Attach │    // verify here...         │  ── API Tester ────────────────  │
│   user   │  }                           │  ┌─────────────────────────────┐  │
│ ☐ Handle │                              │  │ Test Cases:                 │  │
│   expiry │                              │  │                             │  │
│          │                              │  │ 1. No token → 401     ❓   │  │
│ Context: │                              │  │ 2. Invalid token → 403 ❓   │  │
│ Express  │                              │  │ 3. Expired token → 401 ❓   │  │
│ Node.js  │                              │  │ 4. Valid token → next() ❓  │  │
│          │                              │  │ 5. Bearer prefix → ✓   ❓   │  │
│          │  [▶ Run & Assess]            │  │                             │  │
│          │                              │  └─────────────────────────────┘  │
│          │                              │                                   │
│          │                              │  ┌─────────────────────────────┐  │
│          │                              │  │ 💬 Type or speak...  [🎤]  │  │
│          │                              │  │                  [Send]    │  │
│          │                              │  └─────────────────────────────┘  │
│          │                              │                                   │
├──────────┴──────────────────────────────┴───────────────────────────────────┤
│  Attempt: 1  │  Tests: 0/5 passing  │  Security Score: —                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Backend "API Tester" Panel

Instead of a live preview, backend problems have an **API Tester** that shows test scenarios:

```
┌──────────────────────────────────────────────────────────────────┐
│                    API TESTER PANEL                               │
│                                                                  │
│  Test 1: No Authorization Header                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Request:                                                  │   │
│  │   GET /api/protected                                     │   │
│  │   Headers: {}                                             │   │
│  │                                                          │   │
│  │ Expected Response:                                        │   │
│  │   Status: 401 Unauthorized                                │   │
│  │   Body: { "error": "No authorization token provided" }   │   │
│  │                                                          │   │
│  │ AI Analysis:  ❓ Pending (click Run & Assess)            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Test 2: Invalid Token                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Request:                                                  │   │
│  │   GET /api/protected                                     │   │
│  │   Headers: { Authorization: "Bearer invalid_token" }     │   │
│  │                                                          │   │
│  │ Expected: 403 Forbidden                                   │   │
│  │ AI Analysis:  ❓ Pending                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Test 3: Valid Token                                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Request:                                                  │   │
│  │   GET /api/protected                                     │   │
│  │   Headers: { Authorization: "Bearer eyJhbG..." }         │   │
│  │                                                          │   │
│  │ Expected: 200 OK + req.user attached                     │   │
│  │ AI Analysis:  ❓ Pending                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Note: We do NOT run your code against a real server.           │
│  The AI analyzes your code logic and simulates the behavior.    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Frontend Assessment Flow

### What the AI Evaluates for Frontend

```
┌──────────────────────────────────────────────────────────────────┐
│           FRONTEND AI EVALUATION CRITERIA                        │
│                                                                  │
│  1. FUNCTIONALITY (Does it work?)                               │
│     • Does the component render correctly?                      │
│     • Does it handle user interactions?                         │
│     • Are edge cases handled (empty state, loading)?            │
│                                                                  │
│  2. ACCESSIBILITY (a11y)                                        │
│     • ARIA attributes (role, aria-label, aria-expanded)         │
│     • Keyboard navigation (Tab, Enter, Escape, Arrow keys)     │
│     • Focus management (focus trap, focus return)               │
│     • Screen reader compatibility                               │
│     • Color contrast (if CSS is involved)                       │
│                                                                  │
│  3. CODE QUALITY                                                 │
│     • Proper React patterns (hooks, composition)                │
│     • No anti-patterns (unnecessary re-renders, etc.)          │
│     • Clean, readable code                                      │
│     • Proper event handling                                     │
│                                                                  │
│  4. PERFORMANCE                                                  │
│     • Unnecessary re-renders avoided                            │
│     • Debouncing/throttling where needed                        │
│     • Efficient state management                                │
│     • No memory leaks (cleanup in useEffect)                   │
│                                                                  │
│  5. STYLING & UX                                                 │
│     • Responsive design                                          │
│     • Smooth transitions/animations                              │
│     • User feedback (loading states, errors)                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Frontend AI Response Example

```markdown
🤖 **Frontend Code Review — Attempt 1**

**Component:** Accessible Dropdown
**Requirements Met:** 2/5

**What's Working:**
✅ Basic open/close toggle with useState
✅ Options render correctly in a list

**Issues Found:**

🔴 **Accessibility — Missing ARIA attributes:**
Your `<div>` on **line 8** acts as a button but has no `role="button"` 
or `aria-expanded` attribute. Screen readers can't identify it.

```jsx
// Your code (line 8):
<div onClick={() => setOpen(!open)}>Select an option</div>

// Should be:
<button 
  role="combobox"
  aria-expanded={open}
  aria-haspopup="listbox"
  onClick={() => setOpen(!open)}
>
  Select an option
</button>
```

🔴 **Keyboard Navigation Missing:**
Users can't navigate options with Arrow keys or select with Enter.

```mermaid
graph TD
    A[User presses Tab] --> B{Dropdown focused?}
    B -->|Yes| C[Press Enter/Space]
    C --> D[Dropdown opens]
    D --> E[Arrow Down → Next option]
    E --> F[Enter → Select option]
    F --> G[Dropdown closes]
    D --> H[Escape → Close]
    
    style E fill:#ff6b6b
    style F fill:#ff6b6b
    style H fill:#ff6b6b
```

The red nodes are what your component is missing. You need `onKeyDown` 
event handlers for Arrow keys, Enter, and Escape.

🟡 **No Click Outside to Close:**
When the dropdown is open and the user clicks elsewhere, it stays open.
Consider using a `useEffect` with a `mousedown` event listener on `document`.

💭 **Question:** How would you handle focus when the dropdown opens? 
Should focus move to the first option, or stay on the trigger button?
```

---

## 5. Backend Assessment Flow

### What the AI Evaluates for Backend

```
┌──────────────────────────────────────────────────────────────────┐
│           BACKEND AI EVALUATION CRITERIA                         │
│                                                                  │
│  1. CORRECTNESS (Does the logic work?)                          │
│     • Correct HTTP status codes                                 │
│     • Proper request/response handling                          │
│     • Edge case handling                                        │
│                                                                  │
│  2. SECURITY                                                     │
│     • Input validation & sanitization                           │
│     • SQL injection prevention                                  │
│     • XSS prevention                                             │
│     • Proper auth token handling                                │
│     • Sensitive data exposure                                    │
│     • Rate limiting considerations                              │
│                                                                  │
│  3. ERROR HANDLING                                               │
│     • Try-catch blocks where needed                             │
│     • Meaningful error messages                                 │
│     • Proper error status codes                                 │
│     • Logging (not console.log in prod)                         │
│                                                                  │
│  4. CODE STRUCTURE                                               │
│     • Separation of concerns                                    │
│     • Middleware patterns                                        │
│     • Async/await properly used                                 │
│     • No callback hell                                           │
│                                                                  │
│  5. BEST PRACTICES                                               │
│     • HTTP status codes used correctly                          │
│     • RESTful conventions followed                              │
│     • Environment variables for secrets                         │
│     • Proper JSON responses                                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Backend AI Response Example

```markdown
🤖 **Backend Code Review — Attempt 1**

**Problem:** JWT Authentication Middleware
**Tests Passing (AI estimated):** 2/5

**What's Working:**
✅ You correctly check for the presence of a token
✅ Your 401 response for missing tokens is appropriate

**Issues Found:**

🔴 **Security — Bearer Prefix Not Handled:**
On **line 5**, you're reading `req.headers.authorization` directly, 
but standard JWT auth uses the `Bearer ` prefix:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Your code reads the entire header value including "Bearer ", which 
will fail `jwt.verify()`. You need to split it:

```mermaid
graph LR
    A["Authorization: Bearer eyJ..."] --> B[Split by space]
    B --> C["Bearer"]
    B --> D["eyJ... (actual token)"]
    style C fill:#ff6b6b
    style D fill:#51cf66
```

🔴 **No try-catch Around jwt.verify():**
**Line 10** — `jwt.verify()` throws an error if the token is invalid or 
expired. Without a try-catch, your entire server crashes!

```mermaid
graph TD
    A[jwt.verify called] --> B{Token valid?}
    B -->|Yes| C[Continue to next]
    B -->|No| D[THROWS ERROR ❌]
    D --> E[Server crashes!]
    
    B2{Token valid?} -->|No| F[Catch error]
    F --> G[Return 403 + error message]
    
    style D fill:#ff6b6b
    style E fill:#ff6b6b
    style G fill:#51cf66
```

🟡 **Expired Token Not Specifically Handled:**
When a token expires, `jwt.verify()` throws a `TokenExpiredError`. 
You should distinguish this from a malformed token:
- Expired → 401 + "Token expired, please login again"
- Invalid → 403 + "Invalid token"

💭 **Question:** What's the difference between a 401 and 403 status code? 
When should you use each in authentication?
```

---

## 6. AI Prompt Engineering for Web Dev

### System Prompt for Frontend

```markdown
You are a Senior Frontend Engineer reviewing code on CoderzHQ Practice.

## Focus Areas:
1. React best practices and patterns
2. Accessibility (WCAG 2.1 AA compliance)
3. Performance optimization
4. Clean, maintainable code
5. User experience

## Rules:
1. Check for accessibility issues FIRST (a11y is critical)
2. Reference specific line numbers
3. Show correct code snippets but explain WHY, not just WHAT
4. Use mermaid for component lifecycle, event flow, state diagrams
5. For Assist mode, provide the implementation approach step by step
6. Never give the complete component — guide them

## Output Format:
1. Requirements checklist with ✅/❌
2. What's working (positive feedback)
3. Issues with severity and line references
4. Mermaid diagram of expected behavior flow
5. One guiding question
```

### System Prompt for Backend

```markdown
You are a Senior Backend Engineer reviewing server-side code on CoderzHQ Practice.

## Focus Areas:
1. Security vulnerabilities (OWASP Top 10)
2. Error handling and resilience
3. HTTP standards and RESTful conventions
4. Database query efficiency
5. Code structure and patterns

## Rules:
1. Check for SECURITY issues FIRST
2. Simulate API test cases mentally (analyze if code handles each scenario)
3. Reference specific line numbers
4. Use mermaid for request flow, error handling paths, auth flows
5. Point out potential edge cases the user missed
6. For Assist mode, explain the "why" behind best practices

## Output Format:
1. Simulated test results (Pass/Fail per scenario)
2. Security audit findings
3. Code quality observations
4. Mermaid diagram of request/response flow
5. One guiding question about error handling or security
```

---

## 7. Problem Categories

### Frontend Categories

```
┌──────────────────────────────────────────────────────────────────┐
│                    FRONTEND PROBLEMS                              │
│                                                                  │
│  React Components (12 problems):                                │
│  ├── Accessible Dropdown          Easy    ☐                     │
│  ├── Autocomplete Search          Medium  ☐                     │
│  ├── Modal with Focus Trap        Medium  ☐                     │
│  ├── Infinite Scroll List         Medium  ☐                     │
│  ├── Drag and Drop List           Hard    ☐                     │
│  ├── Virtual Scrolling Table      Hard    ☐                     │
│  ├── Date Picker                  Hard    ☐                     │
│  ├── Toast Notification System    Easy    ☐                     │
│  ├── Tabs Component               Easy    ☐                     │
│  ├── Accordion                    Easy    ☐                     │
│  ├── Multi-Select Combobox        Medium  ☐                     │
│  └── Carousel/Slider              Medium  ☐                     │
│                                                                  │
│  State Management (8 problems):                                 │
│  ├── Todo App with Context        Easy    ☐                     │
│  ├── Shopping Cart State          Medium  ☐                     │
│  ├── Form with Validation         Medium  ☐                     │
│  ├── Undo/Redo System             Hard    ☐                     │
│  ├── Optimistic UI Updates        Medium  ☐                     │
│  ├── Real-time Data Sync          Hard    ☐                     │
│  ├── Pagination State             Easy    ☐                     │
│  └── Multi-step Form Wizard       Medium  ☐                     │
│                                                                  │
│  API Integration (6 problems):                                  │
│  ├── Fetch with Loading/Error     Easy    ☐                     │
│  ├── Debounced Search             Medium  ☐                     │
│  ├── File Upload with Progress    Medium  ☐                     │
│  ├── Polling with Cleanup         Medium  ☐                     │
│  ├── WebSocket Chat Display       Hard    ☐                     │
│  └── Retry Logic + Exponential    Hard    ☐                     │
│                                                                  │
│  Performance (6 problems):                                      │
│  ├── Memo & useCallback           Easy    ☐                     │
│  ├── Lazy Loading Components      Medium  ☐                     │
│  ├── Image Optimization           Easy    ☐                     │
│  ├── Bundle Size Reduction        Hard    ☐                     │
│  ├── Web Worker Integration       Hard    ☐                     │
│  └── Virtualized List             Medium  ☐                     │
│                                                                  │
│  CSS & Layout (8 problems):                                     │
│  ├── Responsive Grid Layout       Easy    ☐                     │
│  ├── Flexbox Holy Grail           Easy    ☐                     │
│  ├── CSS Animation (Loader)       Easy    ☐                     │
│  ├── Dark Mode Toggle             Easy    ☐                     │
│  ├── Sticky Header + Scroll Spy   Medium  ☐                     │
│  ├── CSS-only Dropdown            Medium  ☐                     │
│  ├── Masonry Layout               Medium  ☐                     │
│  └── Complex Table Layout         Hard    ☐                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Backend Categories

```
┌──────────────────────────────────────────────────────────────────┐
│                    BACKEND PROBLEMS                               │
│                                                                  │
│  REST APIs (8 problems):                                        │
│  ├── CRUD Operations              Easy    ☐                     │
│  ├── Pagination + Filtering       Medium  ☐                     │
│  ├── File Upload API              Medium  ☐                     │
│  ├── Search API with Fuzzy Match  Medium  ☐                     │
│  ├── Batch Operations API         Medium  ☐                     │
│  ├── API Versioning               Easy    ☐                     │
│  ├── HATEOAS Response Design      Hard    ☐                     │
│  └── GraphQL Resolver             Hard    ☐                     │
│                                                                  │
│  Authentication (6 problems):                                   │
│  ├── JWT Auth Middleware          Easy    ☐                     │
│  ├── OAuth2 Integration           Medium  ☐                     │
│  ├── Refresh Token Rotation       Medium  ☐                     │
│  ├── Role-Based Access Control    Medium  ☐                     │
│  ├── API Key Validation           Easy    ☐                     │
│  └── Session Management           Medium  ☐                     │
│                                                                  │
│  Database (8 problems):                                         │
│  ├── Prisma CRUD Operations       Easy    ☐                     │
│  ├── Complex Joins Query          Medium  ☐                     │
│  ├── Transaction Handling         Medium  ☐                     │
│  ├── Database Migration           Medium  ☐                     │
│  ├── Query Optimization           Hard    ☐                     │
│  ├── Connection Pooling           Medium  ☐                     │
│  ├── Soft Delete Pattern          Easy    ☐                     │
│  └── Full-Text Search             Hard    ☐                     │
│                                                                  │
│  Middleware & Patterns (6 problems):                            │
│  ├── Error Handler Middleware     Easy    ☐                     │
│  ├── Rate Limiter                 Medium  ☐                     │
│  ├── Request Logger               Easy    ☐                     │
│  ├── CORS Configuration           Easy    ☐                     │
│  ├── Request Validation (Zod)     Medium  ☐                     │
│  └── Caching Middleware           Medium  ☐                     │
│                                                                  │
│  Error Handling (4 problems):                                   │
│  ├── Global Error Handler         Easy    ☐                     │
│  ├── Async Error Wrapper          Medium  ☐                     │
│  ├── Custom Error Classes         Easy    ☐                     │
│  └── Graceful Shutdown            Hard    ☐                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 8. Voice Interaction for Web Dev

### Web Dev Voice Scenarios

```
┌──────────────────────────────────────────────────────────────────┐
│           VOICE INTERACTION FOR WEB DEV                          │
│                                                                  │
│  Frontend Scenario:                                             │
│  ──────────────────                                             │
│  🎤 User: "My dropdown closes when I click on an option        │
│            but the focus doesn't go back to the trigger."       │
│                                                                  │
│  🔊 AI:   "Focus management is crucial for accessibility.       │
│            When the dropdown closes, you should return focus    │
│            to the trigger button. Use a useRef to store a       │
│            reference to the button, and in your close handler,  │
│            call buttonRef.current.focus(). This way, keyboard   │
│            users don't lose their place on the page."           │
│                                                                  │
│  Backend Scenario:                                              │
│  ─────────────────                                              │
│  🎤 User: "I'm returning a 404 here when the user sends        │
│            an invalid email format. Is that right?"             │
│                                                                  │
│  🔊 AI:   "Good question! A 404 means 'resource not found',    │
│            but an invalid email format is 'bad input data'.     │
│            That's a 400 Bad Request. A 404 would be if you     │
│            searched for a user by email and they didn't exist.  │
│            See the difference? 400 means 'your request is      │
│            malformed', 404 means 'what you're looking for       │
│            doesn't exist'."                                      │
│                                                                  │
│  Security Scenario:                                             │
│  ─────────────────                                              │
│  🎤 User: "Is it okay to put the JWT secret directly in my     │
│            middleware file?"                                     │
│                                                                  │
│  🔊 AI:   "Absolutely not! Never hardcode secrets in your      │
│            source code. Use environment variables. In Node.js,  │
│            use process.env.JWT_SECRET and store the actual      │
│            value in a .env file that's git-ignored. In          │
│            production, use your hosting platform's secret       │
│            management."                                          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 9. User Flow Diagrams

### Frontend Problem Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                    FRONTEND PROBLEM USER JOURNEY                     │
│                                                                      │
│  User selects "Web Dev" → "Frontend" → "Accessible Dropdown"       │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │ MODE SELECTION                                                │   │
│  │  [🎯 Exam]  [🤝 Assist]    [🔊 Voice ON/OFF]               │   │
│  └───────────────────────────────┬───────────────────────────────┘   │
│                                  │                                   │
│                                  ▼                                   │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │ FOUR-PANEL WORKSPACE (Frontend has an extra preview panel)   │   │
│  │                                                               │   │
│  │ [Problem] | [Code Editor] | [Live Preview] | [AI Chat]      │   │
│  │                                                               │   │
│  │  User writes JSX + CSS...                                    │   │
│  │  Preview updates in real-time...                              │   │
│  │                                                               │   │
│  │  User clicks "Run & Assess" ──────────────────────────▶      │   │
│  │                                                               │   │
│  │  AI receives:                                                 │   │
│  │  • Problem requirements                                      │   │
│  │  • User's JSX code                                           │   │
│  │  • User's CSS code                                           │   │
│  │  • Requirements checklist                                    │   │
│  │                                                               │   │
│  │  AI evaluates:                                                │   │
│  │  • Functionality (does it work?)                             │   │
│  │  • Accessibility (ARIA, keyboard nav)                        │   │
│  │  • Code quality (patterns, hooks usage)                      │   │
│  │  • Performance (re-renders, memory)                          │   │
│  │                                                               │   │
│  │  AI streams feedback to chat panel...                        │   │
│  │  Requirements checklist updates...                           │   │
│  │  User iterates...                                             │   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 10. Example Walkthroughs

### Frontend: Accessible Dropdown — Attempt 1

User submits:
```jsx
function Dropdown({ options }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  
  return (
    <div>
      <div onClick={() => setOpen(!open)}>
        {selected || "Select..."}
      </div>
      {open && (
        <ul>
          {options.map(opt => (
            <li key={opt} onClick={() => { setSelected(opt); setOpen(false); }}>
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

AI Response:

```markdown
🤖 **Frontend Review — Attempt 1**

**Requirements:** 1/5 met
- ✅ Basic open/close toggle
- ❌ Keyboard navigation
- ❌ ARIA attributes
- ❌ Focus management
- ❌ ESC to close / Click outside

**Your component works visually**, but it's completely inaccessible 
to keyboard and screen reader users. Let's fix the most critical issues first.

🔴 **The trigger is a `<div>` — not focusable:**

```mermaid
graph TD
    A[User presses Tab] --> B{Can focus trigger?}
    B -->|div - NO ❌| C[Skipped entirely!]
    B -->|button - YES ✅| D[Focused, can interact]
    
    style C fill:#ff6b6b
    style D fill:#51cf66
```

On **line 7**, change `<div>` to `<button>`. Buttons are:
- Focusable by default (Tab key works)
- Activatable by Enter AND Space
- Announced by screen readers

🔴 **No ARIA attributes:**
The dropdown needs to tell assistive technology what it IS:

| Attribute | Where | Value |
|-----------|-------|-------|
| `role="combobox"` | trigger button | Identifies it as a dropdown |
| `aria-expanded` | trigger button | `{open}` — true/false |
| `aria-haspopup="listbox"` | trigger button | Tells screen readers a list will appear |
| `role="listbox"` | `<ul>` | Identifies the options list |
| `role="option"` | `<li>` | Identifies each option |

💭 **Start with this:** Change the trigger from `<div>` to `<button>` 
and add `aria-expanded={open}`. Then hit "Run & Assess" again!
```

### Backend: JWT Middleware — Final Attempt

```markdown
🤖 **Backend Review — Attempt 3** 🎉

**Tests: 5/5 Passing!**
- ✅ No token → 401 
- ✅ Invalid token → 403
- ✅ Expired token → 401 with specific message
- ✅ Valid token → next() with req.user
- ✅ Bearer prefix handled correctly

**Security Audit: PASSED ✅**
- ✅ JWT secret from environment variable
- ✅ Try-catch around jwt.verify()
- ✅ Specific error types handled (TokenExpiredError, JsonWebTokenError)
- ✅ Sensitive token info not leaked in error response

**Code Quality: Excellent**

```mermaid
graph TD
    A[Request arrives] --> B{Has Authorization header?}
    B -->|No| C[401 - No token]
    B -->|Yes| D[Extract Bearer token]
    D --> E{Token starts with 'Bearer '?}
    E -->|No| F[401 - Invalid format]
    E -->|Yes| G[jwt.verify]
    G -->|Valid| H[Attach user to req]
    H --> I[next - Continue]
    G -->|Expired| J[401 - Token expired]
    G -->|Invalid| K[403 - Invalid token]
    
    style I fill:#51cf66
    style C fill:#ff6b6b
    style F fill:#ff6b6b
    style J fill:#ffa94d
    style K fill:#ff6b6b
```

Your middleware handles all the edge cases correctly!

**+75 XP earned!** 

🧠 **Follow-up challenge:** How would you add refresh token rotation 
to this middleware? When a token expires, instead of forcing a new login, 
you could issue a new access token using a refresh token.
```

---

> **This document covers the complete Web Dev practice module.** Frontend and Backend problems each have distinct workspaces but share the AI Chat + Voice panel.