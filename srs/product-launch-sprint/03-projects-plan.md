# Projects Module (ProjectV2) — Complete Build Plan
> Module path: `apps/main/app/(main)/projects/`
> Actions path: `apps/main/actions/(main)/projectv2/` (or similar)
> Schema: `packages/prisma/schema/projects.prisma`
> Last updated: April 2026

---

## What This Module Does

ProjectV2 is a structured, sprint-based project learning system. Students pick a real-world project (e.g., "Build a URL Shortener"), work through 3 sprints of tasks on a Kanban board, take a quiz, do a mock interview in the context of that project, submit their GitHub URL, and get a composite score (tasks 50pts + quiz 25pts + mock 25pts). There are per-project leaderboards and a global leaderboard across all projects.

This is the most differentiated feature on the platform — no competitor combines guided building + assessment + mock interview into a scored project experience.

---

## Current State — What Is Already Built

### Pages
- `/projects` — Hub landing page. Shows project stats, public projects grid, recent submissions, AI project generation sheet.
- `/projects/allprojects` — Browse all platform projects with filters.
- `/projects/myprojects` — User's enrolled projects with progress.
- `/projects/ideas` — Browse and submit project ideas.
- `/projects/leaderboard` — Global leaderboard across all projects.
- `/projects/leaderboard/[username]` — User's public project profile.
- `/projects/[slug]` — Project detail page. Overview, sprints, tasks, quiz, mock interview, leaderboard tabs.
- `/projects/[slug]/sprints` — Sprint-by-sprint breakdown.
- `/projects/[slug]/tasks` — Kanban board (TO_DO / IN_PROGRESS / COMPLETED).
- `/projects/[slug]/quiz` — MCQ quiz for the project.
- `/projects/[slug]/aimock` — AI mock interview specific to this project.
- `/projects/[slug]/leaderboard` — Per-project rankings.

### Key Components
- `project-details-client.tsx` — Main project page with all tabs.
- `sprints-page-client.tsx` — Sprint view.
- `tasks-page-client.tsx` — Kanban board with drag-and-drop task status update.
- `quiz-client.tsx` — Quiz interface.
- `aimock-client.tsx` — AI mock interview for the project.
- `sprint-generation-sheet.tsx` — Sheet to generate sprints with AI.
- `enrollment-dialog.tsx` — Confirm before starting a project.
- `progress-gate.tsx` — Gates access to quiz/mock until tasks are complete.
- `team-members-display.tsx` — Shows project team.
- `daily-standup-sheet.tsx` and `daily-standup-tab.tsx` — Daily standup feature.
- `sprint-mock-interview.tsx` — Mock interview within a sprint.

### Database Models (projects.prisma)
- `ProjectV2` — Core project entity. Has slug, title, description, techStack, difficulty, estimatedHours, sprints, quiz, members, submissions, leaderboard, errors, feature suggestions.
- `ProjectV2Sprint` — Sprint grouping tasks. Has order, title, description, tasks.
- `ProjectV2Task` — Individual task. Has title, description, type, difficulty, status tracking per user.
- `UserTaskV2Status` — Per-user task status: TO_DO / IN_PROGRESS / COMPLETED.
- `ProjectV2Quiz` — Project quiz. Has questions, answers, time limit.
- `ProjectV2MockSession` — ElevenLabs voice session linked to the project.
- `UserProjectV2Progress` — Composite score per user per project: taskScore (50) + quizScore (25) + mockScore (25).
- `ProjectV2Submission` — GitHub URL + live URL submission.
- `ProjectV2Leaderboard` — Per-project rankings.
- `ProjectV2GlobalLeaderboard` — Aggregate across all projects.
- `ProjectV2Member` — Team members with roles.
- `ProjectV2Invitation` — Invitations to join a team.
- `ProjectV2GuidedSession` — AI coaching session for a project task.
- `ProjectV2Error` — Community-reported errors/blockers.
- `ProjectV2FeatureSuggestion` — User feature suggestions.

---

## What Needs to Be Built / Fixed

### Priority 1 — End-to-End Flow Test & Bug Fixes

Before anything else, run the complete user journey manually:

