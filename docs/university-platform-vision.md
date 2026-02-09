# University Platform Vision 🎓

## Core Philosophy

> **We are NOT a traditional university management system.**
> We are a **skill-building platform** that connects teachers with students through practical assignments.

### What We DON'T Do:
- ❌ Attendance tracking
- ❌ Traditional lecture scheduling
- ❌ Grade books / CGPA management
- ❌ Timetable management
- ❌ Classroom management
- ❌ Traditional examination systems

### What We DO:
- ✅ **Assignments** - Teachers create coding assignments from the main platform
- ✅ **Assessments/Quizzes** - MCQs, coding questions, knowledge tests
- ✅ **Mock Interviews** - AI-powered interview practice
- ✅ **Projects** - Real-world project assignments
- ✅ **Credits System** - Students use allocated credits to unlock features
- ✅ **Job Placements** - Direct pipeline to hiring companies

---

## Platform Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UNIVERSITY PLATFORM FLOW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   UNIVERSITY ONBOARDING                                                      │
│   ─────────────────────                                                      │
│   1. University registers on /uni                                            │
│   2. Platform verifies (email domain, documents)                             │
│   3. University purchases credit package                                     │
│   4. HEAD invites faculty members                                            │
│                                                                              │
│   FACULTY WORKFLOW                                                           │
│   ────────────────                                                           │
│   1. Faculty logs in to /uni dashboard                                       │
│   2. Creates "Class" (just a group of students, NOT a lecture)               │
│   3. Creates Assignments linked to MAIN PLATFORM features:                   │
│      • Assessment Quiz → Links to /assessments                               │
│      • Coding Challenge → Links to /studio or /concepts                      │
│      • Mock Interview → Links to /mock                                       │
│      • Project → Links to /projects                                          │
│   4. Sets deadline, credit cost, grading criteria                            │
│   5. Reviews submissions, provides feedback                                  │
│                                                                              │
│   STUDENT WORKFLOW                                                           │
│   ────────────────                                                           │
│   1. Student signs up on MAIN platform (coderz.app)                          │
│   2. Verifies university email                                               │
│   3. Receives credits from university allocation                             │
│   4. Sees assignments in their /uni dashboard                                │
│   5. Completes assignments on MAIN PLATFORM                                  │
│   6. Submission auto-tracked, credits deducted                               │
│   7. Can also use credits freely for self-learning                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Assignment Types (Core Feature)

| Type | Description | Main Platform Link | Auto-Graded |
|------|-------------|-------------------|-------------|
| **QUIZ** | MCQ, True/False, Code Output questions | `/assessments` | ✅ Yes |
| **CODING** | Write code to solve problems | `/concepts/{problem}` | ✅ Yes |
| **MOCK_INTERVIEW** | AI voice interview practice | `/mock` | ✅ Yes (AI) |
| **PROJECT** | Build a complete project | `/projects` | ❌ Manual |
| **CUSTOM** | Teacher uploads resources, students submit | N/A | ❌ Manual |

---

## Credit Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CREDIT ECOSYSTEM                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   UNIVERSITY BUYS CREDITS                                                    │
│   ───────────────────────                                                    │
│   University purchases credit packages:                                      │
│   • Starter: 100,000 credits/month                                           │
│   • Growth: 500,000 credits/month                                            │
│   • Enterprise: Unlimited                                                    │
│                                                                              │
│   ALLOCATION                                                                 │
│   ──────────                                                                 │
│   • HEAD/Finance Officer allocates to departments                            │
│   • Department Head allocates to students                                    │
│   • Or: Bulk allocation to all verified students                             │
│                                                                              │
│   STUDENT USAGE                                                              │
│   ─────────────                                                              │
│   Students use credits on MAIN platform:                                     │
│   • Complete assigned quizzes (5-20 credits)                                 │
│   • Solve coding problems (10-50 credits)                                    │
│   • Take mock interviews (50-100 credits)                                    │
│   • Access premium projects (100-500 credits)                                │
│   • Apply for jobs (varies)                                                  │
│                                                                              │
│   TRACKING                                                                   │
│   ────────                                                                   │
│   • University dashboard shows credit usage                                  │
│   • Per-student breakdown available                                          │
│   • Assignment completion rates                                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Model (Simplified View)

