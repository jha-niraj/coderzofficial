# University Platform Blueprint 🎓
## Coder'z Ecosystem - Complete Platform Architecture

---

## 1. Platform Ecosystem Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CODER'Z ECOSYSTEM                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│   │   MAIN APP   │◄──►│   HIRING     │◄──►│  UNIVERSITY  │                  │
│   │  (Students)  │    │  (Companies) │    │   (Colleges) │                  │
│   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                  │
│          │                   │                   │                          │
│          └───────────────────┴───────────────────┘                          │
│                              │                                               │
│                    ┌─────────▼─────────┐                                    │
│                    │  SHARED DATABASE  │                                    │
│                    │     (Prisma)      │                                    │
│                    └───────────────────┘                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. User Personas

### 2.1 Student Personas

#### Type A: Independent Student (No University)
- **Who**: Self-learners, bootcamp students, career switchers
- **Journey**: Sign up → Purchase credits → Use all features freely
- **Access**: `/studio`, `/assessments`, `/mock`, `/spaces`, `/concepts`, `/jobs`

#### Type B: University-Linked Student
- **Who**: College students whose university is onboarded
- **Journey**: Sign up → Verify university email → Receive credits → Access `/uni` + personal features
- **Access**: Everything in Type A + `/uni/*` module

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    STUDENT JOURNEY COMPARISON                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  INDEPENDENT STUDENT                 UNIVERSITY STUDENT                  │
│  ─────────────────────              ──────────────────────               │
│                                                                          │
│  ┌─────────────┐                    ┌─────────────┐                     │
│  │   Sign Up   │                    │   Sign Up   │                     │
│  └──────┬──────┘                    └──────┬──────┘                     │
│         ▼                                  ▼                            │
│  ┌─────────────┐                    ┌─────────────────────┐             │
│  │  Purchase   │                    │  Check University   │             │
│  │  Credits    │                    │  Availability       │             │
│  └──────┬──────┘                    └──────┬──────────────┘             │
│         ▼                                  ▼                            │
│  ┌─────────────┐               ┌────────────────────────┐               │
│  │   Explore   │               │  Submit Verification   │               │
│  │  Features   │               │  (Email + ID)          │               │
│  └──────┬──────┘               └──────┬─────────────────┘               │
│         ▼                             ▼                                 │
│  ┌─────────────┐               ┌─────────────────────┐                  │
│  │  Use Any    │               │  Receive Credits    │                  │
│  │  Feature    │               │  from University    │                  │
│  └─────────────┘               └──────┬──────────────┘                  │
│                                       ▼                                 │
│                                ┌─────────────────────┐                  │
│                                │  Access /uni Module │                  │
│                                │  + All Features     │                  │
│                                └─────────────────────┘                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 2.2 University Roles Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    UNIVERSITY ROLE HIERARCHY                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                          ┌─────────────┐                                │
│                          │    HEAD     │                                │
│                          │  (Registrar)│                                │
│                          └──────┬──────┘                                │
│                                 │                                        │
│          ┌──────────────────────┼──────────────────────┐                │
│          ▼                      ▼                      ▼                │
│   ┌─────────────┐       ┌─────────────┐       ┌─────────────┐          │
│   │  PLACEMENT  │       │ DEPARTMENT  │       │   FINANCE   │          │
│   │   OFFICER   │       │    HEAD     │       │   OFFICER   │          │
│   └──────┬──────┘       └──────┬──────┘       └─────────────┘          │
│          │                     │                                        │
│          │              ┌──────┴──────┐                                 │
│          │              ▼             ▼                                 │
│          │       ┌──────────┐  ┌──────────┐                            │
│          │       │ FACULTY  │  │ FACULTY  │                            │
│          │       │(Teacher) │  │(Teacher) │                            │
│          │       └────┬─────┘  └────┬─────┘                            │
│          │            │             │                                   │
│          │            └──────┬──────┘                                   │
│          │                   ▼                                          │
│          │            ┌──────────────┐                                  │
│          │            │  TEACHING    │                                  │
│          │            │  ASSISTANT   │                                  │
│          └────────────►──────────────┘                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Role Definitions

