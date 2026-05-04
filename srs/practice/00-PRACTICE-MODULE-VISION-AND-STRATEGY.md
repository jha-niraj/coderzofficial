# 🧠 Practice Module — Vision, Strategy & Complete Blueprint

> **Module Path:** `/mock/practice`  
> **Tagline:** *"Stop copying to ChatGPT. Start understanding while you code."*  
> **Created:** March 2, 2026  
> **Status:** Pre-Implementation Research & Architecture

---

## Table of Contents

1. [The Problem We're Solving](#1-the-problem-were-solving)
2. [Our Unique Approach](#2-our-unique-approach)
3. [Competitive Landscape Research](#3-competitive-landscape-research)
4. [Module Architecture Overview](#4-module-architecture-overview)
5. [URL & Routing Structure](#5-url--routing-structure)
6. [Core Layout — The Three-Panel Design](#6-core-layout--the-three-panel-design)
7. [AI Interaction Philosophy](#7-ai-interaction-philosophy)
8. [Voice Integration Strategy (ElevenLabs)](#8-voice-integration-strategy-elevenlabs)
9. [How "Run" Works — The AI Assessment Trigger](#9-how-run-works--the-ai-assessment-trigger)
10. [Practice Modes: Exam vs Assist](#10-practice-modes-exam-vs-assist)
11. [Module Breakdown](#11-module-breakdown)
12. [Progress Tracking & Gamification](#12-progress-tracking--gamification)
13. [Technology Stack](#13-technology-stack)
14. [Implementation Phases](#14-implementation-phases)
15. [What Makes This Revolutionary](#15-what-makes-this-revolutionary)

---

## 1. The Problem We're Solving

### The Current Pain Point

```
┌──────────────────────────────────────────────────────────────────┐
│                    CURRENT USER JOURNEY                          │
│                                                                  │
│   LeetCode/GFG                     ChatGPT/Claude               │
│   ┌──────────┐     Copy/Paste      ┌──────────────┐             │
│   │ Problem  │ ──── Problem ──────▶│  Paste Problem │            │
│   │ Statement│                     │  + My Code     │            │
│   │          │                     │               │             │
│   │ Code     │ ──── Solution ─────▶│  "Explain"    │             │
│   │ Editor   │                     │               │             │
│   │          │     Context Lost    │  Gets full    │             │
│   │ ✗ Fails  │ ◀── ── ── ── ── ──│  solution     │             │
│   └──────────┘                     └──────────────┘             │
│                                                                  │
│   Problems:                                                      │
│   • Context switching kills focus                                │
│   • User loses their train of thought                           │
│   • ChatGPT gives full solutions (no learning)                  │
│   • No progressive guidance (brute force → optimal)             │
│   • No visual aids (recursion trees, flowcharts)                │
│   • No voice interaction (can't "think out loud")               │
│   • No tracking of improvement over attempts                    │
└──────────────────────────────────────────────────────────────────┘
```

### What Users Actually Need

When a student is stuck on Fibonacci and writes a brute-force recursive solution:

1. ❌ They do NOT need: *"Here's the DP solution with memoization"*
2. ✅ They DO need: *"Your recursion works! But look at this tree — fib(3) is computed 3 times. What if you could remember it?"*

The difference is **learning** vs **copying**.

---

## 2. Our Unique Approach

```
┌──────────────────────────────────────────────────────────────────────┐
│                    CODERZHQ PRACTICE MODULE                          │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────────┐    │
│  │   PROBLEM    │  │    CODE      │  │     AI MENTOR           │    │
│  │   STATEMENT  │  │    EDITOR    │  │                         │    │
│  │              │  │              │  │  🤖 "Your recursion     │    │
│  │  Fibonacci   │  │  def fib(n): │  │  calls fib(3) three    │    │
│  │  Number      │  │    if n<=1:  │  │  times. Look at this   │    │
│  │              │  │      return n│  │  tree:"                 │    │
│  │  Input: 5    │  │    return    │  │                         │    │
│  │  Output: 5   │  │      fib(n-1)│  │  ```mermaid             │    │
│  │              │  │     +fib(n-2)│  │  graph TD               │    │
│  │  Constraints │  │              │  │    F5-->F4              │    │
│  │  0 <= n <=30 │  │  [Run ▶]    │  │    F5-->F3              │    │
│  │              │  │              │  │    F4-->F3'             │    │
│  │  Test Cases  │  │              │  │  ```                    │    │
│  │  ✓ fib(0)=0  │  │              │  │                         │    │
│  │  ✗ fib(5)=?  │  │              │  │  🔊 [Voice Toggle]     │    │
│  └──────────────┘  └──────────────┘  └─────────────────────────┘    │
│                                                                      │
│  Everything is in ONE screen. No context switching.                  │
│  AI is triggered ONLY when user hits "Run".                         │
│  AI gives HINTS, not solutions. Progressively.                      │
│  Voice interaction is optional but powerful.                         │
└──────────────────────────────────────────────────────────────────────┘
```

### Core Principles

| Principle | What It Means |
|-----------|---------------|
| **Socratic Method** | AI asks guiding questions, never dumps the answer |
| **Progressive Revelation** | Brute Force → Better → Optimal, step by step |
| **Visual Learning** | Mermaid flowcharts, recursion trees, architecture diagrams |
| **Zero Context Switching** | Problem + Editor + AI Mentor all on one screen |
| **Voice-First Optional** | Toggle voice on/off — STT for user, TTS for AI |
| **No Compilation (Yet)** | We assess understanding, not if the code compiles |
| **Assist Mode Available** | For learning (not exam), AI actively guides you |

---

## 3. Competitive Landscape Research

### What Exists Today (March 2026)

| Platform | DSA | System Design | AI Feedback | Voice | Whiteboard | Our Advantage |
|----------|-----|---------------|-------------|-------|------------|---------------|
| **LeetCode** | ✅ 3000+ problems | ❌ | Basic hints only | ❌ | ❌ | LeetCode compiles but doesn't teach. You fail and stare at the screen. |
| **NeetCode** | ✅ 250 curated | ❌ (courses only) | ❌ | ❌ | ❌ | Great videos but no interactive AI mentor during practice. |
| **Codemia** | ✅ 200+ | ✅ 120+ with whiteboard | ✅ AI evaluation (scoring) | ❌ | ✅ Excalidraw-like | Codemia scores designs but doesn't teach Socratically. No voice. |
| **AlgoExpert/SystemsExpert** | ✅ 160+ | ✅ 13 questions | ❌ (video solutions only) | ❌ | ✅ Scratchpad | Excellent content but no AI interaction. Pre-recorded only. |
| **HackerRank** | ✅ Large pool | ❌ | ❌ | ❌ | ❌ | Pure assessment, no teaching. |
| **Interviewing.io** | ❌ | ❌ | ❌ | ✅ (human) | ✅ | Real humans = expensive, unscalable, hard to schedule. |
| **Pramp** | ✅ | ✅ | ❌ (peer) | ✅ (peer) | ✅ (shared) | Peer-to-peer is inconsistent in quality. No AI guidance. |

### The Gap We Fill

```
                    ┌─────────────────────────────────────┐
                    │       CODERZHQ PRACTICE              │
                    │                                     │
                    │   ✅ DSA Problems                    │
                    │   ✅ System Design (Excalidraw)      │
                    │   ✅ Frontend/Backend Code           │
                    │   ✅ AI Socratic Tutor               │
                    │   ✅ Voice Interaction (ElevenLabs)  │
                    │   ✅ Mermaid Flowcharts in Chat      │
                    │   ✅ Progressive Hints               │
                    │   ✅ Assist Mode for Learning        │
                    │   ✅ Exam Mode for Testing           │
                    │   ✅ Full Transcript Review           │
                    │   ✅ All in ONE Screen               │
                    │                                     │
                    │   Nobody does ALL of this together.  │
                    └─────────────────────────────────────┘
```

**Key Insight from Codemia:** They proved that System Design CAN be practiced interactively (not just watched in videos). Their AI scoring from 0-10 and iterative feedback loop is a validated pattern. We take it further with Socratic method + voice.

**Key Insight from NeetCode:** Structured roadmaps (Blind 75, NeetCode 150) with pattern-based categories are the gold standard for DSA organization. We should adopt similar categorization.

**Key Insight from Interviewing.io:** Voice-based coding practice is extremely powerful for building confidence. We replicate this with AI instead of humans for scalability.

---

## 4. Module Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    /mock/practice                             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                 PRACTICE DASHBOARD                    │    │
│  │                                                      │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │    │
│  │  │  DSA   │ │ System │ │  Web   │ │ AI/ML  │        │    │
│  │  │        │ │ Design │ │ Dev    │ │(Future)│        │    │
│  │  └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘        │    │
│  │      │          │          │          │              │    │
│  └──────┼──────────┼──────────┼──────────┼──────────────┘    │
│         │          │          │          │                    │
│         ▼          ▼          ▼          ▼                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │  /dsa/   │ │  /sd/    │ │ /web/    │ │ /ai/     │        │
│  │ [slug]   │ │ [slug]   │ │ [slug]   │ │ [slug]   │        │
│  │          │ │          │ │          │ │          │        │
│  │ Code     │ │Excalidraw│ │ Code +   │ │ Notebook │        │
│  │ Editor   │ │Whiteboard│ │ Preview  │ │ Style    │        │
│  │          │ │          │ │          │ │          │        │
│  │ + AI Chat│ │ + AI Chat│ │ + AI Chat│ │ + AI Chat│        │
│  │ + Voice  │ │ + Voice  │ │ + Voice  │ │ + Voice  │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                              │
│  SHARED COMPONENTS:                                          │
│  • AI Chat Panel (MarkdownRenderer + Mermaid)               │
│  • Voice Toggle (ElevenLabs STT + TTS)                      │
│  • Progress Tracker                                          │
│  • Sidebar with Categories                                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. URL & Routing Structure

```
/mock/practice                              → Dashboard (stats, streaks, category cards)
│
├── /mock/practice/dsa                      → DSA problem list with sidebar categories
│   ├── /mock/practice/dsa/[problemSlug]    → DSA coding workspace
│   │
│   Sidebar Categories:
│   ├── Arrays & Hashing
│   ├── Two Pointers
│   ├── Sliding Window
│   ├── Stack
│   ├── Binary Search
│   ├── Linked List
│   ├── Trees
│   ├── Tries
│   ├── Heap / Priority Queue
│   ├── Backtracking
│   ├── Graphs (BFS/DFS)
│   ├── Dynamic Programming
│   ├── Greedy
│   ├── Intervals
│   ├── Math & Geometry
│   └── Bit Manipulation
│
├── /mock/practice/sd                       → System Design problem list
│   ├── /mock/practice/sd/[problemSlug]     → SD whiteboard workspace
│   │
│   Sidebar Categories:
│   ├── URL Shortener
│   ├── Social Media Feed
│   ├── Chat System
│   ├── Video Streaming
│   ├── File Storage
│   ├── Rate Limiter
│   ├── Notification Service
│   ├── Search Engine
│   ├── Payment System
│   └── Distributed Cache
│
├── /mock/practice/web                      → Web Dev problem list
│   ├── /mock/practice/web/frontend/[slug]  → Frontend coding workspace
│   ├── /mock/practice/web/backend/[slug]   → Backend/API coding workspace
│   │
│   Sidebar Categories (Frontend):
│   ├── React Components
│   ├── State Management
│   ├── API Integration
│   ├── Accessibility
│   ├── Performance
│   └── CSS/Layout
│   │
│   Sidebar Categories (Backend):
│   ├── REST APIs
│   ├── Authentication
│   ├── Database Queries
│   ├── Middleware
│   ├── Error Handling
│   └── Caching
│
└── /mock/practice/ai (Future)              → AI/ML coding workspace
    ├── /mock/practice/ai/[problemSlug]
    │
    Sidebar Categories:
    ├── Data Preprocessing
    ├── Linear Regression
    ├── Classification
    ├── Neural Networks
    ├── NLP Tasks
    └── Computer Vision
```

---

## 6. Core Layout — The Three-Panel Design

### Screen Wireframe

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ◀ Back to Practice    DSA / Arrays / Two Sum         🔊 Voice: OFF    │
├──────────┬─────────────────────────────┬────────────────────────────────┤
│          │                             │                                │
│ PROBLEM  │      CODE EDITOR           │      AI MENTOR CHAT            │
│ PANEL    │                             │                                │
│          │  ┌─────────────────────┐    │  ┌────────────────────────┐    │
│ Two Sum  │  │ // Your solution    │    │  │ 🤖 Welcome! You're    │    │
│          │  │ function twoSum(    │    │  │ solving Two Sum.      │    │
│ Given an │  │   nums, target      │    │  │ Write your approach   │    │
│ array of │  │ ) {                 │    │  │ and hit "Run" when    │    │
│ integers │  │   // write here     │    │  │ you're ready for     │    │
│ nums and │  │ }                   │    │  │ feedback!             │    │
│ an int   │  │                     │    │  └────────────────────────┘    │
│ target,  │  └─────────────────────┘    │                                │
│ return   │                             │  ┌────────────────────────┐    │
│ indices  │  Language: [JavaScript ▾]   │  │ 👤 [Type message...]  │    │
│ of the   │                             │  │                        │    │
│ two nums │  ┌───────────────────────┐  │  │ [Send]  [🎤 Voice]   │    │
│ such     │  │ Test Cases            │  │  └────────────────────────┘    │
│ that     │  │ ✅ twoSum([2,7],9)   │  │                                │
│ they add │  │    → [0,1]           │  │  ┌────────────────────────┐    │
│ up to    │  │ ❓ twoSum([3,2,4],6)│  │  │ Attempt: 1/∞          │    │
│ target.  │  │    → ???             │  │  │ Approach: Not started  │    │
│          │  └───────────────────────┘  │  │ Best: —               │    │
│ Examples │                             │  └────────────────────────┘    │
│ ───────  │  [▶ Run & Assess]          │                                │
│ [1,2,3]  │                             │                                │
│ target=5 │                             │                                │
│          │                             │                                │
├──────────┴─────────────────────────────┴────────────────────────────────┤
│  Hints: 💡 Available    Solution: 🔒 Locked (3 attempts)    ⏱ 12:34   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Panel Specifications

| Panel | Width | Content | Scrollable | Resizable |
|-------|-------|---------|------------|-----------|
| **Left — Problem** | ~25% | Problem statement, examples, constraints, test cases | Yes | Yes (drag border) |
| **Center — Workspace** | ~40% | Code editor (DSA/Web) or Excalidraw (SD) | No (editor handles scroll) | Yes |
| **Right — AI Mentor** | ~35% | Chat messages (markdown), voice controls, attempt tracker | Yes (auto-scroll to bottom) | Yes |

---

## 7. AI Interaction Philosophy

### The Socratic Ladder

```
┌──────────────────────────────────────────────────────────────┐
│                  AI RESPONSE STRATEGY                         │
│                                                              │
│  User Attempt 1: Wrong/Brute Force                          │
│  ┌──────────────────────────────────────────────┐            │
│  │ AI Response Level 1: IDENTIFY & QUESTION      │            │
│  │                                               │            │
│  │ "I see you're using nested loops to check     │            │
│  │  every pair. This gives O(n²) time.           │            │
│  │                                               │            │
│  │  ```mermaid                                   │            │
│  │  graph LR                                     │            │
│  │    A[i=0] --> B[j=1,2,3...]                   │            │
│  │    C[i=1] --> D[j=2,3...]                     │            │
│  │    E[i=2] --> F[j=3...]                       │            │
│  │  ```                                          │            │
│  │                                               │            │
│  │  💭 Is there a data structure that lets you    │            │
│  │  check 'does this value exist?' in O(1)?"     │            │
│  └──────────────────────────────────────────────┘            │
│                                                              │
│  User Attempt 2: Better but not optimal                     │
│  ┌──────────────────────────────────────────────┐            │
│  │ AI Response Level 2: REFINE & GUIDE           │            │
│  │                                               │            │
│  │ "Great! You're using a hash map now — that's  │            │
│  │  the right direction! But you're doing two    │            │
│  │  passes: one to build the map, one to look up.│            │
│  │                                               │            │
│  │  💭 What if you checked AND stored in the     │            │
│  │  same loop? That would save one pass."        │            │
│  └──────────────────────────────────────────────┘            │
│                                                              │
│  User Attempt 3: Optimal                                    │
│  ┌──────────────────────────────────────────────┐            │
│  │ AI Response Level 3: CONGRATULATE & DEEPEN    │            │
│  │                                               │            │
│  │ "🎉 Perfect! O(n) time, O(n) space.           │            │
│  │  Your single-pass hash map solution is        │            │
│  │  optimal.                                     │            │
│  │                                               │            │
│  │  🧠 Follow-up: What if the array was sorted?  │            │
│  │  Could you do it in O(1) space?"              │            │
│  └──────────────────────────────────────────────┘            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### AI Prompt Engineering Strategy

The AI prompt sent to OpenAI (GPT-4o) will be structured as:

```json
{
  "system": "You are a patient coding mentor. NEVER give the direct solution. Use the Socratic method. Generate mermaid diagrams when explaining data flows, recursion trees, or algorithmic steps. Point out specific lines in the user's code. Track their progress across attempts.",
  
  "context": {
    "problem": "Two Sum",
    "difficulty": "Easy",
    "optimal_approach": "Single-pass Hash Map, O(n) time, O(n) space",
    "user_code": "function twoSum(nums, target) { for(let i=0; ...) }",
    "attempt_number": 1,
    "previous_hints_given": [],
    "user_current_approach": "Brute Force - Nested Loops",
    "test_case_results": [
      { "input": "[2,7,11,15], 9", "expected": "[0,1]", "got": "[0,1]", "passed": true },
      { "input": "[3,2,4], 6", "expected": "[1,2]", "got": "timeout", "passed": false }
    ]
  },
  
  "instructions": [
    "1. Acknowledge what the user did correctly",
    "2. Identify the specific issue (line numbers if possible)",
    "3. Generate a mermaid flowchart showing the problem visually",
    "4. Ask ONE guiding question to lead them to the next level",
    "5. Do NOT write code for them",
    "6. If this is attempt 3+, provide slightly more direct hints",
    "7. Format all output as markdown with mermaid blocks"
  ]
}
```

---

## 8. Voice Integration Strategy (ElevenLabs)

### Decision: STT + TTS, NOT Conversational Agent

Based on research and cost analysis:

```
┌──────────────────────────────────────────────────────────────┐
│            VOICE ARCHITECTURE DECISION                       │
│                                                              │
│  ❌ Conversational Agent (Rejected)                          │
│     • Too expensive per minute                               │
│     • User interruptions break the flow                      │
│     • Agent tries to lead conversation (we need it passive)  │
│     • Latency issues with complex code analysis              │
│                                                              │
│  ✅ STT + TTS Pipeline (Chosen)                              │
│     • User speaks → Scribe v2 (STT) → Text                  │
│     • Text → OpenAI GPT-4o → Response Text                  │
│     • Response Text → ElevenLabs TTS → Audio                │
│     • Full control over when AI speaks                       │
│     • Much cheaper per interaction                           │
│     • Transcript saved for review                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Voice Flow Diagram

```
┌───────────────────────────────────────────────────────────────────┐
│                     VOICE INTERACTION FLOW                        │
│                                                                   │
│   USER                    SYSTEM                     AI MENTOR    │
│                                                                   │
│   🎤 Speaks              ┌──────────┐                             │
│   "I think I need   ───▶│ Scribe   │                             │
│    a hash map"          │ v2 (STT) │                             │
│                         └────┬─────┘                             │
│                              │ text                              │
│                              ▼                                    │
│                         ┌──────────┐                             │
│                         │ Append   │                             │
│                         │ to Chat  │                             │
│                         │ + Context│                             │
│                         └────┬─────┘                             │
│                              │                                    │
│                              ▼                                    │
│                         ┌──────────┐    ┌──────────┐             │
│                         │ OpenAI   │───▶│ Response │             │
│                         │ GPT-4o   │    │ Text     │             │
│                         └──────────┘    └────┬─────┘             │
│                                              │                    │
│                              ┌───────────────┼──────────┐        │
│                              │               │          │        │
│                              ▼               ▼          ▼        │
│                         ┌──────────┐  ┌──────────┐ ┌────────┐   │
│                         │ Render   │  │ Extract  │ │ Save   │   │
│                         │ Markdown │  │ Speech   │ │ Trans- │   │
│                         │ in Chat  │  │ Text     │ │ cript  │   │
│                         └──────────┘  └────┬─────┘ └────────┘   │
│                                            │                     │
│                                            ▼                     │
│                                       ┌──────────┐              │
│   🔊 Hears              ◀────────────│ Eleven   │              │
│   "Great thinking!                    │ Labs TTS │              │
│    A hash map gives                   │ Flash v2 │              │
│    you O(1) lookup..."               └──────────┘              │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Voice Implementation Details

| Component | Service | Model | Why |
|-----------|---------|-------|-----|
| **User Speech → Text** | ElevenLabs | Scribe v2 Realtime | 150ms latency, 90+ languages, word-level timestamps |
| **AI Response → Speech** | ElevenLabs | Flash v2.5 | 75ms latency, cheapest, natural sounding |
| **AI Reasoning** | OpenAI | GPT-4o | Best for code analysis, Mermaid generation |
| **Voice Activity Detection** | Built into Scribe v2 | — | Auto-detects when user stops speaking |

### Voice Toggle Behavior

```
┌────────────────────────────────────────────────┐
│           VOICE TOGGLE STATES                   │
│                                                │
│  🔇 OFF (Default)                              │
│  └── User types in chat input                  │
│  └── AI response rendered as markdown only     │
│  └── No audio playback                         │
│                                                │
│  🔊 ON (User toggles)                          │
│  └── Mic activates for user input              │
│  └── User can still type (dual input)          │
│  └── AI response: markdown + voice readout     │
│  └── Voice reads the conversational parts      │
│      (skips code blocks and mermaid)           │
│  └── Transcript saved below each message       │
│                                                │
└────────────────────────────────────────────────┘
```

---

## 9. How "Run" Works — The AI Assessment Trigger

### This is NOT Compilation

**Critical Design Decision:** We are NOT compiling the user's code. We are sending it to the AI for analysis. Why?

1. Compilation tells you "it works or it doesn't" — that's not learning
2. The AI can identify *why* the approach is wrong, not just *that* it's wrong
3. We can assess understanding, approach quality, code style, and edge case awareness
4. System Design and Frontend problems can't be "compiled" anyway

### The "Run & Assess" Flow

```
┌──────────────────────────────────────────────────────────────────┐
│              WHEN USER CLICKS "RUN & ASSESS"                     │
│                                                                  │
│  Step 1: Gather Context                                         │
│  ┌────────────────────────────────────┐                          │
│  │ • Problem statement                │                          │
│  │ • User's current code              │                          │
│  │ • Selected language                │                          │
│  │ • Attempt number                   │                          │
│  │ • Previous AI hints given          │                          │
│  │ • Previous approaches tried        │                          │
│  │ • Visible test cases               │                          │
│  │ • Expected optimal solution info   │                          │
│  │ • Time spent on problem            │                          │
│  └────────────────────────────────────┘                          │
│                          │                                       │
│                          ▼                                       │
│  Step 2: Build AI Prompt                                        │
│  ┌────────────────────────────────────┐                          │
│  │ System prompt (Socratic method)    │                          │
│  │ + Problem context                  │                          │
│  │ + User code                        │                          │
│  │ + Attempt history                  │                          │
│  │ + Output format instructions       │                          │
│  │   (markdown + mermaid)             │                          │
│  └────────────────────────────────────┘                          │
│                          │                                       │
│                          ▼                                       │
│  Step 3: Stream AI Response                                     │
│  ┌────────────────────────────────────┐                          │
│  │ Streamed to chat panel             │                          │
│  │ Rendered as markdown in real-time  │                          │
│  │ Mermaid blocks auto-rendered       │                          │
│  │ Code references highlighted        │                          │
│  └────────────────────────────────────┘                          │
│                          │                                       │
│                          ▼                                       │
│  Step 4: If Voice is ON                                         │
│  ┌────────────────────────────────────┐                          │
│  │ Extract conversational text        │                          │
│  │ (strip code blocks + mermaid)      │                          │
│  │ Send to ElevenLabs TTS             │                          │
│  │ Play audio while markdown renders  │                          │
│  └────────────────────────────────────┘                          │
│                          │                                       │
│                          ▼                                       │
│  Step 5: Track Progress                                         │
│  ┌────────────────────────────────────┐                          │
│  │ Save attempt to database           │                          │
│  │ Update approach classification     │                          │
│  │   (Brute Force/Better/Optimal)     │                          │
│  │ Update streak / XP                 │                          │
│  └────────────────────────────────────┘                          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 10. Practice Modes: Exam vs Assist

```
┌──────────────────────────────────────────────────────────────────┐
│                    TWO PRACTICE MODES                             │
│                                                                  │
│  ┌───────────────────────────┐  ┌────────────────────────────┐   │
│  │     🎯 EXAM MODE          │  │     🤝 ASSIST MODE          │   │
│  │                           │  │                            │   │
│  │  • AI gives ONLY hints    │  │  • AI actively guides      │   │
│  │  • No solution available  │  │  • Can ask for solution    │   │
│  │  • Minimal guidance       │  │  • Step-by-step walkthrough│   │
│  │  • Timed (optional)       │  │  • No time pressure        │   │
│  │  • Scored                 │  │  • Learning-focused        │   │
│  │  • Limited attempts       │  │  • Unlimited attempts      │   │
│  │  • For interview prep     │  │  • For understanding       │   │
│  │  • Results tracked        │  │  • Progress tracked        │   │
│  │                           │  │                            │   │
│  │  "Test what you know"     │  │  "Learn what you don't"    │   │
│  └───────────────────────────┘  └────────────────────────────┘   │
│                                                                  │
│  User selects mode BEFORE starting a problem.                    │
│  Can switch from Exam → Assist (forfeits exam score).           │
│  Cannot switch from Assist → Exam for same problem.             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Assist Mode — System Design Example

When Assist Mode is ON and the user is solving a System Design problem:

```
┌──────────────────────────────────────────────────────────────────┐
│  ASSIST MODE: Design a URL Shortener                             │
│                                                                  │
│  User has placed: [Client] → [API Server] → [Database]          │
│                                                                  │
│  AI Chat Panel:                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ 🤝 ASSIST MODE ACTIVE                                    │    │
│  │                                                          │    │
│  │ 🤖 "Good start! You have the basic flow. Let me help    │    │
│  │ you think about what's missing:                          │    │
│  │                                                          │    │
│  │ 1. Your API server is a single point of failure.        │    │
│  │    Look at the **Load Balancers** section in your       │    │
│  │    component library.                                    │    │
│  │                                                          │    │
│  │ 2. For a URL shortener, you'll get more reads than      │    │
│  │    writes. Consider adding a caching layer.             │    │
│  │                                                          │    │
│  │ Here's what the next step could look like:              │    │
│  │                                                          │    │
│  │ ```mermaid                                              │    │
│  │ graph LR                                                │    │
│  │   Client --> LB[Load Balancer]                          │    │
│  │   LB --> API1[API Server 1]                             │    │
│  │   LB --> API2[API Server 2]                             │    │
│  │   API1 --> Cache[Redis Cache]                           │    │
│  │   API2 --> Cache                                        │    │
│  │   Cache --> DB[(Database)]                              │    │
│  │ ```                                                     │    │
│  │                                                          │    │
│  │ Try adding the Load Balancer and Cache components       │    │
│  │ from your library. Then hit 'Assess' again!"            │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 11. Module Breakdown

The Practice Module has **four distinct workspace types**, each with its own center panel but sharing the same AI Chat + Voice panel on the right. Detailed blueprints for each are in separate documents:

| Module | Document | Workspace Type | Key Components |
|--------|----------|----------------|----------------|
| **DSA** | `01-DSA-PRACTICE-BLUEPRINT.md` | Monaco Code Editor | Code editor, test cases, complexity analysis, Mermaid trees |
| **System Design** | `02-SYSTEM-DESIGN-PRACTICE-BLUEPRINT.md` | Excalidraw Whiteboard | Canvas, component library, architecture patterns, snapshot analysis |
| **Web Dev** | `03-WEB-DEV-PRACTICE-BLUEPRINT.md` | Code Editor + Preview | Monaco editor, live preview (frontend), API tester (backend) |
| **AI/ML** | Future | Notebook-style Editor | Data viz, model training steps |

---

## 12. Progress Tracking & Gamification

```
┌──────────────────────────────────────────────────────────────────┐
│                    PRACTICE DASHBOARD                             │
│                    /mock/practice                                 │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Welcome back, Niraj! 🔥 5-day streak                     │  │
│  │                                                            │  │
│  │  Problems Solved: 47/200    XP Earned: 2,340              │  │
│  │  [████████░░░░░░░░] 23%     Rank: Rising Star ⭐          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ DSA      │ │ System   │ │ Web Dev  │ │ AI/ML    │           │
│  │ 32/150   │ │ Design   │ │ 10/40   │ │ Coming   │           │
│  │ ████░░░░ │ │ 5/30    │ │ ██░░░░░ │ │ Soon     │           │
│  │          │ │ █░░░░░░ │ │         │ │          │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                  │
│  Recent Activity:                                                │
│  • Two Sum ✅ Optimal (3 attempts) — 2 hours ago                │
│  • URL Shortener 🔶 Partial (missed caching) — yesterday       │
│  • JWT Middleware ✅ First try! — 2 days ago                    │
│                                                                  │
│  Daily Challenge: "Merge Two Sorted Lists" → [Start]            │
│                                                                  │
│  Weak Areas (AI-Detected):                                       │
│  🔴 Dynamic Programming — 2/15 solved                           │
│  🟡 Graph Algorithms — 4/12 solved                               │
│  🟢 Arrays — 18/20 solved                                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### What We Track Per Problem

| Metric | Description |
|--------|-------------|
| `attempts` | Number of "Run & Assess" clicks |
| `approaches_tried` | ["Brute Force", "HashMap", "Two Pointer"] |
| `best_approach` | The most optimized approach achieved |
| `time_spent` | Total minutes on problem |
| `hints_used` | Number of AI hints requested |
| `voice_used` | Whether voice interaction was used |
| `mode` | Exam or Assist |
| `transcript` | Full chat + voice transcript |
| `status` | Not Started / In Progress / Solved / Optimal |

---

## 13. Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Code Editor** | Monaco Editor (via `@monaco-editor/react`) | Already used in codebase, full language support |
| **Whiteboard** | `@excalidraw/excalidraw` | Open source, React component, free, used by many SD platforms |
| **AI Reasoning** | OpenAI GPT-4o | Best code analysis, Mermaid generation, Socratic prompting |
| **Speech-to-Text** | ElevenLabs Scribe v2 Realtime | 150ms latency, 90+ languages |
| **Text-to-Speech** | ElevenLabs Flash v2.5 | 75ms latency, cheapest, natural |
| **Markdown Rendering** | `react-markdown` + `remark-gfm` | Already in codebase (MarkdownRenderer component) |
| **Flowcharts** | Mermaid.js (via `rehype-mermaid` or custom renderer) | Inline markdown rendering, no extra UI needed |
| **State Management** | React useState + Zustand (for session state) | Already used in codebase |
| **Database** | Prisma + PostgreSQL | Already in codebase, track progress |
| **Streaming** | Vercel AI SDK / OpenAI streaming | Real-time AI response rendering |
| **UI Components** | shadcn/ui (from `@repo/ui`) | Already in codebase |
| **Layout** | `react-resizable-panels` | For draggable three-panel layout |

---

## 14. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Practice dashboard page (`/mock/practice`)
- [ ] Sidebar component with categories (reuse learn-sidebar pattern)
- [ ] Three-panel resizable layout component
- [ ] AI Chat panel with Mermaid support in MarkdownRenderer
- [ ] Basic DSA problem model in Prisma schema
- [ ] "Run & Assess" button → OpenAI integration

### Phase 2: DSA Module (Week 3-4)
- [ ] DSA workspace (`/mock/practice/dsa/[slug]`)
- [ ] Monaco editor with test case display
- [ ] AI prompt engineering for DSA problems
- [ ] Progressive hint system (attempt tracking)
- [ ] Problem database seeding (start with 30 problems)
- [ ] Assist mode vs Exam mode toggle

### Phase 3: Voice Integration (Week 5)
- [ ] ElevenLabs Scribe v2 STT integration
- [ ] ElevenLabs Flash v2.5 TTS integration
- [ ] Voice toggle button in AI Chat panel
- [ ] Transcript saving and display
- [ ] Stripping code/mermaid blocks for voice readout

### Phase 4: System Design Module (Week 6-7)
- [ ] Excalidraw integration as center panel
- [ ] Component library (drag-and-drop architecture components)
- [ ] Canvas → JSON → Text topology extraction
- [ ] AI prompt engineering for SD problems
- [ ] Assist mode with component suggestions

### Phase 5: Web Dev Module (Week 8-9)
- [ ] Frontend workspace with preview panel
- [ ] Backend workspace with API testing panel
- [ ] AI prompt engineering for web dev problems
- [ ] Code review style feedback

### Phase 6: Polish & Gamification (Week 10)
- [ ] Progress dashboard with stats
- [ ] Streak system
- [ ] Weak area detection
- [ ] Daily challenges
- [ ] Leaderboard integration

---

## 15. What Makes This Revolutionary

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  🏆 WHY CODERZHQ PRACTICE WILL BE DIFFERENT                     │
│                                                                  │
│  1. ZERO CONTEXT SWITCHING                                       │
│     Everything on one screen. No copy-pasting to ChatGPT.       │
│                                                                  │
│  2. AI THAT TEACHES, NOT TELLS                                  │
│     Socratic method. Progressive hints. Never dumps solutions.   │
│                                                                  │
│  3. VISUAL UNDERSTANDING                                         │
│     Mermaid flowcharts, recursion trees, architecture diagrams   │
│     generated inline in the chat. Not just text walls.           │
│                                                                  │
│  4. VOICE INTERACTION                                            │
│     Think out loud. The AI listens and responds.                │
│     Like having a patient senior engineer next to you.           │
│                                                                  │
│  5. MULTI-DOMAIN                                                 │
│     DSA, System Design, Frontend, Backend — all in one place    │
│     with domain-specific workspaces.                             │
│                                                                  │
│  6. ASSIST MODE                                                  │
│     When you're learning (not testing), the AI actively         │
│     shows you what to do next. Like pair programming.           │
│                                                                  │
│  7. FULL TRANSCRIPT REVIEW                                       │
│     Go back and read your entire problem-solving journey.       │
│     See how you improved from attempt 1 to optimal.             │
│                                                                  │
│  8. NO COMPILATION NEEDED                                        │
│     Understanding > Syntax. The AI evaluates your approach,     │
│     not if your semicolons are right.                            │
│                                                                  │
│  9. BUILT INTO THE ECOSYSTEM                                     │
│     Connected to Learn module, Mock Interviews, Projects.       │
│     Practice what you learned. Interview what you practiced.     │
│                                                                  │
│  10. ACTUALLY AFFORDABLE                                         │
│      STT + TTS approach costs 90% less than conversational      │
│      agents. We can offer this to every user.                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

> **Next Steps:** Read the module-specific blueprints:
> - `01-DSA-PRACTICE-BLUEPRINT.md` — Complete DSA workspace design
> - `02-SYSTEM-DESIGN-PRACTICE-BLUEPRINT.md` — Excalidraw + AI architecture review
> - `03-WEB-DEV-PRACTICE-BLUEPRINT.md` — Frontend & Backend coding workspaces
> - `04-SHARED-COMPONENTS-TECHNICAL-SPEC.md` — AI Chat, Voice, Layout components