```
University
├── Members (Faculty/Staff)
├── Departments (Optional grouping)
├── Classes (Student groups, NOT lectures)
│   ├── Enrollments (Students in class)
│   └── Assignments
│       ├── Type: QUIZ | CODING | MOCK_INTERVIEW | PROJECT | CUSTOM
│       ├── referenceId → Links to main platform content
│       ├── deadline, creditsRequired, maxScore
│       └── Submissions
│           ├── Auto-graded results (for QUIZ/CODING/MOCK)
│           └── Manual feedback (for PROJECT/CUSTOM)
└── StudentLinks (Verified students)
    ├── creditsAllocated
    ├── creditsUsed
    └── enrollments → Classes
```

---

## Key Differences from Traditional LMS

| Traditional LMS | Coder'z University |
|-----------------|-------------------|
| Manages attendance | No attendance |
| Lecture scheduling | No lectures |
| Grade books | Only assignment scores |
| Exam hall management | Online assessments |
| Syllabus tracking | Practical skills only |
| Paper submissions | Code/Project submissions |
| Manual grading | Auto-grading where possible |

---

## Teacher Dashboard Features

### 1. **Class Management** (Simple)
- Create a class (name, semester, students)
- Bulk invite students via email
- View enrolled students

### 2. **Assignment Creation** (Core Feature)
```
Create Assignment
├── Title & Description
├── Type Selection:
│   ├── Quiz → Select from /assessments or create new
│   ├── Coding → Select problems from /concepts
│   ├── Mock Interview → Select mock template
│   ├── Project → Select from /projects or custom
│   └── Custom → Upload files/links
├── Settings:
│   ├── Deadline
│   ├── Credits Required (auto-suggested based on type)
│   ├── Max Attempts
│   ├── Passing Score
│   └── Late Submission Policy
└── Publish to Class
```

### 3. **Submission Review**
- View all submissions
- Auto-grade results displayed
- Add manual feedback
- Request resubmission
- Export grades

### 4. **Analytics** (Simple)
- Assignment completion rates
- Class performance overview
- Credit usage by students

---

## Student Dashboard Features

### 1. **My Assignments**
- View pending assignments
- See deadlines
- Track completion status
- View grades & feedback

### 2. **Credit Balance**
- Current credits
- Usage history
- Request more credits (from university)

### 3. **Quick Actions**
- Jump to main platform features
- Continue where left off
- View recommended content

---

## API Integration Points

### Main Platform → University Platform
```typescript
// When student completes an assessment
POST /api/uni/submissions/sync
{
  userId: "user_123",
  assignmentId: "assign_456",
  referenceId: "assessment_789",
  score: 85,
  maxScore: 100,
  completedAt: "2024-01-15T10:30:00Z",
  autoGradeResult: { ... }
}
```

### University Platform → Main Platform
```typescript
// When teacher creates assignment from existing content
GET /api/assessments/{id}/summary
GET /api/concepts/{slug}/problem-info
GET /api/mock/{id}/template
GET /api/projects/{id}/details
```

---

## Implementation Priority

### Phase 1: Core Assignment Flow
1. ✅ University & Member management
2. ✅ Student verification
3. 🔄 Assignment CRUD
4. 🔄 Submission tracking
5. 🔄 Credit deduction on completion

### Phase 2: Platform Integration
1. 📋 Link assessments from /assessments
2. 📋 Link problems from /concepts
3. 📋 Link mocks from /mock
4. 📋 Auto-sync submission results

### Phase 3: Analytics & Polish
1. 📋 Teacher analytics dashboard
2. 📋 Student progress tracking
3. 📋 Bulk operations
4. 📋 Export/Reports

---

## Summary

The Coder'z University platform is **NOT** about managing a traditional university. It's about:

1. **Teachers creating practical assignments** that students complete on the main platform
2. **Students using credits** to access premium learning features
3. **Auto-grading** where possible, reducing teacher workload
4. **Direct job pipeline** for verified students
5. **Skill-based learning** over theoretical knowledge

> "Learn by doing, not by attending."