| Role | Description | Permissions |
|------|-------------|-------------|
| **HEAD** | University registrar, first to onboard | Full access, billing, invite all roles, settings |
| **PLACEMENT_OFFICER** | Manages job partnerships | Company referrals, job visibility, placement analytics |
| **DEPARTMENT_HEAD** | Manages a department (CS, EE, etc.) | Invite faculty, view department analytics, assign courses |
| **FACULTY** | Professor/Teacher | Create assignments, grade, manage classes |
| **TEACHING_ASSISTANT** | Supports faculty | Limited grading, answer queries, manage submissions |
| **FINANCE_OFFICER** | Handles credits/billing | Purchase credits, view usage reports, allocate budgets |

---

## 3. Detailed User Flows

### 3.1 University Onboarding Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    UNIVERSITY ONBOARDING FLOW                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────┐                                                 │
│  │ HEAD visits        │                                                 │
│  │ university.coderz  │                                                 │
│  └─────────┬──────────┘                                                 │
│            ▼                                                            │
│  ┌────────────────────┐                                                 │
│  │ Fill Registration: │                                                 │
│  │ - University Name  │                                                 │
│  │ - Email Domain     │                                                 │
│  │ - Location         │                                                 │
│  │ - Contact Info     │                                                 │
│  └─────────┬──────────┘                                                 │
│            ▼                                                            │
│  ┌────────────────────┐                                                 │
│  │ Verification by    │                                                 │
│  │ Coder'z Team       │                                                 │
│  │ (Manual Review)    │                                                 │
│  └─────────┬──────────┘                                                 │
│            ▼                                                            │
│  ┌────────────────────┐                                                 │
│  │ Purchase Initial   │                                                 │
│  │ Credit Package     │                                                 │
│  │ (e.g., 500K for    │                                                 │
│  │  10K students)     │                                                 │
│  └─────────┬──────────┘                                                 │
│            ▼                                                            │
│  ┌────────────────────┐                                                 │
│  │ University         │                                                 │
│  │ Dashboard Active   │                                                 │
│  └─────────┬──────────┘                                                 │
│            ▼                                                            │
│  ┌────────────────────┐                                                 │
│  │ HEAD Invites:      │                                                 │
│  │ - Department Heads │                                                 │
│  │ - Placement Officer│                                                 │
│  │ - Finance Officer  │                                                 │
│  └─────────┬──────────┘                                                 │
│            ▼                                                            │
│  ┌────────────────────┐                                                 │
│  │ Dept Heads Invite  │                                                 │
│  │ Faculty Members    │                                                 │
│  └────────────────────┘                                                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 3.2 Student University Verification Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 STUDENT VERIFICATION FLOW                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐                                                    │
│  │ Student on Main │                                                    │
│  │ Platform        │                                                    │
│  └────────┬────────┘                                                    │
│           ▼                                                             │
│  ┌─────────────────┐     ┌─────────────────┐                           │
│  │ Goes to         │────►│ Sees "University│                           │
│  │ Settings/Profile│     │ Verification"   │                           │
│  └─────────────────┘     └────────┬────────┘                           │
│                                   ▼                                     │
│                          ┌─────────────────┐                           │
│                          │ Search/Select   │                           │
│                          │ University      │                           │
│                          └────────┬────────┘                           │
│                                   ▼                                     │
│                    ┌──────────────┴──────────────┐                     │
│                    ▼                             ▼                      │
│           ┌────────────────┐            ┌────────────────┐             │
│           │ University     │            │ University     │             │
│           │ NOT Found      │            │ Found          │             │
│           └────────┬───────┘            └────────┬───────┘             │
│                    ▼                             ▼                      │
│           ┌────────────────┐            ┌────────────────┐             │
│           │ Request to Add │            │ Enter University│            │
│           │ University     │            │ Email           │            │
│           └────────────────┘            └────────┬───────┘             │
│                                                  ▼                      │
│                                         ┌────────────────┐             │
│                                         │ Receive OTP    │             │
│                                         │ on Uni Email   │             │
│                                         └────────┬───────┘             │
│                                                  ▼                      │
│                                         ┌────────────────┐             │
│                                         │ Verify OTP     │             │
│                                         └────────┬───────┘             │
│                                                  ▼                      │
│                                         ┌────────────────┐             │
│                                         │ Credits Added  │             │
│                                         │ to Account     │             │
│                                         └────────┬───────┘             │
│                                                  ▼                      │
│                                         ┌────────────────┐             │
│                                         │ /uni Module    │             │
│                                         │ Unlocked       │             │
│                                         └────────────────┘             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 3.3 Faculty Assignment Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FACULTY ASSIGNMENT FLOW                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  FACULTY CREATES ASSIGNMENT                                              │
│  ──────────────────────────                                              │
│                                                                          │
│  ┌──────────────┐                                                       │
│  │ Faculty Login│                                                       │
│  │ to Uni Portal│                                                       │
│  └──────┬───────┘                                                       │
│         ▼                                                               │
│  ┌──────────────────────┐                                               │
│  │ Select Class:        │                                               │
│  │ - Semester           │                                               │
│  │ - Section            │                                               │
│  │ - Subject            │                                               │
│  └──────┬───────────────┘                                               │
│         ▼                                                               │
│  ┌──────────────────────┐                                               │
│  │ Create Assignment:   │                                               │
│  │                      │                                               │
│  │ TYPE OPTIONS:        │                                               │
│  │ ┌─────────────────┐  │                                               │
│  │ │ 📝 Quiz        │──►│ Use /assessments engine                       │
│  │ └─────────────────┘  │                                               │
│  │ ┌─────────────────┐  │                                               │
│  │ │ 💻 Coding      │──►│ Use /studio engine                            │
│  │ └─────────────────┘  │                                               │
│  │ ┌─────────────────┐  │                                               │
│  │ │ 🎤 Mock Int.   │──►│ Use /mock engine                              │
│  │ └─────────────────┘  │                                               │
│  │ ┌─────────────────┐  │                                               │
│  │ │ 📚 Space Topic │──►│ Use /spaces engine                            │
│  │ └─────────────────┘  │                                               │
│  │ ┌─────────────────┐  │                                               │
│  │ │ 🚀 Project     │──►│ Custom project with rubric                    │
│  │ └─────────────────┘  │                                               │
│  └──────┬───────────────┘                                               │
│         ▼                                                               │
│  ┌──────────────────────┐                                               │
│  │ Set Parameters:      │                                               │
│  │ - Deadline           │                                               │
│  │ - Credits Required   │                                               │
│  │ - Max Attempts       │                                               │
│  │ - Grading Criteria   │                                               │
│  └──────┬───────────────┘                                               │
│         ▼                                                               │
│  ┌──────────────────────┐                                               │
│  │ Publish to Class     │                                               │
│  └──────────────────────┘                                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. URL Structure & Module Mapping

