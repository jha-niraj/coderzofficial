# Project Module Enhancement Plan: "Learn by Building"

## 1. Executive Summary
The logical next step for the CoderzProject module is to shift from a "Task Tracker" to an "Interactive Learning Environment". Currently, tasks are presented as static To-Do items with basic descriptions. The goal is to transform each task into a mini-lesson that verifies the user's understanding through quizzes, code validation, and simulated interviews, rather than just asking them to "mark as complete".

## 2. Core Philosophy
*   **Teach, Don't Tell**: Instead of providing code snippets, provide *concepts* and *references*.
*   **Trust, but Verify**: Users cannot simply click "Completed". They must prove they did the work.
*   **Holistic Growth**: Assessments shouldn't just check if code runs, but if the user *understands* why it runs (Mock Interviews).

## 3. User Journey Flowchart

```mermaid
graph TD
    A[Start Sprint] --> B{Task Type?}
    
    B -->|Development| C[Concept Phase]
    B -->|Quiz Only| D[Knowledge Check]
    B -->|Milestone| E[Major Review]

    C --> C1[Read Concepts / Docs]
    C1 --> C2[View Implementation Steps (No Code)]
    C2 --> C3[User Implements Locally]
    C3 --> F{Validation Method}

    F -->|Code Check| G[Paste Logic / Regex Check]
    F -->|Quiz| H[Concept Quiz]
    F -->|Mock Interview| I[AI Voice/Text Interview]

    G -->|Fail| C1
    H -->|Fail| C1
    I -->|Fail| C1

    G -->|Pass| J[Task Complete]
    H -->|Pass| J
    I -->|Pass| J

    J --> K[Unlock Next Task]
```

## 4. Enhanced Task Structure
We need to treat tasks as "Modules". A task is no longer just a title and description. It is a container for:

### A. The "Learn" Section (Pre-work)
Before showing *what* to build, we show *concepts*.
*   **Example**: For "Register API", do not show `app.post('/register')`.
*   **Show**: "HTTP Methods: POST vs GET", "Status Codes: 201 Created", "Password Hashing (bcrypt)".
*   **Goal**: Ensure the user has the mental model before coding.

### B. The "Build" Section (Execution)
Instructions should be algorithmic:
1.  "Create a route handler for user registration."
2.  "Validate that specific fields (email, password) are present in the request body."
3.  "Check if the user already exists in the database."
4.  "Hash the password using a library like bcrypt."
5.  "Store the user and return a 201 status code without the password."

### C. The "Verify" Section (Assessment)
This is the biggest change. A task is not complete until it passes one of these gates:

#### type: `CODE_CHECK`
*   **Description**: We ask the user to paste a specific function or file content.
*   **Mechanism**: We use AI (LLM) or Regex to verify specific patterns.
*   **Example**: "Paste your `registerUser` controller function."
*   **Check**: Does it contain `await hash(...)`? Does it return `201`?

#### type: `QUIZ`
*   **Description**: Multiple-choice questions about the implementation choices.
*   **Mechanism**: 3-5 questions generated based on the task context.
*   **Example**: 
    *   Q: "Why should we hash the password before saving?"
    *   A: "To prevent storing plain-text credentials in case of a DB leak."

#### type: `MOCK_INTERVIEW` (Premium/Milestone)
*   **Description**: A chat interface (text or voice) where the AI acts as a Senior Dev.
*   **Mechanism**: The AI asks: "Walk me through how you handled error cases in your registration API."
*   **Criteria**: The user must explain *conceptually*, not just read code.

## 5. Implementation Strategy

### Phase 1: Data Model Updates (Schema)
The `Task` model needs to be expanded or related to a new `TaskLearningModule` model.
```prisma
model TaskAssessment {
  id            String   @id @default(cuid())
  taskId        String
  type          AssessmentType // QUIZ, CODE_CHECK, INTERVIEW
  content       Json     // Questions, Regex patterns, or Interview prompt
  passingScore  Int      @default(80)
}
```

### Phase 2: UI Overhaul (Task Details)
*   **Left Column**: The "Guide". Tabs for "Concepts" and "Instructions".
*   **Right Column/Overlay**: The "Workstation". 
    *   When user clicks "Submit", a drawer opens with the specific assessment (Quiz form, Code pastebox, or Chat window).
*   **Gamification**: 
    *   "First Try" bonus XP.
    *   "Streak" for completing daily tasks.

### Phase 3: Content Generation (AI)
We need to prompt the AI generator differently.
*   **Old Prompt**: "Generate tasks for a blog app."
*   **New Prompt**: "Generate a learning module for a blog app. For the 'Create Post' task, provide 3 key concepts (e.g., Foreign Keys), 5 algorithmic steps, 3 quiz questions, and 1 interview question."

## 6. Detailed Example: "Implement User Registration"

**1. Concepts Tab:**
*   Brief explanation of REST APIs.
*   Link to internal docs on Prisma/Mongoose.
*   Diagram of Client -> Server -> DB flow.

**2. Instructions Tab:**
*   "Define a schema with `email` (unique) and `password`."
*   "Create a POST route."
*   "Implement validation logic."

**3. Assessment (Quiz):**
*   Q1: Which HTTP status code should be returned on success? (200, 201, 204) -> Correct: 201.
*   Q2: What happens if you try to register the same email twice? (Crash, Overwrite, Error) -> Correct: Error.

**4. Assessment (Code Check):**
*   Prompt: "Submit your error handling block."
*   Check: AI verifies `try/catch` usage and generic error response masking.

**5. Completion:**
*   User passes -> Task turns Green -> Next task unlocks.
*   User fails -> AI suggests reading specific "Concepts" again.

## 7. Next Steps for Development
1.  **Backend**: Update `actions` to support creating extensive task metadata (Quiz/Concepts).
2.  **Frontend**: Redesign `TaskDetailSheet` to support the "Learn -> Build -> Verify" flow.
3.  **AI**: Tune the generation prompt to produce educational content, not just task titles.