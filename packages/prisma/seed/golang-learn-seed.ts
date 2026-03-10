import { prisma } from '@repo/prisma';

// ═══════════════════════════════════════════════════════════════════════════════
// Go (Golang) Learning Module — 6-Unit Curriculum Plan
// ═══════════════════════════════════════════════════════════════════════════════
// Unit 1: Go Fundamentals
//   - Introduction to Go & Environment Setup
//   - Variables, Types & Constants
//   - Operators & Control Flow (if/else, switch, loops)
//
// Unit 2: Functions, Packages & Error Handling
//   - Functions (declarations, multiple returns, variadic, closures)
//   - Packages, Modules & Imports
//   - Error Handling (error interface, custom errors, panic/recover)
//
// Unit 3: Data Structures
//   - Arrays & Slices
//   - Maps
//   - Structs & Methods
//   - Pointers
//
// Unit 4: Interfaces & Generics
//   - Interfaces (implicit implementation, empty interface, type assertions)
//   - Generics (type parameters, constraints)
//   - Composition vs Inheritance
//
// Unit 5: Concurrency
//   - Goroutines
//   - Channels (buffered, unbuffered, select)
//   - sync package (Mutex, WaitGroup, Once)
//   - Concurrency patterns (fan-in, fan-out, pipeline, worker pool)
//
// Unit 6: Advanced Go & Interview Mastery
//   - Testing (unit, table-driven, benchmarks)
//   - Context package
//   - Reflection, unsafe, and internals
//   - Interview prep & review
// ═══════════════════════════════════════════════════════════════════════════════

