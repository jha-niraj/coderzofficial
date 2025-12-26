# Linting Issues Fix Tracking

## Status Legend
- [ ] Not started
- [x] Fixed
- [~] Partially fixed

## Issues by Category

### 1. Unescaped Entities (react/no-unescaped-entities)
Replace `'` with `&apos;` and `"` with `&quot;`

- [ ] `app/(main)/ai/jobinterviewassistant/_components/interviewplancard.tsx:171:91` - `'` (You'll)
- [ ] `app/(main)/ai/page.tsx:165:46, 185:39` - `'`
- [ ] `app/(main)/assessments/community/exam/page.tsx:348:68,82` - `"`
- [ ] `app/(main)/assessments/exam/set/[id]/page.tsx:119:61,80, 354:26` - `'`
- [ ] `app/(main)/challenges/_components/challenges-hub-client.tsx:502:142` - `'`
- [ ] `app/(main)/challenges/forge/[slug]/_components/forge-track-client.tsx:193:41,64, 315:95, 502:29,54` - `"` and `'`
- [ ] `app/(main)/challenges/crucible/[slug]/day/[dayNumber]/_components/crucible-problem-client.tsx:440:59` - `'`
- [ ] `app/(main)/challenges/forge/[slug]/step/[stepNumber]/_components/forge-step-client.tsx:359:56` - `'`
- [ ] `app/(main)/collective/[slug]/voting/page.tsx:201:24` - `'`
- [ ] `app/(main)/collective/_components/create-proposal-dialog.tsx:73:15` - `'`
- [ ] `app/(main)/collective/_components/step-submission-dialog.tsx:281:17` - `'`
- [ ] `app/(main)/collective/_components/voting-section.tsx:196:32` - `'`
- [ ] `app/(main)/collective/page.tsx:126:12, 127:77` - `'`
- [ ] `app/(main)/communities/_components/community-hub-client.tsx:276:63, 411:56, 482:56` - `'`
- [ ] `app/(main)/communities/channel/[slug]/_components/channel-client.tsx:255:52` - `'`
- [ ] `app/(main)/communities/discover/page.tsx:320:32,48` - `'`
- [ ] `app/(main)/interview/myinterviews/page.tsx:128:58` - `'`
- [ ] `app/(main)/interview/page.tsx` - Multiple occurrences
- [ ] `app/(main)/interview/publicinterviews/page.tsx` - Multiple occurrences
- [ ] And many more files...

### 2. Unused Variables (@typescript-eslint/no-unused-vars)
Remove or prefix with `_`

- [ ] `app/(main)/ai/jobinterviewassistant/generations/page.tsx:41:12` - `currentPage`
- [ ] `app/(main)/ai/jobinterviewassistant/page.tsx:162:18` - `error`
- [ ] `app/(main)/assessments/exam/page.tsx:24:8, 111:11, 112:11, 168:19` - Multiple vars
- [ ] And many more files...

### 3. Explicit Any (@typescript-eslint/no-explicit-any)
Create proper interfaces/types

- [ ] `app/(main)/ai/jobinterviewassistant/generations/page.tsx:53:57, 131:71` - `any` types
- [ ] `app/(main)/ai/jobinterviewassistant/page.tsx:35:18` - `any` type
- [ ] `app/(main)/ai/jobinterviewassistant/publicgenerations/page.tsx:36:55, 152:75, 162:76` - `any` types
- [ ] And many more files...

### 4. Other Issues
- [ ] `app/api/verifyemail/route.ts:38:33` - Non-null asserted optional chain
- [ ] `components/projects/blueprint-flowchart.tsx:361:8,9` - React hooks exhaustive deps
- [ ] `components/smoothscroll.tsx:98:5` - @ts-expect-error needs description
- [ ] `lib/chat-parser.ts:127:77, 128:36, 129:26` - Useless escape characters
- [ ] `components/studio/studio-block-editor.tsx:298, 302, 306, 317` - Lexical declarations in case blocks
- [ ] `lib/chat-features.ts:172:13` - Lexical declaration in case block
- [ ] Various Three.js/R3F properties need to be allowed

## Progress

Started: 2025-12-26
Last updated: 2025-12-26