### Main Platform Routes (Student)

| Route | Description | Who Can Access |
|-------|-------------|----------------|
| `/dashboard` | Personal dashboard | All students |
| `/studio` | Coding projects | All students |
| `/assessments` | Quizzes, tests | All students |
| `/mock` | Mock interviews | All students |
| `/spaces` | Learning spaces | All students |
| `/concepts` | Theory/concepts | All students |
| `/jobs` | Job listings (public) | All students |

### University Module Routes (Student)

| Route | Description | Who Can Access |
|-------|-------------|----------------|
| `/uni` | University dashboard | Verified uni students |
| `/uni/assignments` | University tasks | Verified uni students |
| `/uni/classes` | My classes | Verified uni students |
| `/uni/studio` | Assigned projects | Verified uni students |
| `/uni/mock` | Assigned interviews | Verified uni students |
| `/uni/spaces` | Required topics | Verified uni students |
| `/uni/jobs` | Private uni jobs | Verified uni students |
| `/uni/grades` | Grades & feedback | Verified uni students |

### University Admin Portal Routes

| Route | Description | Who Can Access |
|-------|-------------|----------------|
| `/admin` | Admin dashboard | All uni roles |
| `/admin/students` | Student management | HEAD, DEPT_HEAD |
| `/admin/faculty` | Faculty management | HEAD, DEPT_HEAD |
| `/admin/classes` | Class management | DEPT_HEAD, FACULTY |
| `/admin/assignments` | Assignment creation | FACULTY, TA |
| `/admin/analytics` | Usage analytics | HEAD, DEPT_HEAD |
| `/admin/billing` | Credits & billing | HEAD, FINANCE |
| `/admin/companies` | Company referrals | PLACEMENT_OFFICER |

---

## 5. Practical Example: Tech University

### University Profile
- **Name**: Tech University
- **Students**: 10,000
- **Semesters**: 8 (4 years × 2 semesters)
- **Classes per Semester**: 4
- **Total Classes**: 32
- **Faculty**: 32 teachers + 8 TAs