export async function seedGolangLearnContent() {
    console.log('📚 Seeding Golang Learn Content...');

    const admin = await prisma.user.findFirst({ where: { role: 'Admin' } });
    if (!admin) { console.log('⚠️ No admin user found, skipping Golang seed'); return; }
    const creatorId = admin.id;

    // ── Step 0: Clean up existing Golang learns ──
    console.log('  🗑️ Cleaning existing Golang data...');
    const existingGo = await prisma.learnSubCategory.findUnique({ where: { slug: 'golang' } });
    if (existingGo) {
        await prisma.learn.deleteMany({ where: { subCategoryId: existingGo.id } });
        await prisma.learnTopic.deleteMany({ where: { subCategoryId: existingGo.id } });
    }

    // ── Step 1: Categories ──
    const programming = await prisma.learnMainCategory.upsert({
        where: { slug: 'programming' },
        update: {},
        create: { slug: 'programming', name: 'Programming', description: 'Learn programming languages and fundamentals', icon: '💻', color: '#3B82F6', order: 1 },
    });

    const golang = await prisma.learnSubCategory.upsert({
        where: { slug: 'golang' },
        update: {},
        create: { slug: 'golang', name: 'Go (Golang)', description: 'Master Go programming — the language of cloud, concurrency, and simplicity', mainCategoryId: programming.id, icon: '🐹', color: '#00ADD8', order: 2 },
    });

    // ── Step 2: Create LearnTopics (one per unit) ──
    const topicDefs = [
        { slug: 'go-unit1-fundamentals', name: 'Go Fundamentals', description: 'Introduction, variables, types, constants, operators, control flow', icon: '🚀', order: 1 },
        { slug: 'go-unit2-functions', name: 'Functions, Packages & Error Handling', description: 'Functions, multiple returns, modules, error handling', icon: '⚙️', order: 2 },
        { slug: 'go-unit3-data-structures', name: 'Data Structures', description: 'Arrays, slices, maps, structs, methods, pointers', icon: '📦', order: 3 },
        { slug: 'go-unit4-interfaces', name: 'Interfaces & Generics', description: 'Interfaces, type assertions, generics, composition', icon: '🔌', order: 4 },
        { slug: 'go-unit5-concurrency', name: 'Concurrency', description: 'Goroutines, channels, sync, concurrency patterns', icon: '🧵', order: 5 },
        { slug: 'go-unit6-advanced', name: 'Advanced Go & Interview Mastery', description: 'Testing, context, reflection, interview prep', icon: '🏆', order: 6 },
    ];
    const topics: Record<string, any> = {};
    for (const t of topicDefs) {
        topics[t.slug] = await prisma.learnTopic.create({
            data: { slug: t.slug, name: t.name, description: t.description, icon: t.icon, order: t.order, subCategoryId: golang.id },
        });
    }
    console.log(`  ✅ Created ${topicDefs.length} LearnTopics`);

    // ── Helper: global sequential counter ──
    let globalOrder = 0;
    const createdLearns: any[] = [];

    async function createLearn(data: {
        slug: string; title: string; description: string; difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
        topicSlug: string; unitTitle: string; estimatedTime: number; tags: string[]; iconEmoji: string;
        steps: {
            order: number; title: string; type: string; content: string; tips?: string[]; keyTakeaways?: string[]; stepData?: object;
            codeBlocks?: { order: number; title: string; language: string; code: string; explanation: string; highlightLines?: number[]; isRunnable?: boolean }[];
            interviewCards?: { order: number; question: string; answer: string; category?: string; codeSnippet?: string; codeLanguage?: string; difficulty?: string; tags?: string[] }[];
            quizQuestions?: { order: number; question: string; type?: string; options: { id: string; text: string; isCorrect: boolean }[]; explanation?: string; codeSnippet?: string; codeLanguage?: string; difficulty?: string; points?: number; hint?: string }[];
        }[];
    }) {
        globalOrder++;
        const topic = topics[data.topicSlug];

        const learn = await prisma.learn.create({
            data: {
                slug: data.slug, title: data.title, description: data.description,
                difficulty: data.difficulty as any, tags: data.tags,
                unitNumber: globalOrder, unitTitle: data.unitTitle,
                estimatedTime: data.estimatedTime, iconEmoji: data.iconEmoji, accentColor: '#00ADD8',
                status: 'PUBLISHED', publishedAt: new Date(), creatorId,
                mainCategoryId: programming.id, subCategoryId: golang.id,
                topicId: topic?.id || null,
            },
        });

        for (const step of data.steps) {
            const createdStep = await prisma.learnStep.create({
                data: {
                    learnId: learn.id, order: step.order, title: step.title,
                    type: step.type as any, content: step.content,
                    tips: step.tips || [], keyTakeaways: step.keyTakeaways || [],
                    stepData: step.stepData ? (step.stepData as any) : undefined,
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

            if (step.interviewCards) {
                for (const card of step.interviewCards) {
                    await prisma.learnInterviewCard.create({
                        data: {
                            stepId: createdStep.id, order: card.order,
                            question: card.question, answer: card.answer,
                            category: card.category || 'Conceptual',
                            codeSnippet: card.codeSnippet || null,
                            codeLanguage: card.codeLanguage || 'go',
                            difficulty: (card.difficulty as any) || 'MEDIUM',
                            tags: card.tags || [],
                        },
                    });
                }
            }

            if (step.quizQuestions) {
                for (const q of step.quizQuestions) {
                    await prisma.learnQuizQuestion.create({
                        data: {
                            stepId: createdStep.id, order: q.order,
                            question: q.question, type: (q.type as any) || 'SINGLE_CHOICE',
                            options: q.options as any,
                            explanation: q.explanation || null,
                            codeSnippet: q.codeSnippet || null,
                            codeLanguage: q.codeLanguage || 'go',
                            difficulty: (q.difficulty as any) || 'MEDIUM',
                            points: q.points || 10,
                            hint: q.hint || null,
                        },
                    });
                }
            }
        }
        console.log(`  ✅ [${globalOrder}] ${data.title} (${data.steps.length} steps)`);
        createdLearns.push(learn);
        return learn;
    }

    // ═══════════════════════════════════════════════════════════════════
    //  TOPIC 1: Introduction to Go & Setup
    // ═══════════════════════════════════════════════════════════════════
    await createLearn({
        slug: 'go-intro-setup',
        title: 'Introduction to Go & Environment Setup',
        description: 'Learn what Go is, why it was created, how it compares to other languages, and set up your development environment from scratch.',
        difficulty: 'BEGINNER',
        topicSlug: 'go-unit1-fundamentals',
        unitTitle: 'Unit 1: Go Fundamentals',
        estimatedTime: 40,
        tags: ['go', 'golang', 'setup', 'installation', 'hello-world', 'introduction'],
        iconEmoji: '🚀',
        steps: [
            // ── Step 0: EXPLANATION ──
            {
                order: 0,
                title: 'What is Go & Why Learn It?',
                type: 'EXPLANATION',
                tips: [
                    'Go was created at Google in 2009 by Robert Griesemer, Rob Pike, and Ken Thompson.',
                    'Go compiles to a single binary — no runtime dependencies needed.',
                    'Go is the language behind Docker, Kubernetes, Terraform, and many cloud-native tools.',
                ],
                content: `# What is Go?

**Go** (also called **Golang**) is an open-source programming language created at **Google** in 2009. It was designed to be **simple**, **fast**, and **efficient** for building modern software.

---

## Why Was Go Created?

Go was born out of frustration with existing languages at Google:

| Problem | Go's Solution |
|---------|--------------|
| C++ builds were too slow | Go compiles in seconds |
| Java/C++ codebases were too complex | Go has a tiny, simple spec |
| No built-in concurrency support | Go has goroutines & channels |
| Dependency management was a mess | Go modules (built-in) |
| Too many language features | Go is intentionally minimal |

---

## Key Features of Go

1. **Statically typed** — catches bugs at compile time
2. **Compiled** — produces a single native binary
3. **Garbage collected** — no manual memory management
4. **Built-in concurrency** — goroutines are lightweight threads
5. **Fast compilation** — compiles in seconds, not minutes
6. **Cross-compilation** — build for any OS from any OS
7. **Standard library** — rich, batteries-included stdlib

---

## Go vs Other Languages

| Feature | Go | Python | Java | C++ | Rust |
|---------|-----|--------|------|-----|------|
| Speed | ⚡ Fast | 🐢 Slow | 🏃 Medium | ⚡ Fast | ⚡ Fast |
| Simplicity | ✅ Very | ✅ Very | ❌ Verbose | ❌ Complex | ❌ Steep |
| Concurrency | ✅ Native | ❌ GIL | 🟡 Threads | 🟡 Manual | ✅ Async |
| Memory Safety | ✅ GC | ✅ GC | ✅ GC | ❌ Manual | ✅ Ownership |
| Compilation | ✅ Seconds | ❌ Interpreted | 🟡 Minutes | 🟡 Minutes | 🟡 Minutes |
| Learning Curve | ✅ Easy | ✅ Easy | 🟡 Medium | ❌ Hard | ❌ Hard |

---

## Who Uses Go?

- **Google** — core infrastructure
- **Docker** — container runtime
- **Kubernetes** — container orchestration
- **Uber** — microservices
- **Twitch** — real-time systems
- **Cloudflare** — edge computing
- **Dropbox** — backend services

> 💡 If you want to work in **cloud computing**, **DevOps**, **microservices**, or **backend engineering**, Go is one of the best languages to learn.`,
            },
            // ── Step 1: CODE ──
            {
                order: 1,
                title: 'Your First Go Program — Hello World',
                type: 'CODE',
                tips: [
                    'Every Go file starts with a package declaration.',
                    'The main package is the entry point of a Go program.',
                    'fmt is Go\'s standard formatting and I/O package.',
                ],
                content: `# Your First Go Program

Let's write the classic "Hello, World!" program and understand every line.

## The Anatomy of a Go Program

Every Go program has three essential parts:
1. **Package declaration** — which package this file belongs to
2. **Import statement** — which packages we need
3. **Function definition** — the actual code

> 🎯 The \`main\` package + \`main()\` function = the entry point of your program.`,
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Hello World — The Complete Program',
                        language: 'go',
                        code: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
    fmt.Println("Welcome to Go! 🐹")
}`,
                        explanation: `**Line-by-line breakdown:**
- \`package main\` — Declares this file as part of the "main" package. Only the main package can be run directly.
- \`import "fmt"\` — Imports the "fmt" (format) package for printing output.
- \`func main()\` — The entry point function. Go starts execution here.
- \`fmt.Println(...)\` — Prints text followed by a newline character.`,
                        highlightLines: [1, 3, 5],
                        isRunnable: true,
                    },
                    {
                        order: 1,
                        title: 'Multiple Print Functions',
                        language: 'go',
                        code: `package main

import "fmt"

func main() {
    // Println — prints with a newline at the end
    fmt.Println("Line 1")
    fmt.Println("Line 2")

    // Print — prints WITHOUT a newline
    fmt.Print("Same ")
    fmt.Print("line\\n")

    // Printf — formatted print (like C)
    name := "Gopher"
    age := 15
    fmt.Printf("Hi, I'm %s and I'm %d years old!\\n", name, age)
}`,
                        explanation: `Go provides three main print functions:
- \`Println\` — adds a newline automatically
- \`Print\` — no automatic newline
- \`Printf\` — formatted output with verbs like %s (string), %d (integer), %f (float)`,
                        highlightLines: [7, 11, 16],
                        isRunnable: true,
                    },
                    {
                        order: 2,
                        title: 'Go Program Structure — Multiple Imports',
                        language: 'go',
                        code: `package main

import (
    "fmt"
    "math"
    "strings"
)

func main() {
    // Using the math package
    fmt.Println("Pi is:", math.Pi)
    fmt.Println("Square root of 144:", math.Sqrt(144))

    // Using the strings package
    greeting := "hello, go world"
    fmt.Println("Uppercase:", strings.ToUpper(greeting))
    fmt.Println("Contains 'go'?", strings.Contains(greeting, "go"))
}`,
                        explanation: `When importing multiple packages, use parenthesized import (also called "factored import"). Each package is on its own line. Go will give a compile error if you import a package but don't use it — this keeps code clean!`,
                        highlightLines: [3, 4, 5, 6],
                        isRunnable: true,
                    },
                ],
            },
            // ── Step 2: VISUAL ──
            {
                order: 2,
                title: 'Go Program Execution — Visual Flowchart',
                type: 'VISUAL',
                content: `# How a Go Program Executes

## Compilation & Execution Flow

\`\`\`mermaid
flowchart TD
    A["📝 main.go<br/>(Source Code)"] --> B["🔧 go build<br/>(Compiler)"]
    B --> C["📦 Single Binary<br/>(No Dependencies)"]
    C --> D["🚀 Execute Binary"]
    D --> E["package main<br/>identified"]
    E --> F["func main( )<br/>starts"]
    F --> G["Execute statements<br/>top to bottom"]
    G --> H["Program exits<br/>with code 0"]

    style A fill:#00ADD8,color:#fff
    style B fill:#f59e0b,color:#fff
    style C fill:#10b981,color:#fff
    style D fill:#8b5cf6,color:#fff
    style H fill:#ef4444,color:#fff
\`\`\`

---

## Go Project Structure

\`\`\`mermaid
graph TD
    A["Go Workspace"] --> B["go.mod<br/>(Module Definition)"]
    A --> C["main.go<br/>(Entry Point)"]
    A --> D["utils/<br/>(Helper packages)"]
    A --> E["go.sum<br/>(Dependency lock)"]
    
    C --> F["package main"]
    F --> G["func main()"]
    D --> H["package utils"]
    H --> I["Exported functions<br/>(Capitalized)"]

    style A fill:#00ADD8,color:#fff
    style F fill:#10b981,color:#fff
    style H fill:#f59e0b,color:#fff
\`\`\`

---

## Go vs Interpreted Languages

\`\`\`
Go (Compiled):
  Source Code → Compiler → Binary → Run
  ┌──────────────────────────────────────────┐
  │ Compile once → Run anywhere (fast!)      │
  │ No runtime needed on target machine      │
  └──────────────────────────────────────────┘

Python (Interpreted):
  Source Code → Interpreter → Run (each time)
  ┌──────────────────────────────────────────┐
  │ Need Python installed on target machine  │
  │ Interpreted each time → slower           │
  └──────────────────────────────────────────┘
\`\`\`

> ⚡ Go programs start up in **milliseconds** because they're pre-compiled native code — no interpreter, no JVM, no startup delay.`,
            },
            // ── Step 3: QUIZ ──
            {
                order: 3,
                title: 'Quiz: Go Basics',
                type: 'QUIZ',
                content: '## Test Your Understanding of Go Basics',
                stepData: {
                    questions: [
                        {
                            question: 'Who created the Go programming language?',
                            options: [
                                { id: 'a', text: 'Guido van Rossum at Python Foundation', isCorrect: false },
                                { id: 'b', text: 'Robert Griesemer, Rob Pike, and Ken Thompson at Google', isCorrect: true },
                                { id: 'c', text: 'Bjarne Stroustrup at Bell Labs', isCorrect: false },
                                { id: 'd', text: 'James Gosling at Sun Microsystems', isCorrect: false },
                            ],
                            explanation: 'Go was created at Google in 2009 by Robert Griesemer, Rob Pike, and Ken Thompson to address issues with large-scale software development.',
                        },
                        {
                            question: 'What is the entry point of a Go program?',
                            options: [
                                { id: 'a', text: 'func start()', isCorrect: false },
                                { id: 'b', text: 'func init()', isCorrect: false },
                                { id: 'c', text: 'func main() in package main', isCorrect: true },
                                { id: 'd', text: 'func run()', isCorrect: false },
                            ],
                            explanation: 'Go programs start execution at the main() function inside the main package. Both the package name and function name must be "main".',
                        },
                        {
                            question: 'What does Go compile to?',
                            options: [
                                { id: 'a', text: 'Bytecode that runs on a virtual machine', isCorrect: false },
                                { id: 'b', text: 'JavaScript for the browser', isCorrect: false },
                                { id: 'c', text: 'A single native binary with no dependencies', isCorrect: true },
                                { id: 'd', text: 'An interpreted script', isCorrect: false },
                            ],
                            explanation: 'Go compiles directly to a single native binary. No runtime, no VM, no dependencies needed on the target machine.',
                        },
                        {
                            question: 'Which print function adds a newline automatically?',
                            options: [
                                { id: 'a', text: 'fmt.Print()', isCorrect: false },
                                { id: 'b', text: 'fmt.Println()', isCorrect: true },
                                { id: 'c', text: 'fmt.Printf()', isCorrect: false },
                                { id: 'd', text: 'fmt.Write()', isCorrect: false },
                            ],
                            explanation: 'fmt.Println() adds a newline at the end automatically. fmt.Print() does not, and fmt.Printf() requires explicit \\n.',
                        },
                        {
                            question: 'What happens if you import a package in Go but don\'t use it?',
                            options: [
                                { id: 'a', text: 'Nothing — it compiles fine', isCorrect: false },
                                { id: 'b', text: 'A warning is shown but it compiles', isCorrect: false },
                                { id: 'c', text: 'Compile error — Go does not allow unused imports', isCorrect: true },
                                { id: 'd', text: 'The import is silently removed', isCorrect: false },
                            ],
                            explanation: 'Go enforces clean code at the compiler level. Unused imports and unused variables both cause compile errors.',
                        },
                        {
                            question: 'What format verb is used for strings in fmt.Printf()?',
                            options: [
                                { id: 'a', text: '%d', isCorrect: false },
                                { id: 'b', text: '%f', isCorrect: false },
                                { id: 'c', text: '%s', isCorrect: true },
                                { id: 'd', text: '%v', isCorrect: false },
                            ],
                            explanation: '%s is the verb for strings. %d is for integers, %f for floats, and %v is the default "value" format that works for any type.',
                        },
                    ],
                },
                quizQuestions: [
                    {
                        order: 0, question: 'Who created Go?',
                        options: [
                            { id: 'a', text: 'Guido van Rossum', isCorrect: false },
                            { id: 'b', text: 'Robert Griesemer, Rob Pike, Ken Thompson', isCorrect: true },
                            { id: 'c', text: 'Bjarne Stroustrup', isCorrect: false },
                            { id: 'd', text: 'James Gosling', isCorrect: false },
                        ],
                        explanation: 'Go was created at Google in 2009 by Robert Griesemer, Rob Pike, and Ken Thompson.',
                        difficulty: 'EASY', points: 5,
                    },
                    {
                        order: 1, question: 'What is the entry point of every Go program?',
                        options: [
                            { id: 'a', text: 'func start() in package app', isCorrect: false },
                            { id: 'b', text: 'func main() in package main', isCorrect: true },
                            { id: 'c', text: 'func init() in package main', isCorrect: false },
                            { id: 'd', text: 'func run() in package program', isCorrect: false },
                        ],
                        explanation: 'The main() function inside package main is the entry point.',
                        difficulty: 'EASY', points: 5,
                    },
                    {
                        order: 2, question: 'What does the following program print?',
                        codeSnippet: `package main
import "fmt"
func main() {
    fmt.Print("A")
    fmt.Print("B")
    fmt.Println("C")
    fmt.Print("D")
}`,
                        codeLanguage: 'go',
                        options: [
                            { id: 'a', text: 'A B C D (each on new line)', isCorrect: false },
                            { id: 'b', text: 'ABC\\nD', isCorrect: true },
                            { id: 'c', text: 'ABCD', isCorrect: false },
                            { id: 'd', text: 'A\\nB\\nC\\nD', isCorrect: false },
                        ],
                        explanation: 'Print does not add newline. Println adds newline after "C". So output is ABC on one line, then D on the next.',
                        type: 'CODE_OUTPUT', difficulty: 'MEDIUM', points: 10,
                    },
                    {
                        order: 3, question: 'What does Go compile to?',
                        options: [
                            { id: 'a', text: 'JVM bytecode', isCorrect: false },
                            { id: 'b', text: 'A single native binary', isCorrect: true },
                            { id: 'c', text: 'JavaScript bundle', isCorrect: false },
                            { id: 'd', text: 'Interpreted script', isCorrect: false },
                        ],
                        explanation: 'Go compiles to a single native binary — no VM, no interpreter needed.',
                        difficulty: 'EASY', points: 5,
                    },
                    {
                        order: 4, question: 'What happens with an unused import in Go?',
                        options: [
                            { id: 'a', text: 'Compile warning', isCorrect: false },
                            { id: 'b', text: 'Nothing happens', isCorrect: false },
                            { id: 'c', text: 'Compile error', isCorrect: true },
                            { id: 'd', text: 'Runtime error', isCorrect: false },
                        ],
                        explanation: 'Go enforces no unused imports — the compiler will refuse to build.',
                        difficulty: 'EASY', points: 5,
                    },
                    {
                        order: 5, question: 'Which Printf verb prints ANY value in its default format?',
                        options: [
                            { id: 'a', text: '%s', isCorrect: false },
                            { id: 'b', text: '%d', isCorrect: false },
                            { id: 'c', text: '%v', isCorrect: true },
                            { id: 'd', text: '%p', isCorrect: false },
                        ],
                        explanation: '%v is the default "value" format verb — it works for any type.',
                        difficulty: 'MEDIUM', points: 10,
                    },
                ],
            },
            // ── Step 4: CHALLENGE ──
            {
                order: 4,
                title: 'Challenge: Go Greeter',
                type: 'CHALLENGE',
                content: `## 🏆 Challenge: Build a Greeter Program

Write a Go program that:

**Part 1: Personal Greeting**
- Print a greeting with your name using \`fmt.Printf\`
- Print your age using the \`%d\` format verb
- Print your favorite language using \`%s\`

**Part 2: Math Explorer**
- Import the \`math\` package
- Print the value of Pi (use \`math.Pi\`)
- Print the square root of 256 (use \`math.Sqrt\`)
- Print 2 raised to the power 10 (use \`math.Pow\`)`,
                stepData: {
                    starterCode: `package main

import (
    "fmt"
    // TODO: Import the math package
)

func main() {
    // ─── PART 1: Personal Greeting ───────────────────────────
    // TODO: Use fmt.Printf to print your name
    // Example: "Hello, my name is <name>"

    // TODO: Use fmt.Printf with %d to print your age
    // Example: "I am <age> years old"

    // TODO: Use fmt.Printf with %s to print your favorite language
    // Example: "My favorite language is <language>"


    // ─── PART 2: Math Explorer ───────────────────────────────
    // TODO: Print the value of Pi

    // TODO: Print the square root of 256

    // TODO: Print 2^10 (2 to the power 10)
}`,
                    solution: `package main

import (
    "fmt"
    "math"
)

func main() {
    // ─── PART 1: Personal Greeting ───────────────────────────
    name := "Gopher"
    age := 15
    language := "Go"

    fmt.Printf("Hello, my name is %s\\n", name)
    fmt.Printf("I am %d years old\\n", age)
    fmt.Printf("My favorite language is %s\\n", language)

    // ─── PART 2: Math Explorer ───────────────────────────────
    fmt.Printf("\\nValue of Pi: %f\\n", math.Pi)
    fmt.Printf("Square root of 256: %.0f\\n", math.Sqrt(256))
    fmt.Printf("2^10 = %.0f\\n", math.Pow(2, 10))
}`,
                    hints: [
                        'Use := for short variable declarations — Go infers the type automatically.',
                        'fmt.Printf uses format verbs: %s for strings, %d for ints, %f for floats.',
                        'Don\'t forget \\n at the end of Printf — it does NOT add newlines like Println.',
                        'math.Pi is a constant. math.Sqrt() and math.Pow() return float64.',
                        'Use %.0f to print a float with no decimal places.',
                    ],
                    language: 'go',
                },
            },
            // ── Step 5: INTERVIEW_QUESTIONS ──
            {
                order: 5,
                title: 'Interview Questions: Go Basics',
                type: 'INTERVIEW_QUESTIONS',
                content: `# Interview Questions — Go Introduction & Setup

Review these common interview questions about Go fundamentals. Flip each card to reveal the answer.`,
                interviewCards: [
                    {
                        order: 0, category: 'Conceptual', difficulty: 'EASY',
                        question: 'What is Go and why was it created?',
                        answer: `Go is an open-source, statically typed, compiled language created at **Google in 2009** by Robert Griesemer, Rob Pike, and Ken Thompson. It was created to address:\n- Slow C++ compilation times\n- Complexity of large codebases\n- Lack of native concurrency support\n- Poor dependency management\n\nGo prioritizes **simplicity**, **fast compilation**, and **built-in concurrency**.`,
                        tags: ['history', 'fundamentals'],
                    },
                    {
                        order: 1, category: 'Conceptual', difficulty: 'EASY',
                        question: 'What are the key features of Go?',
                        answer: `1. **Statically typed** — type checking at compile time\n2. **Compiled** — produces a single native binary\n3. **Garbage collected** — automatic memory management\n4. **Built-in concurrency** — goroutines and channels\n5. **Fast compilation** — compiles in seconds\n6. **Cross-compilation** — build for any OS from any OS\n7. **Rich standard library** — HTTP, JSON, crypto, testing all built-in`,
                        tags: ['features', 'fundamentals'],
                    },
                    {
                        order: 2, category: 'Conceptual', difficulty: 'MEDIUM',
                        question: 'How does Go differ from Python in terms of execution?',
                        answer: `**Go** is a **compiled** language — source code is compiled into a native binary once, and the binary runs directly on the CPU. No interpreter needed.\n\n**Python** is an **interpreted** language — source code is read and executed line-by-line by the Python interpreter each time you run it.\n\n**Key differences:**\n- Go: faster execution, larger binary\n- Python: slower execution, needs runtime installed\n- Go: type errors caught at compile time\n- Python: type errors caught at runtime`,
                        tags: ['comparison', 'execution'],
                    },
                    {
                        order: 3, category: 'Coding', difficulty: 'EASY',
                        question: 'What is the structure of a minimal Go program?',
                        answer: `Every Go program needs:\n1. A **package declaration** (\`package main\`)\n2. An **import statement** for any packages used\n3. A **main function** (\`func main()\`)\n\nThe \`main\` package is special — it tells Go this is an executable program, not a library.`,
                        codeSnippet: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello!")\n}`,
                        codeLanguage: 'go',
                        tags: ['syntax', 'structure'],
                    },
                    {
                        order: 4, category: 'Conceptual', difficulty: 'MEDIUM',
                        question: 'What is the difference between fmt.Print, fmt.Println, and fmt.Printf?',
                        answer: `- **fmt.Print()** — prints without adding a newline\n- **fmt.Println()** — prints and adds a newline at the end\n- **fmt.Printf()** — prints with format verbs (%s, %d, %f, %v) for formatted output\n\n\`Printf\` is the most flexible — you control exactly how values appear.`,
                        tags: ['fmt', 'printing'],
                    },
                    {
                        order: 5, category: 'Tricky', difficulty: 'MEDIUM',
                        question: 'What happens if you declare a variable in Go but never use it?',
                        answer: `Go gives a **compile error**. Unlike most languages that just show warnings, Go **refuses to compile** if there are:\n- Unused variables\n- Unused imports\n\nThis is by design — it enforces clean, readable code. You can use the blank identifier \`_\` to explicitly discard a value.`,
                        tags: ['compiler', 'best-practices'],
                    },
                    {
                        order: 6, category: 'Conceptual', difficulty: 'EASY',
                        question: 'What is a Go module?',
                        answer: `A **Go module** is a collection of related Go packages that are released together. It's defined by a \`go.mod\` file at the root of your project.\n\nThe \`go.mod\` file contains:\n- The **module path** (usually your repo URL)\n- The **Go version** used\n- Any **dependencies** and their versions\n\nYou create a module with: \`go mod init <module-name>\``,
                        tags: ['modules', 'project-structure'],
                    },
                    {
                        order: 7, category: 'Tricky', difficulty: 'HARD',
                        question: 'Go doesn\'t have classes. How does it achieve code organization and reuse?',
                        answer: `Go uses:\n1. **Packages** — for code organization (each folder = a package)\n2. **Structs** — for data grouping (like classes without inheritance)\n3. **Methods on structs** — functions attached to types\n4. **Interfaces** — for polymorphism (implicit, not explicit)\n5. **Composition** — embedding structs instead of inheritance\n\nGo favors **composition over inheritance** — there is no \`class\`, \`extends\`, or \`implements\` keyword.`,
                        tags: ['oop', 'design'],
                    },
                    {
                        order: 8, category: 'Conceptual', difficulty: 'MEDIUM',
                        question: 'What does "cross-compilation" mean in Go?',
                        answer: `Cross-compilation means you can build a binary for a **different operating system or architecture** from your current machine.\n\nExample — build a Linux binary from macOS:\n\`\`\`bash\nGOOS=linux GOARCH=amd64 go build -o myapp\n\`\`\`\n\nGo supports cross-compilation **out of the box** with just two environment variables: \`GOOS\` (target OS) and \`GOARCH\` (target architecture).`,
                        tags: ['compilation', 'deployment'],
                    },
                    {
                        order: 9, category: 'Conceptual', difficulty: 'EASY',
                        question: 'What is the go.sum file?',
                        answer: `\`go.sum\` is a **lock file** that contains cryptographic checksums of all your dependencies. It ensures:\n- **Reproducible builds** — same dependencies every time\n- **Security** — detects if a dependency has been tampered with\n\nYou should **commit** \`go.sum\` to version control. It's automatically maintained by the \`go\` tool.`,
                        tags: ['modules', 'dependencies'],
                    },
                    {
                        order: 10, category: 'Tricky', difficulty: 'MEDIUM',
                        question: 'What is the init() function in Go?',
                        answer: `\`init()\` is a special function that runs **automatically before main()**. Key facts:\n- You can have **multiple init() functions** in one file\n- You can have init() in **any package**, not just main\n- init() takes **no arguments** and returns **no values**\n- Execution order: package-level variables → init() → main()\n\nUse it for initialization tasks like setting up config or validating environment.`,
                        tags: ['initialization', 'functions'],
                    },
                    {
                        order: 11, category: 'Coding', difficulty: 'EASY',
                        question: 'What is the difference between go build and go run?',
                        answer: `- **\`go run main.go\`** — compiles AND executes in one step (doesn't save the binary)\n- **\`go build\`** — compiles and saves the binary to disk\n\n\`go run\` is convenient for development, but \`go build\` is used for deployment since it produces a distributable binary.`,
                        tags: ['tooling', 'compilation'],
                    },
                ],
            },
            // ── Step 6: SUMMARY ──
            {
                order: 6,
                title: 'Summary: Go Introduction',
                type: 'SUMMARY',
                content: `# 📝 Summary — Introduction to Go

## Key Takeaways

✅ Go was created at Google in 2009 for **simplicity**, **speed**, and **concurrency**
✅ Go compiles to a **single native binary** — no runtime dependencies
✅ Every Go program starts with **package main** and **func main()**
✅ The **fmt** package handles all printing: \`Print\`, \`Println\`, \`Printf\`
✅ Go **enforces clean code** — unused imports/variables = compile error
✅ **go.mod** defines your module, **go.sum** locks dependencies
✅ Go supports **cross-compilation** out of the box

## What You Learned

| Concept | Detail |
|---------|--------|
| Language | Go (Golang), created at Google 2009 |
| Type System | Statically typed, compiled |
| Entry Point | \`func main()\` in \`package main\` |
| Printing | \`fmt.Print\`, \`fmt.Println\`, \`fmt.Printf\` |
| Format Verbs | \`%s\` string, \`%d\` int, \`%f\` float, \`%v\` any |
| Modules | \`go mod init\`, \`go.mod\`, \`go.sum\` |
| Build | \`go run\` (dev), \`go build\` (production) |

## Next Up

In the next topic, you'll learn about **Variables, Types, and Constants** — the building blocks of every Go program! 🎯`,
            },
        ],
    });

    console.log('✅ Golang Topic 1 seeded!');

    // ═══════════════════════════════════════════════════════════════════
    //  TOPIC 2: Variables, Types & Constants
    // ═══════════════════════════════════════════════════════════════════
    await createLearn({
        slug: 'go-variables-types',
        title: 'Variables, Types & Constants',
        description: 'Master Go\'s type system — learn how to declare variables, understand all primitive types, use constants, work with type conversions, and the zero-value concept.',
        difficulty: 'BEGINNER',
        topicSlug: 'go-unit1-fundamentals',
        unitTitle: 'Unit 1: Go Fundamentals',
        estimatedTime: 50,
        tags: ['go', 'variables', 'types', 'constants', 'type-conversion', 'zero-value'],
        iconEmoji: '📦',
        steps: [
            // ── Step 0: EXPLANATION ──
            {
                order: 0,
                title: 'Variables in Go — Declaration & Initialization',
                type: 'EXPLANATION',
                tips: [
                    'Use := for short declarations inside functions — it\'s the most common way.',
                    'Use var for package-level variables or when you need to specify a type explicitly.',
                    'Go initializes variables to their "zero value" if you don\'t assign one.',
                ],
                content: `# Variables in Go

A **variable** is a named storage location in memory that holds a value. Go is **statically typed** — every variable has a fixed type that is known at compile time.

---

## Three Ways to Declare Variables

### 1. Short Declaration (\`:=\`) — Most Common

\`\`\`go
name := "Gopher"    // type inferred as string
age := 15           // type inferred as int
pi := 3.14159       // type inferred as float64
isActive := true    // type inferred as bool
\`\`\`

> 📌 Short declarations can **only** be used **inside functions**, not at package level.

### 2. Explicit \`var\` Declaration

\`\`\`go
var name string = "Gopher"
var age int = 15
var pi float64 = 3.14159
\`\`\`

### 3. \`var\` Without Value (Zero Value)

\`\`\`go
var count int       // 0
var message string  // "" (empty string)
var active bool     // false
var price float64   // 0.0
\`\`\`

> 🎯 Go **never** has uninitialized variables. Every variable starts at its **zero value**.

---

## Variable Block Declaration

You can group multiple declarations:

\`\`\`go
var (
    firstName string = "Rob"
    lastName  string = "Pike"
    age       int    = 65
    isRetired bool   = false
)
\`\`\`

---

## The Zero Value Concept

| Type | Zero Value |
|------|-----------|
| \`int\`, \`float64\` | \`0\` |
| \`string\` | \`""\` (empty) |
| \`bool\` | \`false\` |
| Pointers, slices, maps | \`nil\` |

This is one of Go's most important design decisions — **no uninitialized memory, ever**.`,
            },
            // ── Step 1: CODE ──
            {
                order: 1,
                title: 'Go Types — Code Examples',
                type: 'CODE',
                tips: [
                    'int is platform-dependent (32 or 64 bit). Use int64 or int32 if you need a specific size.',
                    'string in Go is immutable — you cannot change individual characters.',
                    'float64 is the default for floating-point literals, not float32.',
                ],
                content: `# Go's Type System — Hands-On

Go has a rich type system with numeric types, strings, booleans, and more. Let's explore each with code.`,
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Numeric Types',
                        language: 'go',
                        code: `package main

import "fmt"

func main() {
    // ─── Integer Types ───────────────────────────────────
    var a int = 42          // Platform-dependent size (32 or 64 bit)
    var b int8 = 127        // -128 to 127
    var c int16 = 32767     // -32768 to 32767
    var d int32 = 2147483647
    var e int64 = 9223372036854775807

    fmt.Println("int:", a)
    fmt.Println("int8:", b, "| int16:", c)
    fmt.Println("int32:", d)
    fmt.Println("int64:", e)

    // ─── Unsigned Integer Types ──────────────────────────
    var u uint = 42         // Unsigned (no negatives)
    var u8 uint8 = 255      // 0 to 255 (same as byte)
    fmt.Println("uint:", u, "| uint8:", u8)

    // ─── Float Types ─────────────────────────────────────
    var f1 float32 = 3.14
    var f2 float64 = 3.141592653589793  // Default for literals
    fmt.Printf("float32: %f\\n", f1)
    fmt.Printf("float64: %.15f\\n", f2)

    // ─── Complex Numbers (yes, Go has them!) ─────────────
    var z complex128 = 3 + 4i
    fmt.Println("complex:", z)
}`,
                        explanation: `Go has explicit integer sizes (int8, int16, int32, int64) and their unsigned counterparts. \`int\` without a size is either 32 or 64 bits depending on the platform. \`float64\` is the default for floating-point — use it unless you have a specific reason for float32.`,
                        highlightLines: [7, 14, 22, 26],
                        isRunnable: true,
                    },
                    {
                        order: 1,
                        title: 'Strings, Booleans & Type Inference',
                        language: 'go',
                        code: "package main\n\nimport (\n\t\"fmt\"\n\t\"strings\"\n)\n\nfunc main() {\n\t// ─── Strings ─────────────────────────────────────────\n\tgreeting := \"Hello, Go!\"\n\trawStr := `This is a raw string literal.\nIt preserves newlines and \"quotes\".`\n\n\tfmt.Println(greeting)\n\tfmt.Println(rawStr)\n\tfmt.Println(\"Length:\", len(greeting))\n\tfmt.Println(\"Upper:\", strings.ToUpper(greeting))\n\n\t// ─── String Concatenation ────────────────────────────\n\tfirst := \"Hello\"\n\tsecond := \"World\"\n\tcombined := first + \", \" + second + \"!\"\n\tfmt.Println(combined)\n\n\t// ─── Booleans ────────────────────────────────────────\n\tisGoFun := true\n\tisBoring := false\n\tfmt.Println(\"Go is fun?\", isGoFun)\n\tfmt.Println(\"Is boring?\", isBoring)\n\tfmt.Println(\"AND:\", isGoFun && isBoring)\n\tfmt.Println(\"OR:\", isGoFun || isBoring)\n\tfmt.Println(\"NOT:\", !isGoFun)\n\n\t// ─── Type Inference with := ──────────────────────────\n\tx := 42              // int\n\ty := 3.14            // float64\n\tz := \"hello\"         // string\n\tw := true            // bool\n\tfmt.Printf(\"x: %T, y: %T, z: %T, w: %T\\n\", x, y, z, w)\n}",
                        explanation: 'Strings use double quotes for regular strings and backticks for raw string literals that preserve newlines. Use %T in Printf to print the type of a variable — very useful for debugging!',
                        highlightLines: [10, 12, 39],
                        isRunnable: true,
                    },
                    {
                        order: 2,
                        title: 'Constants & iota',
                        language: 'go',
                        code: `package main

import "fmt"

// Package-level constants
const AppVersion = "1.0.0"
const MaxRetries = 3

// Constant block
const (
    Pi      = 3.14159
    E       = 2.71828
    Gravity = 9.81
)

// iota — auto-incrementing constant generator
type Weekday int

const (
    Sunday    Weekday = iota  // 0
    Monday                    // 1
    Tuesday                   // 2
    Wednesday                 // 3
    Thursday                  // 4
    Friday                    // 5
    Saturday                  // 6
)

// iota with expressions
const (
    _  = iota             // 0 (skip with blank identifier)
    KB = 1 << (10 * iota) // 1 << 10 = 1024
    MB                    // 1 << 20 = 1048576
    GB                    // 1 << 30 = 1073741824
    TB                    // 1 << 40
)

func main() {
    fmt.Println("App Version:", AppVersion)
    fmt.Println("Pi:", Pi)

    fmt.Println("\\nWeekdays:")
    fmt.Println("Sunday:", Sunday, "| Monday:", Monday, "| Friday:", Friday)

    fmt.Println("\\nFile Sizes:")
    fmt.Printf("KB = %d\\n", KB)
    fmt.Printf("MB = %d\\n", MB)
    fmt.Printf("GB = %d\\n", GB)

    // Constants cannot be changed!
    // AppVersion = "2.0.0"  // ❌ Compile error!
}`,
                        explanation: `Constants are declared with \`const\` and cannot be changed after declaration. \`iota\` is Go's auto-incrementing constant generator — it starts at 0 and increments by 1 for each constant in a block. Combined with expressions like bit-shifting, iota is incredibly powerful for defining flags and sizes.`,
                        highlightLines: [6, 20, 31, 32, 33],
                        isRunnable: true,
                    },
                    {
                        order: 3,
                        title: 'Type Conversion',
                        language: 'go',
                        code: `package main

import (
    "fmt"
    "strconv"
)

func main() {
    // ─── Numeric Conversions ─────────────────────────────
    var intVal int = 42
    var floatVal float64 = float64(intVal)     // int → float64
    var smallInt int32 = int32(intVal)          // int → int32

    fmt.Println("int:", intVal)
    fmt.Println("float64:", floatVal)
    fmt.Println("int32:", smallInt)

    // ⚠️ Be careful with narrowing conversions!
    var bigNum int64 = 300
    var tinyNum int8 = int8(bigNum)  // 300 overflows int8 (max 127)!
    fmt.Println("Overflow:", tinyNum) // Prints 44 (wraps around)

    // ─── String ↔ Number Conversions ─────────────────────
    // Number → String
    numStr := strconv.Itoa(42)             // int to string
    floatStr := fmt.Sprintf("%.2f", 3.14)  // float to string
    fmt.Println("Number as string:", numStr)
    fmt.Println("Float as string:", floatStr)

    // String → Number
    num, err := strconv.Atoi("123")        // string to int
    if err != nil {
        fmt.Println("Error:", err)
    } else {
        fmt.Println("String to int:", num)
    }

    // String → Float
    f, err := strconv.ParseFloat("3.14", 64)
    if err == nil {
        fmt.Println("String to float:", f)
    }

    // ─── String ↔ Byte Slice ─────────────────────────────
    str := "Hello"
    bytes := []byte(str)           // string → byte slice
    backToStr := string(bytes)     // byte slice → string
    fmt.Println("Bytes:", bytes)
    fmt.Println("Back to string:", backToStr)
}`,
                        explanation: `Go requires **explicit type conversions** — there is no implicit casting. Use \`T(value)\` syntax for numeric conversions and the \`strconv\` package for string↔number conversions. Always check the \`err\` return from strconv functions!`,
                        highlightLines: [11, 20, 26, 31],
                        isRunnable: true,
                    },
                ],
            },
            // ── Step 2: VISUAL ──
            {
                order: 2,
                title: 'Go Types — Visual Type Map',
                type: 'VISUAL',
                content: `# Go Type System — Visual Overview

## Complete Type Hierarchy

\`\`\`mermaid
graph TD
    A["Go Types"] --> B["Basic Types"]
    A --> C["Composite Types"]
    A --> D["Reference Types"]

    B --> B1["bool"]
    B --> B2["Numeric"]
    B --> B3["string"]

    B2 --> B2a["int, int8, int16<br/>int32, int64"]
    B2 --> B2b["uint, uint8, uint16<br/>uint32, uint64"]
    B2 --> B2c["float32, float64"]
    B2 --> B2d["complex64, complex128"]
    B2 --> B2e["byte (= uint8)<br/>rune (= int32)"]

    C --> C1["array [n]T"]
    C --> C2["struct"]

    D --> D1["slice []T"]
    D --> D2["map[K]V"]
    D --> D3["pointer *T"]
    D --> D4["channel chan T"]
    D --> D5["function"]
    D --> D6["interface"]

    style A fill:#00ADD8,color:#fff
    style B fill:#10b981,color:#fff
    style C fill:#f59e0b,color:#fff
    style D fill:#8b5cf6,color:#fff
\`\`\`

---

## Variable Declaration Decision Tree

\`\`\`mermaid
flowchart TD
    A["Need a variable?"] --> B{"Inside a function?"}
    B -->|Yes| C{"Need explicit type?"}
    B -->|No| D["Use var keyword<br/>(package level)"]
    C -->|No| E["Use := shorthand<br/>x := 42"]
    C -->|Yes| F["Use var with type<br/>var x int = 42"]
    D --> G{"With value?"}
    G -->|Yes| H["var x int = 42"]
    G -->|No| I["var x int<br/>(zero value)"]

    style A fill:#00ADD8,color:#fff
    style E fill:#10b981,color:#fff
    style F fill:#f59e0b,color:#fff
    style I fill:#ef4444,color:#fff
\`\`\`

---

## Zero Values at a Glance

\`\`\`
╔══════════════╦════════════════╗
║ Type         ║ Zero Value     ║
╠══════════════╬════════════════╣
║ int          ║ 0              ║
║ float64      ║ 0.0            ║
║ string       ║ "" (empty)     ║
║ bool         ║ false          ║
║ pointer      ║ nil            ║
║ slice        ║ nil            ║
║ map          ║ nil            ║
║ interface    ║ nil            ║
║ channel      ║ nil            ║
╚══════════════╩════════════════╝
\`\`\`

> 💡 Go guarantees every variable is initialized to a sensible default — no garbage memory, no \`undefined\`, no \`NullPointerException\` surprises.`,
            },
            // ── Step 3: QUIZ ──
            {
                order: 3,
                title: 'Quiz: Variables & Types',
                type: 'QUIZ',
                content: '## Test Your Knowledge of Go Variables & Types',
                stepData: {
                    questions: [
                        {
                            question: 'Which is the correct short variable declaration in Go?',
                            options: [
                                { id: 'a', text: 'let x = 42', isCorrect: false },
                                { id: 'b', text: 'x := 42', isCorrect: true },
                                { id: 'c', text: 'var x := 42', isCorrect: false },
                                { id: 'd', text: 'x = 42', isCorrect: false },
                            ],
                            explanation: ':= is Go\'s short variable declaration operator. It declares and initializes in one step, with the type inferred.',
                        },
                        {
                            question: 'What is the zero value of a string in Go?',
                            options: [
                                { id: 'a', text: 'nil', isCorrect: false },
                                { id: 'b', text: 'null', isCorrect: false },
                                { id: 'c', text: '"" (empty string)', isCorrect: true },
                                { id: 'd', text: 'undefined', isCorrect: false },
                            ],
                            explanation: 'The zero value of a string is an empty string "". Go doesn\'t have null or undefined for basic types.',
                        },
                        {
                            question: 'Can you use := at the package level (outside any function)?',
                            options: [
                                { id: 'a', text: 'Yes, it works the same way', isCorrect: false },
                                { id: 'b', text: 'No, you must use var at the package level', isCorrect: true },
                                { id: 'c', text: 'Only for constants', isCorrect: false },
                                { id: 'd', text: 'Only for strings', isCorrect: false },
                            ],
                            explanation: 'Short declarations := can only be used inside functions. Package-level declarations must use the var keyword.',
                        },
                        {
                            question: 'What does iota start at in a const block?',
                            options: [
                                { id: 'a', text: '1', isCorrect: false },
                                { id: 'b', text: '0', isCorrect: true },
                                { id: 'c', text: '-1', isCorrect: false },
                                { id: 'd', text: 'It depends on the type', isCorrect: false },
                            ],
                            explanation: 'iota starts at 0 and increments by 1 for each constant in the block.',
                        },
                        {
                            question: 'How do you convert an int to float64 in Go?',
                            options: [
                                { id: 'a', text: '(float64)x', isCorrect: false },
                                { id: 'b', text: 'float64(x)', isCorrect: true },
                                { id: 'c', text: 'x.toFloat64()', isCorrect: false },
                                { id: 'd', text: 'Go converts automatically', isCorrect: false },
                            ],
                            explanation: 'Go uses T(value) syntax for type conversion. There is NO implicit type conversion in Go.',
                        },
                        {
                            question: 'What is the type of the literal 3.14 in Go?',
                            options: [
                                { id: 'a', text: 'float32', isCorrect: false },
                                { id: 'b', text: 'float64', isCorrect: true },
                                { id: 'c', text: 'double', isCorrect: false },
                                { id: 'd', text: 'decimal', isCorrect: false },
                            ],
                            explanation: 'Floating-point literals default to float64 in Go, not float32.',
                        },
                    ],
                },
                quizQuestions: [
                    {
                        order: 0, question: 'What is the output of this code?',
                        codeSnippet: `package main
import "fmt"
func main() {
    var x int
    var s string
    var b bool
    fmt.Println(x, s, b)
}`,
                        codeLanguage: 'go', type: 'CODE_OUTPUT',
                        options: [
                            { id: 'a', text: '0  false', isCorrect: true },
                            { id: 'b', text: 'nil nil nil', isCorrect: false },
                            { id: 'c', text: '0 "" false', isCorrect: false },
                            { id: 'd', text: 'Compile error', isCorrect: false },
                        ],
                        explanation: 'Zero values: int=0, string="" (prints as empty), bool=false. Println separates with spaces, so output is: 0  false (with two spaces because empty string prints as nothing).',
                        difficulty: 'MEDIUM', points: 10,
                    },
                    {
                        order: 1, question: 'Which declaration is INVALID in Go?',
                        options: [
                            { id: 'a', text: 'x := 42', isCorrect: false },
                            { id: 'b', text: 'var x int = 42', isCorrect: false },
                            { id: 'c', text: 'var x = 42', isCorrect: false },
                            { id: 'd', text: 'int x = 42', isCorrect: true },
                        ],
                        explanation: 'Go does not use C-style declarations. The type always comes after the variable name.',
                        difficulty: 'EASY', points: 5,
                    },
                    {
                        order: 2, question: 'What does iota evaluate to at the third position in a const block?',
                        options: [
                            { id: 'a', text: '0', isCorrect: false },
                            { id: 'b', text: '1', isCorrect: false },
                            { id: 'c', text: '2', isCorrect: true },
                            { id: 'd', text: '3', isCorrect: false },
                        ],
                        explanation: 'iota starts at 0: first=0, second=1, third=2.',
                        difficulty: 'EASY', points: 5,
                    },
                    {
                        order: 3, question: 'What is the result of int8(300)?',
                        options: [
                            { id: 'a', text: '300', isCorrect: false },
                            { id: 'b', text: '127', isCorrect: false },
                            { id: 'c', text: '44 (overflow wraps around)', isCorrect: true },
                            { id: 'd', text: 'Compile error', isCorrect: false },
                        ],
                        explanation: 'int8 max is 127. 300 overflows and wraps: 300 - 256 = 44. Go does NOT give an error for numeric overflow in conversions!',
                        difficulty: 'HARD', points: 15, hint: 'int8 range is -128 to 127. What happens when you exceed that?',
                    },
                    {
                        order: 4, question: 'What Printf verb prints the TYPE of a variable?',
                        options: [
                            { id: 'a', text: '%v', isCorrect: false },
                            { id: 'b', text: '%s', isCorrect: false },
                            { id: 'c', text: '%T', isCorrect: true },
                            { id: 'd', text: '%t', isCorrect: false },
                        ],
                        explanation: '%T prints the type. %v prints the value. %t prints a boolean. %s prints a string.',
                        difficulty: 'MEDIUM', points: 10,
                    },
                    {
                        order: 5, question: 'What package provides Atoi and Itoa for string↔int conversion?',
                        options: [
                            { id: 'a', text: 'fmt', isCorrect: false },
                            { id: 'b', text: 'strings', isCorrect: false },
                            { id: 'c', text: 'strconv', isCorrect: true },
                            { id: 'd', text: 'convert', isCorrect: false },
                        ],
                        explanation: 'strconv (string conversion) provides Atoi (ASCII to integer) and Itoa (integer to ASCII).',
                        difficulty: 'MEDIUM', points: 10,
                    },
                    {
                        order: 6, question: 'What is the output?',
                        codeSnippet: `package main
import "fmt"
func main() {
    const x = 5
    const y = 2
    fmt.Println(x / y)
}`,
                        codeLanguage: 'go', type: 'CODE_OUTPUT',
                        options: [
                            { id: 'a', text: '2.5', isCorrect: false },
                            { id: 'b', text: '2', isCorrect: true },
                            { id: 'c', text: '2.0', isCorrect: false },
                            { id: 'd', text: 'Compile error', isCorrect: false },
                        ],
                        explanation: 'Untyped constants 5 and 2 are both integers. Integer division truncates: 5/2 = 2.',
                        difficulty: 'MEDIUM', points: 10,
                    },
                ],
            },
            // ── Step 4: CHALLENGE ──
            {
                order: 4,
                title: 'Challenge: Type Explorer',
                type: 'CHALLENGE',
                content: `## 🏆 Challenge: Go Type Explorer

Write a program that explores Go's type system:

**Part 1: Variable Zoo**
- Declare variables of every basic type (int, float64, string, bool, byte, rune)
- Print each variable's value AND type using \`%v\` and \`%T\`

**Part 2: Constants & iota**
- Create a set of HTTP status code constants using iota + expressions
  - OK = 200, Created = 201, Accepted = 202
  - Hint: use \`iota + 200\`
- Print all three values

**Part 3: Type Conversion**
- Convert a float64 temperature (98.6°F) to Celsius using the formula: C = (F - 32) * 5/9
- Print the result with 2 decimal places`,
                stepData: {
                    starterCode: `package main

import "fmt"

func main() {
    // ─── PART 1: Variable Zoo ────────────────────────────
    // TODO: Declare one variable of each type:
    // int, float64, string, bool, byte, rune
    // Print each with: fmt.Printf("%-10s value: %v, type: %T\\n", "name", val, val)



    // ─── PART 2: HTTP Status Constants ───────────────────
    // TODO: Define constants using iota
    // OK = 200, Created = 201, Accepted = 202



    // ─── PART 3: Temperature Conversion ──────────────────
    // TODO: Convert 98.6°F to Celsius
    // Formula: C = (F - 32) * 5.0 / 9.0
    // Print with 2 decimal places using %.2f

}`,
                    solution: `package main

import "fmt"

// Part 2: HTTP Status Constants
const (
    StatusOK       = iota + 200 // 200
    StatusCreated               // 201
    StatusAccepted              // 202
)

func main() {
    // ─── PART 1: Variable Zoo ────────────────────────────
    myInt := 42
    myFloat := 3.14159
    myString := "Hello, Go!"
    myBool := true
    var myByte byte = 'A'   // byte = uint8
    var myRune rune = '🐹'   // rune = int32 (Unicode code point)

    fmt.Println("=== Variable Zoo ===")
    fmt.Printf("%-10s value: %v, type: %T\\n", "int", myInt, myInt)
    fmt.Printf("%-10s value: %v, type: %T\\n", "float64", myFloat, myFloat)
    fmt.Printf("%-10s value: %v, type: %T\\n", "string", myString, myString)
    fmt.Printf("%-10s value: %v, type: %T\\n", "bool", myBool, myBool)
    fmt.Printf("%-10s value: %v (%c), type: %T\\n", "byte", myByte, myByte, myByte)
    fmt.Printf("%-10s value: %v (%c), type: %T\\n", "rune", myRune, myRune, myRune)

    // ─── PART 2: HTTP Status Constants ───────────────────
    fmt.Println("\\n=== HTTP Status Codes ===")
    fmt.Println("OK:", StatusOK)
    fmt.Println("Created:", StatusCreated)
    fmt.Println("Accepted:", StatusAccepted)

    // ─── PART 3: Temperature Conversion ──────────────────
    fahrenheit := 98.6
    celsius := (fahrenheit - 32) * 5.0 / 9.0

    fmt.Println("\\n=== Temperature Conversion ===")
    fmt.Printf("%.1f°F = %.2f°C\\n", fahrenheit, celsius)
}`,
                    hints: [
                        'Use %T to print the type and %v to print the value of any variable.',
                        'byte is an alias for uint8, and rune is an alias for int32.',
                        'Use %c to print the character representation of a byte or rune.',
                        'For iota, start with iota + 200 so the first constant is 200.',
                        'Make sure to use 5.0/9.0 (not 5/9) to get floating-point division.',
                    ],
                    language: 'go',
                },
            },
            // ── Step 5: INTERVIEW_QUESTIONS ──
            {
                order: 5,
                title: 'Interview Questions: Variables & Types',
                type: 'INTERVIEW_QUESTIONS',
                content: `# Interview Questions — Variables, Types & Constants

Master these questions to ace your Go interviews on type system fundamentals.`,
                interviewCards: [
                    {
                        order: 0, category: 'Conceptual', difficulty: 'EASY',
                        question: 'What is the zero value concept in Go?',
                        answer: `In Go, every variable is automatically initialized to a **zero value** if no explicit value is assigned:\n- \`int\` → \`0\`\n- \`float64\` → \`0.0\`\n- \`string\` → \`""\` (empty string)\n- \`bool\` → \`false\`\n- pointers, slices, maps → \`nil\`\n\nThis eliminates an entire class of bugs related to uninitialized memory.`,
                        tags: ['zero-value', 'initialization'],
                    },
                    {
                        order: 1, category: 'Coding', difficulty: 'EASY',
                        question: 'What is the difference between := and var in Go?',
                        answer: `**\`:=\`** — Short variable declaration:\n- Can only be used **inside functions**\n- Type is **inferred** from the value\n- Declares AND initializes in one step\n\n**\`var\`** — Full variable declaration:\n- Can be used **anywhere** (package or function level)\n- Can specify type **explicitly**\n- Can declare **without** a value (uses zero value)`,
                        tags: ['declarations', 'syntax'],
                    },
                    {
                        order: 2, category: 'Tricky', difficulty: 'MEDIUM',
                        question: 'Can you redeclare a variable with := in Go?',
                        answer: `**Partially yes!** You can use \`:=\` with a mix of new and existing variables, as long as **at least one variable on the left side is new**:\n\n\`\`\`go\nx := 10\nx, y := 20, 30  // OK — y is new\n// x, x := 1, 2  // ❌ Error — no new variables\n\`\`\`\n\nThis is a common source of subtle bugs when shadowing variables in inner scopes.`,
                        codeSnippet: `x := 10\nx, y := 20, 30 // OK: y is new\nfmt.Println(x, y) // 20 30`,
                        codeLanguage: 'go',
                        tags: ['shadowing', 'declarations'],
                    },
                    {
                        order: 3, category: 'Conceptual', difficulty: 'MEDIUM',
                        question: 'What is the difference between byte and rune in Go?',
                        answer: `Both are type aliases:\n- **\`byte\`** = \`uint8\` — represents a single ASCII character (0-255)\n- **\`rune\`** = \`int32\` — represents a single Unicode code point\n\n**When to use which:**\n- Use \`byte\` for ASCII text, binary data, network protocols\n- Use \`rune\` for Unicode text (emoji, non-Latin scripts)\n\nA Go string is a sequence of bytes, but when you \`range\` over a string, you get runes.`,
                        tags: ['byte', 'rune', 'unicode'],
                    },
                    {
                        order: 4, category: 'Tricky', difficulty: 'HARD',
                        question: 'Why does Go not have implicit type conversion?',
                        answer: `Go requires **explicit type conversions** to prevent subtle bugs:\n\n\`\`\`go\nvar x int32 = 42\nvar y int64 = x  // ❌ Compile error!\nvar y int64 = int64(x)  // ✅ Explicit conversion\n\`\`\`\n\n**Reasons:**\n1. **Safety** — no silent precision loss (int64 → int32)\n2. **Clarity** — conversions are visible in code\n3. **Predictability** — no complex conversion rules to memorize\n4. **Performance** — developer is aware of conversion costs`,
                        codeSnippet: `var x int32 = 42\n// var y int64 = x     // ❌ Error\nvar y int64 = int64(x)  // ✅ OK`,
                        codeLanguage: 'go',
                        tags: ['type-conversion', 'safety'],
                    },
                    {
                        order: 5, category: 'Conceptual', difficulty: 'MEDIUM',
                        question: 'What is iota in Go and how does it work?',
                        answer: `\`iota\` is Go's **auto-incrementing constant generator**. It:\n- Starts at **0** in each \`const\` block\n- Increments by **1** for each constant\n- Resets to **0** in a new \`const\` block\n- Can be used in **expressions** (e.g., \`1 << iota\` for powers of 2)\n\nCommon patterns:\n- Sequential enums: \`iota\` → 0, 1, 2, 3...\n- Bit flags: \`1 << iota\` → 1, 2, 4, 8...\n- Custom offsets: \`iota + 100\` → 100, 101, 102...`,
                        tags: ['iota', 'constants', 'enums'],
                    },
                    {
                        order: 6, category: 'Tricky', difficulty: 'HARD',
                        question: 'What is variable shadowing in Go and why is it dangerous?',
                        answer: `**Variable shadowing** occurs when an inner scope declares a variable with the same name as an outer scope:\n\n\`\`\`go\nx := 10\nif true {\n    x := 20  // shadows outer x!\n    fmt.Println(x) // 20\n}\nfmt.Println(x) // still 10!\n\`\`\`\n\n**Why it's dangerous:**\n- The inner \`:=\` creates a NEW variable, not reassigning the outer one\n- Common with \`err\` variables in error handling\n- Use \`=\` (not \`:=\`) to assign to existing variables\n- Use \`go vet -shadow\` to detect shadowing`,
                        codeSnippet: `x := 10\nif true {\n    x := 20  // NEW variable, shadows outer x\n    fmt.Println(x) // 20\n}\nfmt.Println(x) // still 10!`,
                        codeLanguage: 'go',
                        tags: ['shadowing', 'scope', 'bugs'],
                    },
                    {
                        order: 7, category: 'Conceptual', difficulty: 'EASY',
                        question: 'What is the default type for integer and float literals in Go?',
                        answer: `- **Integer literals** (like \`42\`) default to \`int\`\n- **Float literals** (like \`3.14\`) default to \`float64\`\n\nThis means:\n\`\`\`go\nx := 42    // type is int\ny := 3.14  // type is float64\n\`\`\`\n\nIf you need a different type, you must be explicit:\n\`\`\`go\nvar x int8 = 42\nvar y float32 = 3.14\n\`\`\``,
                        tags: ['defaults', 'literals'],
                    },
                    {
                        order: 8, category: 'Coding', difficulty: 'MEDIUM',
                        question: 'How do you convert between strings and numbers in Go?',
                        answer: `Use the **\`strconv\`** package:\n\n**String → Number:**\n\`\`\`go\nnum, err := strconv.Atoi("42")       // string → int\nf, err := strconv.ParseFloat("3.14", 64) // string → float64\n\`\`\`\n\n**Number → String:**\n\`\`\`go\ns := strconv.Itoa(42)          // int → string\ns := fmt.Sprintf("%.2f", 3.14) // float → string\n\`\`\`\n\n⚠️ **Never use** \`string(42)\` — it gives you the character \`*\`, not \`"42"\`!`,
                        tags: ['strconv', 'conversion'],
                    },
                    {
                        order: 9, category: 'Tricky', difficulty: 'HARD',
                        question: 'What are untyped constants in Go and why do they matter?',
                        answer: `Untyped constants have a **kind** but not a specific **type** until they're used:\n\n\`\`\`go\nconst x = 42     // untyped int constant\nconst y = 3.14   // untyped float constant\n\nvar a int32 = x   // x adapts to int32\nvar b float32 = y // y adapts to float32\nvar c int64 = x   // x adapts to int64\n\`\`\`\n\n**Why it matters:**\n- Untyped constants can be used with any compatible type\n- Typed constants (\`const x int = 42\`) can only be used with that exact type\n- This gives constants flexibility similar to literals`,
                        tags: ['constants', 'untyped', 'advanced'],
                    },
                    {
                        order: 10, category: 'Conceptual', difficulty: 'MEDIUM',
                        question: 'What is the blank identifier _ used for in Go?',
                        answer: `The blank identifier \`_\` is used to **explicitly discard** a value. Common uses:\n\n1. **Ignore return values:**\n\`\`\`go\n_, err := strconv.Atoi("42") // discard the int value\n\`\`\`\n\n2. **Skip iota values:**\n\`\`\`go\nconst (\n    _ = iota  // skip 0\n    KB = 1 << (10 * iota)\n)\n\`\`\`\n\n3. **Import for side effects:**\n\`\`\`go\nimport _ "net/http/pprof"\n\`\`\`\n\nWithout \`_\`, Go would give a compile error for unused values.`,
                        tags: ['blank-identifier', 'best-practices'],
                    },
                    {
                        order: 11, category: 'Coding', difficulty: 'MEDIUM',
                        question: 'How does Go handle multiple return values and why is this important for variables?',
                        answer: `Go functions can return **multiple values**, which is fundamental to Go's error handling pattern:\n\n\`\`\`go\n// strconv.Atoi returns (int, error)\nnum, err := strconv.Atoi("42")\nif err != nil {\n    log.Fatal(err)\n}\nfmt.Println(num) // 42\n\`\`\`\n\n**Key points:**\n- Multiple returns enable Go's \`value, err\` pattern\n- You MUST handle all return values (or use \`_\` to discard)\n- This replaces exceptions/try-catch from other languages\n- It makes error handling **explicit** and **visible**`,
                        tags: ['multiple-returns', 'error-handling'],
                    },
                ],
            },
            // ── Step 6: SUMMARY ──
            {
                order: 6,
                title: 'Summary: Variables, Types & Constants',
                type: 'SUMMARY',
                content: `# 📝 Summary — Variables, Types & Constants

## Key Takeaways

✅ **Three ways** to declare variables: \`:=\` (short), \`var x T = v\` (explicit), \`var x T\` (zero value)
✅ Go has **no uninitialized variables** — everything gets a zero value
✅ **No implicit conversions** — use \`T(value)\` for explicit type conversion
✅ **\`iota\`** auto-increments constants starting from 0
✅ **\`byte\`** = uint8 (ASCII), **\`rune\`** = int32 (Unicode)
✅ Use **\`strconv\`** for string ↔ number conversions
✅ Use **\`_\`** (blank identifier) to discard unused values

## Type Cheat Sheet

| Type | Size | Zero Value | Example |
|------|------|-----------|---------|
| \`bool\` | 1 byte | \`false\` | \`true\` |
| \`int\` | 4/8 bytes | \`0\` | \`42\` |
| \`float64\` | 8 bytes | \`0.0\` | \`3.14\` |
| \`string\` | varies | \`""\` | \`"hello"\` |
| \`byte\` | 1 byte | \`0\` | \`'A'\` |
| \`rune\` | 4 bytes | \`0\` | \`'🐹'\` |

## Next Up

In the next topic, you'll learn about **Operators & Control Flow** — if/else, switch, and loops in Go! 🎯`,
            },
        ],
    });

    console.log('✅ Golang Topic 2 seeded!');

    // ═══════════════════════════════════════════════════════════════════
    //  TOPIC 3: Operators & Control Flow
    // ═══════════════════════════════════════════════════════════════════
    await createLearn({
        slug: 'go-operators-control-flow',
        title: 'Operators & Control Flow',
        description: 'Master Go operators (arithmetic, comparison, logical, bitwise), if/else statements, switch (including type switch), and all loop patterns (for, while-style, range, break, continue).',
        difficulty: 'BEGINNER',
        topicSlug: 'go-unit1-fundamentals',
        unitTitle: 'Unit 1: Go Fundamentals',
        estimatedTime: 45,
        tags: ['go', 'operators', 'if-else', 'switch', 'loops', 'for', 'range', 'control-flow'],
        iconEmoji: '🔀',
        steps: [
            {
                order: 0,
                title: 'Operators & if/else in Go',
                type: 'EXPLANATION',
                tips: [
                    'Go has NO ternary operator (? :). Use if/else instead.',
                    'if statements can have an initialization statement before the condition.',
                    'switch in Go does NOT fall through by default — no break needed.',
                ],
                content: `# Operators & Control Flow in Go

## Operators

### Arithmetic Operators

\`\`\`go
a, b := 17, 5
fmt.Println(a + b)   // 22  (addition)
fmt.Println(a - b)   // 12  (subtraction)
fmt.Println(a * b)   // 85  (multiplication)
fmt.Println(a / b)   // 3   (integer division — truncates!)
fmt.Println(a % b)   // 2   (modulus/remainder)
\`\`\`

> ⚠️ Integer division **truncates** in Go. \`17 / 5 = 3\`, not 3.4.

### Comparison Operators

\`\`\`go
fmt.Println(5 == 5)  // true
fmt.Println(5 != 3)  // true
fmt.Println(5 > 3)   // true
fmt.Println(5 < 3)   // false
fmt.Println(5 >= 5)  // true
fmt.Println(5 <= 4)  // false
\`\`\`

### Logical Operators

\`\`\`go
fmt.Println(true && false)  // false (AND)
fmt.Println(true || false)  // true  (OR)
fmt.Println(!true)          // false (NOT)
\`\`\`

### Bitwise Operators

\`\`\`go
a, b := 0b1100, 0b1010  // 12, 10
fmt.Println(a & b)   // 8   (AND)
fmt.Println(a | b)   // 14  (OR)
fmt.Println(a ^ b)   // 6   (XOR)
fmt.Println(a << 2)  // 48  (left shift)
fmt.Println(a >> 1)  // 6   (right shift)
\`\`\`

---

## if / else — Go Style

\`\`\`go
age := 25

if age >= 18 {
    fmt.Println("Adult")
} else if age >= 13 {
    fmt.Println("Teenager")
} else {
    fmt.Println("Child")
}
\`\`\`

**Go difference: if with initialization statement**

\`\`\`go
if err := doSomething(); err != nil {
    fmt.Println("Error:", err)
    // err is scoped to this if block
}
// err is NOT accessible here
\`\`\`

This pattern is **extremely common** in Go for error handling. The variable is scoped to the if/else block.

---

## switch — Powerful & Clean

Go's switch is more powerful than most languages:

\`\`\`go
day := "Wednesday"

switch day {
case "Monday", "Tuesday", "Wednesday", "Thursday", "Friday":
    fmt.Println("Weekday")
case "Saturday", "Sunday":
    fmt.Println("Weekend")
default:
    fmt.Println("Unknown")
}
\`\`\`

**Key differences from C/Java:**
- **No break needed** — Go automatically breaks after each case
- **Multiple values per case** — \`case "Monday", "Tuesday"\`
- **No fallthrough by default** — use \`fallthrough\` keyword explicitly
- **Cases can be expressions** — not just constants

### Switch Without a Condition (like if/else chain)

\`\`\`go
score := 85

switch {
case score >= 90:
    fmt.Println("A")
case score >= 80:
    fmt.Println("B")
case score >= 70:
    fmt.Println("C")
default:
    fmt.Println("F")
}
\`\`\`

### Type Switch (unique to Go)

\`\`\`go
func describe(i interface{}) {
    switch v := i.(type) {
    case int:
        fmt.Printf("Integer: %d\\n", v)
    case string:
        fmt.Printf("String: %s\\n", v)
    case bool:
        fmt.Printf("Boolean: %t\\n", v)
    default:
        fmt.Printf("Unknown type: %T\\n", v)
    }
}
\`\`\``,
            },
            {
                order: 1,
                title: 'Loops in Go — for is All You Need',
                type: 'EXPLANATION',
                content: `# Loops in Go

Go has **only one loop keyword: \`for\`**. But it covers every loop pattern.

## 1. Standard For Loop

\`\`\`go
for i := 0; i < 5; i++ {
    fmt.Println(i)  // 0, 1, 2, 3, 4
}
\`\`\`

## 2. While-Style Loop (for with condition only)

\`\`\`go
count := 0
for count < 5 {
    fmt.Println(count)
    count++
}
\`\`\`

## 3. Infinite Loop

\`\`\`go
for {
    fmt.Println("Running forever...")
    // Use break to exit
    break
}
\`\`\`

## 4. Range Loop (iterating collections)

\`\`\`go
// Range over slice
fruits := []string{"apple", "banana", "cherry"}
for index, value := range fruits {
    fmt.Printf("[%d] %s\\n", index, value)
}

// Range over string (gives runes)
for i, ch := range "Go🐹" {
    fmt.Printf("Index: %d, Char: %c\\n", i, ch)
}

// Range over map
ages := map[string]int{"Alice": 30, "Bob": 25}
for name, age := range ages {
    fmt.Printf("%s is %d\\n", name, age)
}

// Ignore index with _
for _, fruit := range fruits {
    fmt.Println(fruit)
}
\`\`\`

## 5. break & continue

\`\`\`go
// break — exit the loop
for i := 0; i < 10; i++ {
    if i == 5 {
        break  // exits at 5
    }
    fmt.Println(i)  // 0, 1, 2, 3, 4
}

// continue — skip to next iteration
for i := 0; i < 10; i++ {
    if i%2 == 0 {
        continue  // skip even numbers
    }
    fmt.Println(i)  // 1, 3, 5, 7, 9
}
\`\`\`

## 6. Labeled Loops (break/continue outer loop)

\`\`\`go
outer:
for i := 0; i < 3; i++ {
    for j := 0; j < 3; j++ {
        if i == 1 && j == 1 {
            break outer  // breaks the OUTER loop
        }
        fmt.Printf("(%d, %d) ", i, j)
    }
}
// Output: (0, 0) (0, 1) (0, 2) (1, 0)
\`\`\``,
            },
            {
                order: 2,
                title: 'Control Flow — Code Examples',
                type: 'CODE',
                content: '## Control Flow in Practice',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'FizzBuzz — Classic Interview Problem',
                        language: 'go',
                        code: `package main

import "fmt"

func main() {
    for i := 1; i <= 30; i++ {
        switch {
        case i%15 == 0:
            fmt.Println("FizzBuzz")
        case i%3 == 0:
            fmt.Println("Fizz")
        case i%5 == 0:
            fmt.Println("Buzz")
        default:
            fmt.Println(i)
        }
    }
}`,
                        explanation: 'FizzBuzz using switch without a condition — a clean Go idiom. Check divisible by 15 first (both 3 and 5), then 3, then 5.',
                        highlightLines: [7, 8, 10, 12],
                        isRunnable: true,
                    },
                    {
                        order: 1,
                        title: 'Error Handling with if-init',
                        language: 'go',
                        code: `package main

import (
    "fmt"
    "strconv"
)

func main() {
    inputs := []string{"42", "hello", "100", "", "3.14"}

    for _, input := range inputs {
        if num, err := strconv.Atoi(input); err != nil {
            fmt.Printf("%-10s → Error: %s\\n", input, err)
        } else {
            fmt.Printf("%-10s → Parsed: %d\\n", input, num)
        }
    }
}`,
                        explanation: 'The if-init pattern: declare and test in one line. The variables num and err are scoped to the if/else block. This is the idiomatic Go error handling pattern.',
                        highlightLines: [12, 13, 15],
                        isRunnable: true,
                    },
                    {
                        order: 2,
                        title: 'Patterns: Sum, Fibonacci, Prime Check',
                        language: 'go',
                        code: `package main

import (
    "fmt"
    "math"
)

func main() {
    // Sum 1 to N
    sum := 0
    for i := 1; i <= 100; i++ {
        sum += i
    }
    fmt.Println("Sum 1-100:", sum)

    // Fibonacci sequence
    a, b := 0, 1
    fmt.Print("Fibonacci: ")
    for i := 0; i < 10; i++ {
        fmt.Print(a, " ")
        a, b = b, a+b
    }
    fmt.Println()

    // Prime check
    n := 29
    isPrime := n > 1
    for i := 2; i <= int(math.Sqrt(float64(n))); i++ {
        if n%i == 0 {
            isPrime = false
            break
        }
    }
    fmt.Printf("%d is prime: %t\\n", n, isPrime)
}`,
                        explanation: 'Three classic patterns: accumulator loop, parallel assignment for Fibonacci (a, b = b, a+b swaps simultaneously), and break for early exit in prime checking.',
                        highlightLines: [11, 21, 28, 30],
                        isRunnable: true,
                    },
                ],
            },
            {
                order: 3,
                title: 'Control Flow Visualization',
                type: 'VISUALIZATION',
                content: `# Go Control Flow — Visual

## Go Loop Patterns

\`\`\`mermaid
flowchart TD
    A["Go for Loop"] --> B["Standard for\nfor i := 0; i < n; i++"]
    A --> C["While-style\nfor condition"]
    A --> D["Infinite\nfor { }"]
    A --> E["Range\nfor i, v := range collection"]

    B --> F["Classic iteration\nwith index control"]
    C --> G["Loop until\ncondition is false"]
    D --> H["Server loops\nevent loops"]
    E --> I["Slices, maps\nstrings, channels"]

    style A fill:#00ADD8,color:#fff
    style B fill:#10b981,color:#fff
    style C fill:#f59e0b,color:#fff
    style D fill:#ef4444,color:#fff
    style E fill:#8b5cf6,color:#fff
\`\`\`

## switch vs if/else Decision

\`\`\`mermaid
flowchart TD
    A["Need branching logic?"] --> B{"How many cases?"}
    B -->|"2-3"| C["Use if/else\nSimpler for few conditions"]
    B -->|"4+"| D["Use switch\nCleaner for many cases"]
    D --> E{"Comparing one variable?"}
    E -->|Yes| F["switch variable\ncase val1, val2:"]
    E -->|No| G["switch without condition\ncase expr1:\ncase expr2:"]

    style A fill:#00ADD8,color:#fff
    style F fill:#10b981,color:#fff
    style G fill:#f59e0b,color:#fff
\`\`\``,
            },
            {
                order: 4,
                title: 'Quiz: Operators & Control Flow',
                type: 'QUIZ',
                content: '## Test Your Knowledge',
                quizQuestions: [
                    {
                        order: 0, question: 'What is the result of 17 / 5 in Go (both are int)?',
                        options: [
                            { id: 'a', text: '3.4', isCorrect: false },
                            { id: 'b', text: '3', isCorrect: true },
                            { id: 'c', text: '4', isCorrect: false },
                            { id: 'd', text: 'Error', isCorrect: false },
                        ],
                        explanation: 'Integer division truncates in Go. 17 / 5 = 3 (not 3.4). For float result, use float64(17) / float64(5).',
                        difficulty: 'EASY', points: 5,
                    },
                    {
                        order: 1, question: 'Does Go have a ternary operator (? :)?',
                        options: [
                            { id: 'a', text: 'Yes, same as C', isCorrect: false },
                            { id: 'b', text: 'No, use if/else instead', isCorrect: true },
                            { id: 'c', text: 'Yes, but different syntax', isCorrect: false },
                            { id: 'd', text: 'Only in generics', isCorrect: false },
                        ],
                        explanation: 'Go deliberately has NO ternary operator. The designers felt if/else is clearer. Use: if cond { x = a } else { x = b }.',
                        difficulty: 'EASY', points: 5,
                    },
                    {
                        order: 2, question: 'What loop keywords does Go have?',
                        options: [
                            { id: 'a', text: 'for, while, do-while', isCorrect: false },
                            { id: 'b', text: 'for, foreach, while', isCorrect: false },
                            { id: 'c', text: 'Only for (handles all loop patterns)', isCorrect: true },
                            { id: 'd', text: 'for, loop, repeat', isCorrect: false },
                        ],
                        explanation: 'Go has ONLY the "for" keyword. It covers standard for, while-style, infinite loops, and range loops.',
                        difficulty: 'EASY', points: 5,
                    },
                    {
                        order: 3, question: 'What does switch do in Go without a break statement?',
                        options: [
                            { id: 'a', text: 'Falls through to the next case (like C)', isCorrect: false },
                            { id: 'b', text: 'Automatically breaks after each case', isCorrect: true },
                            { id: 'c', text: 'Throws an error', isCorrect: false },
                            { id: 'd', text: 'Runs all cases', isCorrect: false },
                        ],
                        explanation: 'Go switch does NOT fall through by default — each case automatically breaks. Use the "fallthrough" keyword explicitly if you need fall-through behavior.',
                        difficulty: 'MEDIUM', points: 10,
                    },
                    {
                        order: 4, question: 'What is special about if-init in Go?',
                        codeSnippet: 'if err := doSomething(); err != nil { ... }',
                        codeLanguage: 'go',
                        options: [
                            { id: 'a', text: 'It\'s a syntax error', isCorrect: false },
                            { id: 'b', text: 'err is scoped to the if/else block only', isCorrect: true },
                            { id: 'c', text: 'err is accessible everywhere', isCorrect: false },
                            { id: 'd', text: 'It runs doSomething twice', isCorrect: false },
                        ],
                        explanation: 'The if-init pattern: "if stmt; condition { }". Variables declared in the init statement are scoped to the if/else block, keeping the outer scope clean.',
                        difficulty: 'MEDIUM', points: 10,
                    },
                    {
                        order: 5, question: 'What does range return when iterating a map?',
                        options: [
                            { id: 'a', text: 'index, value', isCorrect: false },
                            { id: 'b', text: 'key, value', isCorrect: true },
                            { id: 'c', text: 'Just the key', isCorrect: false },
                            { id: 'd', text: 'Just the value', isCorrect: false },
                        ],
                        explanation: 'range on a map returns key, value pairs: for k, v := range myMap { }. Iteration order is random (not sorted).',
                        difficulty: 'EASY', points: 5,
                    },
                ],
            },
            {
                order: 5,
                title: 'Interview Questions: Control Flow',
                type: 'INTERVIEW_QUESTIONS',
                content: `# Interview Questions — Operators & Control Flow`,
                interviewCards: [
                    {
                        order: 0, category: 'Conceptual', difficulty: 'EASY',
                        question: 'Why does Go only have "for" and no "while" or "do-while"?',
                        answer: `Go's design philosophy is **simplicity**. Having one loop keyword that handles all patterns reduces cognitive load:\n\n\`\`\`go\n// Standard for\nfor i := 0; i < 10; i++ { }\n\n// While-style\nfor condition { }\n\n// Infinite loop\nfor { }\n\n// Range iteration\nfor i, v := range collection { }\n\`\`\`\n\nOne keyword, four patterns. No ambiguity about which loop to use.`,
                        tags: ['design-philosophy', 'loops'],
                    },
                    {
                        order: 1, category: 'Tricky', difficulty: 'MEDIUM',
                        question: 'How does Go switch differ from C/Java switch?',
                        answer: `**No automatic fall-through:** Go breaks after each case by default. Use \`fallthrough\` explicitly.\n\n**Multiple values per case:** \`case 1, 2, 3:\`\n\n**No constant requirement:** Cases can be expressions, not just constants.\n\n**Condition-less switch:** \`switch { case x > 0: ... }\` replaces if/else chains.\n\n**Type switch:** \`switch v := x.(type) { case int: ... }\` for runtime type checking.\n\nGo's switch is much more powerful and safer than C/Java's.`,
                        tags: ['switch', 'comparison'],
                    },
                    {
                        order: 2, category: 'Coding', difficulty: 'MEDIUM',
                        question: 'What is the if-init pattern and when would you use it?',
                        answer: `The if-init pattern combines variable declaration with a condition:\n\n\`\`\`go\nif num, err := strconv.Atoi(s); err != nil {\n    log.Println("Error:", err)\n} else {\n    fmt.Println("Parsed:", num)\n}\n// num and err are NOT accessible here\n\`\`\`\n\n**When to use:**\n- Error checking: \`if err := fn(); err != nil\`\n- Type assertions: \`if v, ok := m[key]; ok\`\n- Channel receives: \`if v, ok := <-ch; ok\`\n\nIt keeps variables tightly scoped — a core Go idiom.`,
                        codeSnippet: `if num, err := strconv.Atoi(s); err != nil {\n    log.Println("Error:", err)\n} else {\n    fmt.Println("Parsed:", num)\n}`,
                        codeLanguage: 'go',
                        tags: ['if-init', 'error-handling', 'idiom'],
                    },
                    {
                        order: 3, category: 'Tricky', difficulty: 'HARD',
                        question: 'What is a labeled break/continue and when is it needed?',
                        answer: `Labels allow break/continue to target an **outer loop** in nested loops:\n\n\`\`\`go\nouter:\nfor i := 0; i < 5; i++ {\n    for j := 0; j < 5; j++ {\n        if i*j > 10 {\n            break outer  // breaks the OUTER loop\n        }\n    }\n}\n\`\`\`\n\n**Without the label:** \`break\` only exits the inner loop.\n\n**Use cases:**\n- Searching in 2D structures\n- Breaking out of nested event loops\n- Early termination when a condition in an inner loop affects the outer loop`,
                        tags: ['labeled-loops', 'advanced'],
                    },
                ],
            },
            {
                order: 6,
                title: 'Summary: Operators & Control Flow',
                type: 'SUMMARY',
                keyTakeaways: [
                    'Go has standard arithmetic, comparison, logical, and bitwise operators',
                    'Integer division truncates — use float conversion for decimal results',
                    'No ternary operator — use if/else',
                    'if-init pattern scopes variables to the if/else block',
                    'switch auto-breaks, supports multiple values per case, and condition-less form',
                    'Go has ONLY "for" — it covers standard, while, infinite, and range loops',
                    'Labeled break/continue targets outer loops in nested loops',
                ],
                content: `# Summary — Operators & Control Flow

## Key Patterns

| Pattern | Go Syntax |
|---------|-----------|
| Standard loop | \`for i := 0; i < n; i++ { }\` |
| While loop | \`for condition { }\` |
| Infinite loop | \`for { }\` |
| Range loop | \`for i, v := range collection { }\` |
| if-init | \`if err := fn(); err != nil { }\` |
| Multi-case switch | \`case "a", "b", "c":\` |
| Condition-less switch | \`switch { case x > 0: ... }\` |

## Next Up

**Functions** — declarations, multiple returns, variadic functions, closures, and defer!`,
            },
        ],
    });

    console.log('✅ Golang Topic 3 seeded!');

    // ── Step 3: Create LearnPrerequisite links ──
    console.log('  🔗 Creating prerequisite links...');
    for (let i = 1; i < createdLearns.length; i++) {
        const prev = createdLearns[i - 1];
        const curr = createdLearns[i];
        if (prev && curr) {
            await prisma.learnPrerequisite.create({
                data: { learnId: curr.id, prerequisiteId: prev.id },
            }).catch(() => {});
        }
    }
    console.log(`  ✅ Created ${createdLearns.length - 1} prerequisite links`);

    // Update topic learn counts
    for (const t of topicDefs) {
        const count = await prisma.learn.count({ where: { topicId: topics[t.slug]?.id } });
        await prisma.learnTopic.update({
            where: { id: topics[t.slug]?.id },
            data: { learnCount: count },
        });
    }

    // Update subcategory learn count
    const totalCount = await prisma.learn.count({ where: { subCategoryId: golang.id } });
    await prisma.learnSubCategory.update({
        where: { id: golang.id },
        data: { learnCount: totalCount },
    });

    console.log(`\n✅ Golang Learn seeded: ${createdLearns.length} learns across ${topicDefs.length} topics`);
}