import { prisma } from '@repo/prisma';

export async function seedCppLearnContent() {
    console.log('📚 Seeding C++ Learn Content...');

    // Find admin user
    const admin = await prisma.user.findFirst({ where: { role: 'Admin' } });
    if (!admin) { console.log('⚠️ No admin user found, skipping C++ seed'); return; }
    const creatorId = admin.id;

    // 1. Create Main Category
    const programming = await prisma.learnMainCategory.upsert({
        where: { slug: 'programming' },
        update: {},
        create: { slug: 'programming', name: 'Programming', description: 'Learn programming languages and fundamentals', icon: '💻', color: '#3B82F6', order: 1 },
    });

    // 2. Create Sub Category
    const cpp = await prisma.learnSubCategory.upsert({
        where: { slug: 'cpp' },
        update: {},
        create: { slug: 'cpp', name: 'C++', description: 'Master C++ programming from basics to advanced concepts', mainCategoryId: programming.id, icon: '🔷', color: '#00599C', order: 1 },
    });

    // Helper to create a learn with steps
    async function createLearn(data: {
        slug: string; title: string; description: string; difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
        unitNumber: number; unitTitle: string; estimatedTime: number; tags: string[]; iconEmoji: string;
        steps: {
            order: number; title: string; type: string; content: string; tips?: string[]; stepData?: object;
            codeBlocks?: { order: number; title: string; language: string; code: string; explanation: string; highlightLines?: number[]; isRunnable?: boolean }[];
        }[];
    }) {
        const existing = await prisma.learn.findUnique({ where: { slug: data.slug } });
        if (existing) { console.log(`  ⏭️ Skipping ${data.slug} (exists)`); return existing; }

        const learn = await prisma.learn.create({
            data: {
                slug: data.slug, title: data.title, description: data.description,
                difficulty: data.difficulty as any, tags: data.tags, unitNumber: data.unitNumber, unitTitle: data.unitTitle,
                estimatedTime: data.estimatedTime, iconEmoji: data.iconEmoji, accentColor: '#00599C',
                status: 'PUBLISHED', publishedAt: new Date(), creatorId,
                mainCategoryId: programming.id, subCategoryId: cpp.id,
            },
        });

        for (const step of data.steps) {
            const createdStep = await prisma.learnStep.create({
                data: {
                    learnId: learn.id, order: step.order, title: step.title,
                    type: step.type as any, content: step.content,
                    tips: step.tips || [], stepData: step.stepData ? (step.stepData as any) : undefined,
                },
            });
            if (step.codeBlocks) {
                for (const cb of step.codeBlocks) {
                    await prisma.learnCodeBlock.create({
                        data: {
                            stepId: createdStep.id, order: cb.order, title: cb.title,
                            language: cb.language, code: cb.code, explanation: cb.explanation,
                            highlightLines: cb.highlightLines || [], showLineNumbers: true, isRunnable: cb.isRunnable ?? true,
                        },
                    });
                }
            }
        }
        console.log(`  ✅ Created: ${data.title} (${data.steps.length} steps)`);
        return learn;
    }

    await createLearn({
        slug: 'cpp-loops',
        title: 'Loops (for, while, do-while, range-based for, break, continue)',
        description:
            'Master all C++ loop constructs: the classic for loop, while loop, do-while loop, and the modern range-based for. Learn to control loop flow with break and continue. Each loop type is covered in depth with diagrams, code, and quizzes.',
        difficulty: 'BEGINNER',
        unitNumber: 2,
        unitTitle: 'Unit 2: Control Structures & Functions',
        estimatedTime: 55,
        tags: ['loops', 'for', 'while', 'do-while', 'range-based-for', 'break', 'continue', 'iteration'],
        iconEmoji: '🔁',
        steps: [
            // ─────────────────────────────────────────────────────────────────────
            // SECTION A: The for Loop
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 0,
                title: 'The for Loop — Concept & Syntax',
                type: 'EXPLANATION',
                tips: [
                    'Use for loops when you know how many times to iterate in advance.',
                    'All three parts of the for header (init, condition, update) are optional.',
                    'An empty for(;;) is an infinite loop — always make sure there is a way out!',
                ],
                content: `# The \`for\` Loop

    ## What is a Loop?

    A **loop** is a control structure that **repeats a block of code** as long as some condition is true. Instead of writing the same line ten times, you write it once inside a loop.

    ---

    ## The \`for\` Loop

    The \`for\` loop is the most commonly used loop in C++ because it packs **initialization**, **condition**, and **update** into a single, readable line.

    ### Syntax

    \`\`\`
    for (initialization; condition; update) {
        // loop body — runs repeatedly while condition is true
    }
    \`\`\`

    ### The Three Parts Explained

    | Part | What It Does | When It Runs |
    |------|-------------|--------------|
    | **Initialization** | Declares/sets the loop counter | **Once**, before the loop starts |
    | **Condition** | Boolean check — keep going? | **Before each iteration** |
    | **Update** | Changes the counter | **After each iteration** |

    ### Example: Count from 1 to 5

    \`\`\`cpp
    for (int i = 1; i <= 5; i++) {
        cout << i << " ";
    }
    // Output: 1 2 3 4 5
    \`\`\`

    **Step-by-step trace:**

    | Iteration | \`i\` at start | Condition \`i <= 5\` | Output | \`i\` after \`i++\` |
    |-----------|--------------|---------------------|--------|------------------|
    | 1st       | 1            | ✅ true              | 1      | 2                |
    | 2nd       | 2            | ✅ true              | 2      | 3                |
    | 3rd       | 3            | ✅ true              | 3      | 4                |
    | 4th       | 4            | ✅ true              | 4      | 5                |
    | 5th       | 5            | ✅ true              | 5      | 6                |
    | (check)   | 6            | ❌ false → **EXIT** | —      | —                |

    ---

    ## Counting Backwards

    Simply start high and decrement:

    \`\`\`cpp
    for (int i = 5; i >= 1; i--) {
        cout << i << " ";
    }
    // Output: 5 4 3 2 1
    \`\`\`

    ## Stepping by More Than 1

    \`\`\`cpp
    for (int i = 0; i <= 20; i += 5) {
        cout << i << " ";
    }
    // Output: 0 5 10 15 20
    \`\`\`

    ---

    ## Scope of the Loop Variable

    \`\`\`cpp
    for (int i = 0; i < 3; i++) {
        cout << i; // i is accessible here
    }
    // cout << i; // ❌ ERROR: i is out of scope here!
    \`\`\`

    > 💡 **Best Practice**: Declare the loop variable inside the \`for\` header — it keeps the variable scoped to the loop and prevents accidental reuse.`,
            },
            {
                order: 1,
                title: 'The for Loop — Code Examples',
                type: 'CODE',
                content:
                    '## Putting the `for` Loop to Work\n\nLet\'s see the `for` loop solving real problems — multiplication tables, summing numbers, and nested loops for 2D patterns.',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Multiplication Table',
                        language: 'cpp',
                        code: `#include <iostream>
    #include <iomanip>
    using namespace std;

    int main() {
        int n = 5; // Print the 5-times table

        cout << "=== Multiplication Table for " << n << " ===" << endl;

        for (int i = 1; i <= 10; i++) {
            // setw(3) right-aligns numbers in a 3-character wide field
            cout << n << " x " << setw(2) << i << " = " << setw(3) << n * i << endl;
        }

        return 0;
    }`,
                        explanation:
                            'The loop counter `i` goes from 1 to 10. Each iteration computes `n * i` and prints it. `setw()` from `<iomanip>` pads numbers so columns align neatly.',
                        highlightLines: [9, 11],
                        isRunnable: true,
                    },
                    {
                        order: 1,
                        title: 'Sum of Numbers (Accumulator Pattern)',
                        language: 'cpp',
                        code: `#include <iostream>
    using namespace std;

    int main() {
        // Classic accumulator pattern — very common in programming
        int sum = 0;

        for (int i = 1; i <= 100; i++) {
            sum += i; // Same as: sum = sum + i
        }

        cout << "Sum of 1 to 100 = " << sum << endl;
        // Expected: 5050 (Gauss's formula: n*(n+1)/2 = 100*101/2)

        return 0;
    }`,
                        explanation:
                            '`sum` is initialized to 0 before the loop. Each iteration adds `i` to `sum`. After 100 iterations, `sum` holds the total. This is the **accumulator pattern** — one of the most fundamental programming patterns.',
                        highlightLines: [6, 8, 9],
                        isRunnable: true,
                    },
                    {
                        order: 2,
                        title: 'Nested for Loops — Star Pattern',
                        language: 'cpp',
                        code: `#include <iostream>
    using namespace std;

    int main() {
        int rows = 5;

        // Outer loop controls the row
        for (int row = 1; row <= rows; row++) {

            // Inner loop controls how many stars per row
            for (int col = 1; col <= row; col++) {
                cout << "* ";
            }

            cout << endl; // Move to next line after each row
        }

        // Output:
        // *
        // * *
        // * * *
        // * * * *
        // * * * * *

        return 0;
    }`,
                        explanation:
                            'The **outer loop** runs 5 times (one per row). For each row, the **inner loop** runs `row` times, printing that many stars. The inner loop\'s range depends on the outer variable — this is the key to building 2D patterns.',
                        highlightLines: [7, 10, 11, 15],
                        isRunnable: true,
                    },
                ],
            },
            {
                order: 2,
                title: 'The for Loop — Visual Flowchart',
                type: 'VISUAL',
                content: `# How the \`for\` Loop Works Internally

    ## Execution Flowchart

    \`\`\`
    ┌─────────────────────────────────────┐
    │            for loop starts           │
    └──────────────────┬──────────────────┘
                       │
             ┌─────────▼──────────┐
             │  1. Initialization  │  ← Runs ONCE (e.g., int i = 0)
             └─────────┬──────────┘
                       │
             ┌─────────▼──────────┐
        ┌────│  2. Check Condition │────┐
        │    └────────────────────┘    │
        │         TRUE │               │ FALSE
        │    ┌─────────▼──────────┐    │
        │    │   3. Execute Body  │    │
        │    └─────────┬──────────┘    │
        │              │               │
        │    ┌─────────▼──────────┐    │
        │    │   4. Update (i++)  │    │
        │    └─────────┬──────────┘    │
        │              │               │
        └──────────────┘    ┌──────────▼──────────┐
                            │    Loop Ends / Done  │
                            └─────────────────────┘
    \`\`\`

    ---

    ## Memory Trace: \`for (int i = 1; i <= 3; i++)\`

    \`\`\`
    Step 1: INIT        → i = 1  (allocated on stack)
    Step 2: CONDITION   → i <= 3 → 1 <= 3 → ✅ TRUE  → run body
    Step 3: UPDATE      → i = 2
    Step 4: CONDITION   → 2 <= 3 → ✅ TRUE  → run body
    Step 5: UPDATE      → i = 3
    Step 6: CONDITION   → 3 <= 3 → ✅ TRUE  → run body
    Step 7: UPDATE      → i = 4
    Step 8: CONDITION   → 4 <= 3 → ❌ FALSE → EXIT loop
    Step 9: i is DESTROYED (out of scope)
    \`\`\`

    ---

    ## Nested Loop Execution Order

    For a \`5 x 5\` nested loop:

    \`\`\`
    outer i=0 │ inner j=0 j=1 j=2 j=3 j=4  │ endl
    outer i=1 │ inner j=0 j=1 j=2 j=3 j=4  │ endl
    outer i=2 │ inner j=0 j=1 j=2 j=3 j=4  │ endl
    outer i=3 │ inner j=0 j=1 j=2 j=3 j=4  │ endl
    outer i=4 │ inner j=0 j=1 j=2 j=3 j=4  │ endl

    Total iterations = 5 × 5 = 25
    \`\`\`

    > ⚠️ **Performance Warning**: Nested loops multiply their iteration counts. A loop with N=1000 inside another N=1000 runs **1,000,000** times!

    ---

    ## Common for Loop Patterns at a Glance

    \`\`\`
    Count up:     for (int i = 0; i < n; i++)
    Count down:   for (int i = n-1; i >= 0; i--)
    Step by k:    for (int i = 0; i <= n; i += k)
    Even nums:    for (int i = 0; i <= n; i += 2)
    Infinite:     for (;;) { /* need a break! */ }
    \`\`\``,
            },
            {
                order: 3,
                title: 'Quiz: The for Loop',
                type: 'QUIZ',
                content: '## Test Your Understanding of the `for` Loop',
                stepData: {
                    questions: [
                        {
                            question: 'How many times does the body of `for (int i = 0; i < 5; i++)` execute?',
                            options: [
                                { id: 'a', text: '4', isCorrect: false },
                                { id: 'b', text: '5', isCorrect: true },
                                { id: 'c', text: '6', isCorrect: false },
                                { id: 'd', text: 'infinite', isCorrect: false },
                            ],
                            explanation:
                                'i goes through values 0, 1, 2, 3, 4 — that is 5 values. When i reaches 5, the condition `i < 5` is false and the loop exits.',
                        },
                        {
                            question: 'In `for (int i = 0; i < 10; i++)`, when does the initialization part run?',
                            options: [
                                { id: 'a', text: 'Before every iteration', isCorrect: false },
                                { id: 'b', text: 'After every iteration', isCorrect: false },
                                { id: 'c', text: 'Exactly once, before the loop starts', isCorrect: true },
                                { id: 'd', text: 'After the last iteration', isCorrect: false },
                            ],
                            explanation:
                                'The initialization (`int i = 0`) runs exactly once before the loop begins. The condition and update run on every iteration.',
                        },
                        {
                            question: 'What is the output of: `for (int i = 0; i < 3; i++) cout << i;`',
                            options: [
                                { id: 'a', text: '1 2 3', isCorrect: false },
                                { id: 'b', text: '0 1 2', isCorrect: true },
                                { id: 'c', text: '0 1 2 3', isCorrect: false },
                                { id: 'd', text: '1 2', isCorrect: false },
                            ],
                            explanation: 'i starts at 0 and goes up to but NOT including 3, printing 0, 1, 2.',
                        },
                        {
                            question: 'What does a nested loop with outer N=3 and inner N=4 give as total iterations?',
                            options: [
                                { id: 'a', text: '7', isCorrect: false },
                                { id: 'b', text: '16', isCorrect: false },
                                { id: 'c', text: '12', isCorrect: true },
                                { id: 'd', text: '9', isCorrect: false },
                            ],
                            explanation: 'Nested loops multiply: outer 3 × inner 4 = 12 total iterations.',
                        },
                        {
                            question: 'Which part of the for loop is optional (all three can actually be omitted)?',
                            options: [
                                { id: 'a', text: 'Only the initialization', isCorrect: false },
                                { id: 'b', text: 'Only the update', isCorrect: false },
                                { id: 'c', text: 'None of them — all are required', isCorrect: false },
                                { id: 'd', text: 'All three parts are optional', isCorrect: true },
                            ],
                            explanation:
                                'All three parts can be omitted: `for (;;)` is a valid infinite loop. You can also move init before the loop and update inside the body.',
                        },
                    ],
                },
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION B: The while Loop
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 4,
                title: 'The while Loop — Concept & Syntax',
                type: 'EXPLANATION',
                tips: [
                    'Use while when you do NOT know in advance how many iterations are needed.',
                    'Always make sure the condition can eventually become false — otherwise it is an infinite loop!',
                    'A while loop can run zero times if the condition is false from the start.',
                ],
                content: `# The \`while\` Loop

    ## When to Use \`while\`

    Use \`while\` when you want to repeat something **until a condition changes**, and you **don't know upfront** how many iterations you'll need.

    Classic examples:
    - Keep asking for input until the user types "quit"
    - Keep dividing a number until it reaches 1
    - Keep reading from a file until there's nothing left

    ---

    ## Syntax

    \`\`\`cpp
    while (condition) {
        // loop body
        // IMPORTANT: something here must eventually make condition false!
    }
    \`\`\`

    The condition is checked **before each iteration**. If it's false from the start, the body **never runs at all**.

    ---

    ## Anatomy of a while Loop

    \`\`\`cpp
    int count = 1;           // ① Initialize BEFORE the loop

    while (count <= 5) {     // ② Condition checked at TOP
        cout << count;       // ③ Body executes
        count++;             // ④ Update — MUST change the condition eventually!
    }
    \`\`\`

    > ⚠️ **Most Common Bug**: Forgetting the update step ④. Without it, \`count\` stays at 1 forever → **infinite loop**.

    ---

    ## for vs while: They Are Equivalent

    Any \`for\` loop can be rewritten as a \`while\` loop:

    \`\`\`cpp
    // for version
    for (int i = 0; i < 5; i++) {
        cout << i;
    }

    // Equivalent while version
    int i = 0;           // init
    while (i < 5) {      // condition
        cout << i;
        i++;             // update
    }
    \`\`\`

    **Rule of thumb:**
    - Know the count in advance? → **\`for\`**
    - Condition-driven, unknown count? → **\`while\`**

    ---

    ## Infinite Loops (Intentional)

    Sometimes you want an infinite loop with a manual exit:

    \`\`\`cpp
    while (true) {
        // do work...
        if (exitCondition) break; // exit when ready
    }
    \`\`\``,
            },
            {
                order: 5,
                title: 'The while Loop — Code Examples',
                type: 'CODE',
                content:
                    '## Practical `while` Loop Examples\n\nInput validation, digit counting, and a guessing game — all cases where `while` shines because we don\'t know how many iterations are needed.',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Input Validation (a classic while use case)',
                        language: 'cpp',
                        code: `#include <iostream>
    using namespace std;

    int main() {
        int age;

        // Keep asking until the user gives a valid age
        cout << "Enter your age (1-120): ";
        cin >> age;

        while (age < 1 || age > 120) {
            cout << "Invalid! Please enter an age between 1 and 120: ";
            cin >> age;
        }

        cout << "Welcome! Your age is " << age << endl;
        return 0;
    }`,
                        explanation:
                            'The while loop keeps running as long as the input is outside the valid range. Once the user provides a valid age, the condition becomes false and the loop exits. The body might run 0 times if the first input is valid!',
                        highlightLines: [10, 11, 12],
                        isRunnable: true,
                    },
                    {
                        order: 1,
                        title: 'Count Digits in a Number',
                        language: 'cpp',
                        code: `#include <iostream>
    using namespace std;

    int main() {
        int number = 847392;
        int digitCount = 0;

        // We don't know how many times to loop — while is perfect here
        int temp = number;
        while (temp > 0) {
            temp /= 10;       // Remove the last digit (integer division)
            digitCount++;     // Count it
        }

        cout << number << " has " << digitCount << " digits." << endl;
        // Output: 847392 has 6 digits.

        return 0;
    }`,
                        explanation:
                            'We don\'t know how many digits the number has until we count them. `temp /= 10` strips off the rightmost digit each iteration. When `temp` becomes 0, all digits have been counted.',
                        highlightLines: [9, 10, 11, 12],
                        isRunnable: true,
                    },
                    {
                        order: 2,
                        title: 'Number Guessing Game',
                        language: 'cpp',
                        code: `#include <iostream>
    #include <cstdlib>  // for rand(), srand()
    #include <ctime>    // for time()
    using namespace std;

    int main() {
        srand(time(0)); // Seed random with current time
        int secret = rand() % 100 + 1; // Random number 1-100
        int guess = 0;
        int attempts = 0;

        cout << "=== Number Guessing Game ===" << endl;
        cout << "Guess a number between 1 and 100!" << endl;

        while (guess != secret) {
            cout << "Your guess: ";
            cin >> guess;
            attempts++;

            if (guess < secret) {
                cout << "Too low! Try higher." << endl;
            } else if (guess > secret) {
                cout << "Too high! Try lower." << endl;
            } else {
                cout << "🎉 Correct! You got it in " << attempts << " attempts!" << endl;
            }
        }

        return 0;
    }`,
                        explanation:
                            'This is a perfect while loop use case — we loop until `guess == secret`, and we have no way to know how many guesses the user will need. The loop body provides hints to guide the user.',
                        highlightLines: [15, 17, 18],
                        isRunnable: true,
                    },
                ],
            },
            {
                order: 6,
                title: 'The while Loop — Visual Flowchart',
                type: 'VISUAL',
                content: `# How the \`while\` Loop Works

    ## Execution Flowchart

    \`\`\`
             ┌──────────────────────┐
             │       Start          │
             └──────────┬───────────┘
                        │
             ┌──────────▼───────────┐
        ┌────│   Check Condition    │────┐
        │    └──────────────────────┘    │
        │          TRUE │                │ FALSE
        │    ┌──────────▼───────────┐    │
        │    │   Execute Loop Body  │    │
        │    └──────────┬───────────┘    │
        │               │                │
        └───────────────┘   ┌────────────▼─────────┐
                            │   After Loop / Done   │
                            └──────────────────────┘
    \`\`\`

    > 🔑 **Key**: The condition is checked **BEFORE** every iteration, including the very first one. The body might never execute!

    ---

    ## for vs while: Side-by-Side Comparison

    \`\`\`
    ┌──────────────────────────────┬───────────────────────────────────────────┐
    │          for loop            │               while loop                   │
    ├──────────────────────────────┼───────────────────────────────────────────┤
    │ for (int i=0; i<n; i++) {   │  int i = 0;                               │
    │     // body                  │  while (i < n) {                          │
    │ }                            │      // body                              │
    │                              │      i++;                                 │
    │                              │  }                                        │
    ├──────────────────────────────┼───────────────────────────────────────────┤
    │ Use when: count is KNOWN     │  Use when: count is UNKNOWN               │
    │ Init, cond, update bundled   │  Init before loop, update inside body     │
    │ Can run 0 times              │  Can run 0 times                          │
    └──────────────────────────────┴───────────────────────────────────────────┘
    \`\`\`

    ---

    ## The Infinite Loop Trap

    \`\`\`
    int i = 0;
    while (i < 5) {
        cout << i;
        // 🐛 BUG: forgot i++
        // i never changes → condition always true → INFINITE LOOP!
    }

    // FIX: Add i++ inside the body
    while (i < 5) {
        cout << i;
        i++;  // ✅ condition will eventually become false
    }
    \`\`\``,
            },
            {
                order: 7,
                title: 'Quiz: The while Loop',
                type: 'QUIZ',
                content: '## Test Your Understanding of the `while` Loop',
                stepData: {
                    questions: [
                        {
                            question: 'When does the while loop check its condition?',
                            options: [
                                { id: 'a', text: 'After each iteration', isCorrect: false },
                                { id: 'b', text: 'Before each iteration (including the first)', isCorrect: true },
                                { id: 'c', text: 'Only once at the start', isCorrect: false },
                                { id: 'd', text: 'Only after the body runs at least once', isCorrect: false },
                            ],
                            explanation:
                                'The while loop checks the condition BEFORE every iteration. If the condition is false from the very beginning, the body never executes.',
                        },
                        {
                            question:
                                'What happens if the condition in a while loop is always true and there is no break?',
                            options: [
                                { id: 'a', text: 'Compilation error', isCorrect: false },
                                { id: 'b', text: 'The loop runs exactly 1000 times then stops', isCorrect: false },
                                { id: 'c', text: 'Infinite loop — the program hangs', isCorrect: true },
                                { id: 'd', text: 'The compiler warns and the loop is skipped', isCorrect: false },
                            ],
                            explanation:
                                'If the condition never becomes false and there is no break, the loop runs forever. Always ensure the loop body can change the condition.',
                        },
                        {
                            question:
                                'If `count = 10` and the while condition is `count < 5`, how many times does the body run?',
                            options: [
                                { id: 'a', text: '10', isCorrect: false },
                                { id: 'b', text: '5', isCorrect: false },
                                { id: 'c', text: '0', isCorrect: true },
                                { id: 'd', text: '1', isCorrect: false },
                            ],
                            explanation:
                                '10 < 5 is false immediately, so the while body never executes. This is why while loops can run zero times.',
                        },
                        {
                            question: 'Which scenario is a better fit for a while loop than a for loop?',
                            options: [
                                { id: 'a', text: 'Printing numbers 1 to 100', isCorrect: false },
                                { id: 'b', text: 'Iterating over each element of an array of 50 elements', isCorrect: false },
                                { id: 'c', text: 'Repeating until the user types "quit"', isCorrect: true },
                                { id: 'd', text: 'Computing the sum of 1 to N', isCorrect: false },
                            ],
                            explanation:
                                'When you don\'t know how many iterations are needed upfront — like waiting for user input — while is the natural choice. For known counts, use for.',
                        },
                        {
                            question: 'What is `while (true)` commonly used for?',
                            options: [
                                { id: 'a', text: 'It is always a bug', isCorrect: false },
                                { id: 'b', text: 'An intentional infinite loop controlled by a break statement', isCorrect: true },
                                { id: 'c', text: 'Running exactly once', isCorrect: false },
                                { id: 'd', text: 'Compiler optimization hint', isCorrect: false },
                            ],
                            explanation:
                                '`while (true)` is a common idiom for game loops, server loops, and menu-driven programs. It runs forever until a `break` statement is hit.',
                        },
                    ],
                },
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION C: The do-while Loop
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 8,
                title: 'The do-while Loop — Concept & Syntax',
                type: 'EXPLANATION',
                tips: [
                    'do-while guarantees the body runs at least once — great for menus and initial prompts.',
                    'Don\'t forget the semicolon after the closing parenthesis of do-while: `} while (condition);`',
                    'If you need the body to always run at least once, use do-while. Otherwise, while or for are usually clearer.',
                ],
                content: `# The \`do-while\` Loop

    ## The Key Difference

    Unlike \`for\` and \`while\`, the \`do-while\` loop checks its condition **AFTER** the body runs. This means the body **always executes at least once**, no matter what.

    ---

    ## Syntax

    \`\`\`cpp
    do {
        // loop body — runs at LEAST once
    } while (condition); // ← semicolon is REQUIRED here!
    \`\`\`

    ---

    ## Comparison: while vs do-while

    \`\`\`cpp
    // while: condition checked FIRST
    int x = 10;
    while (x < 5) {
        cout << "while runs";  // Never prints! 10 < 5 is false.
    }

    // do-while: body runs FIRST
    int y = 10;
    do {
        cout << "do-while runs"; // Prints ONCE, even though 10 < 5 is false!
    } while (y < 5);
    \`\`\`

    ---

    ## The Menu System — A Perfect Use Case

    The most classic use of \`do-while\` is a menu:

    \`\`\`cpp
    int choice;
    do {
        cout << "1. Start Game" << endl;
        cout << "2. Settings" << endl;
        cout << "3. Quit" << endl;
        cout << "Choose: ";
        cin >> choice;
    } while (choice != 3); // Keep showing menu until user chooses Quit
    \`\`\`

    The menu **must display at least once** — \`do-while\` is the natural fit.

    ---

    ## Equivalence with while

    Every \`do-while\` can be rewritten as a \`while\` with the body duplicated before the loop:

    \`\`\`cpp
    // do-while version (cleaner)
    do {
        // body
    } while (condition);

    // Equivalent while version (messier — body code is repeated)
    // body      ← runs once before the loop
    while (condition) {
        // body  ← same body again
    }
    \`\`\`

    > 💡 When you find yourself running the body once before a while loop, switch to \`do-while\`.`,
            },
            {
                order: 9,
                title: 'The do-while Loop — Code Examples',
                type: 'CODE',
                content: '## Practical `do-while` Examples\n\nMenus, input validation, and ATM-style programs.',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Menu-Driven Program',
                        language: 'cpp',
                        code: `#include <iostream>
    using namespace std;

    int main() {
        int choice;

        do {
            // Menu always shows at least once
            cout << "\\n=== Main Menu ===" << endl;
            cout << "1. Say Hello" << endl;
            cout << "2. Show current count" << endl;
            cout << "3. Quit" << endl;
            cout << "Enter choice (1-3): ";
            cin >> choice;

            switch (choice) {
                case 1:
                    cout << "Hello, World! 👋" << endl;
                    break;
                case 2:
                    cout << "This feature is under construction." << endl;
                    break;
                case 3:
                    cout << "Goodbye! 👋" << endl;
                    break;
                default:
                    cout << "Invalid choice. Please try again." << endl;
            }

        } while (choice != 3); // Keep looping until user chooses Quit

        return 0;
    }`,
                        explanation:
                            'The do-while ensures the menu always appears at least once. After each action, the condition is checked — if the user chose 3 (Quit), the loop ends; otherwise the menu reappears.',
                        highlightLines: [7, 29],
                        isRunnable: true,
                    },
                    {
                        order: 1,
                        title: 'Password Validation',
                        language: 'cpp',
                        code: `#include <iostream>
    #include <string>
    using namespace std;

    int main() {
        string password;
        const string CORRECT = "cpp2024"; // In real code, never hardcode passwords!
        int attempts = 0;
        const int MAX_ATTEMPTS = 3;

        do {
            cout << "Enter password: ";
            cin >> password;
            attempts++;

            if (password != CORRECT) {
                int remaining = MAX_ATTEMPTS - attempts;
                if (remaining > 0) {
                    cout << "Wrong password! " << remaining << " attempt(s) remaining." << endl;
                }
            }

        } while (password != CORRECT && attempts < MAX_ATTEMPTS);

        if (password == CORRECT) {
            cout << "✅ Access granted!" << endl;
        } else {
            cout << "❌ Too many failed attempts. Account locked." << endl;
        }

        return 0;
    }`,
                        explanation:
                            'The user must be asked for a password at least once (do-while). The loop continues while the password is wrong AND attempts remain. Notice the dual exit condition with &&.',
                        highlightLines: [11, 22, 24],
                        isRunnable: true,
                    },
                ],
            },
            {
                order: 10,
                title: 'The do-while Loop — Visual Flowchart',
                type: 'VISUAL',
                content: `# How the \`do-while\` Loop Works

    ## Execution Flowchart

    \`\`\`
             ┌──────────────────────┐
             │        Start         │
             └──────────┬───────────┘
                        │
             ┌──────────▼───────────┐
             │   Execute Loop Body  │  ← Runs FIRST, before any check!
             └──────────┬───────────┘
                        │
             ┌──────────▼───────────┐
        ┌────│   Check Condition    │────┐
        │    └──────────────────────┘    │
        │          TRUE │                │ FALSE
        └───────────────┘   ┌────────────▼─────────┐
        (back to body)      │   After Loop / Done   │
                            └──────────────────────┘
    \`\`\`

    > 🔑 **The body runs FIRST. The condition is checked AFTER.**

    ---

    ## Three Loops: Side-by-Side

    \`\`\`
    ┌────────────────────┬───────────────────┬───────────────────────────┐
    │     for loop       │    while loop      │      do-while loop        │
    ├────────────────────┼───────────────────┼───────────────────────────┤
    │ Condition: BEFORE  │ Condition: BEFORE  │ Condition: AFTER          │
    │ Min runs: 0        │ Min runs: 0        │ Min runs: 1 (guaranteed)  │
    │ Use when: count    │ Use when: unknown  │ Use when: body must run   │
    │   is known         │   iterations       │   at least once           │
    └────────────────────┴───────────────────┴───────────────────────────┘
    \`\`\`

    ---

    ## The Semicolon Trap

    \`\`\`cpp
    // ✅ Correct — semicolon after closing parenthesis
    do {
        // body
    } while (condition);
                 ↑
             Required!

    // ❌ Wrong — missing semicolon causes compilation error
    do {
        // body
    } while (condition)   // ERROR: expected ';'
    \`\`\`

    ---

    ## When Does do-while Shine vs When to Avoid?

    \`\`\`
    ✅ Good use cases:
       • Menu systems (always show once)
       • Input validation (always ask once)
       • Game loops (always play at least one frame)
       • "Try at least once" retry logic

    ⚠️ Avoid when:
       • The body might logically need to run 0 times
       • A simple for or while is clearer
    \`\`\``,
            },
            {
                order: 11,
                title: 'Quiz: The do-while Loop',
                type: 'QUIZ',
                content: '## Test Your Understanding of the `do-while` Loop',
                stepData: {
                    questions: [
                        {
                            question: 'What is the minimum number of times a do-while loop body executes?',
                            options: [
                                { id: 'a', text: '0', isCorrect: false },
                                { id: 'b', text: '1', isCorrect: true },
                                { id: 'c', text: '2', isCorrect: false },
                                { id: 'd', text: 'Depends on the condition', isCorrect: false },
                            ],
                            explanation:
                                'The do-while body always runs at least once because the condition is checked AFTER the body executes.',
                        },
                        {
                            question:
                                'What is syntactically required at the end of a do-while statement that is NOT required for while or for?',
                            options: [
                                { id: 'a', text: 'A break statement', isCorrect: false },
                                { id: 'b', text: 'A closing brace', isCorrect: false },
                                { id: 'c', text: 'A semicolon after the closing parenthesis', isCorrect: true },
                                { id: 'd', text: 'A return statement', isCorrect: false },
                            ],
                            explanation:
                                '`do { } while (condition);` — The semicolon after the closing parenthesis is mandatory. Forgetting it is a compilation error.',
                        },
                        {
                            question:
                                'Given `int x = 100;` and `do { cout << x; } while (x < 5);`, what is printed?',
                            options: [
                                { id: 'a', text: 'Nothing is printed', isCorrect: false },
                                { id: 'b', text: '100', isCorrect: true },
                                { id: 'c', text: '1 2 3 4 5', isCorrect: false },
                                { id: 'd', text: 'Infinite output', isCorrect: false },
                            ],
                            explanation:
                                'The body runs once printing 100, then the condition `100 < 5` is checked — it\'s false, so the loop exits. Only 100 is printed.',
                        },
                        {
                            question: 'Which scenario is best suited for a do-while loop?',
                            options: [
                                { id: 'a', text: 'Iterating over an array of known size', isCorrect: false },
                                { id: 'b', text: 'Displaying a menu that must always appear at least once', isCorrect: true },
                                { id: 'c', text: 'Summing numbers when there might be zero numbers', isCorrect: false },
                                { id: 'd', text: 'Processing a file that might be empty', isCorrect: false },
                            ],
                            explanation:
                                'A menu must always be displayed at least once so the user can make a choice. do-while guarantees one execution before the exit condition is checked.',
                        },
                    ],
                },
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION D: Range-Based for Loop (C++11)
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 12,
                title: 'Range-Based for Loop (C++11)',
                type: 'EXPLANATION',
                tips: [
                    'Use `const auto&` when you only need to read elements — it avoids copying and prevents accidental modification.',
                    'Use `auto&` when you need to modify elements in place.',
                    'Range-based for works on arrays, vectors, strings, maps, sets, and any container with begin()/end().',
                ],
                content: `# Range-Based \`for\` Loop (C++11)

    ## The Problem with Traditional Loops Over Collections

    \`\`\`cpp
    int arr[] = {10, 20, 30, 40, 50};
    int size = 5;

    // Old way — verbose, error-prone index management
    for (int i = 0; i < size; i++) {
        cout << arr[i] << " ";
    }
    \`\`\`

    This works, but you have to track the index \`i\` and the array size manually. Off-by-one errors are common.

    ---

    ## The Range-Based for Loop

    C++11 introduced a cleaner syntax for iterating over **every element** of a collection:

    \`\`\`cpp
    for (type element : collection) {
        // use element
    }
    \`\`\`

    Same example, now cleaner:

    \`\`\`cpp
    int arr[] = {10, 20, 30, 40, 50};

    for (int x : arr) {   // "for each x in arr"
        cout << x << " "; // x is a COPY of each element
    }
    // Output: 10 20 30 40 50
    \`\`\`

    ---

    ## Copy vs Reference

    \`\`\`cpp
    // BY VALUE (copy) — changes to x do NOT affect the original
    for (int x : arr) {
        x *= 2; // This only changes the local copy!
    }

    // BY REFERENCE — changes DO affect the original
    for (int& x : arr) {
        x *= 2; // ✅ This multiplies each element in arr by 2
    }

    // BY CONST REFERENCE — read-only, no copying (most efficient for big objects)
    for (const int& x : arr) {
        cout << x; // Efficient read, compiler prevents modification
    }
    \`\`\`

    ---

    ## Using \`auto\` for Type Deduction

    Let the compiler figure out the element type:

    \`\`\`cpp
    vector<string> names = {"Alice", "Bob", "Charlie"};

    for (const auto& name : names) { // auto deduces: const string&
        cout << name << endl;
    }
    \`\`\`

    ---

    ## Works With Many Types

    \`\`\`cpp
    // Iterating over a string character by character
    string word = "Hello";
    for (char ch : word) {
        cout << ch << " "; // H e l l o
    }
    \`\`\``,
            },
            {
                order: 13,
                title: 'Range-Based for Loop — Code Examples',
                type: 'CODE',
                content: '## Range-Based for in Action',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Arrays and Vectors',
                        language: 'cpp',
                        code: `#include <iostream>
    #include <vector>
    #include <string>
    using namespace std;

    int main() {
        // Works on raw arrays
        double grades[] = {92.5, 87.0, 95.5, 78.0, 88.5};
        double total = 0;

        for (double g : grades) {
            total += g;
        }
        cout << "Average: " << total / 5 << endl;

        // Works on vectors
        vector<string> fruits = {"Apple", "Banana", "Cherry", "Date"};

        cout << "Fruits: ";
        for (const auto& fruit : fruits) {
            cout << fruit << " ";
        }
        cout << endl;

        // Modifying elements with reference
        vector<int> numbers = {1, 2, 3, 4, 5};
        for (auto& n : numbers) {
            n *= n; // Square each number in-place
        }

        cout << "Squared: ";
        for (const auto& n : numbers) {
            cout << n << " "; // 1 4 9 16 25
        }
        cout << endl;

        return 0;
    }`,
                        explanation:
                            'Range-based for works on raw arrays, std::vector, and std::string. Use `const auto&` for read-only access (no copy), `auto&` when you need to modify elements.',
                        highlightLines: [10, 18, 25, 30],
                        isRunnable: true,
                    },
                ],
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION E: break and continue
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 14,
                title: 'break and continue — Loop Control',
                type: 'EXPLANATION',
                tips: [
                    '`break` exits the ENTIRE loop immediately.',
                    '`continue` skips only the CURRENT iteration and jumps to the next.',
                    'In nested loops, break/continue only affect the INNERMOST loop they are in.',
                    'Use break/continue sparingly — overuse makes code harder to follow.',
                ],
                content: `# \`break\` and \`continue\`

    ## Controlling Loop Flow

    Sometimes you need to exit a loop early or skip certain iterations. C++ provides two keywords for this:

    | Keyword | What It Does |
    |---------|-------------|
    | \`break\` | **Immediately exits** the entire loop |
    | \`continue\` | **Skips the rest of the current iteration**, jumps to next |

    ---

    ## \`break\` — Exit the Loop Early

    \`\`\`cpp
    for (int i = 0; i < 10; i++) {
        if (i == 5) break; // Stop the loop when i equals 5
        cout << i << " ";
    }
    // Output: 0 1 2 3 4
    \`\`\`

    Real use: **Searching** — stop as soon as you find what you want:

    \`\`\`cpp
    int target = 7;
    bool found = false;

    for (int i = 0; i < 100; i++) {
        if (arr[i] == target) {
            found = true;
            break; // No point continuing — we found it!
        }
    }
    \`\`\`

    ---

    ## \`continue\` — Skip This Iteration

    \`\`\`cpp
    for (int i = 0; i < 10; i++) {
        if (i % 2 == 0) continue; // Skip even numbers
        cout << i << " ";
    }
    // Output: 1 3 5 7 9
    \`\`\`

    Real use: **Filtering** — process only elements that meet a condition.

    ---

    ## break and continue in while Loops

    They work the same way:

    \`\`\`cpp
    int i = 0;
    while (i < 20) {
        i++;
        if (i % 3 == 0) continue; // Skip multiples of 3
        if (i > 10) break;        // Stop after 10
        cout << i << " ";
    }
    // Output: 1 2 4 5 7 8 10
    \`\`\`

    ---

    ## Nested Loops: break/continue Only Affects Innermost Loop

    \`\`\`cpp
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            if (j == 1) break; // Only breaks the INNER loop!
            cout << "(" << i << "," << j << ") ";
        }
    }
    // Output: (0,0) (1,0) (2,0)
    // Only j=0 is printed for each i because j=1 triggers break in the inner loop
    \`\`\``,
            },
            {
                order: 15,
                title: 'break and continue — Code Examples',
                type: 'CODE',
                content: '## break and continue in Practice',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Linear Search with break',
                        language: 'cpp',
                        code: `#include <iostream>
    using namespace std;

    int main() {
        int arr[] = {4, 17, 9, 3, 22, 8, 15, 6};
        int size = 8;
        int target = 22;
        int foundIndex = -1; // -1 means not found

        for (int i = 0; i < size; i++) {
            if (arr[i] == target) {
                foundIndex = i;
                break; // Found it! No need to check the rest.
            }
        }

        if (foundIndex != -1) {
            cout << "Found " << target << " at index " << foundIndex << endl;
        } else {
            cout << target << " not found in array." << endl;
        }

        return 0;
    }`,
                        explanation:
                            'Without break, the loop would check all 8 elements even after finding the target at index 4. break makes the search efficient by stopping as soon as a match is found.',
                        highlightLines: [12, 13],
                        isRunnable: true,
                    },
                    {
                        order: 1,
                        title: 'Filtering with continue',
                        language: 'cpp',
                        code: `#include <iostream>
    using namespace std;

    int main() {
        // Print only numbers that are:
        // - Not divisible by 2 (odd)
        // - Not divisible by 5

        cout << "Numbers 1-30 that are odd and not divisible by 5:" << endl;

        for (int i = 1; i <= 30; i++) {
            if (i % 2 == 0) continue;  // Skip even numbers
            if (i % 5 == 0) continue;  // Skip multiples of 5
            cout << i << " ";          // Only reaches here if both conditions pass
        }
        cout << endl;

        // Compare to equivalent nested if:
        // for (int i = 1; i <= 30; i++) {
        //     if (i % 2 != 0 && i % 5 != 0) {
        //         cout << i << " ";
        //     }
        // }

        return 0;
    }`,
                        explanation:
                            'continue lets you "early return" from an iteration. Each continue skips the rest of that iteration. This pattern is called a "guard clause" — filtering out unwanted cases early keeps the main logic cleaner.',
                        highlightLines: [11, 12, 13],
                        isRunnable: true,
                    },
                ],
            },
            {
                order: 16,
                title: 'break and continue — Visual Flowchart',
                type: 'VISUAL',
                content: `# How \`break\` and \`continue\` Affect Loop Flow

    ## break — Early Exit

    \`\`\`
    for (int i = 0; i < 10; i++) {
        if (i == 5) break;
        cout << i;
    }

    Flow:
    i=0 → condition ok → no break → print 0
    i=1 → condition ok → no break → print 1
    i=2 → condition ok → no break → print 2
    i=3 → condition ok → no break → print 3
    i=4 → condition ok → no break → print 4
    i=5 → condition ok → BREAK ──────────────────► EXIT LOOP
                                                    (i=6,7,8,9 never happen)
    \`\`\`

    ## continue — Skip to Next Iteration

    \`\`\`
    for (int i = 0; i < 6; i++) {
        if (i % 2 == 0) continue;
        cout << i;
    }

    Flow:
    i=0 → i%2==0 → CONTINUE ─► jump to i++ → i=1
    i=1 → i%2!=0 → no skip  → print 1 → i=2
    i=2 → i%2==0 → CONTINUE ─► jump to i++ → i=3
    i=3 → i%2!=0 → no skip  → print 3 → i=4
    i=4 → i%2==0 → CONTINUE ─► jump to i++ → i=5
    i=5 → i%2!=0 → no skip  → print 5 → i=6 → EXIT

    Output: 1 3 5
    \`\`\`

    ---

    ## break vs continue: What They Jump To

    \`\`\`
    Loop structure:
    ┌──────────────────────────────────────────────────────┐
    │ for (init; condition; update) {                       │
    │     // code before                                    │
    │     if (...) continue; ───────────────────────────┐  │
    │     if (...) break; ─────────────────────────┐   │  │
    │     // code after                             │   │  │
    │ }  ◄──────────────────── update ◄─────────────────┘  │
    │     ↑                          continue jumps here    │
    │  break jumps here (exits)                             │
    └──────────────────────────────────────────────────────┘
    \`\`\`

    ---

    ## Nested Loop: break Only Exits Innermost

    \`\`\`
    for (i = 0..2) {
        for (j = 0..2) {
            if (j == 1) break;  ← exits INNER loop only
            print (i, j)
        }
        // outer loop continues normally
    }

    Result: (0,0)  (1,0)  (2,0)
            j=1,2 are never printed because break exits inner loop at j=1
            but outer loop with i still runs 3 times
    \`\`\``,
            },
            {
                order: 17,
                title: 'Comprehensive Quiz: All Loops',
                type: 'QUIZ',
                content: '## Master Quiz — All Loop Types, break, and continue',
                stepData: {
                    questions: [
                        {
                            question: 'What is the output of: `for (int i = 1; i <= 5; i += 2) cout << i << " ";`',
                            options: [
                                { id: 'a', text: '1 2 3 4 5', isCorrect: false },
                                { id: 'b', text: '1 3 5', isCorrect: true },
                                { id: 'c', text: '2 4', isCorrect: false },
                                { id: 'd', text: '1 3 5 7', isCorrect: false },
                            ],
                            explanation: 'Starting at 1, stepping by 2: 1, 3, 5. When i=7, 7<=5 is false, so the loop exits.',
                        },
                        {
                            question: 'In a do-while loop, where is the condition evaluated?',
                            options: [
                                { id: 'a', text: 'Before the loop body', isCorrect: false },
                                { id: 'b', text: 'After the loop body', isCorrect: true },
                                { id: 'c', text: 'Both before and after', isCorrect: false },
                                { id: 'd', text: 'It depends on the compiler', isCorrect: false },
                            ],
                            explanation: 'The do-while evaluates its condition after the body runs, guaranteeing at least one execution.',
                        },
                        {
                            question: 'What does `continue` do inside a for loop?',
                            options: [
                                { id: 'a', text: 'Exits the entire loop', isCorrect: false },
                                { id: 'b', text: 'Restarts the program', isCorrect: false },
                                { id: 'c', text: 'Skips the rest of the current iteration and goes to the update step', isCorrect: true },
                                { id: 'd', text: 'Pauses the loop', isCorrect: false },
                            ],
                            explanation: 'continue skips the remaining code in the current iteration and jumps to the update expression (i++ etc.), then re-evaluates the condition.',
                        },
                        {
                            question:
                                'For a range-based for loop `for (auto x : v)` where v is a vector, changes to x affect the original vector?',
                            options: [
                                { id: 'a', text: 'Yes, always', isCorrect: false },
                                { id: 'b', text: 'No — x is a copy; use auto& to modify in-place', isCorrect: true },
                                { id: 'c', text: 'Only if v is const', isCorrect: false },
                                { id: 'd', text: 'Only for primitive types', isCorrect: false },
                            ],
                            explanation:
                                '`auto x` makes a copy. Modifying x does not change the original. Use `auto& x` to get a reference that allows in-place modification.',
                        },
                        {
                            question: 'In nested loops, `break` inside the inner loop:',
                            options: [
                                { id: 'a', text: 'Exits both the inner and outer loops', isCorrect: false },
                                { id: 'b', text: 'Exits only the innermost loop it is in', isCorrect: true },
                                { id: 'c', text: 'Exits the program', isCorrect: false },
                                { id: 'd', text: 'Throws a compilation error', isCorrect: false },
                            ],
                            explanation:
                                'break only exits the innermost loop it directly belongs to. The outer loop continues normally.',
                        },
                        {
                            question: 'Which loop guarantees at least one execution of its body?',
                            options: [
                                { id: 'a', text: 'for', isCorrect: false },
                                { id: 'b', text: 'while', isCorrect: false },
                                { id: 'c', text: 'do-while', isCorrect: true },
                                { id: 'd', text: 'range-based for', isCorrect: false },
                            ],
                            explanation: 'do-while checks the condition AFTER executing the body, so the body always runs at least once.',
                        },
                        {
                            question: 'What is the output of: `int i=0; while(i<3){cout<<i; i++;}`',
                            options: [
                                { id: 'a', text: '1 2 3', isCorrect: false },
                                { id: 'b', text: '0 1 2', isCorrect: true },
                                { id: 'c', text: '0 1 2 3', isCorrect: false },
                                { id: 'd', text: 'infinite output', isCorrect: false },
                            ],
                            explanation: 'i starts at 0, loop runs while i < 3. Values printed: 0, 1, 2. When i=3, condition fails.',
                        },
                        {
                            question: 'What is `for (;;)` equivalent to?',
                            options: [
                                { id: 'a', text: 'for (int i=0; i<0; i++)', isCorrect: false },
                                { id: 'b', text: 'while (true)', isCorrect: true },
                                { id: 'c', text: 'do { } while (false)', isCorrect: false },
                                { id: 'd', text: 'It is a syntax error', isCorrect: false },
                            ],
                            explanation: '`for(;;)` with all three parts omitted is an infinite loop, identical to `while(true)`. Both are valid idioms.',
                        },
                    ],
                },
            },
            {
                order: 18,
                title: 'Challenge: Loop Mastery',
                type: 'CHALLENGE',
                content: `## 🏆 Coding Challenge: FizzBuzz + Prime Finder

    This challenge combines loops, conditionals, break, and continue.

    **Part 1: FizzBuzz (1-50)**
    - Print numbers 1 to 50
    - If divisible by 3: print "Fizz"
    - If divisible by 5: print "Buzz"
    - If divisible by both: print "FizzBuzz"
    - Otherwise: print the number

    **Part 2: Prime Sieve**
    - Find all prime numbers between 2 and 50
    - Use a nested loop approach
    - A number is prime if it is divisible only by 1 and itself`,
                stepData: {
                    starterCode: `#include <iostream>
    using namespace std;

    int main() {
        // ─── PART 1: FizzBuzz (1 to 50) ───────────────────────────────────
        cout << "=== FizzBuzz ===" << endl;

        // TODO: Use a for loop from 1 to 50
        // Check divisibility with %
        // Print Fizz, Buzz, FizzBuzz, or the number



        // ─── PART 2: Prime Numbers (2 to 50) ──────────────────────────────
        cout << "\\n=== Primes 2-50 ===" << endl;

        // TODO: Use nested loops to find primes
        // For each number n from 2 to 50:
        //   Assume it's prime (bool isPrime = true)
        //   Try dividing by all numbers from 2 to n-1
        //   If any divide evenly, it's not prime (set isPrime = false, break)
        //   After the inner loop, if still prime, print n



        cout << endl;
        return 0;
    }`,
                    solution: `#include <iostream>
    using namespace std;

    int main() {
        // ─── PART 1: FizzBuzz ─────────────────────────────────────────────
        cout << "=== FizzBuzz ===" << endl;

        for (int i = 1; i <= 50; i++) {
            // Check FizzBuzz first (divisible by BOTH 3 and 5)
            if (i % 15 == 0) {
                cout << "FizzBuzz";
            } else if (i % 3 == 0) {
                cout << "Fizz";
            } else if (i % 5 == 0) {
                cout << "Buzz";
            } else {
                cout << i;
            }

            cout << " "; // Separate each output
        }
        cout << endl;

        // ─── PART 2: Prime Numbers ─────────────────────────────────────────
        cout << "\\n=== Primes 2-50 ===" << endl;

        for (int n = 2; n <= 50; n++) {
            bool isPrime = true; // Assume prime until proven otherwise

            // Try dividing n by every number from 2 to n-1
            for (int d = 2; d < n; d++) {
                if (n % d == 0) {
                    isPrime = false; // Found a divisor — not prime
                    break;           // No need to check further
                }
            }

            // If still assumed prime after all checks, it is prime
            if (isPrime) {
                cout << n << " ";
            }
        }
        cout << endl;

        return 0;
    }`,
                    hints: [
                        'For FizzBuzz, always check divisibility by 15 (both 3 and 5) BEFORE checking 3 or 5 alone, otherwise 15 would match the wrong branch.',
                        'For primes, initialize `bool isPrime = true` before the inner loop. Set it to false inside the inner loop if you find a divisor.',
                        'Use `break` in the inner prime loop as soon as you find one divisor — no need to keep checking.',
                        'The outer prime loop goes from 2 (smallest prime) to 50. The inner loop goes from 2 to n-1.',
                        'A slight optimization: the inner loop only needs to go to `d*d <= n` (square root), but d < n works correctly too.',
                    ],
                    language: 'cpp',
                },
            },
            {
                order: 19,
                title: 'Summary: All C++ Loops',
                type: 'SUMMARY',
                content: `# Summary: C++ Loops

    ## The Four Loop Types

    | Loop | Condition Checked | Min Executions | Best For |
    |------|------------------|----------------|----------|
    | \`for\` | Before (pre-test) | 0 | Known iteration count |
    | \`while\` | Before (pre-test) | 0 | Condition-driven, unknown count |
    | \`do-while\` | After (post-test) | **1** | Must run at least once (menus, prompts) |
    | Range-based \`for\` | N/A (iterates all) | 0 (if empty) | Collections (arrays, vectors, strings) |

    ## Loop Control Keywords

    - **\`break\`** — Immediately exits the **entire loop**. Works in all loop types and switch.
    - **\`continue\`** — Skips rest of **current iteration**, jumps to next. Does NOT exit the loop.
    - Both only affect the **innermost** loop they appear in.

    ## Key Patterns to Remember

    \`\`\`cpp
    // Accumulator
    int sum = 0;
    for (int i = 1; i <= n; i++) sum += i;

    // Search with early exit
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) { foundAt = i; break; }
    }

    // Filter with continue
    for (int x : data) {
        if (x < 0) continue; // skip negatives
        process(x);
    }

    // Menu loop (do-while)
    do { showMenu(); cin >> choice; } while (choice != 0);
    \`\`\`

    ## Common Pitfalls

    1. **Off-by-one errors** — \`i < n\` (0 to n-1) vs \`i <= n\` (0 to n). Be deliberate.
    2. **Infinite loops** — Always ensure the loop variable changes and the condition can become false.
    3. **Missing semicolon** — \`do { } while (condition);\` — semicolon is required!
    4. **Modifying range-based for elements** — Use \`auto&\` to modify, \`const auto&\` to read.
    5. **break in nested loops** — Only exits the innermost loop; use a flag or goto for breaking outer loops.

    > 🎯 **Next up**: Functions — how to organize code into reusable, named blocks!`,
            },
        ],
    });

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOPIC 2: cpp-functions-basics
    // ═══════════════════════════════════════════════════════════════════════════════

    await createLearn({
        slug: 'cpp-functions-basics',
        title: 'Functions Basics (Declaration, Definition, Parameters, Return Types)',
        description:
            'Master C++ functions from the ground up: declarations vs definitions, return types, value and reference parameters, and the critical difference between pass-by-value and pass-by-reference with detailed memory diagrams.',
        difficulty: 'BEGINNER',
        unitNumber: 2,
        unitTitle: 'Unit 2: Control Structures & Functions',
        estimatedTime: 50,
        tags: ['functions', 'parameters', 'return-type', 'pass-by-value', 'pass-by-reference', 'scope'],
        iconEmoji: '⚙️',
        steps: [
            // ─────────────────────────────────────────────────────────────────────
            // SECTION A: What is a Function?
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 0,
                title: 'What is a Function? — Concept',
                type: 'EXPLANATION',
                tips: [
                    'Every C++ program must have exactly one `main()` function — it is the entry point.',
                    'Functions should do ONE thing well. If a function is doing many things, break it apart.',
                    'Good function names are verbs: `calculateArea()`, `printMenu()`, `isValid()`.',
                ],
                content: `# What is a Function?

    ## The Problem Without Functions

    Imagine you need to print a greeting in 10 different places in your program:

    \`\`\`cpp
    // Without functions — messy and error-prone
    cout << "Hello, Alice!" << endl;
    // ... 50 lines later ...
    cout << "Hello, Bob!" << endl;
    // ... 100 lines later ...
    cout << "Hello, Charlie!" << endl;
    // Now change "Hello" to "Hi" everywhere? 😱
    \`\`\`

    ---

    ## Functions: The Solution

    A **function** is a **named, reusable block of code** that performs a specific task.

    \`\`\`cpp
    // Define ONCE
    void greet(string name) {
        cout << "Hello, " << name << "!" << endl;
    }

    // Use MANY times — and changing "Hello" to "Hi" only requires one edit
    greet("Alice");
    greet("Bob");
    greet("Charlie");
    \`\`\`

    ---

    ## Why Use Functions?

    | Benefit | Description |
    |---------|-------------|
    | **Reusability** | Write once, call anywhere |
    | **Readability** | \`calculateTax()\` is clearer than 10 lines of math |
    | **Maintainability** | Fix a bug in one place, not everywhere |
    | **Testability** | Test each function independently |
    | **Abstraction** | Hide complex details behind a simple name |

    ---

    ## The main() Function

    You already know one function: \`main()\`!

    \`\`\`cpp
    int main() {
        // Your program starts here
        return 0; // 0 = success
    }
    \`\`\`

    Every C++ program starts by calling \`main()\`. \`main\` itself is just a special function that the operating system calls when your program starts.`,
            },
            // ─────────────────────────────────────────────────────────────────────
            // SECTION B: Function Structure
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 1,
                title: 'Function Declaration, Definition & Calling',
                type: 'EXPLANATION',
                tips: [
                    'Declaration tells the compiler a function exists (like a promise). Definition provides the actual code.',
                    'If you define a function BEFORE it is called, you do not need a separate declaration.',
                    'Declarations (prototypes) go at the top of the file or in header files (.h).',
                ],
                content: `# Function Anatomy: Declaration, Definition, Call

    ## The Three Concepts

    | Concept | What It Is | Example |
    |---------|-----------|---------|
    | **Declaration (Prototype)** | Tells compiler the function exists & its signature | \`int add(int a, int b);\` |
    | **Definition** | The actual implementation | \`int add(int a, int b) { return a + b; }\` |
    | **Call (Invocation)** | Using the function | \`int result = add(3, 5);\` |

    ---

    ## Full Syntax of a Function

    \`\`\`
    return_type  function_name  (parameter_list) {
        // function body
        return value; // only if return_type != void
    }
    \`\`\`

    \`\`\`cpp
    //  ┌── return type (int)
    //  │       ┌── name
    //  │       │     ┌── parameters
    int  add(int a, int b) {
        int result = a + b;
        return result; // ← must return an int (matches return type)
    }
    \`\`\`

    ---

    ## The Declaration Problem

    \`\`\`cpp
    int main() {
        int x = add(3, 5); // ❌ ERROR: add() not yet defined!
        return 0;
    }

    int add(int a, int b) { // defined AFTER main — too late!
        return a + b;
    }
    \`\`\`

    **Two solutions:**

    **Solution 1**: Define before use
    \`\`\`cpp
    int add(int a, int b) { return a + b; } // defined FIRST
    int main() { int x = add(3, 5); }       // called AFTER
    \`\`\`

    **Solution 2**: Forward declaration (prototype)
    \`\`\`cpp
    int add(int a, int b); // ← PROTOTYPE — semicolon!

    int main() {
        int x = add(3, 5); // ✅ Compiler knows add() exists from prototype
    }

    int add(int a, int b) { // actual definition can be anywhere
        return a + b;
    }
    \`\`\`

    > 💡 **Industry Practice**: Use header files (\`.h\`) for declarations and \`.cpp\` files for definitions. For now, use forward declarations at the top of your file.

    ---

    ## The \`void\` Return Type

    If a function doesn't return anything, use \`void\`:

    \`\`\`cpp
    void printLine() {         // void = returns nothing
        cout << "----------" << endl;
        // no return statement needed (or use bare return;)
    }

    int main() {
        printLine(); // called like this — don't assign: int x = printLine(); ❌
    }
    \`\`\``,
            },
            {
                order: 2,
                title: 'Functions — Code: Basic Examples',
                type: 'CODE',
                content:
                    '## Writing Your First Functions\n\nLet\'s build functions for common tasks: math operations, checking conditions, and formatting output.',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Math Utility Functions',
                        language: 'cpp',
                        code: `#include <iostream>
    #include <cmath> // For sqrt(), pow()
    using namespace std;

    // ─── PROTOTYPES ─────────────────────────────────────────────────────
    double circleArea(double radius);
    double power(double base, int exponent);
    bool isEven(int n);
    void printSeparator(char ch, int length);

    // ─── MAIN ────────────────────────────────────────────────────────────
    int main() {
        printSeparator('=', 40);
        cout << "Circle area (r=5): " << circleArea(5.0) << endl;
        cout << "2^10 = " << power(2.0, 10) << endl;
        cout << "Is 42 even? " << (isEven(42) ? "Yes" : "No") << endl;
        cout << "Is 7 even? "  << (isEven(7)  ? "Yes" : "No") << endl;
        printSeparator('=', 40);
        return 0;
    }

    // ─── DEFINITIONS ─────────────────────────────────────────────────────

    // Calculate the area of a circle
    // Formula: π × r²
    double circleArea(double radius) {
        const double PI = 3.14159265358979;
        return PI * radius * radius;
    }

    // Raise base to an integer exponent
    double power(double base, int exponent) {
        double result = 1.0;
        for (int i = 0; i < exponent; i++) {
            result *= base;
        }
        return result;
    }

    // Check if a number is even
    bool isEven(int n) {
        return (n % 2 == 0); // returns true or false directly
    }

    // Print a separator line of a given character and length
    void printSeparator(char ch, int length) {
        for (int i = 0; i < length; i++) {
            cout << ch;
        }
        cout << endl;
    }`,
                        explanation:
                            'This demonstrates the full pattern: prototypes at the top, main in the middle, definitions below. Each function does ONE thing clearly. Note how `isEven` returns the boolean expression directly — no `if` needed.',
                        highlightLines: [5, 6, 7, 8, 23, 30, 37, 43],
                        isRunnable: true,
                    },
                ],
            },
            {
                order: 3,
                title: 'Functions — Visual: Structure & Call Stack',
                type: 'VISUAL',
                content: `# Function Structure & The Call Stack

    ## Anatomy of a Function

    \`\`\`
    return_type  name  ( parameters )  {  body  return; }
         │          │         │                    │
         │          │         │                    └─ Returns value to caller
         │          │         └─ Inputs the function receives
         │          └─ What you call it (verb naming is best)
         └─ The type of value returned (void = nothing)
    \`\`\`

    ---

    ## What Happens When You Call a Function?

    When you call \`add(3, 5)\`, here is what happens in memory:

    \`\`\`
    BEFORE call:                      DURING add():                    AFTER return:
    ─────────────────────             ─────────────────────────────    ────────────────
    Stack:                            Stack:                           Stack:
    ┌─────────────────┐               ┌─────────────────────────┐     ┌──────────────┐
    │ main()          │               │ add() frame              │     │ main()       │
    │  result = ???   │               │  a = 3   (copy of arg)   │     │  result = 8  │
    │  [called add()]─┼──────────────►│  b = 5   (copy of arg)   │     │              │
    │                 │               │  result (local) = 8      │     │              │
    └─────────────────┘               │  ↓ return 8              │     └──────────────┘
                                      └──────────┼──────────────┘            ▲
                                                 │  8 returned to main()     │
                                                 └───────────────────────────┘
                                                 add() frame is DESTROYED
    \`\`\`

    > 🔑 **The Call Stack**: Each function call creates a **stack frame** — a block of memory for that function's local variables and parameters. When the function returns, its frame is destroyed.

    ---

    ## Function Signature

    The **signature** is the combination of name + parameter types. It does NOT include return type or parameter names.

    \`\`\`
    int add(int a, int b)     → signature: add(int, int)
    double add(double a)      → signature: add(double)    ← different!
    \`\`\`

    ---

    ## Local Variables and Scope

    \`\`\`
    int main() {               │  void helper() {
        int x = 10;            │      int x = 99;   // Different x!
        helper();              │      cout << x;     // Prints 99
        cout << x;             │  }
        // Prints 10 — unaffected by helper's x
    }

    Local variables ONLY exist while their function is executing.
    After the function returns, its variables are GONE.
    \`\`\``,
            },
            {
                order: 4,
                title: 'Quiz: Function Basics',
                type: 'QUIZ',
                content: '## Test Your Understanding of Function Basics',
                stepData: {
                    questions: [
                        {
                            question: 'What is a function prototype (forward declaration)?',
                            options: [
                                { id: 'a', text: 'The full implementation of a function', isCorrect: false },
                                { id: 'b', text: 'A declaration that tells the compiler a function exists and its signature, without the body', isCorrect: true },
                                { id: 'c', text: 'A call to a function', isCorrect: false },
                                { id: 'd', text: 'A function with no parameters', isCorrect: false },
                            ],
                            explanation:
                                'A prototype (e.g., `int add(int a, int b);`) tells the compiler about the function\'s name, return type, and parameters so it can be called before it is defined.',
                        },
                        {
                            question: 'What return type should a function have if it does NOT return any value?',
                            options: [
                                { id: 'a', text: 'int', isCorrect: false },
                                { id: 'b', text: 'null', isCorrect: false },
                                { id: 'c', text: 'void', isCorrect: true },
                                { id: 'd', text: 'none', isCorrect: false },
                            ],
                            explanation: '`void` is the return type for functions that perform actions but do not produce a return value.',
                        },
                        {
                            question: 'Where do a function\'s local variables exist in memory?',
                            options: [
                                { id: 'a', text: 'In the heap, shared globally', isCorrect: false },
                                { id: 'b', text: 'On the call stack, only while the function is executing', isCorrect: true },
                                { id: 'c', text: 'In static memory, always', isCorrect: false },
                                { id: 'd', text: 'In registers permanently', isCorrect: false },
                            ],
                            explanation:
                                'Local variables live on the call stack in a stack frame. When the function returns, its frame is destroyed and the memory is reclaimed.',
                        },
                        {
                            question: 'Which of these is a valid function call for `double circleArea(double radius)`?',
                            options: [
                                { id: 'a', text: 'circleArea;', isCorrect: false },
                                { id: 'b', text: 'circleArea(5.0);', isCorrect: true },
                                { id: 'c', text: 'double circleArea(5.0);', isCorrect: false },
                                { id: 'd', text: 'call circleArea(5.0);', isCorrect: false },
                            ],
                            explanation: 'A function call uses just the name followed by arguments in parentheses. No return type, no `call` keyword.',
                        },
                        {
                            question: 'If a function has return type `int`, what MUST it include?',
                            options: [
                                { id: 'a', text: 'A cout statement', isCorrect: false },
                                { id: 'b', text: 'A return statement with an int value', isCorrect: true },
                                { id: 'c', text: 'Parameters', isCorrect: false },
                                { id: 'd', text: 'At least one loop', isCorrect: false },
                            ],
                            explanation: 'A non-void function must return a value matching its declared return type. Missing return statements cause undefined behavior or compiler warnings.',
                        },
                    ],
                },
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION C: Parameters — Pass by Value
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 5,
                title: 'Parameters: Pass-by-Value — Concept',
                type: 'EXPLANATION',
                tips: [
                    'Pass-by-value makes a COPY — the original variable is completely safe.',
                    'The downside of pass-by-value is performance: copying large objects (like big structs) is expensive.',
                    'Primitive types (int, double, char, bool) are almost always passed by value.',
                ],
                content: `# Pass-by-Value

    ## What Happens When You Pass a Variable?

    In C++, by default, function arguments are **passed by value** — the function receives a **copy** of the argument. Changes inside the function do **NOT** affect the original variable.

    ---

    ## Example: The Swap That Doesn't Work

    \`\`\`cpp
    void swap(int a, int b) {
        int temp = a;
        a = b;
        b = temp;
        // a and b are copies — originals are unchanged!
    }

    int main() {
        int x = 10, y = 20;
        swap(x, y);
        cout << x << " " << y; // Still 10 20! swap failed.
    }
    \`\`\`

    Why? Because \`a\` and \`b\` are **copies** of \`x\` and \`y\`. Swapping the copies has no effect on the originals.

    ---

    ## The "Copy Machine" Mental Model

    Think of pass-by-value like a photocopy machine:

    \`\`\`
    Original document (x = 10)
            │
            │ copy
            ▼
    Photocopy (a = 10)  ← function works on the photocopy
                           Writing on the photocopy doesn't change the original!
    \`\`\`

    ---

    ## When is Pass-by-Value Good?

    ✅ When you **don't want the function to modify** the original  
    ✅ For small types: \`int\`, \`char\`, \`bool\`, \`double\` (cheap to copy)  
    ✅ When you intentionally want to work with a local copy  

    \`\`\`cpp
    // This is fine — we WANT the function to work on a copy
    double circleArea(double radius) {
        radius *= 2; // doesn't matter — radius is a copy
        return 3.14 * radius; // (wrong formula but illustrating the point)
    }
    \`\`\`

    ---

    ## The Extra Variable Cost

    \`\`\`cpp
    void doubleIt(int n) {
        n = n * 2;      // n is a copy
        cout << n;      // prints doubled value
    }

    int x = 5;
    doubleIt(x);        // function sees 10
    cout << x;          // x is STILL 5!
    \`\`\``,
            },
            {
                order: 6,
                title: 'Parameters: Pass-by-Value — Code',
                type: 'CODE',
                content: '## Pass-by-Value in Action',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Demonstrating Pass-by-Value',
                        language: 'cpp',
                        code: `#include <iostream>
    using namespace std;

    // This function tries to triple its argument
    // But since it's pass-by-value, the original is unaffected
    void tripleValue(int n) {
        cout << "  Inside function, before: n = " << n << endl;
        n = n * 3;       // Only affects the LOCAL COPY
        cout << "  Inside function, after:  n = " << n << endl;
    }

    // This function correctly RETURNS the tripled value
    int tripleAndReturn(int n) {
        return n * 3; // Returns a new value; doesn't modify n
    }

    int main() {
        int myNumber = 7;

        cout << "Before call: myNumber = " << myNumber << endl;
        tripleValue(myNumber);
        cout << "After call:  myNumber = " << myNumber << endl; // Still 7!

        cout << "\\n--- Using Return Value Instead ---" << endl;
        int tripled = tripleAndReturn(myNumber);
        cout << "myNumber = " << myNumber << " (unchanged)" << endl;
        cout << "tripled  = " << tripled  << " (new value)" << endl;

        return 0;
    }`,
                        explanation:
                            '`tripleValue` modifies only its local copy of n. `myNumber` stays 7. The correct pattern when you need a modified value from pass-by-value is to RETURN it, as shown in `tripleAndReturn`.',
                        highlightLines: [8, 21, 25],
                        isRunnable: true,
                    },
                ],
            },
            {
                order: 7,
                title: 'Pass-by-Value — Visual Memory Diagram',
                type: 'VISUAL',
                content: `# Pass-by-Value: Memory Diagram

    ## What the Stack Looks Like During a Function Call

    \`\`\`
    // Code:
    int x = 10;
    tripleValue(x);

    CALL STACK — Before calling tripleValue():
    ┌─────────────────────────────────┐
    │ main() frame                    │
    │  ┌────────────────────────────┐ │
    │  │  x = 10  (address: 0x100) │ │ ← original variable
    │  └────────────────────────────┘ │
    └─────────────────────────────────┘

    CALL STACK — Inside tripleValue(x):
    ┌─────────────────────────────────┐
    │ tripleValue() frame             │
    │  ┌────────────────────────────┐ │
    │  │  n = 10  (address: 0x200) │ │ ← COPY of x, different address!
    │  └────────────────────────────┘ │
    ├─────────────────────────────────┤
    │ main() frame                    │
    │  ┌────────────────────────────┐ │
    │  │  x = 10  (address: 0x100) │ │ ← unchanged!
    │  └────────────────────────────┘ │
    └─────────────────────────────────┘

    After  n = n * 3:
    tripleValue frame:  n = 30  at 0x200
    main frame:         x = 10  at 0x100  ← still 10!

    After tripleValue() returns:
    tripleValue() frame is DESTROYED
    n is GONE
    \`\`\`

    > 🔑 **Key insight**: \`x\` at address \`0x100\` and \`n\` at address \`0x200\` are completely different memory locations. Changing \`n\` cannot possibly change \`x\`.

    ---

    ## Summary: Pass-by-Value Rules

    \`\`\`
    ✅ Original is SAFE — function cannot modify it
    ✅ Good for small/primitive types (int, char, double, bool)
    ❌ Creates a COPY — expensive for large objects
    ❌ Cannot return multiple results through parameters
    \`\`\``,
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION D: Pass by Reference
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 8,
                title: 'Parameters: Pass-by-Reference — Concept',
                type: 'EXPLANATION',
                tips: [
                    'Pass-by-reference uses an ampersand (&) in the PARAMETER declaration, not in the function call.',
                    'Use `const Type&` when you want reference efficiency (no copy) but don\'t need to modify the value.',
                    'Pass-by-reference is how C++ functions can "return" multiple values.',
                ],
                content: `# Pass-by-Reference

    ## The Problem We Saw

    Pass-by-value can't modify the original, and copying large objects is expensive. We need a way to give functions **direct access** to the original variable.

    ---

    ## What is a Reference?

    A **reference** is an alias — another name for the same variable. It is **not a copy** — it IS the same memory location.

    \`\`\`cpp
    int x = 10;
    int& ref = x; // ref is a reference to x

    ref = 99;     // Modifying ref MODIFIES x!
    cout << x;    // Prints 99
    \`\`\`

    ---

    ## Pass-by-Reference in Functions

    Add \`&\` to the parameter type to accept a reference:

    \`\`\`cpp
    void triple(int& n) { // & means: n is a REFERENCE, not a copy
        n = n * 3;        // Modifies the ORIGINAL variable directly!
    }

    int main() {
        int x = 7;
        triple(x);     // No & needed in the CALL
        cout << x;     // Prints 21! Original was modified.
    }
    \`\`\`

    ---

    ## Now the Swap Works!

    \`\`\`cpp
    void swap(int& a, int& b) { // References to originals
        int temp = a;
        a = b;         // Modifies the original a
        b = temp;      // Modifies the original b
    }

    int x = 10, y = 20;
    swap(x, y);
    cout << x << " " << y; // Prints: 20 10 ✅ It worked!
    \`\`\`

    ---

    ## Pass-by-Const-Reference: Best of Both Worlds

    When you need efficiency (no copy) but don't want to modify:

    \`\`\`cpp
    // Efficient: no copying, but CANNOT modify name inside function
    void printName(const string& name) {
        cout << name;
        // name = "hacked"; // ❌ COMPILE ERROR — const prevents this
    }
    \`\`\`

    | Technique | Copies? | Can Modify Original? |
    |-----------|---------|---------------------|
    | Pass by value | ✅ (copy made) | ❌ No |
    | Pass by reference \`&\` | ❌ (no copy) | ✅ Yes |
    | Pass by const ref \`const&\` | ❌ (no copy) | ❌ No (read-only) |

    ---

    ## "Returning" Multiple Values via References

    \`\`\`cpp
    // A function can only return one value — but can modify multiple through refs!
    void minMax(int a, int b, int c, int& minVal, int& maxVal) {
        minVal = min({a, b, c}); // modifies the caller's minVal variable
        maxVal = max({a, b, c}); // modifies the caller's maxVal variable
    }

    int mn, mx;
    minMax(3, 9, 1, mn, mx);
    cout << "Min: " << mn << " Max: " << mx; // Min: 1  Max: 9
    \`\`\``,
            },
            {
                order: 9,
                title: 'Pass-by-Reference — Code Examples',
                type: 'CODE',
                content: '## Pass-by-Reference in Practice',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Swap and Multiple Outputs',
                        language: 'cpp',
                        code: `#include <iostream>
    using namespace std;

    // ─── Swaps two integers using references ─────────────────────────────
    void swap(int& a, int& b) {
        int temp = a; // save a
        a = b;        // overwrite a with b's value
        b = temp;     // overwrite b with saved a
    }

    // ─── Calculates both min and max, "returning" them via references ─────
    void findMinMax(int x, int y, int z, int& minVal, int& maxVal) {
        // Find min
        minVal = x;
        if (y < minVal) minVal = y;
        if (z < minVal) minVal = z;

        // Find max
        maxVal = x;
        if (y > maxVal) maxVal = y;
        if (z > maxVal) maxVal = z;
    }

    int main() {
        // Test swap
        int a = 42, b = 17;
        cout << "Before swap: a=" << a << " b=" << b << endl;
        swap(a, b);
        cout << "After swap:  a=" << a << " b=" << b << endl;

        // Test findMinMax — two "return" values via references
        int p = 8, q = 3, r = 15;
        int smallest, largest;
        findMinMax(p, q, r, smallest, largest);
        cout << "\\nFrom {" << p << ", " << q << ", " << r << "}:" << endl;
        cout << "  Min = " << smallest << endl;
        cout << "  Max = " << largest  << endl;

        return 0;
    }`,
                        explanation:
                            '`swap` uses references to exchange two values in-place. `findMinMax` uses references to output two values from a function that can only have one return statement — a common pattern for outputting multiple results.',
                        highlightLines: [5, 12, 27, 32],
                        isRunnable: true,
                    },
                    {
                        order: 1,
                        title: 'Value vs Reference Comparison',
                        language: 'cpp',
                        code: `#include <iostream>
    using namespace std;

    // By VALUE — original is unchanged
    void doubleByValue(int n) {
        n *= 2;
        cout << "  [byValue] Inside: n = " << n << endl;
    }

    // By REFERENCE — original IS changed
    void doubleByRef(int& n) {
        n *= 2;
        cout << "  [byRef] Inside: n = " << n << endl;
    }

    // By CONST REFERENCE — no copy, but read-only
    void displayByConstRef(const int& n) {
        cout << "  [constRef] Reading: n = " << n << endl;
        // n *= 2; // ❌ compile error: n is const
    }

    int main() {
        int x = 5;

        cout << "x = " << x << endl;
        doubleByValue(x);
        cout << "After doubleByValue: x = " << x << " (unchanged)" << endl;

        cout << "\\nx = " << x << endl;
        doubleByRef(x);
        cout << "After doubleByRef:   x = " << x << " (CHANGED!)" << endl;

        displayByConstRef(x); // efficient read, no copy made

        return 0;
    }`,
                        explanation:
                            'Side-by-side comparison: `doubleByValue` leaves the original intact; `doubleByRef` modifies it directly; `displayByConstRef` reads efficiently without copying and prevents accidental modification.',
                        highlightLines: [5, 11, 16, 26, 30],
                        isRunnable: true,
                    },
                ],
            },
            {
                order: 10,
                title: 'Pass-by-Reference — Visual Memory Diagram',
                type: 'VISUAL',
                content: `# Pass-by-Reference: Memory Diagram

    ## How Reference Parameters Work

    \`\`\`
    // Code:
    int x = 10;
    doubleByRef(x);

    PASS BY VALUE:                    PASS BY REFERENCE:
    ──────────────────────────────    ──────────────────────────────
    Stack before call:                Stack before call:
      main:  x = 10  [addr: 0x100]     main:  x = 10  [addr: 0x100]

    During call:                      During call:
      func:  n = 10  [addr: 0x200]     func:  n → [addr: 0x100]  ← ALIAS!
                                              n IS x (same address)

    n *= 2 inside func:               n *= 2 inside func:
      func:  n = 20  [addr: 0x200]     func:  *0x100 = 20
      main:  x = 10  [addr: 0x100]     main:  x = 20  [addr: 0x100] ← CHANGED!
      ↑ DIFFERENT memory                     ↑ SAME memory

    After return:                     After return:
      x is still 10                     x is now 20
    \`\`\`

    ---

    ## Reference is an Alias (Not a New Variable)

    \`\`\`
    int x = 42;         Address 0x100: [ 42 ]  ← x lives here
    int& ref = x;       ref is NOT a new box — it is another LABEL for 0x100

    ref = 99;           Address 0x100: [ 99 ]  ← same box, now 99
    cout << x;          prints 99              ← x sees the change!
    \`\`\`

    ---

    ## Choosing the Right Parameter Type

    \`\`\`
    Question: Does the function need to modify the original?

    Yes ──────────────────────────────► Use reference (int& param)
    No  →  Is the type large/expensive to copy?
           Yes ─────────────────────► Use const reference (const string& param)
           No  (primitive types) ───► Use value (int param)

    Decision tree:
    ┌─────────────────────────────────────────────────────────────────┐
    │  Modify original?  YES ──► int& n                               │
    │                    NO  ──► Large object? YES ──► const T& obj   │
    │                                          NO  ──► T n (by value) │
    └─────────────────────────────────────────────────────────────────┘
    \`\`\``,
            },
            {
                order: 11,
                title: 'Quiz: Pass-by-Value vs Pass-by-Reference',
                type: 'QUIZ',
                content: '## Test Your Understanding',
                stepData: {
                    questions: [
                        {
                            question: 'What is the output? `void inc(int n){n++;} int main(){int x=5; inc(x); cout<<x;}`',
                            options: [
                                { id: 'a', text: '6', isCorrect: false },
                                { id: 'b', text: '5', isCorrect: true },
                                { id: 'c', text: '0', isCorrect: false },
                                { id: 'd', text: 'Compilation error', isCorrect: false },
                            ],
                            explanation:
                                '`inc` takes `n` by value — a copy of `x`. Incrementing the copy does not affect `x`. Output is 5.',
                        },
                        {
                            question: 'In `void f(int& n)`, what does the `&` mean?',
                            options: [
                                { id: 'a', text: 'Bitwise AND of n', isCorrect: false },
                                { id: 'b', text: '`n` is a reference — an alias for the argument passed by the caller', isCorrect: true },
                                { id: 'c', text: 'Address of n', isCorrect: false },
                                { id: 'd', text: 'n is a pointer', isCorrect: false },
                            ],
                            explanation:
                                'In a parameter declaration, `&` makes the parameter a reference — it is an alias for the actual argument, not a copy.',
                        },
                        {
                            question: 'What does `const string& name` as a parameter mean?',
                            options: [
                                { id: 'a', text: 'Makes a copy but marks it const', isCorrect: false },
                                { id: 'b', text: 'Reference to the original string, but the function cannot modify it — efficient and safe', isCorrect: true },
                                { id: 'c', text: 'Pointer to a const string', isCorrect: false },
                                { id: 'd', text: 'The string is deleted after the function', isCorrect: false },
                            ],
                            explanation:
                                '`const string& name` passes by reference (no copying the string) but marks it as read-only. Any attempt to modify `name` inside the function causes a compilation error.',
                        },
                        {
                            question: 'Which parameter passing method is typically best for an `int` parameter that should NOT be modified?',
                            options: [
                                { id: 'a', text: 'int& n', isCorrect: false },
                                { id: 'b', text: 'const int& n', isCorrect: false },
                                { id: 'c', text: 'int n (pass by value)', isCorrect: true },
                                { id: 'd', text: 'int* n', isCorrect: false },
                            ],
                            explanation:
                                'For small primitive types like `int`, pass-by-value is fine — the copy is cheap (4 bytes). `const int&` works but adds indirection overhead for no real benefit.',
                        },
                        {
                            question: 'If you need a function to output two values, what is the idiomatic C++ approach?',
                            options: [
                                { id: 'a', text: 'Use two return statements', isCorrect: false },
                                { id: 'b', text: 'Use global variables', isCorrect: false },
                                { id: 'c', text: 'Pass two output parameters by reference', isCorrect: true },
                                { id: 'd', text: 'Print both inside the function', isCorrect: false },
                            ],
                            explanation:
                                'A common C++ idiom for multiple outputs is to pass reference parameters that the function writes to: `void bounds(int& min, int& max)`. A modern alternative is to return a `std::pair` or struct.',
                        },
                    ],
                },
            },
            {
                order: 12,
                title: 'Challenge: Functions Workshop',
                type: 'CHALLENGE',
                content: `## 🏆 Functions Challenge: Student Grade Calculator

    Build a complete grade calculator program using functions.

    **Requirements:**
    1. \`double getAverage(double scores[], int count)\` — compute the average of an array of scores
    2. \`char getLetterGrade(double avg)\` — convert average to A/B/C/D/F
    3. \`void printReport(string name, double avg, char grade)\` — print a formatted report
    4. In \`main\`: create 3 students, compute their grades, and print their reports

    **Bonus**: Write a separate \`double getHighest(double scores[], int count)\` that returns the highest score (use pass-by-value for the array size).`,
                stepData: {
                    starterCode: `#include <iostream>
    #include <string>
    using namespace std;

    // ─── STEP 1: Prototype declarations ──────────────────────────────────
    // Write prototypes for:
    //   double getAverage(double scores[], int count)
    //   char getLetterGrade(double avg)
    //   void printReport(string name, double avg, char grade)
    //   double getHighest(double scores[], int count)  // BONUS


    // ─── STEP 2: main() ──────────────────────────────────────────────────
    int main() {
        // Student 1
        string name1 = "Alice";
        double scores1[] = {92, 88, 95, 90, 85};

        // Student 2
        string name2 = "Bob";
        double scores2[] = {70, 65, 72, 68, 75};

        // Student 3
        string name3 = "Charlie";
        double scores3[] = {55, 60, 48, 58, 52};

        // TODO: Calculate and print report for each student

        return 0;
    }

    // ─── STEP 3: Define the functions below main ─────────────────────────
    // TODO: Implement getAverage, getLetterGrade, printReport, getHighest`,
                    solution: `#include <iostream>
    #include <string>
    #include <iomanip>
    using namespace std;

    // ─── PROTOTYPES ───────────────────────────────────────────────────────
    double getAverage(double scores[], int count);
    char   getLetterGrade(double avg);
    void   printReport(string name, double avg, char grade);
    double getHighest(double scores[], int count);

    // ─── MAIN ─────────────────────────────────────────────────────────────
    int main() {
        double scores1[] = {92, 88, 95, 90, 85};
        double scores2[] = {70, 65, 72, 68, 75};
        double scores3[] = {55, 60, 48, 58, 52};
        int count = 5;

        // Calculate averages
        double avg1 = getAverage(scores1, count);
        double avg2 = getAverage(scores2, count);
        double avg3 = getAverage(scores3, count);

        // Print reports
        printReport("Alice",   avg1, getLetterGrade(avg1));
        printReport("Bob",     avg2, getLetterGrade(avg2));
        printReport("Charlie", avg3, getLetterGrade(avg3));

        // Bonus: highest scores
        cout << "\\nHighest scores:" << endl;
        cout << "  Alice:   " << getHighest(scores1, count) << endl;
        cout << "  Bob:     " << getHighest(scores2, count) << endl;
        cout << "  Charlie: " << getHighest(scores3, count) << endl;

        return 0;
    }

    // ─── DEFINITIONS ──────────────────────────────────────────────────────

    // Computes the arithmetic mean of an array of scores
    double getAverage(double scores[], int count) {
        double total = 0;
        for (int i = 0; i < count; i++) {
            total += scores[i];
        }
        return total / count;
    }

    // Converts a numeric average to a letter grade
    char getLetterGrade(double avg) {
        if (avg >= 90) return 'A';
        if (avg >= 80) return 'B';
        if (avg >= 70) return 'C';
        if (avg >= 60) return 'D';
        return 'F';
    }

    // Prints a formatted student report card
    void printReport(string name, double avg, char grade) {
        cout << fixed << setprecision(1);
        cout << "┌─────────────────────────────┐" << endl;
        cout << "│ Student: " << left << setw(20) << name << "│" << endl;
        cout << "│ Average: " << setw(6)  << avg  << "                │" << endl;
        cout << "│ Grade:   " << grade << "                     │" << endl;
        cout << "└─────────────────────────────┘" << endl;
    }

    // Finds and returns the highest score in the array
    double getHighest(double scores[], int count) {
        double highest = scores[0]; // start with first element
        for (int i = 1; i < count; i++) {
            if (scores[i] > highest) {
                highest = scores[i];
            }
        }
        return highest;
    }`,
                    hints: [
                        'Write all four prototypes at the top before main(). A prototype ends with a semicolon and has no body.',
                        '`getAverage`: Use a for loop to sum all scores, then divide by count.',
                        '`getLetterGrade`: Use a chain of if-else-if statements checking the average against grade boundaries. Return the char directly.',
                        '`printReport`: This function returns void — use cout to format the output. Try using setw() from <iomanip> for alignment.',
                        '`getHighest`: Initialize a variable to `scores[0]`, then loop from index 1 and update whenever you find a larger value.',
                    ],
                    language: 'cpp',
                },
            },
            {
                order: 13,
                title: 'Summary: Functions Basics',
                type: 'SUMMARY',
                content: `# Summary: C++ Functions Basics

    ## What is a Function?

    A **named, reusable block of code** that performs a specific task. Functions provide: **reusability**, **readability**, **maintainability**, and **testability**.

    ## Anatomy

    \`\`\`
    return_type  name(parameters) {
        // body
        return value; // if not void
    }
    \`\`\`

    ## Declaration vs Definition vs Call

    | | Example | Purpose |
    |--|---------|---------|
    | **Declaration** | \`int add(int a, int b);\` | Tells compiler the function exists |
    | **Definition** | \`int add(int a, int b) { return a+b; }\` | Actual implementation |
    | **Call** | \`int x = add(3, 5);\` | Uses the function |

    ## Parameter Passing: The Big Three

    | Method | Syntax | Copies? | Can Modify Original? | Use When |
    |--------|--------|---------|---------------------|----------|
    | By value | \`int n\` | ✅ Yes | ❌ No | Small types, read-only |
    | By reference | \`int& n\` | ❌ No | ✅ Yes | Need to modify original |
    | By const ref | \`const T& n\` | ❌ No | ❌ No | Large types, read-only |

    ## Key Rules

    1. **Declare before use** — use a prototype or define the function above its first call
    2. **void** — return type for functions that don't return a value
    3. **Pass-by-value** — the function gets a copy; originals are safe
    4. **Pass-by-reference** — the function gets an alias; originals CAN be changed
    5. **const reference** — best of both worlds for large read-only parameters
    6. **Local variables** — live on the stack, destroyed when the function returns

    > 🎯 **Next up**: Advanced Functions — overloading, default arguments, inline functions, and recursion!`,
            },
        ],
    });

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOPIC 3: cpp-functions-advanced
    // ═══════════════════════════════════════════════════════════════════════════════

    await createLearn({
        slug: 'cpp-functions-advanced',
        title: 'Advanced Functions (Overloading, Default Arguments, Inline, Recursion)',
        description:
            'Elevate your function skills with function overloading, default arguments, inline functions for performance, and recursion — including understanding the call stack, base cases, and classic recursive algorithms.',
        difficulty: 'INTERMEDIATE',
        unitNumber: 2,
        unitTitle: 'Unit 2: Control Structures & Functions',
        estimatedTime: 55,
        tags: ['overloading', 'default-arguments', 'inline', 'recursion', 'call-stack', 'advanced-functions'],
        iconEmoji: '🧠',
        steps: [
            // ─────────────────────────────────────────────────────────────────────
            // SECTION A: Function Overloading
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 0,
                title: 'Function Overloading — Concept',
                type: 'EXPLANATION',
                tips: [
                    'The compiler distinguishes overloads by parameter TYPES and COUNT — NOT by return type.',
                    'Two functions with the same name and same parameters but different return types will cause a compilation error.',
                    'Overloading is a form of compile-time (static) polymorphism.',
                ],
                content: `# Function Overloading

    ## The Problem: Same Operation, Different Types

    Imagine you want to print formatted values of different types:

    \`\`\`cpp
    // Without overloading — need different names for the same logical operation
    void printInt(int x)      { cout << "Int: " << x << endl; }
    void printDouble(double x) { cout << "Double: " << x << endl; }
    void printString(string x) { cout << "String: " << x << endl; }

    // Calling them is awkward
    printInt(42);
    printDouble(3.14);
    printString("hello");
    \`\`\`

    ---

    ## Function Overloading: Same Name, Different Parameters

    C++ allows **multiple functions with the same name** as long as they have **different parameter lists** (different types, different count, or different order).

    \`\`\`cpp
    // All named "print" — the compiler picks the right one based on argument type
    void print(int x)    { cout << "Int: " << x << endl; }
    void print(double x) { cout << "Double: " << x << endl; }
    void print(string x) { cout << "String: " << x << endl; }

    // Clean, uniform calling syntax
    print(42);       // calls print(int)
    print(3.14);     // calls print(double)
    print("hello");  // calls print(string)
    \`\`\`

    ---

    ## How the Compiler Chooses — Overload Resolution

    When you call an overloaded function, the compiler examines the argument types and selects the best match:

    \`\`\`
    print(42)
      └─► compiler looks for print(int)  → found ✅

    print(3.14)
      └─► compiler looks for print(double) → found ✅

    print("hello")
      └─► compiler looks for print(string) → found ✅

    print(true)
      └─► compiler looks for print(bool)   → not found
          tries implicit conversion to int  → found print(int) ✅
    \`\`\`

    ---

    ## Valid Overloads

    \`\`\`cpp
    int add(int a, int b);             // ✅
    double add(double a, double b);    // ✅ (different types)
    int add(int a, int b, int c);      // ✅ (different count)
    \`\`\`

    ## Invalid Overloads

    \`\`\`cpp
    int multiply(int a, int b);        // ✅ original
    double multiply(int a, int b);     // ❌ ERROR: same params, only return type differs!
                                       //    Compiler cannot distinguish at call site
    \`\`\`

    ---

    ## Why Overloading? (Design Principle)

    Overloading reduces **naming pollution** — instead of \`printInt\`, \`printDouble\`, \`printFloat\`, \`printString\`... you have one clean name \`print\` that works for everything.

    This is why \`cout <<\` works with any type — it's a heavily overloaded operator!`,
            },
            {
                order: 1,
                title: 'Function Overloading — Code Examples',
                type: 'CODE',
                content: '## Overloading in Action',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Overloaded area() Function',
                        language: 'cpp',
                        code: `#include <iostream>
    #include <cmath> // M_PI
    using namespace std;

    // ─── Overloaded area() for different shapes ───────────────────────────

    // Area of a square
    double area(double side) {
        return side * side;
    }

    // Area of a rectangle
    double area(double width, double height) {
        return width * height;
    }

    // Area of a circle (float radius)
    double area(float radius) {
        return M_PI * radius * radius; // M_PI = 3.14159...
    }

    // Area of a triangle
    double area(double base, double height, bool isTriangle) {
        return 0.5 * base * height;
        // the bool param makes this overload distinct from area(double, double)
    }

    int main() {
        cout << "Square (5x5):       " << area(5.0)            << endl;
        cout << "Rectangle (4x6):    " << area(4.0, 6.0)       << endl;
        cout << "Circle (r=3.0f):    " << area(3.0f)           << endl; // float!
        cout << "Triangle (b=6,h=4): " << area(6.0, 4.0, true) << endl;

        return 0;
    }`,
                        explanation:
                            'Four functions named `area`, each computing the area of a different shape. The compiler selects the right one based on argument types and count. Note that `3.0f` (float) calls a different overload than `3.0` (double).',
                        highlightLines: [8, 13, 18, 23, 29, 30, 31, 32],
                        isRunnable: true,
                    },
                    {
                        order: 1,
                        title: 'Overloaded print() — Generic Printing',
                        language: 'cpp',
                        code: `#include <iostream>
    #include <string>
    #include <vector>
    using namespace std;

    // Print a single value
    void print(int n)    { cout << "[int]    " << n << endl; }
    void print(double d) { cout << "[double] " << d << endl; }
    void print(string s) { cout << "[string] " << s << endl; }
    void print(bool b)   { cout << "[bool]   " << boolalpha << b << endl; }

    // Print a vector of ints
    void print(const vector<int>& v) {
        cout << "[vector] { ";
        for (const auto& x : v) cout << x << " ";
        cout << "}" << endl;
    }

    int main() {
        print(42);
        print(3.14159);
        print(string("Hello, Overloading!"));
        print(true);
        print(vector<int>{1, 2, 3, 4, 5});

        // The compiler automatically picks the right version!
        return 0;
    }`,
                        explanation:
                            'A family of `print` functions covering int, double, string, bool, and even vector<int>. The caller always writes `print(x)` and the compiler picks the right version at compile time — no runtime overhead.',
                        highlightLines: [7, 8, 9, 10, 13, 19, 20, 21, 22, 23],
                        isRunnable: true,
                    },
                ],
            },
            {
                order: 2,
                title: 'Function Overloading — Visual',
                type: 'VISUAL',
                content: `# Function Overloading: How the Compiler Chooses

    ## Overload Resolution Process

    \`\`\`
    Source code:  print(42);

                        │
               Compiler sees: print(int literal 42)
                        │
               Looks at all functions named "print":
               ┌──────────────────────────────────────┐
               │  print(int n)        ← matches! ✅   │
               │  print(double d)     ← no exact match │
               │  print(string s)     ← no exact match │
               │  print(bool b)       ← no exact match │
               └──────────────────────────────────────┘
                        │
               Calls print(int n) ─── Output: [int] 42
    \`\`\`

    ---

    ## Name Mangling: How Overloads Coexist

    Under the hood, the compiler gives each overload a unique internal name — this is called **name mangling**:

    \`\`\`
    Your C++ code:          Internal (mangled) name (GCC example):
    ──────────────────────  ────────────────────────────────────────
    print(int)           →  _Z5printi
    print(double)        →  _Z5printd
    print(string)        →  _Z5printNSt7__cxx1112basic_stringIcSt11...
    print(vector<int>)   →  _Z5printRKSt6vectorIiSaIiEE

    The LINKER uses mangled names — that's why overloads don't conflict!
    \`\`\`

    ---

    ## Valid vs Invalid Overloads

    \`\`\`
    VALID (compiler can distinguish):
      void f(int x)               ←─ #1
      void f(double x)            ←─ #2  different type
      void f(int x, int y)        ←─ #3  different count
      void f(double x, int y)     ←─ #4  different type order

    INVALID (ambiguous or return-type-only differences):
      int f(int x)                ←─ #1
      double f(int x)             ←─ ❌ same params, only return type differs
                                        compiler cannot tell at call site: f(5);

    AMBIGUOUS CALL:
      void f(int x)
      void f(double x)
      f(3.14f);  ← float! Can convert to int or double — AMBIGUOUS ❌
    \`\`\``,
            },
            {
                order: 3,
                title: 'Quiz: Function Overloading',
                type: 'QUIZ',
                content: '## Test Your Understanding of Overloading',
                stepData: {
                    questions: [
                        {
                            question: 'Which of these is NOT a valid overload of `void f(int x)`?',
                            options: [
                                { id: 'a', text: '`void f(double x)`', isCorrect: false },
                                { id: 'b', text: '`void f(int x, int y)`', isCorrect: false },
                                { id: 'c', text: '`int f(int x)` — same params, different return type', isCorrect: true },
                                { id: 'd', text: '`void f(int x, double y)`', isCorrect: false },
                            ],
                            explanation:
                                'Overloads must differ in parameter types or count. Differing only in return type is NOT a valid overload because the compiler cannot distinguish them at the call site.',
                        },
                        {
                            question: 'How does the C++ compiler select which overload to call?',
                            options: [
                                { id: 'a', text: 'At runtime based on the actual value', isCorrect: false },
                                { id: 'b', text: 'At compile time based on the argument types and count', isCorrect: true },
                                { id: 'c', text: 'Always calls the first matching definition', isCorrect: false },
                                { id: 'd', text: 'Based on the return type expected by the caller', isCorrect: false },
                            ],
                            explanation:
                                'Overload resolution happens at compile time. The compiler examines the argument types/count and selects the best-matching overload.',
                        },
                        {
                            question: 'Given `void f(int)` and `void f(double)`, what happens with `f(3.14f)`?',
                            options: [
                                { id: 'a', text: 'Calls f(int)', isCorrect: false },
                                { id: 'b', text: 'Calls f(double)', isCorrect: false },
                                { id: 'c', text: 'Ambiguous — might be a compile error or implicit conversion', isCorrect: true },
                                { id: 'd', text: 'Runtime crash', isCorrect: false },
                            ],
                            explanation:
                                '`3.14f` is a float literal. A float can convert to both int and double, creating ambiguity. The compiler may report an error or choose based on which conversion is ranked better.',
                        },
                        {
                            question: 'What is name mangling?',
                            options: [
                                { id: 'a', text: 'Renaming variables for security', isCorrect: false },
                                { id: 'b', text: 'The compiler generating unique internal names for each overload', isCorrect: true },
                                { id: 'c', text: 'Garbled function names due to a bug', isCorrect: false },
                                { id: 'd', text: 'A linker error', isCorrect: false },
                            ],
                            explanation:
                                'Name mangling is how the compiler gives each overloaded function a unique internal symbol (encoding parameter types into the name) so the linker can distinguish them.',
                        },
                    ],
                },
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION B: Default Arguments
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 4,
                title: 'Default Arguments — Concept',
                type: 'EXPLANATION',
                tips: [
                    'Default arguments must go RIGHT-to-LEFT — you can\'t have a default argument followed by a non-default one.',
                    'Specify default values in the declaration (prototype), NOT in the definition (if they are separate).',
                    'Default arguments can make function calls shorter while keeping flexibility.',
                ],
                content: `# Default Arguments

    ## The Motivation

    Suppose you write a function to draw a box, and most of the time it should use the color "white" and style "solid". But occasionally you need other options.

    Without defaults:

    \`\`\`cpp
    void drawBox(int width, int height, string color, string style) { ... }

    // Every call needs all 4 args — tedious!
    drawBox(10, 5, "white", "solid"); // most common call
    drawBox(10, 5, "red", "solid");
    drawBox(10, 5, "white", "dashed");
    \`\`\`

    ---

    ## Default Arguments: Pre-fill Rarely-Changed Parameters

    \`\`\`cpp
    //                                 ↓ default  ↓ default
    void drawBox(int width, int height, string color = "white", string style = "solid") {
        cout << "Box " << width << "x" << height
             << " color=" << color << " style=" << style << endl;
    }

    drawBox(10, 5);                    // Uses "white" and "solid"
    drawBox(10, 5, "red");             // Uses "solid" for style
    drawBox(10, 5, "blue", "dashed");  // Overrides both defaults
    \`\`\`

    ---

    ## The Right-to-Left Rule

    Defaults must be applied from **right to left** — there can be no non-default parameter after a default one:

    \`\`\`cpp
    // ✅ Valid — defaults go from right to left
    void f(int a, int b = 10, int c = 20);

    // ❌ Invalid — non-default 'c' after default 'b'
    void f(int a = 5, int b, int c = 20); // COMPILE ERROR
    \`\`\`

    **Why?** Because when you call \`f(1, 2)\`, the compiler fills arguments left-to-right. It needs to know where the "user-provided" args end and the "default" args begin.

    ---

    ## Where to Specify Defaults

    **Rule**: Specify defaults in the **declaration/prototype**, not in the separate definition.

    \`\`\`cpp
    // ✅ In the prototype (declaration):
    void greet(string name, string greeting = "Hello");

    // Definition — no defaults repeated here
    void greet(string name, string greeting) {
        cout << greeting << ", " << name << "!" << endl;
    }
    \`\`\`

    ---

    ## Defaults vs Overloading

    Often, default arguments can replace overloading:

    \`\`\`cpp
    // Overloading approach
    void log(string msg) { ... }
    void log(string msg, string level) { ... }

    // Default argument approach (simpler)
    void log(string msg, string level = "INFO") { ... }
    \`\`\``,
            },
            {
                order: 5,
                title: 'Default Arguments — Code Examples',
                type: 'CODE',
                content: '## Default Arguments in Practice',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Power Function with Default Exponent',
                        language: 'cpp',
                        code: `#include <iostream>
    #include <string>
    using namespace std;

    // Default exponent is 2 (squaring is the most common use)
    double power(double base, int exponent = 2) {
        double result = 1.0;
        for (int i = 0; i < exponent; i++) {
            result *= base;
        }
        return result;
    }

    // Logger with optional level and timestamp
    void log(string message, string level = "INFO", bool showTime = false) {
        if (showTime) cout << "[00:00:00] ";
        cout << "[" << level << "] " << message << endl;
    }

    int main() {
        // power with default exponent (2)
        cout << "4 squared:  " << power(4) << endl;      // power(4, 2)
        cout << "2 cubed:    " << power(2, 3) << endl;    // power(2, 3)
        cout << "3^5:        " << power(3, 5) << endl;

        cout << endl;

        // log with various defaults
        log("Application started");                     // INFO, no time
        log("Low memory warning", "WARN");              // WARN, no time
        log("System error!", "ERROR", true);            // ERROR, with time

        return 0;
    }`,
                        explanation:
                            '`power(4)` uses the default exponent of 2. `log("msg")` uses default level "INFO" and showTime=false. Notice how defaults make the most common call shortest while still allowing customization.',
                        highlightLines: [6, 15, 22, 29, 30, 31],
                        isRunnable: true,
                    },
                ],
            },
            {
                order: 6,
                title: 'Quiz: Default Arguments',
                type: 'QUIZ',
                content: '## Test Your Understanding of Default Arguments',
                stepData: {
                    questions: [
                        {
                            question: 'Which parameter declaration is INVALID for default arguments?',
                            options: [
                                { id: 'a', text: '`void f(int a, int b = 5)`', isCorrect: false },
                                { id: 'b', text: '`void f(int a = 1, int b = 2, int c = 3)`', isCorrect: false },
                                { id: 'c', text: '`void f(int a = 1, int b, int c = 3)`', isCorrect: true },
                                { id: 'd', text: '`void f(int a, int b = 2, int c = 3)`', isCorrect: false },
                            ],
                            explanation:
                                '`int b` has no default but comes after `int a = 1` which does. Non-default parameters cannot appear after default ones — defaults must be rightmost.',
                        },
                        {
                            question: 'Given `void f(int x, int y = 10, int z = 20)`, what does `f(1, 2)` pass as z?',
                            options: [
                                { id: 'a', text: '1', isCorrect: false },
                                { id: 'b', text: '2', isCorrect: false },
                                { id: 'c', text: '20 (the default)', isCorrect: true },
                                { id: 'd', text: 'Undefined', isCorrect: false },
                            ],
                            explanation: 'f(1, 2) provides x=1 and y=2 explicitly. z gets its default value of 20 since it was not provided.',
                        },
                        {
                            question: 'Where should default argument values be specified?',
                            options: [
                                { id: 'a', text: 'In the function definition body', isCorrect: false },
                                { id: 'b', text: 'In the function declaration (prototype)', isCorrect: true },
                                { id: 'c', text: 'At the call site', isCorrect: false },
                                { id: 'd', text: 'In a config file', isCorrect: false },
                            ],
                            explanation:
                                'Default values belong in the function declaration/prototype. If the declaration and definition are separate, only the declaration should have the defaults.',
                        },
                    ],
                },
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION C: Inline Functions
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 7,
                title: 'Inline Functions — Concept',
                type: 'EXPLANATION',
                tips: [
                    '`inline` is a HINT to the compiler — it is not a command. The compiler may ignore it.',
                    'Modern compilers inline small functions automatically (even without the keyword) and refuse to inline huge ones.',
                    'Inline functions should be defined in header files (.h) because the definition must be visible wherever it is used.',
                ],
                content: `# Inline Functions

    ## The Function Call Overhead

    Every function call has a small overhead:
    1. **Save registers** and current execution state
    2. **Jump** to the function's location in memory
    3. Execute the function body
    4. **Restore state** and jump back
    5. **Return value**

    For large functions, this overhead is negligible. But for tiny functions called millions of times, it can matter.

    ---

    ## The \`inline\` Keyword

    The \`inline\` keyword is a **hint** to the compiler to copy the function's code directly into the call site instead of making an actual function call:

    \`\`\`cpp
    inline int square(int x) {
        return x * x;
    }

    // Call site:
    int result = square(5);

    // Compiler may replace this with:
    int result = 5 * 5;    // No call overhead!
    \`\`\`

    ---

    ## Regular Call vs Inline Expansion

    \`\`\`
    Regular function call:
      main → [save state] → jump to square() → execute → jump back → restore state

    Inline expansion:
      main → [executes x*x directly, no jump]
    \`\`\`

    ---

    ## When Should You Use \`inline\`?

    ✅ **Good candidates** for inlining:
    - Very small, simple functions (1-5 lines)
    - Functions called in tight loops
    - Getter/setter functions

    ❌ **Bad candidates** for inlining:
    - Large functions (increases code size → cache misses can HURT performance)
    - Recursive functions (can't be inlined — would be infinite expansion!)
    - Virtual functions (runtime dispatch, can't be resolved at compile time)

    ---

    ## The Modern Reality

    With modern compilers (g++, clang++), **you rarely need to write \`inline\` yourself**:
    - The compiler automatically inlines small functions
    - Compilers use **Link-Time Optimization (LTO)** to inline across files
    - \`inline\` is mostly needed today for **header-only function definitions** to avoid "multiple definition" linker errors

    \`\`\`cpp
    // header.h
    inline int max(int a, int b) {
        return (a > b) ? a : b;
    }
    // Without inline, including this header in multiple .cpp files
    // would cause "multiple definition" linker errors
    \`\`\``,
            },
            {
                order: 8,
                title: 'Inline Functions — Code Examples',
                type: 'CODE',
                content: '## Inline Functions in Practice',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Inline Math Helpers',
                        language: 'cpp',
                        code: `#include <iostream>
    using namespace std;

    // ─── Inline candidates: tiny, simple, frequently-called ──────────────

    inline int    square(int x)         { return x * x; }
    inline double cube(double x)        { return x * x * x; }
    inline int    clamp(int v, int lo, int hi) { return (v < lo) ? lo : (v > hi) ? hi : v; }
    inline bool   inRange(int v, int lo, int hi) { return v >= lo && v <= hi; }

    int main() {
        cout << "square(7):            " << square(7) << endl;    // 49
        cout << "cube(3.0):            " << cube(3.0) << endl;    // 27
        cout << "clamp(150, 0, 100):   " << clamp(150, 0, 100) << endl; // 100
        cout << "clamp(-5, 0, 100):    " << clamp(-5, 0, 100) << endl;  // 0
        cout << "inRange(50, 0, 100):  " << inRange(50, 0, 100) << endl; // 1 (true)
        cout << "inRange(150, 0, 100): " << inRange(150, 0, 100) << endl; // 0 (false)

        // These are so simple that most compilers inline them automatically,
        // even without the 'inline' keyword, due to optimization flags (-O2)
        return 0;
    }`,
                        explanation:
                            'These tiny utility functions are perfect inline candidates: one line each, purely computational, frequently called. The `inline` keyword is mostly documentation here — modern compilers will inline them regardless with -O2.',
                        highlightLines: [6, 7, 8, 9],
                        isRunnable: true,
                    },
                ],
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION D: Recursion
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 9,
                title: 'Recursion — Concept & The Two Rules',
                type: 'EXPLANATION',
                tips: [
                    'Every recursive function MUST have a base case — otherwise it causes a stack overflow.',
                    'Each recursive call must make the problem SMALLER, moving toward the base case.',
                    'Recursion is elegant for problems that are naturally self-similar (trees, fractals, divide-and-conquer).',
                    'For very deep recursion (N > 10,000), prefer iteration to avoid stack overflow.',
                ],
                content: `# Recursion

    ## What is Recursion?

    A **recursive function** is one that calls itself. It solves a problem by breaking it into a **smaller version of the same problem** until it reaches a trivially simple case.

    ---

    ## The Two Mandatory Rules

    Every correct recursive function has exactly:

    ### Rule 1: The Base Case
    A condition that **stops the recursion**. Without it, the function calls itself forever → stack overflow crash.

    ### Rule 2: The Recursive Case
    A call to itself with a **smaller** version of the problem, getting closer to the base case.

    \`\`\`cpp
    int factorial(int n) {
        // BASE CASE: factorial of 0 or 1 is 1
        if (n <= 1) return 1;

        // RECURSIVE CASE: n! = n × (n-1)!
        return n * factorial(n - 1); // ← calls itself with SMALLER n
    }
    \`\`\`

    ---

    ## Thinking Recursively

    To solve \`factorial(5)\`:
    - "What is 5!?" → "5 times 4!" → ask \`factorial(4)\`
      - "What is 4!?" → "4 times 3!" → ask \`factorial(3)\`
        - "What is 3!?" → "3 times 2!" → ask \`factorial(2)\`
          - "What is 2!?" → "2 times 1!" → ask \`factorial(1)\`
            - "What is 1!?" → **BASE CASE** → return **1**
          - Gets 1 back → 2 × 1 = **2** → return 2
        - Gets 2 back → 3 × 2 = **6** → return 6
      - Gets 6 back → 4 × 6 = **24** → return 24
    - Gets 24 back → 5 × 24 = **120** → return **120** ✅

    ---

    ## The Stack Overflow

    If you forget the base case:

    \`\`\`cpp
    int broken(int n) {
        return n * broken(n - 1); // No base case!
    }
    \`\`\`

    \`\`\`
    broken(5) calls broken(4) calls broken(3) calls broken(2)
      ... calls broken(-1000) calls broken(-1001) ...
      Eventually: STACK OVERFLOW — the stack runs out of space!
    \`\`\`

    ---

    ## Recursion vs Iteration

    Any recursion can be converted to iteration (and vice versa):

    \`\`\`cpp
    // Recursive factorial
    int factRec(int n) {
        if (n <= 1) return 1;
        return n * factRec(n - 1);
    }

    // Iterative factorial — same result, no call stack overhead
    int factIter(int n) {
        int result = 1;
        for (int i = 2; i <= n; i++) result *= i;
        return result;
    }
    \`\`\`

    **Choose recursion when**: the problem is naturally recursive (trees, graphs, divide-and-conquer algorithms)  
    **Choose iteration when**: the depth could be large, or performance is critical`,
            },
            {
                order: 10,
                title: 'Recursion — Code Examples',
                type: 'CODE',
                content: '## Classic Recursive Algorithms',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Factorial and Fibonacci',
                        language: 'cpp',
                        code: `#include <iostream>
    using namespace std;

    // ─── FACTORIAL ────────────────────────────────────────────────────────
    // n! = n × (n-1) × (n-2) × ... × 2 × 1
    // 0! = 1  (by definition)
    long long factorial(int n) {
        // Base case: 0! and 1! are both 1
        if (n <= 1) return 1;

        // Recursive case: n! = n × (n-1)!
        return (long long)n * factorial(n - 1);
    }

    // ─── FIBONACCI ────────────────────────────────────────────────────────
    // Sequence: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, ...
    // fib(0)=0, fib(1)=1, fib(n) = fib(n-1) + fib(n-2)
    int fibonacci(int n) {
        // Base cases: fib(0) = 0, fib(1) = 1
        if (n == 0) return 0;
        if (n == 1) return 1;

        // Recursive case: each number is sum of previous two
        return fibonacci(n - 1) + fibonacci(n - 2);
    }

    int main() {
        cout << "=== Factorials ===" << endl;
        for (int i = 0; i <= 10; i++) {
            cout << i << "! = " << factorial(i) << endl;
        }

        cout << "\\n=== Fibonacci Sequence (first 12 terms) ===" << endl;
        for (int i = 0; i < 12; i++) {
            cout << "fib(" << i << ") = " << fibonacci(i) << endl;
        }

        return 0;
    }`,
                        explanation:
                            'Two classic recursive functions. `factorial` has one base case and makes one recursive call per level. `fibonacci` has two base cases and makes TWO recursive calls — this makes it exponentially slower (O(2^n)); a real implementation would use memoization or iteration.',
                        highlightLines: [9, 12, 20, 21, 24, 29, 34],
                        isRunnable: true,
                    },
                    {
                        order: 1,
                        title: 'Recursive Sum and Power',
                        language: 'cpp',
                        code: `#include <iostream>
    using namespace std;

    // ─── SUM of 1 + 2 + ... + n ──────────────────────────────────────────
    int sumToN(int n) {
        if (n <= 0) return 0;              // base case
        return n + sumToN(n - 1);          // n + sum(1..n-1)
    }

    // ─── POWER: base^exp ──────────────────────────────────────────────────
    // Fast exponentiation by squaring — O(log n) instead of O(n)
    double power(double base, int exp) {
        if (exp == 0) return 1.0;                         // base case: x^0 = 1
        if (exp % 2 == 0) {
            double half = power(base, exp / 2);           // even: x^n = (x^(n/2))^2
            return half * half;
        } else {
            return base * power(base, exp - 1);           // odd: x^n = x * x^(n-1)
        }
    }

    // ─── COUNTDOWN (illustrates recursion with output) ────────────────────
    void countdown(int n) {
        if (n <= 0) {                      // base case
            cout << "Blastoff! 🚀" << endl;
            return;
        }
        cout << n << "... ";
        countdown(n - 1);                  // recursive call with smaller n
    }

    int main() {
        cout << "Sum 1 to 10: " << sumToN(10) << endl;       // 55

        cout << "2^10 = " << power(2.0, 10) << endl;          // 1024
        cout << "3^5  = " << power(3.0, 5)  << endl;          // 243

        cout << "\\nCountdown from 5:" << endl;
        countdown(5);

        return 0;
    }`,
                        explanation:
                            '`sumToN` demonstrates a linear recursion. `power` shows fast exponentiation — squaring at each even step makes it O(log n) instead of O(n). `countdown` shows that recursive functions can perform output, not just computations.',
                        highlightLines: [6, 7, 13, 14, 15, 17, 23, 27, 28],
                        isRunnable: true,
                    },
                ],
            },
            {
                order: 11,
                title: 'Recursion — Visual Call Stack Diagram',
                type: 'VISUAL',
                content: `# Recursion: Call Stack Visualization

    ## factorial(4) Unwind

    \`\`\`
    CALL STACK (grows downward as functions are called):

    factorial(4) called from main()
      ├─ 4 <= 1? No → calls factorial(3)
      │   ├─ 3 <= 1? No → calls factorial(2)
      │   │   ├─ 2 <= 1? No → calls factorial(1)
      │   │   │   └─ 1 <= 1? YES → BASE CASE → return 1
      │   │   └─ receives 1 → returns 2 × 1 = 2
      │   └─ receives 2 → returns 3 × 2 = 6
      └─ receives 6 → returns 4 × 6 = 24

    main() receives 24 ✅

    Stack frames at deepest point:
    ┌────────────────────────┐  ← TOP of stack (most recent)
    │ factorial(1): n=1      │  BASE CASE: returns 1
    ├────────────────────────┤
    │ factorial(2): n=2      │  waiting for factorial(1) to return
    ├────────────────────────┤
    │ factorial(3): n=3      │  waiting for factorial(2) to return
    ├────────────────────────┤
    │ factorial(4): n=4      │  waiting for factorial(3) to return
    ├────────────────────────┤
    │ main()                 │  waiting for factorial(4) to return
    └────────────────────────┘  ← BOTTOM of stack
    \`\`\`

    ---

    ## Stack Overflow: What Happens Without a Base Case

    \`\`\`
    int f(int n) { return f(n-1); }  // No base case!

    f(3) → f(2) → f(1) → f(0) → f(-1) → f(-2) → ...
                                      → f(-1000000)
                                      → STACK FULL! → CRASH
                                      "Segmentation fault" or "Stack overflow"
    \`\`\`

    ---

    ## Recursion vs Iteration: When to Use Each

    \`\`\`
    Problem Type            │ Recursion         │ Iteration
    ────────────────────────┼───────────────────┼──────────────────────
    Tree/Graph traversal    │ ✅ Natural         │ ⚠️ Need explicit stack
    Divide & Conquer        │ ✅ Natural         │ Complex
    Simple linear (sum,fact)│ ⚠️ Elegant but    │ ✅ Preferred (faster)
                            │   stack overhead  │
    Deep recursion (N>10000)│ ❌ Stack overflow  │ ✅ Use iteration
    Fibonacci (naive)       │ ❌ O(2^n)          │ ✅ O(n)
    \`\`\`

    ---

    ## The Two Rules — Visualized

    \`\`\`
    Every recursive call:

      factorial(n)
           │
           ▼
      n <= 1? ───YES───► Return 1   ← RULE 1: BASE CASE (stops here)
           │
           NO
           │
           ▼
      Return n × factorial(n-1)     ← RULE 2: RECURSIVE CASE
                            ↑
                        SMALLER problem (n-1 < n)
                        Moving toward base case
    \`\`\``,
            },
            {
                order: 12,
                title: 'Quiz: Recursion',
                type: 'QUIZ',
                content: '## Test Your Understanding of Recursion',
                stepData: {
                    questions: [
                        {
                            question: 'What MUST every recursive function have to avoid infinite recursion?',
                            options: [
                                { id: 'a', text: 'A loop inside it', isCorrect: false },
                                { id: 'b', text: 'A base case that stops the recursion', isCorrect: true },
                                { id: 'c', text: 'A global variable', isCorrect: false },
                                { id: 'd', text: 'Multiple return statements', isCorrect: false },
                            ],
                            explanation:
                                'Every recursive function must have at least one base case — a condition that returns without making another recursive call. Without it, the recursion never ends.',
                        },
                        {
                            question: 'What is the output of `factorial(0)` given the function `int factorial(int n) { if (n <= 1) return 1; return n * factorial(n-1); }`?',
                            options: [
                                { id: 'a', text: '0', isCorrect: false },
                                { id: 'b', text: '1', isCorrect: true },
                                { id: 'c', text: 'Error', isCorrect: false },
                                { id: 'd', text: 'Infinite loop', isCorrect: false },
                            ],
                            explanation: 'factorial(0): 0 <= 1 is true, so the base case triggers and returns 1. By mathematical definition, 0! = 1.',
                        },
                        {
                            question: 'What happens if a recursive function\'s recursive case does NOT make the problem smaller?',
                            options: [
                                { id: 'a', text: 'It terminates normally', isCorrect: false },
                                { id: 'b', text: 'The compiler optimizes it', isCorrect: false },
                                { id: 'c', text: 'Infinite recursion leading to a stack overflow crash', isCorrect: true },
                                { id: 'd', text: 'It skips the recursive call', isCorrect: false },
                            ],
                            explanation:
                                'If each recursive call does not move closer to the base case, the function recurses forever, eventually exhausting the call stack and crashing with a stack overflow.',
                        },
                        {
                            question: 'How many recursive calls does `fibonacci(4)` make in total (including all sub-calls)?',
                            options: [
                                { id: 'a', text: '4', isCorrect: false },
                                { id: 'b', text: '8', isCorrect: false },
                                { id: 'c', text: 'About 9 (fib makes an exponential number of calls)', isCorrect: true },
                                { id: 'd', text: '2', isCorrect: false },
                            ],
                            explanation:
                                'fib(4) calls fib(3)+fib(2); fib(3) calls fib(2)+fib(1); fib(2) calls fib(1)+fib(0) — total about 9 function calls. Naive Fibonacci is O(2^n).',
                        },
                        {
                            question: 'Which of these functions is NOT a good candidate for an inline function?',
                            options: [
                                { id: 'a', text: '`inline int square(int x) { return x*x; }`', isCorrect: false },
                                { id: 'b', text: '`inline bool isEven(int n) { return n%2==0; }`', isCorrect: false },
                                { id: 'c', text: 'A recursive function with 100+ lines of body code', isCorrect: true },
                                { id: 'd', text: '`inline int clamp(int v, int lo, int hi)`', isCorrect: false },
                            ],
                            explanation:
                                'Recursive functions CANNOT be truly inlined (infinite expansion), and large functions would bloat the code at every call site. Inline is for small, simple, non-recursive functions.',
                        },
                    ],
                },
            },
            {
                order: 13,
                title: 'Challenge: Advanced Functions',
                type: 'CHALLENGE',
                content: `## 🏆 Challenge: Recursion + Overloading Workshop

    **Part 1: Recursive Power Function**
    Write a recursive function \`long long power(int base, int exp)\` that computes \`base^exp\`.
    - Base case: any number to the power 0 is 1
    - Recursive case: base^exp = base × base^(exp-1)

    **Part 2: Overloaded max() Function**  
    Write overloaded versions of \`max\` for:
    - Two integers
    - Two doubles  
    - Three integers (returns the largest of three)

    **Part 3: Recursive Palindrome Check**
    Write \`bool isPalindrome(string s, int left, int right)\` that recursively checks if a string is a palindrome (reads the same forwards and backwards).
    - Base case: if left >= right, it's a palindrome
    - Recursive case: check if s[left] == s[right], then recurse inward`,
                stepData: {
                    starterCode: `#include <iostream>
    #include <string>
    using namespace std;

    // ─── PART 1: Recursive power ────────────────────────────────────────
    // TODO: Write recursive long long power(int base, int exp)
    // Base case: exp == 0 → return 1
    // Recursive: base * power(base, exp-1)


    // ─── PART 2: Overloaded max() ───────────────────────────────────────
    // TODO: Write three overloads:
    //   int max(int a, int b)
    //   double max(double a, double b)
    //   int max(int a, int b, int c)


    // ─── PART 3: Recursive palindrome ───────────────────────────────────
    // TODO: Write bool isPalindrome(string s, int left, int right)
    // Base: left >= right → true (empty or single char → palindrome)
    // Recursive: s[left]==s[right] AND isPalindrome(s, left+1, right-1)


    int main() {
        // Test power
        cout << "2^10 = " << power(2, 10) << endl;  // 1024
        cout << "3^5  = " << power(3, 5) << endl;   // 243
        cout << "5^0  = " << power(5, 0) << endl;   // 1

        // Test max overloads
        cout << "max(3, 7):       " << max(3, 7) << endl;         // 7
        cout << "max(3.14, 2.71): " << max(3.14, 2.71) << endl;  // 3.14
        cout << "max(5, 2, 9):    " << max(5, 2, 9) << endl;     // 9

        // Test palindrome
        string test1 = "racecar";
        string test2 = "hello";
        string test3 = "level";
        cout << test1 << " palindrome? " << (isPalindrome(test1, 0, test1.size()-1) ? "Yes" : "No") << endl;
        cout << test2 << " palindrome? " << (isPalindrome(test2, 0, test2.size()-1) ? "Yes" : "No") << endl;
        cout << test3 << " palindrome? " << (isPalindrome(test3, 0, test3.size()-1) ? "Yes" : "No") << endl;

        return 0;
    }`,
                    solution: `#include <iostream>
    #include <string>
    using namespace std;

    // ─── PART 1: Recursive power ─────────────────────────────────────────
    long long power(int base, int exp) {
        if (exp == 0) return 1;                  // base case: x^0 = 1
        return (long long)base * power(base, exp - 1); // recursive: x^n = x * x^(n-1)
    }

    // ─── PART 2: Overloaded max() ────────────────────────────────────────

    // max of two integers
    int max(int a, int b) {
        return (a > b) ? a : b;
    }

    // max of two doubles
    double max(double a, double b) {
        return (a > b) ? a : b;
    }

    // max of three integers — reuses the two-int version!
    int max(int a, int b, int c) {
        return max(max(a, b), c); // max(a,b) gives the larger of first two, then compare with c
    }

    // ─── PART 3: Recursive palindrome ────────────────────────────────────
    bool isPalindrome(string s, int left, int right) {
        // Base case: pointers have crossed — all chars matched!
        if (left >= right) return true;

        // If outer characters don't match, it's NOT a palindrome
        if (s[left] != s[right]) return false;

        // Recursive case: check the inner substring
        return isPalindrome(s, left + 1, right - 1);
    }

    int main() {
        // Test power
        cout << "2^10 = " << power(2, 10) << endl;  // 1024
        cout << "3^5  = " << power(3, 5) << endl;   // 243
        cout << "5^0  = " << power(5, 0) << endl;   // 1

        // Test max overloads
        cout << "max(3, 7):       " << max(3, 7) << endl;
        cout << "max(3.14, 2.71): " << max(3.14, 2.71) << endl;
        cout << "max(5, 2, 9):    " << max(5, 2, 9) << endl;

        // Test palindrome
        string test1 = "racecar";
        string test2 = "hello";
        string test3 = "level";
        cout << test1 << " palindrome? " << (isPalindrome(test1, 0, test1.size()-1) ? "Yes" : "No") << endl;
        cout << test2 << " palindrome? " << (isPalindrome(test2, 0, test2.size()-1) ? "Yes" : "No") << endl;
        cout << test3 << " palindrome? " << (isPalindrome(test3, 0, test3.size()-1) ? "Yes" : "No") << endl;

        return 0;
    }`,
                    hints: [
                        'For `power`: The base case is `exp == 0` → return 1. The recursive case multiplies base by `power(base, exp-1)`.',
                        'For overloaded `max`: Write separate functions with different parameter lists. The three-int version can call the two-int version twice.',
                        'For `isPalindrome`: Use two index parameters `left` and `right` starting at 0 and `s.size()-1`. Move them inward: `left+1` and `right-1`.',
                        'Palindrome base case: when `left >= right`, all characters have matched — return true.',
                        'Palindrome early exit: if `s[left] != s[right]` at any point, return false immediately.',
                    ],
                    language: 'cpp',
                },
            },
            {
                order: 14,
                title: 'Summary: Advanced Functions',
                type: 'SUMMARY',
                content: `# Summary: Advanced Functions

    ## Function Overloading

    - **Same name, different parameter lists** — the compiler picks the right one at compile time
    - Distinguished by **parameter count, types, or order** — NOT by return type
    - Compiler performs **overload resolution** at compile time
    - Internal **name mangling** gives each overload a unique symbol

    \`\`\`cpp
    int add(int a, int b);           // overload 1
    double add(double a, double b);  // overload 2
    int add(int a, int b, int c);    // overload 3
    \`\`\`

    ## Default Arguments

    - Provide **pre-filled values** for optional parameters
    - Must be **right-to-left** — no default before a non-default
    - Specify in the **declaration/prototype**, not in the definition
    - Simplifies calls without sacrificing flexibility

    \`\`\`cpp
    void log(string msg, string level = "INFO", bool time = false);
    log("Hello");              // level=INFO, time=false
    log("Error!", "ERROR");    // time=false
    \`\`\`

    ## Inline Functions

    - A **hint** to the compiler to expand the function body at the call site
    - Eliminates function call overhead for **tiny, simple functions**
    - Modern compilers inline automatically; the keyword is mainly for header definitions
    - **Not suitable** for large or recursive functions

    ## Recursion

    - A function that **calls itself** to solve a smaller version of the same problem
    - **Two mandatory elements**: base case (stops recursion) + recursive case (smaller problem)
    - Each call creates a **stack frame** — too many levels → stack overflow
    - Elegant for naturally recursive problems (trees, divide-and-conquer)
    - Use iteration for simple linear problems and very deep recursion

    \`\`\`
    Always ask:
      1. What is my BASE CASE? (How does it stop?)
      2. How does each call make the problem SMALLER?
    \`\`\`

    > 🎯 **Next up**: Arrays — 1D and 2D arrays, and how arrays relate to memory!`,
            },
        ],
    });

    // ═══════════════════════════════════════════════════════════════════════════════
    // UNIT 3: Arrays, Strings, and Memory
    // Topics: cpp-arrays, cpp-strings, cpp-pointers-basics, cpp-dynamic-memory, cpp-references
    // ═══════════════════════════════════════════════════════════════════════════════

    // Paste this inside your seedCppLearnContent() function, after the Unit 2 topics.

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOPIC 1: cpp-arrays
    // ═══════════════════════════════════════════════════════════════════════════════

    await createLearn({
        slug: 'cpp-arrays',
        title: 'Arrays (1D Arrays, 2D Arrays, Array Decay)',
        description:
            'Master C++ arrays from first principles: declaring and initializing 1D arrays, iterating and manipulating elements, multi-dimensional 2D arrays, passing arrays to functions, and the critical concept of array decay — how arrays silently become pointers.',
        difficulty: 'BEGINNER',
        unitNumber: 3,
        unitTitle: 'Unit 3: Arrays, Strings, and Memory',
        estimatedTime: 55,
        tags: ['arrays', '1d-array', '2d-array', 'array-decay', 'memory', 'indexing'],
        iconEmoji: '📊',
        steps: [

            // ─────────────────────────────────────────────────────────────────────
            // SECTION A: 1D Arrays
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 0,
                title: '1D Arrays — Concept & Memory Layout',
                type: 'EXPLANATION',
                tips: [
                    'Array indices start at 0. For an array of size N, valid indices are 0 to N-1.',
                    'Accessing out-of-bounds (e.g., arr[5] on a size-5 array) is undefined behavior — no error thrown, just potential crashes or data corruption.',
                    'The size must be a compile-time constant for stack-allocated C arrays.',
                ],
                content: `# 1D Arrays

## The Problem: Storing Many Values

Suppose you need scores for 100 students. Without arrays:

\`\`\`cpp
int score0, score1, score2; // ... up to score99? 😱
// AND you can't even loop over them!
\`\`\`

---

## What is an Array?

An **array** is a **contiguous block of memory** holding multiple values of the **same type**, accessed by an integer index.

\`\`\`
int scores[5] = {85, 92, 78, 96, 88};

Index:    [  0  ] [  1  ] [  2  ] [  3  ] [  4  ]
          ┌──────┬──────┬──────┬──────┬──────┐
scores:   │  85  │  92  │  78  │  96  │  88  │
          └──────┴──────┴──────┴──────┴──────┘
Address:  0x100   0x104   0x108   0x10C   0x110
          ↑
      base address (where the array starts)
\`\`\`

> 🔑 **Key properties**:
> - Elements are **adjacent in memory** — element i immediately follows element i-1
> - All elements have the **same type** (and the same byte size)
> - **Zero-based indexing**: first = \`[0]\`, last = \`[size-1]\`

---

## Declaration Syntax

\`\`\`cpp
type  name[size];
 │      │    └─ Number of elements (compile-time constant)
 │      └─ The array's name
 └─ Type of every element
\`\`\`

\`\`\`cpp
int    scores[100];       // 100 integers
double temperatures[24];  // 24 doubles
char   name[50];          // 50 characters (a C-string)
bool   flags[8];          // 8 booleans
\`\`\`

---

## Initialization

\`\`\`cpp
// Method 1: explicit values
int scores[5] = {85, 92, 78, 96, 88};

// Method 2: compiler counts size
int scores[] = {85, 92, 78, 96, 88};   // size deduced as 5

// Method 3: partial init — rest become 0
int scores[5] = {85, 92};              // {85, 92, 0, 0, 0}

// Method 4: zero-initialize all
int scores[5] = {};                    // {0, 0, 0, 0, 0}
\`\`\`

---

## Accessing and Modifying Elements

\`\`\`cpp
int arr[5] = {10, 20, 30, 40, 50};

cout << arr[0];   // 10  ← first element
cout << arr[4];   // 50  ← last element (size - 1)
arr[1] = 99;      // modify: arr is now {10, 99, 30, 40, 50}
\`\`\`

---

## ⚠️ The Bounds Problem

\`\`\`cpp
int arr[5] = {10, 20, 30, 40, 50};
arr[5];   // ❌ UNDEFINED BEHAVIOR — only 0..4 are valid
arr[-1];  // ❌ UNDEFINED BEHAVIOR
\`\`\`

C++ does **not** check array bounds automatically (for performance). Out-of-bounds access is one of C++'s most common and dangerous bugs — it can corrupt memory silently.`,
            },
            {
                order: 1,
                title: '1D Arrays — Code Examples',
                type: 'CODE',
                content: '## Working with 1D Arrays\n\nDeclaration, iteration, statistics, and the sizeof size trick.',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Array Basics: Iterate, Sum, Max',
                        language: 'cpp',
                        code: `#include <iostream>
using namespace std;

int main() {
    // ── Declare and initialize ──────────────────────────────────────
    int scores[5] = {85, 92, 78, 96, 88};
    int size = 5;  // Must track size manually with C arrays

    // ── Print all elements ──────────────────────────────────────────
    cout << "Scores: ";
    for (int i = 0; i < size; i++) {
        cout << scores[i] << " ";
    }
    cout << endl;

    // ── Sum and average ─────────────────────────────────────────────
    double sum = 0;
    for (int i = 0; i < size; i++) sum += scores[i];
    cout << "Average: " << sum / size << endl;

    // ── Find maximum value ──────────────────────────────────────────
    int maxScore = scores[0];           // Assume first is max
    for (int i = 1; i < size; i++) {   // Check the rest
        if (scores[i] > maxScore)
            maxScore = scores[i];
    }
    cout << "Highest: " << maxScore << endl;

    // ── Modify every element (add 5-point curve) ────────────────────
    for (int i = 0; i < size; i++) scores[i] += 5;

    cout << "After +5 curve: ";
    for (int i = 0; i < size; i++) cout << scores[i] << " ";
    cout << endl;

    return 0;
}`,
                        explanation:
                            'The accumulator pattern (`sum += scores[i]`) and max-tracking pattern (`if scores[i] > max`) are fundamental array algorithms. Always initialize max to the first element, then loop from index 1.',
                        highlightLines: [6, 11, 16, 20, 29],
                        isRunnable: true,
                    },
                    {
                        order: 1,
                        title: 'sizeof Trick and Range-Based for',
                        language: 'cpp',
                        code: `#include <iostream>
using namespace std;

int main() {
    double temps[] = {22.5, 19.0, 25.3, 18.7, 21.2, 28.1, 24.9};

    // sizeof trick: works ONLY in the same scope where the array is declared
    // sizeof(temps)    = total bytes = 7 × 8 = 56
    // sizeof(temps[0]) = bytes of one element = 8
    int size = sizeof(temps) / sizeof(temps[0]);
    cout << "Count: " << size << endl;  // 7

    // Range-based for — clean when you don't need the index
    double total = 0;
    for (double t : temps) total += t;
    cout << "Avg temp: " << total / size << "°C" << endl;

    // Finding coldest day WITH its index (need a regular for loop)
    int minIdx = 0;
    for (int i = 1; i < size; i++) {
        if (temps[i] < temps[minIdx]) minIdx = i;
    }
    cout << "Coldest: Day " << minIdx + 1
         << " at " << temps[minIdx] << "°C" << endl;

    return 0;
}`,
                        explanation:
                            '`sizeof(arr)/sizeof(arr[0])` gives the element count but **only works locally** — not after the array decays to a pointer inside a function. Range-based for is elegant for full traversals; use indexed for when you need the position.',
                        highlightLines: [10, 14, 19],
                        isRunnable: true,
                    },
                ],
            },
            {
                order: 2,
                title: '1D Arrays — Visual Memory Layout',
                type: 'VISUAL',
                content: `# How 1D Arrays Live in Memory

## Contiguous Layout Diagram

\`\`\`
int arr[5] = {10, 20, 30, 40, 50};
(assuming int = 4 bytes, base address = 0x1000)

Index:    [   0   ] [   1   ] [   2   ] [   3   ] [   4   ]
          ┌────────┬─────────┬─────────┬─────────┬─────────┐
arr:      │   10   │   20   │   30   │   40   │   50    │
          └────────┴─────────┴─────────┴─────────┴─────────┘
Address:  0x1000    0x1004    0x1008    0x100C    0x1010
                     +4        +4        +4        +4

Formula:  address of arr[i]  =  base_address + (i × sizeof(element))
          address of arr[3]  =  0x1000 + (3 × 4) = 0x100C  → value 40 ✅
\`\`\`

---

## Out-of-Bounds: Silent Danger

\`\`\`
int arr[3] = {10, 20, 30};

arr[0] → 10  ✅ valid
arr[1] → 20  ✅ valid
arr[2] → 30  ✅ valid
arr[3] → ???  ← reads 4 bytes AFTER the array (whatever happens to be there)
arr[4] → ???  ← even further into unknown memory

No crash guaranteed. No error thrown. Just silent undefined behavior.
This is why C++ is both powerful and dangerous.
\`\`\`

---

## sizeof in Local Scope vs Inside a Function

\`\`\`
In LOCAL scope (where array is declared):
  int arr[5] = {1,2,3,4,5};
  sizeof(arr)     → 20 bytes  (5 × 4 bytes per int)
  sizeof(arr[0])  → 4 bytes
  count = 20 / 4 = 5  ✅ CORRECT

Inside a function (after decay):
  void f(int arr[]) {
      sizeof(arr)     → 8 bytes  ← SIZE OF A POINTER on 64-bit system!
      sizeof(arr[0])  → 4 bytes
      count = 8 / 4 = 2  ❌ WRONG — always pass size as a parameter!
  }
\`\`\`

---

## Different Element Types — Different Strides

\`\`\`
char   c[4] = {'H','i','!',' '};  stride = 1 byte
short  s[4] = {1, 2, 3, 4};       stride = 2 bytes
int    i[4] = {1, 2, 3, 4};       stride = 4 bytes
double d[4] = {1, 2, 3, 4};       stride = 8 bytes

double d[3]:
│ 1.0 (8B) │ 2.0 (8B) │ 3.0 (8B) │
0x100       0x108       0x110
\`\`\``,
            },
            {
                order: 3,
                title: 'Quiz: 1D Arrays',
                type: 'QUIZ',
                content: '## Test Your Understanding of 1D Arrays',
                stepData: {
                    questions: [
                        {
                            question: 'For `int arr[6]`, what is the valid index range?',
                            options: [
                                { id: 'a', text: '1 to 6', isCorrect: false },
                                { id: 'b', text: '0 to 5', isCorrect: true },
                                { id: 'c', text: '0 to 6', isCorrect: false },
                                { id: 'd', text: '1 to 5', isCorrect: false },
                            ],
                            explanation: 'Arrays are zero-indexed. A 6-element array has valid indices 0, 1, 2, 3, 4, 5. Index 6 is out of bounds (undefined behavior).',
                        },
                        {
                            question: 'What does `int arr[5] = {1, 2}` initialize the remaining 3 elements to?',
                            options: [
                                { id: 'a', text: 'Garbage/undefined values', isCorrect: false },
                                { id: 'b', text: '0', isCorrect: true },
                                { id: 'c', text: '2 (copies the last given value)', isCorrect: false },
                                { id: 'd', text: 'Compiler error', isCorrect: false },
                            ],
                            explanation: 'Partial initialization zero-fills the remaining elements. arr becomes {1, 2, 0, 0, 0}.',
                        },
                        {
                            question: 'Which correctly computes the number of elements in `double data[10]` in its own scope?',
                            options: [
                                { id: 'a', text: '`data.size()`', isCorrect: false },
                                { id: 'b', text: '`sizeof(data) / sizeof(data[0])`', isCorrect: true },
                                { id: 'c', text: '`sizeof(data)`', isCorrect: false },
                                { id: 'd', text: '`length(data)`', isCorrect: false },
                            ],
                            explanation: '`sizeof(data)` gives total bytes (80), `sizeof(data[0])` gives one element (8 bytes). 80/8 = 10 elements. Note: this only works in the local scope before any decay.',
                        },
                        {
                            question: 'What is the memory layout of a C++ array?',
                            options: [
                                { id: 'a', text: 'Elements linked by pointers (like a linked list)', isCorrect: false },
                                { id: 'b', text: 'Elements stored contiguously (adjacent) in memory', isCorrect: true },
                                { id: 'c', text: 'Elements scattered randomly on the heap', isCorrect: false },
                                { id: 'd', text: 'Each element has its own heap allocation', isCorrect: false },
                            ],
                            explanation: 'Array elements are stored in contiguous memory — each element immediately follows the previous at a fixed stride (element size). This enables O(1) index access via address arithmetic.',
                        },
                        {
                            question: 'Accessing `arr[size]` (one past the end) in C++:',
                            options: [
                                { id: 'a', text: 'Returns 0', isCorrect: false },
                                { id: 'b', text: 'Throws std::out_of_range', isCorrect: false },
                                { id: 'c', text: 'Is undefined behavior — may crash, corrupt data, or silently succeed', isCorrect: true },
                                { id: 'd', text: 'The compiler prevents it at compile time', isCorrect: false },
                            ],
                            explanation: 'C++ does NOT bounds-check raw arrays (for performance). Out-of-bounds access is undefined behavior — the program may crash, produce wrong results, or appear to work by accident.',
                        },
                    ],
                },
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION B: Passing Arrays to Functions
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 4,
                title: 'Passing Arrays to Functions',
                type: 'EXPLANATION',
                tips: [
                    'Always pass the array size as a separate parameter — there\'s no other way to know it inside a function.',
                    'Arrays passed to functions are NOT copied — the function works directly on the original data.',
                    'Use `const int arr[]` to prevent accidental modification.',
                ],
                content: `# Passing Arrays to Functions

## The Key Rule: No Copy is Made

When you pass an array to a function, C++ does NOT copy the array. Instead, it passes a **pointer to the first element** (array decay in action). This means:

1. ✅ **Efficient** — large arrays don't get copied
2. ⚠️ **Modifiable** — functions CAN change the original elements
3. 📏 **Size is unknown** — must pass it as a separate parameter

---

## Syntax for Array Parameters

\`\`\`cpp
// All three are identical — the compiler treats them the same:
void print(int arr[], int size)       // ← most common, clearest intent
void print(int arr[100], int size)    // size in brackets is IGNORED
void print(int* arr, int size)        // explicit pointer form
\`\`\`

---

## Must Pass Size Separately

\`\`\`cpp
// ✅ Correct
void printArray(int arr[], int size) {
    for (int i = 0; i < size; i++)
        cout << arr[i] << " ";
}

// ❌ Broken — sizeof gives pointer size (8), not array size!
void brokenPrint(int arr[]) {
    int n = sizeof(arr) / sizeof(arr[0]);  // 8/4 = 2  ← WRONG!
    for (int i = 0; i < n; i++)
        cout << arr[i];   // only prints 2 elements regardless of actual size!
}
\`\`\`

---

## Functions Modify the Original

\`\`\`cpp
void doubleAll(int arr[], int size) {
    for (int i = 0; i < size; i++)
        arr[i] *= 2;   // Directly modifies the caller's array!
}

int main() {
    int data[] = {1, 2, 3, 4, 5};
    doubleAll(data, 5);
    // data is now {2, 4, 6, 8, 10} — original was changed!
}
\`\`\`

---

## Preventing Modification with const

\`\`\`cpp
// Promise: this function will NOT modify the array
void printArray(const int arr[], int size) {
    for (int i = 0; i < size; i++)
        cout << arr[i];
    // arr[0] = 99;  // ❌ COMPILE ERROR — const prevents this
}
\`\`\`

**Rule of thumb**: Add \`const\` if the function only needs to read the array.`,
            },
            {
                order: 5,
                title: 'Passing Arrays — Code Examples',
                type: 'CODE',
                content: '## Array Functions in Practice',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Array Utility Function Library',
                        language: 'cpp',
                        code: `#include <iostream>
using namespace std;

// READ-ONLY: prints the array (const prevents accidental modification)
void printArray(const int arr[], int size) {
    cout << "[ ";
    for (int i = 0; i < size; i++) {
        cout << arr[i];
        if (i < size - 1) cout << ", ";
    }
    cout << " ]" << endl;
}

// READ-ONLY: returns the sum
int sumArray(const int arr[], int size) {
    int total = 0;
    for (int i = 0; i < size; i++) total += arr[i];
    return total;
}

// MODIFYING: reverses the array in-place using two-pointer technique
void reverseArray(int arr[], int size) {
    int left = 0, right = size - 1;
    while (left < right) {
        int temp    = arr[left];
        arr[left]   = arr[right];
        arr[right]  = temp;
        left++;
        right--;
    }
}

// READ-ONLY: returns index of target, or -1 if not found
int linearSearch(const int arr[], int size, int target) {
    for (int i = 0; i < size; i++) {
        if (arr[i] == target) return i;
    }
    return -1;  // Sentinel value: not found
}

int main() {
    int data[] = {7, 3, 9, 1, 5, 8, 2, 4, 6};
    int n = 9;

    cout << "Original:  ";  printArray(data, n);
    cout << "Sum: " << sumArray(data, n) << endl;

    reverseArray(data, n);
    cout << "Reversed:  ";  printArray(data, n);

    int idx = linearSearch(data, n, 5);
    if (idx != -1)
        cout << "Found 5 at index " << idx << endl;
    else
        cout << "5 not found" << endl;

    return 0;
}`,
                        explanation: 'A mini library of array functions. `const` on read-only functions is a best practice — it prevents bugs and allows passing const arrays. `reverseArray` uses the classic two-pointer technique. `linearSearch` returns -1 as a sentinel "not found" value.',
                        highlightLines: [5, 15, 21, 31, 42, 44, 47, 50],
                        isRunnable: true,
                    },
                ],
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION C: 2D Arrays
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 6,
                title: '2D Arrays — Concept & Syntax',
                type: 'EXPLANATION',
                tips: [
                    'Think rows first, then columns: m[row][col]. Row is the "outer" dimension.',
                    'In memory, 2D arrays use row-major storage: all of row 0, then all of row 1, etc.',
                    'When passing a 2D array to a function, you MUST specify the number of columns in the parameter type.',
                ],
                content: `# 2D Arrays

## What is a 2D Array?

A **2D array** is an array whose elements are themselves arrays — a rectangular grid of rows and columns. Perfect for matrices, tables, game boards, images, etc.

\`\`\`
int grid[3][4];  // 3 rows, 4 columns = 12 elements total

Visualized as a grid:
         Col[0]  Col[1]  Col[2]  Col[3]
Row[0]: [  1  ] [  2  ] [  3  ] [  4  ]
Row[1]: [  5  ] [  6  ] [  7  ] [  8  ]
Row[2]: [  9  ] [ 10  ] [ 11  ] [ 12  ]

Access: grid[row][col]
grid[0][0] = 1    grid[0][3] = 4
grid[1][2] = 7    grid[2][1] = 10
\`\`\`

---

## Declaration and Initialization

\`\`\`cpp
// Uninitialized
int matrix[3][3];

// Nested initializer list (recommended — readable)
int matrix[3][3] = {
    {1, 2, 3},    // row 0
    {4, 5, 6},    // row 1
    {7, 8, 9}     // row 2
};

// Flattened (compiler fills row by row)
int matrix[3][3] = {1,2,3,4,5,6,7,8,9};  // same result
\`\`\`

---

## Iteration: Nested for Loops

\`\`\`cpp
int rows = 3, cols = 4;

// Outer loop = rows, Inner loop = columns
for (int r = 0; r < rows; r++) {
    for (int c = 0; c < cols; c++) {
        cout << grid[r][c] << "\\t";  // \\t for alignment
    }
    cout << endl;  // newline after each row
}
\`\`\`

---

## Row-Major Memory Storage

A 2D array is stored as one continuous block in row-major order:

\`\`\`cpp
int m[2][3] = {{1,2,3},{4,5,6}};

In memory (one continuous block, row 0 then row 1):
│ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │
 m[0][0] m[0][1] m[0][2] m[1][0] m[1][1] m[1][2]

Address formula: m[r][c]  =  base + (r * cols + c) * sizeof(int)
m[1][2]: base + (1*3 + 2) * 4 = base + 20  → value 6
\`\`\`

---

## Passing 2D Arrays to Functions

The **column count MUST be specified** in the parameter — the compiler needs it to compute row strides:

\`\`\`cpp
// ✅ Correct — columns specified
void printMatrix(int m[][4], int rows) { ... }

// ❌ Error — both dimensions omitted
void printMatrix(int m[][], int rows) { ... }  // COMPILE ERROR

// Why? To find m[r][c], compiler computes: base + (r * COLS + c) * sizeof(int)
//      Without knowing COLS, this is impossible.
\`\`\``,
            },
            {
                order: 7,
                title: '2D Arrays — Code Examples',
                type: 'CODE',
                content: '## 2D Arrays in Practice: Matrices and Game Boards',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Matrix Operations',
                        language: 'cpp',
                        code: `#include <iostream>
#include <iomanip>
using namespace std;

const int N = 3;  // Square matrix size

void printMatrix(const int m[][N], int rows) {
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < N; c++)
            cout << setw(4) << m[r][c];
        cout << endl;
    }
}

// Add two matrices element-wise, store in result
void addMatrices(const int a[][N], const int b[][N],
                 int result[][N], int rows) {
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < N; c++)
            result[r][c] = a[r][c] + b[r][c];
}

// Sum of the main diagonal (top-left to bottom-right)
int diagonalSum(const int m[][N], int n) {
    int sum = 0;
    for (int i = 0; i < n; i++) sum += m[i][i];
    return sum;
}

// Transpose: swap m[i][j] with m[j][i] (only upper triangle)
void transpose(int m[][N], int n) {
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++) {
            int temp = m[i][j];
            m[i][j]  = m[j][i];
            m[j][i]  = temp;
        }
}

int main() {
    int A[N][N] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
    int B[N][N] = {{9, 8, 7}, {6, 5, 4}, {3, 2, 1}};
    int C[N][N] = {};

    cout << "Matrix A:" << endl;      printMatrix(A, N);
    cout << "\\nMatrix B:" << endl;   printMatrix(B, N);

    addMatrices(A, B, C, N);
    cout << "\\nA + B:" << endl;      printMatrix(C, N);

    cout << "\\nDiagonal sum of A: " << diagonalSum(A, N) << endl; // 1+5+9=15

    transpose(A, N);
    cout << "\\nA transposed:" << endl; printMatrix(A, N);

    return 0;
}`,
                        explanation: 'Matrix operations using 2D arrays. The `transpose` function only iterates the upper triangle (`j = i+1`) to avoid swapping each pair twice. `diagonalSum` accesses `m[i][i]` — the diagonal elements where row == column.',
                        highlightLines: [7, 16, 23, 30, 40, 43, 46, 49, 52],
                        isRunnable: true,
                    },
                    {
                        order: 1,
                        title: 'Tic-Tac-Toe Board with 2D Array',
                        language: 'cpp',
                        code: `#include <iostream>
using namespace std;

const int SIZE = 3;

void printBoard(const char board[][SIZE]) {
    cout << "  0   1   2  (col)" << endl;
    cout << "┌───┬───┬───┐" << endl;
    for (int r = 0; r < SIZE; r++) {
        cout << "│";
        for (int c = 0; c < SIZE; c++)
            cout << " " << board[r][c] << " │";
        cout << " " << r << " (row)" << endl;
        if (r < SIZE - 1)
            cout << "├───┼───┼───┤" << endl;
    }
    cout << "└───┴───┴───┘" << endl;
}

bool checkWin(const char board[][SIZE], char player) {
    for (int i = 0; i < SIZE; i++) {
        // Check row i
        if (board[i][0] == player && board[i][1] == player && board[i][2] == player)
            return true;
        // Check column i
        if (board[0][i] == player && board[1][i] == player && board[2][i] == player)
            return true;
    }
    // Main diagonal
    if (board[0][0]==player && board[1][1]==player && board[2][2]==player) return true;
    // Anti-diagonal
    if (board[0][2]==player && board[1][1]==player && board[2][0]==player) return true;
    return false;
}

int main() {
    char board[SIZE][SIZE] = {
        {'X', 'O', ' '},
        {'O', 'X', 'O'},
        {' ', 'O', 'X'}
    };

    printBoard(board);

    if      (checkWin(board, 'X')) cout << "\\nX wins! 🎉" << endl;
    else if (checkWin(board, 'O')) cout << "\\nO wins! 🎉" << endl;
    else                           cout << "\\nGame ongoing..." << endl;

    return 0;
}`,
                        explanation: 'A 2D char array represents a tic-tac-toe board. `checkWin` loops to check all rows and columns, then separately checks both diagonals. This demonstrates how 2D arrays model grid problems naturally.',
                        highlightLines: [6, 20, 36, 40, 42],
                        isRunnable: true,
                    },
                ],
            },
            {
                order: 8,
                title: '2D Arrays — Visual: Row-Major Memory',
                type: 'VISUAL',
                content: `# 2D Arrays: Memory Layout & Row-Major Order

## Conceptual Grid vs Actual Memory

\`\`\`
int m[3][4] = { {1,  2,  3,  4},
                {5,  6,  7,  8},
                {9, 10, 11, 12} };

How YOU think about it:       How it actually sits in RAM:
     c0  c1  c2  c3
r0 [ 1 ][ 2 ][ 3 ][ 4 ]      ┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐
r1 [ 5 ][ 6 ][ 7 ][ 8 ]      │1 │2 │3 │4 │5 │6 │7 │8 │9 │10│11│12│
r2 [ 9 ][10 ][11 ][12 ]      └──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘
                               ←── row 0 ──→←── row 1 ──→←── row 2 ──→

All of row 0 comes first (ROW-MAJOR ORDER).
Then row 1. Then row 2.
\`\`\`

---

## Address Calculation

\`\`\`
m[r][c]  lives at:  base + (r × COLS + c) × sizeof(int)

m[0][0] = base + (0×4 + 0)×4 = base + 0   → 1
m[0][3] = base + (0×4 + 3)×4 = base + 12  → 4
m[1][0] = base + (1×4 + 0)×4 = base + 16  → 5
m[2][3] = base + (2×4 + 3)×4 = base + 44  → 12
\`\`\`

---

## Cache Performance: Why Row-Major Iteration Matters

\`\`\`
CPU caches read memory in CACHE LINES (typically 64 bytes at once).
A cache line starting at m[0][0] also loads m[0][1], m[0][2], m[0][3] etc.

✅ Row-outer (cache-friendly):
for r = 0..2:
    for c = 0..3:           Access order: 1,2,3,4,5,6,7,8,9,10,11,12
        use m[r][c]         Sequential → always in cache ✅

❌ Column-outer (cache-unfriendly):
for c = 0..3:
    for r = 0..2:           Access order: 1,5,9,2,6,10,3,7,11,4,8,12
        use m[r][c]         Jumps by row stride → cache misses ❌

For a large matrix this can be 5-10× slower!
\`\`\`

---

## Why Column Count is Required in Function Parameters

\`\`\`
void f(int m[][COLS], int rows)

To find m[r][c]:
  address = base + (r × COLS + c) × sizeof(int)
                         ↑
                     COMPILER NEEDS THIS!
                     Without COLS, address is unknowable → compile error.

The row count (rows) can be passed as a regular parameter.
The column count must be a compile-time constant in the type.
\`\`\``,
            },
            {
                order: 9,
                title: 'Quiz: 2D Arrays',
                type: 'QUIZ',
                content: '## Test Your Understanding of 2D Arrays',
                stepData: {
                    questions: [
                        {
                            question: 'For `int m[3][5]`, which expression accesses the 2nd row, 4th column?',
                            options: [
                                { id: 'a', text: '`m[2][4]`', isCorrect: false },
                                { id: 'b', text: '`m[1][3]`', isCorrect: true },
                                { id: 'c', text: '`m[2][3]`', isCorrect: false },
                                { id: 'd', text: '`m[1][4]`', isCorrect: false },
                            ],
                            explanation: 'Zero-indexed: 2nd row = index 1, 4th column = index 3. Answer: m[1][3].',
                        },
                        {
                            question: 'In what order does C++ store a 2D array in memory?',
                            options: [
                                { id: 'a', text: 'Column-major (entire column 0 first)', isCorrect: false },
                                { id: 'b', text: 'Row-major (entire row 0 first, then row 1, etc.)', isCorrect: true },
                                { id: 'c', text: 'Diagonal order', isCorrect: false },
                                { id: 'd', text: 'Random order', isCorrect: false },
                            ],
                            explanation: 'C++ uses row-major order: all elements of row 0 are stored consecutively, then all of row 1, etc. This makes row-based access cache-friendly.',
                        },
                        {
                            question: 'Which is the CORRECT parameter declaration for accepting `int board[3][5]`?',
                            options: [
                                { id: 'a', text: '`void f(int m[][], int rows)`', isCorrect: false },
                                { id: 'b', text: '`void f(int m[][5], int rows)`', isCorrect: true },
                                { id: 'c', text: '`void f(int m[3][], int rows)`', isCorrect: false },
                                { id: 'd', text: '`void f(int* m, int rows)`', isCorrect: false },
                            ],
                            explanation: 'You must specify the column count (5). The row dimension can be omitted. The compiler needs the column count to compute row strides.',
                        },
                        {
                            question: 'How many total elements does `int table[5][3]` hold?',
                            options: [
                                { id: 'a', text: '8', isCorrect: false },
                                { id: 'b', text: '25', isCorrect: false },
                                { id: 'c', text: '15', isCorrect: true },
                                { id: 'd', text: '53', isCorrect: false },
                            ],
                            explanation: '5 rows × 3 columns = 15 total elements.',
                        },
                    ],
                },
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION D: Array Decay
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 10,
                title: 'Array Decay — The Hidden Conversion',
                type: 'EXPLANATION',
                tips: [
                    'Array decay is not a bug — it\'s a deliberate C/C++ feature for efficiency. But understanding it prevents many bugs.',
                    'After decay, only the address is known — the element count is permanently lost.',
                    'Modern C++: prefer std::vector<T> (dynamic) or std::array<T,N> (fixed) over raw arrays to avoid decay.',
                ],
                content: `# Array Decay

## What is Array Decay?

In most contexts, a C++ array **silently and automatically converts** to a **pointer to its first element**. This implicit conversion is called **array decay**.

\`\`\`cpp
int arr[5] = {10, 20, 30, 40, 50};

// Array decays when assigned to a pointer:
int* ptr = arr;           // same as: int* ptr = &arr[0];

cout << *ptr;             // 10 — dereferencing gives first element
cout << ptr[2];           // 30 — indexing through pointer works!
\`\`\`

---

## When Does Decay Happen?

\`\`\`cpp
int arr[5] = {1, 2, 3, 4, 5};

// 1. Assigning to a pointer
int* p = arr;              // decay: p = address of arr[0]

// 2. Passing to a function
void f(int arr[]);
f(arr);                    // decay: function receives pointer

// 3. Pointer arithmetic
int* p2 = arr + 2;         // decay: points to arr[2]

// 4. Most expressions
arr + 0;                   // decay
\`\`\`

---

## What is LOST During Decay

Before decay (in original scope):
\`\`\`cpp
int arr[5] = {1,2,3,4,5};
sizeof(arr)      // → 20 bytes  ✅  (5 × 4 bytes, knows full size)
\`\`\`

After decay (inside a function):
\`\`\`cpp
void f(int* p) {
    sizeof(p)    // → 8 bytes  ❌  (pointer size on 64-bit — NOT 20!)
}
// The number of elements is PERMANENTLY LOST after decay.
// You MUST pass size separately.
\`\`\`

---

## arr[i] == *(arr + i): Indexing is Pointer Arithmetic

These are 100% identical:
\`\`\`cpp
int arr[5] = {10, 20, 30, 40, 50};
int* p = arr;

arr[2]     // 30 — most readable
*(arr + 2) // 30 — what the compiler actually does
p[2]       // 30 — same as arr[2]
*(p + 2)   // 30 — same as above

// Even this works (though confusing!):
2[arr]     // 30 — *(arr + 2) == *(2 + arr) == 2[arr]  Yes, this compiles!
\`\`\`

---

## What Does NOT Decay

\`\`\`cpp
int arr[5];

sizeof(arr)    // ✅ Uses the actual array type — gives 20, no decay
&arr           // ✅ Gives int(*)[5] — pointer to whole array (not to first elem)
               //    Incrementing &arr jumps the whole array, not one element!
\`\`\`

---

## The Modern Fix

\`\`\`cpp
#include <array>
#include <vector>

// std::array — fixed size, no decay, carries its size
array<int, 5> a = {1, 2, 3, 4, 5};
a.size();    // ✅ 5 — always available, even inside functions

// std::vector — dynamic size, no decay, carries its size
vector<int> v = {1, 2, 3, 4, 5};
v.size();    // ✅ 5 — always correct
v.at(10);    // ✅ throws std::out_of_range — bounds-checked!
\`\`\``,
            },
            {
                order: 11,
                title: 'Array Decay — Visual Diagram',
                type: 'VISUAL',
                content: `# Array Decay: Full Visual Reference

## The Decay Transformation

\`\`\`
int arr[5] = {10, 20, 30, 40, 50};

Before decay:                        After decay (e.g., int* p = arr):
┌─────────────────────────────┐       ┌─────────────────────────────────┐
│  type:  int[5]              │  ──►  │  type:  int*  (pointer)         │
│  size:  20 bytes            │       │  value: address of arr[0]       │
│  knows element count: YES   │       │  size:  8 bytes (pointer)       │
└─────────────────────────────┘       │  knows element count: ❌ NO     │
                                      └─────────────────────────────────┘
Memory:
          [0]     [1]     [2]     [3]     [4]
        ┌──────┬──────┬──────┬──────┬──────┐
arr:    │  10  │  20  │  30  │  40  │  50  │
        └──────┴──────┴──────┴──────┴──────┘
         ↑
         0x1000  ← arr decays to this address
                   p = 0x1000  (pointer to first element)
\`\`\`

---

## Pointer Arithmetic on Decayed Array

\`\`\`
int* p = arr;  // p = 0x1000

p + 0 = 0x1000  *p       = arr[0] = 10
p + 1 = 0x1004  *(p+1)   = arr[1] = 20   ← advances by sizeof(int)=4 bytes
p + 2 = 0x1008  *(p+2)   = arr[2] = 30
p + 3 = 0x100C  *(p+3)   = arr[3] = 40
p + 4 = 0x1010  *(p+4)   = arr[4] = 50
p + 5 = 0x1014  *(p+5)   = ❌ OUT OF BOUNDS!

The compiler automatically multiplies the offset by sizeof(element type).
Adding 1 to an int* moves 4 bytes forward.
Adding 1 to a double* moves 8 bytes forward.
\`\`\`

---

## sizeof Behavior Comparison

\`\`\`
Location                    │  sizeof(arr)  │  Meaning
────────────────────────────┼───────────────┼──────────────────────────────
Local scope (int arr[5])    │  20 bytes     │  ✅ Entire array  (5×4)
Passed as function param    │  8 bytes      │  ❌ Pointer size (misleading!)
────────────────────────────┴───────────────┴──────────────────────────────
ALWAYS pass size as a separate int parameter when passing arrays to functions.
\`\`\`

---

## C Array vs Modern Alternatives

\`\`\`
Feature                  │ int arr[N]     │ std::array<int,N> │ std::vector<int>
─────────────────────────┼────────────────┼───────────────────┼─────────────────
Decays to pointer?       │ ✅ YES (danger) │ ❌ No              │ ❌ No
Carries own size?        │ Only locally   │ .size() anywhere  │ .size() anywhere
Bounds checking?         │ ❌ Never        │ .at() throws      │ .at() throws
Fixed / Dynamic?         │ Fixed          │ Fixed             │ Dynamic
Stack / Heap?            │ Stack          │ Stack             │ Heap
Modern C++ preference?   │ Legacy code    │ ✅ Fixed-size      │ ✅ General use
\`\`\``,
            },
            {
                order: 12,
                title: 'Comprehensive Quiz: Arrays',
                type: 'QUIZ',
                content: '## Master Quiz — 1D Arrays, 2D Arrays, and Array Decay',
                stepData: {
                    questions: [
                        {
                            question: 'What is "array decay"?',
                            options: [
                                { id: 'a', text: 'When an array is deallocated', isCorrect: false },
                                { id: 'b', text: 'The implicit conversion of an array to a pointer to its first element', isCorrect: true },
                                { id: 'c', text: 'An uninitialized array filling with garbage values', isCorrect: false },
                                { id: 'd', text: 'Array elements becoming 0 over time', isCorrect: false },
                            ],
                            explanation: 'Array decay is the automatic conversion that happens when an array is used in most expressions — it becomes `int*` pointing to the first element. Size information is lost.',
                        },
                        {
                            question: 'Why must you pass the array size as a separate parameter to a function?',
                            options: [
                                { id: 'a', text: 'C++ convention only', isCorrect: false },
                                { id: 'b', text: 'The function receives a pointer after decay — sizeof() gives pointer size, not array size', isCorrect: true },
                                { id: 'c', text: 'Arrays become const inside functions', isCorrect: false },
                                { id: 'd', text: 'Only needed for 2D arrays', isCorrect: false },
                            ],
                            explanation: 'When passed to a function, the array decays to a pointer. sizeof(arr) inside the function returns the pointer size (8 bytes on 64-bit), not the array element count.',
                        },
                        {
                            question: '`arr[i]` is exactly equivalent to which pointer expression?',
                            options: [
                                { id: 'a', text: '`&arr + i`', isCorrect: false },
                                { id: 'b', text: '`*(arr + i)`', isCorrect: true },
                                { id: 'c', text: '`arr + i`', isCorrect: false },
                                { id: 'd', text: '`*arr[i]`', isCorrect: false },
                            ],
                            explanation: '`arr[i]` compiles to `*(arr + i)` — advance the pointer by i elements (each step = sizeof(element) bytes), then dereference. These are perfectly interchangeable.',
                        },
                        {
                            question: 'A function with parameter `int arr[]` modifies `arr[0] = 99`. What happens to the caller\'s original array?',
                            options: [
                                { id: 'a', text: 'The original is unchanged — it was passed by value', isCorrect: false },
                                { id: 'b', text: 'The original IS changed — the function received a pointer to the actual data', isCorrect: true },
                                { id: 'c', text: 'Only changes if the function returns the array', isCorrect: false },
                                { id: 'd', text: 'Compile error — parameters cannot be modified', isCorrect: false },
                            ],
                            explanation: 'Arrays always pass by reference (via pointer decay). The function receives a pointer to the caller\'s data, so modifications directly affect the original.',
                        },
                        {
                            question: 'For `int m[4][6]`, how many total bytes does it occupy? (sizeof(int)==4)',
                            options: [
                                { id: 'a', text: '24 bytes', isCorrect: false },
                                { id: 'b', text: '40 bytes', isCorrect: false },
                                { id: 'c', text: '96 bytes', isCorrect: true },
                                { id: 'd', text: '10 bytes', isCorrect: false },
                            ],
                            explanation: '4 rows × 6 cols = 24 elements × 4 bytes each = 96 bytes.',
                        },
                        {
                            question: 'Which C++ type avoids array decay and always knows its size?',
                            options: [
                                { id: 'a', text: '`int arr[] = {}`', isCorrect: false },
                                { id: 'b', text: '`const int arr[]`', isCorrect: false },
                                { id: 'c', text: '`std::vector<int>` or `std::array<int, N>`', isCorrect: true },
                                { id: 'd', text: '`static int arr[]`', isCorrect: false },
                            ],
                            explanation: '`std::vector` and `std::array` carry their size (`.size()`), offer bounds-checked `.at()`, and don\'t decay. They are the modern C++ alternatives to raw arrays.',
                        },
                    ],
                },
            },
            {
                order: 13,
                title: 'Challenge: Array Algorithms',
                type: 'CHALLENGE',
                content: `## 🏆 Challenge: Array Algorithms

**Part 1 — Bubble Sort**  
Sort an integer array in ascending order using bubble sort:
- Outer loop: N-1 passes
- Inner loop: compare adjacent elements; swap if left > right
- After each pass, the largest unsorted element "bubbles" to its correct position

**Part 2 — Matrix Transpose (in-place)**  
Transpose a square N×N matrix in-place: swap \`m[i][j]\` with \`m[j][i]\`  
- Only iterate the upper triangle (where \`j > i\`) to avoid double-swapping

**Part 3 — Row Sums**  
Write a function that takes a 2D array and fills a 1D array with the sum of each row.`,
                stepData: {
                    starterCode: `#include <iostream>
#include <iomanip>
using namespace std;

const int SIZE = 4;

// PART 1: Sort arr[] of given size in ascending order (bubble sort)
void bubbleSort(int arr[], int size) {
    // TODO: outer loop N-1 passes, inner loop compares arr[j] & arr[j+1]
}

// PART 2: Transpose SIZE×SIZE matrix in-place
void transposeMatrix(int m[][SIZE]) {
    // TODO: swap m[i][j] with m[j][i] for all i < j
}

// PART 3: Compute sum of each row, store in rowSums[]
void rowSums(const int m[][SIZE], int rowSums[], int rows) {
    // TODO: for each row, sum its columns, store in rowSums[r]
}

// ── HELPERS (provided) ────────────────────────────────────────────────
void print1D(const int a[], int n) {
    cout << "[ ";
    for (int i = 0; i < n; i++) cout << a[i] << (i<n-1?", ":" ");
    cout << "]" << endl;
}
void print2D(const int m[][SIZE], int rows) {
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < SIZE; c++) cout << setw(4) << m[r][c];
        cout << endl;
    }
}

int main() {
    // Test bubble sort
    int arr[] = {64, 34, 25, 12, 22, 11, 90, 45};
    cout << "Before sort: "; print1D(arr, 8);
    bubbleSort(arr, 8);
    cout << "After sort:  "; print1D(arr, 8);

    // Test transpose
    int mat[SIZE][SIZE] = {{1,2,3,4},{5,6,7,8},{9,10,11,12},{13,14,15,16}};
    cout << "\\nOriginal:" << endl;   print2D(mat, SIZE);
    transposeMatrix(mat);
    cout << "Transposed:" << endl;  print2D(mat, SIZE);

    // Test row sums
    int mat2[SIZE][SIZE] = {{1,2,3,4},{5,6,7,8},{9,10,11,12},{13,14,15,16}};
    int sums[SIZE] = {};
    rowSums(mat2, sums, SIZE);
    cout << "\\nRow sums: "; print1D(sums, SIZE);  // [10, 26, 42, 58]

    return 0;
}`,
                    solution: `#include <iostream>
#include <iomanip>
using namespace std;

const int SIZE = 4;

void bubbleSort(int arr[], int size) {
    // N-1 passes: after pass k, the last k elements are sorted
    for (int pass = 0; pass < size - 1; pass++) {
        // Unsorted region shrinks by 1 each pass (size-1-pass)
        for (int j = 0; j < size - 1 - pass; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp    = arr[j];
                arr[j]      = arr[j + 1];
                arr[j + 1]  = temp;
            }
        }
    }
}

void transposeMatrix(int m[][SIZE]) {
    // Only upper triangle: j starts at i+1 to avoid swapping back
    for (int i = 0; i < SIZE; i++) {
        for (int j = i + 1; j < SIZE; j++) {
            int temp = m[i][j];
            m[i][j]  = m[j][i];
            m[j][i]  = temp;
        }
    }
}

void rowSums(const int m[][SIZE], int rowSums[], int rows) {
    for (int r = 0; r < rows; r++) {
        int sum = 0;
        for (int c = 0; c < SIZE; c++) sum += m[r][c];
        rowSums[r] = sum;
    }
}

void print1D(const int a[], int n) {
    cout << "[ ";
    for (int i = 0; i < n; i++) cout << a[i] << (i<n-1?", ":" ");
    cout << "]" << endl;
}
void print2D(const int m[][SIZE], int rows) {
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < SIZE; c++) cout << setw(4) << m[r][c];
        cout << endl;
    }
}

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90, 45};
    cout << "Before sort: "; print1D(arr, 8);
    bubbleSort(arr, 8);
    cout << "After sort:  "; print1D(arr, 8);

    int mat[SIZE][SIZE] = {{1,2,3,4},{5,6,7,8},{9,10,11,12},{13,14,15,16}};
    cout << "\\nOriginal:" << endl;  print2D(mat, SIZE);
    transposeMatrix(mat);
    cout << "Transposed:" << endl; print2D(mat, SIZE);

    int mat2[SIZE][SIZE] = {{1,2,3,4},{5,6,7,8},{9,10,11,12},{13,14,15,16}};
    int sums[SIZE] = {};
    rowSums(mat2, sums, SIZE);
    cout << "\\nRow sums: "; print1D(sums, SIZE);

    return 0;
}`,
                    hints: [
                        'Bubble Sort outer: `for (pass = 0; pass < size-1; pass++)`. Inner: `for (j = 0; j < size-1-pass; j++)`. The `-pass` means we don\'t re-check already-sorted elements at the end.',
                        'Swap: use a temp variable. `int temp = arr[j]; arr[j] = arr[j+1]; arr[j+1] = temp;`',
                        'Transpose: the inner loop starts at `j = i + 1` (not 0). This ensures each (i,j)/(j,i) pair is swapped exactly once.',
                        'Row sums: initialize `int sum = 0` inside the outer loop. After the inner column loop, store `rowSums[r] = sum`.',
                        'After transposing, m[0] (first row) should equal the original first column. Verify: original col 0 was {1,5,9,13} → should become row 0 after transpose.',
                    ],
                    language: 'cpp',
                },
            },
            {
                order: 14,
                title: 'Summary: Arrays',
                type: 'SUMMARY',
                content: `# Summary: C++ Arrays

## 1D Arrays
- Contiguous same-type elements, zero-indexed: \`arr[0]\` to \`arr[size-1]\`
- Declare: \`type name[size];\` — size must be a compile-time constant
- Partial init zero-fills the rest: \`int arr[5] = {1,2}\` → \`{1,2,0,0,0}\`
- **No built-in bounds checking** — accessing out-of-bounds is undefined behavior

## Passing Arrays to Functions
- Arrays are **never copied** — they decay to a pointer to element 0
- Functions **can modify** the original array; use \`const\` to prevent this
- **Always pass size** as a separate parameter — sizeof() lies inside functions

## 2D Arrays
- Grid of rows × cols: \`type name[ROWS][COLS];\`
- Access: \`m[row][col]\` — row first, column second
- Stored in **row-major order** in memory
- Function parameters must specify columns: \`void f(int m[][COLS], int rows)\`
- Iterate row-outer, col-inner for cache efficiency

## Array Decay
- An array name in most expressions **decays to** \`T*\` (pointer to first element)
- Size information is **permanently lost** after decay
- \`arr[i]\` == \`*(arr + i)\` — indexing is pointer arithmetic
- Modern alternatives: **\`std::vector<T>\`** (dynamic) and **\`std::array<T,N>\`** (fixed) — both carry their size and don't decay

> 🎯 **Next up**: Strings — C-style char arrays vs the powerful std::string!`,
            },
        ],
    });

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOPIC 2: cpp-strings
    // ═══════════════════════════════════════════════════════════════════════════════

    await createLearn({
        slug: 'cpp-strings',
        title: 'Strings (C-style vs std::string, String Methods)',
        description:
            'Master C++ strings from the ground up: understand C-style char arrays and their null-terminator, then master the modern std::string class — construction, concatenation, comparison, searching, slicing, and all essential string methods.',
        difficulty: 'BEGINNER',
        unitNumber: 3,
        unitTitle: 'Unit 3: Arrays, Strings, and Memory',
        estimatedTime: 50,
        tags: ['strings', 'c-string', 'std::string', 'string-methods', 'char', 'null-terminator', 'substr', 'find'],
        iconEmoji: '🔤',
        steps: [

            // ─────────────────────────────────────────────────────────────────────
            // SECTION A: C-Style Strings
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 0,
                title: 'C-Style Strings — char Arrays and the Null Terminator',
                type: 'EXPLANATION',
                tips: [
                    'A C-style string requires one extra byte for the null terminator: to store "Hello" (5 chars) you need char[6].',
                    'The null terminator `\\0` is what makes string functions know where the string ends.',
                    'C-style strings are used in legacy code, OS APIs, and performance-critical systems — you need to understand them even if you prefer std::string.',
                ],
                content: `# C-Style Strings

## What is a C-Style String?

Before \`std::string\` existed, strings in C (and early C++) were simply **char arrays with a special ending marker**: the **null terminator** (\`'\\0'\` — the character with ASCII value 0).

\`\`\`cpp
char name[6] = {'H', 'e', 'l', 'l', 'o', '\\0'};
//                                           ↑
//                              This ZERO marks the end of the string
\`\`\`

Memory layout:
\`\`\`
Index:  [0]  [1]  [2]  [3]  [4]  [5]
        ┌────┬────┬────┬────┬────┬────┐
name:   │'H' │'e' │'l' │'l' │'o' │'\\0'│
        └────┴────┴────┴────┴────┴────┘
         72   101  108  108  111   0    ← ASCII values
                                   ↑
                         Null terminator: tells string
                         functions "the string ends here"
\`\`\`

---

## String Literals Automatically Add '\\0'

\`\`\`cpp
char name[] = "Hello";  // Compiler adds '\\0' at the end automatically
// Equivalent to: char name[] = {'H','e','l','l','o','\\0'};
// Size is 6 (5 chars + 1 null terminator)
\`\`\`

---

## C-String Functions (from \`<cstring>\`)

\`\`\`cpp
#include <cstring>

char s1[] = "Hello";
char s2[] = "World";
char dest[20];

strlen(s1);            // 5 — length WITHOUT the null terminator
strcpy(dest, s1);      // copies s1 into dest (including '\\0')
strcat(dest, s2);      // appends s2 to dest: dest = "HelloWorld"
strcmp(s1, s2);        // compare: <0 if s1<s2, 0 if equal, >0 if s1>s2
\`\`\`

---

## ⚠️ C-String Dangers

\`\`\`cpp
char buf[5] = "Hi";

// Buffer overflow — writing past the end!
strcpy(buf, "This string is too long!");
// ❌ Writes beyond buf[4], corrupting adjacent memory!

// Forgetting null terminator:
char s[3] = {'H', 'i'};  // Missing '\\0'!
cout << s;  // ❌ Reads beyond s until it finds a zero byte — undefined behavior!
\`\`\`

These dangers are why **\`std::string\` was invented**. C-style strings require manual size management and are the source of countless buffer overflow vulnerabilities.

---

## When You Still See C-Style Strings

\`\`\`cpp
// String literals in code ARE C-style strings:
const char* greeting = "Hello, World!";  // pointer to a literal (read-only!)

// OS functions use them:
fopen("data.txt", "r");   // const char* filename

// argv in main:
int main(int argc, char* argv[]) { ... }  // argv[0], argv[1] are C-strings
\`\`\``,
            },
            {
                order: 1,
                title: 'C-Style Strings — Code Examples',
                type: 'CODE',
                content: '## Working with C-Style Strings',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'C-String Functions in Action',
                        language: 'cpp',
                        code: `#include <iostream>
#include <cstring>   // strlen, strcpy, strcat, strcmp, strchr
using namespace std;

int main() {
    // ── Declare and initialize ──────────────────────────────────────
    char firstName[20] = "Alice";
    char lastName[20]  = "Johnson";
    char fullName[50]  = "";      // empty string

    // ── Length ─────────────────────────────────────────────────────
    cout << "Length of firstName: " << strlen(firstName) << endl;  // 5

    // ── Copy ───────────────────────────────────────────────────────
    char copy[20];
    strcpy(copy, firstName);     // copy firstName into 'copy'
    cout << "Copy: " << copy << endl;

    // ── Concatenate ────────────────────────────────────────────────
    strcpy(fullName, firstName);
    strcat(fullName, " ");       // add space
    strcat(fullName, lastName);  // append last name
    cout << "Full name: " << fullName << endl;  // Alice Johnson

    // ── Compare ────────────────────────────────────────────────────
    char a[] = "apple";
    char b[] = "banana";
    int result = strcmp(a, b);
    if      (result < 0) cout << a << " comes before " << b << endl;
    else if (result > 0) cout << a << " comes after " << b << endl;
    else                 cout << "Strings are equal" << endl;

    // ── Search for character ────────────────────────────────────────
    char email[] = "user@example.com";
    char* atSign = strchr(email, '@');
    if (atSign != nullptr)
        cout << "Domain: " << (atSign + 1) << endl;  // example.com

    return 0;
}`,
                        explanation: '`strlen` counts characters up to (but not including) the null terminator. `strcpy` and `strcat` require the destination to be large enough — always! `strcmp` returns 0 for equal strings (remember: ==0 means equal, not ==true). `strchr` returns a pointer to the first occurrence of a character.',
                        highlightLines: [11, 15, 20, 22, 28, 36, 38],
                        isRunnable: true,
                    },
                ],
            },
            {
                order: 2,
                title: 'C-Style Strings — Visual: The Null Terminator',
                type: 'VISUAL',
                content: `# C-Style Strings: Memory Layout

## How a C-String Sits in Memory

\`\`\`
char str[10] = "Hello";

Index:  [ 0 ] [ 1 ] [ 2 ] [ 3 ] [ 4 ] [ 5 ] [ 6 ] [ 7 ] [ 8 ] [ 9 ]
        ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
str:    │ 'H' │ 'e' │ 'l' │ 'l' │ 'o' │'\\0' │  ?  │  ?  │  ?  │  ?  │
        └─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
               72    101   108   108   111    0   garbage  garbage ...

strlen("Hello") = 5    ← counts characters up to '\\0', not including it
sizeof(str)     = 10   ← total bytes allocated (includes unused space)

How cout knows when to stop printing:
  starts at str[0] → 'H'
  continues → 'e', 'l', 'l', 'o'
  hits str[5] = '\\0' → STOP printing
\`\`\`

---

## The Buffer Overflow Danger

\`\`\`
char buf[5];                           Memory layout:
strcpy(buf, "Hello!");                 [ H ] [ e ] [ l ] [ l ] [ o ] [ ! ] [ \\0 ]
                                        buf[0]..buf[4]  ← only 5 bytes safe!
                                                         buf[5] = '!'  ← OVERFLOW
                                                         buf[6] = '\\0' ← OVERFLOW
                                         ↑ writing beyond array, corrupting memory!

Safe alternative: strncpy(buf, "Hello!", 4);  // limit to 4 chars + null
\`\`\`

---

## strcmp Return Value Logic

\`\`\`
strcmp(a, b) compares character by character:

strcmp("apple", "banana") → negative  (because 'a' < 'b')
strcmp("dog", "dog")      → 0         (exactly equal)
strcmp("zebra", "ant")    → positive  (because 'z' > 'a')

Common mistake:
  if (strcmp(a, b))   ← TRUE when NOT EQUAL (because 0 is falsy!)
  if (!strcmp(a, b))  ← TRUE when EQUAL (because !0 = true)
  if (strcmp(a, b) == 0)  ← clearest: TRUE when equal ✅
\`\`\``,
            },
            {
                order: 3,
                title: 'Quiz: C-Style Strings',
                type: 'QUIZ',
                content: '## Test Your Understanding of C-Style Strings',
                stepData: {
                    questions: [
                        {
                            question: 'What is the minimum array size to store the string "Hello" as a C-style string?',
                            options: [
                                { id: 'a', text: '5', isCorrect: false },
                                { id: 'b', text: '6', isCorrect: true },
                                { id: 'c', text: '4', isCorrect: false },
                                { id: 'd', text: '7', isCorrect: false },
                            ],
                            explanation: '"Hello" has 5 characters plus the null terminator \'\\0\', requiring 6 bytes: char s[6].',
                        },
                        {
                            question: 'What does `strlen("C++")` return?',
                            options: [
                                { id: 'a', text: '4', isCorrect: false },
                                { id: 'b', text: '3', isCorrect: true },
                                { id: 'c', text: '2', isCorrect: false },
                                { id: 'd', text: '0', isCorrect: false },
                            ],
                            explanation: 'strlen counts characters up to (not including) the null terminator. "C++" has 3 characters, so strlen returns 3.',
                        },
                        {
                            question: 'What does `strcmp("apple", "apple")` return?',
                            options: [
                                { id: 'a', text: '1', isCorrect: false },
                                { id: 'b', text: 'true', isCorrect: false },
                                { id: 'c', text: '0', isCorrect: true },
                                { id: 'd', text: '-1', isCorrect: false },
                            ],
                            explanation: 'strcmp returns 0 when both strings are identical. Non-zero means different (negative = first < second, positive = first > second).',
                        },
                        {
                            question: 'What happens if you forget to add a null terminator to a char array used as a string?',
                            options: [
                                { id: 'a', text: 'The compiler adds it automatically', isCorrect: false },
                                { id: 'b', text: 'String functions read past the end of the array — undefined behavior', isCorrect: true },
                                { id: 'c', text: 'The string is treated as empty', isCorrect: false },
                                { id: 'd', text: 'A compilation error occurs', isCorrect: false },
                            ],
                            explanation: 'Without a null terminator, functions like strlen, strcpy, and cout << keep reading memory beyond the array until they happen to find a zero byte — this is undefined behavior and can crash or produce garbage.',
                        },
                    ],
                },
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION B: std::string
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 4,
                title: 'std::string — The Modern String',
                type: 'EXPLANATION',
                tips: [
                    'std::string manages its own memory — it grows and shrinks automatically. No buffer overflows.',
                    'std::string can be compared with == directly (unlike C-strings which need strcmp).',
                    'std::string has a `.size()` and `.length()` method — both return the same value.',
                ],
                content: `# std::string — The Modern Approach

## Why std::string?

C-style strings are error-prone and require manual memory management. \`std::string\` is a class in the C++ Standard Library that wraps a char array and manages everything for you:

| Problem with char[] | std::string Solution |
|---------------------|---------------------|
| Fixed size buffer | Grows automatically |
| Buffer overflow | No overflow possible |
| \`strcmp\` for comparison | Use \`==\`, \`<\`, \`>\` directly |
| Manual length tracking | \`.size()\` method |
| \`strcat\` for concatenation | \`+\` operator |

---

## Including and Creating std::string

\`\`\`cpp
#include <string>  // Required header
using namespace std;

string s1 = "Hello";           // From a string literal
string s2("World");            // Constructor syntax
string s3(5, 'A');             // 5 copies of 'A' → "AAAAA"
string s4 = s1;                // Copy of s1
string s5;                     // Empty string ""
\`\`\`

---

## Basic Operations

### Concatenation with +

\`\`\`cpp
string first = "Hello";
string second = "World";
string full = first + ", " + second + "!";  // "Hello, World!"
first += " there";  // first is now "Hello there"
\`\`\`

### Comparison with ==, <, >

\`\`\`cpp
string a = "apple";
string b = "banana";

a == b    // false
a < b     // true (lexicographic: 'a' < 'b')
a == "apple" // true (comparing with C-string literal works too!)
\`\`\`

### Length and Emptiness

\`\`\`cpp
string s = "Hello";
s.size();       // 5
s.length();     // 5 (same as size())
s.empty();      // false
string t;
t.empty();      // true
\`\`\`

### Accessing Characters

\`\`\`cpp
string s = "Hello";
s[0];       // 'H' — no bounds checking
s.at(0);    // 'H' — throws std::out_of_range if index invalid (safer)
s.front();  // 'H' — first character
s.back();   // 'o' — last character
\`\`\`

---

## Input with std::string

\`\`\`cpp
string word, line;

cin >> word;            // Reads one word (stops at whitespace)
getline(cin, line);     // Reads the whole line including spaces
\`\`\``,
            },
            {
                order: 5,
                title: 'std::string — Essential Methods',
                type: 'EXPLANATION',
                tips: [
                    '`find` returns `string::npos` (a large sentinel value) when not found — always check against `string::npos`, not -1.',
                    '`substr(pos, len)` does NOT modify the string — it returns a new string.',
                    '`erase`, `insert`, and `replace` modify the string in-place.',
                ],
                content: `# std::string Methods — Complete Reference

## substr — Extract a Substring

\`\`\`cpp
string s = "Hello, World!";
//          0123456789012

s.substr(7);      // "World!" — from index 7 to end
s.substr(7, 5);   // "World" — starting at index 7, length 5
s.substr(0, 5);   // "Hello" — first 5 characters
\`\`\`

---

## find — Search for Text

\`\`\`cpp
string s = "Hello, World! Hello!";
//          0123456789...

s.find("World");      // 7 — index where "World" starts
s.find("Hello", 5);   // 14 — search starting from index 5
s.find("xyz");        // string::npos — NOT FOUND

// Always check for not-found:
size_t pos = s.find("World");
if (pos != string::npos) {
    cout << "Found at: " << pos << endl;
} else {
    cout << "Not found" << endl;
}
\`\`\`

---

## replace — Replace Part of a String

\`\`\`cpp
string s = "Hello, World!";
s.replace(7, 5, "C++");   // Replace 5 chars at index 7 with "C++"
// s is now "Hello, C++!"
\`\`\`

---

## erase — Remove Characters

\`\`\`cpp
string s = "Hello, World!";
s.erase(5, 7);   // Remove 7 chars starting at index 5 (removes ", World")
// s is now "Hello!"

s.erase(0, 1);   // Remove 1 char at index 0
// s is now "ello!"
\`\`\`

---

## insert — Insert Text

\`\`\`cpp
string s = "Hello World";
s.insert(5, ",");   // Insert "," at index 5
// s is now "Hello, World"
\`\`\`

---

## Case Conversion (using \`<cctype>\` per character)

\`\`\`cpp
#include <cctype>      // toupper, tolower
#include <algorithm>   // transform

string s = "Hello World";

// Convert to uppercase
for (char& c : s) c = toupper(c);
// s = "HELLO WORLD"

// Or use transform:
transform(s.begin(), s.end(), s.begin(), ::tolower);
// s = "hello world"
\`\`\`

---

## Conversion: string ↔ number

\`\`\`cpp
// String to number
string numStr = "42";
int n = stoi(numStr);       // string to int
double d = stod("3.14");    // string to double

// Number to string
string s = to_string(100);  // "100"
string pi = to_string(3.14); // "3.140000"
\`\`\``,
            },
            {
                order: 6,
                title: 'std::string — Code Examples',
                type: 'CODE',
                content: '## std::string in Practice',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Core std::string Operations',
                        language: 'cpp',
                        code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    // ── Construction ────────────────────────────────────────────────
    string name = "Alice";
    string greeting = "Hello, " + name + "!";
    cout << greeting << endl;          // Hello, Alice!
    cout << "Length: " << greeting.size() << endl;  // 13

    // ── Access and modify ────────────────────────────────────────────
    cout << "First char: " << greeting[0] << endl;  // 'H'
    cout << "Last char:  " << greeting.back() << endl; // '!'
    greeting[0] = 'h';  // lowercase h
    cout << "Modified: " << greeting << endl;

    // ── Comparison ────────────────────────────────────────────────
    string s1 = "apple";
    string s2 = "banana";
    string s3 = "apple";
    cout << (s1 == s3 ? "s1 == s3" : "s1 != s3") << endl;  // equal
    cout << (s1 <  s2 ? "apple < banana" : "no") << endl;   // true

    // ── find and substr ────────────────────────────────────────────
    string sentence = "The quick brown fox jumps over the lazy dog";
    size_t pos = sentence.find("fox");
    if (pos != string::npos) {
        cout << "Found 'fox' at index " << pos << endl;
        cout << "Word: " << sentence.substr(pos, 3) << endl; // "fox"
    }

    // ── Modify in place ─────────────────────────────────────────────
    string url = "http://www.example.com";
    // Find and replace "http" with "https"
    size_t httpPos = url.find("http");
    if (httpPos != string::npos) {
        url.replace(httpPos, 4, "https");
    }
    cout << "Secure URL: " << url << endl;

    // ── Conversions ─────────────────────────────────────────────────
    string numStr = "1234";
    int num = stoi(numStr);
    cout << "num + 1 = " << num + 1 << endl;  // 1235

    string backToStr = to_string(num * 2);
    cout << "back to string: " << backToStr << endl;  // "2468"

    return 0;
}`,
                        explanation: 'Demonstrates all core operations: construction with +, size(), character access with [] and .back(), comparison with ==/<, find with npos check, substr, replace, and numeric conversion with stoi/to_string.',
                        highlightLines: [8, 13, 22, 26, 34, 41, 46],
                        isRunnable: true,
                    },
                    {
                        order: 1,
                        title: 'String Processing: Parsing and Transformation',
                        language: 'cpp',
                        code: `#include <iostream>
