# BuildrHQ — Pre-Launch Checklist
> Last updated: April 2026
> Purpose: Master list of everything that must be done across the entire codebase before public launch.

---

## Overview

The platform is launching with five core modules:
1. **Mock Interview (Voice)** — ElevenLabs ConvAI, session management, post-session analysis
2. **Projects (ProjectV2)** — Sprint-based project learning with kanban, quiz, mock, leaderboard
3. **AI Tools** — Resume Creator, Cover Letter Generator, Job Interview Assistant
4. **Practice** — DSA (Socratic AI + spaced repetition), System Design, Web Frontend, Web Backend
5. **CoderzWorker** — Production deployment for code execution

Each module has a dedicated plan file. This document tracks the **cross-cutting concerns** and **per-module launch gates**.

---

## Module Launch Status

| Module | Build Status | Production Ready | Blocker |
|--------|-------------|-----------------|---------|
| Mock Interview Voice | ~80% | No | Analysis scorecard, agent quality |
| ProjectV2 | ~90% | No | End-to-end flow test, sprint mock |
| Resume Creator | ~85% | No | Profile auto-sync, ATS score |
| Cover Letter | ~80% | No | Quality improvement, tone options |
| Job Interview Assistant | ~95% | Nearly | Minor UX polish |
| DSA Practice | ~65% | No | AI conversation loop in workspace |
| System Design | ~40% | No | Excalidraw + AI mentor flow |
| Web Frontend Practice | ~50% | No | AI evaluation flow |
| Web Backend Practice | ~50% | No | AI evaluation flow |
| CoderzWorker | ~70% | No | Production deployment |

---

## Cross-Cutting Concerns (Must Fix Before Any Launch)

### 1. Authentication & Middleware

- [ ] Verify NextAuth session is stable across all routes
- [ ] Confirm onboarding redirect works (user lands on /home after onboarding)
- [ ] Test Google OAuth and GitHub OAuth login flows end-to-end
- [ ] Ensure middleware correctly protects all `/app/(main)/` routes
- [ ] Check that `emailVerified` flag is enforced before accessing protected features

### 2. Credits System

- [ ] Verify Razorpay payment flow works (purchase credits)
- [ ] Test credit deduction on mock interview session creation
- [ ] Test credit deduction on AI tools (resume, cover letter, job interview)
- [ ] Verify credit refund on failed sessions
- [ ] Test `ShareCredits` flow between users
- [ ] Ensure `CreditTransaction` records are created for every deduction/addition

### 3. CoderzWorker (Code Execution)

- [ ] Deploy CoderzWorker to production server (VPS or container)
- [ ] Set `NEXT_PUBLIC_WORKER_URL` env var in main app to point to production worker
- [ ] Test all 6 language Dockerfiles (JS, TS, Python, Java, C++, C) in production
- [ ] Verify queue (BullMQ + Redis) is stable under load
- [ ] Set up health check monitoring for the worker service
- [ ] Test code execution timeout handling (prevent hung containers)
- [ ] Set up Redis on production (required for BullMQ queue)

### 4. Environment Variables

