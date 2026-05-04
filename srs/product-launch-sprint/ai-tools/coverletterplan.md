# Cover Letter Module — Complete Build Plan
> Module path: `apps/main/app/(main)/ai/resume/cover-letter/` and `/ai/coverletter/`
> Actions: `apps/main/actions/(main)/ai/cover-letter.action.ts`
> Last updated: April 2026

---

## What This Module Does

The Cover Letter module generates a personalized, tailored cover letter for a specific job application. The student provides a job URL (or pastes a JD), the platform scrapes the job description using the Exa API, asks the student a few targeted questions about their fit, then generates a polished cover letter using OpenAI. The student can choose the tone (Professional, Conversational, Enthusiastic, Direct).

---

## Current State — What Is Already Built

### Pages
- `/ai/resume/cover-letter` — Cover letter generation page (within resume context).
- `/ai/coverletter` — Standalone cover letter page (may be a redirect or duplicate).

### Components
- `cover-letter-client.tsx` — Main cover letter generation UI.

### Server Actions (`cover-letter.action.ts`)
- `extractJobFromURL(url)` — Uses Exa API to scrape job description from a URL. Extracts: company name, role title, requirements, key responsibilities.
- `generateCoverLetterQuestions(jobData)` — Uses OpenAI to generate 4–5 targeted questions specific to the JD ("Why are you interested in working at [company]?" / "Describe your experience with [specific skill from JD]").
- `generateCoverLetter(jobData, answers, tone)` — Uses OpenAI to generate the full cover letter from the JD + user's answers + chosen tone.
- `saveCoverLetter(data)` — Saves generated cover letter to DB.

### Database
- `AiToolUsage` — Records each cover letter generation (userId, toolType: COVER_LETTER, creditsUsed, metadata).

---

## What Needs to Be Built / Fixed

### Priority 1 — Context-Aware Generation (Core Differentiator)

**Current problem:** The cover letter is generated from JD + user's typed answers. It doesn't use the user's actual platform data.

- [ ] **Pull user context automatically** before question generation:
  - From `UserProfile`: current role/title, years of experience, summary/bio.
  - From `WorkExperience`: most recent 2 jobs (title, company, key responsibilities).
  - From `PortfolioProject` and `ProjectV2Submission`: most relevant completed projects (filtered by tech stack match with the JD).
  - From `Skills` + `SkillEndorsement`: verified skill list.
  - From `Certifications`: any certifications relevant to the role.
  - From `MockVoiceSession` stats: "practiced X mock interviews" if user wants to mention interview readiness.

- [ ] **Smart questions**: Questions should be pre-filled with user's platform data where possible.
  - Instead of: "Tell us about your experience with React."
  - Show: "You have 3 React projects on BuildrHQ. Would you like to mention [Project Name] in the letter? What specifically about it is most relevant?"
  - This dramatically improves quality vs. the current blank-slate question approach.

- [ ] **Action update**: `generateCoverLetterQuestions(jobData, userContext)` — pass user context to OpenAI so it can pre-answer simple questions automatically and only ask the ones it can't answer from context.

### Priority 2 — Job URL vs. Manual JD Input