- [ ] **User can browse and enroll in a project**: `enrollment-dialog.tsx` triggers, `startProject()` action creates `UserProjectV2Progress` record.
- [ ] **User can see tasks on Kanban**: Tasks grouped by sprint, with TO_DO / IN_PROGRESS / COMPLETED columns.
- [ ] **User can update task status**: Click/drag changes status. `updateTaskStatus()` action called. Progress percentage updates.
- [ ] **Progress gate works**: Quiz and mock tabs are locked until tasks are 100% complete. Gate shows correct progress (X of Y tasks done).
- [ ] **Quiz loads and submits**: Questions appear, user answers, submit button scores answers, `quizScore` saved on `UserProjectV2Progress`.
- [ ] **Mock interview starts**: From `/projects/[slug]/aimock`, `createMockVoiceSession()` is called with project context (title, tech stack, features as knowledge base). Session starts on ElevenLabs.
- [ ] **Mock results saved**: After mock ends, `mockScore` saved on `UserProjectV2Progress`.
- [ ] **Submission form works**: User can enter GitHub URL, validate it's a real GitHub URL, save `ProjectV2Submission`.
- [ ] **Score calculates correctly**: `totalScore = taskScore + quizScore + mockScore` — verify formula in action.
- [ ] **Leaderboard updates**: After submission, user appears on per-project leaderboard.

### Priority 2 — Kanban Board Polish

- [ ] **Drag-and-drop task status change**: Currently the Kanban may use click to change status. Add proper drag-and-drop using `@dnd-kit/core` (already likely in the codebase). Verify it works.
- [ ] **Task details expansion**: Clicking a task opens a side sheet with full description, requirements, hints, starter code (from `ProjectV2Task` model).
- [ ] **Task completion celebration**: When all tasks in a sprint are completed, show a celebration animation and unlock the next sprint.
- [ ] **Sprint progress indicator**: Each sprint card shows X/Y tasks completed with a progress bar.
- [ ] **Task timer (optional)**: Show how long a task has been in IN_PROGRESS to encourage momentum.

### Priority 3 — AI Guided Session (Most Valuable UX Improvement)

`ProjectV2GuidedSession` exists in the schema but the AI coaching feature needs to be built out in the workspace.

- [ ] **"Get AI Help" button on each task**: Opens a chat panel within the task detail view.
- [ ] **AI context is project-aware**: System prompt includes project title, tech stack, current task title + description.
- [ ] **Conversation persists per task**: Session stored in `ProjectV2GuidedSession`. User can come back and continue.
- [ ] **Socratic approach**: AI should NOT give the answer directly. It should ask "What have you tried?" and guide toward the solution.
- [ ] **Hint escalation**: User can ask for hint level 1 (vague), level 2 (more specific), level 3 (concrete). Each level costs 1 credit.
- [ ] **Action**: Create `projectv2-guided.action.ts` with `createGuidedSession()`, `sendGuidedMessage()`, `getGuidedSession()`.

### Priority 4 — Sprint Mock Interview

`sprint-mock-interview.tsx` exists — the mock interview within a sprint. This needs to be fully wired.

- [ ] **Sprint-specific mock context**: The ElevenLabs agent for a sprint mock should have knowledge of what the user built in that sprint (completed tasks, tech decisions).
- [ ] **Sprint mock creates a `ProjectV2MockSession`** (not a generic `MockVoiceSession`).
- [ ] **Sprint mock score contributes to `mockScore`** in `UserProjectV2Progress`.
- [ ] **Sprint mock is gated**: Only unlocked after all tasks in the sprint are completed.
- [ ] **Mock question prompts are project-specific**: "Explain how you implemented the authentication flow in this project" — not generic behavioral questions.

### Priority 5 — Error Reporting & Community Help

`ProjectV2Error` exists in the schema. Surface this in the UI.

- [ ] **"Report a Blocker" button** on the task detail side sheet.
- [ ] **Error form**: Title, description, error message (code snippet optional).
- [ ] **Error library page** at `/projects/[slug]/errors` (or as a tab):
  - Shows all reported errors for this project.
  - Other users can upvote errors they also faced.
  - Admins can add a "Resolution" to mark it solved.
- [ ] **"I fixed this" button**: User marks an error as resolved for themselves. Contributes to XP.

### Priority 6 — Feature Suggestions

`ProjectV2FeatureSuggestion` exists. Surface this.