#include <string>
#include <cctype>    // toupper, tolower, isdigit, isalpha
#include <algorithm> // transform
using namespace std;

// Count occurrences of a substring in a string
int countOccurrences(const string& haystack, const string& needle) {
    int count = 0;
    size_t pos = 0;
    while ((pos = haystack.find(needle, pos)) != string::npos) {
        count++;
        pos += needle.size(); // move past this match
    }
    return count;
}

// Check if a string is a palindrome
bool isPalindrome(const string& s) {
    int left = 0, right = (int)s.size() - 1;
    while (left < right) {
        if (s[left] != s[right]) return false;
        left++;
        right--;
    }
    return true;
}

// Convert string to uppercase
string toUpper(string s) {    // pass by value: we want a copy to modify
    for (char& c : s) c = toupper(c);
    return s;
}

// Count digits in a string
int countDigits(const string& s) {
    int count = 0;
    for (char c : s) if (isdigit(c)) count++;
    return count;
}

int main() {
    string text = "the quick brown fox jumps over the lazy dog";

    cout << "Text: \"" << text << "\"" << endl;
    cout << "Length: "     << text.size() << endl;
    cout << "Upper: "      << toUpper(text) << endl;
    cout << "Count 'the':  " << countOccurrences(text, "the") << endl; // 2
    cout << "Palindrome? " << (isPalindrome(text) ? "Yes" : "No") << endl;

    string password = "Secur3P@ss1word";
    cout << "\\nPassword: " << password << endl;
    cout << "Digits: " << countDigits(password) << endl;

    // Parse: extract domain from email
    string email = "alice@example.org";
    size_t atPos = email.find('@');
    if (atPos != string::npos) {
        string user   = email.substr(0, atPos);
        string domain = email.substr(atPos + 1);
        cout << "\\nUser:   " << user   << endl;
        cout << "Domain: " << domain << endl;
    }

    return 0;
}`,
                        explanation: 'Real string processing patterns: `countOccurrences` uses a loop with find advancing past each match. `isPalindrome` uses the two-pointer technique. Parsing emails with `find` and `substr` is a common pattern for splitting strings.',
                        highlightLines: [9, 10, 11, 18, 28, 35, 52, 54],
                        isRunnable: true,
                    },
                ],
            },
            {
                order: 7,
                title: 'std::string — Visual: Internal Structure',
                type: 'VISUAL',
                content: `# std::string: How It Works Internally

