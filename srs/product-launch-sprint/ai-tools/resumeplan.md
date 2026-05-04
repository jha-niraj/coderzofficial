# Resume Module — Complete Build Plan
> Module path: `apps/main/app/(main)/ai/resume/`
> Actions path: `apps/main/actions/(main)/ai/` (resume-ai.action.ts, resume-template.action.ts)
> Schema: `packages/prisma/schema/aitools.prisma`
> Last updated: April 2026

---

## What This Module Does

The Resume module is a full resume builder that lets students:
1. Build a resume by pulling their actual profile data (projects, experience, education, skills) from the platform
2. Use AI (OpenAI GPT-4) to polish bullet points using voice or text input
3. Select from multiple resume templates
4. Preview the resume live
5. Generate a public resume URL (`/ai/resume/[username]`) shareable with recruiters
6. Generate a cover letter from within the resume context (separate sub-module)

The key differentiator vs. tools like Teal or Rezi: **this resume knows the student's actual verified data** — completed projects with real scores, DSA practice stats, mock interview performance — not just self-reported info.

---

## Current State — What Is Already Built

### Pages
- `/ai/resume` — Hub page. Shows the user's current resume with tabs for sections.
- `/ai/resume/create` — Resume creation page.
- `/ai/resumecreator` — Alternative resume creator entry point (may be a separate flow).
- `/ai/resume/draft/[id]` — Draft editing page.
- `/ai/resume/cover-letter` — Cover letter generation from within resume context.
- `/ai/resume/[username]` — Public-facing resume view (shareable link).

### Components
- `resume-hub.tsx` / `resume-hub-client.tsx` — Main hub showing resume status and actions.
- `resume-creator-tabs.tsx` — Tabs for Education, Experience, Projects, Skills, Socials.
- `resume-editor.tsx` — Live editor panel.
- `education-tab-form.tsx` — Education section form.
- `experience-tab-form.tsx` — Work experience section form.
- `projects-tab-form.tsx` — Projects section form.
- `skills-tab-form.tsx` — Skills section form.
- `socials-tab-form.tsx` — Social links form.
- `cover-letter-client.tsx` — Cover letter generation within resume context.

### Server Actions
- `resume-ai.action.ts`:
  - `polishWorkExperienceBullet(text)` — Takes a bullet point, runs through OpenAI to make it STAR-method formatted, quantified, and ATS-friendly.
  - `polishWithVoice(audioBase64)` — Takes voice recording, transcribes with ElevenLabs STT, then polishes the transcription.
- `resume-template.action.ts`:
  - `getAllTemplates()` — Fetch all `ResumeTemplate` records.
  - `getUserGenerations()` — User's purchased/generated resume versions.
  - `verifyTemplatePurchase()` — Check if user has paid for a premium template.

### Public Resume API
- `/app/api/v1/resume/[username]` (check if this exists) — Returns resume JSON for public view.

---

## What Needs to Be Built / Fixed

### Priority 1 — Profile Auto-Sync (Most Important Differentiator)

**Current problem:** The resume creator shows manual input forms. The key differentiator is that this resume should auto-populate from the student's actual platform data.

- [ ] **Auto-sync action** `syncProfileToResume(userId)`:
  - Pull from `UserEducation` → populate Education section.
  - Pull from `WorkExperience` → populate Experience section.
  - Pull from `PortfolioProject` → populate Projects section. For projects that are `ProjectV2Submission`, include score and leaderboard rank.
  - Pull from `Skills` + `SkillEndorsement` → populate Skills section (endorsed skills marked with ✓ Verified).
  - Pull from `SocialLink` → populate Socials section.
  - Pull from `UserProfile` → populate header (name, title, summary).
  - Pull from `Certifications` → populate optional Certifications section.
  - **DSA Stats**: Pull from `UserDSAPreferences` + `UserDSATrackingEntry` — show "Solved X DSA problems across Y patterns" as a quantified bullet.
  - **Mock Interview**: Pull from `MockVoiceSession` with `status: COMPLETED` — show "Completed X mock interviews, avg score Y/100" if user opts in.

- [ ] **"Sync from Profile" button** in the resume hub with a one-click sync that populates all sections.
- [ ] **Selective sync**: Let user choose which sections to sync and which to keep manual.
- [ ] **Conflict resolution**: If user has manually edited a field and then resyncs, ask "Replace with profile data?" or "Merge?".

### Priority 2 — AI Bullet Point Polish

This is partially built (`polishWorkExperienceBullet()`). Extend it:

- [ ] **Polish button on every bullet point**: Small sparkle icon next to each experience/project bullet. Clicking it runs the AI polish.
- [ ] **Polish entire section at once**: "Polish all bullets" button at the top of Experience and Projects sections.
- [ ] **Before/After diff view**: Show the original vs. polished text side-by-side. User accepts or rejects the suggestion.
- [ ] **Voice input for bullet creation**: Microphone button — user speaks their accomplishment, ElevenLabs transcribes it, OpenAI converts to a STAR-method bullet point.
  - Action: `polishWithVoice()` already exists in `resume-ai.action.ts`. Wire it to the UI.
