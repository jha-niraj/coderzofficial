# 🚀 HIRING PLATFORM PHASE 1 BLUEPRINT
## CodeDot.AI + FlowSync: Complete Integration Architecture
### Version 1.0 | February 2026

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [The Core Problem & Solution](#the-core-problem--solution)
3. [Platform Architecture Overview](#platform-architecture-overview)
4. [Main Platform (Student) - Jobs & Interview Module](#main-platform-student---jobs--interview-module)
5. [Hiring Platform (FlowSync) - Company Module](#hiring-platform-flowsync---company-module)
6. [Mock Interview System Architecture](#mock-interview-system-architecture)
7. [Database Schema](#database-schema)
8. [User Flows & Screen Specifications](#user-flows--screen-specifications)
9. [API Documentation](#api-documentation)
10. [Technical Implementation](#technical-implementation)
11. [Phase 1 Feature Scope](#phase-1-feature-scope)

---

## 🎯 EXECUTIVE SUMMARY

### What We're Building

A **revolutionary hiring ecosystem** that connects:
- **Students** who learn, build projects, and get verified skills on CodeDot.AI
- **Companies** who need to hire talented developers efficiently via FlowSync

### The Game-Changing Innovation

**Interview Process Transparency + AI-Powered Mock Interviews**

When companies register on FlowSync, they configure their complete interview process—round by round. This information flows to the Main Platform where students can:

1. See exactly what each interview round entails
2. Practice AI-powered mock interviews that mirror the company's actual process
3. Get detailed feedback on their performance
4. Build confidence through preparation

**No one else in the market offers this.**

### Key Differentiators

| Feature | Traditional Platforms | Our Platform |
|---------|----------------------|--------------|
| Skill Verification | Unverified claims | Verified through real projects |
| Interview Prep | Generic advice | Company-specific AI mock interviews |
| Transparency | Black box process | Full visibility into interview stages |
| Rejection Feedback | Ghosting (75% never hear back) | Mandatory feedback |
| Learning → Hiring | Separate platforms | Unified ecosystem |

---

## 🔥 THE CORE PROBLEM & SOLUTION

### Problems We're Solving

#### For Students:
```
┌────────────────────────────────────────────────────────────────────────┐
│                    CURRENT STUDENT PAIN POINTS                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ❌ 75% of applicants never hear back (ghosting)                        │
│  ❌ No idea what to expect in interviews                                │
│  ❌ Skills on resume are unverified claims                              │
│  ❌ Generic interview prep doesn't help                                 │
│  ❌ Degrees don't guarantee jobs (85% employers use skills-based now)   │
│  ❌ Scattered across multiple platforms for learning + job search       │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
```

#### For Companies:
```
┌────────────────────────────────────────────────────────────────────────┐
│                    CURRENT COMPANY PAIN POINTS                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ❌ Drowning in applications (hundreds per role)                        │
│  ❌ 40-60% of recruiter time on manual screening                        │
│  ❌ Bad hires cost $15,000-$50,000+ per position                        │
│  ❌ Can't verify skills beyond resume claims                            │
│  ❌ Candidates unprepared = wasted interview time                       │
│  ❌ High offer rejection rates                                          │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
```

### Our Solution

```
┌────────────────────────────────────────────────────────────────────────┐
│                        THE SOLUTION                                      │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  STUDENT                           COMPANY                              │
│  ───────                           ───────                              │
│  ✅ Learn through projects         ✅ Post jobs with full transparency  │
│  ✅ Get verified skill badges      ✅ See verified project portfolios   │
│  ✅ See company interview process  ✅ AI-powered candidate screening    │
│  ✅ Practice with AI mock          ✅ Interview better-prepared         │
│     interviews                         candidates                        │
│  ✅ Track application status       ✅ Collaborative hiring tools        │
│  ✅ Get rejection feedback         ✅ Faster time-to-hire              │
│                                                                          │
│                    SHARED DATABASE                                       │
│                    ───────────────                                       │
│                    ✅ Unified profiles                                   │
│                    ✅ Verified skills from projects                      │
│                    ✅ Real-time status updates                           │
│                    ✅ Interview process data                             │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ PLATFORM ARCHITECTURE OVERVIEW

### Two-Platform Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CODER'Z HIRING ECOSYSTEM                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌───────────────────────┐         ┌───────────────────────┐           │
│   │     MAIN PLATFORM     │         │     FLOWSYNC          │           │
│   │     (Students)        │◄───────►│     (Companies)       │           │
│   │                       │         │                       │           │
│   │   /jobs               │         │   /jobs (post)        │           │
│   │   /companies          │         │   /candidates         │           │
│   │   /mock               │         │   /interviews         │           │
│   │   /applications       │         │   /analytics          │           │
│   │   /interview-prep     │         │   /team               │           │
│   └───────────┬───────────┘         └───────────┬───────────┘           │
│               │                                 │                        │
│               └─────────────┬───────────────────┘                        │
│                             │                                            │
│                   ┌─────────▼─────────┐                                  │
│                   │   SHARED DATABASE │                                  │
│                   │   ───────────────  │                                  │
│                   │   • Users         │                                  │
│                   │   • Projects      │                                  │
│                   │   • Skills        │                                  │
│                   │   • Companies     │                                  │
│                   │   • Jobs          │                                  │
│                   │   • Applications  │                                  │
│                   │   • Interviews    │                                  │
│                   │   • Mock Sessions │                                  │
│                   └───────────────────┘                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Between Platforms

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA FLOW DIAGRAM                                │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                    COMPANY → STUDENT FLOW                                │
│                    ──────────────────────                                │
│                                                                          │
│   FlowSync                           Main Platform                       │
│   ────────                           ─────────────                       │
│                                                                          │
│   [Post Job] ─────────────────────► [Job appears in /jobs]              │
│                                                                          │
│   [Configure Interview ──────────► [Interview process visible           │
│    Process]                          in Company Details]                 │
│                                                                          │
│   [Update Application ───────────► [Status updates in                   │
│    Status]                           /applications]                      │
│                                                                          │
│   [Send Rejection ───────────────► [Feedback visible to                 │
│    Feedback]                         student]                            │
│                                                                          │
│                                                                          │
│                    STUDENT → COMPANY FLOW                                │
│                    ──────────────────────                                │
│                                                                          │
│   Main Platform                      FlowSync                            │
│   ─────────────                      ────────                            │
│                                                                          │
│   [Complete Projects] ───────────► [Verified portfolio visible          │
│                                      to recruiters]                      │
│                                                                          │
│   [Submit Application] ──────────► [Application in pipeline]            │
│                                                                          │
│   [Mock Interview ───────────────► [Practice scores visible             │
│    Scores (opt-in)]                  if student shares]                  │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 MAIN PLATFORM (STUDENT) - JOBS & INTERVIEW MODULE

### New Routes to Add

```
/jobs                     - Job Discovery Hub
/jobs/[jobId]             - Job Details + Apply
/companies                - Company Directory
/companies/[companyId]    - Company Transparency Dashboard
/applications             - My Applications Tracker
/mock                     - Mock Interview Hub (existing, enhance)
/mock/voice/[sessionId]   - Voice Mock Interview
/mock/coding/[sessionId]  - Coding Mock Interview
/mock/design/[sessionId]  - System Design Mock Interview
/interview-prep           - Interview Preparation Resources
```

### Screen Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                    STUDENT JOB DISCOVERY FLOW                           │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                           ┌──────────────┐                              │
│                           │   DASHBOARD  │                              │
│                           │   /home      │                              │
│                           └──────┬───────┘                              │
│                                  │                                       │
│            ┌────────────────────┼────────────────────┐                  │
│            ▼                    ▼                    ▼                  │
│   ┌────────────────┐   ┌────────────────┐   ┌────────────────┐         │
│   │   JOBS HUB     │   │   COMPANIES    │   │  APPLICATIONS  │         │
│   │   /jobs        │   │   /companies   │   │  /applications │         │
│   └───────┬────────┘   └───────┬────────┘   └────────────────┘         │
│           │                    │                                        │
│           ▼                    ▼                                        │
│   ┌────────────────┐   ┌────────────────┐                              │
│   │  JOB DETAILS   │   │   COMPANY      │                              │
│   │  /jobs/[id]    │◄──│   DETAILS      │                              │
│   │                │   │  /companies/   │                              │
│   └───────┬────────┘   │   [id]         │                              │
│           │            └───────┬────────┘                              │
│           │                    │                                        │
│           │    ┌───────────────┘                                        │
│           ▼    ▼                                                        │
│   ┌────────────────┐                                                   │
│   │ INTERVIEW      │                                                   │
│   │ PROCESS VIEW   │                                                   │
│   │ (Transparency  │                                                   │
│   │  Dashboard)    │                                                   │
│   └───────┬────────┘                                                   │
│           │                                                             │
│           ├─────────────────────┬─────────────────────┐                │
│           ▼                     ▼                     ▼                │
│   ┌────────────────┐   ┌────────────────┐   ┌────────────────┐         │
│   │   APPLY        │   │  MOCK VOICE    │   │  MOCK CODING   │         │
│   │                │   │  INTERVIEW     │   │  INTERVIEW     │         │
│   └────────────────┘   └────────────────┘   └────────────────┘         │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
```

### Screen 1: Jobs Hub (`/jobs`)

**Purpose:** Discover relevant jobs with AI-powered matching

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🎯 Jobs Hub - Find Your Next Opportunity                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─ FILTERS ─────────────┐  ┌─ JOB LISTINGS ───────────────────────────┐│
│  │                        │  │                                          ││
│  │ 🔍 Search jobs...      │  │ ⭐ MATCHED FOR YOU (23 jobs)             ││
│  │                        │  │                                          ││
│  │ ━━ Skill Match ━━      │  │ ┌────────────────────────────────────┐  ││
│  │ ○ All Jobs (157)       │  │ │  🏢 TechCorp                       │  ││
│  │ ● 80%+ Match (23)      │  │ │  Software Engineer                  │  ││
│  │ ○ 60-80% (45)          │  │ │                                    │  ││
│  │ ○ <60% (89)            │  │ │  📍 Remote | 💰 $120-150K          │  ││
│  │                        │  │ │  ⚡ 95% Skill Match                 │  ││
│  │ ━━ Experience ━━       │  │ │                                    │  ││
│  │ ☑ Entry Level (45)     │  │ │  Required: React, Node, Python     │  ││
│  │ ☐ Mid Level (67)       │  │ │  ✅ You have 4/4 required skills   │  ││
│  │ ☐ Senior (45)          │  │ │                                    │  ││
│  │                        │  │ │  [👁 View] [🎯 Apply] [🎭 Mock]     │  ││
│  │ ━━ Location ━━         │  │ └────────────────────────────────────┘  ││
│  │ ☑ Remote (78)          │  │                                          ││
│  │ ☐ Hybrid (45)          │  │ ┌────────────────────────────────────┐  ││
│  │ ☐ On-site (34)         │  │ │  🏢 StartupXYZ                     │  ││
│  │                        │  │ │  Full Stack Developer               │  ││
│  │ ━━ Job Type ━━         │  │ │                                    │  ││
│  │ ☑ Full-time            │  │ │  📍 San Francisco | 💰 $100-130K   │  ││
│  │ ☐ Contract             │  │ │  ⚡ 88% Skill Match                 │  ││
│  │ ☐ Internship           │  │ │                                    │  ││
│  │                        │  │ │  Required: React, Node, Docker     │  ││
│  │ ━━ Salary Range ━━     │  │ │  ⚠️ Missing: Docker                │  ││
│  │ $0 ────●───── $200K    │  │ │                                    │  ││
│  │                        │  │ │  [👁 View] [🎯 Apply] [📚 Learn]    │  ││
│  │ [Clear All Filters]    │  │ └────────────────────────────────────┘  ││
│  │                        │  │                                          ││
│  └────────────────────────┘  │ [Load More Jobs...]                      ││
│                              └──────────────────────────────────────────┘│
│                                                                          │
│  💡 Missing skills? Learn them through projects and get verified badges! │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- AI-powered skill matching (shows % match)
- Skill gap identification ("Missing: Docker")
- Quick actions: View, Apply, Practice Mock Interview
- Non-overwhelming, curated feed
- Links to learn missing skills through projects

---

### Screen 2: Companies Directory (`/companies`)

**Purpose:** Browse all companies on the platform

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🏢 Companies - Explore Companies Hiring Now                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  🔍 Search companies...                                                  │
│                                                                          │
│  ━━ Quick Filters ━━                                                    │
│  [All] [Tech] [Finance] [Healthcare] [Startups] [Enterprise]            │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                        FEATURED COMPANIES                            ││
│  │                                                                       ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               ││
│  │  │  [Logo]      │  │  [Logo]      │  │  [Logo]      │               ││
│  │  │  TechCorp    │  │  StartupXYZ  │  │  FinanceABC  │               ││
│  │  │  ⭐ 4.5      │  │  ⭐ 4.2      │  │  ⭐ 4.0      │               ││
│  │  │              │  │              │  │              │               ││
│  │  │  5 Open Jobs │  │  3 Open Jobs │  │  8 Open Jobs │               ││
│  │  │  92% respond │  │  88% respond │  │  95% respond │               ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘               ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ━━ All Companies (156) ━━                                              │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  [Logo] TechCorp                                                  │  │
│  │  Industry: Technology | Size: 500-1000 | 📍 Remote-first         │  │
│  │  ⭐ 4.5/5 (230 reviews) | 🎯 5 Open Jobs | 📊 92% Response Rate  │  │
│  │  "Building the future of developer tools..."                      │  │
│  │  [View Company] [See Jobs] [Interview Process]                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Featured companies (premium placement)
- Response rate transparency
- Quick links to jobs and interview process
- Industry/size filters
- Star ratings from candidate reviews

---

### Screen 3: Company Transparency Dashboard (`/companies/[companyId]`)

**Purpose:** Complete transparency about company and interview process

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to Companies                                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  [Company Logo]                                                      ││
│  │                                                                       ││
│  │  TechCorp                                                            ││
│  │  🌐 www.techcorp.com | 📍 Remote-first | 👥 500-1000 employees      ││
│  │  ⭐ 4.5/5 (230 reviews)                                              ││
│  │                                                                       ││
│  │  "Building the future of developer tools. We believe in             ││
│  │   transparency, innovation, and empowering developers."              ││
│  │                                                                       ││
│  │  [🎯 View Open Jobs (5)] [💬 Write Review]                           ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ━━━ TABS ━━━                                                           │
│  [Overview] [Interview Process] [Culture & Benefits] [Reviews]          │
│                                                                          │
│  ════════════════════ INTERVIEW PROCESS ════════════════════            │
│                                                                          │
│  📋 Total Duration: 2-3 weeks | ✅ Response Rate: 92%                   │
│  📈 Application→Interview: 15% | 📈 Interview→Offer: 25%                │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  ROUND 1: Initial Phone Screen                                      ││
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ││
│  │                                                                       ││
│  │  ⏱ Duration: 30 minutes                                              ││
│  │  📞 Format: Voice call with recruiter                                ││
│  │                                                                       ││
│  │  ━━ What to Expect ━━                                                ││
│  │  • Background and experience review                                  ││
│  │  • "Tell me about yourself" question                                 ││
│  │  • Why TechCorp? Why this role?                                      ││
│  │  • Salary expectations discussion                                    ││
│  │  • Basic technical screening (high-level)                            ││
│  │                                                                       ││
│  │  ━━ Sample Questions ━━                                              ││
│  │  • "Walk me through your resume"                                     ││
│  │  • "Why are you interested in this position?"                        ││
│  │  • "What are your salary expectations?"                              ││
│  │                                                                       ││
│  │  ━━ Evaluation Criteria ━━                                           ││
│  │  ✓ Communication skills                                              ││
│  │  ✓ Cultural fit assessment                                           ││
│  │  ✓ Technical background match                                        ││
│  │  ✓ Motivation and genuine interest                                   ││
│  │                                                                       ││
│  │  📊 Pass Rate: ~40% move to next round                               ││
│  │  ⏳ Time to Next Round: 3-5 days                                     ││
│  │                                                                       ││
│  │  [🎭 Practice This Round with AI Mock Interview]                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  ROUND 2: Technical Coding Challenge                                ││
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ││
│  │                                                                       ││
│  │  ⏱ Duration: 90 minutes                                              ││
│  │  💻 Format: Live coding via Zoom + shared editor                     ││
│  │                                                                       ││
│  │  ━━ What to Expect ━━                                                ││
│  │  • 2-3 LeetCode-style algorithm problems                             ││
│  │  • Medium to hard difficulty                                         ││
│  │  • Focus: Arrays, strings, trees, dynamic programming                ││
│  │  • You'll explain your thought process                               ││
│  │  • Interviewer may give hints if stuck                               ││
│  │                                                                       ││
│  │  ━━ Topics Covered ━━                                                ││
│  │  • Data Structures: Arrays, Hash Maps, Trees, Graphs                 ││
│  │  • Algorithms: Sorting, Searching, Dynamic Programming               ││
│  │  • Complexity: Time and Space analysis                               ││
│  │                                                                       ││
│  │  📊 Pass Rate: ~30% move to next round                               ││
│  │  ⏳ Time to Next Round: 5-7 days                                     ││
│  │                                                                       ││
│  │  [💻 Practice Coding Challenges] [🎭 Start Mock Round]               ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  [ROUND 3: System Design] [ROUND 4: Behavioral + Hiring Manager]        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Why This Is Revolutionary:**
- Complete transparency into interview process
- Sample questions and evaluation criteria
- Pass rates set realistic expectations
- Direct links to practice each round
- Reduces interview anxiety significantly

---

### Screen 4: My Applications (`/applications`)

**Purpose:** Track all job applications and their status

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📋 My Applications                                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ━━ Quick Stats ━━                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │  Active    │  │ Interviews │  │  Offers    │  │ Response   │        │
│  │    8       │  │    3       │  │    1       │  │   Rate     │        │
│  │            │  │ Scheduled  │  │  Pending   │  │   85%      │        │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘        │
│                                                                          │
│  ━━ Filter by Status ━━                                                 │
│  [All] [Under Review] [Interview] [Offer] [Rejected]                    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  🟢 INTERVIEW SCHEDULED                                             ││
│  │                                                                       ││
│  │  [Logo] TechCorp - Software Engineer                                 ││
│  │  Applied: Jan 15, 2026 | Status Updated: Jan 20, 2026               ││
│  │                                                                       ││
│  │  ━━ Timeline ━━                                                      ││
│  │  ✅ Applied ─► ✅ Under Review ─► 🟢 Interview ─► ○ Decision         ││
│  │                                                                       ││
│  │  📅 Next: Round 2 - Coding Interview                                 ││
│  │  🗓 Scheduled: Tomorrow, 2:00 PM PST                                 ││
│  │                                                                       ││
│  │  🎯 Interview Prep Progress:                                         ││
│  │  Round 1: ✅ Completed (85%)                                         ││
│  │  Round 2: 🔄 In Progress (45%) ← PRACTICE NOW                        ││
│  │                                                                       ││
│  │  [📝 View Details] [🎭 Practice Round 2] [📅 Add to Calendar]        ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  🟡 UNDER REVIEW                                                    ││
│  │                                                                       ││
│  │  [Logo] StartupXYZ - Full Stack Developer                            ││
│  │  Applied: Jan 18, 2026 | Status: Being reviewed by hiring team      ││
│  │                                                                       ││
│  │  ━━ Timeline ━━                                                      ││
│  │  ✅ Applied ─► 🟡 Under Review ─► ○ Interview ─► ○ Decision          ││
│  │                                                                       ││
│  │  💡 Tip: Practice their interview while you wait!                    ││
│  │  [📝 View Details] [🎭 Practice Interview]                           ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  🔴 NOT SELECTED                                                    ││
│  │                                                                       ││
│  │  [Logo] FinanceABC - Backend Developer                               ││
│  │  Applied: Jan 10, 2026 | Decision: Jan 17, 2026                     ││
│  │                                                                       ││
│  │  ━━ Feedback ━━                                                      ││
│  │  "Thank you for your interest. We were impressed by your Python     ││
│  │   skills. However, we moved forward with candidates who had more    ││
│  │   experience with microservices and Kubernetes.                     ││
│  │                                                                       ││
│  │   We encourage you to apply again once you've gained more           ││
│  │   experience in these areas."                                        ││
│  │                                                                       ││
│  │  💡 Recommended Actions:                                             ││
│  │  • Build a microservices project (2-3 weeks)                         ││
│  │  • Learn Kubernetes basics                                           ││
│  │  • Reapply in 3-6 months                                             ││
│  │                                                                       ││
│  │  [📚 Learn Microservices] [📚 Learn Kubernetes] [🔄 Find Similar]    ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Real-time status updates (no more ghosting!)
- Clear timeline visualization
- Interview prep progress tracking
- **Mandatory rejection feedback** (differentiator!)
- Actionable next steps for improvement

---

### Screen 5: Mock Interview Hub (`/mock`)

**Purpose:** Central hub for all interview preparation

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🎯 Interview Preparation Hub                                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  📊 YOUR INTERVIEW READINESS                                        ││
│  │                                                                       ││
│  │  Overall Score: 72% ━━━━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░░░░            ││
│  │                                                                       ││
│  │  Voice/Behavioral: 85%  ████████░░                                   ││
│  │  Coding:           68%  ██████░░░░                                   ││
│  │  System Design:    62%  ██████░░░░                                   ││
│  │                                                                       ││
│  │  Total Practice Sessions: 15 | This Week: 4                          ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ━━━ YOUR ACTIVE APPLICATIONS ━━━                                       │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  🏢 TechCorp - Software Engineer                                    ││
│  │  Status: 🟡 Under Review (Applied 3 days ago)                       ││
│  │                                                                       ││
│  │  Practice Their Interview Process:                                   ││
│  │                                                                       ││
│  │  Round 1: Phone Screen      ✅ Completed | Score: 85%                ││
│  │  ├ Communication: 88%         [View Feedback] [Practice Again]       ││
│  │  ├ STAR Method: 82%                                                  ││
│  │  └ Overall: Strong performance                                       ││
│  │                                                                       ││
│  │  Round 2: Coding Challenge   🔄 RECOMMENDED NEXT                     ││
│  │  ├ 3 practice problems available                                     ││
│  │  ├ Estimated time: 90 minutes                                        ││
│  │  └ [Start Practice Session]                                          ││
│  │                                                                       ││
│  │  Round 3: System Design      🔒 Complete Round 2 first               ││
│  │  Round 4: Behavioral         🔒 Complete Round 3 first               ││
│  │                                                                       ││
│  │  🎯 Interview Readiness: 62% → Target: 80%+                          ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ━━━ PRACTICE BY TYPE ━━━                                               │
│                                                                          │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               │
│  │  📞 VOICE     │  │  💻 CODING    │  │  🎨 SYSTEM    │               │
│  │  INTERVIEWS   │  │  CHALLENGES   │  │  DESIGN      │               │
│  │               │  │               │  │               │               │
│  │  Behavioral   │  │  Algorithms   │  │  Whiteboard   │               │
│  │  Phone Screen │  │  Data Struct  │  │  Architecture │               │
│  │  HR Questions │  │  Problem Solv │  │  Scalability  │               │
│  │               │  │               │  │               │               │
│  │  [Practice]   │  │  [Practice]   │  │  [Practice]   │               │
│  └───────────────┘  └───────────────┘  └───────────────┘               │
│                                                                          │
│  ━━━ RECENT PRACTICE SESSIONS ━━━                                       │
│                                                                          │
│  • Voice Mock - TechCorp Round 1 | Score: 85% | Jan 19, 2026           │
│  • Coding Practice - Arrays | Score: 78% | Jan 18, 2026                 │
│  • System Design - URL Shortener | Score: 72% | Jan 17, 2026           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🏢 HIRING PLATFORM (FLOWSYNC) - COMPANY MODULE

### Current Routes (Existing in `/apps/hiring`)

```
/home                     - Dashboard
/jobs                     - Job Management
/candidates               - Candidate Pipeline
/applications             - Applications Management
/assessments              - Assessments
/team                     - Team Management
/analytics                - Analytics
/company                  - Company Settings
/billing                  - Billing
/settings                 - Settings
/profile                  - Profile
/help                     - Help Center
```

### New/Enhanced Routes to Add

```
/onboarding               - Company Onboarding Flow
/interview-config         - Interview Process Builder (CRITICAL)
/jobs/new                 - Enhanced Job Creation with Interview Assignment
/candidates/[id]          - Enhanced Candidate View with Projects
/schedule                 - Interview Scheduling Hub
/collaborate              - Collaborative Evaluation
```

### Screen Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                    COMPANY HIRING FLOW                                  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                    ┌────────────────────┐                               │
│                    │     ONBOARDING     │                               │
│                    │  (First Time Only) │                               │
│                    └──────────┬─────────┘                               │
│                               │                                          │
│                               ▼                                          │
│                    ┌────────────────────┐                               │
│                    │ INTERVIEW PROCESS  │ ← MANDATORY                   │
│                    │    CONFIGURATION   │                               │
│                    └──────────┬─────────┘                               │
│                               │                                          │
│                               ▼                                          │
│                    ┌────────────────────┐                               │
│                    │     DASHBOARD      │                               │
│                    │       /home        │                               │
│                    └──────────┬─────────┘                               │
│                               │                                          │
│       ┌───────────────────────┼───────────────────────┐                 │
│       ▼                       ▼                       ▼                 │
│ ┌───────────────┐   ┌───────────────┐   ┌───────────────┐              │
│ │  POST JOBS    │   │  CANDIDATES   │   │   ANALYTICS   │              │
│ │    /jobs      │   │  /candidates  │   │  /analytics   │              │
│ └───────┬───────┘   └───────┬───────┘   └───────────────┘              │
│         │                   │                                           │
│         ▼                   ▼                                           │
│ ┌───────────────┐   ┌───────────────┐                                  │
│ │   JOB FORM    │   │  CANDIDATE    │                                  │
│ │  + Assign     │   │   PROFILE     │                                  │
│ │  Interview    │   │  + Projects   │                                  │
│ │  Process      │   │  + Portfolio  │                                  │
│ └───────────────┘   └───────┬───────┘                                  │
│                             │                                           │
│                             ▼                                           │
│                     ┌───────────────┐                                  │
│                     │   SCHEDULE    │                                  │
│                     │  INTERVIEW    │                                  │
│                     └───────┬───────┘                                  │
│                             │                                           │
│                             ▼                                           │
│                     ┌───────────────┐                                  │
│                     │  EVALUATE &   │                                  │
│                     │   DECISION    │                                  │
│                     └───────────────┘                                  │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
```

### Screen 1: Company Onboarding (`/onboarding`)

**Purpose:** Guide new companies through complete setup

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🚀 Welcome to FlowSync - Let's Set Up Your Hiring                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Progress: ━━━━━━━━━━━━━━━━░░░░░░░░░░ Step 2 of 4                       │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                                                       ││
│  │  ━━ STEP 2: CONFIGURE YOUR INTERVIEW PROCESS ━━                      ││
│  │                                                                       ││
│  │  This is crucial! When you share your interview process, students   ││
│  │  can prepare better and arrive more confident. This leads to:       ││
│  │                                                                       ││
│  │  ✅ 40% better-prepared candidates                                   ││
│  │  ✅ 30% faster hiring decisions                                      ││
│  │  ✅ Higher offer acceptance rates                                    ││
│  │                                                                       ││
│  │  Define your default interview process (you can customize per job)  ││
│  │                                                                       ││
│  │  ┌───────────────────────────────────────────────────────────────┐  ││
│  │  │  How many interview rounds do you typically have?              │  ││
│  │  │                                                                 │  ││
│  │  │  [1] [2] [3] [4] [5] [6+]                                       │  ││
│  │  │       ▲                                                         │  ││
│  │  │  Selected: 4 rounds                                             │  ││
│  │  └───────────────────────────────────────────────────────────────┘  ││
│  │                                                                       ││
│  │  [Continue to Configure Rounds →]                                    ││
│  │                                                                       ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ━━ Steps ━━                                                            │
│  ✅ Company Information                                                  │
│  🔵 Interview Process (Current)                                         │
│  ○ Culture & Benefits                                                    │
│  ○ Team Setup                                                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 2: Interview Process Builder (`/interview-config`)

**Purpose:** Configure company's interview process - THIS IS MANDATORY

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ⚙️ Interview Process Configuration                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  💡 This information will help candidates prepare and enables           │
│     AI-powered mock interviews tailored to your process.                │
│                                                                          │
│  ━━ DEFAULT PROCESS (Applied to all jobs unless overridden) ━━         │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  ROUND 1                                              [Edit] [×]    ││
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ││
│  │                                                                       ││
│  │  Round Type: [Phone Screen ▼]                                        ││
│  │                                                                       ││
│  │  Duration: [30] minutes                                              ││
│  │                                                                       ││
│  │  Format: ○ Voice Call  ○ Video Call  ○ In-Person  ○ Take-Home       ││
│  │          ●                                                            ││
│  │                                                                       ││
│  │  Description for Candidates:                                         ││
│  │  ┌───────────────────────────────────────────────────────────────┐  ││
│  │  │ Initial conversation with a recruiter to discuss your         │  ││
│  │  │ background, experience, and interest in the role. We'll also  │  ││
│  │  │ cover salary expectations and next steps.                     │  ││
│  │  └───────────────────────────────────────────────────────────────┘  ││
│  │                                                                       ││
│  │  Sample Questions (Optional - helps candidates prepare):            ││
│  │  ┌───────────────────────────────────────────────────────────────┐  ││
│  │  │ • Tell me about yourself                                      │  ││
│  │  │ • Why are you interested in this role?                        │  ││
│  │  │ • What are your salary expectations?                          │  ││
│  │  │ [+ Add Question]                                              │  ││
│  │  └───────────────────────────────────────────────────────────────┘  ││
│  │                                                                       ││
│  │  Evaluation Criteria:                                                ││
│  │  ☑ Communication skills                                              ││
│  │  ☑ Cultural fit                                                      ││
│  │  ☑ Technical background                                              ││
│  │  ☑ Motivation                                                        ││
│  │  ☐ [+ Add criteria]                                                  ││
│  │                                                                       ││
│  │  Pass Rate: [40]% (What % typically advance?)                        ││
│  │  Days to Next Round: [3-5] days                                      ││
│  │                                                                       ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  ROUND 2                                              [Edit] [×]    ││
│  │  Round Type: [Technical Coding ▼]                                   ││
│  │  Duration: [90] minutes | Format: Video + Code Editor               ││
│  │  [Expand to Configure ▼]                                            ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  ROUND 3                                              [Edit] [×]    ││
│  │  Round Type: [System Design ▼]                                      ││
│  │  Duration: [60] minutes | Format: Video + Whiteboard                ││
│  │  [Expand to Configure ▼]                                            ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  [+ Add Round]                                                          │
│                                                                          │
│  [Save as Default Process] [Preview What Candidates See]                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Round Type Options:**
- Phone Screen
- Technical Coding
- System Design
- Behavioral/HR
- Take-Home Assignment
- Panel Interview
- Hiring Manager
- Culture Fit
- Custom

---

### Screen 3: Candidate Pipeline (`/candidates`)

**Purpose:** Kanban-style view of all candidates

```
┌─────────────────────────────────────────────────────────────────────────┐
│  👥 Candidates Pipeline                             [+ Import] [Filter] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  🔍 Search candidates... | Job: [All Jobs ▼] | Source: [All ▼]          │
│                                                                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────┐│
│  │   NEW      │ │ SCREENING  │ │ SHORTLIST  │ │ INTERVIEW  │ │ OFFER  ││
│  │   (45)     │ │   (12)     │ │    (8)     │ │    (5)     │ │  (2)   ││
│  ├────────────┤ ├────────────┤ ├────────────┤ ├────────────┤ ├────────┤│
│  │            │ │            │ │            │ │            │ │        ││
│  │ ┌────────┐ │ │ ┌────────┐ │ │ ┌────────┐ │ │ ┌────────┐ │ │ ┌────┐ ││
│  │ │ [Img]  │ │ │ │ [Img]  │ │ │ │ [Img]  │ │ │ │ [Img]  │ │ │ │    │ ││
│  │ │ Alex C │ │ │ │ Sam K  │ │ │ │ Jordan │ │ │ │ Taylor │ │ │ │ Pat│ ││
│  │ │ 95% ⚡ │ │ │ │ 88% ⚡ │ │ │ │ 85% ⚡ │ │ │ │ Round 2│ │ │ │ 💰 │ ││
│  │ │ 3 proj │ │ │ │ 2 proj │ │ │ │ 5 proj │ │ │ │ Coding │ │ │ │    │ ││
│  │ └────────┘ │ │ └────────┘ │ │ └────────┘ │ │ └────────┘ │ │ └────┘ ││
│  │            │ │            │ │            │ │            │ │        ││
│  │ ┌────────┐ │ │ ┌────────┐ │ │ ┌────────┐ │ │ ┌────────┐ │ │        ││
│  │ │ [Img]  │ │ │ │ [Img]  │ │ │ │ [Img]  │ │ │ │ [Img]  │ │ │        ││
│  │ │ Morgan │ │ │ │ Casey  │ │ │ │ Riley  │ │ │ │ Drew   │ │ │        ││
│  │ │ 92% ⚡ │ │ │ │ 78% ⚡ │ │ │ │ 82% ⚡ │ │ │ │ Round 3│ │ │        ││
│  │ │ 4 proj │ │ │ │ 1 proj │ │ │ │ 3 proj │ │ │ │ Design │ │ │        ││
│  │ └────────┘ │ │ └────────┘ │ │ └────────┘ │ │ └────────┘ │ │        ││
│  │            │ │            │ │            │ │            │ │        ││
│  │ [+12 more] │ │ [+5 more]  │ │ [+2 more]  │ │            │ │        ││
│  │            │ │            │ │            │ │            │ │        ││
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────┘│
│                                                                          │
│  💡 Drag candidates between columns to update status                    │
│  ⚡ = Skill Match %  |  proj = Verified Projects                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 4: Candidate Detail View (`/candidates/[id]`)

**Purpose:** Complete candidate profile with verified projects

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to Candidates                                      [Actions ▼]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  [Avatar]                                                            ││
│  │                                                                       ││
│  │  Alex Chen                                                           ││
│  │  📧 alex.chen@email.com | 📍 San Francisco, CA                      ││
│  │  🔗 LinkedIn | 🐙 GitHub                                             ││
│  │                                                                       ││
│  │  ⚡ 95% Skill Match | Status: 🟡 Screening                           ││
│  │                                                                       ││
│  │  [📅 Schedule Interview] [💬 Message] [⭐ Shortlist] [❌ Reject]     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ━━━ TABS ━━━                                                           │
│  [Overview] [Verified Projects] [Resume] [Interview History] [Notes]    │
│                                                                          │
│  ════════════════════ VERIFIED PROJECTS ════════════════════            │
│                                                                          │
│  These projects were completed on CodeDot.AI and are verified.          │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  🔥 E-Commerce Platform                                   Verified ✓││
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ││
│  │                                                                       ││
│  │  A full-stack e-commerce platform with user authentication,         ││
│  │  product catalog, shopping cart, and Stripe payment integration.    ││
│  │                                                                       ││
│  │  Tech Stack: React, Node.js, PostgreSQL, Stripe, Redis              ││
│  │                                                                       ││
│  │  Completion: 100% | Code Quality: 92/100 | Time: 3 weeks            ││
│  │                                                                       ││
│  │  Skills Verified:                                                    ││
│  │  ✅ React.js (Intermediate)                                          ││
│  │  ✅ Node.js (Intermediate)                                           ││
│  │  ✅ PostgreSQL (Beginner)                                            ││
│  │  ✅ Payment Integration (Beginner)                                   ││
│  │                                                                       ││
│  │  [🌐 Live Demo] [💻 View Code] [📹 Video Walkthrough]               ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  💬 Real-Time Chat Application                            Verified ✓││
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ││
│  │                                                                       ││
│  │  WebSocket-based chat with real-time messaging, typing indicators,  ││
│  │  and message history.                                                ││
│  │                                                                       ││
│  │  Tech Stack: React, Socket.io, Express, MongoDB                     ││
│  │  Completion: 100% | Code Quality: 88/100                            ││
│  │                                                                       ││
│  │  [🌐 Live Demo] [💻 View Code]                                       ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ════════════════════ SKILL MATCH BREAKDOWN ════════════════════        │
│                                                                          │
│  Required Skills (4/4):                                                  │
│  ✅ React.js - Verified through 2 projects                              │
│  ✅ Node.js - Verified through 2 projects                               │
│  ✅ Python - Verified through 1 project                                 │
│  ✅ PostgreSQL - Verified through 1 project                             │
│                                                                          │
│  Nice-to-Have Skills (2/3):                                             │
│  ✅ Docker - Basic experience                                           │
│  ✅ Redis - Verified through 1 project                                  │
│  ⚠️ Kubernetes - Not verified                                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Unique Features:**
- Verified project portfolios (not just resume claims!)
- Live demos recruiters can actually test
- Code quality scores
- Skills verified through real work
- Clear skill match breakdown

---

## 🎭 MOCK INTERVIEW SYSTEM ARCHITECTURE

### System Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                    MOCK INTERVIEW SYSTEM ARCHITECTURE                   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                     INTERVIEW TYPES                             │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│       ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │
│       │    VOICE     │    │   CODING     │    │   SYSTEM     │         │
│       │  INTERVIEW   │    │  INTERVIEW   │    │   DESIGN     │         │
│       │              │    │              │    │              │         │
│       │ • Behavioral │    │ • Algorithm  │    │ • Whiteboard │         │
│       │ • Phone Scrn │    │ • Data Struct│    │ • Architect  │         │
│       │ • HR/Culture │    │ • Problem    │    │ • Scalability│         │
│       │              │    │   Solving    │    │              │         │
│       └──────┬───────┘    └──────┬───────┘    └──────┬───────┘         │
│              │                   │                   │                  │
│              └───────────────────┼───────────────────┘                  │
│                                  ▼                                       │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                     AI ENGINE (Core)                            │    │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │    │
│  │                                                                  │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │    │
│  │  │  Question    │  │  Response    │  │   Feedback   │          │    │
│  │  │  Generator   │  │  Analyzer    │  │   Generator  │          │    │
│  │  │  (GPT-4)     │  │  (GPT-4)     │  │   (GPT-4)    │          │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │    │
│  │                                                                  │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │    │
│  │  │   Speech     │  │   Code       │  │   Diagram    │          │    │
│  │  │   Engine     │  │   Executor   │  │   Analyzer   │          │    │
│  │  │  TTS + STT   │  │   Docker     │  │   GPT-4V     │          │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘          │    │
│  │                                                                  │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                  │                                       │
│                                  ▼                                       │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                     SESSION MANAGEMENT                          │    │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │    │
│  │                                                                  │    │
│  │  • Session creation & tracking                                  │    │
│  │  • Progress saving (auto-save every action)                     │    │
│  │  • Recording management (audio, video, code)                    │    │
│  │  • Score calculation & storage                                  │    │
│  │  • Analytics aggregation                                        │    │
│  │                                                                  │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
```

### Voice Interview Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                    VOICE INTERVIEW FLOW                                 │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐                                                       │
│  │ Start Session│                                                       │
│  └──────┬───────┘                                                       │
│         ▼                                                                │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ Load Interview Context                                        │      │
│  │ • Company interview process                                   │      │
│  │ • Round-specific questions                                    │      │
│  │ • Evaluation criteria                                         │      │
│  └──────────────────────────────────────────────────────────────┘      │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │                    INTERVIEW LOOP                             │      │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │      │
│  │                                                                │      │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │      │
│  │  │ AI Asks     │───►│ Student     │───►│ AI Analyzes │       │      │
│  │  │ Question    │    │ Responds    │    │ Response    │       │      │
│  │  │ (TTS)       │    │ (STT)       │    │             │       │      │
│  │  └─────────────┘    └─────────────┘    └─────────────┘       │      │
│  │        ▲                                      │               │      │
│  │        │                                      ▼               │      │
│  │        │         ┌───────────────────────────────────┐       │      │
│  │        │         │ Real-time Metrics:                │       │      │
│  │        │         │ • Pacing (words/min)              │       │      │
│  │        │         │ • Filler words count              │       │      │
│  │        │         │ • Clarity score                   │       │      │
│  │        │         │ • Response completeness           │       │      │
│  │        │         └───────────────────────────────────┘       │      │
│  │        │                                      │               │      │
│  │        └──────────── Next Question ◄──────────┘               │      │
│  │                                                                │      │
│  └──────────────────────────────────────────────────────────────┘      │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │ Generate Comprehensive Feedback                               │      │
│  │ • Overall score (0-100)                                       │      │
│  │ • Category breakdown (Communication, Content, STAR, etc.)     │      │
│  │ • Question-by-question analysis                               │      │
│  │ • Personalized improvement recommendations                    │      │
│  │ • Comparison to successful candidates                         │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
```

### Coding Interview Interface

```
┌─────────────────────────────────────────────────────────────────────────┐
│  💻 Coding Mock Interview - TechCorp Round 2              ⏱ 85:42 left  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─ PROBLEM ─────────────────────┐  ┌─ CODE EDITOR ─────────────────┐  │
│  │                                │  │                                │  │
│  │  Problem 1 of 3               │  │  [Python ▼] [JavaScript] [Java]│  │
│  │  ━━━━━━━━━━━━━                │  │                                │  │
│  │                                │  │  1│ def longest_substring(s): │  │
│  │  Longest Substring Without    │  │  2│     # Your code here       │  │
│  │  Repeating Characters         │  │  3│     char_index = {}        │  │
│  │                                │  │  4│     max_length = 0        │  │
│  │  Given a string s, find the   │  │  5│     start = 0              │  │
│  │  length of the longest        │  │  6│                            │  │
│  │  substring without repeating  │  │  7│     for i, char in enum... │  │
│  │  characters.                  │  │  8│                            │  │
│  │                                │  │                                │  │
│  │  Example 1:                   │  │                                │  │
│  │  Input: s = "abcabcbb"        │  │                                │  │
│  │  Output: 3                    │  │                                │  │
│  │  Explanation: "abc"           │  │                                │  │
│  │                                │  │                                │  │
│  │  Example 2:                   │  │  ┌─ TEST RESULTS ────────────┐ │  │
│  │  Input: s = "bbbbb"           │  │  │                            │ │  │
│  │  Output: 1                    │  │  │ Test 1: ✅ Passed (2ms)    │ │  │
│  │                                │  │  │ Test 2: ✅ Passed (1ms)    │ │  │
│  │  Constraints:                 │  │  │ Test 3: ❌ Failed          │ │  │
│  │  • 0 <= s.length <= 5*10^4    │  │  │   Expected: 3, Got: 2      │ │  │
│  │  • s consists of English...   │  │  │ Test 4: 🔒 Hidden          │ │  │
│  │                                │  │  │ Test 5: 🔒 Hidden          │ │  │
│  │  [💡 Hint 1] [💡 Hint 2]      │  │  │                            │ │  │
│  │                                │  │  └────────────────────────────┘ │  │
│  └────────────────────────────────┘  │                                │  │
│                                      │  [▶ Run] [✓ Submit] [🔄 Reset] │  │
│                                      └────────────────────────────────┘  │
│                                                                          │
│  ━━ AI INTERVIEWER ━━                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  🤖 "I see you're using a sliding window approach. Can you explain  ││
│  │      your thought process and the time complexity?"                  ││
│  │                                                                       ││
│  │  [🎤 Speak Your Answer] [⌨️ Type Answer]                             ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 💾 DATABASE SCHEMA

### Core Tables

```sql
-- =====================
-- COMPANY TABLES
-- =====================

-- Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  website VARCHAR(500),
  industry VARCHAR(255),
  size VARCHAR(50), -- '1-10', '11-50', '51-200', '201-1000', '1000+'
  locations JSONB,
  logo_url VARCHAR(500),
  mission_statement TEXT,
  culture_description TEXT,
  benefits JSONB,
  response_rate DECIMAL(5,2) DEFAULT 0,
  avg_time_to_hire INT, -- in days
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interview Processes
CREATE TABLE interview_processes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255),
  is_default BOOLEAN DEFAULT false,
  total_rounds INT NOT NULL,
  estimated_duration_weeks DECIMAL(3,1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interview Rounds
CREATE TABLE interview_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_id UUID REFERENCES interview_processes(id) ON DELETE CASCADE,
  round_number INT NOT NULL,
  round_type VARCHAR(50) NOT NULL, -- 'phone_screen', 'coding', 'system_design', 'behavioral', 'take_home', 'panel'
  title VARCHAR(255) NOT NULL,
  duration_minutes INT,
  format VARCHAR(50), -- 'voice', 'video', 'in_person', 'take_home'
  description TEXT NOT NULL, -- What candidates should expect
  sample_questions JSONB,
  evaluation_criteria JSONB,
  topics_covered JSONB,
  pass_rate DECIMAL(5,2),
  days_to_next_round INT,
  internal_notes TEXT, -- Not visible to candidates
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(process_id, round_number)
);

-- =====================
-- JOB TABLES
-- =====================

-- Jobs
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  interview_process_id UUID REFERENCES interview_processes(id),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  department VARCHAR(255),
  location VARCHAR(255),
  location_type VARCHAR(50), -- 'remote', 'hybrid', 'onsite'
  job_type VARCHAR(50), -- 'full_time', 'part_time', 'contract', 'internship'
  experience_level VARCHAR(50), -- 'entry', 'mid', 'senior', 'lead'
  required_skills JSONB NOT NULL,
  nice_to_have_skills JSONB,
  salary_min INT,
  salary_max INT,
  salary_currency VARCHAR(10) DEFAULT 'USD',
  visa_sponsorship BOOLEAN DEFAULT false,
  relocation_assistance BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'active', -- 'draft', 'active', 'paused', 'closed'
  applications_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closes_at TIMESTAMP,
  UNIQUE(company_id, slug)
);

-- =====================
-- APPLICATION TABLES
-- =====================

-- Applications
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'applied', -- 'applied', 'under_review', 'shortlisted', 'interview', 'offer', 'rejected', 'withdrawn'
  current_round INT DEFAULT 0,
  cover_letter TEXT,
  featured_projects JSONB, -- Array of project IDs
  resume_url VARCHAR(500),
  skill_match_score DECIMAL(5,2),
  rejection_feedback TEXT,
  rejection_reason VARCHAR(255),
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_status_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, job_id)
);

-- Application Timeline
CREATE TABLE application_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  actioned_by UUID, -- Company user who made the change
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- MOCK INTERVIEW TABLES
-- =====================

-- Mock Interview Sessions
CREATE TABLE mock_interview_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id),
  company_id UUID REFERENCES companies(id),
  interview_round_id UUID REFERENCES interview_rounds(id),
  session_type VARCHAR(50) NOT NULL, -- 'voice', 'coding', 'system_design'
  status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  duration_seconds INT,
  overall_score INT CHECK (overall_score >= 0 AND overall_score <= 100),
  feedback_summary JSONB,
  recording_url VARCHAR(500),
  transcript TEXT
);

-- Mock Interview Questions & Responses
CREATE TABLE mock_interview_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES mock_interview_sessions(id) ON DELETE CASCADE,
  question_number INT NOT NULL,
  question_text TEXT NOT NULL,
  student_response TEXT,
  response_duration_seconds INT,
  individual_score INT CHECK (individual_score >= 0 AND individual_score <= 100),
  ai_feedback JSONB,
  audio_url VARCHAR(500),
  code_submitted TEXT, -- For coding interviews
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================
-- SKILL VERIFICATION
-- =====================

-- Verified Skills (from projects)
CREATE TABLE verified_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_name VARCHAR(255) NOT NULL,
  proficiency_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced', 'expert'
  verified_through_project_id UUID REFERENCES projects(id),
  verification_score INT, -- 0-100
  verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, skill_name, verified_through_project_id)
);
```

---

## 🔌 API DOCUMENTATION

### Student Platform APIs

```typescript
// =====================
// JOB DISCOVERY
// =====================

// Get matched jobs for student
GET /api/jobs
Query: {
  skill_match_min?: number; // 0-100
  experience_level?: 'entry' | 'mid' | 'senior';
  location_type?: 'remote' | 'hybrid' | 'onsite';
  job_type?: 'full_time' | 'contract' | 'internship';
  salary_min?: number;
  page?: number;
  limit?: number;
}
Response: {
  jobs: Array<{
    id: string;
    title: string;
    company: { id, name, logo_url };
    location: string;
    salary_range: { min, max, currency };
    skill_match: {
      score: number;
      required_matched: string[];
      required_missing: string[];
      nice_to_have_matched: string[];
    };
    posted_at: string;
  }>;
  pagination: { page, limit, total, hasMore };
}

// Get job details with interview process
GET /api/jobs/:jobId
Response: {
  job: JobDetails;
  company: CompanyDetails;
  interview_process: {
    total_rounds: number;
    estimated_duration_weeks: number;
    rounds: Array<{
      round_number: number;
      type: string;
      title: string;
      duration_minutes: number;
      format: string;
      description: string;
      sample_questions?: string[];
      evaluation_criteria?: string[];
      pass_rate?: number;
      days_to_next_round?: number;
    }>;
  };
  skill_match: SkillMatchDetails;
  can_apply: boolean;
  already_applied: boolean;
}

// Apply to job
POST /api/jobs/:jobId/apply
Body: {
  cover_letter?: string;
  featured_project_ids?: string[];
  resume_url?: string;
}
Response: {
  application_id: string;
  status: 'applied';
}

// =====================
// APPLICATIONS
// =====================

// Get my applications
GET /api/applications
Query: {
  status?: 'applied' | 'under_review' | 'interview' | 'offer' | 'rejected';
}
Response: {
  applications: Array<{
    id: string;
    job: { id, title };
    company: { id, name, logo_url };
    status: string;
    current_round: number;
    applied_at: string;
    last_update: string;
    next_action?: {
      type: 'interview_scheduled' | 'awaiting_response';
      date?: string;
      round_type?: string;
    };
    rejection_feedback?: string;
    interview_prep_progress: {
      rounds_practiced: number;
      total_rounds: number;
      average_score: number;
    };
  }>;
}

// =====================
// MOCK INTERVIEWS
// =====================

// Start mock interview session
POST /api/mock/sessions
Body: {
  job_id?: string;
  company_id?: string;
  round_id?: string;
  session_type: 'voice' | 'coding' | 'system_design';
}
Response: {
  session_id: string;
  questions: Array<{
    id: string;
    question_number: number;
    question_text: string;
    expected_duration_seconds: number;
    tips?: string[];
  }>;
  context: {
    company_name?: string;
    round_type?: string;
    evaluation_criteria?: string[];
  };
}

// Submit response
POST /api/mock/sessions/:sessionId/responses
Body: {
  question_number: number;
  response_text?: string;
  audio_url?: string;
  code_submitted?: string;
  duration_seconds: number;
}
Response: {
  individual_score: number;
  feedback: {
    strengths: string[];
    improvements: string[];
    tips: string[];
  };
}

// Complete session and get full feedback
POST /api/mock/sessions/:sessionId/complete
Response: {
  overall_score: number;
  category_scores: {
    communication?: number;
    technical_accuracy?: number;
    problem_solving?: number;
    star_method?: number;
    code_quality?: number;
  };
  question_reviews: Array<{
    question_number: number;
    score: number;
    feedback: string;
    audio_url?: string;
  }>;
  recommendations: Array<{
    area: string;
    suggestion: string;
    resources?: string[];
  }>;
  comparison: {
    percentile: number; // How you compare to others
    trend: 'improving' | 'stable' | 'declining';
  };
}
```

### Company Platform APIs

```typescript
// =====================
// INTERVIEW PROCESS
// =====================

// Create/Update interview process
POST /api/company/interview-processes
Body: {
  name: string;
  is_default: boolean;
  rounds: Array<{
    round_number: number;
    round_type: string;
    title: string;
    duration_minutes: number;
    format: string;
    description: string;
    sample_questions?: string[];
    evaluation_criteria?: string[];
    topics_covered?: string[];
    pass_rate?: number;
    days_to_next_round?: number;
  }>;
}

// =====================
// CANDIDATES
// =====================

// Get candidate pipeline
GET /api/company/candidates
Query: {
  job_id?: string;
  status?: string;
  skill_match_min?: number;
}
Response: {
  pipeline: {
    new: Candidate[];
    screening: Candidate[];
    shortlisted: Candidate[];
    interview: Candidate[];
    offer: Candidate[];
  };
}

// Get candidate details with verified projects
GET /api/company/candidates/:candidateId
Response: {
  candidate: {
    id: string;
    name: string;
    email: string;
    profile_url: string;
    skill_match: SkillMatchDetails;
    verified_projects: Array<{
      id: string;
      title: string;
      description: string;
      tech_stack: string[];
      completion_score: number;
      code_quality_score: number;
      live_demo_url?: string;
      github_url?: string;
      video_url?: string;
      skills_verified: string[];
    }>;
    resume_url?: string;
    application: ApplicationDetails;
    mock_interview_scores?: {
      voice: number;
      coding: number;
      system_design: number;
    };
  };
}

// Update candidate status
PATCH /api/company/candidates/:candidateId/status
Body: {
  status: string;
  feedback?: string; // Required for rejection
  schedule_interview?: {
    round_number: number;
    datetime: string;
    interviewers: string[];
  };
}
```

---

## 🛠️ TECHNICAL IMPLEMENTATION

### Technology Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                    TECHNOLOGY STACK                                     │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  FRONTEND (Both Platforms)                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━                                             │
│  • Next.js 15 (App Router)                                              │
│  • React 19                                                             │
│  • TypeScript                                                           │
│  • Tailwind CSS + shadcn/ui                                             │
│  • React Query (TanStack Query)                                         │
│  • Zustand (State Management)                                           │
│                                                                          │
│  BACKEND                                                                │
│  ━━━━━━━━                                                               │
│  • Next.js API Routes / Server Actions                                  │
│  • tRPC (Optional - for type-safe APIs)                                 │
│  • Prisma ORM                                                           │
│                                                                          │
│  DATABASE                                                               │
│  ━━━━━━━━━                                                              │
│  • PostgreSQL (Primary)                                                 │
│  • Redis (Caching, Sessions, Rate Limiting)                             │
│  • Elasticsearch (Optional - Job Search)                                │
│                                                                          │
│  AI/ML SERVICES                                                         │
│  ━━━━━━━━━━━━━━                                                         │
│  • OpenAI GPT-4 / Claude                                                │
│    - Question generation                                                │
│    - Response analysis                                                  │
│    - Feedback generation                                                │
│    - Code review                                                        │
│  • ElevenLabs / Google Cloud TTS                                        │
│    - AI interviewer voice                                               │
│  • Deepgram / Google Cloud STT                                          │
│    - Speech-to-text for responses                                       │
│  • Docker                                                               │
│    - Sandboxed code execution                                           │
│                                                                          │
│  INFRASTRUCTURE                                                         │
│  ━━━━━━━━━━━━━━━                                                        │
│  • Vercel (Frontend + API)                                              │
│  • AWS/GCP (AI Services, Storage)                                       │
│  • S3/R2 (File Storage)                                                 │
│  • Cloudflare (CDN)                                                     │
│                                                                          │
│  INTEGRATIONS                                                           │
│  ━━━━━━━━━━━━━                                                          │
│  • Google Calendar / Outlook (Scheduling)                               │
│  • Zoom / Google Meet (Video Interviews)                                │
│  • SendGrid (Emails)                                                    │
│  • Twilio (SMS Notifications)                                           │
│  • Stripe (Billing)                                                     │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 PHASE 1 FEATURE SCOPE

### What's Included in Phase 1

```
┌────────────────────────────────────────────────────────────────────────┐
│                    PHASE 1 SCOPE (MVP)                                  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  MAIN PLATFORM (Students)                                               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━                                               │
│  ✅ /jobs - Job discovery with skill matching                           │
│  ✅ /jobs/[id] - Job details + apply                                    │
│  ✅ /companies - Company directory                                      │
│  ✅ /companies/[id] - Company transparency dashboard                    │
│  ✅ /applications - Application tracking                                │
│  ✅ /mock - Mock interview hub                                          │
│  ✅ Voice mock interviews                                               │
│  ⏳ Coding mock interviews (basic)                                      │
│  ⏳ System design (coming in Phase 2)                                   │
│                                                                          │
│  FLOWSYNC (Companies)                                                   │
│  ━━━━━━━━━━━━━━━━━━━━                                                   │
│  ✅ Company onboarding                                                  │
│  ✅ Interview process configuration (MANDATORY)                         │
│  ✅ Job posting with interview assignment                               │
│  ✅ Candidate pipeline (Kanban)                                         │
│  ✅ Candidate profiles with verified projects                           │
│  ✅ Application status management                                       │
│  ✅ Rejection feedback (mandatory)                                      │
│  ⏳ Interview scheduling (basic)                                        │
│  ⏳ Collaborative evaluation (Phase 2)                                  │
│                                                                          │
│  SHARED FEATURES                                                        │
│  ━━━━━━━━━━━━━━━                                                        │
│  ✅ Skill verification from projects                                    │
│  ✅ Real-time status sync                                               │
│  ✅ Basic analytics                                                     │
│  ✅ Email notifications                                                 │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
```

### Development Timeline (Phase 1)

```
Week 1-2:  Database schema + API foundations
Week 3-4:  Job discovery + Company directory (Student)
Week 5-6:  Company onboarding + Interview config (Company)
Week 7-8:  Application flow + Status tracking
Week 9-10: Mock interview - Voice module
Week 11-12: Integration testing + Polish
```

---

## 📝 SUMMARY

### What Makes This Revolutionary

1. **Interview Process Transparency** - No more black box hiring
2. **Company-Specific AI Mock Interviews** - Practice exactly what you'll face
3. **Verified Skills Through Projects** - Proof, not promises
4. **Mandatory Rejection Feedback** - No more ghosting
5. **Closed-Loop Ecosystem** - Learn → Build → Get Hired

### Success Metrics to Track

| Metric | Target |
|--------|--------|
| Student job application rate | 40% of active users |
| Company response rate | >90% |
| Mock interview completion | >70% |
| Time-to-hire improvement | 30% reduction |
| Offer acceptance rate | >75% |
| Student satisfaction (NPS) | >50 |

---

**Document Version:** 1.0  
**Last Updated:** February 2026  
**Next Document:** Phase 2 Advanced Features Blueprint