## Memory Structure of std::string

\`\`\`
string s = "Hello, World!";

std::string object (lives on the stack):
┌─────────────────────────────────────────────────────┐
│ str object                                          │
│  ┌──────────────┐  ┌──────────┐  ┌───────────────┐ │
│  │ data*        │  │ size = 13│  │ capacity = 15 │ │
│  │ (pointer)    │  │          │  │               │ │
│  └──────┬───────┘  └──────────┘  └───────────────┘ │
└─────────┼───────────────────────────────────────────┘
          │
          ▼ points to heap-allocated char array
┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐
│H │e │l │l │o │, │  │W │o │r │l │d │! │\\0│
└──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘
 0  1  2  3  4  5  6  7  8  9  10 11 12 13

size     = 13 (number of actual characters, not counting \\0)
capacity = 15 (allocated space — might be more than size for efficiency)
\`\`\`

---

## Small String Optimization (SSO)

\`\`\`
Most std::string implementations use SSO:
Short strings (typically ≤ 15 chars) are stored INSIDE the string object itself,
avoiding a heap allocation entirely!

Short string ("Hi"):
┌─────────────────────────────────────────────┐
│ str object                                  │
│  ┌─────────────────────────┐  ┌──────────┐  │
│  │ 'H' 'i' '\\0' [padding]  │  │ size = 2 │  │
│  │ (inline buffer, no heap)│  │          │  │
│  └─────────────────────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
↑ No heap allocation for short strings = very fast!

Long string ("This is a long string that exceeds SSO limit"):
  → Heap allocation occurs as shown above
\`\`\`

---

## C-String vs std::string: Key Differences

\`\`\`
Feature              │ char arr[]          │ std::string
─────────────────────┼─────────────────────┼──────────────────────────
Storage              │ Stack (fixed)        │ Stack object + heap data
Size known?          │ Manual / strlen      │ .size() method
Grows automatically? │ ❌ Fixed              │ ✅ Resizes as needed
Concatenation        │ strcat (dangerous)  │ + operator (safe)
Comparison           │ strcmp (returns int) │ ==, <, > (intuitive)
Bounds checking      │ ❌ Never              │ .at() throws
Buffer overflow      │ ✅ Very possible      │ ❌ Not possible
Null terminator      │ Manual (required)   │ Internal (hidden)
\`\`\`

---

## find Return Value: string::npos

\`\`\`
string::npos is the largest possible size_t value:
  On 64-bit: npos = 18446744073709551615 (= 2^64 - 1)

It is the sentinel "not found" return value of find().

ALWAYS check: if (pos != string::npos) { ... }
NEVER check:  if (pos != -1)          { ... }  ← wrong! size_t is unsigned
\`\`\``,
            },
            {
                order: 8,
                title: 'Comprehensive Quiz: Strings',
                type: 'QUIZ',
                content: '## Master Quiz — C-Style Strings and std::string',
                stepData: {
                    questions: [
                        {
                            question: 'Why does a C-style string storing "Cat" need at least 4 bytes?',
                            options: [
                                { id: 'a', text: 'C-strings always use 4-byte alignment', isCorrect: false },
                                { id: 'b', text: 'An extra byte is needed for the null terminator \'\\0\'', isCorrect: true },
                                { id: 'c', text: 'Each character needs 2 bytes for Unicode', isCorrect: false },
                                { id: 'd', text: 'The length counter takes 1 byte', isCorrect: false },
                            ],
                            explanation: '"Cat" has 3 characters plus the null terminator \'\\0\' that marks the end — total 4 bytes.',
                        },
                        {
                            question: 'How do you correctly check if two std::strings are equal?',
                            options: [
                                { id: 'a', text: '`strcmp(s1, s2) == 0`', isCorrect: false },
                                { id: 'b', text: '`s1 == s2`', isCorrect: true },
                                { id: 'c', text: '`s1.equals(s2)`', isCorrect: false },
                                { id: 'd', text: '`s1.compare(s2) == true`', isCorrect: false },
                            ],
                            explanation: 'std::string overloads the `==` operator, making direct comparison intuitive. C-strings need strcmp() — but std::string uses == directly.',
                        },
                        {
                            question: 'Given `string s = "Hello World"`, what does `s.substr(6, 5)` return?',
                            options: [
                                { id: 'a', text: '"Hello"', isCorrect: false },
                                { id: 'b', text: '"World"', isCorrect: true },
                                { id: 'c', text: '"World!"', isCorrect: false },
                                { id: 'd', text: '" Worl"', isCorrect: false },
                            ],
                            explanation: 'substr(start, length): starts at index 6 (the \'W\') and takes 5 characters → "World".',
                        },
                        {
                            question: 'What does `string::npos` indicate when returned by `find()`?',
                            options: [
                                { id: 'a', text: 'The string is empty', isCorrect: false },
                                { id: 'b', text: 'The search pattern was not found', isCorrect: true },
                                { id: 'c', text: 'The search reached the end', isCorrect: false },
                                { id: 'd', text: 'The pattern was found at position 0', isCorrect: false },
                            ],
                            explanation: '`string::npos` is a sentinel value (maximum size_t) returned by find() when the search pattern is NOT found in the string.',
                        },
                        {
                            question: 'What is the output of: `string s = "abc"; s += "def"; cout << s.size();`',
                            options: [
                                { id: 'a', text: '3', isCorrect: false },
                                { id: 'b', text: '6', isCorrect: true },
                                { id: 'c', text: '7', isCorrect: false },
                                { id: 'd', text: 'Error — += not supported for strings', isCorrect: false },
                            ],
                            explanation: 's starts with "abc" (size 3), then += "def" appends to make "abcdef" (size 6).',
                        },
                        {
                            question: 'Which function converts a string "123" to the integer 123?',
                            options: [
                                { id: 'a', text: '`atoi("123")`', isCorrect: false },
                                { id: 'b', text: '`stoi("123")`', isCorrect: true },
                                { id: 'c', text: '`parseInt("123")`', isCorrect: false },
                                { id: 'd', text: '`(int)"123"`', isCorrect: false },
                            ],
                            explanation: 'stoi() (string to int) is the standard C++11 function. atoi works on C-strings. parseInt doesn\'t exist in C++. Casting a string literal gives its pointer value, not the number.',
                        },
                    ],
                },
            },
            {
                order: 9,
                title: 'Challenge: String Processing',
                type: 'CHALLENGE',
                content: `## 🏆 Challenge: String Workshop

**Part 1 — Word Count**  
Write \`int countWords(const string& s)\` that counts the number of words in a string. Words are separated by one or more spaces. (Hint: use \`istringstream\` or manually scan for transitions from space to non-space.)

**Part 2 — Title Case**  
Write \`string toTitleCase(string s)\` that converts a string to Title Case — the first letter of each word capitalized, rest lowercase. Example: "hello world" → "Hello World".

**Part 3 — Validate Email**  
Write \`bool isValidEmail(const string& email)\` that checks if a string looks like an email:
- Must contain exactly one '@'
- Must have at least one character before '@'
- Must have at least one '.' after '@'
- Cannot start or end with '@' or '.'`,
                stepData: {
                    starterCode: `#include <iostream>
#include <string>
#include <sstream>   // for istringstream (word counting)
#include <cctype>    // for toupper, tolower, isspace
using namespace std;

// PART 1: Count words (separated by spaces)
int countWords(const string& s) {
    // TODO: Use istringstream to extract words, count them
    // OR: manually scan for space→non-space transitions
}

// PART 2: Title Case — capitalize first letter of each word
string toTitleCase(string s) {
    // TODO: Make first char of each word uppercase, rest lowercase
    // A new word starts after a space, or at the beginning
}

// PART 3: Basic email validation
bool isValidEmail(const string& email) {
    // TODO:
    // 1. Find the '@' sign — must exist exactly once
    // 2. Something must be before '@' (atPos > 0)
    // 3. A '.' must exist after '@'
    // 4. The '.' must not be the last character
}

int main() {
    // Test countWords
    cout << countWords("Hello World")           << endl;  // 2
    cout << countWords("  spaces   everywhere ") << endl;  // 2
    cout << countWords("one")                   << endl;  // 1
    cout << countWords("")                      << endl;  // 0

    // Test toTitleCase
    cout << toTitleCase("hello world")          << endl;  // Hello World
    cout << toTitleCase("the QUICK brown FOX")  << endl;  // The Quick Brown Fox

    // Test isValidEmail
    cout << isValidEmail("user@example.com")    << endl;  // 1 (true)
    cout << isValidEmail("@example.com")        << endl;  // 0 (false)
    cout << isValidEmail("nodomain")            << endl;  // 0 (false)
    cout << isValidEmail("user@nodot")          << endl;  // 0 (false)
    cout << isValidEmail("user@example.")       << endl;  // 0 (false)

    return 0;
}`,
                    solution: `#include <iostream>
#include <string>
#include <sstream>
#include <cctype>
using namespace std;

int countWords(const string& s) {
    istringstream iss(s);
    string word;
    int count = 0;
    while (iss >> word) count++;  // iss >> word skips whitespace automatically
    return count;
}

string toTitleCase(string s) {
    bool newWord = true;  // beginning of string is a new word
    for (int i = 0; i < (int)s.size(); i++) {
        if (isspace(s[i])) {
            newWord = true;           // next non-space starts a new word
        } else if (newWord) {
            s[i] = toupper(s[i]);     // capitalize first letter of word
            newWord = false;
        } else {
            s[i] = tolower(s[i]);     // lowercase rest of word
        }
    }
    return s;
}

bool isValidEmail(const string& email) {
    // 1. Find '@'
    size_t atPos = email.find('@');
    if (atPos == string::npos) return false;    // no '@'

    // 2. Must be something before '@'
    if (atPos == 0) return false;               // '@' is first char

    // 3. Check for exactly one '@'
    if (email.find('@', atPos + 1) != string::npos) return false; // two '@'

    // 4. Find '.' after '@'
    size_t dotPos = email.find('.', atPos + 1);
    if (dotPos == string::npos) return false;   // no '.' after '@'

    // 5. '.' must not be the last character
    if (dotPos == email.size() - 1) return false;

    return true;
}

int main() {
    cout << countWords("Hello World")            << endl;  // 2
    cout << countWords("  spaces   everywhere ") << endl;  // 2
    cout << countWords("one")                    << endl;  // 1
    cout << countWords("")                       << endl;  // 0

    cout << toTitleCase("hello world")           << endl;  // Hello World
    cout << toTitleCase("the QUICK brown FOX")   << endl;  // The Quick Brown Fox

    cout << isValidEmail("user@example.com")     << endl;  // 1
    cout << isValidEmail("@example.com")         << endl;  // 0
    cout << isValidEmail("nodomain")             << endl;  // 0
    cout << isValidEmail("user@nodot")           << endl;  // 0
    cout << isValidEmail("user@example.")        << endl;  // 0

    return 0;
}`,
                    hints: [
                        'For countWords: `istringstream iss(s); string word; while (iss >> word) count++;` — the >> operator automatically skips whitespace.',
                        'For toTitleCase: track a boolean `newWord = true`. Set it to true after a space. When you hit a non-space with newWord=true, capitalize and set newWord=false.',
                        'For isValidEmail: use `email.find(\'@\')` for the at-sign position. Use `email.find(\'.\', atPos+1)` to find a dot AFTER the at-sign.',
                        'The email dot must not be the last character: check `dotPos != email.size() - 1`.',
                        'To check for exactly one \'@\': call find again starting after the first one: `email.find(\'@\', atPos + 1) == string::npos` means no second one.',
                    ],
                    language: 'cpp',
                },
            },
            {
                order: 10,
                title: 'Summary: Strings',
                type: 'SUMMARY',
                content: `# Summary: C++ Strings

## C-Style Strings (char[])
- A \`char\` array terminated by \`'\\0'\` (null terminator, ASCII 0)
- Size must include the null: "Hello" → needs \`char[6]\`
- Functions in \`<cstring>\`: \`strlen\`, \`strcpy\`, \`strcat\`, \`strcmp\`, \`strchr\`
- **Dangerous**: buffer overflows, manual size management, no built-in safety
- Still appears in: OS APIs, legacy code, \`const char*\` string literals, \`argv\`

## std::string (from \`<string>\`)
- Manages memory automatically — grows and shrinks as needed
- Construction: \`string s = "text";\` or \`string s(count, char);\`
- Concatenation: \`+\` and \`+=\` operators
- Comparison: \`==\`, \`!=\`, \`<\`, \`>\` work directly (lexicographic)
- Key methods:

| Method | Description |
|--------|-------------|
| \`.size()\` / \`.length()\` | Number of characters |
| \`.empty()\` | True if size == 0 |
| \`[i]\` / \`.at(i)\` | Character access (at throws on out-of-bounds) |
| \`.front()\` / \`.back()\` | First / last character |
| \`.substr(pos, len)\` | Extract substring |
| \`.find(str, start)\` | Search; returns \`string::npos\` if not found |
| \`.replace(pos, len, str)\` | Replace section |
| \`.erase(pos, len)\` | Remove characters |
| \`.insert(pos, str)\` | Insert at position |
| \`stoi()\` / \`stod()\` | String to number |
| \`to_string(n)\` | Number to string |

## Key Rules
- Always check \`pos != string::npos\` after calling \`find()\`
- Use \`getline(cin, s)\` to read strings with spaces
- Use \`const string&\` for function parameters that don't need to modify the string

> 🎯 **Next up**: Pointers — the most powerful (and most dangerous) feature in C++!`,
            },
        ],
    });

    console.log('✅ C++ Learn Content seeded successfully!');
    console.log(`   Created learns under: Programming > C++`);
}