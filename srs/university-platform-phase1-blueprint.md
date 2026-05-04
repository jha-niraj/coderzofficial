# 🎓 UNIVERSITY PLATFORM PHASE 1 BLUEPRINT
## Coder'z University: Complete Academic Infrastructure
### Version 1.0 | February 2026

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [The Core Problem & Solution](#the-core-problem--solution)
3. [Platform Architecture Overview](#platform-architecture-overview)
4. [University Admin Portal (uni.coderz.me)](#university-admin-portal)
5. [Student University Module (Main Platform /uni)](#student-university-module)
6. [Role-Based Access System](#role-based-access-system)
7. [Assignment & Evaluation Engine](#assignment--evaluation-engine)
8. [Credits Distribution System](#credits-distribution-system)
9. [Database Schema](#database-schema)
10. [User Flows & Screen Specifications](#user-flows--screen-specifications)
11. [API Documentation](#api-documentation)
12. [Technical Implementation](#technical-implementation)
13. [Phase 1 Feature Scope](#phase-1-feature-scope)

---

## 🎯 EXECUTIVE SUMMARY

### What We're Building

A **revolutionary university management platform** that connects:
- **Universities** with modern curriculum delivery infrastructure
- **Faculty** with automated grading and student progress tracking
- **Students** with a unified learning experience bridging institutional and personal growth
- **Companies** with direct access to verified, job-ready talent

### The Game-Changing Innovation

**Unified Academic + Career Platform**

Universities onboard their institution, faculty creates assignments using our existing learning engines (Studio, Assessments, Mock Interviews, Spaces), and students access everything from one platform—whether assigned by their university or explored personally.

**Bridge the gap between classroom learning and industry readiness.**

### Key Differentiators

| Feature | Traditional LMS | Our Platform |
|---------|----------------|--------------|
| Coding Environment | External tools needed | Built-in Studio with live preview |
| Interview Prep | Separate platforms | Integrated AI Mock Interviews |
| Skill Verification | Self-reported | Verified through real projects |
| Job Connection | Manual process | Direct pipeline to hiring partners |
| Assessment Engine | Basic MCQs | AI-graded coding + quizzes |
| Progress Tracking | Per-course only | Unified across all learning |

---

## 🔥 THE CORE PROBLEM & SOLUTION

### Problems We're Solving

#### For Universities:
```
┌────────────────────────────────────────────────────────────────────────┐
│                    CURRENT UNIVERSITY PAIN POINTS                       │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ❌ Outdated curriculum doesn't match industry needs                    │
│  ❌ Manual grading is time-consuming (40+ hours/week for faculty)       │
│  ❌ No way to verify student skills beyond exams                        │
│  ❌ Placement cells struggle to connect students with companies         │
│  ❌ Students use multiple platforms (LMS, coding sites, interview prep) │
│  ❌ No real-time visibility into student progress                       │
│  ❌ Difficult to track placement outcomes                               │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
```

#### For Students:
```
┌────────────────────────────────────────────────────────────────────────┐
│                    CURRENT STUDENT PAIN POINTS                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ❌ College assignments don't prepare for real interviews               │
│  ❌ Need to use 5+ platforms (LMS, LeetCode, HackerRank, Pramp, etc.)  │
│  ❌ Personal learning is disconnected from university progress          │
│  ❌ No way to showcase verified skills to recruiters                    │
│  ❌ Limited access to campus job opportunities                          │
│  ❌ Generic interview prep doesn't help                                 │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
```

### Our Solution

```
┌────────────────────────────────────────────────────────────────────────┐
│                        THE SOLUTION                                      │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  UNIVERSITY                          STUDENT                            │
│  ──────────                          ───────                            │
│  ✅ Modern curriculum tools          ✅ One platform for everything     │
│  ✅ Automated grading                ✅ Uni assignments + personal      │
│  ✅ Real-time analytics              ✅ Industry-aligned learning       │
│  ✅ Direct company partnerships      ✅ Verified skill badges           │
│  ✅ Credit-based resource mgmt       ✅ Private job opportunities       │
│  ✅ Placement tracking               ✅ Mock interview practice         │
│                                                                          │
│  FACULTY                             COMPANIES                          │
│  ───────                             ─────────                          │
│  ✅ Create assignments in minutes    ✅ Access verified talent pool     │
│  ✅ Auto-graded coding tasks         ✅ University partnerships         │
│  ✅ Student progress dashboard       ✅ Campus recruitment portal       │
│  ✅ Reusable assignment library      ✅ Pre-screened candidates         │
│                                                                          │
│                    SHARED DATABASE                                       │
│                    ───────────────                                       │
│                    ✅ Unified student profiles                          │
│                    ✅ Cross-platform progress                           │
│                    ✅ Verified project portfolios                       │
│                    ✅ Interview readiness scores                        │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ PLATFORM ARCHITECTURE OVERVIEW

### Three-Platform Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CODER'Z ECOSYSTEM                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌───────────────────────┐                                             │
│   │     MAIN PLATFORM     │                                             │
│   │     (Students)        │                                             │
│   │     coderz.me         │                                             │
│   │                       │                                             │
│   │   /studio             │                                             │
│   │   /assessments        │                                             │
│   │   /mock               │                                             │
│   │   /spaces             │                                             │
│   │   /jobs               │                                             │
│   │   /uni/*  ←────────── UNIVERSITY MODULE                             │
│   └───────────┬───────────┘                                             │
│               │                                                          │
│   ┌───────────┴───────────┐         ┌───────────────────────┐           │
│   │                       │         │                       │           │
│   │   UNIVERSITY PORTAL   │◄───────►│     HIRING PORTAL     │           │
│   │   uni.coderz.me       │         │     hire.coderz.me    │           │
│   │                       │         │     (Companies)       │           │
│   │   /home               │         │                       │           │
│   │   /students           │         │   Job postings flow   │           │
│   │   /faculty            │         │   to verified students│           │
│   │   /classes            │         │                       │           │
│   │   /assignments        │         └───────────┬───────────┘           │
│   │   /analytics          │                     │                        │
│   │   /placements         │                     │                        │
│   │   /billing            │                     │                        │
│   └───────────┬───────────┘                     │                        │
│               │                                 │                        │
│               └─────────────┬───────────────────┘                        │
│                             │                                            │
│                   ┌─────────▼─────────┐                                  │
│                   │   SHARED DATABASE │                                  │
│                   │   ───────────────  │                                  │
│                   │   • Users         │                                  │
│                   │   • Universities  │                                  │
│                   │   • Departments   │                                  │
│                   │   • Classes       │                                  │
│                   │   • Assignments   │                                  │
│                   │   • Submissions   │                                  │
│                   │   • Credits       │                                  │
│                   │   • Jobs          │                                  │
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
│                    UNIVERSITY → STUDENT FLOW                             │
│                    ─────────────────────────                             │
│                                                                          │
│   Uni Portal                         Main Platform                       │
│   ──────────                         ─────────────                       │
│                                                                          │
│   [Create Assignment] ────────────► [Assignment in /uni/assignments]    │
│                                                                          │
│   [Allocate Credits] ─────────────► [Credits in student account]        │
│                                                                          │
│   [Grade Submission] ─────────────► [Grade visible to student]          │
│                                                                          │
│   [Post Private Job] ─────────────► [Job in /uni/jobs]                  │
│                                                                          │
│                                                                          │
│                    STUDENT → UNIVERSITY FLOW                             │
│                    ─────────────────────────                             │
│                                                                          │
│   Main Platform                      Uni Portal                          │
│   ─────────────                      ──────────                          │
│                                                                          │
│   [Submit Assignment] ────────────► [Submission in grading queue]       │
│                                                                          │
│   [Complete Project] ─────────────► [Portfolio visible to faculty]      │
│                                                                          │
│   [Mock Interview Score] ─────────► [Placement readiness data]          │
│                                                                          │
│   [Apply to Uni Job] ─────────────► [Application in company portal]     │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ UNIVERSITY ADMIN PORTAL

### Routes Structure

```
/                         - Landing Page
/register                 - University Registration
/signin                   - Admin Login
/verify                   - Email Verification
/onboarding               - Setup Wizard

/home                     - Admin Dashboard
/students                 - Student Management
/faculty                  - Faculty Management
/departments              - Department Management
/classes                  - Class Management
/assignments              - Assignment Hub
/analytics                - University Analytics
/placements               - Placement Cell
/team                     - Team Members (Roles)
/billing                  - Credits & Billing
/university               - University Settings
/settings                 - Account Settings
/profile                  - User Profile
/help                     - Help Center
```

### Screen Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                    UNIVERSITY ADMIN FLOW                                │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                    ┌────────────────────┐                               │
│                    │   LANDING PAGE     │                               │
│                    │   uni.coderz.me    │                               │
│                    └──────────┬─────────┘                               │
│                               │                                          │
│              ┌────────────────┼────────────────┐                        │
│              ▼                                 ▼                        │
│   ┌────────────────────┐            ┌────────────────────┐             │
│   │     REGISTER       │            │      SIGN IN       │             │
│   │  (New University)  │            │  (Existing Admin)  │             │
│   └──────────┬─────────┘            └──────────┬─────────┘             │
│              │                                 │                        │
│              ▼                                 │                        │
│   ┌────────────────────┐                      │                        │
│   │    ONBOARDING      │                      │                        │
│   │  ─────────────────  │                      │                        │
│   │  Step 1: Uni Info  │                      │                        │
│   │  Step 2: Verify    │                      │                        │
│   │  Step 3: Billing   │                      │                        │
│   │  Step 4: Team      │                      │                        │
│   └──────────┬─────────┘                      │                        │
│              │                                 │                        │
│              └─────────────┬───────────────────┘                        │
│                            ▼                                            │
│                 ┌────────────────────┐                                  │
│                 │     DASHBOARD      │                                  │
│                 │       /home        │                                  │
│                 └──────────┬─────────┘                                  │
│                            │                                            │
│    ┌───────────┬───────────┼───────────┬───────────┬───────────┐       │
│    ▼           ▼           ▼           ▼           ▼           ▼       │
│ ┌───────┐ ┌────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌────────┐  │
│ │STUDENTS│ │FACULTY │ │ CLASSES │ │ASSIGN-  │ │ANALYTICS │ │PLACE-  │  │
│ │        │ │        │ │         │ │ MENTS   │ │          │ │ MENTS  │  │
│ └───────┘ └────────┘ └─────────┘ └─────────┘ └──────────┘ └────────┘  │
│                                                                          │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 1: Admin Dashboard (`/home`)

**Purpose:** Overview of university operations

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🏛️ University Dashboard                                     [Settings]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Good morning, Dr. Sharma 👋                                            │
│  Tech University - Computer Science Department                          │
│                                                                          │
│  ━━ QUICK STATS ━━                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐            │
│  │   STUDENTS     │  │   ACTIVE       │  │   CREDITS      │            │
│  │   2,480        │  │   ASSIGNMENTS  │  │   REMAINING    │            │
│  │   ────────     │  │   24           │  │   ────────     │            │
│  │   +156 this    │  │   ────────     │  │   1.2M / 2M    │            │
│  │   semester     │  │   3 due today  │  │   60% used     │            │
│  └────────────────┘  └────────────────┘  └────────────────┘            │
│                                                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐            │
│  │   FACULTY      │  │   CLASSES      │  │   PLACEMENT    │            │
│  │   48           │  │   32           │  │   RATE         │            │
│  │   ────────     │  │   ────────     │  │   ────────     │            │
│  │   12 TAs       │  │   8 depts      │  │   85%          │            │
│  └────────────────┘  └────────────────┘  └────────────────┘            │
│                                                                          │
│  ━━ RECENT ACTIVITY ━━                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  📋 Prof. Singh created "React Components Quiz" for CS401           ││
│  │     2 hours ago                                                      ││
│  │                                                                       ││
│  │  ✅ 156 students submitted "Linked List Implementation"              ││
│  │     Yesterday                                                        ││
│  │                                                                       ││
│  │  🏢 TechCorp posted 3 new jobs for CS students                       ││
│  │     Yesterday                                                        ││
│  │                                                                       ││
│  │  📊 Weekly analytics report generated                                ││
│  │     2 days ago                                                       ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ━━ UPCOMING DEADLINES ━━                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  📅 Today                                                            ││
│  │  • CS301 - Graph Algorithms (312 students pending)                   ││
│  │  • CS302 - REST API Quiz (287 students pending)                      ││
│  │                                                                       ││
│  │  📅 This Week                                                        ││
│  │  • CS401 - React Project Submission (Feb 10)                         ││
│  │  • CS201 - Python Basics Quiz (Feb 12)                               ││
│  │  • Placement Mock Interviews - Round 1 (Feb 14)                      ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ━━ QUICK ACTIONS ━━                                                    │
│  [+ Create Assignment] [+ Add Student] [+ Invite Faculty] [📊 Reports] │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 2: Student Management (`/students`)

**Purpose:** Manage all students in the university

```
┌─────────────────────────────────────────────────────────────────────────┐
│  👥 Student Management                    [+ Add Student] [📥 Import]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ━━ FILTERS ━━                                                          │
│  🔍 Search students...                                                  │
│                                                                          │
│  Department: [All ▼] Year: [All ▼] Section: [All ▼] Status: [All ▼]    │
│                                                                          │
│  ━━ QUICK STATS ━━                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Total    │ │ Verified │ │ Active   │ │ At Risk  │ │ Placed   │      │
│  │ 2,480    │ │ 2,312    │ │ 92%      │ │ 156      │ │ 423      │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                                          │
│  ━━ STUDENT LIST ━━                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ ☐ │ Student          │ Dept │ Year │ Credits │ Progress │ Status   ││
│  ├───┼──────────────────┼──────┼──────┼─────────┼──────────┼──────────┤│
│  │ ☐ │ Rahul Kumar      │ CS   │ 3    │ 342/500 │ ████░░   │ 🟢 Active││
│  │   │ rahul@tech.edu   │      │      │         │ 68%      │          ││
│  ├───┼──────────────────┼──────┼──────┼─────────┼──────────┼──────────┤│
│  │ ☐ │ Priya Sharma     │ CS   │ 3    │ 450/500 │ █████░   │ 🟢 Active││
│  │   │ priya@tech.edu   │      │      │         │ 90%      │          ││
│  ├───┼──────────────────┼──────┼──────┼─────────┼──────────┼──────────┤│
│  │ ☐ │ Amit Patel       │ CS   │ 3    │ 156/500 │ ██░░░░   │ 🔴 AtRisk││
│  │   │ amit@tech.edu    │      │      │         │ 31%      │          ││
│  ├───┼──────────────────┼──────┼──────┼─────────┼──────────┼──────────┤│
│  │ ☐ │ Sneha Reddy      │ CS   │ 4    │ 489/500 │ █████░   │ 🟣 Placed││
│  │   │ sneha@tech.edu   │      │      │         │ 98%      │          ││
│  └───┴──────────────────┴──────┴──────┴─────────┴──────────┴──────────┘│
│                                                                          │
│  Showing 1-25 of 2,480 students                    [← Prev] [Next →]   │
│                                                                          │
│  ━━ BULK ACTIONS ━━                                                     │
│  [Select All] [Allocate Credits] [Send Notification] [Export CSV]      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 3: Faculty Management (`/faculty`)

**Purpose:** Manage all faculty members

```
┌─────────────────────────────────────────────────────────────────────────┐
│  👨‍🏫 Faculty Management                              [+ Invite Faculty]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ━━ FACULTY OVERVIEW ━━                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │  Professors  │  │  TAs         │  │  Dept Heads  │                   │
│  │     32       │  │     16       │  │      8       │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
│                                                                          │
│  ━━ BY DEPARTMENT ━━                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  COMPUTER SCIENCE                                                    ││
│  │  Head: Dr. Rajesh Sharma | 12 Faculty | 4 TAs                       ││
│  │                                                                       ││
│  │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐     ││
│  │  │ [Photo]          │ │ [Photo]          │ │ [Photo]          │     ││
│  │  │ Dr. Rajesh       │ │ Prof. Singh      │ │ Dr. Patel        │     ││
│  │  │ HOD              │ │ DSA, Algorithms  │ │ Web Dev, React   │     ││
│  │  │ 4 Classes        │ │ 3 Classes        │ │ 2 Classes        │     ││
│  │  └──────────────────┘ └──────────────────┘ └──────────────────┘     ││
│  │                                                                       ││
│  │  [View All CS Faculty →]                                             ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  ELECTRONICS                                                         ││
│  │  Head: Dr. Meera Nair | 8 Faculty | 3 TAs                           ││
│  │  [View All EE Faculty →]                                             ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ━━ PENDING INVITATIONS ━━                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  📧 deepa@tech.edu - Faculty (CS) - Sent 2 days ago    [Resend]     ││
│  │  📧 kumar@tech.edu - TA (CS) - Sent 5 days ago         [Resend]     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 4: Class Management (`/classes`)

**Purpose:** Manage all classes/courses

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📚 Class Management                                     [+ Create Class]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ━━ FILTERS ━━                                                          │
│  Semester: [Current ▼] Department: [All ▼] Faculty: [All ▼]            │
│                                                                          │
│  ━━ ACTIVE CLASSES (32) ━━                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  CS301 - Data Structures & Algorithms                               ││
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ││
│  │                                                                       ││
│  │  👨‍🏫 Faculty: Prof. Singh                                            ││
│  │  👥 Students: 312                                                     ││
│  │  📊 Avg Score: 78%                                                    ││
│  │                                                                       ││
│  │  ━━ Active Assignments ━━                                            ││
│  │  ┌────────────────────────────────────────────────────────────┐     ││
│  │  │ 💻 Graph Algorithms       │ Due: Today    │ 156/312 done  │     ││
│  │  │ 📝 Tree Traversal Quiz    │ Due: Feb 10   │ 89/312 done   │     ││
│  │  │ 🎤 Mock Interview R1      │ Due: Feb 14   │ 45/312 done   │     ││
│  │  └────────────────────────────────────────────────────────────┘     ││
│  │                                                                       ││
│  │  [View Details] [Manage Assignments] [View Analytics]                ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  CS302 - Web Development                                            ││
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ││
│  │                                                                       ││
│  │  👨‍🏫 Faculty: Dr. Patel      👥 Students: 287      📊 Avg: 82%      ││
│  │                                                                       ││
│  │  [View Details] [Manage Assignments] [View Analytics]                ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 5: Assignment Hub (`/assignments`)

**Purpose:** Create and manage all assignments - CORE FEATURE

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📋 Assignment Hub                                  [+ Create Assignment]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ━━ ASSIGNMENT TYPES ━━                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                                                       ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               ││
│  │  │  📝 QUIZ     │  │  💻 CODING   │  │  🎤 MOCK     │               ││
│  │  │              │  │              │  │  INTERVIEW   │               ││
│  │  │ MCQs, Fill   │  │ Studio-based │  │ AI-powered   │               ││
│  │  │ in blanks,   │  │ coding       │  │ interview    │               ││
│  │  │ true/false   │  │ projects     │  │ practice     │               ││
│  │  │              │  │              │  │              │               ││
│  │  │ [Create →]   │  │ [Create →]   │  │ [Create →]   │               ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘               ││
│  │                                                                       ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               ││
│  │  │  📚 SPACE    │  │  🚀 PROJECT  │  │  📄 DOCUMENT │               ││
│  │  │  MODULE      │  │              │  │  UPLOAD      │               ││
│  │  │              │  │              │  │              │               ││
│  │  │ Assign a     │  │ Custom       │  │ PDF, PPT     │               ││
│  │  │ learning     │  │ project with │  │ submissions  │               ││
│  │  │ space topic  │  │ rubric       │  │              │               ││
│  │  │              │  │              │  │              │               ││
│  │  │ [Create →]   │  │ [Create →]   │  │ [Create →]   │               ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘               ││
│  │                                                                       ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ━━ ACTIVE ASSIGNMENTS (24) ━━                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  Status: [All ▼] Class: [All ▼] Type: [All ▼]                       ││
│  │                                                                       ││
│  │  ┌──────────────────────────────────────────────────────────────┐   ││
│  │  │  💻 Graph Algorithms Implementation                          │   ││
│  │  │  Class: CS301 | Type: Coding | Credits: 30                   │   ││
│  │  │  Due: Today, 11:59 PM                                        │   ││
│  │  │  Progress: ████████░░ 156/312 (50%)                          │   ││
│  │  │  [View] [Edit] [Grade] [Extend Deadline]                     │   ││
│  │  └──────────────────────────────────────────────────────────────┘   ││
│  │                                                                       ││
│  │  ┌──────────────────────────────────────────────────────────────┐   ││
│  │  │  📝 React Components Fundamentals                            │   ││
│  │  │  Class: CS302 | Type: Quiz | Credits: 20                     │   ││
│  │  │  Due: Feb 10, 2026                                           │   ││
│  │  │  Progress: ███░░░░░░░ 89/287 (31%)                           │   ││
│  │  │  [View] [Edit] [Preview] [Export Results]                    │   ││
│  │  └──────────────────────────────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 6: Create Assignment Flow

**Purpose:** Step-by-step assignment creation

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back to Assignments                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ━━ CREATE NEW ASSIGNMENT ━━                                            │
│  Progress: ━━━━━━━━━━━━━━━━░░░░░░░░░░ Step 2 of 4                       │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                                                       ││
│  │  ━━ STEP 2: SELECT CONTENT ━━                                        ││
│  │                                                                       ││
│  │  Assignment Type: 💻 Coding Project                                  ││
│  │                                                                       ││
│  │  Choose how to create content:                                       ││
│  │                                                                       ││
│  │  ┌──────────────────────────────────────────────────────────────┐   ││
│  │  │  🔍 SEARCH EXISTING                                          │   ││
│  │  │                                                              │   ││
│  │  │  Find from our library of 500+ coding projects               │   ││
│  │  │                                                              │   ││
│  │  │  🔍 Search projects...                                       │   ││
│  │  │                                                              │   ││
│  │  │  Tags: [React] [Node.js] [Python] [Algorithms] [+More]       │   ││
│  │  │                                                              │   ││
│  │  │  Popular:                                                    │   ││
│  │  │  • E-Commerce Platform (React + Node)                        │   ││
│  │  │  • Chat Application (WebSockets)                             │   ││
│  │  │  • REST API with Authentication                              │   ││
│  │  │  • Linked List Implementation                                │   ││
│  │  │                                                              │   ││
│  │  └──────────────────────────────────────────────────────────────┘   ││
│  │                                                                       ││
│  │  ━━ OR ━━                                                            ││
│  │                                                                       ││
│  │  ┌──────────────────────────────────────────────────────────────┐   ││
│  │  │  ✏️ CREATE CUSTOM                                            │   ││
│  │  │                                                              │   ││
│  │  │  Build a new project from scratch with your own              │   ││
│  │  │  requirements, test cases, and grading rubric                │   ││
│  │  │                                                              │   ││
│  │  │  [Create Custom Project →]                                   │   ││
│  │  └──────────────────────────────────────────────────────────────┘   ││
│  │                                                                       ││
│  │  Selected: Linked List Implementation                                ││
│  │  Estimated Completion: 2-3 hours                                     ││
│  │  Difficulty: Medium                                                  ││
│  │                                                                       ││
│  │  [← Back] [Continue →]                                               ││
│  │                                                                       ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ━━ Steps ━━                                                            │
│  ✅ Basic Info (Class, Title)                                           │
│  🔵 Content Selection (Current)                                         │
│  ○ Parameters (Deadline, Credits, Attempts)                             │
│  ○ Review & Publish                                                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 7: Grading Dashboard

**Purpose:** Grade student submissions

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📊 Grading: Graph Algorithms Implementation                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ━━ SUBMISSION OVERVIEW ━━                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │ Submitted    │  │ Auto-Graded  │  │ Needs Review │  │ Not Started  │ │
│  │    156       │  │    142       │  │     14       │  │    156       │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
│                                                                          │
│  ━━ SUBMISSIONS ━━                                                      │
│  Filter: [All ▼] Sort: [Score ▼]                                        │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  🟢 AUTO-GRADED                                                      ││
│  │                                                                       ││
│  │  ┌──────────────────────────────────────────────────────────────┐   ││
│  │  │ Priya Sharma          │ Score: 95/100 │ Tests: 19/20 Passed  │   ││
│  │  │ Submitted: 2 hrs ago  │ Time: 1.5 hrs │ [View Code] [Adjust] │   ││
│  │  └──────────────────────────────────────────────────────────────┘   ││
│  │                                                                       ││
│  │  ┌──────────────────────────────────────────────────────────────┐   ││
│  │  │ Rahul Kumar           │ Score: 82/100 │ Tests: 16/20 Passed  │   ││
│  │  │ Submitted: 5 hrs ago  │ Time: 2.1 hrs │ [View Code] [Adjust] │   ││
│  │  └──────────────────────────────────────────────────────────────┘   ││
│  │                                                                       ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  🟡 NEEDS REVIEW                                                     ││
│  │                                                                       ││
│  │  ┌──────────────────────────────────────────────────────────────┐   ││
│  │  │ Amit Patel            │ Tests: 8/20   │ ⚠️ Low score         │   ││
│  │  │ Submitted: 1 day ago  │ AI Flag: Possible plagiarism         │   ││
│  │  │                       │ [Review Code] [Compare] [Contact]    │   ││
│  │  └──────────────────────────────────────────────────────────────┘   ││
│  │                                                                       ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  [Export Grades] [Send Feedback to All] [Close Assignment]              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 8: Placement Cell (`/placements`)

**Purpose:** Manage company partnerships and track placements

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🏢 Placement Cell                                  [+ Refer Company]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ━━ PLACEMENT METRICS ━━                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │ Companies    │  │ Active Jobs  │  │ Applications │  │ Placed       ││
│  │ Partnered    │  │              │  │ This Month   │  │ This Year    ││
│  │    24        │  │     67       │  │    1,234     │  │     423      ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
│                                                                          │
│  ━━ PARTNER COMPANIES ━━                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                                                       ││
│  │  ┌──────────────────────────────────────────────────────────────┐   ││
│  │  │ [Logo] TechCorp                                              │   ││
│  │  │ Industry: Technology | Partner since: 2024                   │   ││
│  │  │                                                              │   ││
│  │  │ 📋 Active Jobs: 5  |  👥 Students Hired: 34                  │   ││
│  │  │ 💰 Avg Package: ₹12 LPA                                      │   ││
│  │  │                                                              │   ││
│  │  │ [View Jobs] [Analytics] [Contact]                            │   ││
│  │  └──────────────────────────────────────────────────────────────┘   ││
│  │                                                                       ││
│  │  ┌──────────────────────────────────────────────────────────────┐   ││
│  │  │ [Logo] StartupXYZ                                            │   ││
│  │  │ Industry: Fintech | Partner since: 2025                      │   ││
│  │  │                                                              │   ││
│  │  │ 📋 Active Jobs: 3  |  👥 Students Hired: 12                  │   ││
│  │  │ 💰 Avg Package: ₹8 LPA                                       │   ││
│  │  │                                                              │   ││
│  │  │ [View Jobs] [Analytics] [Contact]                            │   ││
│  │  └──────────────────────────────────────────────────────────────┘   ││
│  │                                                                       ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ━━ RECENT PLACEMENTS ━━                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  Priya Sharma → TechCorp (SDE-1) | ₹14 LPA | Joined Feb 2026       ││
│  │  Rahul Kumar → StartupXYZ (Frontend) | ₹10 LPA | Joining Mar 2026  ││
│  │  Sneha Reddy → MegaCorp (Data Analyst) | ₹12 LPA | Joining Apr     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 9: University Analytics (`/analytics`)

**Purpose:** Comprehensive analytics dashboard

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📊 University Analytics                              [Export Report]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ━━ TIME RANGE ━━                                                       │
│  [This Week] [This Month] [This Semester] [Custom Range]                │
│                                                                          │
│  ━━ OVERVIEW ━━                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                                                       ││
│  │  📈 STUDENT ENGAGEMENT                                               ││
│  │  ┌───────────────────────────────────────────────────────────────┐  ││
│  │  │     100%                                                      │  ││
│  │  │     80%  ▂▂▂▃▃▃▄▄▅▅▆▆▇▇████████████████                      │  ││
│  │  │     60%                                                      │  ││
│  │  │     40%                                                      │  ││
│  │  │     20%                                                      │  ││
│  │  │      0%                                                      │  ││
│  │  │          Mon Tue Wed Thu Fri Sat Sun                         │  ││
│  │  │                                                              │  ││
│  │  │  Daily Active: 1,845 (74%)  |  Assignments Completed: 2,456  │  ││
│  │  └───────────────────────────────────────────────────────────────┘  ││
│  │                                                                       ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ━━ DEPARTMENT COMPARISON ━━                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  Department        │ Students │ Avg Score │ Completion │ At Risk    ││
│  │  ─────────────────────────────────────────────────────────────────  ││
│  │  Computer Science  │   856    │   78%     │    85%     │    42      ││
│  │  Electronics       │   624    │   72%     │    79%     │    56      ││
│  │  Mechanical        │   512    │   68%     │    74%     │    64      ││
│  │  Civil             │   488    │   71%     │    77%     │    48      ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ━━ CREDIT UTILIZATION ━━                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  Total Allocated: 2,000,000 credits                                 ││
│  │  Used: 1,240,000 (62%)                                              ││
│  │  Remaining: 760,000 (38%)                                           ││
│  │                                                                       ││
│  │  ████████████████████████████████░░░░░░░░░░░░░░░░░░░░               ││
│  │  Quizzes: 320K | Coding: 580K | Mocks: 240K | Other: 100K          ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 STUDENT UNIVERSITY MODULE

### Routes Structure (Main Platform /uni/*)

```
/uni                      - University Dashboard
/uni/assignments          - My Assignments
/uni/assignments/[id]     - Assignment Detail
/uni/classes              - My Classes
/uni/grades               - Grades & Feedback
/uni/jobs                 - University Jobs
/uni/placements           - Placement Status
```

### Screen 1: Student University Dashboard (`/uni`)

**Purpose:** Student's view of university activities

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🎓 University Dashboard                                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Welcome back, Rahul! 👋                                                │
│  Tech University - Computer Science (Year 3)                            │
│                                                                          │
│  ━━ QUICK STATS ━━                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐            │
│  │   CREDITS      │  │   ASSIGNMENTS  │  │   AVG SCORE    │            │
│  │   342/500      │  │   PENDING      │  │                │            │
│  │   ────────     │  │   4            │  │   78%          │            │
│  │   68% used     │  │   2 due soon!  │  │   Good!        │            │
│  └────────────────┘  └────────────────┘  └────────────────┘            │
│                                                                          │
│  ━━ DUE SOON 🔥 ━━                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                                                       ││
│  │  💻 Graph Algorithms Implementation                                  ││
│  │  CS301 - Data Structures | Prof. Singh                               ││
│  │  Due: TODAY, 11:59 PM ⚠️                                             ││
│  │  Credits: 30 | Status: Not Started                                   ││
│  │  [Start Assignment →]                                                ││
│  │                                                                       ││
│  │  ─────────────────────────────────────────────────────────────────  ││
│  │                                                                       ││
│  │  📝 React Components Quiz                                            ││
│  │  CS302 - Web Development | Dr. Patel                                 ││
│  │  Due: Feb 10, 2026 (3 days)                                          ││
│  │  Credits: 20 | Status: Not Started                                   ││
│  │  [Start Quiz →]                                                      ││
│  │                                                                       ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ━━ RECENT GRADES ━━                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  ✅ Linked List Implementation    │ 85/100 │ Graded 2 days ago      ││
│  │  ✅ Binary Search Tree Quiz       │ 92/100 │ Graded 5 days ago      ││
│  │  [View All Grades →]                                                 ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ━━ EXCLUSIVE JOB OPPORTUNITIES ━━                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  🏢 TechCorp - SDE Intern (Year 3 Students)       [Apply →]         ││
│  │  🏢 StartupXYZ - Frontend Developer               [Apply →]         ││
│  │  📣 2 new jobs posted this week!                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 2: My Assignments (`/uni/assignments`)

**Purpose:** All university-assigned work

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📋 My Assignments                                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ━━ TABS ━━                                                             │
│  [Pending (4)] [Completed (12)] [All (16)]                              │
│                                                                          │
│  ━━ FILTER ━━                                                           │
│  Class: [All ▼] Type: [All ▼] Due: [Any ▼]                              │
│                                                                          │
│  ━━ PENDING ASSIGNMENTS ━━                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                                                       ││
│  │  ┌──────────────────────────────────────────────────────────────┐   ││
│  │  │  💻 CODING                                      Due: TODAY   │   ││
│  │  │                                                              │   ││
│  │  │  Graph Algorithms Implementation                             │   ││
│  │  │  CS301 - Data Structures | Prof. Singh                       │   ││
│  │  │                                                              │   ││
│  │  │  Implement BFS and DFS traversal algorithms for graphs       │   ││
│  │  │                                                              │   ││
│  │  │  Credits: 30 | Est. Time: 2-3 hours | Attempts: 0/3          │   ││
│  │  │                                                              │   ││
│  │  │  [Start Assignment]                                          │   ││
│  │  └──────────────────────────────────────────────────────────────┘   ││
│  │                                                                       ││
│  │  ┌──────────────────────────────────────────────────────────────┐   ││
│  │  │  📝 QUIZ                                       Due: Feb 10   │   ││
│  │  │                                                              │   ││
│  │  │  React Components Fundamentals                               │   ││
│  │  │  CS302 - Web Development | Dr. Patel                         │   ││
│  │  │                                                              │   ││
│  │  │  20 questions on React components, props, and state          │   ││
│  │  │                                                              │   ││
│  │  │  Credits: 20 | Est. Time: 30 mins | Attempts: 0/2            │   ││
│  │  │                                                              │   ││
│  │  │  [Start Quiz]                                                │   ││
│  │  └──────────────────────────────────────────────────────────────┘   ││
│  │                                                                       ││
│  │  ┌──────────────────────────────────────────────────────────────┐   ││
│  │  │  🎤 MOCK INTERVIEW                             Due: Feb 14   │   ││
│  │  │                                                              │   ││
│  │  │  Placement Readiness - Technical Round 1                     │   ││
│  │  │  Placement Cell | Mandatory for Year 3+                      │   ││
│  │  │                                                              │   ││
│  │  │  AI-powered mock interview covering DSA basics               │   ││
│  │  │                                                              │   ││
│  │  │  Credits: 50 | Est. Time: 45 mins | Attempts: 0/1            │   ││
│  │  │                                                              │   ││
│  │  │  [Start Mock Interview]                                      │   ││
│  │  └──────────────────────────────────────────────────────────────┘   ││
│  │                                                                       ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 3: University Jobs (`/uni/jobs`)

**Purpose:** Exclusive job opportunities for university students

```
┌─────────────────────────────────────────────────────────────────────────┐
│  💼 University Job Board                                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  🔒 These jobs are exclusively for Tech University students             │
│                                                                          │
│  ━━ YOUR ELIGIBILITY ━━                                                 │
│  Year: 3 | Department: CS | CGPA: 8.2 | Skills Verified: React, Node   │
│                                                                          │
│  ━━ MATCHING JOBS (12) ━━                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                                                       ││
│  │  ┌──────────────────────────────────────────────────────────────┐   ││
│  │  │  [Logo] TechCorp                            ⭐ TOP MATCH      │   ││
│  │  │                                                              │   ││
│  │  │  Software Development Engineer - Intern                      │   ││
│  │  │  📍 Bangalore (Hybrid) | 💰 ₹50K/month stipend               │   ││
│  │  │                                                              │   ││
│  │  │  Requirements: Year 3/4, CS/IT, 7.0+ CGPA                    │   ││
│  │  │  Skills: React, Node.js, Python                              │   ││
│  │  │  ✅ You match all criteria!                                  │   ││
│  │  │                                                              │   ││
│  │  │  Interview Process: 3 rounds (Visible)                       │   ││
│  │  │  Round 1: Online Assessment                                  │   ││
│  │  │  Round 2: Technical Interview                                │   ││
│  │  │  Round 3: HR Discussion                                      │   ││
│  │  │                                                              │   ││
│  │  │  [View Details] [🎯 Apply] [🎭 Practice Mock]                │   ││
│  │  │                                                              │   ││
│  │  │  📊 From our campus: 45 applied | 12 shortlisted             │   ││
│  │  └──────────────────────────────────────────────────────────────┘   ││
│  │                                                                       ││
│  │  ┌──────────────────────────────────────────────────────────────┐   ││
│  │  │  [Logo] StartupXYZ                                           │   ││
│  │  │                                                              │   ││
│  │  │  Frontend Developer                                          │   ││
│  │  │  📍 Remote | 💰 ₹8-10 LPA                                    │   ││
│  │  │                                                              │   ││
│  │  │  Requirements: Year 4, Any branch, 6.5+ CGPA                 │   ││
│  │  │  ⚠️ You're in Year 3 - Eligible next year                   │   ││
│  │  │                                                              │   ││
│  │  │  [View Details] [🔔 Notify When Eligible]                    │   ││
│  │  └──────────────────────────────────────────────────────────────┘   ││
│  │                                                                       ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 ROLE-BASED ACCESS SYSTEM

### Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    UNIVERSITY ROLE HIERARCHY                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                          ┌─────────────────┐                            │
│                          │      HEAD       │                            │
│                          │  (Registrar)    │                            │
│                          │  Full Access    │                            │
│                          └────────┬────────┘                            │
│                                   │                                      │
│       ┌───────────────────────────┼───────────────────────────┐         │
│       ▼                           ▼                           ▼         │
│ ┌─────────────┐          ┌─────────────┐          ┌─────────────┐      │
│ │  PLACEMENT  │          │ DEPARTMENT  │          │   FINANCE   │      │
│ │  OFFICER    │          │    HEAD     │          │   OFFICER   │      │
│ │             │          │             │          │             │      │
│ │ • Companies │          │ • Faculty   │          │ • Credits   │      │
│ │ • Jobs      │          │ • Classes   │          │ • Billing   │      │
│ │ • Analytics │          │ • Students  │          │ • Reports   │      │
│ └─────────────┘          └──────┬──────┘          └─────────────┘      │
│                                 │                                       │
│                    ┌────────────┴────────────┐                         │
│                    ▼                         ▼                         │
│            ┌─────────────┐           ┌─────────────┐                   │
│            │   FACULTY   │           │   FACULTY   │                   │
│            │  (Teacher)  │           │  (Teacher)  │                   │
│            │             │           │             │                   │
│            │ • Classes   │           │ • Classes   │                   │
│            │ • Assign.   │           │ • Assign.   │                   │
│            │ • Grading   │           │ • Grading   │                   │
│            └──────┬──────┘           └──────┬──────┘                   │
│                   │                         │                          │
│                   └────────────┬────────────┘                          │
│                                ▼                                       │
│                        ┌─────────────┐                                 │
│                        │  TEACHING   │                                 │
│                        │  ASSISTANT  │                                 │
│                        │             │                                 │
│                        │ • Limited   │                                 │
│                        │   grading   │                                 │
│                        │ • Queries   │                                 │
│                        └─────────────┘                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Permission Matrix

| Feature | HEAD | DEPT_HEAD | PLACEMENT | FINANCE | FACULTY | TA |
|---------|------|-----------|-----------|---------|---------|-----|
| University Settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Billing & Credits | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Invite Any Role | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Invite Faculty/TA | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Departments | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View All Students | ✅ | ✅ (dept) | ✅ | ❌ | ✅ (class) | ✅ (class) |
| Create Classes | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create Assignments | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Grade Submissions | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ (limited) |
| Company Partnerships | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| View Analytics | ✅ | ✅ (dept) | ✅ (placements) | ✅ (billing) | ✅ (class) | ❌ |

---

## 📝 ASSIGNMENT & EVALUATION ENGINE

### Assignment Types & Sources

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ASSIGNMENT TYPE MAPPING                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ASSIGNMENT TYPE          MAIN PLATFORM ENGINE        AUTO-GRADING      │
│  ───────────────          ─────────────────────       ───────────────   │
│                                                                          │
│  📝 Quiz                  /assessments                ✅ Full auto      │
│     • MCQs                                                              │
│     • Fill in blanks                                                    │
│     • True/False                                                        │
│     • Coding MCQs                                                       │
│                                                                          │
│  💻 Coding Project        /studio                     ✅ Test cases     │
│     • Algorithm tasks                                 + Code quality    │
│     • Full projects                                                     │
│     • Bug fixes                                                         │
│                                                                          │
│  🎤 Mock Interview        /mock                       ✅ AI scoring     │
│     • Voice interviews                                                  │
│     • Coding interviews                                                 │
│     • Behavioral rounds                                                 │
│                                                                          │
│  📚 Learning Space        /spaces                     ✅ Completion     │
│     • Topic modules                                   tracking          │
│     • Interactive content                                               │
│                                                                          │
│  🚀 Custom Project        Custom rubric               ⚡ Partial auto   │
│     • Open-ended tasks                                + Manual review   │
│     • Research assignments                                              │
│                                                                          │
│  📄 Document Upload       File upload                 ❌ Manual only    │
│     • Reports, PPTs                                                     │
│     • Handwritten work                                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Grading Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    AUTOMATED GRADING FLOW                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────┐                                                 │
│  │ Student Submits    │                                                 │
│  │ Assignment         │                                                 │
│  └─────────┬──────────┘                                                 │
│            ▼                                                            │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                    GRADING ENGINE                               │    │
│  │                                                                  │    │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │    │
│  │   │ Test Cases   │  │ Code Quality │  │  Plagiarism  │         │    │
│  │   │ Execution    │  │  Analysis    │  │   Check      │         │    │
│  │   │              │  │              │  │              │         │    │
│  │   │ 18/20 pass   │  │ Score: 85    │  │ Original ✓   │         │    │
│  │   └──────────────┘  └──────────────┘  └──────────────┘         │    │
│  │                                                                  │    │
│  └───────────────────────────┬────────────────────────────────────┘    │
│                              ▼                                          │
│            ┌─────────────────┴─────────────────┐                        │
│            ▼                                   ▼                        │
│   ┌────────────────────┐            ┌────────────────────┐             │
│   │ CONFIDENCE HIGH    │            │ CONFIDENCE LOW     │             │
│   │ (85%+ test pass)   │            │ (Flags detected)   │             │
│   └─────────┬──────────┘            └─────────┬──────────┘             │
│             ▼                                 ▼                         │
│   ┌────────────────────┐            ┌────────────────────┐             │
│   │ AUTO-GRADE &       │            │ QUEUE FOR MANUAL   │             │
│   │ RELEASE            │            │ REVIEW             │             │
│   └─────────┬──────────┘            └─────────┬──────────┘             │
│             ▼                                 ▼                         │
│   ┌────────────────────┐            ┌────────────────────┐             │
│   │ Student gets       │            │ Faculty reviews    │             │
│   │ instant feedback   │            │ and grades         │             │
│   └────────────────────┘            └────────────────────┘             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 💰 CREDITS DISTRIBUTION SYSTEM

### Credit Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CREDIT DISTRIBUTION SYSTEM                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                    ┌─────────────────────┐                              │
│                    │   CODER'Z PLATFORM  │                              │
│                    │   Credit Store      │                              │
│                    └──────────┬──────────┘                              │
│                               │                                          │
│                               ▼ University Purchase                      │
│                    ┌─────────────────────┐                              │
│                    │   UNIVERSITY        │                              │
│                    │   Credit Pool       │                              │
│                    │   ────────────────  │                              │
│                    │   Total: 2,000,000  │                              │
│                    └──────────┬──────────┘                              │
│                               │                                          │
│           ┌───────────────────┼───────────────────┐                     │
│           ▼                   ▼                   ▼                     │
│   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐            │
│   │  DEPARTMENT   │   │  DEPARTMENT   │   │  DEPARTMENT   │            │
│   │  CS Pool      │   │  EE Pool      │   │  ME Pool      │            │
│   │  ──────────   │   │  ──────────   │   │  ──────────   │            │
│   │  600,000 cr   │   │  400,000 cr   │   │  350,000 cr   │            │
│   └───────┬───────┘   └───────────────┘   └───────────────┘            │
│           │                                                             │
│           ▼ Auto-allocate to students                                   │
│   ┌───────────────────────────────────────────────────────────────┐    │
│   │                    STUDENT ACCOUNTS                            │    │
│   │                                                                │    │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │    │
│   │  │ Rahul       │  │ Priya       │  │ Amit        │            │    │
│   │  │ 500 credits │  │ 500 credits │  │ 500 credits │            │    │
│   │  │             │  │             │  │             │            │    │
│   │  │ Mandatory:  │  │ Mandatory:  │  │ Mandatory:  │            │    │
│   │  │ 300 cr      │  │ 300 cr      │  │ 300 cr      │            │    │
│   │  │             │  │             │  │             │            │    │
│   │  │ Personal:   │  │ Personal:   │  │ Personal:   │            │    │
│   │  │ 200 cr      │  │ 200 cr      │  │ 200 cr      │            │    │
│   │  └─────────────┘  └─────────────┘  └─────────────┘            │    │
│   │                                                                │    │
│   └───────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  CREDIT USAGE:                                                          │
│  • University Assignment = Deducted from MANDATORY pool                 │
│  • Personal Practice = Deducted from PERSONAL pool                      │
│  • If MANDATORY depleted = Assignment fails submission                  │
│  • If PERSONAL depleted = Can buy more or wait for rollover            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Credit Costs per Activity

| Activity | Credit Cost | Notes |
|----------|-------------|-------|
| Quiz (20 questions) | 20 credits | Per attempt |
| Coding Project | 30-50 credits | Based on complexity |
| Mock Interview | 50 credits | AI-graded voice interview |
| Space Topic | 10-20 credits | Based on content length |
| Custom Project | Variable | Set by faculty |
| Personal Studio | 20 credits | Per project run |

---

## 💾 DATABASE SCHEMA

### New Tables Required

```prisma
// University Onboarding
model University {
  id                String   @id @default(cuid())
  name              String
  slug              String   @unique
  emailDomain       String   @unique  // @techuniversity.edu
  logoUrl           String?
  website           String?
  description       String?  @db.Text
  
  // Location
  city              String?
  state             String?
  country           String?
  
  // Status
  status            UniversityStatus @default(PENDING)
  verifiedAt        DateTime?
  verifiedBy        String?
  
  // Credits
  totalCredits      Int      @default(0)
  usedCredits       Int      @default(0)
  
  // Relations
  createdByUserId   String
  createdBy         User     @relation("UniversityCreator", fields: [createdByUserId], references: [id])
  
  members           UniversityMember[]
  departments       Department[]
  classes           UniversityClass[]
  studentLinks      StudentUniversityLink[]
  companyLinks      CompanyUniversityLink[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([slug])
  @@index([emailDomain])
}

enum UniversityStatus {
  PENDING
  VERIFIED
  ACTIVE
  SUSPENDED
}

// University Roles
model UniversityMember {
  id                String   @id @default(cuid())
  userId            String
  universityId      String
  
  role              UniversityRole
  departmentId      String?
  
  permissions       Json?    // Granular permissions
  
  invitedBy         String?
  inviteStatus      InviteStatus @default(PENDING)
  acceptedAt        DateTime?
  
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  university        University @relation(fields: [universityId], references: [id], onDelete: Cascade)
  department        Department? @relation(fields: [departmentId], references: [id])
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([userId, universityId])
  @@index([universityId])
}

enum UniversityRole {
  HEAD
  DEPARTMENT_HEAD
  PLACEMENT_OFFICER
  FINANCE_OFFICER
  FACULTY
  TEACHING_ASSISTANT
}

enum InviteStatus {
  PENDING
  ACCEPTED
  REJECTED
  EXPIRED
}

// Department Structure
model Department {
  id                String   @id @default(cuid())
  universityId      String
  name              String
  code              String   // CS, EE, ME, etc.
  
  headUserId        String?
  
  creditAllocation  Int      @default(0)
  creditUsed        Int      @default(0)
  
  university        University @relation(fields: [universityId], references: [id], onDelete: Cascade)
  members           UniversityMember[]
  classes           UniversityClass[]
  studentLinks      StudentUniversityLink[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([universityId, code])
}

// Class/Course
model UniversityClass {
  id                String   @id @default(cuid())
  universityId      String
  departmentId      String
  
  code              String   // CS301
  name              String   // Data Structures & Algorithms
  semester          Int
  year              Int
  section           String?  // A, B, C
  
  facultyId         String
  
  studentCount      Int      @default(0)
  
  university        University @relation(fields: [universityId], references: [id], onDelete: Cascade)
  department        Department @relation(fields: [departmentId], references: [id])
  faculty           User     @relation("ClassFaculty", fields: [facultyId], references: [id])
  
  assignments       UniversityAssignment[]
  enrollments       ClassEnrollment[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([universityId, semester, year])
}

// Student University Link
model StudentUniversityLink {
  id                String   @id @default(cuid())
  userId            String
  universityId      String
  departmentId      String?
  
  universityEmail   String
  rollNumber        String?
  
  semester          Int
  year              Int
  
  verified          VerificationStatus @default(PENDING)
  verifiedAt        DateTime?
  
  // Credits
  creditsAllocated  Int      @default(0)
  creditsUsed       Int      @default(0)
  mandatoryCredits  Int      @default(0)
  personalCredits   Int      @default(0)
  
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  university        University @relation(fields: [universityId], references: [id], onDelete: Cascade)
  department        Department? @relation(fields: [departmentId], references: [id])
  
  enrollments       ClassEnrollment[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([userId, universityId])
  @@unique([universityEmail])
  @@index([universityId])
}

enum VerificationStatus {
  PENDING
  VERIFIED
  REJECTED
}

// Class Enrollment
model ClassEnrollment {
  id                String   @id @default(cuid())
  classId           String
  studentLinkId     String
  
  status            EnrollmentStatus @default(ACTIVE)
  
  class             UniversityClass @relation(fields: [classId], references: [id], onDelete: Cascade)
  studentLink       StudentUniversityLink @relation(fields: [studentLinkId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime @default(now())
  
  @@unique([classId, studentLinkId])
}

enum EnrollmentStatus {
  ACTIVE
  COMPLETED
  DROPPED
}

// University Assignments
model UniversityAssignment {
  id                String   @id @default(cuid())
  classId           String
  facultyId         String
  
  title             String
  description       String?  @db.Text
  instructions      String?  @db.Text
  
  type              AssignmentType
  
  // Reference to main platform content
  referenceType     ReferenceType?
  referenceId       String?  // ID from respective module
  
  deadline          DateTime
  creditsRequired   Int      @default(0)
  maxAttempts       Int      @default(1)
  
  status            AssignmentStatus @default(DRAFT)
  publishedAt       DateTime?
  
  // Grading
  totalMarks        Int      @default(100)
  passingMarks      Int      @default(40)
  gradingCriteria   Json?
  
  class             UniversityClass @relation(fields: [classId], references: [id], onDelete: Cascade)
  faculty           User     @relation("AssignmentCreator", fields: [facultyId], references: [id])
  
  submissions       UniversitySubmission[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([classId, status])
  @@index([deadline])
}

enum AssignmentType {
  QUIZ
  CODING
  MOCK_INTERVIEW
  SPACE_MODULE
  PROJECT
  DOCUMENT
}

enum ReferenceType {
  ASSESSMENT
  PROJECT
  MOCK_SESSION
  SPACE
  CUSTOM
}

enum AssignmentStatus {
  DRAFT
  PUBLISHED
  CLOSED
  ARCHIVED
}

// Student Submissions
model UniversitySubmission {
  id                String   @id @default(cuid())
  assignmentId      String
  studentId         String
  
  attemptNumber     Int      @default(1)
  
  submissionData    Json?
  referenceSubmissionId String?  // ID from respective module submission
  
  // Auto-grading results
  autoGrade         Float?
  testsPassed       Int?
  testsTotal        Int?
  codeQualityScore  Float?
  
  // Manual grading
  manualGrade       Float?
  feedback          String?  @db.Text
  
  finalGrade        Float?
  creditUsed        Int      @default(0)
  
  status            SubmissionStatus @default(PENDING)
  
  submittedAt       DateTime @default(now())
  gradedAt          DateTime?
  gradedBy          String?
  
  assignment        UniversityAssignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  student           User     @relation("StudentSubmissions", fields: [studentId], references: [id])
  grader            User?    @relation("GradedSubmissions", fields: [gradedBy], references: [id])
  
  @@index([assignmentId, studentId])
  @@index([status])
}

enum SubmissionStatus {
  PENDING
  SUBMITTED
  AUTO_GRADED
  REVIEW_NEEDED
  GRADED
  LATE
}

// Company University Link
model CompanyUniversityLink {
  id                String   @id @default(cuid())
  companyId         String
  universityId      String
  
  referredBy        String?  // Placement officer ID
  
  status            PartnershipStatus @default(PENDING)
  
  company           Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  university        University @relation(fields: [universityId], references: [id], onDelete: Cascade)
  referrer          User?    @relation("CompanyReferrals", fields: [referredBy], references: [id])
  
  jobs              UniversityJob[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([companyId, universityId])
}

enum PartnershipStatus {
  PENDING
  ACTIVE
  INACTIVE
}

// University Jobs
model UniversityJob {
  id                String   @id @default(cuid())
  jobId             String
  companyLinkId     String
  
  visibility        JobVisibility
  filters           Json?    // {year: [3,4], department: ['CS']}
  
  job               Job      @relation(fields: [jobId], references: [id], onDelete: Cascade)
  companyLink       CompanyUniversityLink @relation(fields: [companyLinkId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime @default(now())
  
  @@unique([jobId, companyLinkId])
}

enum JobVisibility {
  UNIVERSITY_ONLY
  YEAR_FILTER
  DEPARTMENT_FILTER
  CUSTOM_FILTER
}
```

---

## 🛠️ TECHNICAL IMPLEMENTATION

### API Endpoints

#### University Management
```
POST   /api/university/register          - Register new university
GET    /api/university/[id]              - Get university details
PUT    /api/university/[id]              - Update university
POST   /api/university/[id]/verify       - Verify university (admin)
```

#### Team Management
```
GET    /api/university/[id]/members      - List all members
POST   /api/university/[id]/invite       - Invite team member
PUT    /api/university/[id]/members/[id] - Update member role
DELETE /api/university/[id]/members/[id] - Remove member
```

#### Department & Class Management
```
POST   /api/university/[id]/departments  - Create department
GET    /api/university/[id]/classes      - List classes
POST   /api/university/[id]/classes      - Create class
PUT    /api/university/[id]/classes/[id] - Update class
```

#### Assignment Management
```
GET    /api/assignments                  - List assignments
POST   /api/assignments                  - Create assignment
GET    /api/assignments/[id]             - Get assignment
PUT    /api/assignments/[id]             - Update assignment
POST   /api/assignments/[id]/publish     - Publish assignment
```

#### Submission & Grading
```
GET    /api/assignments/[id]/submissions - List submissions
POST   /api/assignments/[id]/submit      - Submit assignment
PUT    /api/submissions/[id]/grade       - Grade submission
POST   /api/submissions/[id]/auto-grade  - Trigger auto-grading
```

#### Student Verification
```
POST   /api/university/verify-student    - Verify student email
POST   /api/university/resend-otp        - Resend OTP
GET    /api/university/student/status    - Check verification status
```

---

## 📅 PHASE 1 FEATURE SCOPE

### Phase 1A: Foundation (Weeks 1-4)

```
✅ MUST HAVE
├── University registration & onboarding
├── Email verification flow
├── HEAD role with full access
├── Basic admin dashboard
├── University settings page
├── Student verification (email-based)
├── Basic /uni dashboard for students
└── Credit purchase & allocation

⏳ LATER
├── Department management
├── Advanced analytics
└── Company partnerships
```

### Phase 1B: Academic Core (Weeks 5-8)

```
✅ MUST HAVE
├── Faculty & TA roles
├── Class management
├── Quiz assignment creation (using /assessments)
├── Coding assignment creation (using /studio)
├── Student assignment view in /uni
├── Auto-grading for quizzes
├── Basic grading dashboard
└── Student grades view

⏳ LATER
├── Mock interview assignments
├── Space module assignments
├── Custom project assignments
└── Plagiarism detection
```

### Phase 1C: Enhancements (Weeks 9-12)

```
✅ MUST HAVE
├── Department HEAD role
├── Placement officer role
├── Company referral system
├── University-tagged job listings
├── /uni/jobs module
├── Basic analytics dashboard
├── Credit usage reports
└── Notification system

⏳ LATER
├── Finance officer role
├── Advanced analytics
├── Bulk import/export
└── Mobile app support
```

---

## 🎯 SUCCESS METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| University Activation | >70% | Universities going live after signup |
| Student Verification | >80% | Students verifying within 7 days |
| Assignment Completion | >85% | Students completing mandatory work |
| Credit Utilization | >75% | Credits used vs allocated |
| Faculty Adoption | >90% | Faculty creating assignments |
| Grading Turnaround | <48h | Time to grade submissions |
| Student Satisfaction | >4.2/5 | NPS surveys |
| Job Application Rate | >50% | Students applying to uni jobs |

---

**Next Document:** University Platform Phase 2 Blueprint (Advanced Features)

---

*Document Created: February 7, 2026*
*Version: 1.0*