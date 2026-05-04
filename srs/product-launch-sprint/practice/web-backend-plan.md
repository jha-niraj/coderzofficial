# Web Backend Practice Module — Complete Build Plan
> Module path: `apps/main/app/(main)/practice/web-backend/`
> Actions: `apps/main/actions/(main)/practice/` (shared)
> Last updated: April 2026

---

## What This Module Does

Web Backend practice covers the concepts and coding skills for backend engineering interviews: Node.js/Express patterns, database design, API design, authentication/authorization, caching, queues, microservices, and backend system design. It includes:
- **Concept questions** — "Explain the difference between authentication and authorization"
- **Coding challenges** — "Build a rate limiter middleware", "Implement JWT authentication", "Write a SQL query that..."
- **Database design problems** — "Design the database schema for a Twitter-like app"
- **API design problems** — "Design the REST API for an e-commerce product catalog"
- **AI conversation** — Socratic discussion about backend decisions, tradeoffs, and architecture

This module is especially valuable for students preparing for roles that specifically test Node.js, Express, PostgreSQL/MongoDB, REST/GraphQL, and DevOps basics.

---

## Current State — What Is Already Built

### Pages
- `/practice/web-backend` — Module landing page.
- `/practice/web-backend/[slug]` — Problem workspace.

### Actions (shared with practice module)
- `getProblemsForModule('WEB_BACKEND')` — Fetches backend problems.
- `getOrCreateSession()` — Creates session.
- `saveSessionProgress()` — Saves code + chat history.
- `assess.action.ts` — Has `WEB_BACKEND` system prompt.

### API Tester Component
- `api-tester.tsx` — An HTTP request tester panel in the workspace (similar to a mini Postman). Currently exists — verify if it's wired.

---

## What Needs to Be Built

### Priority 1 — Problem Library & Content

- [ ] **Seed `PracticeProblem` records for WEB_BACKEND**:
  - Minimum 60 problems:

  **Node.js & Express (15 problems):**
  - Implement a rate limiter middleware (token bucket algorithm)
  - Implement JWT authentication middleware from scratch
  - Implement request validation middleware using Zod
  - Build a file upload endpoint with size/type validation
  - Implement graceful shutdown for an Express server
  - Build a pagination utility for REST APIs (cursor-based + offset-based)
  - Implement error handling middleware that classifies errors correctly
  - Build a simple WebSocket server that broadcasts messages
  - Implement request logging middleware
  - Build a simple in-memory caching layer for expensive DB queries

  **Databases & SQL (15 problems):**
  - Write a SQL query to find the second-highest salary
  - Write a complex JOIN query (given schema, find all users who...)
  - Design a database schema for a booking system
  - Optimize a slow SQL query (given EXPLAIN ANALYZE output)
  - Implement database transactions correctly (example: money transfer)
  - Design schema for a social network (users, posts, follows, likes)
  - Write an aggregation query (daily active users by month)
  - Explain and demonstrate database indexing strategy
  - Implement soft delete (instead of hard delete) correctly
  - Design a schema that handles multi-tenancy

  **Authentication & Security (10 problems):**
  - Implement bcrypt password hashing correctly
  - Build OAuth2 flow (Authorization Code Grant) from scratch
  - Implement refresh token rotation
  - Explain and demonstrate CORS correctly
  - Fix SQL injection vulnerability in given code
  - Implement CSRF protection
  - Implement API key authentication

  **Caching & Performance (10 problems):**
  - Implement Redis caching layer for database queries
  - Implement cache invalidation strategy for user data
  - Explain and choose between Redis strategies (cache-aside, write-through, etc.)
  - Implement a BullMQ job queue for sending emails
  - Optimize N+1 query problem in given code
  - Implement connection pooling correctly

  **API Design (10 problems):**
  - Design RESTful API for a blog platform
  - Explain REST vs GraphQL vs gRPC tradeoffs
  - Version a REST API correctly
  - Implement API response envelope (success/error format)
  - Design a webhook system

### Priority 2 — AI Evaluation for Backend

- [ ] **`evaluateBackendCode()` action**:
  - For CODING problems (Node.js): run via CoderzWorker (Node.js runner). Test against test cases. AI evaluates: error handling, security (SQL injection, input validation), performance, code organization.
  - For SQL problems: run via CoderzWorker (PostgreSQL runner). Compare query output against expected output. AI evaluates query efficiency, index usage.
  - For CONCEPTUAL problems: AI evaluates explanation. Socratic follow-up: "You mentioned connection pooling — what's the default pool size in pg (node-postgres) and why is the default often wrong for high-traffic apps?"
  - For API DESIGN problems: user provides API design as text or JSON schema. AI evaluates: RESTful correctness, naming conventions, pagination strategy, error codes, versioning.
  - For DATABASE DESIGN: user provides SQL CREATE statements or text description. AI evaluates: normalization, index strategy, foreign keys, handling of edge cases.

