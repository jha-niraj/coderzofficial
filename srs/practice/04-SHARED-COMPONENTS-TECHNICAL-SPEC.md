# 🔧 Shared Components & Technical Specification

> **Purpose:** Every Practice module (DSA, System Design, Web Dev) shares a common set of components. This document defines their interfaces, implementation details, and how they compose together.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [File Structure](#2-file-structure)
3. [Practice Layout Shell](#3-practice-layout-shell)
4. [Practice Sidebar](#4-practice-sidebar)
5. [AI Mentor Chat Panel](#5-ai-mentor-chat-panel)
6. [Voice Toggle (STT + TTS)](#6-voice-toggle-stt--tts)
7. [Run & Assess Engine](#7-run--assess-engine)
8. [Progress Tracker](#8-progress-tracker)
9. [Practice Store (Zustand)](#9-practice-store-zustand)
10. [Database Schema (Complete)](#10-database-schema-complete)
11. [API Routes](#11-api-routes)
12. [Extending MarkdownRenderer for Mermaid](#12-extending-markdownrenderer-for-mermaid)
13. [Component Dependency Map](#13-component-dependency-map)
14. [Implementation Checklist](#14-implementation-checklist)

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     SHARED COMPONENT ARCHITECTURE                        │
│                                                                          │
│                      ┌─────────────────────┐                            │
│                      │  PracticeLayoutShell │ ◀── Wraps ALL modules     │
│                      └──────────┬──────────┘                            │
│                                 │                                        │
│          ┌──────────────────────┼────────────────────────┐              │
│          │                      │                        │              │
│          ▼                      ▼                        ▼              │
│  ┌──────────────┐  ┌───────────────────────┐  ┌──────────────────┐    │
│  │ PracticeSide │  │  Module-Specific       │  │ AIMentorPanel    │    │
│  │ bar          │  │  Center Panel          │  │                  │    │
│  │              │  │                        │  │  ┌────────────┐  │    │
│  │  Categories  │  │  DSA → CodeEditor      │  │  │ ChatHistory│  │    │
│  │  Problems    │  │  SD  → Excalidraw      │  │  │            │  │    │
│  │  Progress    │  │  Web → Editor+Preview  │  │  ├────────────┤  │    │
│  │  Search      │  │       OR Editor+Tester │  │  │VoiceToggle │  │    │
│  │              │  │                        │  │  ├────────────┤  │    │
│  │  (Shared)    │  │  (Module-specific)     │  │  │ InputBar   │  │    │
│  └──────────────┘  └───────────────────────┘  │  └────────────┘  │    │
│                                                │  (Shared)        │    │
│                                                └──────────────────┘    │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     SHARED UTILITIES                              │   │
│  │                                                                   │   │
│  │  usePracticeStore (Zustand)    RunAndAssess Engine                │   │
│  │  MarkdownRenderer + Mermaid    VoiceManager (STT+TTS)            │   │
│  │  ProgressTracker               Timer                              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### What's Shared vs Module-Specific

| Component | Shared? | Notes |
|-----------|---------|-------|
| `PracticeLayoutShell` | ✅ | Three/four panel resizable container |
| `PracticeSidebar` | ✅ | Categories + problems list (data differs per module) |
| `AIMentorPanel` | ✅ | Chat + Voice + Input (prompts differ per module) |
| `VoiceToggle` | ✅ | STT + TTS pipeline (same across all modules) |
| `RunAndAssess` | ✅ | Button + loading state (payload differs per module) |
| `ProgressTracker` | ✅ | XP, streaks, requirements checklist |
| `PracticeStore` | ✅ | Zustand store for session state |
| `CodeEditor` | ❌ | Reuse existing, but config differs per module |
| `ExcalidrawCanvas` | ❌ | SD only |
| `LivePreview` | ❌ | Frontend Web Dev only |
| `APITester` | ❌ | Backend Web Dev only |
| `ProblemPanel` | Partial | Structure shared, content/fields differ |

---

## 2. File Structure

```
apps/main/
├── app/(main)/mock/practice/
│   ├── page.tsx                          # Practice landing (module picker)
│   ├── layout.tsx                        # Practice layout with sidebar
│   │
│   ├── dsa/
│   │   ├── page.tsx                      # DSA category list
│   │   └── [slug]/
│   │       └── page.tsx                  # DSA workspace
│   │
│   ├── sd/
│   │   ├── page.tsx                      # SD category list
│   │   └── [slug]/
│   │       └── page.tsx                  # SD workspace
│   │
│   └── web/
│       ├── page.tsx                      # Web track picker (FE/BE)
│       ├── frontend/
│       │   ├── page.tsx                  # Frontend category list
│       │   └── [slug]/
│       │       └── page.tsx              # Frontend workspace
│       └── backend/
│           ├── page.tsx                  # Backend category list
│           └── [slug]/
│               └── page.tsx              # Backend workspace
│
├── app/(main)/mock/practice/_components/
│   │
│   │  # ── SHARED (used by ALL modules) ──
│   ├── practice-layout-shell.tsx         # Resizable panel container
│   ├── practice-sidebar.tsx              # Category/problem sidebar
│   ├── ai-mentor-panel.tsx               # Chat panel + voice + input
│   ├── voice-toggle.tsx                  # STT + TTS toggle button
│   ├── run-and-assess-button.tsx         # The assessment trigger
│   ├── progress-tracker.tsx              # XP bar, requirements checklist
│   ├── problem-panel.tsx                 # Left panel (problem description)
│   ├── mode-selector.tsx                 # Exam / Assist mode toggle
│   ├── timer.tsx                         # Session timer
│   │
│   │  # ── DSA-SPECIFIC ──
│   ├── dsa/
│   │   ├── dsa-workspace.tsx             # Code editor + Monaco config
│   │   └── dsa-problem-panel.tsx         # DSA-specific fields
│   │
│   │  # ── SD-SPECIFIC ──
│   ├── sd/
│   │   ├── sd-workspace.tsx              # Excalidraw canvas
│   │   ├── sd-component-library.tsx      # Draggable SD elements
│   │   └── sd-problem-panel.tsx          # Requirements + constraints
│   │
│   │  # ── WEB-SPECIFIC ──
│   └── web/
│       ├── frontend-workspace.tsx        # Code editor + live preview
│       ├── backend-workspace.tsx         # Code editor + API tester
│       ├── live-preview.tsx              # Sandboxed iframe renderer
│       └── api-tester.tsx                # Test case display panel
│
├── app/store/
│   └── practiceStore.ts                  # Zustand store
│
├── actions/(main)/practice/
│   ├── assess.action.ts                  # Run & Assess server action
│   ├── session.action.ts                 # Session management
│   ├── progress.action.ts               # Progress tracking
│   └── voice-token.action.ts            # ElevenLabs token generator
│
└── components/common/
    └── markdown-renderer.tsx             # EXTEND with Mermaid support
```

---

## 3. Practice Layout Shell

The layout shell is the outermost container for every practice workspace. It manages the resizable panels.

### Interface

```typescript
// practice-layout-shell.tsx

import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@repo/ui/components/ui/resizable";
// NOTE: shadcn has a built-in Resizable component based on react-resizable-panels.
// Check if it's already installed: npx shadcn@latest add resizable

interface PracticeLayoutShellProps {
  /** Which module is active */
  module: "dsa" | "sd" | "web-frontend" | "web-backend";
  /** Problem title for the header */
  problemTitle: string;
  /** Current category path for breadcrumb */
  breadcrumb: string;
  /** The left panel content (problem description) */
  problemPanel: React.ReactNode;
  /** The center panel content (editor, canvas, or editor+preview) */
  workspacePanel: React.ReactNode;
  /** Optional: secondary center panel (live preview for frontend) */
  secondaryPanel?: React.ReactNode;
  /** The right panel content (AI mentor chat) */
  mentorPanel: React.ReactNode;
  /** Voice state */
  voiceEnabled: boolean;
  onVoiceToggle: () => void;
  /** Timer */
  timerStarted: boolean;
  elapsedSeconds: number;
}
```

### Layout Configurations per Module

```
┌──────────────────────────────────────────────────────────────────┐
│  DSA LAYOUT (3 panels)                                           │
│                                                                  │
│  ┌──────────┬───────────────────────┬─────────────────────┐     │
│  │ Problem  │ Code Editor (Monaco)  │ AI Mentor Chat      │     │
│  │  20%     │       50%             │      30%            │     │
│  └──────────┴───────────────────────┴─────────────────────┘     │
│                                                                  │
│  SYSTEM DESIGN LAYOUT (3 panels)                                │
│                                                                  │
│  ┌──────────┬───────────────────────┬─────────────────────┐     │
│  │ Problem  │ Excalidraw Canvas     │ AI Mentor Chat      │     │
│  │  20%     │       50%             │      30%            │     │
│  └──────────┴───────────────────────┴─────────────────────┘     │
│                                                                  │
│  FRONTEND WEB LAYOUT (4 panels)                                 │
│                                                                  │
│  ┌──────────┬──────────┬──────────┬───────────────────────┐     │
│  │ Problem  │  Code    │   Live   │ AI Mentor Chat        │     │
│  │  15%     │ Editor   │ Preview  │      25%              │     │
│  │          │  30%     │  30%     │                       │     │
│  └──────────┴──────────┴──────────┴───────────────────────┘     │
│                                                                  │
│  BACKEND WEB LAYOUT (3 panels, right panel has tabs)            │
│                                                                  │
│  ┌──────────┬───────────────────────┬─────────────────────┐     │
│  │ Problem  │ Code Editor           │ AI Mentor Chat      │     │
│  │  20%     │       50%             │ + API Tester tabs   │     │
│  │          │                       │      30%            │     │
│  └──────────┴───────────────────────┴─────────────────────┘     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Usage Example

```tsx
// app/(main)/mock/practice/dsa/[slug]/page.tsx

import { PracticeLayoutShell } from "../../_components/practice-layout-shell";
import { DSAProblemPanel } from "../../_components/dsa/dsa-problem-panel";
import { DSAWorkspace } from "../../_components/dsa/dsa-workspace";
import { AIMentorPanel } from "../../_components/ai-mentor-panel";

export default function DSAProblemPage({ params }: { params: { slug: string } }) {
  // Fetch problem data...
  
  return (
    <PracticeLayoutShell
      module="dsa"
      problemTitle={problem.title}
      breadcrumb={`DSA › ${problem.category} › ${problem.title}`}
      problemPanel={<DSAProblemPanel problem={problem} />}
      workspacePanel={<DSAWorkspace problem={problem} />}
      mentorPanel={<AIMentorPanel module="dsa" problem={problem} />}
      voiceEnabled={voiceEnabled}
      onVoiceToggle={handleVoiceToggle}
      timerStarted={timerStarted}
      elapsedSeconds={elapsedSeconds}
    />
  );
}
```

---

## 4. Practice Sidebar

Based on the existing `learn-sidebar.tsx` pattern (expandable categories, search, icons), adapted for practice modules.

### Interface

```typescript
// practice-sidebar.tsx

interface PracticeSidebarCategory {
  id: string;
  name: string;
  icon: React.ReactNode;      // Lucide icon or emoji
  problemCount: number;
  completedCount: number;
  problems: PracticeSidebarProblem[];
}

interface PracticeSidebarProblem {
  slug: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  status: "not-started" | "in-progress" | "completed";
  bestScore?: number;          // 0-100 for DSA/Web, 0-10 for SD
}

interface PracticeSidebarProps {
  /** Active module for routing */
  module: "dsa" | "sd" | "web-frontend" | "web-backend";
  /** Categories with problems */
  categories: PracticeSidebarCategory[];
  /** Currently active problem slug */
  activeSlug?: string;
  /** User's overall module progress */
  moduleProgress: {
    totalProblems: number;
    completed: number;
    inProgress: number;
  };
}
```

### Wireframe

```
┌────────────────────────────┐
│ 🔍 Search problems...      │
├────────────────────────────┤
│                             │
│ Progress: ████░░░░ 12/40   │
│                             │
├────────────────────────────┤
│                             │
│ ▸ 📊 Arrays & Hashing (12) │
│   ├── Two Sum        🟢 E  │ ← Green dot = completed
│   ├── Group Anagrams 🟡 M  │ ← Yellow dot = in progress
│   ├── Top K Elements ⚪ M  │ ← Empty = not started
│   └── ... 9 more           │
│                             │
│ ▾ 🎯 Two Pointers (8)      │ ← Expanded
│   ├── Valid Palindrome 🟢 E │
│   ├── Three Sum      ⚪ M  │ ← Active (highlighted)
│   ├── Container Water ⚪ M  │
│   ├── Trapping Rain  ⚪ H  │
│   └── ... 4 more           │
│                             │
│ ▸ 🪟 Sliding Window (6)    │
│ ▸ 📚 Stack (7)             │
│ ▸ 🔗 Linked List (6)       │
│ ▸ 🌳 Trees (8)             │
│                             │
├────────────────────────────┤
│ Filter: [All] [Easy]       │
│         [Medium] [Hard]     │
└────────────────────────────┘
```

### Implementation Notes

- Follows the same expand/collapse pattern as `learn-sidebar.tsx`
- Uses `useRouter()` to navigate: `/mock/practice/dsa/${slug}`
- Difficulty badge colors: Easy=green, Medium=yellow, Hard=red
- Status tracking from database, updated on session completion
- Search filters by problem title (client-side)
- Difficulty filter using toggle buttons

---

## 5. AI Mentor Chat Panel

This is the most critical shared component. It handles chat messages, streaming AI responses, Mermaid rendering, and integrates with the Voice Toggle.

### Interface

```typescript
// ai-mentor-panel.tsx

interface AIMentorMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  /** If this message is an assessment result */
  isAssessment?: boolean;
  /** Mermaid diagrams detected in content (rendered inline) */
  hasMermaid?: boolean;
}

interface AIMentorPanelProps {
  /** Which module for system prompt selection */
  module: "dsa" | "sd" | "web-frontend" | "web-backend";
  /** Problem data for context */
  problem: {
    title: string;
    description: string;
    requirements: string[];
    difficulty: string;
    category: string;
    hints?: string[];
  };
  /** Current mode */
  mode: "exam" | "assist";
  /** Current user code/canvas (for sending with assessment) */
  getCurrentWork: () => string | object;
  /** Session messages */
  messages: AIMentorMessage[];
  onSendMessage: (content: string) => void;
  /** Voice state */
  voiceEnabled: boolean;
  onVoiceToggle: () => void;
  /** Assessment loading state */
  isAssessing: boolean;
}
```

### How It Differs from Existing `aichat.tsx`

```
┌──────────────────────────────────────────────────────────────────┐
│                  EXISTING vs PRACTICE AI CHAT                    │
│                                                                  │
│  EXISTING (aichat.tsx):            PRACTICE (ai-mentor-panel):  │
│  ├── Global floating sidebar       ├── Embedded in layout       │
│  ├── General Q&A about platform    ├── Problem-specific context │
│  ├── No code awareness             ├── Receives user's code     │
│  ├── Simple text responses         ├── Mermaid diagrams inline  │
│  ├── Slash commands                ├── No slash commands        │
│  ├── Generic system prompt         ├── Module-specific prompt   │
│  ├── No voice integration          ├── Voice toggle built-in    │
│  └── Hides on studio/space pages   └── Only shows in practice  │
│                                                                  │
│  DECISION: Build a NEW component. Don't extend aichat.tsx.      │
│  The requirements are too different. Share MarkdownRenderer.    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Panel Wireframe

```
┌─────────────────────────────────────┐
│  🤖 AI Mentor    [Exam ▾]  [🔊]    │ ← Mode selector + Voice toggle
├─────────────────────────────────────┤
│                                      │
│  ┌────────────────────────────────┐  │
│  │ 🤖 Welcome! You're working on │  │ ← AI greeting
│  │ "Two Sum". This is a classic   │  │
│  │ problem. Think about what data │  │
│  │ structure gives you O(1)       │  │
│  │ lookups...                     │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ 👤 I used a nested loop to     │  │ ← User message
│  │ check all pairs                │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ 🤖 Assessment — Attempt 1     │  │ ← Assessment result
│  │                                │  │    (special styling)
│  │ ✅ Correct approach            │  │
│  │ ⚠️ O(n²) — Can be optimized   │  │
│  │                                │  │
│  │ ```mermaid                     │  │ ← Mermaid rendered inline
│  │ graph LR                       │  │
│  │   A[Brute Force O(n²)]        │  │
│  │   B[HashMap O(n)]             │  │
│  │ ```                            │  │
│  │                                │  │
│  │ 💭 What if you could remember │  │
│  │ numbers you've already seen?  │  │
│  └────────────────────────────────┘  │
│                                      │
│                                      │
│  ───────────────────────────────── │
│  [▶ Run & Assess]                   │ ← Run & Assess button
│  ───────────────────────────────── │
│                                      │
│  ┌──────────────────────────┐ [🎤]  │ ← Input bar + mic button
│  │ Type or speak...         │ [➤]   │
│  └──────────────────────────┘       │
│                                      │
└─────────────────────────────────────┘
```

### Streaming Pattern

The AI Mentor uses the same streaming approach as OpenAI's API but with practice-specific system prompts:

```typescript
// actions/(main)/practice/assess.action.ts

"use server";

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AssessPayload {
  module: "dsa" | "sd" | "web-frontend" | "web-backend";
  problem: {
    title: string;
    description: string;
    requirements: string[];
    difficulty: string;
    hints: string[];
  };
  userWork: string;           // code string (DSA/Web) or canvas JSON (SD)
  mode: "exam" | "assist";
  attemptNumber: number;
  previousFeedback?: string;  // AI's last response (for continuity)
  conversationHistory: { role: "user" | "assistant"; content: string }[];
}

export async function assessPracticeWork(payload: AssessPayload) {
  const systemPrompt = getSystemPrompt(payload.module, payload.mode);
  
  const contextMessage = buildContextMessage(payload);
  
  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...payload.conversationHistory.slice(-10), // last 10 messages for context
    { role: "user" as const, content: contextMessage },
  ];

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 2000,
  });

  // Return as ReadableStream for client-side streaming
  return stream;
}

function buildContextMessage(payload: AssessPayload): string {
  return `
## Assessment Request — Attempt ${payload.attemptNumber}

**Problem:** ${payload.problem.title}
**Difficulty:** ${payload.problem.difficulty}
**Mode:** ${payload.mode}

**Requirements:**
${payload.problem.requirements.map((r, i) => `${i + 1}. ${r}`).join("\n")}

**User's Code/Work:**
\`\`\`
${typeof payload.userWork === "string" ? payload.userWork : JSON.stringify(payload.userWork, null, 2)}
\`\`\`

${payload.previousFeedback ? `**Previous Feedback Summary:** ${payload.previousFeedback}` : ""}

Please analyze this work and provide feedback following your instructions.
  `.trim();
}
```

---

## 6. Voice Toggle (STT + TTS)

### Architecture Decision: NOT a Conversational Agent

```
┌──────────────────────────────────────────────────────────────────┐
│              VOICE ARCHITECTURE DECISION                         │
│                                                                  │
│  ❌ REJECTED: ElevenLabs Conversational Agent                   │
│     • $0.10/minute — too expensive at scale                     │
│     • Agent tries to "converse" — wrong for code review         │
│     • User interruptions break the flow                         │
│     • Can't integrate custom OpenAI prompts easily              │
│                                                                  │
│  ✅ CHOSEN: Scribe v2 (STT) + GPT-4o + Flash v2.5 (TTS)       │
│     • STT: ~$0.01/min, TTS: ~$0.01/min → 10x cheaper          │
│     • Full control over AI prompts and context                  │
│     • Same text pipeline as typed messages                      │
│     • Voice is just an I/O layer, not a separate system        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### STT + TTS Pipeline

```
┌──────────────────────────────────────────────────────────────────┐
│                     VOICE PIPELINE                               │
│                                                                  │
│  USER SPEAKS                                                    │
│  ┌─────────┐     ┌────────────────┐     ┌──────────────┐       │
│  │ Browser  │────▶│ ElevenLabs     │────▶│ Transcribed  │       │
│  │ MediaRec │     │ Scribe v2 STT  │     │ Text         │       │
│  │ order    │     │ (WebSocket)    │     │              │       │
│  └─────────┘     └────────────────┘     └──────┬───────┘       │
│                                                 │               │
│                                                 ▼               │
│                    ┌───────────────────────────────────┐        │
│                    │ Same pipeline as typed messages:  │        │
│                    │                                   │        │
│                    │  Text → OpenAI GPT-4o             │        │
│                    │  (with problem context,           │        │
│                    │   user code, conversation          │        │
│                    │   history)                         │        │
│                    │                                   │        │
│                    │  Response streams back...         │        │
│                    └─────────────┬─────────────────────┘        │
│                                  │                               │
│                                  ▼                               │
│  AI SPEAKS BACK                                                 │
│  ┌──────────────┐     ┌────────────────┐     ┌──────────┐      │
│  │ Streamed     │────▶│ ElevenLabs     │────▶│ Browser  │      │
│  │ Text chunks  │     │ Flash v2.5 TTS │     │ Audio    │      │
│  │              │     │ (REST API)     │     │ playback │      │
│  └──────────────┘     └────────────────┘     └──────────┘      │
│                                                                  │
│  Latency budget:                                                │
│  STT: ~150ms + GPT-4o: ~800ms + TTS: ~75ms = ~1 second total  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Interface

```typescript
// voice-toggle.tsx

interface VoiceToggleProps {
  /** Whether voice is enabled */
  enabled: boolean;
  /** Toggle callback */
  onToggle: () => void;
  /** Called when STT produces text */
  onTranscript: (text: string) => void;
  /** Text to speak via TTS (set by parent when AI responds) */
  textToSpeak?: string;
  /** Whether AI is currently speaking */
  isSpeaking: boolean;
}

// Internal state machine
type VoiceState = 
  | "off"           // Voice disabled
  | "idle"          // Voice enabled, waiting for user to speak
  | "listening"     // Recording user's voice
  | "transcribing"  // Sending audio to Scribe v2
  | "speaking";     // Playing TTS audio
```

### Relationship to Existing `voice.tsx`

```
┌──────────────────────────────────────────────────────────────────┐
│             EXISTING vs NEW VOICE COMPONENT                      │
│                                                                  │
│  EXISTING (voice.tsx):                                          │
│  • Uses ElevenLabs Conversational Agent (full agent mode)       │
│  • Has Orb visualization                                        │
│  • Full dialog with start/end call buttons                     │
│  • Used for mock interviews                                     │
│  • 392 lines, tightly coupled to interview flow                │
│                                                                  │
│  NEW (voice-toggle.tsx):                                        │
│  • Uses Scribe v2 (STT only) + Flash v2.5 (TTS only)          │
│  • Small toggle button, no dialog                              │
│  • Push-to-talk or voice-activity-detection                    │
│  • Used for practice module only                               │
│  • ~150 lines, lightweight                                      │
│                                                                  │
│  REUSE: We can reuse the `getElevenLabsToken` server action    │
│  from the existing setup. The token endpoint is the same.      │
│  But the client-side component is completely different.         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### ElevenLabs API Calls

```typescript
// STT via Scribe v2 — WebSocket for streaming
const sttSocket = new WebSocket(
  `wss://api.elevenlabs.io/v1/speech-to-text/stream?model_id=scribe_v2`
);
sttSocket.onopen = () => {
  sttSocket.send(JSON.stringify({
    type: "config",
    data: {
      language_code: "en",      // or "auto" for multilingual
      encoding: "pcm_16000",    // 16kHz PCM from MediaRecorder
    }
  }));
};

// Send audio chunks as they come from MediaRecorder
mediaRecorder.ondataavailable = (event) => {
  sttSocket.send(event.data);  // Binary audio chunk
};

// Receive transcription
sttSocket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "transcript" && data.data.is_final) {
    onTranscript(data.data.text);  // Send to parent for AI processing
  }
};


// TTS via Flash v2.5 — REST API with streaming
async function speakText(text: string) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_flash_v2_5",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );
  
  // Stream audio chunks to AudioContext for playback
  const reader = response.body?.getReader();
  // ... pipe to Web Audio API
}
```

---

## 7. Run & Assess Engine

The "Run & Assess" button is the core interaction. It's shared across all modules but sends different payloads.

### State Machine

```
┌──────────────────────────────────────────────────────────────────┐
│                 RUN & ASSESS STATE MACHINE                       │
│                                                                  │
│                    ┌──────────┐                                  │
│                    │   IDLE   │ ◀──────────────────────┐        │
│                    └────┬─────┘                        │        │
│                         │                              │        │
│                    User clicks                    Response      │
│                    [▶ Run & Assess]              complete       │
│                         │                              │        │
│                         ▼                              │        │
│                    ┌──────────────┐                    │        │
│                    │  COLLECTING  │                    │        │
│                    │  USER WORK   │                    │        │
│                    └────┬────────┘                    │        │
│                         │                              │        │
│                    Gather code/                        │        │
│                    canvas data                         │        │
│                         │                              │        │
│                         ▼                              │        │
│                    ┌──────────────┐                    │        │
│                    │  SENDING TO  │                    │        │
│                    │  AI (GPT-4o) │                    │        │
│                    └────┬────────┘                    │        │
│                         │                              │        │
│                    Streaming...                        │        │
│                         │                              │        │
│                         ▼                              │        │
│                    ┌──────────────┐                    │        │
│                    │  STREAMING   │────────────────────┘        │
│                    │  RESPONSE    │                              │
│                    └──────────────┘                              │
│                                                                  │
│  Button states:                                                 │
│  IDLE       → [▶ Run & Assess]  (green, clickable)             │
│  COLLECTING → [📋 Preparing...] (gray, disabled)                │
│  SENDING    → [🔄 Analyzing...] (yellow, animated)              │
│  STREAMING  → [✍️ Writing...]   (blue, animated)                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Interface

```typescript
// run-and-assess-button.tsx

interface RunAndAssessButtonProps {
  /** Current state */
  state: "idle" | "collecting" | "sending" | "streaming";
  /** Click handler */
  onAssess: () => void;
  /** Current attempt number */
  attemptNumber: number;
  /** Max attempts in exam mode */
  maxAttempts?: number;
  /** Disabled state */
  disabled?: boolean;
}
```

### Payload Per Module

```typescript
// What gets sent to GPT-4o depends on the module:

// DSA Payload
interface DSAAssessPayload {
  code: string;                    // From Monaco editor
  language: string;                // "javascript" | "python" | etc.
  problem: DSAProblem;
  attemptNumber: number;
  mode: "exam" | "assist";
}

// System Design Payload
interface SDAssessPayload {
  canvasData: ExcalidrawElement[];  // From Excalidraw
  extractedComponents: string[];    // Parsed from canvas
  extractedConnections: string[];   // Parsed from canvas
  problem: SDProblem;
  attemptNumber: number;
  mode: "exam" | "assist";
}

// Frontend Web Payload
interface FrontendAssessPayload {
  jsxCode: string;                 // From Monaco editor
  cssCode: string;                 // From Monaco editor
  problem: WebProblem;
  attemptNumber: number;
  mode: "exam" | "assist";
}

// Backend Web Payload
interface BackendAssessPayload {
  code: string;                    // From Monaco editor
  language: string;                // Usually "javascript" or "typescript"
  problem: WebProblem;
  attemptNumber: number;
  mode: "exam" | "assist";
}
```

---

## 8. Progress Tracker

### Interface

```typescript
// progress-tracker.tsx

interface RequirementStatus {
  id: string;
  text: string;
  met: boolean;
  /** Partially met — show as yellow */
  partial?: boolean;
}

interface ProgressTrackerProps {
  /** Problem requirements and their completion status */
  requirements: RequirementStatus[];
  /** Current attempt */
  attemptNumber: number;
  /** Best score so far (updated after each assessment) */
  bestScore?: number;
  /** XP earned this session */
  xpEarned: number;
  /** Time elapsed */
  elapsedSeconds: number;
}
```

### Wireframe

```
┌─────────────────────────────────────┐
│  📊 Progress                         │
│                                      │
│  Attempt: 2/5 (Exam)                │
│  Best Score: 65/100                  │
│  Time: 12:34                         │
│  XP Earned: +25                      │
│                                      │
│  Requirements:                       │
│  ✅ Correct algorithm approach       │
│  ✅ Handles edge cases               │
│  🟡 Partially optimized (O(n log n))│
│  ❌ Space complexity not optimal     │
│  ❌ Missing input validation         │
│                                      │
└─────────────────────────────────────┘
```

---

## 9. Practice Store (Zustand)

Following the existing pattern in `studioStore.ts`:

```typescript
// app/store/practiceStore.ts

"use client";

import { create } from "zustand";

// ==========================================
// TYPES
// ==========================================

interface PracticeMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isAssessment?: boolean;
}

interface RequirementStatus {
  id: string;
  text: string;
  met: boolean;
  partial?: boolean;
}

type PracticeModule = "dsa" | "sd" | "web-frontend" | "web-backend";
type PracticeMode = "exam" | "assist";
type AssessState = "idle" | "collecting" | "sending" | "streaming";
type VoiceState = "off" | "idle" | "listening" | "transcribing" | "speaking";

// ==========================================
// STORE
// ==========================================

interface PracticeStoreState {
  // ── Session Identity ──
  sessionId: string | null;
  module: PracticeModule | null;
  problemSlug: string | null;
  mode: PracticeMode;

  // ── User Work ──
  code: string;                    // DSA, Web
  language: string;                // DSA, Web
  canvasData: object | null;       // SD only
  cssCode: string;                 // Frontend Web only

  // ── Assessment ──
  assessState: AssessState;
  attemptNumber: number;
  maxAttempts: number;             // Exam mode limit
  bestScore: number;
  requirements: RequirementStatus[];

  // ── Chat ──
  messages: PracticeMessage[];
  isStreaming: boolean;

  // ── Voice ──
  voiceState: VoiceState;
  voiceEnabled: boolean;

  // ── Timer ──
  timerStarted: boolean;
  startTime: Date | null;
  elapsedSeconds: number;

  // ── Progress ──
  xpEarned: number;

  // ── Actions: Initialize ──
  initSession: (params: {
    module: PracticeModule;
    problemSlug: string;
    mode: PracticeMode;
    requirements: RequirementStatus[];
    maxAttempts?: number;
  }) => void;
  resetSession: () => void;

  // ── Actions: Code/Canvas ──
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setCssCode: (css: string) => void;
  setCanvasData: (data: object) => void;

  // ── Actions: Assessment ──
  setAssessState: (state: AssessState) => void;
  incrementAttempt: () => void;
  updateScore: (score: number) => void;
  updateRequirement: (id: string, met: boolean, partial?: boolean) => void;

  // ── Actions: Chat ──
  addMessage: (message: Omit<PracticeMessage, "id" | "timestamp">) => void;
  setIsStreaming: (streaming: boolean) => void;
  appendToLastMessage: (chunk: string) => void;

  // ── Actions: Voice ──
  setVoiceEnabled: (enabled: boolean) => void;
  setVoiceState: (state: VoiceState) => void;

  // ── Actions: Timer ──
  startTimer: () => void;
  updateElapsed: (seconds: number) => void;

  // ── Actions: XP ──
  addXP: (amount: number) => void;
}

export const usePracticeStore = create<PracticeStoreState>((set, get) => ({
  // Initial state
  sessionId: null,
  module: null,
  problemSlug: null,
  mode: "assist",

  code: "",
  language: "javascript",
  canvasData: null,
  cssCode: "",

  assessState: "idle",
  attemptNumber: 0,
  maxAttempts: 5,
  bestScore: 0,
  requirements: [],

  messages: [],
  isStreaming: false,

  voiceState: "off",
  voiceEnabled: false,

  timerStarted: false,
  startTime: null,
  elapsedSeconds: 0,

  xpEarned: 0,

  // Actions
  initSession: (params) => set({
    sessionId: crypto.randomUUID(),
    module: params.module,
    problemSlug: params.problemSlug,
    mode: params.mode,
    requirements: params.requirements,
    maxAttempts: params.maxAttempts ?? 5,
    attemptNumber: 0,
    bestScore: 0,
    messages: [],
    code: "",
    cssCode: "",
    canvasData: null,
    xpEarned: 0,
    assessState: "idle",
    timerStarted: false,
    elapsedSeconds: 0,
  }),

  resetSession: () => set({
    sessionId: null,
    module: null,
    problemSlug: null,
    mode: "assist",
    code: "",
    language: "javascript",
    canvasData: null,
    cssCode: "",
    assessState: "idle",
    attemptNumber: 0,
    bestScore: 0,
    requirements: [],
    messages: [],
    isStreaming: false,
    voiceState: "off",
    voiceEnabled: false,
    timerStarted: false,
    startTime: null,
    elapsedSeconds: 0,
    xpEarned: 0,
  }),

  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setCssCode: (css) => set({ cssCode: css }),
  setCanvasData: (data) => set({ canvasData: data }),

  setAssessState: (state) => set({ assessState: state }),
  incrementAttempt: () => set((s) => ({ attemptNumber: s.attemptNumber + 1 })),
  updateScore: (score) => set((s) => ({
    bestScore: Math.max(s.bestScore, score),
  })),
  updateRequirement: (id, met, partial) => set((s) => ({
    requirements: s.requirements.map((r) =>
      r.id === id ? { ...r, met, partial } : r
    ),
  })),

  addMessage: (msg) => set((s) => ({
    messages: [
      ...s.messages,
      { ...msg, id: crypto.randomUUID(), timestamp: new Date() },
    ],
  })),
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  appendToLastMessage: (chunk) => set((s) => {
    const msgs = [...s.messages];
    if (msgs.length > 0 && msgs[msgs.length - 1]!.role === "assistant") {
      msgs[msgs.length - 1] = {
        ...msgs[msgs.length - 1]!,
        content: msgs[msgs.length - 1]!.content + chunk,
      };
    }
    return { messages: msgs };
  }),

  setVoiceEnabled: (enabled) => set({
    voiceEnabled: enabled,
    voiceState: enabled ? "idle" : "off",
  }),
  setVoiceState: (state) => set({ voiceState: state }),

  startTimer: () => set({ timerStarted: true, startTime: new Date() }),
  updateElapsed: (seconds) => set({ elapsedSeconds: seconds }),

  addXP: (amount) => set((s) => ({ xpEarned: s.xpEarned + amount })),
}));
```

---

## 10. Database Schema (Complete)

This extends what was defined in the DSA blueprint to cover all modules:

```prisma
// packages/prisma/schema.prisma (additions)

// ── Enums ──

enum PracticeModule {
  DSA
  SYSTEM_DESIGN
  WEB_FRONTEND
  WEB_BACKEND
}

enum PracticeDifficulty {
  EASY
  MEDIUM
  HARD
}

enum PracticeStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
}

enum PracticeMode {
  EXAM
  ASSIST
}

// ── Problem Bank ──

model PracticeProblem {
  id            String              @id @default(cuid())
  slug          String              @unique
  title         String
  description   String              @db.Text
  module        PracticeModule
  category      String              // "Arrays & Hashing", "REST APIs", etc.
  difficulty    PracticeDifficulty
  requirements  String[]            // What needs to be accomplished
  hints         String[]            // Progressive hints
  starterCode   String?             @db.Text   // DSA/Web only
  starterCss    String?             @db.Text   // Frontend Web only
  testCases     Json?               // Backend Web: API test scenarios
  componentLib  Json?               // SD: which components are relevant
  tags          String[]            // For search/filtering
  order         Int                 @default(0)  // Sort order within category
  isActive      Boolean             @default(true)

  sessions      PracticeSession[]

  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  @@index([module, category])
  @@index([module, difficulty])
}

// ── User Sessions ──

model PracticeSession {
  id            String              @id @default(cuid())
  userId        String
  problemId     String
  problem       PracticeProblem     @relation(fields: [problemId], references: [id])
  user          User                @relation(fields: [userId], references: [id])

  module        PracticeModule
  mode          PracticeMode
  status        PracticeStatus      @default(IN_PROGRESS)

  // Work snapshot
  code          String?             @db.Text
  cssCode       String?             @db.Text
  canvasData    Json?
  language      String?

  // Assessment
  attempts      Int                 @default(0)
  bestScore     Int                 @default(0)   // 0-100
  lastFeedback  String?             @db.Text

  // Requirements tracking
  requirementsMet Json?             // { reqId: boolean }

  // Timing
  totalTimeSeconds Int              @default(0)
  startedAt     DateTime            @default(now())
  completedAt   DateTime?

  // Voice usage
  voiceUsed     Boolean             @default(false)

  // Chat history (stored for resume)
  chatHistory   Json?               // Array of messages

  // XP awarded
  xpAwarded     Int                 @default(0)

  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  @@index([userId, module])
  @@index([userId, problemId])
  @@unique([userId, problemId, mode])  // One session per user per problem per mode
}

// ── User Progress (Aggregated) ──

model PracticeProgress {
  id            String              @id @default(cuid())
  userId        String
  user          User                @relation(fields: [userId], references: [id])
  module        PracticeModule

  totalProblems   Int               @default(0)
  completed       Int               @default(0)
  inProgress      Int               @default(0)
  totalXP         Int               @default(0)
  currentStreak   Int               @default(0)
  longestStreak   Int               @default(0)
  lastPracticedAt DateTime?

  // Per-difficulty breakdown
  easyCompleted   Int               @default(0)
  mediumCompleted Int               @default(0)
  hardCompleted   Int               @default(0)

  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  @@unique([userId, module])
}
```

### Entity Relationship

```
┌──────────────────────────────────────────────────────────────────┐
│                    DATABASE RELATIONSHIPS                         │
│                                                                  │
│  User ─────────┐                                                │
│                 │                                                │
│                 ├──▶ PracticeSession (many)                      │
│                 │      ├── problemId → PracticeProblem           │
│                 │      ├── code/canvasData (work snapshot)       │
│                 │      ├── chatHistory (JSON)                    │
│                 │      └── bestScore, attempts                   │
│                 │                                                │
│                 └──▶ PracticeProgress (one per module)           │
│                        ├── DSA progress                          │
│                        ├── SYSTEM_DESIGN progress                │
│                        ├── WEB_FRONTEND progress                 │
│                        └── WEB_BACKEND progress                  │
│                                                                  │
│  PracticeProblem                                                 │
│    ├── slug (unique) → used in URL                              │
│    ├── module → which practice track                            │
│    ├── category → sidebar grouping                              │
│    ├── requirements[] → checklist items                         │
│    ├── starterCode → pre-filled editor                          │
│    └── sessions[] → all user sessions for this problem          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 11. API Routes

### Server Actions

```
┌──────────────────────────────────────────────────────────────────┐
│                    SERVER ACTIONS                                 │
│                                                                  │
│  actions/(main)/practice/                                       │
│                                                                  │
│  assess.action.ts                                               │
│  ├── assessPracticeWork(payload)                                │
│  │   → Sends code + problem to GPT-4o                          │
│  │   → Returns streaming response                              │
│  │   → Updates session in DB                                   │
│  │                                                              │
│  session.action.ts                                              │
│  ├── startSession(userId, problemSlug, mode)                   │
│  │   → Creates or resumes PracticeSession                      │
│  │   → Returns session + saved work (if resuming)              │
│  ├── saveSession(sessionId, code, chatHistory)                 │
│  │   → Auto-save (debounced, every 30 seconds)                 │
│  ├── completeSession(sessionId, finalScore, xp)                │
│  │   → Marks session complete, awards XP                       │
│  │   → Updates PracticeProgress                                 │
│  │                                                              │
│  progress.action.ts                                             │
│  ├── getModuleProgress(userId, module)                         │
│  │   → Returns PracticeProgress for sidebar                    │
│  ├── getCategoryProgress(userId, module, category)             │
│  │   → Returns per-problem status for sidebar                  │
│  ├── updateStreak(userId, module)                              │
│  │   → Called on session completion                             │
│  │                                                              │
│  problems.action.ts                                             │
│  ├── getProblems(module, category?)                            │
│  │   → Returns problem list for sidebar                        │
│  ├── getProblem(slug)                                          │
│  │   → Returns full problem for workspace                      │
│  │                                                              │
│  voice-token.action.ts                                          │
│  ├── getVoiceToken()                                           │
│  │   → Returns short-lived ElevenLabs API key                  │
│  │   → Reuse pattern from existing getElevenLabsToken          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Auto-Save Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      AUTO-SAVE FLOW                              │
│                                                                  │
│  User types code...                                             │
│       │                                                          │
│       ▼                                                          │
│  Zustand store updates (setCode)                                │
│       │                                                          │
│       ▼                                                          │
│  useEffect with 30-second debounce                              │
│       │                                                          │
│       ▼                                                          │
│  saveSession(sessionId, {                                       │
│    code: store.code,                                            │
│    cssCode: store.cssCode,                                      │
│    canvasData: store.canvasData,                                │
│    chatHistory: store.messages,                                 │
│    totalTimeSeconds: store.elapsedSeconds,                      │
│  })                                                              │
│       │                                                          │
│       ▼                                                          │
│  Small "Saved ✓" toast (bottom-right, auto-dismiss)            │
│                                                                  │
│  ALSO saves on:                                                  │
│  • Before navigating away (beforeunload)                        │
│  • After each assessment completes                              │
│  • When user clicks "Back to problems"                         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 12. Extending MarkdownRenderer for Mermaid

The existing `markdown-renderer.tsx` uses `react-markdown` with `remark-gfm` and `SyntaxHighlighter`. We need to add Mermaid diagram rendering for AI responses.

### What Needs to Change

```
┌──────────────────────────────────────────────────────────────────┐
│              MARKDOWN RENDERER EXTENSION                         │
│                                                                  │
│  CURRENT (138 lines):                                           │
│  ├── react-markdown                                             │
│  ├── remark-gfm                                                │
│  ├── Prism syntax highlighting                                 │
│  ├── Custom styled headings, lists, tables                     │
│  └── Links open in new tab                                      │
│                                                                  │
│  ADD:                                                            │
│  ├── Mermaid code block detection (```mermaid ... ```)          │
│  ├── Mermaid rendering via mermaid.js library                   │
│  ├── Error fallback for invalid mermaid syntax                  │
│  └── Dark mode support for mermaid diagrams                     │
│                                                                  │
│  APPROACH: Extend the code() component handler.                 │
│  When language is "mermaid", render with mermaid.js             │
│  instead of SyntaxHighlighter.                                  │
│                                                                  │
│  OPTION A: Extend the existing MarkdownRenderer component      │
│  OPTION B: Create a PracticeMarkdownRenderer that wraps it      │
│                                                                  │
│  RECOMMENDATION: Option A — extend existing. Mermaid support   │
│  is useful everywhere, not just practice. Keep it in the        │
│  shared component.                                               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Implementation Approach

```typescript
// In markdown-renderer.tsx, update the code() handler:

// New import
import mermaid from "mermaid";

// Inside the code component handler:
code({ className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || "");
  const language = match?.[1];
  const inline = !match;

  // Handle mermaid diagrams
  if (language === "mermaid") {
    return <MermaidDiagram chart={String(children).trim()} />;
  }

  // ... existing Prism highlighting logic
}

// Separate Mermaid component (lazy loaded)
function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",  // or detect from useTheme()
      securityLevel: "strict",
    });

    mermaid
      .render(`mermaid-${crypto.randomUUID().slice(0, 8)}`, chart)
      .then(({ svg }) => setSvg(svg))
      .catch((err) => setError(err.message));
  }, [chart]);

  if (error) {
    return (
      <pre className="bg-red-50 dark:bg-red-950/30 p-3 rounded text-sm text-red-600">
        Diagram error: {error}
      </pre>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-4 flex justify-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
```

---

## 13. Component Dependency Map

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     COMPONENT DEPENDENCY MAP                             │
│                                                                          │
│  External packages needed:                                              │
│  ├── mermaid                          (npm install mermaid)             │
│  ├── @excalidraw/excalidraw           (npm install @excalidraw/excalidraw) │
│  ├── esbuild-wasm                     (npm install esbuild-wasm)        │
│  │   └── For in-browser JSX transpilation (Frontend Web live preview)  │
│  └── (react-resizable-panels — check if shadcn's "resizable" is       │
│       already installed, it wraps this)                                  │
│                                                                          │
│  Already in codebase:                                                   │
│  ├── @monaco-editor/react             (code-editor.tsx)                │
│  ├── react-markdown + remark-gfm      (markdown-renderer.tsx)          │
│  ├── react-syntax-highlighter         (markdown-renderer.tsx)          │
│  ├── zustand                          (studioStore.ts, etc.)           │
│  ├── framer-motion                    (animations)                      │
│  ├── lucide-react                     (icons)                           │
│  ├── @repo/ui (shadcn)                (Button, Input, ScrollArea, etc.)│
│  ├── openai                           (AI actions)                      │
│  └── elevenlabs (server-side token)   (voice.tsx)                       │
│                                                                          │
│  Component Dependencies:                                                │
│                                                                          │
│  PracticeLayoutShell                                                    │
│  ├── depends on: ResizablePanelGroup (shadcn)                          │
│  ├── children: ProblemPanel, WorkspacePanel, AIMentorPanel             │
│  └── uses: usePracticeStore (for timer, mode)                          │
│                                                                          │
│  AIMentorPanel                                                          │
│  ├── depends on: MarkdownRenderer (extended with Mermaid)              │
│  ├── depends on: VoiceToggle                                            │
│  ├── depends on: RunAndAssessButton                                     │
│  ├── depends on: ScrollArea (shadcn)                                   │
│  └── uses: usePracticeStore (messages, streaming, assess)              │
│                                                                          │
│  VoiceToggle                                                            │
│  ├── depends on: ElevenLabs Scribe v2 (WebSocket)                      │
│  ├── depends on: ElevenLabs Flash v2.5 (REST)                          │
│  ├── depends on: Browser MediaRecorder API                             │
│  └── uses: usePracticeStore (voiceState, voiceEnabled)                 │
│                                                                          │
│  DSAWorkspace                                                           │
│  ├── depends on: Monaco Editor (existing code-editor.tsx)              │
│  └── uses: usePracticeStore (code, language)                           │
│                                                                          │
│  SDWorkspace                                                            │
│  ├── depends on: @excalidraw/excalidraw                                │
│  └── uses: usePracticeStore (canvasData)                               │
│                                                                          │
│  FrontendWorkspace                                                      │
│  ├── depends on: Monaco Editor                                          │
│  ├── depends on: LivePreview (esbuild-wasm + iframe)                   │
│  └── uses: usePracticeStore (code, cssCode)                            │
│                                                                          │
│  BackendWorkspace                                                       │
│  ├── depends on: Monaco Editor                                          │
│  ├── depends on: APITester                                              │
│  └── uses: usePracticeStore (code, language)                           │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 14. Implementation Checklist

Ordered by dependency (build bottom-up):

### Phase 1: Foundation (Week 1-2)

```
☐ Install dependencies
  ☐ npx shadcn@latest add resizable (if not already available)
  ☐ npm install mermaid
  ☐ npm install @excalidraw/excalidraw (SD only, can defer)

☐ Database
  ☐ Add PracticeModule, PracticeDifficulty, PracticeStatus, PracticeMode enums
  ☐ Add PracticeProblem model
  ☐ Add PracticeSession model
  ☐ Add PracticeProgress model
  ☐ Add relation to User model
  ☐ Run prisma migrate dev

☐ Store
  ☐ Create practiceStore.ts (Zustand)

☐ Shared Components
  ☐ PracticeLayoutShell (resizable panels)
  ☐ PracticeSidebar (categories, problems, search, filters)
  ☐ ProblemPanel (generic, with requirements checklist)
  ☐ ModeSelector (exam/assist toggle)
  ☐ Timer
  ☐ RunAndAssessButton

☐ AI Integration
  ☐ Extend MarkdownRenderer with Mermaid support
  ☐ AIMentorPanel (chat UI, streaming, message display)
  ☐ assess.action.ts (server action for GPT-4o)
  ☐ System prompts per module (4 prompts)

☐ Server Actions
  ☐ session.action.ts (start, save, complete)
  ☐ progress.action.ts (get, update)
  ☐ problems.action.ts (list, get)
```

### Phase 2: DSA Module (Week 3-4)

```
☐ DSA Workspace
  ☐ Configure Monaco for DSA (language picker, theme, auto-complete)
  ☐ DSA problem panel (examples, constraints, starter code)
  ☐ Wire Run & Assess → GPT-4o with DSA prompt
  ☐ DSA-specific system prompt tuning

☐ Seed Data
  ☐ Create 20-30 DSA problems across categories
  ☐ Starter code templates per language

☐ Routing
  ☐ /mock/practice page (module picker)
  ☐ /mock/practice/dsa page (category list)
  ☐ /mock/practice/dsa/[slug] page (workspace)
```

### Phase 3: System Design Module (Week 5-6)

```
☐ SD Workspace
  ☐ Integrate Excalidraw
  ☐ Custom component library (drag-and-drop SD elements)
  ☐ Canvas-to-text extraction for AI
  ☐ SD problem panel (requirements, constraints, users/scale)
  ☐ Wire Run & Assess → GPT-4o with SD prompt

☐ Seed Data
  ☐ Create 12-15 SD problems

☐ Routing
  ☐ /mock/practice/sd page
  ☐ /mock/practice/sd/[slug] page
```

### Phase 4: Web Dev Module (Week 7-8)

```
☐ Frontend Workspace
  ☐ Multi-tab Monaco (JSX + CSS)
  ☐ Live Preview (esbuild-wasm + sandboxed iframe)
  ☐ Frontend problem panel (requirements, a11y checklist)
  ☐ Wire Run & Assess → GPT-4o with Frontend prompt

☐ Backend Workspace
  ☐ Monaco for Node.js/Express
  ☐ API Tester panel (test case display)
  ☐ Backend problem panel (requirements, test scenarios)
  ☐ Wire Run & Assess → GPT-4o with Backend prompt

☐ Seed Data
  ☐ Create 15-20 Frontend problems
  ☐ Create 15-20 Backend problems

☐ Routing
  ☐ /mock/practice/web page (track picker)
  ☐ /mock/practice/web/frontend/[slug] page
  ☐ /mock/practice/web/backend/[slug] page
```

### Phase 5: Voice + Polish (Week 9-10)

```
☐ Voice
  ☐ VoiceToggle component
  ☐ Scribe v2 WebSocket integration (STT)
  ☐ Flash v2.5 REST integration (TTS)
  ☐ voice-token.action.ts
  ☐ Test latency and reliability

☐ Polish
  ☐ Auto-save (30s debounce + beforeunload)
  ☐ Session resume (load saved work)
  ☐ Progress tracking UI (sidebar badges, XP display)
  ☐ Streak tracking
  ☐ Mobile responsiveness (collapse panels to tabs)
  ☐ Loading states and error boundaries
  ☐ Keyboard shortcuts (Cmd+Enter → Run & Assess)
```

---

> **This document completes the technical specification.** Read in order:
> 1. `00-PRACTICE-MODULE-VISION-AND-STRATEGY.md` — Why and What
> 2. `01-DSA-PRACTICE-BLUEPRINT.md` — DSA module design
> 3. `02-SYSTEM-DESIGN-PRACTICE-BLUEPRINT.md` — SD module design
> 4. `03-WEB-DEV-PRACTICE-BLUEPRINT.md` — Web module design
> 5. `04-SHARED-COMPONENTS-TECHNICAL-SPEC.md` — How it all fits together (this doc)