- [ ] **Dual input mode**:
  - Mode 1: Paste a job URL (LinkedIn, Wellfound, company website). Exa API scrapes it.
  - Mode 2: Paste raw JD text (for when URL doesn't work or JD is behind a login).
- [ ] **URL validation**: Validate that the URL is accessible before scraping. Show a loading spinner during Exa API call.
- [ ] **Fallback**: If Exa fails to extract structured data, fall back to a "manual entry" mode where user types: company name, role, key requirements.
- [ ] **Error handling**: "We couldn't read this job URL. Try pasting the job description directly."

### Priority 3 — Multi-Tone Cover Letter

- [ ] **Tone selector with previews**:
  - `PROFESSIONAL` — Formal language, structured paragraphs, no slang.
  - `CONVERSATIONAL` — Warm and natural tone, slight personality showing through.
  - `ENTHUSIASTIC` — High energy, excitement about the role, strong conviction.
  - `DIRECT` — Short, punchy paragraphs. Gets to the point. No fluff.
  - `STARTUP_FRIENDLY` — Casual, shows culture-fit awareness, mentions growth mindset.
- [ ] Show a one-sentence sample line for each tone so user knows what to expect.
- [ ] Allow regenerating the letter in a different tone without re-entering all information.

### Priority 4 — Generation UX

- [ ] **Step-by-step wizard**:
  - Step 1: Enter job URL / paste JD → "Analyzing job..." → show extracted job info for user to confirm.
  - Step 2: Answer 4–5 targeted questions (pre-filled where possible from user data).
  - Step 3: Choose tone.
  - Step 4: "Generate Cover Letter" → loading state (10–15 seconds) → show result.
  - Step 5: Edit / regenerate / copy / download / save.

- [ ] **Streaming generation**: Use OpenAI streaming API to show the cover letter appearing word-by-word instead of a blank screen for 15 seconds. This makes it feel fast and magical.
  - Implement using Next.js streaming response or SSE in a route handler.

- [ ] **Edit mode**: After generation, the letter is shown in an editable text area. User can make tweaks before copying.

- [ ] **Regenerate with changes**: User can say "Make it shorter" or "Emphasize my project experience more" and regenerate. OpenAI takes the current letter + the instruction as input.

### Priority 5 — Output & Saving

- [ ] **Copy to clipboard**: One-click copy of the full letter.
- [ ] **Download as .docx**: Generate a Word document. Use `docx` npm package.
- [ ] **Download as PDF**: Generate a PDF version.
- [ ] **Save to "My Cover Letters"**: Saved letters organized by company/role. Quick access for future editing.
- [ ] **History view**: `/ai/resume/cover-letter/history` — List of all generated cover letters with company, role, date, tone used.

### Priority 6 — Credit System

- [ ] **Credit cost**: 3 credits per cover letter generation.
- [ ] **Regeneration**: 1 credit per regeneration (with changes).
- [ ] **Show credit cost** prominently before generation step.
- [ ] **Free tier**: Allow 1 free cover letter generation for new users (to demonstrate value before asking for credits).

### Priority 7 — Integration with Job Applications

**Future enhancement — not required for launch:**
- [ ] From the Jobs page, when a student clicks "Apply", offer "Generate Cover Letter for this Job" — auto-populates the job data without URL scraping.
- [ ] Track cover letters by job application — link `CoverLetter` record to `JobApplication` record.
- [ ] "Which letter performed best?" — If the user tracks application outcomes, correlate cover letter usage with interview callbacks.

### Priority 8 — Quality Control

- [ ] **Length validation**: Cover letter should be 3–4 paragraphs, 250–400 words. Show word count. Warn if too long/short.
- [ ] **Hallucination check**: After generation, run a quick validation pass — does the letter mention any company name or role that doesn't match the JD? Flag potential errors.
- [ ] **Plagiarism-safe**: Add a disclaimer that letters are AI-generated and should be personalized by the user before sending.
- [ ] **Feedback loop**: "Was this cover letter helpful?" thumbs up/down. Store feedback in `AiToolUsage` metadata for quality improvement.

---

## File Checklist

```
apps/main/
├── app/(main)/ai/
│   ├── resume/cover-letter/page.tsx              ✅ exists
│   └── coverletter/ (if separate)               ✅ check if redirect or standalone
│
├── app/(main)/ai/resume/_components/
│   └── cover-letter-client.tsx                  ⚠️  needs wizard UX + streaming + profile context
│
└── actions/(main)/ai/
    └── cover-letter.action.ts                   ⚠️  needs userContext param, streaming support
```

---

## Implementation Order

1. User context extraction — pull profile data for auto-filled questions
2. Updated `generateCoverLetterQuestions(jobData, userContext)` with pre-filled answers
3. Streaming generation UI (word-by-word reveal)
4. Multi-tone selector
5. Dual input mode (URL + manual JD paste)
6. Edit mode after generation
7. Save + history page
8. Copy/Download as PDF and .docx
9. Credit system integration
10. Integration with Jobs page applications
