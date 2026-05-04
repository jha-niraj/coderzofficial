# KnowMe: Visual User Flow Diagrams

## Table of Contents
1. [Complete User Activation Flow](#activation-flow)
2. [Question Processing Flow](#question-flow)
3. [Platform Sync Flow](#sync-flow)
4. [External API Integration Flow](#api-flow)
5. [Analytics & Insights Flow](#analytics-flow)

---

## 1. Complete User Activation Flow {#activation-flow}

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER DISCOVERS KNOWME                         │
│  Entry Points: Profile Banner / AI Tools / Notification / Direct Link  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Landing Page          │
                    │   - Value Prop          │
                    │   - Features            │
                    │   - Demo Video          │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   [Get Started] Click   │
                    └───────────┬─────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        ONBOARDING WIZARD                                │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  STEP 1: Welcome (10%)                                           │ │
│  │  ┌───────────────────────────────────────────────────────────┐ │ │
│  │  │  👋 Welcome to KnowMe!                                    │ │ │
│  │  │  We'll create your AI assistant in 2 minutes              │ │ │
│  │  │  [Let's Begin →]                                          │ │ │
│  │  └───────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                │                                        │
│                                ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  STEP 2: Data Collection (40%)                                  │ │
│  │  ┌───────────────────────────────────────────────────────────┐ │ │
│  │  │  📊 What should your AI know?                            │ │ │
│  │  │                                                            │ │ │
│  │  │  ✓ Coderz Profile Data [Selected]                        │ │ │
│  │  │    • 12 Projects                                         │ │ │
│  │  │    • 8 Assessments                                         │ │ │
│  │  │    • Bio & Skills                                         │ │ │
│  │  │                                                            │ │ │
│  │  │  📄 Upload Resume (Optional)                               │ │ │
│  │  │    [Drag & Drop]                                          │ │ │
│  │  │                                                            │ │ │
│  │  │  [← Back] [Continue →]                                    │ │ │
│  │  └───────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                │                                        │
│                                ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  STEP 3: Platform Connections (70%)                             │ │
│  │  ┌───────────────────────────────────────────────────────────┐ │ │
│  │  │  🔗 Connect External Platforms (Optional)                 │ │ │
│  │  │                                                            │ │ │
│  │  │  [Connect GitHub] ← Recommended                           │ │ │
│  │  │  [Connect LeetCode]                                      │ │ │
│  │  │  [Connect StackOverflow]                                 │ │ │
│  │  │                                                            │ │ │
│  │  │  [Skip for Now] [Continue →]                              │ │ │
│  │  └───────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                │                                        │
│                                ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  STEP 4: Privacy Settings (90%)                                │ │
│  │  ┌───────────────────────────────────────────────────────────┐ │ │
│  │  │  🔒 Who can chat with your AI?                           │ │ │
│  │  │                                                            │ │ │
│  │  │  ● Anyone with the link (Recommended)                     │ │ │
│  │  │  ○ Only logged-in Coderz users                           │ │ │
│  │  │  ○ Only verified recruiters                               │ │ │
│  │  │  ○ Private (just for me)                                 │ │ │
│  │  │                                                            │ │ │
│  │  │  [← Back] [Create My AI →]                               │ │ │
│  │  └───────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                │                                        │
│                                ▼                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Processing Screen      │
                    │   - Progress bar        │
                    │   - Status updates      │
                    │   - Estimated time      │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   Success Screen         │
                    │   - Test chat            │
                    │   - Share link           │
                    │   - Get API keys         │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   Dashboard (/knowme)    │
                    │   - Chat preview         │
                    │   - Data sources          │
                    │   - Settings             │
                    └─────────────────────────┘
```

---

## 2. Question Processing Flow {#question-flow}

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    VISITOR ASKS QUESTION                                 │
│  Entry: /knowme/username or External Portfolio Widget                  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Frontend: User Types   │
                    │   Question & Clicks Send  │
                    └───────────┬─────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        API REQUEST SENT                                  │
│  POST /api/v1/knowme/chat                                               │
│  Body: { question, session_id?, api_key? }                             │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Rate Limit Check       │
                    │   - Session limit         │
                    │   - IP limit              │
                    │   - Daily limit           │
                    └───────────┬─────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
            ┌───────────────┐      ┌───────────────┐
            │   Allowed     │      │   Rate Limited │
            └───────┬───────┘      └───────┬───────┘
                    │                      │
                    │                      ▼
                    │          ┌─────────────────────┐
                    │          │   Return Error      │
                    │          │   "Rate limit..."   │
                    │          └─────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    EMBED QUESTION INTO VECTOR                           │
│  Using: text-embedding-3-small                                          │
│  Input: "What's your experience with React?"                            │
│  Output: [0.123, -0.456, 0.789, ...] (1536 dimensions)                │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Search Pinecone        │
                    │   - Query user namespace  │
                    │   - Top 5 similar chunks │
                    │   - Retrieve metadata    │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   Build Context          │
                    │   - Combine chunks       │
                    │   - Add user profile     │
                    │   - Detect viewer type   │
                    └───────────┬─────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    GENERATE RESPONSE (OpenAI)                           │
│                                                                         │
│  System Prompt:                                                         │
│  "You are an AI assistant representing [User Name]..."                  │
│  + Context about viewer type (recruiter/dev/anonymous)                 │
│                                                                         │
│  User Message:                                                          │
│  Question: "What's your experience with React?"                          │
│  Context: [Retrieved chunks from Pinecone]                             │
│                                                                         │
│  Model: GPT-4o-mini                                                     │
│  Temperature: 0.7                                                      │
│  Max Tokens: 500                                                        │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Enhance Response      │
                    │   - Add source links    │
                    │   - Add CTAs            │
                    │   - Format nicely       │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   Log Analytics         │
                    │   - Save question        │
                    │   - Categorize           │
                    │   - Track metrics        │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   Return Response       │
                    │   - Answer text         │
                    │   - Sources             │
                    │   - Rate limit info     │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   Frontend: Display     │
                    │   - Show AI response    │
                    │   - Render sources       │
                    │   - Update rate limit    │
                    └─────────────────────────┘
```

---

## 3. Platform Sync Flow {#sync-flow}

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SYNC TRIGGERED                                      │
│  Triggers: Scheduled (cron) / Manual / Event-driven                    │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
        ┌───────────────────┐    ┌───────────────────┐
        │   Scheduled       │    │   Manual/Event     │
        │   (Every 10 days) │    │   (User clicks)   │
        └───────────┬────────┘    └───────────┬────────┘
                    │                         │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Check Sync Needed     │
                    │   - Last sync date      │
                    │   - Update cycle        │
                    │   - User activity        │
                    └───────────┬─────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
            ┌───────────────┐      ┌───────────────┐
            │   Sync Needed │      │   Skip Sync    │
            └───────┬───────┘      └───────────────┘
                    │
                    ▼
                    ┌─────────────────────────┐
                    │   Queue Sync Job        │
                    │   - User ID             │
                    │   - Platform            │
                    │   - Priority            │
                    └───────────┬─────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    WORKER PROCESSES JOB                                │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  For each connected platform:                                    │ │
│  │                                                                   │ │
│  │  1. GitHub Sync                                                  │ │
│  │     ├─► Authenticate (OAuth token)                              │ │
│  │     ├─► Fetch repositories                                       │ │
│  │     ├─► Get README files                                         │ │
│  │     ├─► Get languages                                            │ │
│  │     ├─► Get contributions                                        │ │
│  │     └─► Normalize data                                           │ │
│  │                                                                   │ │
│  │  2. LeetCode Sync                                                │ │
│  │     ├─► Scrape profile page                                      │ │
│  │     ├─► Get problems solved                                      │ │
│  │     ├─► Get contest rating                                       │ │
│  │     └─► Normalize data                                           │ │
│  │                                                                   │ │
│  │  3. StackOverflow Sync                                           │ │
│  │     ├─► Use API (if available)                                  │ │
│  │     ├─► Get answers                                              │ │
│  │     ├─► Get reputation                                           │ │
│  │     └─► Normalize data                                           │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Detect Duplicates      │
                    │   - Compare with Coderz  │
                    │   - Similarity scoring   │
                    │   - Auto-merge or flag    │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   Store in Database     │
                    │   - knowme_external_data │
                    │   - Update connections   │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   Create Embeddings     │
                    │   - Chunk data           │
                    │   - Generate vectors     │
                    │   - Upsert to Pinecone   │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   Update Status         │
                    │   - Mark as synced      │
                    │   - Update timestamp     │
                    │   - Notify user          │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   Dashboard Updated      │
                    │   - Show sync status     │
                    │   - Display new data     │
                    │   - Update metrics       │
                    └─────────────────────────┘
```

---

## 4. External API Integration Flow {#api-flow}

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DEVELOPER GETS API KEY                              │
│  Via: Dashboard → Settings → API Keys                                  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   API Key Generated     │
                    │   Format: coderz_km_... │
                    │   - Stored hashed        │
                    │   - Rate limits set       │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   Developer Implements  │
                    │   - NPM package           │
                    │   - Vanilla JS            │
                    │   - React component       │
                    └───────────┬─────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    VISITOR ON EXTERNAL PORTFOLIO                       │
│  Example: rohitkumar.dev (developer's portfolio site)                  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  Portfolio Content                                               │ │
│  │                                                                   │ │
│  │                    ┌──────────────┐                             │ │
│  │                    │  💬 Chat     │ ← KnowMe Widget              │ │
│  │                    │  with AI     │                             │ │
│  │                    └──────────────┘                             │ │
│  │                                                                   │ │
│  │  Visitor clicks widget → Opens chat interface                    │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Widget Sends Request  │
                    │   POST /api/v1/knowme/  │
                    │   chat                  │
                    │   Headers:               │
                    │   - Authorization: Bearer │
                    │   - API Key              │
                    └───────────┬─────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    API REQUEST VALIDATION                              │
│                                                                         │
│  1. Validate API Key                                                    │
│     ├─► Check if key exists                                            │
│     ├─► Verify key is active                                           │
│     └─► Get user ID from key                                            │
│                                                                         │
│  2. Check Rate Limits                                                  │
│     ├─► Per API key daily limit                                        │
│     ├─► Per IP address limit                                           │
│     └─► Per session limit                                              │
│                                                                         │
│  3. Verify KnowMe Status                                               │
│     ├─► Check if KnowMe is active                                      │
│     ├─► Check if user exists                                            │
│     └─► Check privacy settings                                          │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
        ┌───────────────────┐      ┌───────────────────┐
        │   Valid Request   │      │   Invalid/Blocked  │
        └───────────┬────────┘      └───────────┬────────┘
                    │                           │
                    │                           ▼
                    │              ┌─────────────────────┐
                    │              │   Return Error       │
                    │              │   401/403/429        │
                    │              └─────────────────────┘
                    │
                    ▼
                    ┌─────────────────────────┐
                    │   Process Question      │
                    │   (Same as internal)    │
                    │   - Embed                │
                    │   - Search               │
                    │   - Generate             │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   Log API Usage         │
                    │   - Track requests       │
                    │   - Update rate limits    │
                    │   - Analytics            │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   Return Response       │
                    │   {                     │
                    │     answer: "...",      │
                    │     sources: [...],     │
                    │     rate_limit: {...},   │
                    │     powered_by: "..."   │
                    │   }                     │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   Widget Displays       │
                    │   - Show answer          │
                    │   - Render sources       │
                    │   - Update UI            │
                    └─────────────────────────┘
```

---

## 5. Analytics & Insights Flow {#analytics-flow}

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    USER VIEWS ANALYTICS                                 │
│  Via: Dashboard → Analytics or /knowme/analytics                        │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Fetch Analytics Data  │
                    │   - Questions            │
                    │   - Visitors            │
                    │   - Sessions             │
                    │   - Time range           │
                    └───────────┬─────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    PROCESS ANALYTICS                                    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  1. Aggregate Questions                                          │ │
│  │     ├─► Count by category                                        │ │
│  │     ├─► Most asked questions                                     │ │
│  │     └─► Trends over time                                         │ │
│  │                                                                   │ │
│  │  2. Analyze Visitors                                             │ │
│  │     ├─► Who's asking (if known)                                  │ │
│  │     ├─► Visitor types                                            │ │
│  │     └─► Geographic distribution                                  │ │
│  │                                                                   │ │
│  │  3. Calculate Metrics                                            │ │
│  │     ├─► Total questions                                          │ │
│  │     ├─► Unique visitors                                          │ │
│  │     ├─► Average session length                                   │ │
│  │     └─► Response accuracy                                        │ │
│  │                                                                   │ │
│  │  4. Generate Insights                                            │ │
│  │     ├─► Skill gaps identified                                    │ │
│  │     ├─► Popular topics                                           │ │
│  │     └─► Improvement suggestions                                  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Display Dashboard    │
                    │   - Overview cards      │
                    │   - Charts & graphs     │
                    │   - Visitor list        │
                    │   - Insights panel      │
                    └───────────┬─────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │   User Takes Action     │
                    │   - Views visitor        │
                    │   - Sends message        │
                    │   - Updates profile      │
                    │   - Shares insights       │
                    └─────────────────────────┘
```

---

## Additional Flow: Error Handling & Edge Cases

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIOS                                      │
│                                                                         │
│  Scenario 1: Rate Limit Exceeded                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  User asks question → Rate limit check fails                    │ │
│  │  → Return 429 error                                             │ │
│  │  → Show friendly message:                                       │ │
│  │    "You've reached your limit. Sign in for more questions."     │ │
│  │  → Offer: [Sign In] [Upgrade]                                   │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  Scenario 2: No Data Available                                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  User asks question → No relevant chunks found                 │ │
│  │  → Return response:                                             │ │
│  │    "I don't have enough information about that.                 │ │
│  │     [User Name] might be able to help directly."                 │ │
│  │  → Offer: [Send Message] [View Profile]                        │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  Scenario 3: Sync Failure                                            │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  Platform sync fails → Log error                                │ │
│  │  → Update connection status to "error"                          │ │
│  │  → Notify user:                                                 │ │
│  │    "GitHub sync failed. [Retry] [Contact Support]"             │ │
│  │  → Queue retry (exponential backoff)                            │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  Scenario 4: API Key Invalid                                          │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  External request → Invalid API key                              │ │
│  │  → Return 401 error                                             │ │
│  │  → Log security event                                            │ │
│  │  → Widget shows:                                                │ │
│  │    "Chat unavailable. Please contact site owner."               │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  Scenario 5: OpenAI API Failure                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  Question processing → OpenAI API error                         │ │
│  │  → Retry (3 attempts)                                            │ │
│  │  → If still fails:                                              │ │
│  │    "I'm having trouble right now. Please try again later."       │ │
│  │  → Log error for monitoring                                     │ │
│  │  → Alert team if high failure rate                              │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Flow Summary: Key Decision Points

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    KEY DECISION POINTS                                  │
│                                                                         │
│  1. Onboarding                                                          │
│     ├─► Skip platform connections? → Can add later                   │
│     ├─► Upload resume? → Optional but recommended                     │
│     └─► Privacy level? → Can change anytime                            │
│                                                                         │
│  2. Platform Data                                                       │
│     ├─► Enable platform data? → Toggle on/off                         │
│     ├─► Which platforms? → Start with GitHub                          │
│     └─► Update frequency? → Free: 10 days, Premium: faster             │
│                                                                         │
│  3. Question Processing                                                │
│     ├─► Rate limited? → Sign in or upgrade                            │
│     ├─► No data found? → Suggest adding more info                      │
│     └─► Error occurred? → Retry or contact support                     │
│                                                                         │
│  4. External Integration                                               │
│     ├─► Use NPM package? → Easiest                                    │
│     ├─► Custom implementation? → More control                          │
│     └─► Rate limit hit? → Upgrade plan                                  │
│                                                                         │
│  5. Analytics                                                           │
│     ├─► View insights? → Actionable suggestions                        │
│     ├─► Contact visitor? → Send message                                │
│     └─► Update profile? → Improve AI answers                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Visual State Machine: KnowMe Profile States

```
                    ┌─────────────┐
                    │   INACTIVE   │
                    │  (Not set up)│
                    └──────┬───────┘
                           │
                           │ User activates
                           ▼
                    ┌─────────────┐
                    │   SETUP     │
                    │  (Onboarding)│
                    └──────┬───────┘
                           │
                           │ Setup complete
                           ▼
                    ┌─────────────┐
                    │  PROCESSING  │
                    │ (Creating AI)│
                    └──────┬───────┘
                           │
                           │ Processing complete
                           ▼
                    ┌─────────────┐
                    │   ACTIVE    │◄─────┐
                    │  (Ready)    │      │
                    └──────┬───────┘      │
                           │              │
                           │              │ User disables
                           │              │
                           ▼              │
                    ┌─────────────┐      │
                    │   SYNCING   │      │
                    │ (Updating)   │      │
                    └──────┬───────┘      │
                           │              │
                           │ Sync complete│
                           │              │
                           └──────────────┘
```

---

This completes the visual flow documentation for KnowMe. Each flow shows the complete user journey from start to finish, including error handling and edge cases.

