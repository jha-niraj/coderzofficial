# Project Experience Redesign: Clean, Focused, & Efficient

## 1. Design Philosophy
The current interface suffers from "information overload" by trying to display high-level project management (settings, team, sprint timeline) alongside low-level execution details (task steps, terminal commands) on the same screen.

**The Solution:** Separation of Concerns.
1.  **Project Dashboard (The "Manager" View):** A clean, high-level overview for tracking progress, managing team members, and planning sprints.
2.  **Sprint Workspace (The "Maker" View):** A dedicated, focused environment for actually writing code and completing tasks, free from administrative clutter.

---

## 2. User Flow & Architecture

```mermaid
graph TD
    A[User Lands on Project] --> B{Has Sprints?}
    
    B -- No --> C[Project Dashboard (Empty State)]
    C --> D[Open Sprint Generator (AI)]
    D --> E[Review & Add Sprint]
    
    B -- Yes --> F[Project Dashboard (Timeline View)]
    F --> G[Select Active Sprint]
    
    G --> H[Enter Sprint Workspace]
    
    subgraph "Sprint Workspace (New Page)"
        H --> I[Task Navigation (Left)]
        I --> J[Active Task Detail (Center)]
        J --> K[Execute Terminal Commands]
        J --> L[Verify Checkpoints]
        
        J -- "Need Help?" --> M[Open Context Panel (Right Sheet)]
        M --> N[Resources & Docs]
        M --> O[Error Troubleshooting]
        M --> P[AI Suggestions]
    end
    
    L -- Task Complete --> I
    I -- All Tasks Done --> Q[Complete Sprint]
    Q --> F
```

---

## 3. Detailed Layout Specifications

### Page 1: The Project Dashboard (`/projects/[slug]`)
**Purpose:** Orientation, Setup, and Progress Tracking.
**Visual Style:** Premium, Spacious, "Landing Page" aesthetic.

*   **Hero Section:**
    *   Large Project Title & Description.
    *   Dynamic Background (Subtle gradient/mesh).
    *   Primary CTA: "Resume Sprint [X]" or "Start New Sprint".
    *   Secondary Actions: GitHub Repo Link, Live Demo Link.

*   **Main Content Area (Tabbed or Sectioned):**
    *   **Tab 1: Timeline (Default):**
        *   Vertical timeline of Sprints.
        *   Each Sprint Card shows: Title, Goal, Progress Bar, Status Badge (Todo, In Progress, Done).
        *   *No task details here* - just a summary "X/Y Tasks Pending".
        *   Clicking a Sprint Card opens the **Sprint Workspace**.
    *   **Tab 2: Setup & Config:**
        *   Repo initialization instructions.
        *   Env variable setup.
        *   Tech stack selection.
    *   **Tab 3: Team & Settings:**
        *   Member list (Avatar pile).
        *   Invites & Permissions.
        *   Visibility toggles.

*   **Floating Action:** "Generate Sprint" (Bottom right or Sticky Header).

### Page 2: The Sprint Workspace (New Route: `/projects/[slug]/sprint/[sprintId]`)
**Purpose:** Deep work, reading documentation, marking progress.
**Visual Style:** IDE-like, Compact, Functional (Linear, Linear-style).

*   **Layout (Three-Column / Collapsible):**
    
    *   **Left Sidebar (Navigation):**
        *   Sprint Progress Indicator (Circular/Linear).
        *   List of Tasks (Ordered).
        *   Status Icons (Circle: Todo, Spinner: In Progress, Check: Done).
        *   Clicking a task updates the Center View.
    
    *   **Center Stage (Task Execution):**
        *   **Header:** Task Title, Difficulty Badge, Est. Time.
        *   **Content:** 
            *   Description (Rich text).
            *   "How to build this" steps (Accordion/Steps UI).
            *   Terminal Command Snippet (Copyable).
            *   Checkpoints (Checkbox list).
        *   **Footer:** "Mark as Complete" / "Next Task".
    
    *   **Right Action Bar (Contextual Tools):**
        *   A thin icon strip (Resources, Errors, AI Hints).
        *   Clicking an icon expands a **Sheet/Panel** over the right side.
        *   **Resources Panel:** Links to documentation relevant to the *current task*.
        *   **Errors Panel:** Common pitfalls and fixes for this task.
        *   **Suggestions Panel:** AI hints or code snippets.

---

## 4. Visual Improvements (Aesthetics)

*   **Card Design:** Move away from generic bordered cards. Use "Glassmorphism" (bg-opacity/blur) on dark backgrounds for a modern feel.
*   **Typography:** Use a highly legible font for code (e.g., JetBrains Mono) and a clean sans-serif (Inter/Geist) for UI.
*   **Micro-interactions:** 
    *   Smooth transitions when switching tasks.
    *   Confetti/Animation when completing a sprint.
    *   Progress bars that "fill" with a glow effect.
*   **Color Palette:** 
    *   Use status colors effectively: Emerald (Success), Amber (Warning/Blocking), Indigo (Primary/Focus).
    *   Dark mode should be deep gray/black, not just plain gray, to pop the colors.

## 5. Implementation Strategy

1.  **Refactor `project-details-client.tsx`:** 
    *   Remove the in-page task expansion logic.
    *   Keep Sprints as high-level summaries.
    *   Add routing to the new Sprint Workspace page.
2.  **Create `SprintWorkspace` Component/Page:**
    *   Build the 3-column layout.
    *   Implement state for "Active Task".
    *   Connect "Complete Task" actions to Server Actions.
3.  **Migrate "Extras":**
    *   Move Resources/Errors logic into the Contextual Sheet within `SprintWorkspace`.

This approach keeps the main project page clean ("The Map") and makes the sprint page powerful ("The Terrain").