- [ ] **ATS keyword suggestions**: After user enters their target job role/company, suggest keywords from common JDs for that role. Highlight which keywords are missing from their resume.
- [ ] **Credit cost**: Each AI polish operation costs 1 credit. Bulk polish (entire section) costs 3 credits.

### Priority 3 — Resume Templates & Live Preview

- [ ] **Template selection**: Show all available templates in a grid. Free templates (2–3) available by default. Premium templates cost credits or are unlocked by completing projects.
- [ ] **Live preview panel**: Right side of the editor should show a real-time preview of the resume as the user types. Use a `ResumePDF` component that renders the resume in the chosen template.
- [ ] **PDF generation**: "Download PDF" button generates a proper PDF. Use `react-pdf` or `@react-pdf/renderer`.
- [ ] **Template switching**: User can switch templates and the preview updates instantly without losing content.
- [ ] **Seed resume templates**: At least 3 templates: Clean/Minimal, Modern/Bold, ATS-Optimized/Plain.

### Priority 4 — ATS Score

This would be the strongest differentiator against all existing resume tools.

- [ ] **ATS Score button**: User enters the job description URL or pastes the JD text.
- [ ] **Score calculation** (via OpenAI):
  - Extract keywords from JD.
  - Check how many are present in the resume.
  - Score = (matched keywords / total keywords) × 100.
  - Show missing keywords highlighted.
  - Show sections that need improvement ("Your Experience section has no metrics").
- [ ] **"Optimize for this JD" action**: One click rewrites bullet points to include missing keywords naturally.
- [ ] Action: `scoreResumeForJD(resumeContent, jobDescription)` in `resume-ai.action.ts`.
- [ ] Store the JD + score in `AiToolUsage` table for analytics.

### Priority 5 — Public Resume URL

- [ ] **Public resume page** (`/ai/resume/[username]`):
  - Renders the user's resume in their chosen template, publicly viewable.
  - Shows "View full profile on BuildrHQ" link.
  - Meta tags: proper OG image of the resume for LinkedIn sharing.
  - Privacy toggle: user can set their resume to public or private.
- [ ] **Share button**: One-click copy of the public URL.
- [ ] **View counter**: Show user "Your resume has been viewed X times" in the hub.
- [ ] **Resume QR code**: Generate a QR code of the public URL for physical resume or events.

### Priority 6 — Resume Versions & History

- [ ] **Resume versioning**: Every "Save" creates a snapshot. User can see version history and restore any previous version.
- [ ] **Multiple resumes**: User can have up to 3 saved resumes (e.g., "SWE Resume", "Frontend Resume", "Intern Resume").
- [ ] **Draft status**: A resume starts as DRAFT. User can mark it as ACTIVE (only one active at a time — this is what appears at the public URL).

### Priority 7 — Resume Analytics (Post-Launch)

Track resume engagement when public URL is visited:
- [ ] Number of views per day/week
- [ ] Time spent on the resume (scroll depth)
- [ ] Which sections were viewed most
- [ ] How many viewers clicked through to GitHub/LinkedIn links
- [ ] Referrer tracking (was it shared from LinkedIn? WhatsApp? Direct?)

---

## File Checklist

```
apps/main/
├── app/(main)/ai/resume/
│   ├── page.tsx                                  ✅ exists (hub)
│   ├── create/page.tsx                           ✅ exists
│   ├── draft/[id]/page.tsx                       ✅ exists
│   ├── cover-letter/page.tsx                     ✅ exists (see cover letter plan)
│   ├── [username]/page.tsx                       ✅ exists (public view)
│   └── _components/
│       ├── resume-hub.tsx                        ✅ exists
│       ├── resume-hub-client.tsx                 ✅ exists
│       ├── resume-creator-tabs.tsx               ✅ exists
│       ├── resume-editor.tsx                     ⚠️  needs live preview + polish buttons
│       ├── education-tab-form.tsx                ✅ exists
│       ├── experience-tab-form.tsx               ⚠️  needs AI polish button + voice input
│       ├── projects-tab-form.tsx                 ⚠️  needs auto-sync from ProjectV2
│       ├── skills-tab-form.tsx                   ⚠️  needs endorsed skills sync
│       └── socials-tab-form.tsx                  ✅ exists
│
├── actions/(main)/ai/
│   ├── resume-ai.action.ts                       ⚠️  needs syncProfileToResume, scoreResumeForJD
│   └── resume-template.action.ts                ✅ exists
│
└── types/
    └── resume.ts (or inside aitools/)           ⚠️  check and expand if needed
```

---

## Implementation Order

1. `syncProfileToResume()` action — auto-populate all sections from user's actual data
2. "Sync from Profile" button + selective sync UI
3. AI polish button on every bullet point (with before/after diff)
4. Voice input for bullet creation (wire existing `polishWithVoice()`)
5. Live preview panel with template rendering
6. PDF download
7. Template seeding (3 templates minimum)
8. ATS score against JD
9. Public URL privacy toggle + view counter
10. Resume versioning (save snapshots)