- [ ] Audit all `.env.example` files — ensure all required keys are documented
- [ ] Verify all AI API keys are set: `OPENAI_API_KEY`, `ELEVENLABS_AI_KEY`, `ANTHROPIC_API_KEY`
- [ ] Verify payment keys: `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- [ ] Verify email: `RESEND_API_KEY`
- [ ] Verify storage: `CLOUDINARY_*`, `S3_*`
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Set `NEXT_PUBLIC_ELEVENLABS_*` agent IDs for each mock interview category

### 5. Database

- [ ] Run `prisma migrate deploy` on production database
- [ ] Seed mock interview data (`MockInterviewVoice` records) for each category
- [ ] Seed DSA problem library (`PracticeProblem` + `DSAPattern` hierarchy)
- [ ] Seed practice problems for system design, web frontend, web backend
- [ ] Verify all indexes are applied (Prisma schema indexes)
- [ ] Test `DIRECT_URL` connection (for migrations)

### 6. Error Handling & Loading States

- [ ] Every page must have a `<Suspense>` boundary with a skeleton
- [ ] Every server action must return `{ success, error, data }` — no raw throws
- [ ] Test empty states (new user with no data) for every page
- [ ] Test error states (API failure, DB timeout) for every page
- [ ] Add error.tsx boundaries for each major route group

### 7. Performance

- [ ] Audit all Prisma queries — ensure no N+1 queries (use `include` properly)
- [ ] Add `revalidatePath` calls after all mutating server actions
- [ ] Verify Next.js Image components are used for all images (not `<img>`)
- [ ] Check bundle sizes — remove any unused large dependencies

### 8. TypeScript & ESLint

- [ ] Run `pnpm check-types` — zero TypeScript errors across all apps
- [ ] Run `pnpm lint` — zero ESLint warnings across all apps
- [ ] All types defined in `apps/main/types/` not inline in components
- [ ] No `any` types anywhere — use `unknown` with type guards

### 9. Mobile Responsiveness

- [ ] Test all pages on mobile (375px, 390px, 414px viewport widths)
- [ ] Mock interview session page must work on mobile
- [ ] DSA workspace must degrade gracefully on mobile (simplified view)
- [ ] Navigation sidebar must collapse properly on mobile

### 10. SEO & Meta

- [ ] Add `metadata` export to every public page
- [ ] Set proper `title`, `description`, `og:image` for landing pages
- [ ] Add `robots.txt` and `sitemap.xml`
- [ ] Verify canonical URLs

---

## Module-Specific Launch Gates

### Mock Interview Voice ✅ Gate
- [ ] Session creation flow works (deducts credits, gets agentId)
- [ ] ElevenLabs conversation starts without error
- [ ] Post-session analysis runs and stores results
- [ ] Results page shows structured scorecard (not just raw transcript)
- [ ] User can rate the session (1–5 stars)
- [ ] Session history shows on the voice mock landing page
- [ ] At least 10 mock interview templates seeded across 5 categories

### ProjectV2 ✅ Gate
- [ ] User can browse and start a project
- [ ] Kanban board works (drag tasks between TO_DO / IN_PROGRESS / COMPLETED)
- [ ] Quiz tab works (questions load, submission saves score)
- [ ] Sprint mock interview works (ElevenLabs session starts from project context)
- [ ] Submission form works (GitHub URL + live URL)
- [ ] Leaderboard shows correct scores
- [ ] User can see their rank vs. other participants

### AI Tools ✅ Gate
- [ ] Resume: profile sync populates all fields from user's actual data
- [ ] Resume: live preview updates in real-time as user edits
- [ ] Resume: public URL (`/ai/resume/[username]`) is shareable
- [ ] Cover Letter: JD URL parsing extracts correct job details
- [ ] Cover Letter: generated letter is coherent and personalized
- [ ] Job Interview Assistant: question generation works for both technical and behavioral
- [ ] All tools show correct credit cost before use
- [ ] All tools deduct credits correctly on use

### DSA Practice ✅ Gate
- [ ] User can browse problems by pattern/sub-pattern
- [ ] Problem workspace loads with starter code
- [ ] Code runs via CoderzWorker and output appears in workspace
- [ ] AI gives Socratic response based on code output
- [ ] Phase tracking works (day 1 → complete → scheduled day 3 reminder)
- [ ] Spaced repetition notifications work (in-app + email)
- [ ] Leaderboard updates after problem completion

### CoderzWorker ✅ Gate
- [ ] Deployed and accessible at production URL
- [ ] JWT auth works for requests from main app
- [ ] Code execution returns within 10 seconds for normal problems
- [ ] All 6 language Docker containers build and run correctly
- [ ] BullMQ queue handles 10+ concurrent submissions

---

## Launch Order Recommendation

**Week 1:** Fix CoderzWorker production deployment + Mock Interview analysis scorecard  
**Week 2:** DSA workspace AI conversation loop + end-to-end flow test  
**Week 3:** ProjectV2 end-to-end test + Resume profile auto-sync  
**Week 4:** System Design Excalidraw + AI mentor + final QA pass  
**Launch:** Soft launch to 100 beta users  

---

## Post-Launch (Phase 2 — Not Required for Launch)

- [ ] Deploy wsserver (real-time chat) to Cloudflare
- [ ] System Design — Excalidraw full integration with AI mentor
- [ ] Spaced repetition email reminders (Resend integration)
- [ ] University platform end-to-end test
- [ ] Hiring platform end-to-end test + email notifications
- [ ] Open Source Hub certification flow
- [ ] Communities moderation tools
- [ ] Certifications (backed by assessment scores)
