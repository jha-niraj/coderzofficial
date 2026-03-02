# 📊 DSA Practice Module — Complete Blueprint

> **Route:** `/mock/practice/dsa/[problemSlug]`  
> **Workspace Type:** Monaco Code Editor + AI Chat  
> **Purpose:** Interactive coding problems with AI-guided Socratic learning

---

## Table of Contents

1. [Screen Layout & Wireframe](#1-screen-layout--wireframe)
2. [Problem Panel (Left)](#2-problem-panel-left)
3. [Code Editor Panel (Center)](#3-code-editor-panel-center)
4. [AI Mentor Panel (Right)](#4-ai-mentor-panel-right)
5. [The "Run & Assess" Flow — Step by Step](#5-the-run--assess-flow--step-by-step)
6. [AI Prompt Engineering for DSA](#6-ai-prompt-engineering-for-dsa)
7. [Mermaid Visualizations by Problem Type](#7-mermaid-visualizations-by-problem-type)
8. [Progressive Optimization Tracking](#8-progressive-optimization-tracking)
9. [Category & Problem Structure](#9-category--problem-structure)
10. [Voice Interaction for DSA](#10-voice-interaction-for-dsa)
11. [Sidebar Design](#11-sidebar-design)
12. [User Flow Diagrams](#12-user-flow-diagrams)
13. [Database Schema](#13-database-schema)
14. [Example Walkthrough: Fibonacci](#14-example-walkthrough-fibonacci)

---

## 1. Screen Layout & Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ◀ Practice    DSA › Dynamic Programming › Fibonacci Number    🔊 OFF  ⚙  │
├─────────┬────────────────────────────────┬──────────────────────────────────┤
│         │                                │                                  │
│ PROBLEM │     CODE EDITOR                │     AI MENTOR                    │
│         │                                │                                  │
│ ┌─────┐ │  Language: [Python ▾]          │  ┌────────────────────────────┐  │
│ │#509 │ │                                │  │ 🤖 AI Mentor              │  │
│ │Easy │ │  ┌──────────────────────────┐  │  │                            │  │
│ └─────┘ │  │ 1  def fib(n: int) ->   │  │  │ Welcome! You're solving   │  │
│         │  │ 2      int:             │  │  │ the Fibonacci Number       │  │
│ Fibo-   │  │ 3    if n <= 1:         │  │  │ problem. Take your time    │  │
│ nacci   │  │ 4      return n         │  │  │ and hit "Run & Assess"     │  │
│ Number  │  │ 5    return fib(n-1)    │  │  │ when you're ready!         │  │
│         │  │ 6      + fib(n-2)       │  │  │                            │  │
│ The     │  │ 7                       │  │  └────────────────────────────┘  │
│ Fibo-   │  │                         │  │                                  │
│ nacci   │  └──────────────────────────┘  │  ─── Attempt History ─────────  │
│ numbers │                                │  Attempt 1: Not yet submitted   │
│ commonly│  ┌──────────────────────────┐  │                                  │
│ denoted │  │ TEST CASES               │  │  ─── Controls ────────────────  │
│ F(n),   │  │                          │  │                                  │
│ form a  │  │ Case 1: fib(2) → 1  ❓  │  │  [🎤 Voice OFF] [Mode: Exam]  │
│ sequence│  │ Case 2: fib(3) → 2  ❓  │  │                                  │
│ ...     │  │ Case 3: fib(4) → 3  ❓  │  │  ┌────────────────────────────┐  │
│         │  │ Case 4: fib(10)→ 55 ❓  │  │  │ 💬 Type or speak...       │  │
│ n=2→1   │  │ Case 5: fib(30)→ ?  🔒 │  │  │              [Send] [🎤]  │  │
│ n=3→2   │  └──────────────────────────┘  │  └────────────────────────────┘  │
│ n=4→3   │                                │                                  │
│         │  ┌──────────────────────────┐  │                                  │
│ Const:  │  │ [▶ Run & Assess]        │  │                                  │
│ 0≤n≤30  │  │ [💡 Hint] [🔒 Solution] │  │                                  │
│         │  └──────────────────────────┘  │                                  │
│         │                                │                                  │
├─────────┴────────────────────────────────┴──────────────────────────────────┤
│  ⏱ 5:32 elapsed  │  Attempt: 1  │  Approach: Unknown  │  💡 3 hints left  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Problem Panel (Left)

### Content Structure

```typescript
interface DSAProblem {
  id: string;
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  number: number;                        // Like LeetCode #509
  
  // Problem Content
  description: string;                   // Markdown
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];                 // "0 <= n <= 30"
  
  // Categorization
  category: string;                      // "Dynamic Programming"
  subcategory: string;                   // "1D DP"
  patterns: string[];                    // ["Recursion", "Memoization", "Tabulation"]
  tags: string[];                        // ["fibonacci", "math"]
  companyTags?: string[];                // ["Google", "Amazon"]
  
  // Solution Metadata (NOT shown to user directly)
  optimalApproach: string;               // "Tabulation with O(1) space"
  optimalTimeComplexity: string;         // "O(n)"
  optimalSpaceComplexity: string;        // "O(1)"
  bruteForceComplexity: string;          // "O(2^n)"
  
  // Starter Code per language
  starterCode: Record<string, string>;   // { python: "def fib(n):", javascript: "function fib(n) {}" }
  
  // Test Cases
  testCases: {
    input: string;
    expectedOutput: string;
    isHidden: boolean;                   // Hidden test cases only used for scoring
    explanation?: string;
  }[];
  
  // AI Context (for prompt engineering)
  commonMistakes: string[];              // ["Using raw recursion without memoization"]
  hintProgression: string[];             // ["Think about repeated subproblems", "What if you stored results?"]
  solutionApproaches: {
    name: string;                        // "Brute Force Recursion"
    timeComplexity: string;              // "O(2^n)"
    spaceComplexity: string;             // "O(n) call stack"
    description: string;
    code: Record<string, string>;        // Solution code per language
  }[];
}
```

### Problem Panel Features

```
┌──────────────────────────────────┐
│ Problem Panel                    │
│                                  │
│ ┌────────────────────────────┐   │
│ │ Tabs:                      │   │
│ │ [Description] [Hints] [Sol]│   │
│ └────────────────────────────┘   │
│                                  │
│ Description Tab:                 │
│ • Problem statement (markdown)   │
│ • Examples with input/output     │
│ • Constraints                    │
│ • Pattern tags (clickable)       │
│                                  │
│ Hints Tab:                       │
│ • Progressive reveal             │
│ • Hint 1: General direction      │
│ • Hint 2: Specific technique     │
│ • Hint 3: Near-solution guide    │
│ • Each hint costs nothing in     │
│   Assist mode, reduces score     │
│   in Exam mode                   │
│                                  │
│ Solution Tab:                    │
│ • 🔒 Locked until 3+ attempts   │
│   OR Assist mode                 │
│ • Multiple approaches shown      │
│ • Brute Force → Optimal          │
│ • Each with code + complexity    │
│                                  │
└──────────────────────────────────┘
```

---

## 3. Code Editor Panel (Center)

### Editor Configuration

We reuse the existing `CodeEditor` component (`components/main/code-editor.tsx`) with modifications:

```typescript
interface DSAEditorConfig {
  // Language selection (same languages as existing code-editor)
  supportedLanguages: ["javascript", "typescript", "python", "java", "cpp", "c"];
  defaultLanguage: "javascript";
  
  // Editor settings
  fontSize: 14;
  tabSize: 2;
  wordWrap: "on";
  minimap: false;
  lineNumbers: true;
  
  // Custom features for Practice
  highlightLines: number[];              // AI can highlight specific lines
  readOnlyRanges: Range[];              // Lock starter code structure
  autoSave: true;                        // Save to session every 5 seconds
}
```

### Test Case Display (Below Editor)

```
┌────────────────────────────────────────────────────┐
│ TEST CASES                              [+ Custom] │
│                                                    │
│ ┌────────────────────────────────────────────────┐ │
│ │ Case 1              Input: n = 2               │ │
│ │ Expected: 1         Your Output: 1        ✅   │ │
│ └────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────┐ │
│ │ Case 2              Input: n = 3               │ │
│ │ Expected: 2         Your Output: 2        ✅   │ │
│ └────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────┐ │
│ │ Case 3              Input: n = 10              │ │
│ │ Expected: 55        Your Output: timeout  ❌   │ │
│ │                     (exceeded 2s limit)        │ │
│ └────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────┐ │
│ │ Case 4              Input: n = 30              │ │
│ │ Expected: 🔒 Hidden                      ❓   │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ Note: Test results are AI-simulated, not compiled  │
└────────────────────────────────────────────────────┘
```

**Important:** Since we're not compiling, the "test results" shown are the AI's analysis of whether the code would produce the correct output. The AI simulates execution mentally. For simple cases (fib(2), fib(3)), the AI can confidently say ✅. For edge cases, it analyzes the approach.

---

## 4. AI Mentor Panel (Right)

### Chat Message Types

```typescript
type ChatMessage = {
  id: string;
  role: "user" | "ai" | "system";
  timestamp: Date;
  
  // Content can contain:
  content: string;                       // Markdown with mermaid blocks
  
  // Metadata
  attempt?: number;                      // Which attempt triggered this
  approach?: string;                     // "Brute Force", "Memoization", etc.
  codeSnapshot?: string;                 // User's code at this point
  voiceTranscript?: string;              // If message came from voice
  
  // AI-specific
  highlightedLines?: number[];           // Lines in user's code to highlight
  complexity?: {
    time: string;
    space: string;
  };
};
```

### Chat Panel Layout

```
┌──────────────────────────────────────┐
│ 🤖 AI Mentor                   [⚙]  │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ Mode: [🎯 Exam] [🤝 Assist]    │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ╔══════════════════════════════════╗ │
│ ║ 🤖 Welcome! You're solving the  ║ │
│ ║ Fibonacci Number problem.        ║ │
│ ║                                  ║ │
│ ║ **Key Insight:** This problem    ║ │
│ ║ has multiple solution levels:    ║ │
│ ║ • Recursive → O(2^n)            ║ │
│ ║ • Memoized → O(n)               ║ │
│ ║ • Tabulated → O(n), O(1) space  ║ │
│ ║                                  ║ │
│ ║ Write your first approach and    ║ │
│ ║ hit **Run & Assess**!           ║ │
│ ╚══════════════════════════════════╝ │
│                                      │
│ ╔══════════════════════════════════╗ │
│ ║ [After user clicks Run]          ║ │
│ ║                                  ║ │
│ ║ 🤖 **Attempt 1 Analysis:**      ║ │
│ ║                                  ║ │
│ ║ Your recursive approach works    ║ │
│ ║ for small inputs! ✅             ║ │
│ ║                                  ║ │
│ ║ But look at what happens when    ║ │
│ ║ n gets larger:                   ║ │
│ ║                                  ║ │
│ ║ ```mermaid                       ║ │
│ ║ graph TD                         ║ │
│ ║   F5[fib 5] --> F4[fib 4]       ║ │
│ ║   F5 --> F3a[fib 3]             ║ │
│ ║   F4 --> F3b[fib 3]             ║ │
│ ║   F4 --> F2a[fib 2]             ║ │
│ ║   F3a --> F2b[fib 2]            ║ │
│ ║   F3a --> F1a[fib 1]            ║ │
│ ║   F3b --> F2c[fib 2]            ║ │
│ ║   F3b --> F1b[fib 1]            ║ │
│ ║   style F3a fill:#ff6b6b        ║ │
│ ║   style F3b fill:#ff6b6b        ║ │
│ ║   style F2a fill:#ffa94d        ║ │
│ ║   style F2b fill:#ffa94d        ║ │
│ ║   style F2c fill:#ffa94d        ║ │
│ ║ ```                              ║ │
│ ║                                  ║ │
│ ║ See the red & orange nodes?      ║ │
│ ║ `fib(3)` is calculated **twice** ║ │
│ ║ and `fib(2)` **three times**.    ║ │
│ ║                                  ║ │
│ ║ 💭 What if you could             ║ │
│ ║ **remember** the result the      ║ │
│ ║ first time you calculate it?     ║ │
│ ║                                  ║ │
│ ║ *Lines 5-6 are where the        ║ │
│ ║ redundant calls happen.*         ║ │
│ ╚══════════════════════════════════╝ │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ 💬 Type or speak...      [🎤]   │ │
│ │                          [Send]  │ │
│ └──────────────────────────────────┘ │
│                                      │
└──────────────────────────────────────┘
```

---

## 5. The "Run & Assess" Flow — Step by Step

### Complete State Machine

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    "RUN & ASSESS" STATE MACHINE                          │
│                                                                          │
│                          ┌─────────┐                                     │
│                          │  IDLE   │                                     │
│                          └────┬────┘                                     │
│                               │                                          │
│                    User clicks "Run & Assess"                            │
│                               │                                          │
│                               ▼                                          │
│                     ┌──────────────────┐                                 │
│                     │  GATHERING       │                                 │
│                     │  CONTEXT         │                                 │
│                     │                  │                                 │
│                     │ • Capture code   │                                 │
│                     │ • Get language   │                                 │
│                     │ • Get attempt #  │                                 │
│                     │ • Get history    │                                 │
│                     └────────┬─────────┘                                 │
│                              │                                           │
│                              ▼                                           │
│                     ┌──────────────────┐                                 │
│                     │  BUILDING        │                                 │
│                     │  AI PROMPT       │                                 │
│                     │                  │                                 │
│                     │ • System prompt  │                                 │
│                     │ • Problem context│                                 │
│                     │ • User code      │                                 │
│                     │ • Attempt hist.  │                                 │
│                     │ • Mode (exam/    │                                 │
│                     │   assist)        │                                 │
│                     └────────┬─────────┘                                 │
│                              │                                           │
│                              ▼                                           │
│                     ┌──────────────────┐                                 │
│                     │  STREAMING       │──── Tokens stream to chat ───▶  │
│                     │  AI RESPONSE     │     (real-time rendering)       │
│                     │                  │                                 │
│                     │  GPT-4o via      │                                 │
│                     │  streaming API   │                                 │
│                     └────────┬─────────┘                                 │
│                              │                                           │
│                   ┌──────────┴──────────┐                                │
│                   │                     │                                │
│             Voice ON?              Voice OFF?                            │
│                   │                     │                                │
│                   ▼                     │                                │
│          ┌────────────────┐             │                                │
│          │ EXTRACT SPEECH │             │                                │
│          │ TEXT           │             │                                │
│          │                │             │                                │
│          │ Strip markdown │             │                                │
│          │ Strip code     │             │                                │
│          │ Strip mermaid  │             │                                │
│          └───────┬────────┘             │                                │
│                  │                      │                                │
│                  ▼                      │                                │
│          ┌────────────────┐             │                                │
│          │ TTS via        │             │                                │
│          │ ElevenLabs     │             │                                │
│          │ Flash v2.5     │             │                                │
│          └───────┬────────┘             │                                │
│                  │                      │                                │
│                  ▼                      ▼                                │
│          ┌──────────────────────────────────┐                            │
│          │  SAVE STATE                      │                            │
│          │                                  │                            │
│          │ • Increment attempt count        │                            │
│          │ • Save code snapshot             │                            │
│          │ • Classify approach              │                            │
│          │ • Update progress in DB          │                            │
│          │ • Save transcript                │                            │
│          └──────────────┬───────────────────┘                            │
│                         │                                                │
│                         ▼                                                │
│                    ┌─────────┐                                           │
│                    │  IDLE   │  ← Ready for next attempt                │
│                    └─────────┘                                           │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 6. AI Prompt Engineering for DSA

### System Prompt Template

```markdown
You are an expert DSA tutor on the CoderzHQ Practice Platform. 

## Your Personality:
- Patient, encouraging, never condescending
- You celebrate small wins ("Great start!" "You're on the right track!")
- You use the Socratic method — ask guiding questions instead of giving answers
- You're like a senior engineer doing pair programming

## Rules:
1. NEVER give the complete solution code
2. NEVER just say "use Dynamic Programming" — explain WHY with visuals
3. ALWAYS acknowledge what the user did correctly first
4. ALWAYS reference specific line numbers in the user's code
5. ALWAYS include a mermaid diagram when explaining:
   - Recursion trees
   - Array pointer movements
   - Stack/Queue operations
   - Graph traversals
   - DP table filling
6. ALWAYS state the time & space complexity of the user's current approach
7. End with ONE guiding question to lead them to the next optimization level
8. If the user's solution is optimal, congratulate and suggest a follow-up challenge
9. Format everything as Markdown

## Progressive Hint Levels:
- Attempt 1-2: Very gentle hints, mostly questions
- Attempt 3-4: More specific hints, point to the technique name
- Attempt 5+: Near-direct guidance (but still not full code)

## For ASSIST MODE (if enabled):
- Be more direct with guidance
- Show pseudocode (not full code)
- Offer to explain the optimal approach step by step
- Show the mermaid diagram of the optimal approach proactively

## Output Format:
1. **Approach Detection:** "[User is using: Brute Force Recursion]"
2. **What's Working:** Brief positive note
3. **The Issue:** Specific problem with line references
4. **Visual Explanation:** Mermaid diagram
5. **Guiding Question:** One question to lead them forward
6. **Complexity:** "Current: O(2^n) time, O(n) space → Target: O(n) time, O(1) space"
```

### Context Payload Sent to AI

```typescript
interface DSAAssessmentPayload {
  problem: {
    title: string;
    description: string;
    difficulty: string;
    optimalApproach: string;
    optimalTimeComplexity: string;
    optimalSpaceComplexity: string;
    constraints: string[];
    testCases: { input: string; expected: string }[];
    commonMistakes: string[];
    patterns: string[];
  };
  
  userSubmission: {
    code: string;
    language: string;
    attemptNumber: number;
    timeSpentSeconds: number;
  };
  
  sessionHistory: {
    previousAttempts: {
      code: string;
      approach: string;
      aiResponse: string;
      timestamp: Date;
    }[];
    hintsUsed: number;
    previousApproaches: string[];    // ["Brute Force", "Memoization"]
  };
  
  mode: "exam" | "assist";
  voiceEnabled: boolean;
}
```

---

## 7. Mermaid Visualizations by Problem Type

### For Each DSA Category — What to Visualize

```
┌────────────────────────────────────────────────────────────────────┐
│  MERMAID VISUALIZATION GUIDE BY PROBLEM TYPE                       │
│                                                                    │
│  Arrays & Hashing:                                                │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │ ```mermaid                                               │     │
│  │ graph LR                                                 │     │
│  │   subgraph Array                                         │     │
│  │     A1[2] --- A2[7] --- A3[11] --- A4[15]               │     │
│  │   end                                                    │     │
│  │   P1[i=0] -.->|target-2=7| HM{HashMap}                  │     │
│  │   P2[j=1] -.->|found 7!| HM                             │     │
│  │   style P2 fill:#51cf66                                  │     │
│  │ ```                                                      │     │
│  │ Shows: pointer movement, hash map lookups                │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                    │
│  Two Pointers / Sliding Window:                                   │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │ ```mermaid                                               │     │
│  │ graph LR                                                 │     │
│  │   subgraph Window                                        │     │
│  │     A1[1] --- A2[3] --- A3[2] --- A4[5] --- A5[1]      │     │
│  │   end                                                    │     │
│  │   L[Left=0] -.-> A1                                      │     │
│  │   R[Right=2] -.-> A3                                     │     │
│  │   SUM[Sum=6] --- TARGET[Target=7]                        │     │
│  │   style A1 fill:#74c0fc                                  │     │
│  │   style A2 fill:#74c0fc                                  │     │
│  │   style A3 fill:#74c0fc                                  │     │
│  │ ```                                                      │     │
│  │ Shows: window boundaries, current sum vs target          │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                    │
│  Recursion / Dynamic Programming:                                 │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │ ```mermaid                                               │     │
│  │ graph TD                                                 │     │
│  │   F5[fib 5] --> F4[fib 4]                               │     │
│  │   F5 --> F3a[fib 3]                                      │     │
│  │   F4 --> F3b[fib 3]                                      │     │
│  │   F4 --> F2a[fib 2]                                      │     │
│  │   F3a --> F2b[fib 2]                                     │     │
│  │   F3a --> F1a[fib 1]                                     │     │
│  │   style F3a fill:#ff6b6b                                 │     │
│  │   style F3b fill:#ff6b6b                                 │     │
│  │ ```                                                      │     │
│  │ Shows: recursion tree, duplicate subproblems highlighted │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                    │
│  Trees / BST:                                                     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │ ```mermaid                                               │     │
│  │ graph TD                                                 │     │
│  │   A[4] --> B[2]                                          │     │
│  │   A --> C[7]                                              │     │
│  │   B --> D[1]                                              │     │
│  │   B --> E[3]                                              │     │
│  │   C --> F[6]                                              │     │
│  │   C --> G[9]                                              │     │
│  │   style A fill:#ffd43b                                   │     │
│  │   style B fill:#74c0fc                                   │     │
│  │ ```                                                      │     │
│  │ Shows: tree structure, current traversal position        │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                    │
│  Graphs (BFS/DFS):                                                │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │ ```mermaid                                               │     │
│  │ graph LR                                                 │     │
│  │   A((0)) --> B((1))                                      │     │
│  │   A --> C((2))                                            │     │
│  │   B --> D((3))                                            │     │
│  │   C --> D                                                 │     │
│  │   D --> E((4))                                            │     │
│  │   style A fill:#51cf66                                   │     │
│  │   style B fill:#74c0fc                                   │     │
│  │   style C fill:#74c0fc                                   │     │
│  │ ```                                                      │     │
│  │ Shows: visited nodes (green), queue/stack (blue)         │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                    │
│  Stack / Queue:                                                   │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │ ```mermaid                                               │     │
│  │ graph LR                                                 │     │
│  │   subgraph Stack                                         │     │
│  │     S1["("] --- S2["["] --- S3["{"]                     │     │
│  │   end                                                    │     │
│  │   NEXT["}" input] -.->|matches top| S3                   │     │
│  │   style NEXT fill:#51cf66                                │     │
│  │ ```                                                      │     │
│  │ Shows: stack state, current input, match/mismatch        │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                    │
│  Linked List:                                                     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │ ```mermaid                                               │     │
│  │ graph LR                                                 │     │
│  │   A[1] --> B[2] --> C[3] --> D[4] --> E[5]              │     │
│  │   SLOW[slow] -.-> B                                      │     │
│  │   FAST[fast] -.-> D                                      │     │
│  │   style SLOW fill:#74c0fc                                │     │
│  │   style FAST fill:#ff6b6b                                │     │
│  │ ```                                                      │     │
│  │ Shows: pointer positions, fast/slow technique            │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 8. Progressive Optimization Tracking

### Per-Problem Session State

```
┌──────────────────────────────────────────────────────────────┐
│              OPTIMIZATION JOURNEY TRACKER                     │
│                                                              │
│  Problem: Fibonacci Number (#509)                            │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ Attempt 1: Brute Force Recursion                    │     │
│  │ Time: O(2^n)  Space: O(n)                          │     │
│  │ Status: ✅ Correct for small n, ❌ TLE for n≥30    │     │
│  │ AI Hint: "Look at repeated subproblems"            │     │
│  │ ──────────────────────────────────────              │     │
│  │                                                     │     │
│  │ Attempt 2: Memoization (Top-Down DP)               │     │
│  │ Time: O(n)   Space: O(n)                           │     │
│  │ Status: ✅ All test cases pass                      │     │
│  │ AI Hint: "Great! Can you do O(1) space?"           │     │
│  │ ──────────────────────────────────────              │     │
│  │                                                     │     │
│  │ Attempt 3: Tabulation (Bottom-Up, 2 vars)          │     │
│  │ Time: O(n)   Space: O(1)                           │     │
│  │ Status: ✅ OPTIMAL! 🎉                             │     │
│  │ AI: "Perfect! Follow-up: Matrix exponentiation?"   │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                              │
│  Progress Bar:                                               │
│  Brute Force ──▶ Better ──▶ Optimal                        │
│  [████████████████████████████████████] 100%                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. Category & Problem Structure

### DSA Sidebar Categories (NeetCode-Inspired)

```
┌──────────────────────────────┐
│ 📊 DSA Practice              │
│                              │
│ 🔍 Search problems...        │
│                              │
│ ▸ Arrays & Hashing    (20)  │
│   ├─ Two Sum                 │
│   ├─ Contains Duplicate      │
│   ├─ Valid Anagram           │
│   ├─ Group Anagrams          │
│   └─ ... (16 more)          │
│                              │
│ ▸ Two Pointers        (10)  │
│ ▸ Sliding Window      (8)   │
│ ▸ Stack               (7)   │
│ ▸ Binary Search       (10)  │
│ ▸ Linked List         (11)  │
│ ▸ Trees               (15)  │
│ ▸ Tries               (3)   │
│ ▸ Heap/Priority Queue (7)   │
│ ▸ Backtracking        (9)   │
│ ▸ Graphs              (13)  │
│ ▸ Dynamic Programming (20)  │
│   ├─ 1D DP                  │
│   │  ├─ Fibonacci Number ✅ │
│   │  ├─ Climbing Stairs   ✅│
│   │  └─ House Robber      🔶│
│   ├─ 2D DP                  │
│   │  ├─ Longest Common Sub. │
│   │  └─ Edit Distance       │
│   └─ DP on Trees            │
│                              │
│ ▸ Greedy             (8)   │
│ ▸ Intervals          (6)   │
│ ▸ Math & Geometry    (8)   │
│ ▸ Bit Manipulation   (5)   │
│                              │
│ ─────────────────────────    │
│ Total: 150 problems          │
│ Solved: 32 (21%)             │
│ Optimal: 18 (12%)            │
│                              │
│ 🎯 Daily Challenge            │
│ └─ Merge Intervals [Start]  │
│                              │
└──────────────────────────────┘
```

---

## 10. Voice Interaction for DSA

### DSA-Specific Voice Scenarios

```
┌──────────────────────────────────────────────────────────────────┐
│               VOICE INTERACTION EXAMPLES FOR DSA                  │
│                                                                  │
│  Scenario 1: User thinking out loud                             │
│  ─────────────────────────────────────                          │
│  🎤 User: "I'm thinking I should use a nested loop to check    │
│            every pair, but that would be O(n²)..."              │
│                                                                  │
│  🔊 AI:   "You're right that a nested loop gives O(n²). That   │
│            shows great complexity awareness! For this problem,  │
│            think about what data structure gives you O(1)       │
│            lookup time."                                         │
│                                                                  │
│  Scenario 2: User asking for direction                          │
│  ─────────────────────────────────────                          │
│  🎤 User: "Should I use a hash map here?"                      │
│                                                                  │
│  🔊 AI:   "That's an excellent instinct! A hash map would      │
│            let you check if a complement exists in O(1).        │
│            Try implementing it and hit Run when ready."         │
│                                                                  │
│  Scenario 3: User confused about error                          │
│  ─────────────────────────────────────                          │
│  🎤 User: "Why is my code timing out on the large test case?"  │
│                                                                  │
│  🔊 AI:   "Your recursive calls are creating an exponential    │
│            number of function calls. Look at the recursion      │
│            tree in the chat — see how fib(3) is computed        │
│            multiple times? That's why it's slow for large n."   │
│                                                                  │
│  Note: Voice READS the conversational parts only.               │
│  Code blocks and mermaid diagrams are rendered visually.        │
│  The AI response text is separated into:                        │
│  • speech_text (read aloud)                                     │
│  • visual_content (code, mermaid — rendered only)               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 11. Sidebar Design

The sidebar follows the same pattern as the existing Learn sidebar (`learn-sidebar.tsx`):

```typescript
interface PracticeSidebarProps {
  categories: PracticeCategory[];
  selectedCategory: string | null;
  selectedProblem: string | null;
  userProgress: Record<string, ProblemProgress>;
}

interface PracticeCategory {
  slug: string;
  name: string;
  icon: LucideIcon;
  problemCount: number;
  solvedCount: number;
  subcategories?: {
    slug: string;
    name: string;
    problems: {
      slug: string;
      title: string;
      difficulty: "Easy" | "Medium" | "Hard";
      status: "not_started" | "attempted" | "solved" | "optimal";
    }[];
  }[];
}
```

---

## 12. User Flow Diagrams

### Complete User Journey — DSA Problem

```
┌──────────────────────────────────────────────────────────────────────┐
│                    COMPLETE DSA USER JOURNEY                          │
│                                                                      │
│  ┌──────────┐                                                        │
│  │ /mock/   │  User clicks "Practice"                               │
│  │ practice │  from Mock Interview page                             │
│  └────┬─────┘                                                        │
│       │                                                              │
│       ▼                                                              │
│  ┌──────────┐                                                        │
│  │Dashboard │  Sees stats, streak, category cards                   │
│  │          │  Clicks "DSA" card                                    │
│  └────┬─────┘                                                        │
│       │                                                              │
│       ▼                                                              │
│  ┌──────────┐                                                        │
│  │ /mock/   │  Sees sidebar with categories                         │
│  │ practice/│  Expands "Dynamic Programming"                        │
│  │ dsa      │  Clicks "Fibonacci Number"                            │
│  └────┬─────┘                                                        │
│       │                                                              │
│       ▼                                                              │
│  ┌────────────────────────────────────────────────────────┐          │
│  │ MODE SELECTION DIALOG                                  │          │
│  │                                                        │          │
│  │  How do you want to practice this problem?            │          │
│  │                                                        │          │
│  │  ┌─────────────┐     ┌─────────────┐                  │          │
│  │  │ 🎯 EXAM     │     │ 🤝 ASSIST   │                  │          │
│  │  │ Test myself │     │ Help me     │                  │          │
│  │  │ Limited     │     │ learn       │                  │          │
│  │  │ hints       │     │ Full        │                  │          │
│  │  │             │     │ guidance    │                  │          │
│  │  └─────────────┘     └─────────────┘                  │          │
│  │                                                        │          │
│  │  [Enable Voice? 🎤 ON/OFF]                            │          │
│  │                                                        │          │
│  └────────────────────────────────┬───────────────────────┘          │
│                                   │                                  │
│                                   ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐        │
│  │ THREE-PANEL WORKSPACE                                    │        │
│  │                                                          │        │
│  │ [Problem] | [Code Editor] | [AI Chat]                   │        │
│  │                                                          │        │
│  │  User reads problem...                                   │        │
│  │  User writes code...                                     │        │
│  │  User clicks "Run & Assess"                              │        │
│  │       │                                                  │        │
│  │       ▼                                                  │        │
│  │  AI analyzes code + generates response                   │        │
│  │  Response streams into chat panel                        │        │
│  │  Mermaid diagrams render inline                          │        │
│  │  Voice reads response (if enabled)                       │        │
│  │       │                                                  │        │
│  │       ▼                                                  │        │
│  │  User iterates:                                          │        │
│  │  • Modifies code based on hints                         │        │
│  │  • Asks questions via chat or voice                     │        │
│  │  • Clicks "Run & Assess" again                          │        │
│  │  • AI acknowledges improvement                          │        │
│  │       │                                                  │        │
│  │       ▼                                                  │        │
│  │  ┌──────────────────────────────┐                        │        │
│  │  │ PROBLEM SOLVED! 🎉          │                        │        │
│  │  │                              │                        │        │
│  │  │ Approach: Tabulation O(n)   │                        │        │
│  │  │ Attempts: 3                  │                        │        │
│  │  │ Time: 12 minutes             │                        │        │
│  │  │ XP Earned: +50               │                        │        │
│  │  │                              │                        │
│  │  │ [Review Transcript]          │                        │        │
│  │  │ [Next Problem →]             │                        │        │
│  │  │ [Back to Problem List]       │                        │        │
│  │  └──────────────────────────────┘                        │        │
│  │                                                          │        │
│  └──────────────────────────────────────────────────────────┘        │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 13. Database Schema

### Practice-Related Models (Prisma)

```prisma
model PracticeProblem {
  id              String   @id @default(cuid())
  slug            String   @unique
  title           String
  description     String   @db.Text
  difficulty      PracticeDifficulty
  problemNumber   Int?
  
  // Categorization
  moduleType      PracticeModuleType    // DSA, SYSTEM_DESIGN, WEB_FRONTEND, WEB_BACKEND
  category        String                // "Dynamic Programming"
  subcategory     String?               // "1D DP"
  patterns        String[]              // ["Recursion", "Memoization"]
  tags            String[]
  companyTags     String[]
  
  // Starter code per language (JSON)
  starterCode     Json                  // { python: "def fib(n):", js: "..." }
  
  // Test cases (JSON array)
  testCases       Json                  // [{ input, expected, isHidden }]
  
  // Solution metadata
  optimalApproach       String
  optimalTimeComplexity String
  optimalSpaceComplexity String
  solutionApproaches    Json            // [{ name, time, space, code }]
  commonMistakes        String[]
  hintProgression       String[]
  
  // Stats
  totalAttempts   Int      @default(0)
  solvedCount     Int      @default(0)
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  sessions        PracticeSession[]
}

model PracticeSession {
  id              String   @id @default(cuid())
  userId          String
  problemId       String
  
  mode            PracticeMode          // EXAM, ASSIST
  status          PracticeStatus        // IN_PROGRESS, SOLVED, OPTIMAL, ABANDONED
  
  // Progress
  attempts        Int      @default(0)
  bestApproach    String?
  hintsUsed       Int      @default(0)
  voiceUsed       Boolean  @default(false)
  timeSpentSeconds Int     @default(0)
  
  // Chat transcript (JSON array of messages)
  transcript      Json     @default("[]")
  
  // Code snapshots per attempt
  codeSnapshots   Json     @default("[]")  // [{ attempt, code, language, approach }]
  
  // Timestamps
  startedAt       DateTime @default(now())
  completedAt     DateTime?
  
  // Relations
  user            User     @relation(fields: [userId], references: [id])
  problem         PracticeProblem @relation(fields: [problemId], references: [id])
  
  @@unique([userId, problemId, mode])
}

enum PracticeDifficulty {
  EASY
  MEDIUM
  HARD
}

enum PracticeModuleType {
  DSA
  SYSTEM_DESIGN
  WEB_FRONTEND
  WEB_BACKEND
  AI_ML
}

enum PracticeMode {
  EXAM
  ASSIST
}

enum PracticeStatus {
  NOT_STARTED
  IN_PROGRESS
  SOLVED
  OPTIMAL
  ABANDONED
}
```

---

## 14. Example Walkthrough: Fibonacci

### Full Interaction Transcript

```
┌──────────────────────────────────────────────────────────────────┐
│  EXAMPLE: Fibonacci Number — Complete Session                    │
│                                                                  │
│  ═══════════ ATTEMPT 1 ═══════════                              │
│                                                                  │
│  User's Code:                                                    │
│  def fib(n):                                                     │
│      if n <= 1:                                                  │
│          return n                                                │
│      return fib(n-1) + fib(n-2)                                 │
│                                                                  │
│  [User clicks "Run & Assess"]                                   │
│                                                                  │
│  AI Response:                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ **Approach Detected:** Brute Force Recursion               │  │
│  │ **Complexity:** O(2^n) time, O(n) space (call stack)      │  │
│  │                                                            │  │
│  │ Your base case on **line 2** is perfect — fib(0) = 0      │  │
│  │ and fib(1) = 1 are correct! ✅                             │  │
│  │                                                            │  │
│  │ The recursive logic on **lines 4** is also correct.        │  │
│  │ This will give the right answer for small values of n.     │  │
│  │                                                            │  │
│  │ However, watch what happens as n grows:                    │  │
│  │                                                            │  │
│  │ ```mermaid                                                 │  │
│  │ graph TD                                                   │  │
│  │   F5["fib(5)"] --> F4["fib(4)"]                           │  │
│  │   F5 --> F3a["fib(3) ⚠"]                                  │  │
│  │   F4 --> F3b["fib(3) ⚠"]                                  │  │
│  │   F4 --> F2a["fib(2)"]                                     │  │
│  │   F3a --> F2b["fib(2)"]                                    │  │
│  │   F3a --> F1a["fib(1)"]                                    │  │
│  │   F3b --> F2c["fib(2)"]                                    │  │
│  │   F3b --> F1b["fib(1)"]                                    │  │
│  │   style F3a fill:#ff6b6b                                   │  │
│  │   style F3b fill:#ff6b6b                                   │  │
│  │   style F2a fill:#ffa94d                                   │  │
│  │   style F2b fill:#ffa94d                                   │  │
│  │   style F2c fill:#ffa94d                                   │  │
│  │ ```                                                        │  │
│  │                                                            │  │
│  │ See the 🔴 red nodes? `fib(3)` is calculated **twice**.   │  │
│  │ The 🟠 orange `fib(2)` is calculated **three times**.     │  │
│  │ For `fib(30)`, there would be over 2 million redundant    │  │
│  │ calculations!                                              │  │
│  │                                                            │  │
│  │ 💭 **Question:** What if you could store the result of    │  │
│  │ `fib(3)` the first time you calculate it, and just look   │  │
│  │ it up the next time? What data structure could help?       │  │
│  │                                                            │  │
│  │ **Target:** O(n) time, O(1) space                         │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ═══════════ ATTEMPT 2 ═══════════                              │
│                                                                  │
│  User's Code:                                                    │
│  def fib(n):                                                     │
│      memo = {}                                                   │
│      def helper(n):                                              │
│          if n in memo:                                           │
│              return memo[n]                                      │
│          if n <= 1:                                              │
│              return n                                            │
│          memo[n] = helper(n-1) + helper(n-2)                    │
│          return memo[n]                                          │
│      return helper(n)                                            │
│                                                                  │
│  AI Response:                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ **Approach Detected:** Memoization (Top-Down DP) 🎉       │  │
│  │ **Complexity:** O(n) time, O(n) space                     │  │
│  │                                                            │  │
│  │ Excellent! You went from O(2^n) to O(n) — that's a        │  │
│  │ massive improvement! Your memoization dictionary on        │  │
│  │ **line 2** ensures each fib(k) is only computed once.     │  │
│  │                                                            │  │
│  │ Now the recursion tree looks like this:                    │  │
│  │                                                            │  │
│  │ ```mermaid                                                 │  │
│  │ graph TD                                                   │  │
│  │   F5["fib(5)"] --> F4["fib(4)"]                           │  │
│  │   F5 --> F3a["fib(3) ✅ cached"]                           │  │
│  │   F4 --> F3b["fib(3) ← from cache"]                       │  │
│  │   F4 --> F2a["fib(2)"]                                     │  │
│  │   style F3a fill:#51cf66                                   │  │
│  │   style F3b fill:#51cf66,stroke-dasharray: 5 5            │  │
│  │ ```                                                        │  │
│  │                                                            │  │
│  │ No more redundant calculations! Every node is visited      │  │
│  │ only once.                                                 │  │
│  │                                                            │  │
│  │ 💭 **Follow-up Challenge:** Your space is O(n) because    │  │
│  │ of the memo dictionary and the recursion call stack.       │  │
│  │ To compute fib(n), you really only need the **last two**  │  │
│  │ values at any point. Can you think of a way to use only   │  │
│  │ **two variables** instead of a dictionary?                 │  │
│  │                                                            │  │
│  │ **Target:** O(n) time, O(1) space                         │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ═══════════ ATTEMPT 3 ═══════════                              │
│                                                                  │
│  User's Code:                                                    │
│  def fib(n):                                                     │
│      if n <= 1:                                                  │
│          return n                                                │
│      prev, curr = 0, 1                                          │
│      for i in range(2, n + 1):                                  │
│          prev, curr = curr, prev + curr                         │
│      return curr                                                │
│                                                                  │
│  AI Response:                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ 🎉 **OPTIMAL SOLUTION!**                                  │  │
│  │ **Approach:** Bottom-Up Tabulation with O(1) Space        │  │
│  │ **Complexity:** O(n) time, O(1) space                     │  │
│  │                                                            │  │
│  │ Brilliant! You've reached the optimal solution!            │  │
│  │                                                            │  │
│  │ ```mermaid                                                 │  │
│  │ graph LR                                                   │  │
│  │   subgraph "Iteration Flow"                                │  │
│  │     S0["prev=0, curr=1"] --> S1["prev=1, curr=1"]         │  │
│  │     S1 --> S2["prev=1, curr=2"]                            │  │
│  │     S2 --> S3["prev=2, curr=3"]                            │  │
│  │     S3 --> S4["prev=3, curr=5"]                            │  │
│  │   end                                                      │  │
│  │   style S4 fill:#51cf66                                    │  │
│  │ ```                                                        │  │
│  │                                                            │  │
│  │ Your journey:                                              │  │
│  │ • Attempt 1: O(2^n) → Brute Force Recursion               │  │
│  │ • Attempt 2: O(n), O(n) → Memoization                    │  │
│  │ • Attempt 3: O(n), O(1) → Optimal! ⭐                    │  │
│  │                                                            │  │
│  │ **+50 XP earned!**                                         │  │
│  │                                                            │  │
│  │ 🧠 **Bonus Challenge:** There's actually an O(log n)      │  │
│  │ solution using matrix exponentiation. Want to explore it?  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

> **This document covers the complete DSA module design.** For System Design and Web Dev modules, see their respective blueprints.