- [ ] **Socratic depth for backend**:
  - Don't accept surface-level answers: "You said use Redis for caching. What cache eviction policy would you use? What happens when Redis is full?"
  - Push for production-readiness thinking: "Your rate limiter works on a single server — what breaks in a distributed system?"

### Priority 3 — API Tester Panel

`api-tester.tsx` already exists. Wire it properly:

- [ ] **For API design problems**: Student writes their Express endpoint code. It gets deployed to a sandboxed CoderzWorker container. The API tester sends HTTP requests to it and shows responses.
- [ ] This allows testing actual API behavior rather than just code review.
- [ ] Support: GET, POST, PUT, DELETE, PATCH. Request headers and body (JSON). Response status + body + timing.
- [ ] For SQL problems: replace API tester with a **SQL runner panel** — user types SQL, it runs against a seeded test database in CoderzWorker, shows results.

### Priority 4 — Topic Organization

- [ ] **Topic hierarchy for web backend**:
  ```
  Node.js Core
  ├── Event Loop & Async
  ├── Streams & Buffers
  └── Module System
  
  Express & Middleware
  ├── Request/Response Lifecycle
  ├── Authentication & Authorization
  ├── Error Handling
  └── File Uploads
  
  Databases
  ├── SQL (PostgreSQL) — Queries, Schema Design, Optimization
  ├── NoSQL (MongoDB) — Document Design, Aggregation
  └── ORMs (Prisma, Sequelize)
  
  Caching & Queues
  ├── Redis — Data Structures, Caching Patterns
  └── Message Queues — BullMQ, Kafka basics
  
  API Design
  ├── REST Conventions
  ├── GraphQL Basics
  └── API Security
  
  DevOps Basics (Junior-level)
  ├── Docker basics
  ├── Environment Configuration
  └── Logging & Monitoring
  ```

### Priority 5 — Backend System Design (Sub-category)

Backend-specific system design problems that don't need Excalidraw:

- [ ] Text-based backend system design problems:
  - "Design the database schema and API for a multi-tenant SaaS product"
  - "How would you implement distributed rate limiting?"
  - "Design a notification system (email + push + SMS)"
  - "Design a search system for a product catalog"
  - "How would you handle file uploads at scale?"

- [ ] AI evaluates these as structured conversations — no canvas needed. Phase flow: Requirements → Schema Design → API Design → Scalability Considerations.

### Priority 6 — PostgreSQL Runner in CoderzWorker

The current CoderzWorker supports JS, TS, Python, Java, C++, C. Backend practice needs SQL execution:

- [ ] **Add PostgreSQL runner to CoderzWorker**:
  - New Docker runner: `postgresql.Dockerfile` — PostgreSQL + seeded test database.
  - Test database seeded with realistic data (users, orders, products, etc.) for SQL query problems.
  - Takes SQL query as input, returns result set as JSON.
  - 5-second timeout for queries.
  - Read-only connection (no DROP/CREATE/DELETE allowed outside of schema design problems).

- [ ] **Schema reset between sessions**: Each SQL session runs against a clean copy of the test data.

### Priority 7 — Spaced Repetition

Same as DSA and Frontend:

- [ ] Revision scheduling on days 3, 7, 10.
- [ ] Conceptual questions in "flash card mode" for quick revision.
- [ ] Backend system design problems: revision is a shorter "What were the key tradeoffs in your last design?" conversation.

---

## File Checklist

```
apps/main/
├── app/(main)/practice/web-backend/
│   ├── page.tsx                                  ✅ exists
│   └── [slug]/page.tsx                           ⚠️  exists, needs API tester wiring
│
├── app/(main)/practice/_components/workspace/
│   ├── practice-workspace.tsx                   ✅ exists
│   ├── api-tester.tsx                           ⚠️  exists, needs CoderzWorker wiring
│   └── sql-runner-panel.tsx                    ❌  needs to be CREATED
│
├── actions/(main)/practice/
│   └── assess.action.ts                        ⚠️  has WEB_BACKEND prompt, needs full backend evaluation
│
└── apps/coderzworker/docker/runners/
    └── postgresql.Dockerfile                   ❌  needs to be CREATED
```

---

## Implementation Order

1. Seed 60 backend problems across all categories
2. `evaluateBackendCode()` — Node.js execution + AI quality + security evaluation
3. SQL conceptual evaluation with Socratic follow-up
4. Wire `api-tester.tsx` to CoderzWorker (sandboxed Express execution)
5. PostgreSQL Dockerfile + seeded test DB in CoderzWorker
6. SQL runner panel in workspace
7. Spaced repetition scheduling
8. Backend system design text-based problems
9. Topic hierarchy UI