### Credit Allocation Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CREDIT ALLOCATION MODEL                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  UNIVERSITY PURCHASE                                                     │
│  ────────────────────                                                    │
│  Students: 10,000                                                        │
│  Credits per student per semester: 500                                   │
│  Total: 10,000 × 500 = 5,000,000 credits/semester                       │
│                                                                          │
│  DISTRIBUTION                                                            │
│  ────────────                                                            │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────┐      │
│  │                    5,000,000 CREDITS                          │      │
│  └───────────────────────────────┬───────────────────────────────┘      │
│                                  │                                       │
│              ┌───────────────────┼───────────────────┐                  │
│              ▼                   ▼                   ▼                  │
│     ┌───────────────┐   ┌───────────────┐   ┌───────────────┐          │
│     │  MANDATORY    │   │  STUDENT      │   │  RESERVES     │          │
│     │  ASSIGNMENTS  │   │  PERSONAL     │   │  (Unused)     │          │
│     │  ~60% (300cr) │   │  ~40% (200cr) │   │               │          │
│     └───────────────┘   └───────────────┘   └───────────────┘          │
│                                                                          │
│  PER STUDENT BREAKDOWN (500 credits/semester)                           │
│  ─────────────────────────────────────────────                          │
│  • 4 Coding Assignments: 4 × 30 = 120 credits                           │
│  • 4 Quizzes: 4 × 20 = 80 credits                                       │
│  • 2 Mock Interviews: 2 × 50 = 100 credits                              │
│  • Mandatory Total: 300 credits                                         │
│  • Personal Exploration: 200 credits                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Sample Class Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TECH UNIVERSITY - CS DEPARTMENT                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  SEMESTER 5 (Year 3, Sem 1)                                             │
│  ─────────────────────────────                                          │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ CLASS: CS301 - Data Structures & Algorithms                    │     │
│  │ FACULTY: Prof. Sharma                                          │     │
│  │ STUDENTS: 312                                                  │     │
│  │ TA: Rahul                                                      │     │
│  ├────────────────────────────────────────────────────────────────┤     │
│  │ ASSIGNMENTS THIS SEMESTER:                                     │     │
│  │                                                                │     │
│  │ Week 2:  📝 Quiz - Array Basics (20 cr)                       │     │
│  │ Week 4:  💻 Studio - Linked List Implementation (30 cr)       │     │
│  │ Week 6:  📝 Quiz - Tree Traversals (20 cr)                    │     │
│  │ Week 8:  💻 Studio - Graph Algorithms (30 cr)                 │     │
│  │ Week 10: 🎤 Mock Interview - DSA Round (50 cr)                │     │
│  │ Week 12: 📝 Quiz - Dynamic Programming (20 cr)                │     │
│  │ Week 14: 💻 Studio - Capstone Project (30 cr)                 │     │
│  │ Week 16: 🎤 Mock Interview - Final (50 cr)                    │     │
│  │                                                                │     │
│  │ TOTAL MANDATORY: 250 credits                                   │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ CLASS: CS302 - Web Development                                 │     │
│  │ FACULTY: Prof. Singh                                           │     │
│  │ ...                                                            │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Hiring Platform Integration

### Company Referral Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    COMPANY REFERRAL FLOW                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐                                                   │
│  │ Placement Officer│                                                   │
│  │ (University)     │                                                   │
│  └────────┬─────────┘                                                   │
│           ▼                                                             │
│  ┌──────────────────┐                                                   │
│  │ Generate Referral│                                                   │
│  │ Link for Company │                                                   │
│  └────────┬─────────┘                                                   │
│           ▼                                                             │
│  ┌──────────────────┐                                                   │
│  │ Company Signs Up │                                                   │
│  │ via Hiring Portal│                                                   │
│  └────────┬─────────┘                                                   │
│           ▼                                                             │
│  ┌──────────────────┐                                                   │
│  │ Company Tagged   │                                                   │
│  │ with University  │                                                   │
│  └────────┬─────────┘                                                   │
│           ▼                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     JOB POSTING OPTIONS                          │  │
│  │                                                                  │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │  │
│  │  │ PUBLIC JOB      │  │ UNIVERSITY ONLY │  │ SPECIFIC FILTER │  │  │
│  │  │                 │  │                 │  │                 │  │  │
│  │  │ Visible to all  │  │ Only for tagged │  │ - Specific year │  │  │
│  │  │ students on     │  │ university      │  │ - Specific dept │  │  │
│  │  │ main platform   │  │ students        │  │ - Min GPA       │  │  │
│  │  │                 │  │                 │  │ - Completed X   │  │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Job Visibility Matrix

