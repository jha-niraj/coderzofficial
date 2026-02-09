# University Teacher Features Blueprint

> **Document Version:** 1.0  
> **Last Updated:** February 8, 2026  
> **Status:** Planning Phase  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Core Philosophy](#core-philosophy)
3. [Architecture Overview](#architecture-overview)
4. [Feature Modules](#feature-modules)
5. [Database Schema Updates](#database-schema-updates)
6. [Implementation Roadmap](#implementation-roadmap)
7. [API Design](#api-design)
8. [UI/UX Flows](#uiux-flows)
9. [Integration Points](#integration-points)
10. [Testing Strategy](#testing-strategy)

---

## Executive Summary

This document outlines the comprehensive implementation plan for enabling university teachers to create and assign educational content to their students through the Coder'z platform. The key principle is that **we are NOT building a traditional university management system** (no attendance, no lecture scheduling) but rather focusing on **practical skill building** through:

- AI-generated projects
- Mock interviews (voice)
- Quizzes and coding assessments
- Live in-class sessions (surprise tests)
- Studio topics

---

## Core Philosophy

### What We ARE Building ✅
```
┌─────────────────────────────────────────────────────────────────┐
│                    PRACTICAL SKILL BUILDING                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  👨‍🏫 TEACHER CREATES                    👨‍🎓 STUDENT COMPLETES    │
│  ├── Projects (AI-generated)           ├── On MAIN platform     │
│  ├── Mock Interviews                   ├── Uses credits         │
│  ├── Quizzes & Coding                  ├── Auto-graded          │
│  ├── Live Sessions                     └── Results to teacher   │
│  └── Studio Topics                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### What We Are NOT Building ❌
- Attendance marking
- Lecture scheduling
- Traditional exams
- Timetable management
- Grade books (only assignment-specific scores)
- Parent communication portals

---

## Architecture Overview

### System Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           UNIVERSITY PLATFORM (/uni)                        │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │  UNIVERSITY     │    │    TEACHER      │    │    STUDENT      │        │
│  │     HEAD        │───▶│   DASHBOARD     │───▶│   DASHBOARD     │        │
│  │  (Verification) │    │                 │    │   (On /main)    │        │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘        │
│           │                      │                      │                  │
│           ▼                      ▼                      ▼                  │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │  - Invite       │    │  - Create       │    │  - View         │        │
│  │    Teachers     │    │    Projects     │    │    Assignments  │        │
│  │  - Manage       │    │  - Create       │    │  - Use Credits  │        │
│  │    Departments  │    │    Mocks        │    │  - Complete     │        │
│  │  - Allocate     │    │  - Create       │    │    Tasks        │        │
│  │    Credits      │    │    Quizzes      │    │  - View         │        │
│  │  - View         │    │  - Live         │    │    Results      │        │
│  │    Analytics    │    │    Sessions     │    │                 │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ API Calls / Direct DB
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           MAIN PLATFORM (/main)                             │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │    PROJECTS     │    │     MOCK        │    │   ASSESSMENTS   │        │
│  │    ENGINE       │    │    ENGINE       │    │    ENGINE       │        │
│  │                 │    │                 │    │                 │        │
│  │  - AI Gen      │    │  - ElevenLabs   │    │  - Quiz Gen     │        │
│  │  - Worker      │    │  - Voice AI     │    │  - Code Exec    │        │
│  │  - Tasks       │    │  - Analysis     │    │  - Auto Grade   │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                               │
│  │    STUDIO       │    │    SPACES       │                               │
│  │    ENGINE       │    │    ENGINE       │                               │
│  │                 │    │                 │                               │
│  │  - Topics      │    │  - Collaborative│                               │
│  │  - Learning    │    │  - Projects     │                               │
│  └─────────────────┘    └─────────────────┘                               │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           WORKER SERVICE                                    │
├────────────────────────────────────────────────────────────────────────────┤
│  - Project Generation via AI                                                │
│  - Background Job Processing                                                │
│  - WebSocket Status Updates                                                 │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Feature Modules

### Module 1: Teacher Project Assignment

#### 1.1 Project Generation Sheet (University Version)

The teacher will use the same project generation sheet as the main platform, but with additional university-specific fields.

**Flow:**
```
┌───────────────────────────────────────────────────────────────────────────┐
│                    PROJECT GENERATION FLOW (TEACHER)                       │
└───────────────────────────────────────────────────────────────────────────┘

┌─────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Step 1 │───▶│   Step 2    │───▶│   Step 3    │───▶│   Step 4    │
│ Details │    │  Tech Stack │    │ Difficulty  │    │  Settings   │
└─────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     │                                                       │
     │  - Project Title                                      │  - Visibility: PRIVATE
     │  - Description                                        │  - Assign to Classes
     │  - Type (FullStack/                                   │  - Set Deadline
     │    Frontend/etc)                                      │  - Credits Required
     └───────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Call Worker    │
                    │  (Direct Call)  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Project Gen    │
                    │  Processing     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Save to DB     │
                    │  with Uni Link  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Show on        │
                    │  Student's      │
                    │  Dashboard      │
                    └─────────────────┘
```

**API Design:**
```typescript
// Server Action: apps/uni/actions/teacher/project.action.ts

interface CreateUniversityProjectPayload {
  // Standard project fields (same as main platform)
  projectTitle: string;
  projectDescription: string;
  generationType: 'FULL_STACK' | 'FRONTEND' | 'APP' | 'PROGRAMS' | 'AI/ML' | 'AI_AGENT' | 'OTHER';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  technologies: string[];
  stacks: {
    frontend: string;
    backend: string;
    database: string;
    deployment: string;
    aiProvider?: string;
  };
  
  // University-specific fields
  classIds: string[];              // Which classes to assign to
  deadline?: Date;                 // Assignment deadline
  creditsRequired?: number;        // Credits needed
  instructions?: string;           // Additional teacher instructions
}

// Response includes project ID and status
interface CreateProjectResponse {
  success: boolean;
  projectId?: string;
  jobId?: string;
  error?: string;
}
```

---

### Module 2: Mock Interview Assignment

#### 2.1 Mock Interview Creation Sheet (University Version)

Teachers can create custom mock interviews for their students using the same ElevenLabs-powered voice AI system.

**Flow:**
```
┌───────────────────────────────────────────────────────────────────────────┐
│                    MOCK INTERVIEW CREATION FLOW (TEACHER)                  │
└───────────────────────────────────────────────────────────────────────────┘

┌─────────┐    ┌─────────────┐    ┌─────────────┐
│  Step 1 │───▶│   Step 2    │───▶│   Step 3    │
│  Basic  │    │ Knowledge   │    │  Settings   │
│  Info   │    │   Base      │    │  & Assign   │
└─────────┘    └─────────────┘    └─────────────┘
     │                │                   │
     │  - Title       │  - Topic          │  - Assign Classes
     │  - Description │  - Key Concepts   │  - Credits
     │  - Category    │  - Study Material │  - Deadline
     │  - Level       │                   │  - Instructions
     └────────────────┴───────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Create Mock    │
                    │  in Database    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Students See   │
                    │  in Dashboard   │
                    └─────────────────┘
```

**Database Schema Update:**
```prisma
// Already updated in mock.prisma

model MockInterviewVoice {
  // ... existing fields ...
  
  // University Integration
  isUniversityMock     Boolean   @default(false)
  universityId         String?
  teacherMemberId      String?
  classIds             String[]
  assignmentDeadline   DateTime?
  assignmentCredits    Int?
  assignmentInstructions String? @db.Text
}
```

---

### Module 3: Quiz & Coding Assessment

#### 3.1 Assessment Creation (University Version)

Teachers can create quizzes and coding assessments using the AI-powered assessment generator.

**Flow:**
```
┌───────────────────────────────────────────────────────────────────────────┐
│                    ASSESSMENT CREATION FLOW (TEACHER)                      │
└───────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │  Select Type    │
                    │  QUIZ / CODE    │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
     ┌─────────────────┐           ┌─────────────────┐
     │      QUIZ       │           │     CODING      │
     │  - MCQ          │           │  - Write Code   │
     │  - Multi-Select │           │  - Debug        │
     │  - True/False   │           │  - Complete     │
     └────────┬────────┘           └────────┬────────┘
              │                             │
              └──────────────┬──────────────┘
                             ▼
                    ┌─────────────────┐
                    │  Configure:     │
                    │  - Topic        │
                    │  - Difficulty   │
                    │  - Question #   │
                    │  - Time Limit   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  AI Generates   │
                    │  Questions      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Review &       │
                    │  Assign Classes │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Students       │
                    │  Complete       │
                    └─────────────────┘
```

---

### Module 4: Live Session (Surprise Test)

#### 4.1 Live In-Class Session

This is a new feature specifically for university teachers to conduct live quizzes/coding sessions in their classrooms.

**Flow:**
```
┌───────────────────────────────────────────────────────────────────────────┐
│                    LIVE SESSION FLOW (SURPRISE TEST)                       │
└───────────────────────────────────────────────────────────────────────────┘

                         TEACHER SIDE
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌─────────┐    ┌─────────────┐    ┌─────────────┐             │
│  │ Create  │───▶│  Configure  │───▶│   Start     │             │
│  │ Session │    │  Questions  │    │   Live      │             │
│  └─────────┘    └─────────────┘    └─────────────┘             │
│       │                                   │                     │
│       │  - Type: Quiz/Coding              │  - Real-time        │
│       │  - Questions (AI/Manual)          │    monitoring       │
│       │  - Time Limit                     │  - See responses    │
│       │  - Select Class                   │  - End session      │
│       │                                   │                     │
└───────┴───────────────────────────────────┴─────────────────────┘
                              │
                              │ WebSocket / Real-time
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         STUDENT SIDE                             │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │  📱 LIVE SESSION NOTIFICATION                               ││
│  │                                                              ││
│  │  "Your teacher has started a live quiz!"                    ││
│  │                                                              ││
│  │  Subject: Data Structures                                   ││
│  │  Questions: 10 MCQs                                         ││
│  │  Time Limit: 15 minutes                                     ││
│  │                                                              ││
│  │  [JOIN NOW]                                                 ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  On joining:                                                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Question 1/10                               Time: 14:32    ││
│  │                                                              ││
│  │  What is the time complexity of binary search?              ││
│  │                                                              ││
│  │  ○ O(1)                                                     ││
│  │  ○ O(n)                                                     ││
│  │  ● O(log n)                                                 ││
│  │  ○ O(n²)                                                    ││
│  │                                                              ││
│  │  [NEXT]                                                     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Database Schema:**
```prisma
// New model for live sessions

model UniversityLiveSession {
  id                String   @id @default(cuid())
  
  // Creator
  teacherMemberId   String
  universityId      String
  classId           String
  
  // Session Type
  type              LiveSessionType // QUIZ, CODING, MIXED
  
  // Content
  title             String
  description       String?
  questions         Json      // Array of questions
  
  // Configuration
  timeLimit         Int       // Total time in seconds
  questionTimeLimit Int?      // Per-question time (optional)
  showResults       Boolean   @default(true)
  shuffleQuestions  Boolean   @default(true)
  
  // Status
  status            LiveSessionStatus @default(DRAFT)
  startedAt         DateTime?
  endedAt           DateTime?
  
  // Stats
  totalParticipants Int       @default(0)
  avgScore          Float?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  participants      LiveSessionParticipant[]
}

enum LiveSessionType {
  QUIZ
  CODING
  MIXED
}

enum LiveSessionStatus {
  DRAFT
  SCHEDULED
  ACTIVE
  COMPLETED
  CANCELLED
}

model LiveSessionParticipant {
  id              String   @id @default(cuid())
  
  sessionId       String
  session         UniversityLiveSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  
  studentLinkId   String   // Links to StudentUniversityLink
  
  // Progress
  startedAt       DateTime?
  completedAt     DateTime?
  currentQuestion Int      @default(0)
  
  // Results
  answers         Json?    // Array of { questionIndex, answer, isCorrect, timeSpent }
  score           Float?
  rank            Int?
  
  createdAt       DateTime @default(now())
  
  @@unique([sessionId, studentLinkId])
}
```

---

## Database Schema Updates

### Summary of Schema Changes

| Model | Changes |
|-------|---------|
| `ProjectV2` | Added `isUniversityProject`, `universityId`, `teacherMemberId`, `classIds`, `assignmentDeadline`, `assignmentCredits`, `assignmentInstructions` |
| `MockInterviewVoice` | Added `isUniversityMock`, `universityId`, `teacherMemberId`, `classIds`, `assignmentDeadline`, `assignmentCredits`, `assignmentInstructions` |
| `UserPracticeSet` | Added `isUniversityAssessment`, `universityId`, `teacherMemberId`, `classIds`, `assignmentDeadline`, `assignmentCredits`, `assignmentInstructions`, `isLiveSession`, `liveSessionStartedAt`, `liveSessionEndedAt`, `liveSessionActive` |
| `UniversityType` (NEW ENUM) | `PUBLIC`, `PRIVATE`, `DEEMED`, `AUTONOMOUS`, `STATE`, `CENTRAL`, `AFFILIATED`, `COMMUNITY_COLLEGE`, `TECHNICAL_INSTITUTE`, `OTHER` |
| `UniversityLiveSession` (NEW) | For live in-class sessions |
| `LiveSessionParticipant` (NEW) | For tracking student participation |

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: FOUNDATION                                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ☑ 1. Update Navbar (Uni & Hiring apps)                                 │
│     - Add authenticated state                                            │
│     - Mobile sheet from top                                              │
│     - Match main platform style                                          │
│                                                                          │
│  ☑ 2. Update UniversityType to enum                                     │
│     - Update Prisma schema                                               │
│     - Update client.ts exports                                           │
│     - Update onboarding form                                             │
│     - Update admin types                                                 │
│                                                                          │
│  ☑ 3. Update existing schemas for university linking                    │
│     - ProjectV2 model                                                    │
│     - MockInterviewVoice model                                           │
│     - UserPracticeSet model                                              │
│                                                                          │
│  ☐ 4. Run Prisma migrations                                             │
│     - Generate client                                                    │
│     - Test migrations                                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Phase 2: Teacher Project Assignment (Week 2-3)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: TEACHER PROJECT ASSIGNMENT                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ☐ 1. Create Project Generation Sheet (Uni version)                     │
│     - Copy from main platform                                            │
│     - Add university-specific fields                                     │
│     - Add class selection                                                │
│                                                                          │
│  ☐ 2. Create Server Actions                                             │
│     - initiateUniversityProject                                          │
│     - Direct worker call                                                 │
│     - Save with university linking                                       │
│                                                                          │
│  ☐ 3. Teacher Dashboard - Projects Tab                                  │
│     - List created projects                                              │
│     - View student progress                                              │
│     - Edit assignments                                                   │
│                                                                          │
│  ☐ 4. Student Dashboard - Show Assigned Projects                        │
│     - Filter by university                                               │
│     - Show deadline, credits                                             │
│     - Link to main platform                                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Phase 3: Mock Interview Assignment (Week 3-4)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: MOCK INTERVIEW ASSIGNMENT                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ☐ 1. Create Mock Creation Sheet (Uni version)                          │
│     - Copy from main platform                                            │
│     - Add university-specific fields                                     │
│     - Add class selection                                                │
│                                                                          │
│  ☐ 2. Create Server Actions                                             │
│     - createUniversityMock                                               │
│     - Assign to classes                                                  │
│     - Handle ElevenLabs integration                                      │
│                                                                          │
│  ☐ 3. Teacher Dashboard - Mocks Tab                                     │
│     - List created mocks                                                 │
│     - View student completions                                           │
│     - View AI analysis results                                           │
│                                                                          │
│  ☐ 4. Student Dashboard - Show Assigned Mocks                           │
│     - Filter by university                                               │
│     - Show deadline, credits                                             │
│     - Link to main platform mock page                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Phase 4: Quiz & Coding Assessment (Week 4-5)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: QUIZ & CODING ASSESSMENT                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ☐ 1. Create Assessment Sheet (Uni version)                             │
│     - Support QUIZ and CODE modes                                        │
│     - AI question generation                                             │
│     - Add university-specific fields                                     │
│                                                                          │
│  ☐ 2. Create Server Actions                                             │
│     - createUniversityAssessment                                         │
│     - Generate questions via AI                                          │
│     - Assign to classes                                                  │
│                                                                          │
│  ☐ 3. Teacher Dashboard - Assessments Tab                               │
│     - List created assessments                                           │
│     - View statistics                                                    │
│     - Export results                                                     │
│                                                                          │
│  ☐ 4. Student Dashboard - Show Assigned Assessments                     │
│     - Filter by university                                               │
│     - Show deadline, credits                                             │
│     - Auto-graded results                                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Phase 5: Live Sessions (Week 5-6)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 5: LIVE SESSIONS (SURPRISE TEST)                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ☐ 1. Create Live Session Schema                                        │
│     - Add new models to university.prisma                                │
│     - Run migrations                                                     │
│                                                                          │
│  ☐ 2. Teacher Interface                                                 │
│     - Create session UI                                                  │
│     - Configure questions (AI or manual)                                 │
│     - Start/Stop session controls                                        │
│     - Real-time monitoring                                               │
│                                                                          │
│  ☐ 3. Student Interface                                                 │
│     - Real-time notification                                             │
│     - Join session flow                                                  │
│     - Question display                                                   │
│     - Timer and submission                                               │
│                                                                          │
│  ☐ 4. WebSocket Integration                                             │
│     - Session state sync                                                 │
│     - Real-time submissions                                              │
│     - Live leaderboard (optional)                                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## API Design

### Teacher API Endpoints

#### Project Management
```typescript
// apps/uni/actions/teacher/project.action.ts

export async function createUniversityProject(data: CreateUniversityProjectPayload): Promise<CreateProjectResponse>
export async function getTeacherProjects(teacherMemberId: string): Promise<ProjectWithStats[]>
export async function updateProjectAssignment(projectId: string, data: UpdateAssignmentPayload): Promise<void>
export async function getProjectStudentProgress(projectId: string): Promise<StudentProgress[]>
```

#### Mock Interview Management
```typescript
// apps/uni/actions/teacher/mock.action.ts

export async function createUniversityMock(data: CreateUniversityMockPayload): Promise<CreateMockResponse>
export async function getTeacherMocks(teacherMemberId: string): Promise<MockWithStats[]>
export async function updateMockAssignment(mockId: string, data: UpdateAssignmentPayload): Promise<void>
export async function getMockStudentResults(mockId: string): Promise<StudentMockResult[]>
```

#### Assessment Management
```typescript
// apps/uni/actions/teacher/assessment.action.ts

export async function createUniversityAssessment(data: CreateUniversityAssessmentPayload): Promise<CreateAssessmentResponse>
export async function getTeacherAssessments(teacherMemberId: string): Promise<AssessmentWithStats[]>
export async function updateAssessmentSettings(assessmentId: string, data: UpdateAssessmentPayload): Promise<void>
export async function getAssessmentStudentResults(assessmentId: string): Promise<StudentAssessmentResult[]>
```

#### Live Session Management
```typescript
// apps/uni/actions/teacher/live-session.action.ts

export async function createLiveSession(data: CreateLiveSessionPayload): Promise<LiveSession>
export async function startLiveSession(sessionId: string): Promise<void>
export async function endLiveSession(sessionId: string): Promise<SessionResults>
export async function getLiveSessionStatus(sessionId: string): Promise<SessionStatus>
export async function getSessionParticipants(sessionId: string): Promise<Participant[]>
```

### Student API Endpoints

```typescript
// apps/main/actions/(uni)/student.action.ts

export async function getUniversityAssignments(userId: string): Promise<Assignment[]>
export async function joinLiveSession(sessionId: string): Promise<JoinResponse>
export async function submitLiveSessionAnswer(sessionId: string, answer: Answer): Promise<SubmitResponse>
export async function getMyUniversityProgress(userId: string): Promise<UniversityProgress>
```

---

## UI/UX Flows

### Teacher Dashboard Structure

```
/uni/home
└── Teacher Dashboard
    ├── Overview Tab
    │   ├── Active Assignments
    │   ├── Recent Submissions
    │   └── Class Statistics
    │
    ├── Projects Tab
    │   ├── Create Project Button → Opens Generation Sheet
    │   ├── Project List (Cards)
    │   │   ├── Project Title
    │   │   ├── Assigned Classes
    │   │   ├── Deadline
    │   │   ├── Completion Rate
    │   │   └── Actions (Edit, View Progress)
    │   └── Student Progress View
    │
    ├── Mock Interviews Tab
    │   ├── Create Mock Button → Opens Creation Sheet
    │   ├── Mock List (Cards)
    │   │   ├── Mock Title
    │   │   ├── Category & Level
    │   │   ├── Assigned Classes
    │   │   ├── Completion Rate
    │   │   └── Actions (Edit, View Results)
    │   └── Student Results View
    │
    ├── Assessments Tab
    │   ├── Create Assessment Button → Opens Creation Sheet
    │   ├── Assessment List (Cards)
    │   │   ├── Assessment Title
    │   │   ├── Type (Quiz/Coding)
    │   │   ├── Assigned Classes
    │   │   ├── Avg Score
    │   │   └── Actions (Edit, View Results)
    │   └── Export Results
    │
    └── Live Sessions Tab
        ├── Start New Session Button
        ├── Active Sessions (if any)
        │   └── Real-time Controls
        ├── Scheduled Sessions
        └── Past Sessions
            └── Results & Analytics
```

### Student Dashboard (University Section)

```
/main/home (or /uni section on main)
└── University Section
    ├── Active Assignments
    │   ├── Projects
    │   │   ├── Project Card
    │   │   │   ├── Title
    │   │   │   ├── Teacher Name
    │   │   │   ├── Deadline
    │   │   │   ├── Credits Needed
    │   │   │   ├── Progress %
    │   │   │   └── Start/Continue Button
    │   │   └── ...more projects
    │   │
    │   ├── Mock Interviews
    │   │   └── Similar structure
    │   │
    │   └── Assessments
    │       └── Similar structure
    │
    ├── Live Session Alert (if active)
    │   └── Join Now CTA
    │
    └── Completed Assignments
        └── View Results
```

---

## Integration Points

### Worker Service Integration

The project generation will directly call the worker service from the university app:

```typescript
// Direct worker call approach
const WORKER_URL = process.env.WORKER_URL || 'http://localhost:3010';

async function callWorkerForProjectGeneration(payload: ProjectPayload) {
  const response = await fetch(`${WORKER_URL}/api/projects/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${workerToken}`,
    },
    body: JSON.stringify({
      ...payload,
      isUniversityProject: true,
      universityId: payload.universityId,
      teacherMemberId: payload.teacherMemberId,
    }),
  });
  
  return response.json();
}
```

### Credit System Integration

Students use their university-allocated credits to complete assignments:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CREDIT FLOW                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  University Purchases Credits                                            │
│           │                                                              │
│           ▼                                                              │
│  ┌─────────────────┐                                                    │
│  │ University      │                                                    │
│  │ Credit Pool     │                                                    │
│  │ (10,000 credits)│                                                    │
│  └────────┬────────┘                                                    │
│           │                                                              │
│           │ Finance Officer Allocates                                    │
│           ▼                                                              │
│  ┌─────────────────┐    ┌─────────────────┐                            │
│  │ Student A       │    │ Student B       │                            │
│  │ 500 credits     │    │ 500 credits     │                            │
│  └────────┬────────┘    └────────┬────────┘                            │
│           │                      │                                       │
│           │ Uses 50 credits      │                                       │
│           │ for Project          │                                       │
│           ▼                      │                                       │
│  ┌─────────────────┐             │                                       │
│  │ Project         │             │                                       │
│  │ Completed       │             │                                       │
│  │ (Auto-graded)   │             │                                       │
│  └─────────────────┘             │                                       │
│                                  │                                       │
│  NOTE: Students can also buy     │                                       │
│  personal credits if university  │                                       │
│  credits are exhausted           │                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Testing Strategy

### Unit Tests

```typescript
// __tests__/actions/teacher/project.test.ts

describe('University Project Actions', () => {
  it('should create a project with university linking', async () => {
    const payload = {
      projectTitle: 'E-commerce App',
      generationType: 'FULL_STACK',
      difficulty: 'INTERMEDIATE',
      classIds: ['class-1', 'class-2'],
      deadline: new Date('2026-03-01'),
    };
    
    const result = await createUniversityProject(payload);
    
    expect(result.success).toBe(true);
    expect(result.projectId).toBeDefined();
  });
  
  it('should fail if teacher is not authorized', async () => {
    // ...
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/teacher-flow.test.ts

describe('Teacher Assignment Flow', () => {
  it('should complete full project assignment flow', async () => {
    // 1. Create project
    // 2. Verify it appears in teacher dashboard
    // 3. Verify it appears in student dashboard
    // 4. Student starts project
    // 5. Verify progress updates
  });
});
```

### E2E Tests

```typescript
// cypress/e2e/teacher-project.cy.ts

describe('Teacher Project Creation', () => {
  it('should allow teacher to create and assign project', () => {
    cy.login('teacher@university.edu');
    cy.visit('/uni/home');
    cy.get('[data-testid="create-project-btn"]').click();
    // Fill form
    cy.get('[data-testid="project-title"]').type('React Dashboard');
    // Continue through steps
    // Submit
    cy.get('[data-testid="submit-btn"]').click();
    // Verify success
    cy.contains('Project created successfully');
  });
});
```

---

## Files to Create/Update

### New Files to Create

```
apps/uni/
├── actions/
│   └── teacher/
│       ├── project.action.ts
│       ├── mock.action.ts
│       ├── assessment.action.ts
│       └── live-session.action.ts
│
├── components/
│   └── teacher/
│       ├── project-generation-sheet.tsx
│       ├── mock-creation-sheet.tsx
│       ├── assessment-creation-sheet.tsx
│       ├── live-session-control.tsx
│       └── student-progress-table.tsx
│
└── app/(main)/
    └── teacher/
        ├── projects/
        │   └── page.tsx
        ├── mocks/
        │   └── page.tsx
        ├── assessments/
        │   └── page.tsx
        └── live-sessions/
            └── page.tsx

packages/prisma/
└── schema/
    └── university.prisma  (add LiveSession models)

apps/main/
└── app/(uni)/
    └── assignments/
        └── page.tsx  (student view of university assignments)
```

### Files to Update

```
packages/prisma/
├── schema/
│   ├── projects.prisma    ✅ Updated
│   ├── mock.prisma        ✅ Updated
│   ├── assessments.prisma ✅ Updated
│   └── university.prisma  ✅ Updated (enum)
└── client.ts              ✅ Updated

apps/uni/
├── components/landingpage/navbar.tsx  ✅ Updated
├── app/(auth)/onboarding/page.tsx     ✅ Updated
└── types/index.ts                     ✅ Updated

apps/hiring/
└── components/landingpage/navbar.tsx  ✅ Updated

apps/admin/
├── types/admin.ts                     ✅ Updated
└── app/(main)/uni/universities/page.tsx ✅ Updated
```

---

## Next Steps

1. **Run Prisma Migrations**
   ```bash
   cd packages/prisma
   npx prisma generate
   npx prisma db push  # or migrate dev
   ```

2. **Start with Teacher Project Assignment**
   - Create the project generation sheet component
   - Create the server actions
   - Test the worker integration

3. **Build Teacher Dashboard Tabs**
   - Projects tab with list and create button
   - Progress tracking views

4. **Test with Real Data**
   - Create a test university
   - Add a test teacher
   - Create a test project
   - Verify student sees it

---

## Conclusion

This blueprint provides a comprehensive guide for implementing teacher features in the university platform. The key principle remains: **focus on practical skill building, not traditional university management**.

The implementation should be done in phases, starting with the foundation (schema updates, navbar fixes) and progressively building out each feature module. Each phase should be thoroughly tested before moving to the next.

---

*Document maintained by the Coder'z development team.*