- [ ] **"Suggest a Feature" button** at the bottom of the tasks view.
- [ ] **Suggestion form**: Title, description, why it would be valuable.
- [ ] **Suggestions tab** in project detail: shows all suggestions with upvote count.
- [ ] **"Add to Sprint" action** (admin only): Converts a suggestion into an actual `ProjectV2Task`.

### Priority 7 — Team Collaboration

`ProjectV2Member` and `ProjectV2Invitation` exist.

- [ ] **Team tab in project detail**: Shows all enrolled users (not just the creator). Allows creator to invite specific users.
- [ ] **Invite flow**: Creator enters username/email → creates `ProjectV2Invitation` → invited user gets notification → accepts → added as `ProjectV2Member`.
- [ ] **Team leaderboard**: Within the team, show each member's progress (tasks done, quiz score).
- [ ] **Team vs. Solo toggle**: Some projects are solo, some are collaborative. Set `isTeamProject: boolean` on `ProjectV2`.

### Priority 8 — AI Project Generation

`sprint-generation-sheet.tsx` exists for generating sprints with AI.

- [ ] **Verify AI sprint generation**: `generateSprints()` action in `coderzworker` generates sprint + task structure via OpenAI. Verify the format is correct and saves to DB.
- [ ] **Task quality check**: Generated tasks must have meaningful descriptions, requirements, hints, and starter code for all supported languages.
- [ ] **Project idea to full project**: From `/projects/ideas`, an upvoted idea can be "Published as a Project" by admin. This triggers the AI generation flow.

### Priority 9 — Submission & Certificate

- [ ] **Submission validation**: GitHub URL must be a valid GitHub repo URL. Validate format client-side and optionally check via GitHub API that the repo exists.
- [ ] **Submission confirmation page**: After submission, show composite score breakdown visually: tasks bar (50/50), quiz bar (X/25), mock bar (Y/25), total (X+Y+50/100).
- [ ] **Project completion certificate** (future): Generate a shareable certificate image with user's name, project title, score, date. Share to LinkedIn.

### Priority 10 — Admin Project Management

- [ ] **Admin panel** (`apps/admin/app/(main)/main/projects/`):
  - List all projects with enrollment counts, avg scores, completion rates.
  - Create new project template (trigger AI generation).
  - Edit project metadata, sprints, tasks.
  - Feature/un-feature a project.
  - View all submissions for a project.
  - Moderate errors and feature suggestions.

---

## File Checklist

```
apps/main/
├── app/(main)/projects/
│   ├── [slug]/
│   │   ├── page.tsx                              ✅ exists
│   │   ├── tasks/_components/tasks-page-client   ⚠️  verify drag-drop works
│   │   ├── sprints/_components/sprints-page-client ✅ exists
│   │   ├── quiz/_components/quiz-client           ✅ exists, verify submit flow
│   │   ├── aimock/_components/aimock-client       ⚠️  verify ElevenLabs wired
│   │   ├── leaderboard/                          ✅ exists
│   │   └── _components/
│   │       ├── progress-gate.tsx                 ✅ exists, verify gate logic
│   │       ├── sprint-mock-interview.tsx          ⚠️  needs full wiring
│   │       ├── enrollment-dialog.tsx             ✅ exists
│   │       └── sprint-generation-sheet.tsx       ⚠️  verify AI generation
│   ├── allprojects/                              ✅ exists
│   ├── myprojects/                               ✅ exists
│   ├── ideas/                                    ✅ exists
│   └── leaderboard/                             ✅ exists
│
├── actions/(main)/projectv2/
│   ├── project.action.ts                        ✅ exists
│   ├── projectv2-quiz.action.ts                 ✅ exists
│   ├── projectv2-mock.action.ts                 ⚠️  verify sprint mock wiring
│   ├── project-ideas.action.ts                  ✅ exists
│   ├── project-errors.action.ts                 ⚠️  needs UI wiring
│   └── projectv2-guided.action.ts               ❌  needs to be created
│
└── types/projectv2.ts                           ✅ exists
```

---

## Implementation Order

1. Full end-to-end manual test of the existing flow — document every broken step
2. Fix all broken steps from the test (task status update, quiz submission, mock wiring)
3. Kanban drag-and-drop verification
4. Sprint mock interview full wiring
5. AI Guided Session (`projectv2-guided.action.ts` + task detail chat panel)
6. Error reporting UI
7. Submission validation + confirmation page
8. Feature suggestions UI
9. Team collaboration (invite flow)
10. Admin project management panel