| Job Type | Main `/jobs` | Uni `/uni/jobs` | Who Sees |
|----------|--------------|-----------------|----------|
| Public | ✅ | ✅ | All students |
| University-Tagged | ❌ | ✅ | Only verified uni students |
| Year-Filtered | ❌ | ✅ | Only matching year students |
| Department-Filtered | ❌ | ✅ | Only matching dept students |

---

## 7. Database Schema Additions

### New Tables Required

```sql
-- University Onboarding
University {
  id
  name
  emailDomain         -- @techuniversity.edu
  location
  status              -- PENDING, VERIFIED, ACTIVE, SUSPENDED
  headUserId          -- Foreign key to User
  totalCredits
  usedCredits
  createdAt
}

-- University Roles
UniversityMember {
  id
  userId              -- Foreign key to User
  universityId        -- Foreign key to University
  role                -- HEAD, DEPT_HEAD, FACULTY, TA, PLACEMENT, FINANCE
  departmentId        -- Optional, for dept-specific roles
  permissions         -- JSON field for granular permissions
  invitedBy
  createdAt
}

-- Department Structure
Department {
  id
  universityId
  name                -- Computer Science, Electronics, etc.
  headUserId
  createdAt
}

-- Class/Course
UniversityClass {
  id
  universityId
  departmentId
  semester
  year
  name                -- CS301 - Data Structures
  facultyId
  studentCount
  createdAt
}

-- Student University Link
StudentUniversityLink {
  id
  userId              -- Student's user ID
  universityId
  universityEmail
  verified            -- PENDING, VERIFIED, REJECTED
  semester
  departmentId
  creditsAllocated
  creditsUsed
  verifiedAt
}

-- University Assignments
UniversityAssignment {
  id
  classId
  facultyId
  title
  type                -- QUIZ, CODING, MOCK, SPACE, PROJECT
  referenceId         -- ID from respective module (assessment, project, etc.)
  deadline
  creditsRequired
  maxAttempts
  status              -- DRAFT, PUBLISHED, CLOSED
  createdAt
}

-- Student Submissions
UniversitySubmission {
  id
  assignmentId
  studentId
  submissionData      -- JSON
  grade
  feedback
  creditUsed
  submittedAt
  gradedAt
  gradedBy
}

-- Company University Link
CompanyUniversityLink {
  id
  companyId           -- From hiring platform
  universityId
  referredBy          -- Placement officer ID
  status              -- PENDING, ACTIVE
  createdAt
}

-- University Jobs
UniversityJob {
  id
  jobId               -- From hiring platform
  universityId
  visibility          -- UNIVERSITY_ONLY, YEAR_FILTER, DEPT_FILTER
  filters             -- JSON: {year: [3,4], department: ['CS']}
  createdAt
}
```

---

## 8. Implementation Phases

### Phase 1: Foundation (4-6 weeks)
- [ ] Database schema additions
- [ ] University registration & verification flow
- [ ] HEAD role & basic admin panel
- [ ] Student university verification (email-based)
- [ ] Basic `/uni` dashboard for students

### Phase 2: Academic Features (4-6 weeks)
- [ ] Faculty & TA roles
- [ ] Class management
- [ ] Assignment creation (using existing engines)
- [ ] Student assignment view in `/uni`
- [ ] Basic grading system

### Phase 3: Job Integration (3-4 weeks)
- [ ] Placement officer role
- [ ] Company referral system
- [ ] University-tagged job listings
- [ ] `/uni/jobs` module
- [ ] Job visibility filtering

### Phase 4: Analytics & Polish (3-4 weeks)
- [ ] University analytics dashboard
- [ ] Student progress tracking
- [ ] Credit usage reports
- [ ] Notification system
- [ ] Mobile responsiveness

---

## 9. Key Metrics to Track

| Metric | Description | Target |
|--------|-------------|--------|
| University Activation Rate | Universities that go live after signup | >70% |
| Student Verification Rate | % of students who verify | >80% |
| Assignment Completion Rate | Students completing assigned work | >85% |
| Credit Utilization | Credits used vs allocated | >75% |
| Job Application Rate | Uni students applying to private jobs | >50% |
| Placement Rate Improvement | Before vs after platform adoption | +15% |

---

*Document Created: December 30, 2025*
*Version: 1.0*