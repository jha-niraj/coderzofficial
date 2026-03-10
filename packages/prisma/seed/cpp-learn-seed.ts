import { prisma } from '@repo/prisma';

export async function seedCppLearnContent() {
    console.log('📚 Seeding C++ Learn Content...');

    const admin = await prisma.user.findFirst({ where: { role: 'Admin' } });
    if (!admin) { console.log('⚠️ No admin user found, skipping C++ seed'); return; }
    const creatorId = admin.id;

    // ── Step 0: Clean up existing C++ learns ──
    console.log('  🗑️ Cleaning existing C++ data...');
    const existingCpp = await prisma.learnSubCategory.findUnique({ where: { slug: 'cpp' } });
    if (existingCpp) {
        await prisma.learn.deleteMany({ where: { subCategoryId: existingCpp.id } });
        await prisma.learnTopic.deleteMany({ where: { subCategoryId: existingCpp.id } });
    }

    // ── Step 1: Categories ──
    const programming = await prisma.learnMainCategory.upsert({
        where: { slug: 'programming' },
        update: {},
        create: { slug: 'programming', name: 'Programming', description: 'Learn programming languages and fundamentals', icon: '💻', color: '#3B82F6', order: 1 },
    });

    const cpp = await prisma.learnSubCategory.upsert({
        where: { slug: 'cpp' },
        update: {},
        create: { slug: 'cpp', name: 'C++', description: 'Master C++ programming from basics to advanced concepts', mainCategoryId: programming.id, icon: '🔷', color: '#00599C', order: 1 },
    });

    // ── Step 2: Create LearnTopics (one per unit) ──
    const topicDefs = [
        { slug: 'cpp-unit1-basics', name: 'C++ Basics & Setup', description: 'Introduction, setup, first program, variables, types, I/O', icon: '🚀', order: 1 },
        { slug: 'cpp-unit2-control-functions', name: 'Control Structures & Functions', description: 'Loops, conditionals, functions basics and advanced', icon: '🔀', order: 2 },
        { slug: 'cpp-unit3-arrays-strings-memory', name: 'Arrays, Strings & Memory', description: 'Arrays, strings, pointers, dynamic memory', icon: '📦', order: 3 },
        { slug: 'cpp-unit4-oop', name: 'Object-Oriented Programming', description: 'Classes, inheritance, polymorphism, operator overloading', icon: '🏗️', order: 4 },
        { slug: 'cpp-unit5-stl', name: 'STL & Modern C++', description: 'Containers, algorithms, iterators, smart pointers, lambdas', icon: '📚', order: 5 },
        { slug: 'cpp-unit6-advanced', name: 'Advanced C++ & Interview Mastery', description: 'Templates, move semantics, concurrency, interview prep', icon: '🏆', order: 6 },
    ];
    const topics: Record<string, any> = {};
    for (const t of topicDefs) {
        topics[t.slug] = await prisma.learnTopic.create({
            data: { slug: t.slug, name: t.name, description: t.description, icon: t.icon, order: t.order, subCategoryId: cpp.id },
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
        }[];
    }) {
        globalOrder++;
        const topic = topics[data.topicSlug];

        const learn = await prisma.learn.create({
            data: {
                slug: data.slug, title: data.title, description: data.description,
                difficulty: data.difficulty as any, tags: data.tags,
                unitNumber: globalOrder, unitTitle: data.unitTitle,
                estimatedTime: data.estimatedTime, iconEmoji: data.iconEmoji, accentColor: '#00599C',
                status: 'PUBLISHED', publishedAt: new Date(), creatorId,
                mainCategoryId: programming.id, subCategoryId: cpp.id,
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
        }
        console.log(`  ✅ [${globalOrder}] ${data.title} (${data.steps.length} steps)`);
        createdLearns.push(learn);
        return learn;
    }

    // ═══════════════════════════════════════════════════════════════════
    // UNIT 1: C++ Basics & Setup
    // ═══════════════════════════════════════════════════════════════════

    await createLearn({
        slug: 'cpp-introduction-first-program',
        title: 'Introduction to C++ & Your First Program',
        description:
            'Understand what C++ is, why it matters, the compilation pipeline from source to executable, and write your first programs using iostream. Covers the evolution from C to modern C++23.',
        difficulty: 'BEGINNER',
        topicSlug: 'cpp-unit1-basics',
        unitTitle: 'Unit 1: C++ Basics & Setup',
        estimatedTime: 40,
        tags: ['introduction', 'hello-world', 'compilation', 'iostream', 'history', 'setup'],
        iconEmoji: '🚀',
        steps: [
            {
                order: 0,
                title: 'What is C++ and Why Learn It?',
                type: 'EXPLANATION',
                tips: [
                    'C++ powers operating systems, game engines, embedded systems, and financial trading platforms.',
                    'It gives you direct control over hardware, memory, and performance — no runtime overhead.',
                    'Understanding C++ makes every other language easier to learn.',
                ],
                content: `# What is C++?

C++ is a **general-purpose, compiled, statically-typed** programming language created by **Bjarne Stroustrup** in 1979 at Bell Labs as an extension of C.

---

## Why C++ Still Matters

| Domain | Why C++ |
|--------|---------|
| **Operating Systems** | Windows, Linux kernel modules, macOS internals |
| **Game Engines** | Unreal Engine, Unity internals, custom AAA engines |
| **Finance** | High-frequency trading (HFT), risk engines |
| **Embedded** | IoT devices, automotive ECUs, robotics |
| **Compilers/VMs** | GCC, LLVM/Clang, V8 (JavaScript engine) |

---

## C++ Evolution Timeline

| Standard | Year | Key Features |
|----------|------|-------------|
| C++98 | 1998 | STL, templates, exceptions |
| C++11 | 2011 | auto, lambdas, move semantics, smart pointers |
| C++14 | 2014 | Generic lambdas, relaxed constexpr |
| C++17 | 2017 | std::optional, structured bindings, filesystem |
| C++20 | 2020 | Concepts, ranges, coroutines, modules |
| C++23 | 2023 | std::expected, flat_map, print |

> Modern C++ (C++11 and beyond) is practically a different language from C++98.

---

## C++ vs Other Languages

| Feature | C++ | Python | Java |
|---------|-----|--------|------|
| Speed | ⚡ Native compiled | 🐢 Interpreted | ⚡ JIT compiled |
| Memory control | Manual + smart ptrs | Garbage collected | Garbage collected |
| Abstraction | Zero-cost | Runtime overhead | Runtime overhead |
| Use case | Systems, games, HPC | Scripts, ML, web | Enterprise, Android |

The key philosophy: **"You don't pay for what you don't use."**`,
            },
            {
                order: 1,
                title: 'The Compilation Pipeline',
                type: 'EXPLANATION',
                tips: [
                    'Preprocessing handles #include and #define BEFORE compilation.',
                    'The compiler turns each .cpp file into an object file (.o).',
                    'The linker combines all object files into the final executable.',
                ],
                content: `# How C++ Code Becomes an Executable

\`\`\`
Source Code (.cpp)
    │
    ▼ Preprocessor (#include, #define)
Preprocessed Code (.i)
    │
    ▼ Compiler (syntax check, optimization)
Assembly Code (.s)
    │
    ▼ Assembler
Object Code (.o / .obj)
    │
    ▼ Linker (combines .o files + libraries)
Executable (a.out / program.exe)
\`\`\`

---

## The Four Stages

### 1. Preprocessing
- Expands \`#include\` directives (copies header file content)
- Replaces \`#define\` macros
- Processes \`#ifdef\` / \`#ifndef\` conditional compilation

### 2. Compilation
- Checks syntax and type correctness
- Generates assembly code
- Applies optimizations (-O1, -O2, -O3)

### 3. Assembly
- Converts human-readable assembly to machine-code object files
- Each \`.cpp\` file → one \`.o\` file

### 4. Linking
- Resolves references between object files
- Links standard library functions (cout, cin, etc.)
- Produces the final binary

---

## Compiling from Command Line

\`\`\`bash
# Compile and link in one step
g++ main.cpp -o main

# Compile only (produce object file)
g++ -c main.cpp        # → main.o

# Link object files
g++ main.o utils.o -o program

# With warnings and C++17 standard
g++ -Wall -Wextra -std=c++17 main.cpp -o main
\`\`\`

> **Interview tip**: Always compile with \`-Wall -Wextra\`. It catches subtle bugs that would cost hours of debugging.`,
            },
            {
                order: 2,
                title: 'Your First C++ Program',
                type: 'CODE',
                tips: [
                    'Every C++ program starts execution from the main() function.',
                    'iostream provides cout (output) and cin (input) — the console I/O workhorses.',
                    'The << operator is called the insertion operator; >> is the extraction operator.',
                ],
                content: `# Hello, World!

The simplest C++ program that produces output:

\`\`\`cpp
#include <iostream>    // Standard I/O library

int main() {           // Entry point — every program needs this
    std::cout << "Hello, World!" << std::endl;
    return 0;          // 0 = success (convention)
}
\`\`\`

---

## Line-by-Line Breakdown

| Line | Purpose |
|------|---------|
| \`#include <iostream>\` | Includes the I/O stream library (preprocessor directive) |
| \`int main()\` | Defines the entry point; returns an int (exit code) |
| \`std::cout\` | Character output stream (writes to terminal) |
| \`<<\` | Insertion operator — "insert into the stream" |
| \`std::endl\` | Outputs a newline AND flushes the buffer |
| \`return 0\` | Tells the OS the program succeeded |

---

## Using \`namespace std\`

\`\`\`cpp
#include <iostream>
using namespace std;   // Avoid typing std:: everywhere

int main() {
    cout << "No more std:: prefix!" << endl;
    return 0;
}
\`\`\`

> ⚠️ **Best practice**: Avoid \`using namespace std;\` in header files — it pollutes the global namespace. It's acceptable in small \`.cpp\` files.

---

## Multiple Output

\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Name: " << "Alice" << endl;
    cout << "Age: " << 25 << endl;
    cout << "GPA: " << 3.85 << endl;

    // Chaining multiple values
    cout << "Line 1\\n" << "Line 2\\n" << "Line 3\\n";

    return 0;
}
\`\`\``,
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Hello World',
                        language: 'cpp',
                        code: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
                        explanation: 'The canonical first program. #include <iostream> provides std::cout for output.',
                        isRunnable: true,
                    },
                    {
                        order: 1,
                        title: 'Interactive Input/Output',
                        language: 'cpp',
                        code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string name;
    int age;

    cout << "Enter your name: ";
    getline(cin, name);

    cout << "Enter your age: ";
    cin >> age;

    cout << "Hello, " << name << "! You are " << age << " years old." << endl;
    return 0;
}`,
                        explanation: 'getline reads an entire line (including spaces). cin >> reads until whitespace.',
                        isRunnable: true,
                    },
                ],
            },
            {
                order: 3,
                title: 'C++ Introduction Visualization',
                type: 'VISUALIZATION',
                content: `# C++ Compilation Pipeline

\`\`\`mermaid
flowchart TD
    A["📝 Source Code<br/>.cpp files"] --> B["🔧 Preprocessor<br/>#include, #define"]
    B --> C["⚙️ Compiler<br/>Syntax check + optimize"]
    C --> D["📦 Assembler<br/>Machine code .o files"]
    D --> E["🔗 Linker<br/>Combine + resolve"]
    E --> F["🚀 Executable<br/>a.out / program.exe"]

    style A fill:#e0f2fe,stroke:#0284c7
    style B fill:#fef3c7,stroke:#f59e0b
    style C fill:#fce7f3,stroke:#ec4899
    style D fill:#e0e7ff,stroke:#6366f1
    style E fill:#d1fae5,stroke:#10b981
    style F fill:#dcfce7,stroke:#22c55e
\`\`\`

---

\`\`\`mermaid
graph LR
    subgraph "C++ Program Structure"
        A["#include directives"] --> B["using declarations"]
        B --> C["Function declarations"]
        C --> D["int main()"]
        D --> E["Function definitions"]
    end

    style A fill:#fef3c7,stroke:#f59e0b
    style D fill:#dcfce7,stroke:#22c55e
\`\`\``,
                tips: ['The preprocessor runs BEFORE the compiler even sees your code.', 'Each .cpp file is compiled independently — the linker resolves cross-file references.'],
            },
            {
                order: 4,
                title: 'Quiz: C++ Basics',
                type: 'QUIZ',
                content: 'Test your understanding of C++ fundamentals, compilation, and basic I/O.',
                stepData: {
                    questions: [
                        { question: 'Who created C++?', options: ['Dennis Ritchie', 'Bjarne Stroustrup', 'James Gosling', 'Guido van Rossum'], correctAnswer: 1, explanation: 'Bjarne Stroustrup created C++ at Bell Labs in 1979 as an extension of C.' },
                        { question: 'What does the preprocessor do?', options: ['Compiles code to machine language', 'Expands #include and #define directives', 'Links object files together', 'Runs the final executable'], correctAnswer: 1, explanation: 'The preprocessor handles directives like #include (copy header content) and #define (macro replacement) before compilation.' },
                        { question: 'What is the correct entry point for a C++ program?', options: ['void start()', 'int main()', 'public static void main()', 'def main():'], correctAnswer: 1, explanation: 'Every C++ program must have an int main() function as the entry point. It returns an integer exit code.' },
                        { question: 'What does std::endl do?', options: ['Only outputs a newline', 'Outputs a newline and flushes the buffer', 'Ends the program', 'Closes the output stream'], correctAnswer: 1, explanation: 'std::endl outputs a newline character AND flushes the output buffer. For just a newline without flushing, use "\\n".' },
                        { question: 'Which compiler flag enables all warnings?', options: ['-O2', '-Wall', '-std=c++17', '-g'], correctAnswer: 1, explanation: '-Wall enables most warning messages. Use -Wall -Wextra for even more thorough checking.' },
                        { question: 'What is the output type of main() in C++?', options: ['void', 'int', 'string', 'bool'], correctAnswer: 1, explanation: 'main() must return int. Return 0 for success, non-zero for error.' },
                        { question: 'Which header provides cout and cin?', options: ['<stdio.h>', '<iostream>', '<string>', '<cstdlib>'], correctAnswer: 1, explanation: '<iostream> provides std::cout (output), std::cin (input), and std::cerr (error output).' },
                        { question: 'What does the << operator do with cout?', options: ['Bit shift', 'Insert data into the output stream', 'Compare values', 'Assignment'], correctAnswer: 1, explanation: 'When used with cout, << is the insertion operator — it sends data into the output stream.' },
                        { question: 'What C++ standard introduced auto keyword for type inference?', options: ['C++98', 'C++11', 'C++17', 'C++20'], correctAnswer: 1, explanation: 'C++11 introduced auto for automatic type deduction, along with lambdas and move semantics.' },
                        { question: 'Why should you avoid "using namespace std;" in header files?', options: ['It slows down compilation', 'It pollutes the global namespace for all files that include the header', 'It causes syntax errors', 'It is deprecated'], correctAnswer: 1, explanation: 'Putting "using namespace std;" in a header forces it on every file that includes that header, risking name collisions.' },
                    ],
                },
            },
            {
                order: 5,
                title: 'Interview: C++ Basics',
                type: 'INTERVIEW_QUESTIONS',
                content: `# Interview Questions: C++ Introduction

## Q1: What is the difference between C and C++?
**Answer**: C is a procedural language; C++ supports both procedural and object-oriented paradigms. C++ adds classes, templates, exceptions, namespaces, references, and the STL. C++ is largely backward-compatible with C but not identical.

## Q2: Explain the C++ compilation process.
**Answer**: Four stages: (1) **Preprocessing** — expands macros and includes, (2) **Compilation** — converts to assembly, checks types, (3) **Assembly** — produces object files, (4) **Linking** — resolves symbols across object files and libraries to produce the executable.

## Q3: What is the difference between \\n and std::endl?
**Answer**: Both output a newline, but \`std::endl\` also **flushes the output buffer**. In performance-critical code, prefer \`"\\n"\` since frequent flushing is expensive. Use \`std::endl\` when you need to guarantee the output is visible immediately (e.g., before a crash-prone operation).

## Q4: What does "zero-cost abstraction" mean in C++?
**Answer**: Abstractions like templates and inline functions compile down to code that's as efficient as hand-written C. You don't pay runtime overhead for using higher-level constructs — the cost is paid at compile time.

## Q5: What is the difference between #include <...> and #include "..."?
**Answer**: \`<...>\` searches system/standard include paths first. \`"..."\` searches the current directory first, then falls back to system paths. Use angle brackets for standard library headers and quotes for your own headers.`,
                tips: ['C vs C++ is the #1 most asked C++ interview opener.', 'Always mention the "zero-cost abstraction" philosophy.'],
            },
            {
                order: 6,
                title: 'Summary: Introduction to C++',
                type: 'SUMMARY',
                content: `# Summary: Introduction to C++

## Key Concepts

- C++ is a **compiled, statically-typed, multi-paradigm** language
- Created by Bjarne Stroustrup (1979) as "C with Classes"
- Modern C++ (C++11+) introduced auto, lambdas, smart pointers, move semantics
- Compilation pipeline: **Preprocessing → Compilation → Assembly → Linking**
- Every program needs \`int main()\` as the entry point
- \`std::cout << value\` for output, \`std::cin >> variable\` for input
- \`#include <iostream>\` provides I/O functionality

## Common Pitfalls

- Forgetting \`#include\` directives → "undefined reference" errors
- Using \`using namespace std;\` in headers → namespace pollution
- Confusing \`\\n\` (just newline) with \`std::endl\` (newline + flush)
- Not returning 0 from main (though C++ allows omitting it since C++11)

> 🎯 **Next**: Variables, data types, and operators — the building blocks of every C++ program.`,
            },
        ],
    });

    await createLearn({
        slug: 'cpp-variables-types-io',
        title: 'Variables, Data Types & Input/Output',
        description:
            'Master C++ fundamental data types (int, double, char, bool, string), variable declaration and initialization, type casting, constants, and formatted I/O with cin/cout. Essential foundation for all C++ programming.',
        difficulty: 'BEGINNER',
        topicSlug: 'cpp-unit1-basics',
        unitTitle: 'Unit 1: C++ Basics & Setup',
        estimatedTime: 50,
        tags: ['variables', 'data-types', 'int', 'double', 'char', 'bool', 'string', 'const', 'casting', 'cin', 'cout'],
        iconEmoji: '📦',
        steps: [
            {
                order: 0,
                title: 'Fundamental Data Types',
                type: 'EXPLANATION',
                tips: [
                    'C++ is statically typed — every variable must have a declared type.',
                    'int is typically 4 bytes; size varies by platform. Use sizeof() to check.',
                    'Prefer int for whole numbers, double for decimals, bool for flags.',
                ],
                content: `# C++ Data Types

## Primitive Types Overview

| Type | Size (typical) | Range | Example |
|------|---------------|-------|---------|
| \`bool\` | 1 byte | true / false | \`bool isReady = true;\` |
| \`char\` | 1 byte | -128 to 127 | \`char grade = 'A';\` |
| \`int\` | 4 bytes | ±2.1 billion | \`int count = 42;\` |
| \`long long\` | 8 bytes | ±9.2 quintillion | \`long long big = 1e18;\` |
| \`float\` | 4 bytes | ~7 decimal digits | \`float pi = 3.14f;\` |
| \`double\` | 8 bytes | ~15 decimal digits | \`double pi = 3.14159265;\` |
| \`std::string\` | varies | dynamic | \`string name = "Alice";\` |

---

## Signed vs Unsigned

\`\`\`cpp
int x = -5;               // Signed (default) — can be negative
unsigned int y = 42;       // Unsigned — only non-negative values
unsigned int z = -1;       // ⚠️ Wraps around to 4294967295!
\`\`\`

> ⚠️ **Warning**: Mixing signed and unsigned in comparisons is a common source of bugs.

---

## The \`auto\` Keyword (C++11)

\`\`\`cpp
auto x = 42;          // int
auto pi = 3.14;       // double
auto name = "Alice"s; // std::string (with s suffix)
auto flag = true;     // bool
\`\`\`

The compiler deduces the type from the initializer. Use \`auto\` when the type is obvious or complex (e.g., iterators).`,
            },
            {
                order: 1,
                title: 'Variable Declaration & Initialization',
                type: 'CODE',
                tips: [
                    'Prefer initialization at declaration — uninitialized variables contain garbage.',
                    'Use {} (brace initialization) to catch narrowing conversions.',
                    'const variables must be initialized and cannot be reassigned.',
                ],
                content: `# Declaration vs Initialization

## Three Ways to Initialize

\`\`\`cpp
// 1. Copy initialization (C-style)
int x = 10;

// 2. Direct initialization
int y(20);

// 3. Uniform/brace initialization (C++11, PREFERRED)
int z{30};
\`\`\`

---

## Why Prefer Brace Initialization?

\`\`\`cpp
int a = 3.14;    // ⚠️ Silently truncates to 3
int b{3.14};     // ❌ COMPILE ERROR: narrowing conversion
int c{};         // ✅ Zero-initialized: c = 0
\`\`\`

Brace initialization prevents **narrowing conversions** — the compiler catches bugs for you.

---

## Constants

\`\`\`cpp
const int MAX_SIZE = 100;           // Runtime constant
constexpr int ARRAY_SIZE = 50;      // Compile-time constant (C++11)

const double PI = 3.14159265358979;
constexpr double TAU = 2 * PI;     // Evaluated at compile time

// MAX_SIZE = 200;  // ❌ Error: cannot modify const
\`\`\`

| Keyword | When | Use Case |
|---------|------|----------|
| \`const\` | Runtime | Values known at runtime |
| \`constexpr\` | Compile-time | Values known at compile-time |

---

## Scope Rules

\`\`\`cpp
int global = 100;  // Global scope

int main() {
    int local = 50;  // Function scope
    {
        int block = 25;  // Block scope
        // global, local, block all accessible
    }
    // block is DESTROYED here
    // global, local still accessible
}
\`\`\``,
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Data Types Demo',
                        language: 'cpp',
                        code: `#include <iostream>
#include <string>
#include <climits>
using namespace std;

int main() {
    // Fundamental types
    int age{25};
    double salary{75000.50};
    char grade{'A'};
    bool employed{true};
    string name{"Alice"};

    cout << "Name: " << name << endl;
    cout << "Age: " << age << endl;
    cout << "Salary: $" << salary << endl;
    cout << "Grade: " << grade << endl;
    cout << "Employed: " << boolalpha << employed << endl;

    // Size of types
    cout << "\\nSize of int: " << sizeof(int) << " bytes" << endl;
    cout << "Size of double: " << sizeof(double) << " bytes" << endl;
    cout << "Size of char: " << sizeof(char) << " byte" << endl;
    cout << "INT_MAX: " << INT_MAX << endl;
    cout << "INT_MIN: " << INT_MIN << endl;

    return 0;
}`,
                        explanation: 'Shows declaration, initialization, and sizeof for all fundamental types.',
                        isRunnable: true,
                    },
                ],
            },
            {
                order: 2,
                title: 'Type Casting & Conversions',
                type: 'EXPLANATION',
                tips: [
                    'Implicit conversions can silently lose data (double → int drops decimals).',
                    'Always use static_cast<> in C++ — never C-style casts in modern code.',
                    'Integer division truncates: 5/2 = 2. Cast one operand to double for decimal result.',
                ],
                content: `# Type Casting in C++

## Implicit Conversion (Automatic)

\`\`\`cpp
int x = 10;
double y = x;       // int → double (safe, no data loss)
int z = 3.99;       // double → int: z = 3 (TRUNCATED!)
char c = 65;        // int → char: c = 'A' (ASCII)
bool b = 42;        // int → bool: b = true (non-zero = true)
\`\`\`

---

## Explicit Casting

\`\`\`cpp
// C-style cast (AVOID in modern C++)
int a = (int)3.14;

// C++ static_cast (PREFERRED)
int b = static_cast<int>(3.14);

// Practical use: integer division fix
int x = 5, y = 2;
double result = static_cast<double>(x) / y;  // 2.5, not 2
\`\`\`

---

## The Four C++ Casts

| Cast | Purpose |
|------|---------|
| \`static_cast\` | Safe conversions between related types |
| \`dynamic_cast\` | Safe downcast in inheritance (checked at runtime) |
| \`const_cast\` | Add/remove const qualifier |
| \`reinterpret_cast\` | Low-level bit reinterpretation (dangerous) |

> For interviews: **static_cast** is what you use 95% of the time.`,
            },
            {
                order: 3,
                title: 'Formatted Input/Output',
                type: 'CODE',
                tips: [
                    'cin >> stops at whitespace; use getline() for full lines.',
                    'Mix of cin >> and getline() requires cin.ignore() to clear the newline.',
                    'Use <iomanip> for formatted output: setw, setprecision, fixed.',
                ],
                content: `# Input/Output in Depth

## Reading Input

\`\`\`cpp
int num;
cin >> num;              // Reads an integer (stops at whitespace)

string word;
cin >> word;             // Reads ONE word (stops at space)

string line;
getline(cin, line);      // Reads ENTIRE line (including spaces)
\`\`\`

## The cin.ignore() Gotcha

\`\`\`cpp
int age;
string name;

cout << "Age: ";
cin >> age;              // Reads 25, leaves '\\n' in buffer
cin.ignore();            // Clears the leftover '\\n'
cout << "Name: ";
getline(cin, name);      // Now works correctly
\`\`\`

Without \`cin.ignore()\`, getline reads the leftover newline and appears to "skip" input.

## Formatted Output with <iomanip>

\`\`\`cpp
#include <iomanip>

cout << fixed << setprecision(2);
cout << setw(10) << "Price" << setw(10) << "Qty" << endl;
cout << setw(10) << 29.99 << setw(10) << 5 << endl;
cout << setw(10) << 149.50 << setw(10) << 2 << endl;
\`\`\``,
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Input/Output Demo',
                        language: 'cpp',
                        code: `#include <iostream>
#include <string>
#include <iomanip>
using namespace std;

int main() {
    // Formatted output
    double price = 49.99;
    int quantity = 3;
    double total = price * quantity;

    cout << fixed << setprecision(2);
    cout << "Receipt:" << endl;
    cout << string(25, '-') << endl;
    cout << left << setw(15) << "Item Price:" << "$" << price << endl;
    cout << left << setw(15) << "Quantity:" << quantity << endl;
    cout << string(25, '-') << endl;
    cout << left << setw(15) << "Total:" << "$" << total << endl;

    return 0;
}`,
                        explanation: 'Demonstrates formatted output with alignment, precision, and fill characters.',
                        isRunnable: true,
                    },
                ],
            },
            {
                order: 4,
                title: 'Data Types Visualization',
                type: 'VISUALIZATION',
                content: `# C++ Type System

\`\`\`mermaid
graph TD
    A["C++ Types"] --> B["Fundamental"]
    A --> C["Compound"]

    B --> D["Integer Types<br/>bool, char, int,<br/>long, long long"]
    B --> E["Floating Point<br/>float, double,<br/>long double"]

    C --> F["Arrays<br/>int arr[10]"]
    C --> G["Pointers<br/>int* ptr"]
    C --> H["References<br/>int& ref"]
    C --> I["Classes/Structs"]

    style A fill:#f0f9ff,stroke:#0284c7
    style B fill:#dcfce7,stroke:#22c55e
    style C fill:#fef3c7,stroke:#f59e0b
    style D fill:#e0f2fe,stroke:#0ea5e9
    style E fill:#e0f2fe,stroke:#0ea5e9
\`\`\`

---

\`\`\`mermaid
graph LR
    subgraph "Type Sizes (typical 64-bit)"
        A["bool<br/>1 byte"] --- B["char<br/>1 byte"] --- C["int<br/>4 bytes"] --- D["long long<br/>8 bytes"] --- E["double<br/>8 bytes"]
    end

    style A fill:#dcfce7,stroke:#22c55e
    style B fill:#dcfce7,stroke:#22c55e
    style C fill:#e0f2fe,stroke:#0284c7
    style D fill:#e0e7ff,stroke:#6366f1
    style E fill:#fce7f3,stroke:#ec4899
\`\`\``,
                tips: ['The exact size of types is implementation-defined — use sizeof() to check.', 'Compound types are built from fundamental types.'],
            },
            {
                order: 5,
                title: 'Quiz: Variables & Data Types',
                type: 'QUIZ',
                content: 'Test your knowledge of C++ variables, types, and I/O.',
                stepData: {
                    questions: [
                        { question: 'What value does int x{3.14}; assign to x?', options: ['3', '3.14', 'Compile error — narrowing conversion', '0'], correctAnswer: 2, explanation: 'Brace initialization {} prevents narrowing conversions. int x{3.14} is a compile error because double → int loses data.' },
                        { question: 'What is the default value of an uninitialized local int variable?', options: ['0', 'null', 'Undefined (garbage value)', '-1'], correctAnswer: 2, explanation: 'Local variables in C++ are NOT automatically initialized. They contain whatever was previously in that memory location.' },
                        { question: 'Which keyword creates a compile-time constant?', options: ['const', 'constexpr', 'static', 'final'], correctAnswer: 1, explanation: 'constexpr guarantees evaluation at compile time. const can be a runtime constant.' },
                        { question: 'What does sizeof(char) always return in C++?', options: ['0', '1', '2', 'Platform-dependent'], correctAnswer: 1, explanation: 'The C++ standard guarantees sizeof(char) == 1. All other type sizes are defined relative to char.' },
                        { question: 'What happens with: int x = 5; double y = x / 2;', options: ['y = 2.5', 'y = 2.0', 'y = 2', 'Compile error'], correctAnswer: 1, explanation: '5/2 is integer division = 2, then 2 is implicitly converted to 2.0. To get 2.5, cast one operand: static_cast<double>(x)/2.' },
                        { question: 'Which function reads an entire line including spaces?', options: ['cin >>', 'scanf', 'getline(cin, str)', 'cin.read()'], correctAnswer: 2, explanation: 'getline(cin, string_var) reads everything until the newline character, including spaces.' },
                        { question: 'What is the difference between float and double?', options: ['float is larger', 'double has ~15 digits precision vs float ~7', 'They are identical', 'float is unsigned'], correctAnswer: 1, explanation: 'double is 8 bytes with ~15 decimal digits of precision. float is 4 bytes with only ~7 digits.' },
                        { question: 'What does boolalpha do with cout?', options: ['Makes bool output 0/1', 'Makes bool output true/false', 'Converts string to bool', 'Sorts boolean values'], correctAnswer: 1, explanation: 'boolalpha makes cout print "true"/"false" instead of "1"/"0" for boolean values.' },
                    ],
                },
            },
            {
                order: 6,
                title: 'Interview: Variables & Types',
                type: 'INTERVIEW_QUESTIONS',
                content: `# Interview Questions: Variables & Data Types

## Q1: What is the difference between const and constexpr?
**Answer**: \`const\` means the value cannot be changed after initialization — but it may be determined at runtime. \`constexpr\` guarantees the value is computed **at compile time**. Example: \`const int x = getSize();\` is valid but \`constexpr int x = getSize();\` only works if getSize() is also constexpr.

## Q2: What is a narrowing conversion and how do you prevent it?
**Answer**: A narrowing conversion loses data (e.g., \`double→int\`, \`int→char\`). Use **brace initialization** \`{}\` to prevent it — the compiler will emit an error instead of silently truncating.

## Q3: Explain the difference between cin >> and getline().
**Answer**: \`cin >>\` reads one token (stops at whitespace). \`getline(cin, str)\` reads the entire line until '\\n'. When mixing them, use \`cin.ignore()\` to clear the leftover newline from the buffer.

## Q4: What is the size of an int in C++?
**Answer**: The standard guarantees \`int\` is **at least 16 bits**. On most modern 32/64-bit systems, it's **4 bytes (32 bits)**. Use \`sizeof(int)\` for the exact size, or \`<cstdint>\` types like \`int32_t\` for guaranteed sizes.

## Q5: What are the risks of using unsigned integers?
**Answer**: Unsigned underflow wraps around (0u - 1 = 4294967295). Comparing signed and unsigned can produce unexpected results. The C++ Core Guidelines recommend using signed integers for most cases and unsigned only for bit manipulation or when interfacing with APIs that require it.`,
                tips: ['const vs constexpr is asked in virtually every C++ interview.', 'Know the sizeof guarantees from the standard.'],
            },
            {
                order: 7,
                title: 'Summary: Variables & Data Types',
                type: 'SUMMARY',
                content: `# Summary: Variables, Data Types & I/O

## Key Concepts

- C++ has **fundamental types** (int, double, char, bool) and **compound types** (arrays, pointers, classes)
- **Brace initialization** \`{}\` is preferred — it prevents narrowing conversions
- **const** = runtime constant, **constexpr** = compile-time constant
- **auto** lets the compiler deduce the type from the initializer
- **sizeof()** returns the size of a type in bytes
- **cin >>** reads tokens, **getline()** reads full lines

## Type Sizes (typical)

| Type | Bytes |
|------|-------|
| bool, char | 1 |
| short | 2 |
| int, float | 4 |
| long long, double | 8 |

## Common Mistakes

- Using uninitialized variables (undefined behavior)
- Integer division when you want decimal: \`5/2 = 2\`, not 2.5
- Mixing cin >> with getline without cin.ignore()
- Using unsigned for general arithmetic

> 🎯 **Next**: Operators and expressions — arithmetic, logical, bitwise, and the ternary operator.`,
            },
        ],
    });

    // ═══════════════════════════════════════════════════════════════════
    // UNIT 2: Control Structures & Functions
    // ═══════════════════════════════════════════════════════════════════

    await createLearn({
        slug: 'cpp-loops',
        title: 'Loops (for, while, do-while, range-based for, break, continue)',
        description:
            'Master all C++ loop constructs: the classic for loop, while loop, do-while loop, and the modern range-based for. Learn to control loop flow with break and continue. Each loop type is covered in depth with diagrams, code, and quizzes.',
        difficulty: 'BEGINNER',
        topicSlug: 'cpp-unit2-control-functions',
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
        topicSlug: 'cpp-unit2-control-functions',
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
        topicSlug: 'cpp-unit2-control-functions',
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
        topicSlug: 'cpp-unit3-arrays-strings-memory',
        unitTitle: 'Unit 3: Arrays, Strings & Memory',
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
        topicSlug: 'cpp-unit3-arrays-strings-memory',
        unitTitle: 'Unit 3: Arrays, Strings & Memory',
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

    // ═══════════════════════════════════════════════════════════════════
    // UNIT 4: Object-Oriented Programming (OOP)
    // ═══════════════════════════════════════════════════════════════════


    // ═══════════════════════════════════════════════════════════════════════════════
    // TOPIC 1: cpp-classes-objects
    // ═══════════════════════════════════════════════════════════════════════════════

    await createLearn({
        slug: 'cpp-classes-objects',
        title: 'Classes and Objects',
        description:
            'Understand the pillars of Object-Oriented Programming: what a class is, how to define attributes and methods, the difference between public and private access specifiers, how to instantiate objects, and the difference between dot and arrow member access.',
        difficulty: 'BEGINNER',
        topicSlug: 'cpp-unit4-oop',
        unitTitle: 'Unit 4: Object-Oriented Programming',
        estimatedTime: 55,
        tags: ['classes', 'objects', 'OOP', 'attributes', 'methods', 'public', 'private', 'access-specifiers'],
        iconEmoji: '🏗️',
        steps: [

            // ─────────────────────────────────────────────────────────────────────
            // SECTION A: Why OOP? The Paradigm Shift
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 0,
                title: 'Why OOP? The Paradigm Shift',
                type: 'EXPLANATION',
                tips: [
                    'OOP models code after real-world entities — a BankAccount object BEHAVES like a real bank account.',
                    'The four pillars of OOP are: Encapsulation, Abstraction, Inheritance, and Polymorphism.',
                    'Think of a class as a blueprint and an object as a house built from that blueprint.',
                ],
                content: `# Why Object-Oriented Programming?

    ## The Procedural Problem

    Imagine building a banking system the procedural way:

    \`\`\`cpp
    // Procedural — data is separate from the logic that uses it
    string accountName = "Alice";
    double balance = 5000.0;
    int accountNumber = 12345;

    void deposit(double& bal, double amount) { bal += amount; }
    void withdraw(double& bal, double amount) { bal -= amount; }
    void printBalance(string name, double bal) {
        cout << name << ": $" << bal << endl;
    }
    \`\`\`

    Now imagine 1000 accounts. You'd need 3000 variables and pass them all around manually. One typo — wrong variable name — and the data gets corrupted.

    ---

    ## The OOP Solution: Bundle Data + Behaviour Together

    \`\`\`cpp
    class BankAccount {
        string owner;     // DATA (attributes)
        double balance;
    public:
        void deposit(double amount)  { balance += amount; }  // BEHAVIOUR (methods)
        void withdraw(double amount) { balance -= amount; }
        void print() { cout << owner << ": $" << balance; }
    };

    BankAccount alice;  // One object — data and behaviour in one package
    BankAccount bob;    // Another object — completely independent
    \`\`\`

    ---

    ## The Four Pillars of OOP

    | Pillar | What It Means |
    |--------|--------------|
    | **Encapsulation** | Bundle data + methods; hide internal details |
    | **Abstraction** | Expose only what's needed; hide complexity |
    | **Inheritance** | Build new classes on top of existing ones |
    | **Polymorphism** | One interface, many implementations |

    We'll cover all four in this unit. Let's start with the foundation: **Classes and Objects**.

    ---

    ## Class vs Object: Blueprint vs House

    \`\`\`
    CLASS                          OBJECTS (instances of that class)
    ──────────────────────────     ──────────────────────────────────
    class Dog {                    Dog myDog;       → name="Buddy", age=3
        string name;               Dog yourDog;     → name="Max",   age=5
        int age;                   Dog neighborDog; → name="Luna",  age=1
        void bark();
    };

    The class is the BLUEPRINT.
    Each object is a separate INSTANCE with its own copy of the data.
    \`\`\`

    > 💡 **Analogy**: A cookie cutter is the class. Each cookie you cut is an object. Same shape (blueprint), different dough (data).`,
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION B: Defining a Class
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 1,
                title: 'Defining a Class — Syntax & Structure',
                type: 'EXPLANATION',
                tips: [
                    'Class definitions end with a semicolon after the closing brace: `};` — this is unique to class/struct definitions.',
                    'By default, all members of a `class` are private. All members of a `struct` are public.',
                    'Member functions defined inside the class body are implicitly inline.',
                ],
                content: `# Defining a Class in C++

    ## Full Class Syntax

    \`\`\`cpp
    class ClassName {
        // access specifier (private by default if omitted)
    private:
        // Attributes — data the class holds
        type attributeName;

    public:
        // Methods — functions the class can perform
        returnType methodName(parameters);
    };  // ← semicolon is REQUIRED here!
    \`\`\`

    ---

    ## A Concrete Example: The Rectangle Class

    \`\`\`cpp
    class Rectangle {
    private:
        // Attributes: internal data (hidden from outside)
        double width;
        double height;

    public:
        // Methods: define the behaviour of Rectangle objects

        // Setter methods — set the dimensions
        void setWidth(double w)  { width = w; }
        void setHeight(double h) { height = h; }

        // Getter methods — read the dimensions
        double getWidth()  { return width; }
        double getHeight() { return height; }

        // Computed properties
        double area()      { return width * height; }
        double perimeter() { return 2 * (width + height); }

        // Action method
        void print() {
            cout << "Rectangle " << width << "x" << height
                 << "  area=" << area() << endl;
        }
    };
    \`\`\`

    ---

    ## Attributes vs Methods

    | | Attributes | Methods |
    |-|-----------|---------|
    | **What** | Data the object stores | Actions the object can perform |
    | **Also called** | Member variables, fields | Member functions, behaviors |
    | **Example** | \`double width;\` | \`double area() { return width*height; }\` |
    | **Usually** | private | public |

    ---

    ## The \`this\` Pointer (Preview)

    Inside any method, \`this\` is a pointer to the current object:

    \`\`\`cpp
    class Rectangle {
    private:
        double width;
    public:
        void setWidth(double width) {
            this->width = width; // "this->width" = the attribute
                                  // "width" alone = the parameter
        }
    };
    \`\`\`

    \`this\` is how you distinguish between an attribute and a parameter with the same name.`,
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION C: Access Specifiers — public vs private
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 2,
                title: 'Access Specifiers: public vs private',
                type: 'EXPLANATION',
                tips: [
                    'The golden rule: make data PRIVATE, make the interface (methods) PUBLIC.',
                    'Private members can be accessed by the class\'s own methods — just not from outside code.',
                    'There is a third specifier `protected` — used with inheritance (covered later).',
                ],
                content: `# Access Specifiers: public vs private

    ## Why Access Control?

    Imagine a car's engine. You interact with it through the **steering wheel, pedals, and gear lever** (public interface). You do NOT directly rewire the fuel injectors yourself (private internals).

    Access specifiers in C++ enforce this same principle.

    ---

    ## The Three Access Specifiers

    | Specifier | Accessible From |
    |-----------|----------------|
    | \`public\` | Anywhere — inside the class AND from outside code |
    | \`private\` | Only inside the class's own methods |
    | \`protected\` | Inside the class AND inside derived (child) classes |

    ---

    ## private: Hiding the Data

    \`\`\`cpp
    class BankAccount {
    private:
        double balance;   // HIDDEN — cannot be accessed directly from outside

    public:
        void deposit(double amount) {
            if (amount > 0) balance += amount; // ✅ methods can touch private data
        }

        double getBalance() { return balance; } // ✅ controlled read access
    };

    int main() {
        BankAccount acc;
        acc.balance = 1000000; // ❌ COMPILE ERROR! balance is private
        acc.deposit(500);       // ✅ Use the public method instead
        cout << acc.getBalance(); // ✅ Controlled read via getter
    }
    \`\`\`

    ---

    ## public: The Interface

    \`\`\`cpp
    class Circle {
    private:
        double radius;    // Hidden implementation detail

    public:
        // Public interface — what users of the class can do
        void setRadius(double r) {
            if (r > 0) radius = r;  // validation possible here!
            else radius = 0;
        }
        double getRadius()       { return radius; }
        double area()            { return 3.14159 * radius * radius; }
        double circumference()   { return 2 * 3.14159 * radius; }
    };
    \`\`\`

    ---

    ## Default Access: class vs struct

    \`\`\`cpp
    class Foo {
        int x; // PRIVATE by default in class
    };

    struct Bar {
        int x; // PUBLIC by default in struct
    };
    \`\`\`

    In C++, \`class\` and \`struct\` are nearly identical — the only difference is the **default access specifier**. Conventionally, \`struct\` is used for plain data, \`class\` for objects with behaviour.`,
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION D: Code — First Full Class
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 3,
                title: 'Code: Your First Complete Class',
                type: 'CODE',
                content: '## Building a Complete Class from Scratch\n\nLet\'s build a `BankAccount` class with private data, public methods, and validation — then create and use multiple objects.',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'BankAccount Class — Full Implementation',
                        language: 'cpp',
                        code: `#include <iostream>
    #include <string>
    #include <iomanip>
    using namespace std;

    // ─────────────────────────────────────────────────────────────────────
    // CLASS DEFINITION
    // ─────────────────────────────────────────────────────────────────────
    class BankAccount {
    private:
        // Internal state — hidden from the outside world
        string ownerName;
        double balance;
        int    transactionCount;

    public:
        // ── Setters (mutators) ───────────────────────────────────────────
        void setOwner(string name)   { ownerName = name; }

        void setBalance(double amt) {
            // Validation: reject negative initial balance
            balance = (amt >= 0) ? amt : 0;
        }

        // ── Getters (accessors) ──────────────────────────────────────────
        string getOwner()   { return ownerName; }
        double getBalance() { return balance; }
        int    getTransactions() { return transactionCount; }

        // ── Core behaviours ──────────────────────────────────────────────
        void deposit(double amount) {
            if (amount <= 0) {
                cout << "  ⚠️  Deposit amount must be positive." << endl;
                return;
            }
            balance += amount;
            transactionCount++;
            cout << "  ✅ Deposited $" << fixed << setprecision(2) << amount << endl;
        }

        void withdraw(double amount) {
            if (amount <= 0) {
                cout << "  ⚠️  Withdrawal amount must be positive." << endl;
            } else if (amount > balance) {
                cout << "  ❌ Insufficient funds! Balance: $"
                     << fixed << setprecision(2) << balance << endl;
            } else {
                balance -= amount;
                transactionCount++;
                cout << "  ✅ Withdrew $" << fixed << setprecision(2) << amount << endl;
            }
        }

        void printStatement() {
            cout << "┌────────────────────────────────┐" << endl;
            cout << "│  Account Owner: " << left << setw(16) << ownerName << "│" << endl;
            cout << "│  Balance:       $"
                 << right << setw(12) << fixed << setprecision(2) << balance << " │" << endl;
            cout << "│  Transactions:  " << left << setw(15) << transactionCount << "│" << endl;
            cout << "└────────────────────────────────┘" << endl;
        }
    };

    // ─────────────────────────────────────────────────────────────────────
    // MAIN — Creating and Using Objects
    // ─────────────────────────────────────────────────────────────────────
    int main() {
        // Create two completely independent BankAccount objects
        BankAccount alice;
        alice.setOwner("Alice Smith");
        alice.setBalance(1000.00);

        BankAccount bob;
        bob.setOwner("Bob Jones");
        bob.setBalance(500.00);

        cout << "=== Alice's Transactions ===" << endl;
        alice.deposit(250.00);
        alice.withdraw(75.50);
        alice.withdraw(2000.00);  // Should fail — insufficient funds
        alice.printStatement();

        cout << endl;

        cout << "=== Bob's Transactions ===" << endl;
        bob.deposit(100.00);
        bob.deposit(-50.00); // Should fail — invalid amount
        bob.withdraw(200.00);
        bob.printStatement();

        return 0;
    }`,
                        explanation: 'Two independent `BankAccount` objects — `alice` and `bob` — each have their own copies of `ownerName`, `balance`, and `transactionCount`. Changes to one do not affect the other. The `private` members are protected with validation in the setter and `withdraw` methods.',
                        highlightLines: [10, 11, 12, 13, 17, 21, 27, 34, 44, 63, 68],
                        isRunnable: true,
                    },
                    {
                        order: 1,
                        title: 'Student Class — Multiple Objects',
                        language: 'cpp',
                        code: `#include <iostream>
    #include <string>
    using namespace std;

    class Student {
    private:
        string name;
        int    studentId;
        double gpa;
        int    creditHours;

    public:
        // Setters with validation
        void setName(string n)       { name = n; }
        void setId(int id)           { studentId = id; }
        void setGpa(double g)        { gpa = (g >= 0 && g <= 4.0) ? g : 0; }
        void setCreditHours(int c)   { creditHours = (c >= 0) ? c : 0; }

        // Getters
        string getName()      { return name; }
        double getGpa()       { return gpa; }
        int    getCreditHours() { return creditHours; }

        // Computed behavior
        string getStanding() {
            if (creditHours >= 90) return "Senior";
            if (creditHours >= 60) return "Junior";
            if (creditHours >= 30) return "Sophomore";
            return "Freshman";
        }

        bool isHonorsEligible() {
            return gpa >= 3.5 && creditHours >= 12;
        }

        void printInfo() {
            cout << "Student #" << studentId
                 << " | " << name
                 << " | GPA: " << gpa
                 << " | " << getStanding()
                 << (isHonorsEligible() ? " ⭐ Honors" : "")
                 << endl;
        }
    };

    int main() {
        // Array of Student objects!
        Student students[3];

        students[0].setName("Alice");  students[0].setId(1001);
        students[0].setGpa(3.8);       students[0].setCreditHours(95);

        students[1].setName("Bob");    students[1].setId(1002);
        students[1].setGpa(2.9);       students[1].setCreditHours(45);

        students[2].setName("Carol");  students[2].setId(1003);
        students[2].setGpa(3.6);       students[2].setCreditHours(15);

        cout << "=== Student Report ===" << endl;
        for (int i = 0; i < 3; i++) {
            students[i].printInfo();
        }

        return 0;
    }`,
                        explanation: 'An array of `Student` objects demonstrates that each object stores its own data independently. The `getStanding()` and `isHonorsEligible()` methods compute values based on the object\'s own private attributes.',
                        highlightLines: [6, 46, 48, 52, 56, 60],
                        isRunnable: true,
                    },
                ],
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION E: Instantiation & Member Access
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 4,
                title: 'Creating Objects & Member Access (. and ->)',
                type: 'EXPLANATION',
                tips: [
                    'Use the dot operator `.` to access members of an object on the stack.',
                    'Use the arrow operator `->` to access members through a pointer to an object.',
                    '`ptr->method()` is exactly equivalent to `(*ptr).method()` — arrow is just shorthand.',
                ],
                content: `# Creating Objects (Instantiation)

    ## Stack Objects — The Dot Operator \`.\`

    \`\`\`cpp
    // Declare on the stack — automatically destroyed when out of scope
    Rectangle r;           // Object created; attributes are uninitialized
    r.setWidth(10.0);      // Access methods with dot operator
    r.setHeight(5.0);
    cout << r.area();      // dot operator for member access
    \`\`\`

    ---

    ## Heap Objects — The Arrow Operator \`->\`

    \`\`\`cpp
    // Allocate on the heap with new — must manually delete!
    Rectangle* ptr = new Rectangle();  // ptr is a POINTER to a Rectangle
    ptr->setWidth(10.0);     // arrow operator = (*ptr).setWidth(10.0)
    ptr->setHeight(5.0);
    cout << ptr->area();
    delete ptr;              // MUST free heap memory
    ptr = nullptr;
    \`\`\`

    ---

    ## Dot vs Arrow: Side by Side

    \`\`\`
    Stack object:                    Heap object (pointer):
    ─────────────────────────────    ──────────────────────────────
    Rectangle r;                     Rectangle* p = new Rectangle();
    r.setWidth(5);      // dot        p->setWidth(5);   // arrow
    r.area();                        (*p).area();       // equivalent
                                     delete p;
    \`\`\`

    ---

    ## Multiple Objects are Completely Independent

    \`\`\`cpp
    Rectangle r1, r2, r3;     // Three separate objects
    r1.setWidth(5);   r1.setHeight(3);   // r1: 5×3
    r2.setWidth(10);  r2.setHeight(2);   // r2: 10×2
    r3.setWidth(7);   r3.setHeight(7);   // r3: 7×7

    cout << r1.area(); // 15
    cout << r2.area(); // 20
    cout << r3.area(); // 49  — each object has its own data!
    \`\`\`

    ---

    ## Object Size in Memory

    Each object gets its own copy of all **attributes**, but **methods are shared** (stored once in the code segment):

    \`\`\`
    Memory Layout for two Rectangle objects:

    r1: [ width=5.0 | height=3.0 ]   ← 16 bytes (two doubles)
    r2: [ width=10.0| height=2.0 ]   ← 16 bytes (two doubles)

    Methods (area, perimeter, etc.) — stored ONCE in the code segment
      shared by ALL Rectangle objects
    \`\`\``,
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION F: Visual — OOP Mental Model
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 5,
                title: 'Visual: Class Blueprint → Object Instances',
                type: 'VISUAL',
                content: `# OOP: From Blueprint to Objects

    ## The Class as a Blueprint

    \`\`\`
    CLASS Dog  (the BLUEPRINT — exists once in code)
    ┌─────────────────────────────────────────────────┐
    │  PRIVATE attributes:                            │
    │    string name;                                 │
    │    string breed;                                │
    │    int    age;                                  │
    │                                                 │
    │  PUBLIC methods:                                │
    │    void  setName(string n)                      │
    │    void  setAge(int a)                          │
    │    string getName()                             │
    │    void  bark()                                 │
    │    bool  isAdult()    ← age >= 2                │
    └─────────────────────────────────────────────────┘
    \`\`\`

    ## Three Object Instances (Each Has Its Own Data)

    \`\`\`
    Object: dog1                Object: dog2               Object: dog3
    ┌──────────────────────┐    ┌──────────────────────┐   ┌──────────────────────┐
    │ name  = "Buddy"      │    │ name  = "Max"         │   │ name  = "Luna"       │
    │ breed = "Labrador"   │    │ breed = "Poodle"      │   │ breed = "Beagle"     │
    │ age   = 3            │    │ age   = 7             │   │ age   = 1            │
    │                      │    │                       │   │                      │
    │ [uses Dog methods]   │    │ [uses Dog methods]    │   │ [uses Dog methods]   │
    └──────────────────────┘    └──────────────────────┘   └──────────────────────┘
           ▲                            ▲                           ▲
           │                            │                           │
           └────────────────────────────┴───────────────────────────┘
                      All share the SAME method code (stored once)
    \`\`\`

    ---

    ## Access Specifier Wall

    \`\`\`
    OUTSIDE CODE                │  INSIDE CLASS METHODS
    (main, other functions)     │  (can access everything)
    ────────────────────────────┼──────────────────────────────────
                                │
      acc.deposit(100) ─────────┼──► deposit() executes
                                │      balance += 100  ← OK! (private, but inside class)
      acc.balance = 9999 ───────┼──► ❌ COMPILE ERROR
                                │      balance is private!
                                │
                        PUBLIC  │ PRIVATE
                       methods  │ attributes
                      are the   │ are protected
                      "doors"   │ behind the wall
    \`\`\`

    ---

    ## Dot vs Arrow Memory Diagram

    \`\`\`
    STACK object (dot operator):    HEAP object (arrow operator):

    Stack Memory:                   Stack Memory:   Heap Memory:
    ┌──────────────┐                ┌───────────┐   ┌──────────────┐
    │ Rectangle r  │                │ ptr ──────┼──►│ Rectangle    │
    │  width=10    │                │ (0x200)   │   │  width=10    │
    │  height=5    │                └───────────┘   │  height=5    │
    └──────────────┘                                └──────────────┘
      r.area()                        ptr->area()      (*ptr).area()
      (direct access)                 (via pointer)    (equivalent)
    \`\`\``,
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION G: Quiz
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 6,
                title: 'Quiz: Classes and Objects',
                type: 'QUIZ',
                content: '## Test Your Understanding of Classes and Objects',
                stepData: {
                    questions: [
                        {
                            question: 'What is the difference between a class and an object?',
                            options: [
                                { id: 'a', text: 'They are the same thing', isCorrect: false },
                                { id: 'b', text: 'A class is the blueprint/template; an object is a specific instance created from that class', isCorrect: true },
                                { id: 'c', text: 'An object is the blueprint; a class is the instance', isCorrect: false },
                                { id: 'd', text: 'A class stores data; an object stores methods', isCorrect: false },
                            ],
                            explanation: 'A class defines the structure and behavior (the blueprint). An object is a specific instance of that class, with its own data. Multiple objects can be created from one class.',
                        },
                        {
                            question: 'What is the default access specifier for members of a `class` in C++?',
                            options: [
                                { id: 'a', text: 'public', isCorrect: false },
                                { id: 'b', text: 'protected', isCorrect: false },
                                { id: 'c', text: 'private', isCorrect: true },
                                { id: 'd', text: 'internal', isCorrect: false },
                            ],
                            explanation: 'In a `class`, all members are `private` by default. In a `struct`, all members are `public` by default. This is the only difference between class and struct in C++.',
                        },
                        {
                            question: 'Can a private member of a class be accessed from outside the class?',
                            options: [
                                { id: 'a', text: 'Yes, always', isCorrect: false },
                                { id: 'b', text: 'Yes, but only with a special keyword', isCorrect: false },
                                { id: 'c', text: 'No — private members are only accessible within the class\'s own methods', isCorrect: true },
                                { id: 'd', text: 'Yes, if the class is in the same file', isCorrect: false },
                            ],
                            explanation: 'Private members are strictly accessible only within the class itself (its own methods). Any attempt to access them from outside code causes a compile error.',
                        },
                        {
                            question: 'Which operator do you use to access a member of an object through a POINTER?',
                            options: [
                                { id: 'a', text: 'Dot operator `.`', isCorrect: false },
                                { id: 'b', text: 'Arrow operator `->`', isCorrect: true },
                                { id: 'c', text: 'Dereference `*`', isCorrect: false },
                                { id: 'd', text: 'Double colon `::`', isCorrect: false },
                            ],
                            explanation: '`ptr->method()` accesses a member through a pointer. It is equivalent to `(*ptr).method()`. The dot `.` is used for direct (stack) objects.',
                        },
                        {
                            question: 'If two `Dog` objects `d1` and `d2` are created from the same class, what is true about their attribute data?',
                            options: [
                                { id: 'a', text: 'They share the same data — changing d1.name changes d2.name', isCorrect: false },
                                { id: 'b', text: 'Each object has its own independent copy of all attributes', isCorrect: true },
                                { id: 'c', text: 'Attributes are shared, but methods are separate', isCorrect: false },
                                { id: 'd', text: 'Only the first object created has real data', isCorrect: false },
                            ],
                            explanation: 'Every object gets its own copy of all attribute data. Methods are stored once (in the code segment) and shared, but attribute data is per-instance.',
                        },
                        {
                            question: 'What is the syntax mistake in: `class Rectangle { double width; }` ?',
                            options: [
                                { id: 'a', text: 'Rectangle should be lowercase', isCorrect: false },
                                { id: 'b', text: 'width needs to be public', isCorrect: false },
                                { id: 'c', text: 'Missing semicolon after the closing brace: `};`', isCorrect: true },
                                { id: 'd', text: 'double is not a valid type', isCorrect: false },
                            ],
                            explanation: 'Class definitions must end with a semicolon after the closing brace: `};`. Forgetting the semicolon is a very common compile error for beginners.',
                        },
                        {
                            question: 'What does the `this` pointer refer to inside a class method?',
                            options: [
                                { id: 'a', text: 'The class definition itself', isCorrect: false },
                                { id: 'b', text: 'A pointer to the current object that the method is being called on', isCorrect: true },
                                { id: 'c', text: 'The parent class', isCorrect: false },
                                { id: 'd', text: 'The first argument passed to the method', isCorrect: false },
                            ],
                            explanation: '`this` is an implicit pointer inside every non-static member function that points to the specific object the method was invoked on. Used to disambiguate between attributes and parameters with the same name.',
                        },
                    ],
                },
            },

            // ─────────────────────────────────────────────────────────────────────
            // CHALLENGE
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 7,
                title: 'Challenge: Build a Library Book Class',
                type: 'CHALLENGE',
                content: `## 🏆 Challenge: Library System

    Design a \`Book\` class for a library catalog system.

    **Required private attributes:**
    - \`title\` (string)
    - \`author\` (string)
    - \`isbn\` (string)
    - \`pageCount\` (int)
    - \`isCheckedOut\` (bool)

    **Required public methods:**
    - Setters and getters for each attribute
    - \`checkOut()\` — marks book as checked out (only if currently available)
    - \`returnBook()\` — marks book as returned
    - \`getStatus()\` — returns "Available" or "Checked Out"
    - \`printInfo()\` — formatted display of all book details

    **In main:**
    - Create 3 Book objects with different data
    - Check out 2 of them
    - Try to check out an already-checked-out book (should show an error)
    - Print info for all 3 books`,
                stepData: {
                    starterCode: `#include <iostream>
    #include <string>
    using namespace std;

    class Book {
    private:
        // TODO: declare private attributes
        // string title, author, isbn
        // int pageCount
        // bool isCheckedOut

    public:
        // TODO: setters
        // TODO: getters
        // TODO: checkOut()     — prints error if already checked out
        // TODO: returnBook()
        // TODO: getStatus()    — returns "Available" or "Checked Out"
        // TODO: printInfo()    — formatted display
    };

    int main() {
        // TODO: create 3 Book objects and test all methods
        return 0;
    }`,
                    solution: `#include <iostream>
    #include <string>
    #include <iomanip>
    using namespace std;

    class Book {
    private:
        string title;
        string author;
        string isbn;
        int    pageCount;
        bool   isCheckedOut;

    public:
        // ── Setters ─────────────────────────────────────────────────────
        void setTitle(string t)      { title = t; }
        void setAuthor(string a)     { author = a; }
        void setIsbn(string i)       { isbn = i; }
        void setPageCount(int p)     { pageCount = (p > 0) ? p : 0; }
        void setCheckedOut(bool c)   { isCheckedOut = c; }

        // ── Getters ─────────────────────────────────────────────────────
        string getTitle()     { return title; }
        string getAuthor()    { return author; }
        string getIsbn()      { return isbn; }
        int    getPageCount() { return pageCount; }
        bool   getCheckedOut(){ return isCheckedOut; }

        // ── Behaviors ───────────────────────────────────────────────────
        void checkOut() {
            if (isCheckedOut) {
                cout << "  ❌ \"" << title << "\" is already checked out!" << endl;
            } else {
                isCheckedOut = true;
                cout << "  ✅ \"" << title << "\" has been checked out." << endl;
            }
        }

        void returnBook() {
            if (!isCheckedOut) {
                cout << "  ⚠️  \"" << title << "\" was not checked out." << endl;
            } else {
                isCheckedOut = false;
                cout << "  ✅ \"" << title << "\" has been returned." << endl;
            }
        }

        string getStatus() {
            return isCheckedOut ? "Checked Out" : "Available";
        }

        void printInfo() {
            cout << "┌──────────────────────────────────────┐" << endl;
            cout << "│ Title:    " << left << setw(28) << title  << "│" << endl;
            cout << "│ Author:   " << left << setw(28) << author << "│" << endl;
            cout << "│ ISBN:     " << left << setw(28) << isbn   << "│" << endl;
            cout << "│ Pages:    " << left << setw(28) << pageCount << "│" << endl;
            cout << "│ Status:   " << left << setw(28) << getStatus() << "│" << endl;
            cout << "└──────────────────────────────────────┘" << endl;
        }
    };

    int main() {
        Book b1, b2, b3;

        b1.setTitle("The C++ Programming Language");
        b1.setAuthor("Bjarne Stroustrup");
        b1.setIsbn("978-0321563842");
        b1.setPageCount(1376);
        b1.setCheckedOut(false);

        b2.setTitle("Clean Code");
        b2.setAuthor("Robert C. Martin");
        b2.setIsbn("978-0132350884");
        b2.setPageCount(431);
        b2.setCheckedOut(false);

        b3.setTitle("Design Patterns");
        b3.setAuthor("Gang of Four");
        b3.setIsbn("978-0201633610");
        b3.setPageCount(395);
        b3.setCheckedOut(false);

        cout << "=== Checking Out Books ===" << endl;
        b1.checkOut();
        b2.checkOut();
        b2.checkOut(); // Try to check out again — should error

        cout << "\\n=== Library Catalog ===" << endl;
        b1.printInfo();
        b2.printInfo();
        b3.printInfo();

        cout << "\\n=== Returning a Book ===" << endl;
        b1.returnBook();
        cout << "b1 status: " << b1.getStatus() << endl;

        return 0;
    }`,
                    hints: [
                        'Declare all attributes as private, then add public getter and setter methods for each.',
                        'In `checkOut()`, first check if `isCheckedOut` is already true — if so, print an error. Otherwise set it to true.',
                        '`getStatus()` can use a ternary: `return isCheckedOut ? "Checked Out" : "Available";`',
                        'Initialize `isCheckedOut` to `false` via `setCheckedOut(false)` — or use a constructor (covered next topic!).',
                        'For `printInfo()`, use `setw()` from `<iomanip>` to align output neatly.',
                    ],
                    language: 'cpp',
                },
            },

            // ─────────────────────────────────────────────────────────────────────
            // SUMMARY
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 8,
                title: 'Summary: Classes and Objects',
                type: 'SUMMARY',
                content: `# Summary: Classes and Objects

    ## Core Concepts

    | Concept | What It Means |
    |---------|--------------|
    | **Class** | A blueprint defining attributes and methods |
    | **Object** | A specific instance of a class, with its own data |
    | **Attribute** | Data a class stores (member variable) |
    | **Method** | Behaviour a class can perform (member function) |
    | **Instantiation** | Creating an object from a class |

    ## Access Specifiers

    \`\`\`
    private  → accessible ONLY within the class's own methods
    public   → accessible from anywhere
    protected→ accessible within class + derived classes (for inheritance)
    \`\`\`

    **Golden rule**: Make attributes **private**, make the interface (methods) **public**.

    ## Syntax Reminders

    \`\`\`cpp
    class MyClass {        // class definition
    private:
        int x;             // private attribute
    public:
        void setX(int v) { x = v; } // public method
    };                     // ← don't forget the semicolon!

    MyClass obj;           // stack object — use DOT operator
    obj.setX(5);

    MyClass* ptr = new MyClass(); // heap object — use ARROW operator
    ptr->setX(5);
    delete ptr;
    \`\`\`

    ## Member Access

    | Object Type | Syntax | Example |
    |-------------|--------|---------|
    | Stack object | dot \`.\` | \`obj.method()\` |
    | Pointer to object | arrow \`->\` | \`ptr->method()\` |
    | Dereferenced pointer | dot \`.\` | \`(*ptr).method()\` |

    ## Why OOP?

    - **Reusability**: Define once, create many objects
    - **Encapsulation**: Data hidden and protected behind a public interface
    - **Organisation**: Related data and functions live together
    - **Validation**: Setters can enforce rules before changing private data

    > 🎯 **Next up**: Constructors & Destructors — automatic initialization and cleanup of objects!`,
            },
        ],
    });

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOPIC 2: cpp-constructors
    // ═══════════════════════════════════════════════════════════════════════════════

    await createLearn({
        slug: 'cpp-constructors',
        title: 'Constructors & Destructors',
        description:
            'Master the full constructor lifecycle in C++: default constructors, parameterized constructors, member initializer lists, copy constructors, and destructors. Understand when each is called and how they control object creation and cleanup.',
        difficulty: 'BEGINNER',
        topicSlug: 'cpp-unit4-oop',
        unitTitle: 'Unit 4: Object-Oriented Programming',
        estimatedTime: 55,
        tags: ['constructors', 'destructors', 'default-constructor', 'parameterized-constructor', 'copy-constructor', 'initializer-list', 'RAII'],
        iconEmoji: '🔨',
        steps: [

            // ─────────────────────────────────────────────────────────────────────
            // SECTION A: The Problem — Uninitialized Objects
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 0,
                title: 'The Initialization Problem',
                type: 'EXPLANATION',
                tips: [
                    'Constructors are called AUTOMATICALLY when an object is created — you never call them manually.',
                    'A class can have multiple constructors (constructor overloading).',
                    'If you define ANY constructor, the compiler no longer generates a default constructor for you.',
                ],
                content: `# The Initialization Problem

    ## The Danger of Uninitialized Objects

    Remember our \`BankAccount\` class? There's a critical problem:

    \`\`\`cpp
    BankAccount alice;
    alice.deposit(100); // ← What is balance BEFORE this?
    // balance is uninitialized — could be garbage: -9274583.2 or 0 or anything!
    \`\`\`

    In the previous topic, we had to manually call setters:
    \`\`\`cpp
    alice.setOwner("Alice");
    alice.setBalance(0);
    alice.setTransactions(0);
    // What if the programmer forgets one of these? 🐛
    \`\`\`

    ---

    ## The Solution: Constructors

    A **constructor** is a special method that is **called automatically** when an object is created. Its job is to initialize all attributes to valid starting values.

    \`\`\`cpp
    class BankAccount {
    private:
        string owner;
        double balance;
    public:
        // Constructor — called automatically on object creation
        BankAccount() {
            owner   = "Unknown";  // guaranteed initialization
            balance = 0.0;
        }
    };

    BankAccount alice; // Constructor runs automatically here!
    // alice.owner  = "Unknown"  ← set by constructor
    // alice.balance = 0.0       ← set by constructor
    \`\`\`

    ---

    ## Constructor Rules

    | Rule | Detail |
    |------|--------|
    | **Same name as the class** | Constructor is named \`BankAccount\`, not \`init\` |
    | **No return type** | Not even \`void\` — it returns nothing |
    | **Called automatically** | You never call \`alice.BankAccount()\` |
    | **Can be overloaded** | Multiple constructors with different parameters |
    | **Cannot be const** | They're modifying the object being created |`,
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION B: Default Constructor
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 1,
                title: 'Default Constructor',
                type: 'EXPLANATION',
                tips: [
                    'The compiler-generated default constructor does NOT zero-initialize primitive types (int, double) — they contain garbage.',
                    'Always explicitly write a default constructor that gives every attribute a sensible initial value.',
                    'A default constructor takes NO arguments: `ClassName() { ... }`',
                ],
                content: `# The Default Constructor

    ## What is a Default Constructor?

    A **default constructor** takes **no parameters**. It is called when you create an object without providing any arguments:

    \`\`\`cpp
    MyClass obj;           // calls default constructor
    MyClass* p = new MyClass(); // calls default constructor on heap
    \`\`\`

    ---

    ## Compiler-Generated vs User-Written

    \`\`\`cpp
    // If you write NO constructor at all:
    class Broken {
        int x;   // ← not initialized! Contains random garbage
    };
    Broken b;    // b.x is ??? (undefined behaviour to use it)

    // Write your own default constructor:
    class Fixed {
        int x;
    public:
        Fixed() {  // ← default constructor
            x = 0; // ← guaranteed safe initialization
        }
    };
    Fixed f;     // f.x is guaranteed to be 0
    \`\`\`

    ---

    ## Member Initializer List (Preferred Syntax)

    Instead of assigning inside the body, use an **initializer list** — faster and required for \`const\` members and references:

    \`\`\`cpp
    class Rectangle {
    private:
        double width;
        double height;

    public:
        // Body assignment (works, but slower for complex types)
        Rectangle() {
            width  = 0.0;
            height = 0.0;
        }

        // Member initializer list (preferred — faster, more idiomatic)
        Rectangle() : width(0.0), height(0.0) {
            // body can be empty or do additional setup
        }
    };
    \`\`\`

    The \`: width(0.0), height(0.0)\` part is the **member initializer list** — it initializes members **before** the constructor body runs.

    ---

    ## Why Initializer Lists?

    1. **Efficiency** — direct initialization, no copy assignment
    2. **Required for \`const\` members** — const cannot be assigned in the body
    3. **Required for references** — references must be initialized, not assigned
    4. **Matches member declaration order** — initializers run in the order members are declared, regardless of order in the list`,
            },

            {
                order: 2,
                title: 'Default Constructor — Code',
                type: 'CODE',
                content: '## Default Constructors in Practice',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Default Constructor with Initializer List',
                        language: 'cpp',
                        code: `#include <iostream>
    #include <string>
    using namespace std;

    class Player {
    private:
        string name;
        int    health;
        int    score;
        int    level;

    public:
        // Default constructor — initializer list syntax (preferred)
        Player() : name("Unknown Player"), health(100), score(0), level(1) {
            // Body can be empty when all init is done in the list
            cout << "  [Player created with defaults]" << endl;
        }

        // Methods
        void takeDamage(int dmg) {
            health = max(0, health - dmg);
        }

        void addScore(int pts) {
            score += pts;
            if (score >= level * 1000) {
                level++;
                cout << "  🎉 Level up! Now level " << level << endl;
            }
        }

        void printStatus() {
            cout << "Player: " << name
                 << " | HP: " << health
                 << " | Score: " << score
                 << " | Level: " << level << endl;
        }

        void setName(string n) { name = n; }
    };

    int main() {
        cout << "Creating players..." << endl;
        Player p1;   // Default constructor called automatically
        Player p2;   // Another independent object

        p1.setName("Alice");
        p2.setName("Bob");

        p1.addScore(500);
        p1.addScore(600);  // Should level up at 1000
        p1.takeDamage(30);

        p2.addScore(200);
        p2.takeDamage(80);

        cout << "\n=== Game Status ===" << endl;
        p1.printStatus();
        p2.printStatus();

        return 0;
    }`,
                        explanation: 'The default constructor runs automatically when `Player p1;` is created. The member initializer list sets all four attributes before the body runs. Each player object is independent — Alice and Bob have separate health/score/level.',
                        highlightLines: [12, 13, 14],
                        isRunnable: true,
                    },
                ],
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION C: Parameterized Constructor
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 3,
                title: 'Parameterized Constructor',
                type: 'EXPLANATION',
                tips: [
                    'Parameterized constructors enable objects to be initialized with specific values at creation time.',
                    'Having multiple constructors (default + parameterized) is constructor overloading.',
                    'If you define a parameterized constructor but no default constructor, `MyClass obj;` will cause a compile error.',
                ],
                content: `# Parameterized Constructors

    ## Creating Objects with Custom Initial Values

    A **parameterized constructor** accepts arguments, allowing objects to be created with specific initial state:

    \`\`\`cpp
    class Rectangle {
    private:
        double width, height;
    public:
        // Parameterized constructor
        Rectangle(double w, double h) : width(w), height(h) { }
    };

    // Now you can create initialized objects in one line!
    Rectangle r1(10.0, 5.0);   // width=10, height=5
    Rectangle r2(3.5, 7.2);    // width=3.5, height=7.2
    Rectangle r3(6.0, 6.0);    // width=6, height=6 (square)
    \`\`\`

    ---

    ## Constructor Overloading: Multiple Constructors

    You can have both default and parameterized constructors in the same class:

    \`\`\`cpp
    class Point {
    private:
        double x, y;
    public:
        // Default constructor — origin (0, 0)
        Point() : x(0.0), y(0.0) { }

        // Parameterized — specific coordinates
        Point(double x, double y) : x(x), y(y) { }

        // Single value — same for both axes
        Point(double val) : x(val), y(val) { }
    };

    Point origin;          // calls default:       (0, 0)
    Point corner(3.0, 4.0); // calls parameterized: (3, 4)
    Point diagonal(5.0);   // calls single-value:  (5, 5)
    \`\`\`

    ---

    ## Default Parameter Values in Constructors

    You can combine a default and parameterized constructor using default argument values:

    \`\`\`cpp
    class Circle {
    private:
        double radius;
        string color;
    public:
        // One constructor handles both cases
        Circle(double r = 1.0, string c = "red")
            : radius(r), color(c) { }
    };

    Circle c1;             // radius=1.0, color="red"  (all defaults)
    Circle c2(5.0);        // radius=5.0, color="red"  (default color)
    Circle c3(3.0, "blue"); // radius=3.0, color="blue" (no defaults used)
    \`\`\`

    ---

    ## \`this\` in Constructors

    When parameter names clash with attribute names, use \`this->\`:

    \`\`\`cpp
    class Person {
        string name;
        int age;
    public:
        Person(string name, int age) {
            this->name = name; // this->name = attribute, name = parameter
            this->age  = age;
        }
        // Alternatively, use different names or initializer lists:
        // Person(string n, int a) : name(n), age(a) { }
    };
    \`\`\``,
            },

            {
                order: 4,
                title: 'Parameterized Constructor — Code',
                type: 'CODE',
                content: '## Parameterized Constructors in Practice',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Multiple Constructors — Constructor Overloading',
                        language: 'cpp',
                        code: `#include <iostream>
    #include <string>
    #include <cmath>
    using namespace std;

    class Point {
    private:
        double x, y;

    public:
        // ── Constructor 1: Default — creates origin (0, 0) ───────────────
        Point() : x(0.0), y(0.0) {
            cout << "  Point() → (0, 0)" << endl;
        }

        // ── Constructor 2: Parameterized — specific coordinates ──────────
        Point(double x, double y) : x(x), y(y) {
            cout << "  Point(" << x << ", " << y << ") created" << endl;
        }

        // ── Constructor 3: Single value — point on diagonal ──────────────
        explicit Point(double val) : x(val), y(val) {
            // 'explicit' prevents: Point p = 5.0; (accidental conversion)
            cout << "  Point(" << val << ", " << val << ") [diagonal]" << endl;
        }

        // Methods
        double distanceTo(const Point& other) const {
            double dx = x - other.x;
            double dy = y - other.y;
            return sqrt(dx*dx + dy*dy);
        }

        void print() const {
            cout << "  (" << x << ", " << y << ")" << endl;
        }

        double getX() const { return x; }
        double getY() const { return y; }
    };

    int main() {
        cout << "Creating points..." << endl;
        Point origin;              // Constructor 1
        Point corner(3.0, 4.0);   // Constructor 2
        Point diag(Point(5.0));   // Constructor 3 (explicit)

        cout << "\nCoordinates:" << endl;
        cout << "origin:"; origin.print();
        cout << "corner:"; corner.print();
        cout << "diag:  "; diag.print();

        cout << "\nDistances:" << endl;
        cout << "origin to corner: " << origin.distanceTo(corner) << endl; // should be 5
        cout << "origin to diag:   " << origin.distanceTo(diag)   << endl;

        // Array of Points — all call the default constructor
        cout << "\nArray of points (default ctor):" << endl;
        Point grid[3];
        grid[0] = Point(1.0, 2.0);
        grid[1] = Point(3.0, 4.0);
        grid[2] = Point(5.0, 6.0);

        return 0;
    }`,
                        explanation: 'Three overloaded constructors for the same class. The compiler picks the right one based on arguments. `explicit` prevents accidental implicit conversions — `Point p = 5.0` would cause a compile error with `explicit`, requiring `Point p(5.0)` instead.',
                        highlightLines: [11, 17, 22, 47, 48, 49],
                        isRunnable: true,
                    },
                ],
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION D: Copy Constructor
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 5,
                title: 'Copy Constructor',
                type: 'EXPLANATION',
                tips: [
                    'The compiler generates a default copy constructor that does a shallow (member-by-member) copy.',
                    'If your class owns heap memory (raw pointers), you MUST write a custom copy constructor for a deep copy — otherwise two objects point to the same memory.',
                    'The copy constructor signature is always: `ClassName(const ClassName& other)`.',
                ],
                content: `# The Copy Constructor

    ## What is a Copy Constructor?

    The **copy constructor** creates a new object as a copy of an existing object. It is called when:

    1. You initialize an object with another: \`Point p2 = p1;\`
    2. You pass an object by value to a function: \`f(myObj);\`
    3. A function returns an object by value: \`return myObj;\`

    ---

    ## Compiler-Generated Copy Constructor

    If you don't write one, the compiler generates a **memberwise (shallow) copy**:

    \`\`\`cpp
    class Point {
        double x, y;
    public:
        Point(double x, double y) : x(x), y(y) { }
        // Compiler generates:
        // Point(const Point& other) : x(other.x), y(other.y) { }
    };

    Point p1(3.0, 4.0);
    Point p2 = p1;  // Copy constructor called
    // p2.x = 3.0, p2.y = 4.0 — independent copies of primitive types
    \`\`\`

    For simple classes with only primitive types, the compiler's copy constructor is fine.

    ---

    ## When Shallow Copy Breaks: The Pointer Problem

    \`\`\`cpp
    class DynamicArray {
    private:
        int* data;    // pointer to heap-allocated array
        int  size;
    public:
        DynamicArray(int n) : size(n) {
            data = new int[n]; // allocate heap memory
        }
        ~DynamicArray() { delete[] data; } // free it
    };

    DynamicArray a1(5);
    DynamicArray a2 = a1; // compiler's shallow copy!

    // Now BOTH a1.data and a2.data point to the SAME heap array!
    // When a2 is destroyed → delete[] called → heap freed
    // When a1 is destroyed → delete[] called on SAME address → CRASH! (double free)
    \`\`\`

    ---

    ## Writing a Deep Copy Constructor

    \`\`\`cpp
    class DynamicArray {
    private:
        int* data;
        int  size;
    public:
        DynamicArray(int n) : size(n), data(new int[n]) {
            for (int i = 0; i < n; i++) data[i] = 0;
        }

        // Deep copy constructor — allocates NEW memory
        DynamicArray(const DynamicArray& other) : size(other.size) {
            data = new int[size];                    // NEW allocation
            for (int i = 0; i < size; i++)
                data[i] = other.data[i];             // copy the VALUES
        }

        ~DynamicArray() { delete[] data; }
    };

    DynamicArray a1(5);
    DynamicArray a2 = a1; // Deep copy — a2.data is a NEW array with same values
    // Now a1 and a2 have SEPARATE heap memory — safe!
    \`\`\`

    ---

    ## Rule of Three / Rule of Five

    If your class needs a **custom destructor** (because it manages resources), it almost certainly also needs:
    - Custom **copy constructor**
    - Custom **copy assignment operator**

    This is the **Rule of Three**. Modern C++ adds move constructor and move assignment → **Rule of Five**.`,
            },

            {
                order: 6,
                title: 'Copy Constructor — Code',
                type: 'CODE',
                content: '## Copy Constructors: Shallow vs Deep Copy',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Shallow Copy Danger vs Deep Copy Safety',
                        language: 'cpp',
                        code: `#include <iostream>
    #include <string>
    using namespace std;

    // ─── CLASS WITH PROPER DEEP COPY ──────────────────────────────────────
    class TextBuffer {
    private:
        char* buffer;    // raw heap memory
        int   capacity;

    public:
        // Regular constructor
        TextBuffer(const char* text, int cap) : capacity(cap) {
            buffer = new char[capacity];
            // Copy the text into our buffer
            int i = 0;
            while (text[i] != '\\0' && i < capacity - 1) {
                buffer[i] = text[i];
                i++;
            }
            buffer[i] = '\\0'; // null-terminate
            cout << "  Constructed: \"" << buffer << "\"" << endl;
        }

        // DEEP COPY CONSTRUCTOR — allocates its own heap memory
        TextBuffer(const TextBuffer& other) : capacity(other.capacity) {
            buffer = new char[capacity];              // NEW allocation!
            for (int i = 0; i < capacity; i++)
                buffer[i] = other.buffer[i];          // copy each byte
            cout << "  Deep-copied: \"" << buffer << "\"" << endl;
        }

        // Destructor — frees heap memory
        ~TextBuffer() {
            cout << "  Destroyed: \"" << buffer << "\"" << endl;
            delete[] buffer;
            buffer = nullptr;
        }

        void setChar(int index, char c) {
            if (index >= 0 && index < capacity - 1) buffer[index] = c;
        }

        void print() const { cout << "  Buffer: \"" << buffer << "\"" << endl; }
    };

    // ─── SIMPLE CLASS WITH COMPILER-GENERATED COPY ─────────────────────
    class Vector2D {
    public:
        double x, y;

        Vector2D(double x, double y) : x(x), y(y) { }
        // Compiler generates: Vector2D(const Vector2D& o) : x(o.x), y(o.y) { }
        // This is FINE because x and y are primitives, not pointers!

        void print() const {
            cout << "  (" << x << ", " << y << ")" << endl;
        }
    };

    int main() {
        cout << "=== Primitive members — compiler copy is fine ===" << endl;
        Vector2D v1(3.0, 4.0);
        Vector2D v2 = v1;       // shallow copy is fine for primitives
        v2.x = 99.0;            // modifying v2 does NOT affect v1
        cout << "v1: "; v1.print(); // (3, 4) — unchanged
        cout << "v2: "; v2.print(); // (99, 4)

        cout << "\\n=== Heap memory — deep copy is essential ===" << endl;
        {
            TextBuffer t1("Hello", 20);  // create t1
            TextBuffer t2 = t1;          // deep copy constructor called
            t2.setChar(0, 'J');          // modify t2's buffer
            cout << "After modifying t2:" << endl;
            t1.print();  // Still "Hello" — t1 unaffected!
            t2.print();  // "Jello"
        } // Both destructors called safely — separate heap buffers

        return 0;
    }`,
                        explanation: 'For `Vector2D` with primitive members, the compiler\'s shallow copy works perfectly. For `TextBuffer` which owns heap memory, we write a deep copy constructor that allocates separate memory — so modifying `t2` doesn\'t corrupt `t1`, and both destructors can safely `delete[]` their own buffers.',
                        highlightLines: [24, 25, 26, 27, 28, 34, 35, 36],
                        isRunnable: true,
                    },
                ],
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION E: Destructor
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 7,
                title: 'Destructors — Automatic Cleanup',
                type: 'EXPLANATION',
                tips: [
                    'The destructor is called automatically — you never call `obj.~MyClass()` manually.',
                    'Stack objects are destroyed in REVERSE order of creation (LIFO).',
                    'A destructor takes NO parameters and has NO return type. There is exactly ONE destructor per class.',
                ],
                content: `# Destructors

    ## What is a Destructor?

    A **destructor** is the mirror of a constructor — it is called **automatically** when an object's lifetime ends. It performs **cleanup** work: releasing memory, closing files, freeing resources.

    \`\`\`cpp
    class MyClass {
    public:
        MyClass()  { /* constructor — setup   */ }
        ~MyClass() { /* destructor — teardown */ }
        //  ↑
        // tilde prefix = destructor
    };
    \`\`\`

    ---

    ## When is the Destructor Called?

    | Scenario | When Destroyed |
    |----------|---------------|
    | Stack object | When it goes out of scope (end of \`{}\` block) |
    | Heap object (\`new\`) | When you call \`delete\` on the pointer |
    | Function parameter (by value) | When the function returns |
    | Temporary object | At the end of the statement |

    ---

    ## Stack Destruction Order (LIFO)

    \`\`\`cpp
    {
        MyClass a; // ← created first
        MyClass b; // ← created second
        MyClass c; // ← created third
        // ... scope ends here
        // c destroyed first (LIFO)
        // b destroyed second
        // a destroyed last
    }
    \`\`\`

    ---

    ## RAII: Resource Acquisition Is Initialization

    The most important pattern in C++: acquire resources in the constructor, release them in the destructor. Objects manage their own lifetime of resources.

    \`\`\`cpp
    class FileGuard {
        FILE* file;
    public:
        FileGuard(const char* path) {
            file = fopen(path, "r");  // acquire the resource
        }
        ~FileGuard() {
            if (file) fclose(file);   // GUARANTEED release — even if exception thrown!
        }
    };

    {
        FileGuard f("data.txt");  // file opened
        // ... use f ...
    }   // FileGuard destructor runs automatically — file GUARANTEED closed
    // No leak possible, even if an exception occurred!
    \`\`\`

    ---

    ## Destructor Rules

    1. **Same name as class, prefixed with \`~\`**: \`~BankAccount()\`
    2. **No return type, no parameters**
    3. **Called automatically** — never manually
    4. **Only one** destructor per class (unlike constructors)
    5. **Must be public** (unless you have a good reason to make it private/protected)`,
            },

            {
                order: 8,
                title: 'Constructors & Destructors — Visual Lifecycle',
                type: 'VISUAL',
                content: `# Object Lifecycle: Constructor → Methods → Destructor

    ## Full Object Lifetime on the Stack

    \`\`\`
    void playGame() {
        Player p("Alice", 100);   ← Constructor called
        //       │
        //       │ p lives here, usable
        //       │
        p.takeDamage(30);
        p.addScore(500);
        p.printStatus();
        //       │
    }  //        └── Destructor called automatically (scope ends)

    Timeline:
    ────────────────────────────────────────────────────────
      Create  │──── Object is alive and usable ────│  Destroy
      (ctor)  │   call methods, read/write data     │  (dtor)
    \`\`\`

    ---

    ## Constructor Overloading Decision Tree

    \`\`\`
    Object creation:  MyClass obj ???

      No arguments?      → Default constructor:      MyClass()
      Some arguments?    → Parameterized:            MyClass(int x, ...)
      Another object?    → Copy constructor:         MyClass(const MyClass& o)
      With new on heap?  → Same constructors, but via new keyword
    \`\`\`

    ---

    ## Member Initializer List: Before vs After Body

    \`\`\`
    Constructor with initializer list:

      Rectangle(double w, double h) : width(w), height(h) {
      //                              ^^^^^^^^^^^^^^^^^^^
      //                              Members initialized HERE
      //                              BEFORE the body runs
          // body runs after all members are initialized
      }

    Execution order:
      1. Memory allocated for the object
      2. Member initializer list executed (left to right, declaration order)
      3. Constructor body executes
      4. Object is now fully initialized and usable
    \`\`\`

    ---

    ## Stack vs Heap Object Lifecycle

    \`\`\`
    STACK OBJECT:                    HEAP OBJECT:
    ─────────────────────────────    ──────────────────────────────────
    {                                MyClass* p = new MyClass(args);
        MyClass obj(args);           │
        │                            │ p lives until you delete it!
        │ obj lives until }          │ (even past the scope where created)
        │                            │
    }   ← destructor auto-called     delete p; ← destructor called HERE
                                     p = nullptr;

    Danger: If you forget delete p → memory leak!
            If you delete p twice   → double-free crash!
    \`\`\`

    ---

    ## RAII Pattern — Visualized

    \`\`\`
    Resource:  [  File / Memory / Socket / Lock  ]

    Without RAII:           With RAII (constructor/destructor):
    ─────────────────────   ─────────────────────────────────
    open(file)              {
    use(file)                   FileGuard g("file.txt");  ← constructor opens
    // forgot close()!          use(g);
    // FILE LEAKED! 🐛         }  ← destructor GUARANTEES close
                            even if an exception happens mid-function ✅
    \`\`\``,
            },

            // ─────────────────────────────────────────────────────────────────────
            // QUIZ
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 9,
                title: 'Quiz: Constructors & Destructors',
                type: 'QUIZ',
                content: '## Test Your Understanding',
                stepData: {
                    questions: [
                        {
                            question: 'When is a constructor called?',
                            options: [
                                { id: 'a', text: 'Only when you explicitly call obj.constructor()', isCorrect: false },
                                { id: 'b', text: 'Automatically when an object is created', isCorrect: true },
                                { id: 'c', text: 'Only for heap objects created with new', isCorrect: false },
                                { id: 'd', text: 'When the object is first used in code', isCorrect: false },
                            ],
                            explanation: 'Constructors are called automatically at the moment of object creation — both for stack objects (`MyClass obj;`) and heap objects (`new MyClass()`).',
                        },
                        {
                            question: 'What is the return type of a constructor?',
                            options: [
                                { id: 'a', text: 'void', isCorrect: false },
                                { id: 'b', text: 'The class type (e.g., MyClass)', isCorrect: false },
                                { id: 'c', text: 'No return type at all — not even void', isCorrect: true },
                                { id: 'd', text: 'int (success/failure code)', isCorrect: false },
                            ],
                            explanation: 'Constructors have no return type — not even `void`. This is one of the key syntactic differences that distinguishes them from regular methods.',
                        },
                        {
                            question: 'What is the member initializer list syntax?',
                            options: [
                                { id: 'a', text: 'Assignments in the constructor body: `{ x = 5; }`', isCorrect: false },
                                { id: 'b', text: 'A colon after the parameter list before the body: `MyClass() : x(5), y(0) { }`', isCorrect: true },
                                { id: 'c', text: '`initialize(x = 5, y = 0);` inside the body', isCorrect: false },
                                { id: 'd', text: '`MyClass() { init: x(5), y(0); }`', isCorrect: false },
                            ],
                            explanation: 'The member initializer list follows a colon `:` after the parameter list and before the `{` body. Format: `ClassName(params) : member1(val1), member2(val2) { }`',
                        },
                        {
                            question: 'When is the copy constructor called?',
                            options: [
                                { id: 'a', text: 'When you call `obj.copy()`', isCorrect: false },
                                { id: 'b', text: 'When initializing an object with another object of the same type, or passing by value', isCorrect: true },
                                { id: 'c', text: 'Only when you use `memcpy()`', isCorrect: false },
                                { id: 'd', text: 'When assigning one existing object to another existing object', isCorrect: false },
                            ],
                            explanation: 'The copy constructor is called: (1) `Point p2 = p1;` — initialization from existing object, (2) passing by value to a function, (3) returning by value. Assignment between EXISTING objects calls the copy assignment operator, not the copy constructor.',
                        },
                        {
                            question: 'What is a "shallow copy" problem?',
                            options: [
                                { id: 'a', text: 'The copy is smaller than the original', isCorrect: false },
                                { id: 'b', text: 'The copy only copies pointer VALUES (addresses), not the data they point to — both objects then share the same heap memory', isCorrect: true },
                                { id: 'c', text: 'The copy is made without calling the constructor', isCorrect: false },
                                { id: 'd', text: 'The copy is slower than a deep copy', isCorrect: false },
                            ],
                            explanation: 'A shallow copy copies the pointer value (memory address), not the data at that address. Both the original and copy then point to the same heap data — modifying one affects the other, and deleting both causes a double-free crash.',
                        },
                        {
                            question: 'When is a stack object\'s destructor called?',
                            options: [
                                { id: 'a', text: 'When the program ends', isCorrect: false },
                                { id: 'b', text: 'When you call `obj.destroy()`', isCorrect: false },
                                { id: 'c', text: 'When the object goes out of scope (end of its enclosing block)', isCorrect: true },
                                { id: 'd', text: 'When the garbage collector runs', isCorrect: false },
                            ],
                            explanation: 'Stack objects are destroyed automatically when they go out of scope — when execution leaves the `{}` block where the object was declared. C++ has no garbage collector; destructors perform deterministic cleanup.',
                        },
                        {
                            question: 'What does RAII stand for and what does it mean?',
                            options: [
                                { id: 'a', text: 'Rapid Application Interface Integration — a design pattern', isCorrect: false },
                                { id: 'b', text: 'Resource Acquisition Is Initialization — acquire resources in the constructor, release in the destructor', isCorrect: true },
                                { id: 'c', text: 'Runtime Allocation and Immediate Initialization', isCorrect: false },
                                { id: 'd', text: 'Reference Aliasing and Indirect Initialization', isCorrect: false },
                            ],
                            explanation: 'RAII (Resource Acquisition Is Initialization) is the core C++ idiom for resource management: acquire resources (open files, allocate memory) in the constructor; release them in the destructor. This guarantees cleanup even if exceptions occur.',
                        },
                    ],
                },
            },

            // ─────────────────────────────────────────────────────────────────────
            // CHALLENGE
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 10,
                title: 'Challenge: Product Inventory Class',
                type: 'CHALLENGE',
                content: `## 🏆 Challenge: Product Inventory System

    Build a \`Product\` class that demonstrates all constructor types.

    **Requirements:**

    1. **Private attributes**: \`name\` (string), \`price\` (double), \`quantity\` (int), \`id\` (static counter — shared across all objects)

    2. **Default constructor**: Sets name="Unnamed", price=0.0, quantity=0, auto-increments id

    3. **Parameterized constructor**: Takes name, price, quantity — validates price >= 0 and quantity >= 0

    4. **Copy constructor**: Deep copies all data (increments id for the copy so each product has a unique id)

    5. **Destructor**: Prints a message when the product is destroyed

    6. **Methods**:
       - \`restock(int qty)\` — adds to quantity
       - \`sell(int qty)\` — reduces quantity (cannot go below 0)
       - \`totalValue()\` — returns price × quantity
       - \`printInfo()\` — formatted display

    7. **In main**: Create products using all three constructors, sell some, restock, print inventory`,
                stepData: {
                    starterCode: `#include <iostream>
    #include <string>
    using namespace std;

    class Product {
    private:
        static int nextId;  // shared across ALL Product objects
        int    id;
        string name;
        double price;
        int    quantity;

    public:
        // TODO: Default constructor
        // TODO: Parameterized constructor(string name, double price, int qty)
        // TODO: Copy constructor
        // TODO: Destructor — prints "Product [name] destroyed"

        // TODO: restock(int qty)
        // TODO: sell(int qty) — print error if not enough stock
        // TODO: double totalValue()
        // TODO: printInfo()
    };

    // Static member must be defined outside the class
    int Product::nextId = 1;

    int main() {
        cout << "=== Creating Products ===" << endl;
        // TODO: Create one product with default ctor
        // TODO: Create two products with parameterized ctor
        // TODO: Create one product as a copy of another

        cout << "\\n=== Transactions ===" << endl;
        // TODO: sell some items, restock, print inventory

        cout << "\\n=== Inventory Report ===" << endl;
        // TODO: print all products

        return 0;
    }`,
                    solution: `#include <iostream>
    #include <string>
    #include <iomanip>
    using namespace std;

    class Product {
    private:
        static int nextId;   // Class-level counter — shared by ALL instances
        int    id;
        string name;
        double price;
        int    quantity;

    public:
        // ── Default Constructor ──────────────────────────────────────────
        Product() : id(nextId++), name("Unnamed"), price(0.0), quantity(0) {
            cout << "  [Default] Created Product #" << id << endl;
        }

        // ── Parameterized Constructor ────────────────────────────────────
        Product(string n, double p, int q)
            : id(nextId++),
              name(n),
              price(p >= 0 ? p : 0.0),
              quantity(q >= 0 ? q : 0)
        {
            cout << "  [Param]   Created \"" << name << "\" #" << id << endl;
        }

        // ── Copy Constructor — gives the copy a NEW unique id ───────────
        Product(const Product& other)
            : id(nextId++),           // new id for the copy!
              name(other.name + " (copy)"),
              price(other.price),
              quantity(other.quantity)
        {
            cout << "  [Copy]    Copied \"" << other.name << "\" → new id #" << id << endl;
        }

        // ── Destructor ────────────────────────────────────────────────────
        ~Product() {
            cout << "  [Dtor]    Product \"" << name << "\" #" << id << " destroyed." << endl;
        }

        // ── Methods ───────────────────────────────────────────────────────
        void restock(int qty) {
            if (qty <= 0) {
                cout << "  ⚠️  Restock amount must be positive." << endl;
                return;
            }
            quantity += qty;
            cout << "  ✅ Restocked \"" << name << "\" by " << qty
                 << " → total: " << quantity << endl;
        }

        void sell(int qty) {
            if (qty <= 0) {
                cout << "  ⚠️  Sell amount must be positive." << endl;
            } else if (qty > quantity) {
                cout << "  ❌ Not enough stock! Have " << quantity
                     << ", need " << qty << endl;
            } else {
                quantity -= qty;
                cout << "  ✅ Sold " << qty << "x \"" << name
                     << "\" → remaining: " << quantity << endl;
            }
        }

        double totalValue() const { return price * quantity; }

        void printInfo() const {
            cout << fixed << setprecision(2);
            cout << "  [#" << left << setw(3) << id << "] "
                 << left << setw(22) << name
                 << " $" << right << setw(8) << price
                 << "  qty:" << setw(4) << quantity
                 << "  value: $" << setw(10) << totalValue()
                 << endl;
        }

        // Getters
        string getName() const { return name; }
        int    getId()   const { return id; }
    };

    // Static member definition (outside class body)
    int Product::nextId = 1;

    int main() {
        cout << "=== Creating Products ===" << endl;
        Product p1;                                  // default constructor
        Product p2("Laptop", 999.99, 15);            // parameterized
        Product p3("Wireless Mouse", 29.99, 50);     // parameterized
        Product p4 = p2;                             // copy constructor (Laptop copy)

        cout << "\n=== Transactions ===" << endl;
        p2.sell(3);
        p3.sell(100);    // should fail — not enough stock
        p3.restock(25);
        p3.sell(10);
        p4.sell(5);      // sells from the COPY, not the original

        cout << "\n=== Inventory Report ===" << endl;
        cout << "  ID   Name                   Price       Qty   Total Value" << endl;
        cout << "  " << string(68, '-') << endl;
        p1.printInfo();
        p2.printInfo();
        p3.printInfo();
        p4.printInfo();

        double grandTotal = p1.totalValue() + p2.totalValue()
                          + p3.totalValue() + p4.totalValue();
        cout << "  " << string(68, '-') << endl;
        cout << fixed << setprecision(2);
        cout << "  Grand Total Inventory Value: $" << grandTotal << endl;

        cout << "\n=== End of main — stack objects destroyed ===" << endl;
        // destructors will fire here in REVERSE order: p4, p3, p2, p1
        return 0;
    }`,
                    hints: [
                        'The static member `nextId` is shared by ALL instances — increment it in every constructor (including copy) to give each product a unique id.',
                        'In the initializer list for the parameterized constructor, use ternary operators: `price(p >= 0 ? p : 0.0)` for validation.',
                        'The copy constructor should call `nextId++` for the new id, but copy price, quantity etc. from `other`.',
                        'The destructor is `~Product()` — no return type, no parameters. Print the name and id for tracing.',
                        'Define the static member outside the class: `int Product::nextId = 1;` — this is required by C++ even if you initialize it inside with `inline static`.',
                    ],
                    language: 'cpp',
                },
            },

            {
                order: 11,
                title: 'Summary: Constructors & Destructors',
                type: 'SUMMARY',
                content: `# Summary: Constructors & Destructors

    ## Types of Constructors

    | Type | Signature | Called When |
    |------|-----------|------------|
    | **Default** | \`MyClass()\` | \`MyClass obj;\` — no arguments |
    | **Parameterized** | \`MyClass(int x, ...)\` | \`MyClass obj(5, ...);\` |
    | **Copy** | \`MyClass(const MyClass& o)\` | \`MyClass obj2 = obj1;\` or passing by value |

    ## Destructor

    \`\`\`cpp
    ~MyClass() { /* cleanup */ }
    \`\`\`
    - Called **automatically** when object goes out of scope (stack) or when \`delete\` is called (heap)
    - **No parameters, no return type, exactly one per class**
    - Perfect place for: \`delete[]\`, \`fclose()\`, releasing any resources

    ## Member Initializer List

    \`\`\`cpp
    MyClass(int x, int y) : memberX(x), memberY(y) { }
    //                       ↑ preferred over assignments in the body
    \`\`\`

    **Required for**: \`const\` members, reference members, efficiency with complex types.

    ## Shallow vs Deep Copy

    \`\`\`
    Shallow (compiler-generated):  copies pointer VALUES → shared heap → danger!
    Deep (custom copy ctor):       allocates NEW memory  → independent → safe
    \`\`\`

    **Rule**: If your class has a raw pointer member and a destructor that deletes it → you need a custom copy constructor.

    ## RAII

    Acquire resources in the **constructor**, release in the **destructor**. This guarantees cleanup even when exceptions occur — the foundation of safe C++ resource management.

    > 🎯 **Next up**: Encapsulation & Abstraction — getters, setters, and designing clean class interfaces!`,
            },
        ],
    });

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOPIC 3: cpp-encapsulation
    // ═══════════════════════════════════════════════════════════════════════════════

    await createLearn({
        slug: 'cpp-encapsulation',
        title: 'Encapsulation & Abstraction',
        description:
            'Master the first two pillars of OOP: Encapsulation — bundling data with methods and hiding implementation details with access specifiers — and Abstraction — exposing only what users need through clean interfaces. Includes getters/setters, const correctness, friend functions, and interface design principles.',
        difficulty: 'INTERMEDIATE',
        topicSlug: 'cpp-unit4-oop',
        unitTitle: 'Unit 4: Object-Oriented Programming',
        estimatedTime: 50,
        tags: ['encapsulation', 'abstraction', 'getters', 'setters', 'const-correctness', 'friend', 'interface', 'data-hiding'],
        iconEmoji: '🔐',
        steps: [

            // ─────────────────────────────────────────────────────────────────────
            // SECTION A: Encapsulation — The Concept
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 0,
                title: 'Encapsulation — The Concept',
                type: 'EXPLANATION',
                tips: [
                    'Encapsulation = bundling data + behavior together AND protecting data from unauthorized access.',
                    'Think of encapsulation like a capsule pill — the medicine (data) is inside, the outer shell (public interface) controls access.',
                    'Violating encapsulation (making everything public) is one of the most common OOP mistakes.',
                ],
                content: `# Encapsulation

    ## What is Encapsulation?

    **Encapsulation** is the OOP principle of:
    1. **Bundling** related data (attributes) and behaviour (methods) together in a class
    2. **Hiding** the internal implementation from outside code
    3. **Controlling access** through a well-defined public interface

    ---

    ## Why Encapsulation Matters: A Bank Account Story

    ### Without Encapsulation (Dangerous)

    \`\`\`cpp
    // No class — just exposed data
    double balance = 1000.0;
    string owner = "Alice";

    // Anyone can do this:
    balance = -99999999.0;   // 💀 No validation possible
    balance *= 2;            // 💀 No transaction logged
    owner = "";              // 💀 Corrupt state
    \`\`\`

    ### With Encapsulation (Safe)

    \`\`\`cpp
    class BankAccount {
    private:
        double balance;   // HIDDEN — only this class can touch it

    public:
        void deposit(double amount) {
            if (amount > 0) {          // ← validation enforced
                balance += amount;     // ← only place balance changes
                logTransaction(amount); // ← side effects guaranteed
            }
        }
    };

    BankAccount acc;
    acc.balance = -99999; // ❌ COMPILE ERROR — encapsulation enforced by compiler!
    acc.deposit(-99999);  // ✅ Rejected by validation inside deposit()
    \`\`\`

    ---

    ## The Three Benefits of Encapsulation

    ### 1. Validation
    \`\`\`cpp
    void setAge(int a) {
        if (a >= 0 && a <= 150) age = a; // reject invalid values
        else cout << "Invalid age!" << endl;
    }
    \`\`\`

    ### 2. Controlled Change
    \`\`\`cpp
    // You can change HOW balance is stored without breaking outside code
    // Outside code always calls deposit() — they don't care about internals
    \`\`\`

    ### 3. Invariant Maintenance
    \`\`\`cpp
    // An invariant is a rule that must always be true
    // e.g., "balance can never be negative"
    // Encapsulation ensures the invariant is never violated from outside
    \`\`\`

    ---

    ## Encapsulation vs Abstraction

    | | Encapsulation | Abstraction |
    |-|--------------|------------|
    | **What** | Hiding data + bundling | Hiding complexity |
    | **How** | private/public access specifiers | Simple public interface |
    | **Goal** | Protect internal state | Simplify usage |
    | **Analogy** | Sealed pill capsule | TV remote (hides circuit complexity) |`,
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION B: Getters and Setters
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 1,
                title: 'Getters and Setters — Controlled Access',
                type: 'EXPLANATION',
                tips: [
                    'Not every attribute needs a getter AND a setter. Only expose what\'s needed.',
                    'A "read-only" attribute has a getter but no setter.',
                    'A "write-only" attribute (rare) has a setter but no getter.',
                    'Setters can enforce constraints — never allow invalid state.',
                ],
                content: `# Getters and Setters

    ## The Interface for Private Data

    Since attributes are private, outside code interacts with them through **getter** (read) and **setter** (write) methods.

    \`\`\`cpp
    class Temperature {
    private:
        double celsius;       // internal representation

    public:
        // Setter — enforces valid range
        void setCelsius(double c) {
            if (c >= -273.15) { // absolute zero is the minimum
                celsius = c;
            } else {
                cout << "Error: Below absolute zero!" << endl;
            }
        }

        // Getter — returns the stored value
        double getCelsius() const { return celsius; }

        // Computed getters — expose data in different forms
        double getFahrenheit() const { return celsius * 9.0/5.0 + 32.0; }
        double getKelvin()     const { return celsius + 273.15; }
    };

    Temperature t;
    t.setCelsius(100.0);
    cout << t.getCelsius();     // 100
    cout << t.getFahrenheit();  // 212
    cout << t.getKelvin();      // 373.15
    // t.celsius = -5000; ← COMPILE ERROR — direct access blocked
    \`\`\`

    ---

    ## The \`const\` Qualifier on Methods

    Methods that do NOT modify the object should be marked \`const\`:

    \`\`\`cpp
    class Circle {
    private:
        double radius;
    public:
        void   setRadius(double r) { radius = r; }   // non-const — modifies
        double getRadius()  const  { return radius; } // const — read only
        double area()       const  { return 3.14159 * radius * radius; } // const
        double perimeter()  const  { return 2 * 3.14159 * radius; }     // const
        void   print()      const  { cout << "Circle r=" << radius; }   // const
    };
    \`\`\`

    **Why \`const\` matters:**
    \`\`\`cpp
    const Circle c;      // const object
    c.setRadius(5);      // ❌ ERROR — can't call non-const method on const object
    cout << c.area();    // ✅ OK — area() is marked const
    \`\`\`

    ---

    ## Designing the Interface: What to Expose

    **Not every private member needs a getter or setter!**

    \`\`\`cpp
    class BankAccount {
    private:
        string owner;
        double balance;
        int    transactionCount;  // internal tracking — no getter/setter needed
        string lastErrorMsg;      // internal state — no getter needed

    public:
        // SELECTIVE EXPOSURE:
        string getOwner()   const { return owner; }       // read-only
        double getBalance() const { return balance; }     // read-only (no setter!)
        // balance is only changed via deposit/withdraw — never directly set!
        void deposit(double amount)  { /* ... */ }
        void withdraw(double amount) { /* ... */ }
        // transactionCount — not exposed at all! implementation detail
    };
    \`\`\`

    ---

    ## Immutable Attributes with \`const\` Members

    Some data should never change after creation:

    \`\`\`cpp
    class Employee {
    private:
        const int employeeId;    // const member — set once, never changed
        string    name;
    public:
        Employee(int id, string n) : employeeId(id), name(n) { }
        int getEmployeeId() const { return employeeId; }
        // No setEmployeeId() — IDs are permanent!
    };
    \`\`\``,
            },

            {
                order: 2,
                title: 'Getters, Setters & Const Correctness — Code',
                type: 'CODE',
                content: '## Encapsulation with Validation and Const Correctness',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Temperature Class — Full Encapsulation',
                        language: 'cpp',
                        code: `#include <iostream>
    #include <string>
    #include <iomanip>
    using namespace std;

    class Temperature {
    private:
        double celsius;
        static const double ABSOLUTE_ZERO; // -273.15°C — class constant

    public:
        // ── Constructors ─────────────────────────────────────────────────
        Temperature() : celsius(0.0) { }   // default: water freezing point

        explicit Temperature(double c) {
            if (c < ABSOLUTE_ZERO) {
                cout << "Warning: Below absolute zero! Setting to 0°C" << endl;
                celsius = 0.0;
            } else {
                celsius = c;
            }
        }

        // ── Setter with validation ───────────────────────────────────────
        void setCelsius(double c) {
            if (c < ABSOLUTE_ZERO) {
                cout << "Error: " << c << "°C is below absolute zero (-273.15°C)!" << endl;
            } else {
                celsius = c;
            }
        }

        // ── Getters — all const (they don't modify the object) ──────────
        double getCelsius()    const { return celsius; }
        double getFahrenheit() const { return celsius * 9.0 / 5.0 + 32.0; }
        double getKelvin()     const { return celsius + 273.15; }

        // ── Computed properties ──────────────────────────────────────────
        string getDescription() const {
            if (celsius <= 0)    return "Freezing or below";
            if (celsius < 20)    return "Cold";
            if (celsius < 30)    return "Comfortable";
            if (celsius < 40)    return "Hot";
            return "Dangerously hot";
        }

        // ── Display ──────────────────────────────────────────────────────
        void print() const {
            cout << fixed << setprecision(2);
            cout << "Temperature: " << celsius << "°C | "
                 << getFahrenheit() << "°F | "
                 << getKelvin()     << "K | "
                 << getDescription() << endl;
        }

        // ── Comparison (const — doesn't modify either object) ───────────
        bool isWarmerThan(const Temperature& other) const {
            return celsius > other.celsius;
        }
    };

    // Static const member definition
    const double Temperature::ABSOLUTE_ZERO = -273.15;

    int main() {
        Temperature room(22.0);
        Temperature boiling(100.0);
        Temperature invalid(-300.0); // Below absolute zero — rejected

        room.print();
        boiling.print();

        cout << "\nChanging room temperature..." << endl;
        room.setCelsius(35.0);
        room.print();

        cout << "\nIs boiling warmer than room? "
             << (boiling.isWarmerThan(room) ? "Yes" : "No") << endl;

        // Using a const Temperature — can only call const methods
        const Temperature freezing(0.0);
        freezing.print();           // ✅ const method — OK
        // freezing.setCelsius(5); // ❌ COMPILE ERROR — non-const method on const obj

        return 0;
    }`,
                        explanation: 'Demonstrates: private data with validation in the setter, computed getters (Fahrenheit/Kelvin) that derive values from the stored Celsius, `const` methods, a `const` object that can only call `const` methods, and a `static const` class-level constant.',
                        highlightLines: [22, 34, 35, 36, 68, 69],
                        isRunnable: true,
                    },
                    {
                        order: 1,
                        title: 'Selective Exposure — Interface Design',
                        language: 'cpp',
                        code: `#include <iostream>
    #include <string>
    #include <vector>
    using namespace std;

    // A shopping cart — careful interface design
    class ShoppingCart {
    private:
        struct Item {
            string name;
            double price;
            int    quantity;
        };

        vector<Item> items;
        string       customerName;
        double       discountPercent; // internal — not directly settable

    public:
        // ── Constructor ──────────────────────────────────────────────────
        ShoppingCart(string customer)
            : customerName(customer), discountPercent(0.0) { }

        // ── Controlled modification — no direct setter for items ─────────
        void addItem(string name, double price, int qty = 1) {
            if (price < 0 || qty <= 0) {
                cout << "  ⚠️  Invalid item data!" << endl;
                return;
            }
            items.push_back({name, price, qty});
            cout << "  Added: " << qty << "x " << name << " @ $" << price << endl;
        }

        void removeItem(string name) {
            for (auto it = items.begin(); it != items.end(); ++it) {
                if (it->name == name) {
                    items.erase(it);
                    cout << "  Removed: " << name << endl;
                    return;
                }
            }
            cout << "  Item \"" << name << "\" not found." << endl;
        }

        // ── Discount — validated, not directly settable ──────────────────
        void applyDiscount(double percent) {
            if (percent >= 0 && percent <= 100) {
                discountPercent = percent;
                cout << "  Applied " << percent << "% discount." << endl;
            } else {
                cout << "  ⚠️  Discount must be 0-100%." << endl;
            }
        }

        // ── Read-only getters — const ────────────────────────────────────
        string getCustomer() const { return customerName; }
        int    getItemCount() const { return (int)items.size(); }

        double getSubtotal() const {
            double total = 0;
            for (const auto& item : items)
                total += item.price * item.quantity;
            return total;
        }

        double getTotal() const {
            return getSubtotal() * (1.0 - discountPercent / 100.0);
        }

        // ── Summary ──────────────────────────────────────────────────────
        void printReceipt() const {
            cout << "\n=== Receipt for " << customerName << " ===" << endl;
            for (const auto& item : items) {
                cout << "  " << item.quantity << "x " << item.name
                     << " @ $" << item.price
                     << " = $" << item.price * item.quantity << endl;
            }
            cout << "  Subtotal:  $" << getSubtotal() << endl;
            if (discountPercent > 0)
                cout << "  Discount:  " << discountPercent << "%" << endl;
            cout << "  TOTAL:     $" << getTotal() << endl;
        }
    };

    int main() {
        ShoppingCart cart("Alice");

        cart.addItem("C++ Book", 49.99);
        cart.addItem("Mechanical Keyboard", 129.99);
        cart.addItem("USB Hub", 24.99, 2);  // quantity 2
        cart.addItem("Cable", -5.00);       // invalid — rejected

        cart.applyDiscount(10.0);           // 10% off
        cart.applyDiscount(150.0);          // invalid — rejected

        cout << "Items in cart: " << cart.getItemCount() << endl;
        cart.printReceipt();

        cart.removeItem("USB Hub");
        cart.printReceipt();

        return 0;
    }`,
                        explanation: 'Demonstrates selective encapsulation: `discountPercent` is not directly settable — only `applyDiscount()` can set it with validation. `items` vector is completely hidden — only `addItem()`/`removeItem()` modify it. All getters are `const`. The `Item` struct is a private inner type.',
                        highlightLines: [23, 47, 55, 60, 65],
                        isRunnable: true,
                    },
                ],
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION C: Abstraction
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 3,
                title: 'Abstraction — Hiding Complexity',
                type: 'EXPLANATION',
                tips: [
                    'Abstraction means the USER of your class shouldn\'t need to understand HOW it works, only WHAT it does.',
                    'A good public interface is stable even when the internal implementation completely changes.',
                    'Abstract away "how" and expose only "what".',
                ],
                content: `# Abstraction

    ## What is Abstraction?

    **Abstraction** means exposing **only what is necessary** to the user of a class, hiding the complexity of implementation.

    **Analogy**: When you press the gas pedal in a car, you don't think about the fuel injectors, combustion timing, throttle body position, or crankshaft rotation. You just know: "press more = go faster."

    ---

    ## Abstraction in Code

    \`\`\`cpp
    // What the USER of this class sees:
    class EmailSender {
    public:
        void sendEmail(string to, string subject, string body);
        bool isConnected() const;
    };

    // What ACTUALLY happens inside (user doesn't need to know):
    class EmailSender {
    private:
        void openSMTPConnection();
        void authenticateWithServer();
        void encryptMessage(string& msg);
        void packageMIME(string to, string subject, string body);
        void transmitPackets();
        void closeSMTPConnection();
        void handleRetry(int attempt);

        string serverHost;
        int    port;
        string authToken;
        // ... many internal details ...
    public:
        void sendEmail(string to, string subject, string body);
        bool isConnected() const;
    };
    \`\`\`

    The user calls \`sender.sendEmail(...)\` — that's it. All the complexity is abstracted away.

    ---

    ## How Implementation Changes Without Breaking Users

    \`\`\`cpp
    // Version 1: Simple array-based storage
    class DataStore {
    private:
        int data[1000]; // array
        int count;
    public:
        void add(int x)     { data[count++] = x; }
        int  get(int i) const { return data[i]; }
        int  size() const   { return count; }
    };

    // Version 2: Switched to vector internally — users don't notice!
    class DataStore {
    private:
        vector<int> data; // changed internals completely
    public:
        // SAME PUBLIC INTERFACE — users' code still compiles and works!
        void add(int x)     { data.push_back(x); }
        int  get(int i) const { return data[i]; }
        int  size() const   { return (int)data.size(); }
    };
    \`\`\`

    If we had allowed direct access to \`data\`, switching from array to vector would break all user code. Abstraction gave us **freedom to change the implementation**.

    ---

    ## Abstraction vs Encapsulation

    \`\`\`
    Encapsulation:    The mechanism (private/public keywords)
    Abstraction:      The design principle (what to expose)

    Encapsulation enables abstraction.
    Abstraction guides what to encapsulate.

    Together they form: "hide what you don't need, expose what you do."
    \`\`\``,
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION D: friend keyword
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 4,
                title: 'The friend Keyword (Controlled Exceptions to Encapsulation)',
                type: 'EXPLANATION',
                tips: [
                    'Use `friend` sparingly — it breaks encapsulation as a controlled, intentional exception.',
                    'Friendship is NOT inherited and NOT transitive: if A is a friend of B, and B is a friend of C, A is NOT a friend of C.',
                    'Common legitimate uses: operator overloading and testing frameworks.',
                ],
                content: `# The \`friend\` Keyword

    ## When Encapsulation Needs an Intentional Exception

    Sometimes a non-member function or another class legitimately needs access to private members. Instead of making them public, C++ provides \`friend\`.

    ---

    ## Friend Functions

    A \`friend\` function is a non-member function granted access to private members:

    \`\`\`cpp
    class Point {
    private:
        double x, y;
    public:
        Point(double x, double y) : x(x), y(y) { }

        // Declare the friend function inside the class
        friend double distance(const Point& a, const Point& b);
    };

    // Definition is OUTSIDE the class — but has access to private x, y
    double distance(const Point& a, const Point& b) {
        double dx = a.x - b.x;  // ✅ can access private x, y!
        double dy = a.y - b.y;
        return sqrt(dx*dx + dy*dy);
    }

    Point p1(0, 0), p2(3, 4);
    cout << distance(p1, p2); // 5.0
    \`\`\`

    ---

    ## Friend Classes

    Declare an entire class as a friend:

    \`\`\`cpp
    class Engine;    // forward declaration

    class Car {
    private:
        int horsepower;
        double fuelLevel;
        friend class Mechanic; // Mechanic can access Car's private members
    };

    class Mechanic {
    public:
        void diagnose(Car& car) {
            // Can directly access car's private members!
            cout << "HP: " << car.horsepower << endl;
            cout << "Fuel: " << car.fuelLevel << endl;
        }
    };
    \`\`\`

    ---

    ## Most Common Use: Overloading \`<<\` for cout

    \`\`\`cpp
    class Point {
    private:
        double x, y;
    public:
        Point(double x, double y) : x(x), y(y) { }

        // friend lets operator<< access private x and y
        friend ostream& operator<<(ostream& os, const Point& p) {
            os << "(" << p.x << ", " << p.y << ")";
            return os;
        }
    };

    Point p(3.0, 4.0);
    cout << p << endl; // Output: (3, 4)
    \`\`\`

    ---

    ## friend Rules to Remember

    1. **Declared inside** the class body (after \`friend\` keyword)
    2. **Defined outside** the class (not a member function)
    3. **Not inherited** — friend of Base is NOT friend of Derived
    4. **Not transitive** — if B is friend of A, and C is friend of B, C is NOT friend of A
    5. **Use sparingly** — each \`friend\` is an intentional hole in encapsulation`,
            },

            // ─────────────────────────────────────────────────────────────────────
            // VISUAL
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 5,
                title: 'Visual: Encapsulation & Abstraction',
                type: 'VISUAL',
                content: `# Encapsulation & Abstraction: Visual Model

    ## The Encapsulation Capsule

    \`\`\`
                        ┌─────────────────────────────────────────┐
                        │            CLASS BankAccount             │
                        │                                          │
      OUTSIDE WORLD     │  ╔═══════════ PUBLIC WALL ═══════════╗  │
                        │  ║                                   ║  │
      acc.deposit(100)──┼──╫──► deposit(double amount)         ║  │
      acc.getBalance()──┼──╫──► getBalance() const             ║  │
      acc.withdraw(50)──┼──╫──► withdraw(double amount)        ║  │
                        │  ║            │   │   │               ║  │
      acc.balance = 999 │  ║            ▼   ▼   ▼               ║  │
      ❌ BLOCKED ────────┼──╫─X     ┌───────────────────┐       ║  │
                        │  ║       │  PRIVATE           │       ║  │
                        │  ║       │  double balance     │       ║  │
                        │  ║       │  string owner       │       ║  │
                        │  ║       │  int txCount        │       ║  │
                        │  ╚═══════╪═══════════════════════════╝  │
                        │          │  Hidden internals            │
                        └──────────┴──────────────────────────────┘
    \`\`\`

    ---

    ## Abstraction Layers

    \`\`\`
    What the USER sees:                   What ACTUALLY happens:
    ──────────────────────────────────    ──────────────────────────────────
                                          1. Validate amount > 0
    acc.deposit(100) ─────────────────►  2. Log the transaction
                                          3. Update balance
                                          4. Check for fraud threshold
                                          5. Update transaction count
                                          6. Notify listeners

    User only needs to know: "call deposit to add money"
    User does NOT need to know: HOW it's stored, validated, logged, etc.
    \`\`\`

    ---

    ## Const Correctness Visual

    \`\`\`
    const Circle c(5.0);
             │
             │ c is read-only!
             │
             ├──► c.area()       ✅  area() is const — allowed
             ├──► c.perimeter()  ✅  perimeter() is const — allowed
             ├──► c.print()      ✅  print() is const — allowed
             └──► c.setRadius(3) ❌  COMPILE ERROR: setRadius() is not const
    \`\`\`

    ---

    ## friend: A Controlled Door in the Wall

    \`\`\`
                        ┌──────────────────────────────┐
       OUTSIDE WORLD    │    CLASS Point               │
                        │                              │
      distance(p1, p2)  │  ╔════════════════════════╗ │
      ✅ friend function │  ║  PRIVATE             ✅ ║ │◄── friend has a KEY
      can access x, y   │  ║  double x              ║ │    to the private wall
                        │  ║  double y              ║ │
      regularFunc(p)    │  ╚════════════════════════╝ │
      ❌ cannot access  │                              │
      x, y              └──────────────────────────────┘

    Use friend sparingly — it's an intentional exception, not the rule.
    \`\`\``,
            },

            // ─────────────────────────────────────────────────────────────────────
            // QUIZ
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 6,
                title: 'Quiz: Encapsulation & Abstraction',
                type: 'QUIZ',
                content: '## Test Your Understanding',
                stepData: {
                    questions: [
                        {
                            question: 'Which of these best describes encapsulation?',
                            options: [
                                { id: 'a', text: 'Making all class members public for easy access', isCorrect: false },
                                { id: 'b', text: 'Bundling data and methods together while hiding internal details behind a public interface', isCorrect: true },
                                { id: 'c', text: 'Making a class abstract so it cannot be instantiated', isCorrect: false },
                                { id: 'd', text: 'Inheriting from a base class', isCorrect: false },
                            ],
                            explanation: 'Encapsulation = bundling (data + behavior) + hiding (private members behind a controlled public interface). It protects internal state from unauthorized or invalid modification.',
                        },
                        {
                            question: 'What does marking a method `const` mean?',
                            options: [
                                { id: 'a', text: 'The method cannot be overloaded', isCorrect: false },
                                { id: 'b', text: 'The method cannot modify the object\'s data and can be called on const objects', isCorrect: true },
                                { id: 'c', text: 'The method\'s return value is constant', isCorrect: false },
                                { id: 'd', text: 'The method can only be called once', isCorrect: false },
                            ],
                            explanation: 'A `const` method promises not to modify the object. It can be called on `const` objects. Only `const` methods are available on `const` object instances.',
                        },
                        {
                            question: 'What is the KEY advantage of using private attributes with public setter methods over just making attributes public?',
                            options: [
                                { id: 'a', text: 'It is faster at runtime', isCorrect: false },
                                { id: 'b', text: 'Setters allow validation — ensuring data is always in a valid state', isCorrect: true },
                                { id: 'c', text: 'It uses less memory', isCorrect: false },
                                { id: 'd', text: 'It makes the class easier to inherit from', isCorrect: false },
                            ],
                            explanation: 'The key benefit of setters over public attributes is VALIDATION. The setter can enforce rules: reject negative ages, clamp values to a range, log changes, etc. Direct attribute access bypasses all validation.',
                        },
                        {
                            question: 'What does a `friend` function in C++ allow?',
                            options: [
                                { id: 'a', text: 'It creates a copy of the class', isCorrect: false },
                                { id: 'b', text: 'A non-member function to access private and protected members of a class', isCorrect: true },
                                { id: 'c', text: 'A class to inherit from two base classes', isCorrect: false },
                                { id: 'd', text: 'Two objects of the same class to share memory', isCorrect: false },
                            ],
                            explanation: 'A `friend` function is a non-member function that is granted special access to a class\'s private and protected members. It is declared inside the class with the `friend` keyword.',
                        },
                        {
                            question: 'The difference between Abstraction and Encapsulation is:',
                            options: [
                                { id: 'a', text: 'They are the same thing with different names', isCorrect: false },
                                { id: 'b', text: 'Encapsulation is the mechanism (private/public); Abstraction is the design principle (what to expose)', isCorrect: true },
                                { id: 'c', text: 'Abstraction is for data, Encapsulation is for methods', isCorrect: false },
                                { id: 'd', text: 'Encapsulation is a runtime concept, Abstraction is compile-time', isCorrect: false },
                            ],
                            explanation: 'Encapsulation is the MECHANISM — using access specifiers to hide implementation. Abstraction is the PRINCIPLE — deciding WHAT to hide and what to expose. Encapsulation enables abstraction.',
                        },
                        {
                            question: 'If you change the internal implementation of a well-encapsulated class (e.g., switch from array to vector), what happens to code that uses that class through its public interface?',
                            options: [
                                { id: 'a', text: 'It must be rewritten to use the new internals', isCorrect: false },
                                { id: 'b', text: 'It continues to work unchanged — the public interface is stable', isCorrect: true },
                                { id: 'c', text: 'It crashes at runtime', isCorrect: false },
                                { id: 'd', text: 'It fails to compile', isCorrect: false },
                            ],
                            explanation: 'This is the power of encapsulation + abstraction: the public interface is a stable contract. Users call the same methods regardless of how internals change. This is why large codebases can evolve without breaking consumers.',
                        },
                    ],
                },
            },

            // ─────────────────────────────────────────────────────────────────────
            // CHALLENGE
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 7,
                title: 'Challenge: Smart Thermostat Class',
                type: 'CHALLENGE',
                content: `## 🏆 Challenge: Smart Thermostat

    Design a \`Thermostat\` class that demonstrates full encapsulation and abstraction.

    **Private attributes:**
    - \`currentTemp\` (double) — the room's actual temperature (read by sensors)
    - \`targetTemp\` (double) — the desired temperature (set by user)
    - \`minTemp\` (double, const) — minimum allowed target (e.g., 10.0°C)
    - \`maxTemp\` (double, const) — maximum allowed target (e.g., 35.0°C)
    - \`isHeating\` (bool) — is the heater on?
    - \`isCooling\` (bool) — is the AC on?

    **Public interface:**
    - Constructor: takes minTemp, maxTemp, initialTarget
    - \`setTargetTemp(double t)\` — validated setter (must be in [min, max])
    - \`updateCurrentTemp(double t)\` — simulates sensor reading
    - \`getTargetTemp()\` const, \`getCurrentTemp()\` const
    - \`tick()\` — the core logic: turn heater ON if current < target-1, turn AC ON if current > target+1, turn both OFF if within 1°C of target
    - \`getStatus()\` const — returns "Heating", "Cooling", or "Idle"
    - \`printStatus()\` const — formatted display

    **Bonus**: Add a \`friend\` function \`printDiagnostics(const Thermostat& t)\` that prints internal state (both booleans) — this simulates a service technician's diagnostic tool.`,
                stepData: {
                    starterCode: `#include <iostream>
    #include <string>
    using namespace std;

    class Thermostat {
    private:
        double currentTemp;
        double targetTemp;
        const double minTemp;
        const double maxTemp;
        bool isHeating;
        bool isCooling;

        // TODO: Declare friend function printDiagnostics

    public:
        // TODO: Constructor(double minT, double maxT, double initialTarget)

        // TODO: setTargetTemp(double t) — validate range
        // TODO: updateCurrentTemp(double t) — simulate sensor
        // TODO: getTargetTemp() const
        // TODO: getCurrentTemp() const

        // TODO: tick() — core control logic
        // TODO: getStatus() const
        // TODO: printStatus() const
    };

    // TODO: Define printDiagnostics(const Thermostat& t) here

    int main() {
        Thermostat t(10.0, 35.0, 22.0); // min=10, max=35, target=22

        // Simulate a heating scenario
        t.updateCurrentTemp(15.0);  // cold room
        t.tick();
        t.printStatus();

        t.updateCurrentTemp(21.5);  // nearly there
        t.tick();
        t.printStatus();

        t.updateCurrentTemp(22.0);  // at target
        t.tick();
        t.printStatus();

        // Switch to cooling scenario
        t.setTargetTemp(20.0);
        t.updateCurrentTemp(25.0);  // too hot
        t.tick();
        t.printStatus();

        // Test invalid target
        t.setTargetTemp(50.0);  // above max — should reject

        // Bonus: diagnostics
        // printDiagnostics(t);

        return 0;
    }`,
                    solution: `#include <iostream>
    #include <string>
    #include <iomanip>
    using namespace std;

    class Thermostat {
    private:
        double currentTemp;
        double targetTemp;
        const double minTemp;
        const double maxTemp;
        bool isHeating;
        bool isCooling;

        // Friend function declaration — grants diagnostic access
        friend void printDiagnostics(const Thermostat& t);

    public:
        // ── Constructor ──────────────────────────────────────────────────
        Thermostat(double minT, double maxT, double initialTarget)
            : currentTemp(20.0),
              minTemp(minT),
              maxTemp(maxT),
              isHeating(false),
              isCooling(false)
        {
            // Use setter for validation of initial target
            setTargetTemp(initialTarget);
            cout << "Thermostat initialized. Target: " << targetTemp << "°C" << endl;
        }

        // ── Validated setter ─────────────────────────────────────────────
        void setTargetTemp(double t) {
            if (t < minTemp || t > maxTemp) {
                cout << "  ⚠️  Target " << t << "°C out of range ["
                     << minTemp << ", " << maxTemp << "]. Rejected." << endl;
            } else {
                targetTemp = t;
                cout << "  ✅ Target set to " << targetTemp << "°C" << endl;
            }
        }

        // ── Sensor update ────────────────────────────────────────────────
        void updateCurrentTemp(double t) {
            currentTemp = t;
        }

        // ── Const getters ────────────────────────────────────────────────
        double getTargetTemp()  const { return targetTemp; }
        double getCurrentTemp() const { return currentTemp; }

        // ── Core control logic ───────────────────────────────────────────
        void tick() {
            double diff = currentTemp - targetTemp;

            if (diff < -1.0) {
                // Room is more than 1°C below target → heat
                isHeating = true;
                isCooling = false;
            } else if (diff > 1.0) {
                // Room is more than 1°C above target → cool
                isHeating = false;
                isCooling = true;
            } else {
                // Within ±1°C of target → idle
                isHeating = false;
                isCooling = false;
            }
        }

        // ── Status ───────────────────────────────────────────────────────
        string getStatus() const {
            if (isHeating) return "Heating 🔥";
            if (isCooling) return "Cooling ❄️";
            return "Idle ✅";
        }

        void printStatus() const {
            cout << fixed << setprecision(1);
            cout << "  Current: " << currentTemp << "°C"
                 << "  Target: " << targetTemp << "°C"
                 << "  Status: " << getStatus() << endl;
        }
    };

    // ── Friend function — has access to private isHeating, isCooling ─────
    void printDiagnostics(const Thermostat& t) {
        cout << "\n[DIAGNOSTICS — Service Mode]" << endl;
        cout << "  currentTemp:  " << t.currentTemp  << "°C" << endl;
        cout << "  targetTemp:   " << t.targetTemp   << "°C" << endl;
        cout << "  minTemp:      " << t.minTemp      << "°C" << endl;
        cout << "  maxTemp:      " << t.maxTemp      << "°C" << endl;
        cout << "  isHeating:    " << (t.isHeating ? "ON" : "OFF") << endl;
        cout << "  isCooling:    " << (t.isCooling ? "ON" : "OFF") << endl;
    }

    int main() {
        Thermostat t(10.0, 35.0, 22.0);

        cout << "\n--- Heating Scenario ---" << endl;
        t.updateCurrentTemp(15.0);
        t.tick();
        t.printStatus();

        t.updateCurrentTemp(21.5);
        t.tick();
        t.printStatus();

        t.updateCurrentTemp(22.0);
        t.tick();
        t.printStatus();

        cout << "\n--- Cooling Scenario ---" << endl;
        t.setTargetTemp(20.0);
        t.updateCurrentTemp(25.0);
        t.tick();
        t.printStatus();

        cout << "\n--- Invalid Target ---" << endl;
        t.setTargetTemp(50.0);  // rejected

        cout << "\n--- Technician Diagnostics ---" << endl;
        printDiagnostics(t);   // friend function — accesses private members

        return 0;
    }`,
                    hints: [
                        '`const` members (`minTemp`, `maxTemp`) MUST be initialized in the member initializer list — they cannot be assigned in the body.',
                        'In `tick()`, compute `diff = currentTemp - targetTemp`. If diff < -1.0 → heat. If diff > 1.0 → cool. Else → idle.',
                        'Declare `friend void printDiagnostics(const Thermostat& t);` inside the class body. Define it outside the class without the `friend` keyword.',
                        '`getStatus()` should be a `const` method — it doesn\'t modify anything, just reads `isHeating` and `isCooling`.',
                        'The friend function is NOT a member of the class — it is defined at global scope. It can access `t.isHeating` and `t.isCooling` because it is declared as a friend.',
                    ],
                    language: 'cpp',
                },
            },

            {
                order: 8,
                title: 'Summary: Encapsulation & Abstraction',
                type: 'SUMMARY',
                content: `# Summary: Encapsulation & Abstraction

    ## Encapsulation

    **Definition**: Bundling data and methods together, and hiding internal data behind a controlled public interface.

    **How**: \`private\` for data, \`public\` for methods that control access.

    **Benefits**:
    - **Validation** — Setters enforce valid state
    - **Invariant protection** — Internal rules can never be violated from outside
    - **Freedom to refactor** — Change internals without breaking user code
    - **Debugging** — Only one place where data changes

    ## Abstraction

    **Definition**: Exposing only what is necessary — hiding "how" and showing only "what".

    **How**: Thoughtful public interface design — expose operations, hide implementation.

    **Benefit**: Users of your class don't need to understand the internals.

    ## Const Correctness

    \`\`\`cpp
    double getBalance() const; // This method promises NOT to modify the object
                               // Can be called on const objects
                               // Non-const methods CANNOT be called on const objects
    \`\`\`

    ## Getters and Setters

    \`\`\`
    Private attribute → getter (read) + setter (write with validation)

    Not every attribute needs both:
      Read-only:  getter only, no setter
      Write-only: setter only, no getter (rare)
      No access:  pure internal implementation detail
    \`\`\`

    ## The friend Keyword

    - Grants a specific non-member function or class access to private members
    - Used sparingly — breaks encapsulation intentionally
    - Most common use: operator overloading, especially \`operator<<\` for \`cout\`
    - Friendship is **not inherited** and **not transitive**

    ## Design Principle

    > **"Make everything as private as possible, and expose only what is needed."**

    This reduces coupling between classes, makes code easier to change, and prevents bugs from external interference.

    > 🎯 **Next up**: Inheritance — building new classes on top of existing ones, reusing code, and extending behavior!`,
            },
        ],
    });








    // ═══════════════════════════════════════════════════════════════════════════════
    // UNIT 4: Object-Oriented Programming — Part B (Final 2 Topics)
    // Topics: cpp-inheritance, cpp-polymorphism
    // ═══════════════════════════════════════════════════════════════════════════════
    //
    // Paste inside your seedCppLearnContent() function, after cpp-encapsulation.
    // ═══════════════════════════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOPIC 4: cpp-inheritance
    // ═══════════════════════════════════════════════════════════════════════════════

    await createLearn({
        slug: 'cpp-inheritance',
        title: 'Inheritance',
        description:
            'Master C++ inheritance: building derived classes from base classes, reusing and extending behavior, the protected access specifier, constructor chaining, method overriding, and the different types of inheritance. Learn when and why to use IS-A relationships in real-world class hierarchies.',
        difficulty: 'INTERMEDIATE',
        topicSlug: 'cpp-unit4-oop',
        unitTitle: 'Unit 4: Object-Oriented Programming',
        estimatedTime: 60,
        tags: [
            'inheritance', 'base-class', 'derived-class', 'protected', 'override',
            'constructor-chaining', 'IS-A', 'single-inheritance', 'multi-level',
            'multiple-inheritance', 'OOP'
        ],
        iconEmoji: '🧬',
        steps: [

            // ─────────────────────────────────────────────────────────────────────
            // SECTION A: What is Inheritance & Why?
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 0,
                title: 'What is Inheritance? The IS-A Relationship',
                type: 'EXPLANATION',
                tips: [
                    'Use inheritance only when a true IS-A relationship exists: "A Dog IS-A Animal" ✅. NOT for HAS-A: "A Car HAS-A Engine" — that\'s composition.',
                    'Inheritance models specialization: the derived class IS a more specific version of the base class.',
                    'C++ uses a colon to declare inheritance: `class Dog : public Animal { };`',
                ],
                content: `# What is Inheritance?

    ## The Code Duplication Problem

    Suppose you're building a game with different character types:

    \`\`\`cpp
    class Warrior {
    private:
        string name;
        int    health;
        int    level;
    public:
        void eat()   { health += 10; }
        void sleep() { health += 20; }
        void attack() { cout << name << " swings a sword!" << endl; }
    };

    class Mage {
    private:
        string name;   // ← same as Warrior
        int    health; // ← same as Warrior
        int    level;  // ← same as Warrior
    public:
        void eat()   { health += 10; }  // ← IDENTICAL to Warrior
        void sleep() { health += 20; }  // ← IDENTICAL to Warrior
        void castSpell() { cout << name << " casts a fireball!" << endl; }
    };
    \`\`\`

    This is **code duplication** — a maintenance nightmare. If you find a bug in \`eat()\`, you must fix it in every class separately.

    ---

    ## The Solution: Inheritance

    **Inheritance** lets a new class (**derived**) automatically receive all the attributes and methods of an existing class (**base**), then add or change what it needs.

    \`\`\`cpp
    // BASE CLASS — shared behaviour lives here ONCE
    class Character {
    protected:            // ← 'protected' instead of 'private'
        string name;
        int    health;
        int    level;
    public:
        void eat()   { health += 10; }  // defined ONCE
        void sleep() { health += 20; }  // defined ONCE
    };

    // DERIVED CLASSES — inherit everything, add their own stuff
    class Warrior : public Character {
    public:
        void attack() { cout << name << " swings a sword!" << endl; }
        // eat() and sleep() are inherited — no need to redefine!
    };

    class Mage : public Character {
    public:
        void castSpell() { cout << name << " casts a fireball!" << endl; }
        // eat() and sleep() are inherited too!
    };
    \`\`\`

    ---

    ## The IS-A Relationship

    Inheritance models an **IS-A** relationship:

    \`\`\`
    ✅ Valid IS-A relationships (use inheritance):
       Dog     IS-A  Animal
       Warrior IS-A  Character
       Circle  IS-A  Shape
       Manager IS-A  Employee
       SavingsAccount IS-A BankAccount

    ❌ Invalid IS-A (use composition/HAS-A instead):
       Car     HAS-A Engine    → composition: Car has an Engine member
       Student HAS-A Address   → composition: Student has an Address member
    \`\`\`

    ---

    ## Inheritance Terminology

    | Term | Meaning |
    |------|---------|
    | **Base class** (superclass, parent) | The class being inherited from |
    | **Derived class** (subclass, child) | The class that inherits |
    | **Inherit** | Receive base class members automatically |
    | **Override** | Redefine a base class method in the derived class |
    | **Extend** | Add new members in the derived class |`,
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION B: Syntax & the protected Specifier
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 1,
                title: 'Inheritance Syntax & the protected Specifier',
                type: 'EXPLANATION',
                tips: [
                    '`protected` members are private to the outside world but accessible in derived classes — the perfect middle ground for inheritance.',
                    'Use `public` inheritance (`: public Base`) almost always. `private` and `protected` inheritance are advanced and rare.',
                    'A derived class can access public and protected members of the base, but NEVER private members directly.',
                ],
                content: `# Inheritance Syntax & Access in Derived Classes

    ## Declaration Syntax

    \`\`\`cpp
    class DerivedClass : accessSpecifier BaseClass {
        // derived class body
    };
    \`\`\`

    Most common:
    \`\`\`cpp
    class Dog : public Animal {   // Dog inherits publicly from Animal
        // ...
    };
    \`\`\`

    ---

    ## The Three Access Specifiers Revisited

    | Base Member | In Derived (public inh.) | From Outside |
    |-------------|--------------------------|--------------|
    | \`public\`    | public                   | ✅ Accessible |
    | \`protected\` | protected                | ❌ Blocked    |
    | \`private\`   | **NOT accessible**       | ❌ Blocked    |

    ---

    ## Why \`protected\` Exists

    \`private\` blocks derived classes from accessing members directly:

    \`\`\`cpp
    class Animal {
    private:
        string name;   // ← completely hidden, even from derived classes!
    public:
        string getName() { return name; }
    };

    class Dog : public Animal {
    public:
        void bark() {
            cout << name;        // ❌ COMPILE ERROR — name is private!
            cout << getName();   // ✅ use the public method instead
        }
    };
    \`\`\`

    \`protected\` is the middle ground — hidden from outside, but accessible in derived classes:

    \`\`\`cpp
    class Animal {
    protected:
        string name;   // ← accessible in derived classes, not from outside
        int    health;
    };

    class Dog : public Animal {
    public:
        void bark() {
            cout << name << " says: Woof!"; // ✅ can access protected member
            health -= 1;                    // ✅ can modify protected member
        }
    };

    // From outside code:
    Animal a;
    a.name = "Rex"; // ❌ COMPILE ERROR — protected blocks outside access
    \`\`\`

    ---

    ## What the Derived Class Inherits

    \`\`\`cpp
    class Base {
    private:
        int x;        // derived class CANNOT access directly
    protected:
        int y;        // derived class CAN access
    public:
        int z;        // derived class CAN access
        void foo();   // derived class inherits this method
    };

    class Derived : public Base {
    public:
        void bar() {
            x = 1;  // ❌ private — no access
            y = 2;  // ✅ protected — accessible
            z = 3;  // ✅ public — accessible
            foo();  // ✅ public method — inherited
        }
    };
    \`\`\`

    ---

    ## What is NOT Inherited

    - **Constructors** — each class defines its own (but can chain them)
    - **Destructors** — each class has its own destructor
    - **Friend declarations** — friendship is not inherited
    - **Overloaded operators** — assignment operator is not inherited`,
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION C: Code — Basic Inheritance
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 2,
                title: 'Code: Basic Inheritance — Animal Hierarchy',
                type: 'CODE',
                content: '## Building a Real Inheritance Hierarchy\n\nLet\'s build a complete animal hierarchy that shows what\'s inherited, what\'s added, and what\'s overridden.',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Animal → Dog, Cat, Bird',
                        language: 'cpp',
                        code: `#include <iostream>
    #include <string>
    using namespace std;

    // ─────────────────────────────────────────────────────────────────────
    // BASE CLASS — shared data and behaviour for ALL animals
    // ─────────────────────────────────────────────────────────────────────
    class Animal {
    protected:
        string name;
        int    age;
        double weight; // kg

    public:
        // Constructor
        Animal(string n, int a, double w)
            : name(n), age(a), weight(w) { }

        // Shared behaviours
        void eat()   {
            cout << name << " is eating." << endl;
        }
        void sleep() {
            cout << name << " is sleeping." << endl;
        }
        void breathe() {
            cout << name << " breathes." << endl;
        }

        // Getters
        string getName()   const { return name; }
        int    getAge()    const { return age; }
        double getWeight() const { return weight; }

        void printInfo() const {
            cout << "Animal: " << name << " | Age: " << age
                 << " | Weight: " << weight << "kg" << endl;
        }
    };

    // ─────────────────────────────────────────────────────────────────────
    // DERIVED CLASS 1 — Dog IS-A Animal
    // ─────────────────────────────────────────────────────────────────────
    class Dog : public Animal {
    private:
        string breed;
        bool   isVaccinated;

    public:
        // Constructor calls base constructor via initializer list
        Dog(string n, int a, double w, string b, bool vaccinated)
            : Animal(n, a, w),           // ← calls Animal's constructor
              breed(b),
              isVaccinated(vaccinated)
        { }

        // Dog-specific behaviours (NEW — not in Animal)
        void bark()  { cout << name << " says: Woof! Woof!" << endl; }
        void fetch() { cout << name << " fetches the ball!" << endl; }

        // Override printInfo to add Dog-specific data
        void printInfo() const {
            Animal::printInfo();   // call base version first
            cout << "  Breed: " << breed
                 << " | Vaccinated: " << (isVaccinated ? "Yes" : "No") << endl;
        }
    };

    // ─────────────────────────────────────────────────────────────────────
    // DERIVED CLASS 2 — Cat IS-A Animal
    // ─────────────────────────────────────────────────────────────────────
    class Cat : public Animal {
    private:
        bool isIndoor;
        int  liveCount; // cats have 9 lives!

    public:
        Cat(string n, int a, double w, bool indoor)
            : Animal(n, a, w), isIndoor(indoor), liveCount(9) { }

        void meow()   { cout << name << " says: Meow~" << endl; }
        void purr()   { cout << name << " purrs contentedly." << endl; }
        void scratch(){ cout << name << " scratches the sofa!" << endl; }

        void printInfo() const {
            Animal::printInfo();
            cout << "  Indoor: " << (isIndoor ? "Yes" : "No")
                 << " | Lives remaining: " << liveCount << endl;
        }
    };

    // ─────────────────────────────────────────────────────────────────────
    // DERIVED CLASS 3 — Bird IS-A Animal
    // ─────────────────────────────────────────────────────────────────────
    class Bird : public Animal {
    private:
        double wingSpan; // metres
        bool   canFly;

    public:
        Bird(string n, int a, double w, double ws, bool fly)
            : Animal(n, a, w), wingSpan(ws), canFly(fly) { }

        void sing() { cout << name << " sings a melody!" << endl; }
        void fly()  {
            if (canFly) cout << name << " soars through the sky!" << endl;
            else        cout << name << " can't fly (flightless bird)." << endl;
        }

        void printInfo() const {
            Animal::printInfo();
            cout << "  Wingspan: " << wingSpan << "m"
                 << " | Can fly: " << (canFly ? "Yes" : "No") << endl;
        }
    };

    // ─────────────────────────────────────────────────────────────────────
    int main() {
        Dog  rex  ("Rex",    3, 30.5, "German Shepherd", true);
        Cat  luna ("Luna",   5,  4.2, true);
        Bird hawk ("Hawk",   2,  1.1, 1.8, true);
        Bird penguin("Pingu",4,  5.5, 0.3, false);

        cout << "=== Information ===" << endl;
        rex.printInfo();
        luna.printInfo();
        hawk.printInfo();
        penguin.printInfo();

        cout << "\n=== Behaviours ===" << endl;
        // Inherited from Animal:
        rex.eat();
        luna.sleep();
        hawk.breathe();

        // Dog-specific:
        rex.bark();
        rex.fetch();

        // Cat-specific:
        luna.meow();
        luna.purr();

        // Bird-specific:
        hawk.fly();
        penguin.fly();  // flightless!
        hawk.sing();

        return 0;
    }`,
                        explanation: 'The `Animal` base class defines shared attributes (`name`, `age`, `weight`) as `protected` so derived classes can use them directly. Each derived class calls the base constructor via the initializer list. `printInfo()` is overridden in each derived class — it calls `Animal::printInfo()` first, then adds class-specific details. Each derived class also adds its own unique methods (`bark()`, `meow()`, `fly()`) that don\'t exist in the base.',
                        highlightLines: [8, 9, 10, 47, 48, 49, 57, 61, 86, 87],
                        isRunnable: true,
                    },
                ],
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION D: Constructor Chaining
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 3,
                title: 'Constructor Chaining in Inheritance',
                type: 'EXPLANATION',
                tips: [
                    'You MUST call the base constructor in the derived class\'s initializer list if the base has no default constructor.',
                    'Constructors execute from BASE to DERIVED (top-down). Destructors run in the opposite order: DERIVED then BASE.',
                    'Use `Base::methodName()` syntax to explicitly call a base class method from the derived class.',
                ],
                content: `# Constructor Chaining

    ## How Constructors Work in Inheritance

    When you create a derived object, C++ guarantees:
    1. The **base class constructor** runs **first**
    2. Then the **derived class constructor** runs

    This ensures the base part of the object is fully initialized before derived-specific code runs.

    ---

    ## Calling the Base Constructor

    Use the **member initializer list** to pass arguments to the base constructor:

    \`\`\`cpp
    class Shape {
    protected:
        string color;
        double x, y;      // position
    public:
        Shape(string c, double x, double y)
            : color(c), x(x), y(y) {
            cout << "Shape constructor" << endl;
        }
    };

    class Circle : public Shape {
    private:
        double radius;
    public:
        Circle(double r, string c, double x, double y)
            : Shape(c, x, y),  // ← call base constructor FIRST in the list
              radius(r)
        {
            cout << "Circle constructor" << endl;
        }
    };

    Circle c(5.0, "red", 0.0, 0.0);
    // Output:
    //   Shape constructor   ← base runs first
    //   Circle constructor  ← then derived
    \`\`\`

    ---

    ## Destruction Order is Reverse

    \`\`\`cpp
    {
        Circle c(5.0, "red", 0.0, 0.0);
        // ... use c ...
    }
    // When c goes out of scope:
    //   ~Circle() runs first (derived)
    //   ~Shape()  runs second (base)
    // Order is always: DERIVED → BASE (reverse of construction)
    \`\`\`

    ---

    ## Default Base Constructor

    If the base has a default constructor (no params), the derived class doesn't need to explicitly call it:

    \`\`\`cpp
    class Base {
    public:
        Base() { cout << "Base default ctor" << endl; } // default
    };

    class Derived : public Base {
    public:
        Derived() {
            // Base() is called automatically — no need to write it
            cout << "Derived ctor" << endl;
        }
    };
    \`\`\`

    ---

    ## Calling Base Methods Explicitly

    Use the scope resolution operator \`::\` to call a base method from a derived method:

    \`\`\`cpp
    class Vehicle {
    public:
        void describe() {
            cout << "I am a vehicle" << endl;
        }
    };

    class Car : public Vehicle {
    public:
        void describe() {
            Vehicle::describe();            // call BASE version explicitly
            cout << "Specifically a car" << endl;
        }
    };

    Car c;
    c.describe();
    // Output:
    //   I am a vehicle        (from Vehicle::describe)
    //   Specifically a car    (from Car's describe)
    \`\`\``,
            },

            {
                order: 4,
                title: 'Code: Constructor Chaining & Method Overriding',
                type: 'CODE',
                content: '## Constructor Chaining and Base Method Calls',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Shape Hierarchy with Constructor Chaining',
                        language: 'cpp',
                        code: `#include <iostream>
    #include <string>
    #include <cmath>
    #include <iomanip>
    using namespace std;

    // ─── BASE CLASS ───────────────────────────────────────────────────────
    class Shape {
    protected:
        string color;
        double posX, posY; // position on canvas

    public:
        Shape(string c, double x = 0, double y = 0)
            : color(c), posX(x), posY(y) {
            cout << "  [Shape ctor]   color=" << color << endl;
        }

        ~Shape() {
            cout << "  [Shape dtor]   color=" << color << endl;
        }

        // Base implementation — all shapes share this
        void describe() const {
            cout << "Shape | color=" << color
                 << " pos=(" << posX << "," << posY << ")" << endl;
        }

        // All shapes must provide area — base gives a default
        virtual double area() const { return 0.0; }

        string getColor() const { return color; }
    };

    // ─── DERIVED: Circle ──────────────────────────────────────────────────
    class Circle : public Shape {
    private:
        double radius;

    public:
        Circle(double r, string c, double x = 0, double y = 0)
            : Shape(c, x, y),  // base constructor runs FIRST
              radius(r)
        {
            cout << "  [Circle ctor]  radius=" << radius << endl;
        }

        ~Circle() {
            cout << "  [Circle dtor]  radius=" << radius << endl;
        }

        double area() const override {
            return M_PI * radius * radius;
        }

        void describe() const {
            Shape::describe();   // call base version first
            cout << "  → Circle | radius=" << radius
                 << " | area=" << fixed << setprecision(2) << area() << endl;
        }
    };

    // ─── DERIVED: Rectangle ───────────────────────────────────────────────
    class Rectangle : public Shape {
    private:
        double width, height;

    public:
        Rectangle(double w, double h, string c, double x = 0, double y = 0)
            : Shape(c, x, y), width(w), height(h) {
            cout << "  [Rect ctor]    " << width << "x" << height << endl;
        }

        ~Rectangle() {
            cout << "  [Rect dtor]    " << width << "x" << height << endl;
        }

        double area() const override { return width * height; }

        void describe() const {
            Shape::describe();
            cout << "  → Rectangle | " << width << "x" << height
                 << " | area=" << area() << endl;
        }
    };

    // ─── DERIVED: Triangle ────────────────────────────────────────────────
    class Triangle : public Shape {
    private:
        double base, heightT;

    public:
        Triangle(double b, double h, string c)
            : Shape(c), base(b), heightT(h) {
            cout << "  [Tri ctor]     base=" << base << endl;
        }

        ~Triangle() {
            cout << "  [Tri dtor]     base=" << base << endl;
        }

        double area() const override { return 0.5 * base * heightT; }

        void describe() const {
            Shape::describe();
            cout << "  → Triangle | base=" << base << " height=" << heightT
                 << " | area=" << area() << endl;
        }
    };

    // ─────────────────────────────────────────────────────────────────────
    int main() {
        cout << "=== Creating shapes (note constructor order) ===" << endl;
        {
            Circle    c(5.0, "red", 1.0, 2.0);
            Rectangle r(8.0, 3.0, "blue");
            Triangle  t(6.0, 4.0, "green");

            cout << "\n=== Shape descriptions ===" << endl;
            c.describe();
            cout << endl;
            r.describe();
            cout << endl;
            t.describe();

            cout << "\n=== Areas ===" << endl;
            cout << fixed << setprecision(4);
            cout << "Circle area:    " << c.area() << endl;
            cout << "Rectangle area: " << r.area() << endl;
            cout << "Triangle area:  " << t.area() << endl;

            cout << "\n=== Scope ends — destructors fire in REVERSE order ===" << endl;
        } // t destroyed, then r, then c (LIFO)

        return 0;
    }`,
                        explanation: 'Watch the constructor output: each derived constructor fires AFTER the base Shape constructor (top-down). When the scope closes, destructors run in LIFO order — Triangle first, then Rectangle, then Circle — and within each object, the derived destructor runs before the base destructor.',
                        highlightLines: [38, 39, 40, 47, 50, 51, 57, 58, 68, 72],
                        isRunnable: true,
                    },
                ],
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION E: Types of Inheritance
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 5,
                title: 'Types of Inheritance in C++',
                type: 'EXPLANATION',
                tips: [
                    'Single inheritance (one base class) is the most common and clearest to reason about.',
                    'Multiple inheritance is powerful but can cause ambiguity — use it only when clearly justified.',
                    'The Diamond Problem occurs in multiple inheritance when two paths lead to the same base class — solved with virtual inheritance.',
                ],
                content: `# Types of Inheritance

    ## 1. Single Inheritance

    One derived class inherits from one base class — the most common form:

    \`\`\`cpp
    class Animal { };
    class Dog : public Animal { };    // Dog ← Animal
    \`\`\`

    \`\`\`
    Animal
      └── Dog
    \`\`\`

    ---

    ## 2. Multi-Level Inheritance

    A chain: derived class becomes the base for another derived class:

    \`\`\`cpp
    class Animal    { };
    class Mammal  : public Animal { };    // Mammal is-a Animal
    class Dog     : public Mammal { };    // Dog is-a Mammal is-a Animal
    \`\`\`

    \`\`\`
    Animal
      └── Mammal
            └── Dog
    \`\`\`

    Dog inherits from **both** Mammal and Animal transitively.

    ---

    ## 3. Hierarchical Inheritance

    Multiple derived classes share the same base:

    \`\`\`cpp
    class Shape   { };
    class Circle  : public Shape { };
    class Square  : public Shape { };
    class Triangle: public Shape { };
    \`\`\`

    \`\`\`
    Shape
      ├── Circle
      ├── Square
      └── Triangle
    \`\`\`

    ---

    ## 4. Multiple Inheritance

    One derived class inherits from two or more base classes:

    \`\`\`cpp
    class Flyable  { public: void fly()  { } };
    class Swimmable{ public: void swim() { } };

    class Duck : public Flyable, public Swimmable {
        // Duck can both fly() and swim()
    };
    \`\`\`

    ---

    ## The Diamond Problem

    When multiple inheritance leads to the same base class through two paths:

    \`\`\`cpp
    class Animal { public: string name; };
    class Flyable : public Animal { };
    class Swimmable : public Animal { };
    class Duck : public Flyable, public Swimmable {
        // Which name? Flyable::name or Swimmable::name? — AMBIGUOUS! ❌
    };
    \`\`\`

    **Solution**: Virtual inheritance

    \`\`\`cpp
    class Animal { public: string name; };
    class Flyable   : virtual public Animal { };  // virtual!
    class Swimmable : virtual public Animal { };  // virtual!
    class Duck : public Flyable, public Swimmable {
        // Only ONE Animal subobject — name is unambiguous ✅
    };
    \`\`\`

    ---

    ## Access Specifiers in Inheritance

    \`\`\`
    class D : public    B { }  // B's public → public,   protected → protected
    class D : protected B { }  // B's public → protected, protected → protected
    class D : private   B { }  // B's public → private,  protected → private

    Tip: Always use 'public' unless you have a very specific reason.
    \`\`\``,
            },

            {
                order: 6,
                title: 'Code: Multi-Level & Multiple Inheritance',
                type: 'CODE',
                content: '## Different Types of Inheritance in Practice',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Multi-Level Inheritance — Employee Hierarchy',
                        language: 'cpp',
                        code: `#include <iostream>
    #include <string>
    #include <iomanip>
    using namespace std;

    // ─── LEVEL 1: Person — most general ───────────────────────────────────
    class Person {
    protected:
        string name;
        int    age;
    public:
        Person(string n, int a) : name(n), age(a) { }

        virtual void introduce() const {
            cout << "Hi, I'm " << name << ", age " << age << "." << endl;
        }
        string getName() const { return name; }
    };

    // ─── LEVEL 2: Employee IS-A Person ────────────────────────────────────
    class Employee : public Person {
    protected:
        string company;
        double salary;
        int    employeeId;

    public:
        Employee(string n, int a, string co, double sal, int id)
            : Person(n, a),   // chain up to Person
              company(co), salary(sal), employeeId(id) { }

        void introduce() const override {
            Person::introduce();   // call grandparent indirectly via Person
            cout << "  I work at " << company
                 << " (ID #" << employeeId << ") earning $"
                 << fixed << setprecision(0) << salary << "/yr" << endl;
        }

        double getSalary()   const { return salary; }
        string getCompany()  const { return company; }
        void   setSalary(double s) { if (s > 0) salary = s; }
    };

    // ─── LEVEL 3: Manager IS-A Employee IS-A Person ───────────────────────
    class Manager : public Employee {
    private:
        int    teamSize;
        string department;

    public:
        Manager(string n, int a, string co, double sal, int id, int team, string dept)
            : Employee(n, a, co, sal, id),   // chain up to Employee
              teamSize(team), department(dept) { }

        void introduce() const override {
            Employee::introduce();   // call Employee's version
            cout << "  I manage the " << department
                 << " department (" << teamSize << " direct reports)" << endl;
        }

        void giveRaise(Employee& emp, double percent) {
            double increase = emp.getSalary() * percent / 100.0;
            emp.setSalary(emp.getSalary() + increase);
            cout << "  " << name << " gave " << emp.getName()
                 << " a " << percent << "% raise (+$"
                 << fixed << setprecision(0) << increase << ")" << endl;
        }

        int    getTeamSize()   const { return teamSize; }
        string getDepartment() const { return department; }
    };

    int main() {
        Person   alice("Alice", 28);
        Employee bob  ("Bob",   32, "TechCorp", 75000, 1001);
        Manager  carol("Carol", 40, "TechCorp", 120000, 2001, 8, "Engineering");

        cout << "=== Introductions ===" << endl;
        alice.introduce();
        cout << endl;
        bob.introduce();
        cout << endl;
        carol.introduce();

        cout << "\n=== Manager gives raise ===" << endl;
        carol.giveRaise(bob, 10.0);

        cout << "\n=== Bob after raise ===" << endl;
        bob.introduce();

        cout << "\n=== Type checks ===" << endl;
        // Manager IS-A Employee IS-A Person — all true!
        cout << "Carol's team size: " << carol.getTeamSize() << endl;
        cout << "Carol's name (from Person): " << carol.getName() << endl;

        return 0;
    }`,
                        explanation: '`Manager` inherits from `Employee` which inherits from `Person` — a three-level chain. `carol.introduce()` calls `Employee::introduce()` which calls `Person::introduce()` — each layer adds its own information. `carol.getName()` works because `Manager` transitively inherits the `getName()` method from `Person` through `Employee`.',
                        highlightLines: [27, 28, 52, 53, 57, 58],
                        isRunnable: true,
                    },
                    {
                        order: 1,
                        title: 'Multiple Inheritance — Robot Example',
                        language: 'cpp',
                        code: `#include <iostream>
    #include <string>
    using namespace std;

    // ─── Two independent base classes ─────────────────────────────────────
    class Flyable {
    public:
        void takeOff() { cout << "  Lifting off the ground..." << endl; }
        void land()    { cout << "  Landing safely..." << endl; }
        void fly(int meters) {
            cout << "  Flying " << meters << " meters at altitude." << endl;
        }
    };

    class Swimmable {
    public:
        void dive()  { cout << "  Diving underwater..." << endl; }
        void swim(int meters) {
            cout << "  Swimming " << meters << " meters." << endl;
        }
        void surface() { cout << "  Surfacing..." << endl; }
    };

    // ─── AmphibiousDrone inherits from BOTH ───────────────────────────────
    class AmphibiousDrone : public Flyable, public Swimmable {
    private:
        string model;
        double batteryLevel; // percentage

    public:
        AmphibiousDrone(string m) : model(m), batteryLevel(100.0) { }

        void status() const {
            cout << "Drone [" << model << "] | Battery: "
                 << batteryLevel << "%" << endl;
        }

        // Combined mission using both inherited capabilities
        void searchAndRescueMission() {
            cout << "\n=== Search & Rescue Mission ===" << endl;
            status();

            cout << "\n[Phase 1: Aerial search]" << endl;
            takeOff();           // from Flyable
            fly(500);            // from Flyable
            land();              // from Flyable

            cout << "\n[Phase 2: Underwater search]" << endl;
            dive();              // from Swimmable
            swim(200);           // from Swimmable
            surface();           // from Swimmable

            batteryLevel -= 35.0;
            cout << "\nMission complete! ";
            status();
        }
    };

    int main() {
        AmphibiousDrone scout("Scout-X7");
        scout.searchAndRescueMission();

        // Can be used as either a Flyable OR a Swimmable
        Flyable*    asFlyer  = &scout; // upcast to Flyable interface
        Swimmable*  asSwimmer= &scout; // upcast to Swimmable interface

        cout << "\n=== Via interface pointers ===" << endl;
        asFlyer->fly(100);
        asSwimmer->dive();

        return 0;
    }`,
                        explanation: '`AmphibiousDrone` inherits from both `Flyable` and `Swimmable`. It can call `takeOff()` and `fly()` from `Flyable`, and `dive()` and `swim()` from `Swimmable`. The drone object can also be treated as either a `Flyable*` or a `Swimmable*` — two different interface views of the same object.',
                        highlightLines: [25, 30, 45, 48, 50, 53, 55],
                        isRunnable: true,
                    },
                ],
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION F: Visual
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 7,
                title: 'Visual: Inheritance Hierarchies & Memory Layout',
                type: 'VISUAL',
                content: `# Inheritance: Diagrams & Memory

    ## Class Hierarchy Diagrams

    \`\`\`
    SINGLE:           MULTI-LEVEL:         HIERARCHICAL:      MULTIPLE:
    ────────          ─────────────────    ──────────────     ─────────────
     Animal             Animal               Shape             Flyable Swimmable
       └─ Dog             └─ Mammal            ├─ Circle          └─────┬─────┘
                                └─ Dog         ├─ Square               Duck
                                               └─ Triangle
    \`\`\`

    ---

    ## Memory Layout of a Derived Object

    When you create a \`Dog\` object, memory contains BOTH the Animal part AND the Dog part:

    \`\`\`
    Dog object in memory:
    ┌─────────────────────────────────────────┐
    │  ← ANIMAL SUBOBJECT (from base class)  │
    │  ┌─────────────────────────────────┐    │
    │  │  name   = "Rex"    (string)     │    │
    │  │  age    = 3        (int)        │    │
    │  │  weight = 30.5     (double)     │    │
    │  └─────────────────────────────────┘    │
    │                                         │
    │  ← DOG-SPECIFIC DATA (added by Dog)    │
    │  ┌─────────────────────────────────┐    │
    │  │  breed  = "Shepherd" (string)   │    │
    │  │  isVac  = true       (bool)     │    │
    │  └─────────────────────────────────┘    │
    └─────────────────────────────────────────┘
    \`\`\`

    > The base class "subobject" always appears first in memory.

    ---

    ## Constructor/Destructor Execution Order

    \`\`\`
    Creating a Manager (Level 3):

      Constructor calls flow DOWN (base → derived):
      Person(n, a)        ← runs 1st
         └─ Employee(...)   ← runs 2nd
               └─ Manager(...)  ← runs 3rd

      Destructor calls flow UP (derived → base):
      ~Manager()          ← runs 1st
         └─ ~Employee()    ← runs 2nd
               └─ ~Person()    ← runs 3rd

    Each level's ctor/dtor is responsible for its own members only.
    \`\`\`

    ---

    ## Access Specifier Through Inheritance

    \`\`\`
    Base member:    public         protected      private
    ───────────────────────────────────────────────────────
    In Derived:     Accessible     Accessible     ❌ NOT accessible
    Via object:     Accessible     ❌ Blocked     ❌ Blocked

    OUTSIDE CODE can only see PUBLIC members — even of the DERIVED class.
    DERIVED class can see its own members + base public + base protected.
    DERIVED class CANNOT see base private members directly.
    \`\`\`

    ---

    ## IS-A vs HAS-A: The Design Decision

    \`\`\`
    IS-A → Use Inheritance:               HAS-A → Use Composition:
    ────────────────────────────────────  ──────────────────────────────────
    Dog IS-A Animal           ✅           Car HAS-A Engine          ✅
      class Dog : public Animal             class Car { Engine eng; };

    Circle IS-A Shape         ✅           Student HAS-A Address     ✅
      class Circle : public Shape           class Student { Address addr; };

    Manager IS-A Employee     ✅           Team HAS-A vector<Player> ✅
      class Manager : public Employee       class Team { vector<Player> pl; };

    ❌ WRONG:
    Phone IS-A Battery        ❌           Phone HAS-A Battery       ✅
      Don't inherit — a phone has a battery, it IS NOT a battery
    \`\`\``,
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION G: Quiz
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 8,
                title: 'Quiz: Inheritance',
                type: 'QUIZ',
                content: '## Test Your Understanding of Inheritance',
                stepData: {
                    questions: [
                        {
                            question: 'What does "public inheritance" (`class Dog : public Animal`) mean?',
                            options: [
                                { id: 'a', text: 'All Animal members become public in Dog', isCorrect: false },
                                { id: 'b', text: 'Animal\'s public members stay public in Dog, protected stay protected', isCorrect: true },
                                { id: 'c', text: 'All Animal members become private in Dog', isCorrect: false },
                                { id: 'd', text: 'Dog can access Animal\'s private members', isCorrect: false },
                            ],
                            explanation: 'Public inheritance preserves the access levels of the base: public stays public, protected stays protected. This is the IS-A form of inheritance and is by far the most common.',
                        },
                        {
                            question: 'Which access specifier allows derived classes to access a member but blocks outside code?',
                            options: [
                                { id: 'a', text: 'private', isCorrect: false },
                                { id: 'b', text: 'public', isCorrect: false },
                                { id: 'c', text: 'protected', isCorrect: true },
                                { id: 'd', text: 'internal', isCorrect: false },
                            ],
                            explanation: '`protected` is the "middle ground" — accessible inside the class AND inside derived classes, but blocked from all outside code. It exists specifically to support inheritance.',
                        },
                        {
                            question: 'In what order do constructors and destructors execute for a derived object?',
                            options: [
                                { id: 'a', text: 'Derived ctor → Base ctor, then Derived dtor → Base dtor', isCorrect: false },
                                { id: 'b', text: 'Base ctor → Derived ctor, then Derived dtor → Base dtor', isCorrect: true },
                                { id: 'c', text: 'Base ctor → Derived ctor, then Base dtor → Derived dtor', isCorrect: false },
                                { id: 'd', text: 'Both run simultaneously', isCorrect: false },
                            ],
                            explanation: 'Construction is top-down (base first, then derived). Destruction is bottom-up / reverse (derived first, then base). This ensures base is initialized before derived needs it, and derived is cleaned up before base.',
                        },
                        {
                            question: 'Can a derived class access private members of its base class directly?',
                            options: [
                                { id: 'a', text: 'Yes, always', isCorrect: false },
                                { id: 'b', text: 'Yes, but only if the member is also in the derived class', isCorrect: false },
                                { id: 'c', text: 'No — private members are inaccessible even to derived classes', isCorrect: true },
                                { id: 'd', text: 'Yes, but only through a pointer', isCorrect: false },
                            ],
                            explanation: 'Private members are truly private — they can only be accessed within the class that declares them. Not by derived classes, not by friends of the derived class. Use `protected` if derived classes need direct access.',
                        },
                        {
                            question: 'What is the "Diamond Problem" in multiple inheritance?',
                            options: [
                                { id: 'a', text: 'When inheritance creates a circular loop', isCorrect: false },
                                { id: 'b', text: 'When a class inherits from two classes that both inherit from the same base, creating ambiguity', isCorrect: true },
                                { id: 'c', text: 'When a diamond-shaped object is stored in a class', isCorrect: false },
                                { id: 'd', text: 'When destructors conflict in multiple inheritance', isCorrect: false },
                            ],
                            explanation: 'The Diamond Problem occurs when class D inherits from B and C, and both B and C inherit from A. D then has two copies of A\'s members — ambiguous! Solved with `virtual` inheritance.',
                        },
                        {
                            question: 'How do you call a base class\'s version of an overridden method from within the derived class?',
                            options: [
                                { id: 'a', text: '`super.method()`', isCorrect: false },
                                { id: 'b', text: '`parent::method()`', isCorrect: false },
                                { id: 'c', text: '`Base::method()`', isCorrect: true },
                                { id: 'd', text: '`this->base->method()`', isCorrect: false },
                            ],
                            explanation: 'Use the scope resolution operator with the base class name: `Animal::eat()` explicitly calls `Animal`\'s version of `eat()`, even if Dog has overridden it.',
                        },
                        {
                            question: 'Which relationship should use inheritance and which should use composition?',
                            options: [
                                { id: 'a', text: 'Car-Engine → inheritance; Dog-Animal → composition', isCorrect: false },
                                { id: 'b', text: 'Dog-Animal → inheritance; Car-Engine → composition', isCorrect: true },
                                { id: 'c', text: 'Both should use inheritance', isCorrect: false },
                                { id: 'd', text: 'Both should use composition', isCorrect: false },
                            ],
                            explanation: 'Dog IS-A Animal → inheritance. A Car HAS-A Engine (Car is not a type of Engine) → composition (Engine as a member variable). IS-A = inheritance; HAS-A = composition.',
                        },
                        {
                            question: 'What does the following mean: `class Manager : public Employee`?',
                            options: [
                                { id: 'a', text: 'Manager and Employee share memory', isCorrect: false },
                                { id: 'b', text: 'Manager is a derived class that publicly inherits all public and protected members from Employee', isCorrect: true },
                                { id: 'c', text: 'Employee is derived from Manager', isCorrect: false },
                                { id: 'd', text: 'Manager can access Employee\'s private members', isCorrect: false },
                            ],
                            explanation: '`class Manager : public Employee` declares Manager as a publicly derived class of Employee. Manager IS-A Employee — it inherits all public and protected members and can add its own.',
                        },
                    ],
                },
            },

            // ─────────────────────────────────────────────────────────────────────
            // CHALLENGE
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 9,
                title: 'Challenge: Vehicle Fleet System',
                type: 'CHALLENGE',
                content: `## 🏆 Challenge: Vehicle Fleet Hierarchy

    Build a multi-level vehicle hierarchy demonstrating single, hierarchical, and multi-level inheritance.

    **Hierarchy:**
    \`\`\`
    Vehicle  (base)
    ├── LandVehicle : public Vehicle
    │    ├── Car    : public LandVehicle
    │    └── Truck  : public LandVehicle
    └── WaterVehicle : public Vehicle
         └── Boat   : public WaterVehicle
    \`\`\`

    **Vehicle (base):**
    - protected: \`make\`, \`model\`, \`year\` (int), \`fuelLevel\` (double, 0-100%)
    - Constructor: (make, model, year)
    - Methods: \`refuel(double amount)\`, \`getInfo() const\`, \`getFuelLevel() const\`

    **LandVehicle : public Vehicle:**
    - protected: \`numWheels\` (int), \`speedKph\` (double)
    - Constructor chains to Vehicle
    - Methods: \`accelerate(double kph)\`, \`brake(double kph)\`, \`getInfo() const\` (calls Vehicle::getInfo())

    **Car : public LandVehicle:**
    - private: \`numSeats\`, \`isConvertible\`
    - Overrides \`getInfo()\`, adds \`honk()\`

    **Truck : public LandVehicle:**
    - private: \`payloadTonnes\` (double), \`isLoaded\` (bool)
    - Overrides \`getInfo()\`, adds \`loadCargo()\`, \`unloadCargo()\`

    **WaterVehicle : public Vehicle:**
    - protected: \`lengthMetres\` (double)
    - Methods: \`getInfo() const\`

    **Boat : public WaterVehicle:**
    - private: \`motorHP\` (int), \`isAnchored\` (bool)
    - Overrides \`getInfo()\`, adds \`anchor()\`, \`castOff()\`

    In \`main\`: Create one of each, demonstrate all methods, show refueling.`,
                stepData: {
                    starterCode: `#include <iostream>
    #include <string>
    using namespace std;

    // TODO: class Vehicle (base)

    // TODO: class LandVehicle : public Vehicle

    // TODO: class Car : public LandVehicle

    // TODO: class Truck : public LandVehicle

    // TODO: class WaterVehicle : public Vehicle

    // TODO: class Boat : public WaterVehicle

    int main() {
        // TODO: create Car, Truck, Boat objects
        // TODO: call getInfo() on each
        // TODO: accelerate/brake the land vehicles
        // TODO: refuel a vehicle
        // TODO: load/unload the truck
        // TODO: anchor/castOff the boat
        return 0;
    }`,
                    solution: `#include <iostream>
    #include <string>
    #include <iomanip>
    using namespace std;

    // ─── BASE: Vehicle ─────────────────────────────────────────────────────
    class Vehicle {
    protected:
        string make, model;
        int    year;
        double fuelLevel; // 0-100%
    public:
        Vehicle(string mk, string mo, int yr)
            : make(mk), model(mo), year(yr), fuelLevel(100.0) { }

        void refuel(double amount) {
            fuelLevel = min(100.0, fuelLevel + amount);
            cout << "  Refuelled " << make << " " << model
                 << " → fuel: " << fuelLevel << "%" << endl;
        }

        double getFuelLevel() const { return fuelLevel; }

        virtual void getInfo() const {
            cout << year << " " << make << " " << model
                 << " | Fuel: " << fixed << setprecision(1) << fuelLevel << "%" ;
        }
    };

    // ─── LandVehicle IS-A Vehicle ──────────────────────────────────────────
    class LandVehicle : public Vehicle {
    protected:
        int    numWheels;
        double speedKph;
    public:
        LandVehicle(string mk, string mo, int yr, int wheels)
            : Vehicle(mk, mo, yr), numWheels(wheels), speedKph(0.0) { }

        void accelerate(double kph) {
            speedKph += kph;
            fuelLevel -= kph * 0.05;
            fuelLevel = max(0.0, fuelLevel);
            cout << "  " << make << " " << model << " accelerates to "
                 << speedKph << " km/h (fuel: " << fuelLevel << "%)" << endl;
        }

        void brake(double kph) {
            speedKph = max(0.0, speedKph - kph);
            cout << "  " << make << " " << model << " slows to "
                 << speedKph << " km/h" << endl;
        }

        void getInfo() const override {
            Vehicle::getInfo();
            cout << " | Wheels: " << numWheels
                 << " | Speed: " << speedKph << " km/h";
        }
    };

    // ─── Car IS-A LandVehicle ─────────────────────────────────────────────
    class Car : public LandVehicle {
    private:
        int  numSeats;
        bool isConvertible;
    public:
        Car(string mk, string mo, int yr, int seats, bool conv)
            : LandVehicle(mk, mo, yr, 4),
              numSeats(seats), isConvertible(conv) { }

        void honk() {
            cout << "  " << make << " " << model << ": BEEP BEEP! 📯" << endl;
        }

        void getInfo() const override {
            cout << "[CAR]    "; LandVehicle::getInfo();
            cout << " | Seats: " << numSeats
                 << " | Convertible: " << (isConvertible ? "Yes" : "No") << endl;
        }
    };

    // ─── Truck IS-A LandVehicle ───────────────────────────────────────────
    class Truck : public LandVehicle {
    private:
        double payloadTonnes;
        bool   isLoaded;
    public:
        Truck(string mk, string mo, int yr, double payload)
            : LandVehicle(mk, mo, yr, 18),
              payloadTonnes(payload), isLoaded(false) { }

        void loadCargo() {
            if (isLoaded) cout << "  Truck already loaded!" << endl;
            else { isLoaded = true; cout << "  Truck loaded with " << payloadTonnes << " tonnes." << endl; }
        }

        void unloadCargo() {
            if (!isLoaded) cout << "  Truck already empty!" << endl;
            else { isLoaded = false; cout << "  Cargo unloaded." << endl; }
        }

        void getInfo() const override {
            cout << "[TRUCK]  "; LandVehicle::getInfo();
            cout << " | Payload: " << payloadTonnes << "t"
                 << " | Loaded: " << (isLoaded ? "Yes" : "No") << endl;
        }
    };

    // ─── WaterVehicle IS-A Vehicle ────────────────────────────────────────
    class WaterVehicle : public Vehicle {
    protected:
        double lengthMetres;
    public:
        WaterVehicle(string mk, string mo, int yr, double len)
            : Vehicle(mk, mo, yr), lengthMetres(len) { }

        void getInfo() const override {
            Vehicle::getInfo();
            cout << " | Length: " << lengthMetres << "m";
        }
    };

    // ─── Boat IS-A WaterVehicle ───────────────────────────────────────────
    class Boat : public WaterVehicle {
    private:
        int  motorHP;
        bool isAnchored;
    public:
        Boat(string mk, string mo, int yr, double len, int hp)
            : WaterVehicle(mk, mo, yr, len),
              motorHP(hp), isAnchored(true) { }

        void anchor()  {
            isAnchored = true;
            cout << "  " << model << " anchored. ⚓" << endl;
        }
        void castOff() {
            isAnchored = false;
            cout << "  " << model << " cast off — underway! 🚤" << endl;
        }

        void getInfo() const override {
            cout << "[BOAT]   "; WaterVehicle::getInfo();
            cout << " | Motor: " << motorHP << "HP"
                 << " | Anchored: " << (isAnchored ? "Yes" : "No") << endl;
        }
    };

    // ─────────────────────────────────────────────────────────────────────
    int main() {
        Car   myCar  ("Toyota", "Camry",    2023, 5,    false);
        Truck myTruck("Volvo",  "FH16",     2022, 22.5);
        Boat  myBoat ("Bayliner","Element", 2021, 5.5,  150);

        cout << "=== Fleet Info ===" << endl;
        myCar.getInfo();
        myTruck.getInfo();
        myBoat.getInfo();

        cout << "\n=== Car operations ===" << endl;
        myCar.accelerate(60.0);
        myCar.accelerate(40.0);
        myCar.honk();
        myCar.brake(30.0);

        cout << "\n=== Truck operations ===" << endl;
        myTruck.loadCargo();
        myTruck.accelerate(80.0);
        myTruck.loadCargo(); // already loaded!
        myTruck.unloadCargo();

        cout << "\n=== Boat operations ===" << endl;
        myBoat.castOff();
        myBoat.anchor();

        cout << "\n=== Refuelling ===" << endl;
        myCar.refuel(20.0);
        myTruck.refuel(50.0);

        cout << "\n=== Updated Fleet Info ===" << endl;
        myCar.getInfo();
        myTruck.getInfo();
        myBoat.getInfo();

        return 0;
    }`,
                    hints: [
                        'Each constructor must chain up: `Car(...)` initializes `LandVehicle(...)` which initializes `Vehicle(...)`. Use the initializer list at each level.',
                        '`Vehicle::getInfo()` prints make/model/year/fuel. `LandVehicle::getInfo()` calls `Vehicle::getInfo()` then adds wheels/speed. `Car::getInfo()` calls `LandVehicle::getInfo()` then adds seats/convertible.',
                        '`max()` and `min()` require `<algorithm>` — or you can use a ternary operator.',
                        '`fuelLevel` is in Vehicle (protected) — it is directly accessible in `LandVehicle::accelerate()` because LandVehicle is a derived class.',
                        'Mark `getInfo()` with `override` in each derived class to confirm you are intentionally overriding the base version.',
                    ],
                    language: 'cpp',
                },
            },

            {
                order: 10,
                title: 'Summary: Inheritance',
                type: 'SUMMARY',
                content: `# Summary: Inheritance

    ## Core Concept

    **Inheritance** lets a derived class automatically receive all public and protected members of a base class, then extend or specialize it.

    \`\`\`cpp
    class Derived : public Base { };  // Derived IS-A Base
    \`\`\`

    ## The Three Access Specifiers for Members

    | Member in Base | In Derived (public inh.) | From Outside |
    |----------------|--------------------------|--------------|
    | \`public\`      | public                   | ✅ Yes |
    | \`protected\`   | protected                | ❌ No |
    | \`private\`     | ❌ Not accessible        | ❌ No |

    ## Constructor & Destructor Order

    \`\`\`
    Creating:   Base → Derived           (top-down)
    Destroying: Derived → Base           (bottom-up / reverse)
    \`\`\`

    Call base constructor explicitly in the initializer list:
    \`\`\`cpp
    Derived(args) : Base(some_args), myMember(val) { }
    \`\`\`

    ## Types of Inheritance

    | Type | Description |
    |------|-------------|
    | **Single** | One derived ← one base |
    | **Multi-level** | A ← B ← C (chain) |
    | **Hierarchical** | Multiple derived ← one base |
    | **Multiple** | One derived ← multiple bases |

    ## Key Rules

    1. **IS-A test**: Only use inheritance for true IS-A relationships
    2. **HAS-A** → use composition (member variable), not inheritance
    3. **private** base members: never directly accessible in derived classes — use \`protected\`
    4. **Base::** prefix to call a base class version of an overridden method
    5. **Diamond problem**: solved with \`virtual\` inheritance

    > 🎯 **Next up**: Polymorphism — one interface, many implementations, virtual functions, and abstract classes!`,
            },
        ],
    });

    // ═══════════════════════════════════════════════════════════════════════════════
    // TOPIC 5: cpp-polymorphism
    // ═══════════════════════════════════════════════════════════════════════════════

    await createLearn({
        slug: 'cpp-polymorphism',
        title: 'Polymorphism',
        description:
            'Master the fourth pillar of OOP in C++: compile-time polymorphism (function & operator overloading), runtime polymorphism (virtual functions, vtable), the override and final keywords, abstract classes, pure virtual functions, and writing truly extensible code through base class pointers.',
        difficulty: 'INTERMEDIATE',
        topicSlug: 'cpp-unit4-oop',
        unitTitle: 'Unit 4: Object-Oriented Programming',
        estimatedTime: 65,
        tags: [
            'polymorphism', 'virtual-functions', 'vtable', 'override', 'abstract-class',
            'pure-virtual', 'compile-time', 'runtime', 'base-pointer', 'final', 'OOP'
        ],
        iconEmoji: '🎭',
        steps: [

            // ─────────────────────────────────────────────────────────────────────
            // SECTION A: What is Polymorphism?
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 0,
                title: 'What is Polymorphism?',
                type: 'EXPLANATION',
                tips: [
                    'Polymorphism = "many forms" — one interface operating on many different types.',
                    'Compile-time polymorphism is resolved at compile time (faster). Runtime polymorphism is resolved at runtime (more flexible).',
                    'Without virtual functions, C++ uses the POINTER type, not the OBJECT type, to decide which method to call — this is the key problem virtual solves.',
                ],
                content: `# Polymorphism

    ## What Does "Polymorphism" Mean?

    **Polymorphism** (Greek: "many forms") is the ability of one interface to work with many different underlying types.

    You already know one kind: **function overloading** — the same function name with different parameter types.

    \`\`\`cpp
    void print(int x)    { cout << x; }
    void print(double x) { cout << x; }
    void print(string x) { cout << x; }
    // Same name — different forms — resolved at compile time
    \`\`\`

    But there is a far more powerful form: **runtime polymorphism** via virtual functions.

    ---

    ## The Two Types

    | Type | When Resolved | Mechanism |
    |------|--------------|-----------|
    | **Compile-time** (static) | At compile time | Function overloading, operator overloading, templates |
    | **Runtime** (dynamic) | At runtime | Virtual functions, base class pointers/references |

    ---

    ## The Problem That Runtime Polymorphism Solves

    Suppose you have a drawing application with many shape types:

    \`\`\`cpp
    // Without polymorphism:
    void drawShapes(Circle shapes[], int n)   { for (int i=0;i<n;i++) shapes[i].draw(); }
    void drawShapes(Square shapes[], int n)   { for (int i=0;i<n;i++) shapes[i].draw(); }
    void drawShapes(Triangle shapes[], int n) { for (int i=0;i<n;i++) shapes[i].draw(); }
    // New shape? Write another function! Scales terribly. 😱
    \`\`\`

    \`\`\`cpp
    // With runtime polymorphism:
    void drawShapes(Shape* shapes[], int n) {
        for (int i = 0; i < n; i++) {
            shapes[i]->draw();  // ← automatically calls the RIGHT draw() for each shape!
        }
    }
    // Works for ANY current or FUTURE shape type! 🎉
    \`\`\`

    ---

    ## The Key Insight

    With runtime polymorphism, you write code that works with the **base class interface** — but at runtime, the correct **derived class method** is called automatically based on the actual object type.

    \`\`\`
    Shape* ptr = new Circle(...);
    ptr->draw();   // calls Circle::draw() — even though ptr is a Shape*!
                   // The runtime type of the OBJECT determines the method.
    \`\`\``,
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION B: Compile-Time Polymorphism
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 1,
                title: 'Compile-Time Polymorphism',
                type: 'EXPLANATION',
                tips: [
                    'Compile-time polymorphism has zero runtime overhead — the compiler resolves everything before the program runs.',
                    'Operator overloading lets you define what `+`, `-`, `==`, `<<`, etc. mean for your custom types.',
                    'Templates (generics) are another form of compile-time polymorphism — covered in Unit 5.',
                ],
                content: `# Compile-Time Polymorphism

    ## Function Overloading (Revisited)

    The compiler determines which overload to call based on the argument types:

    \`\`\`cpp
    int    max(int a,    int b)    { return a > b ? a : b; }
    double max(double a, double b) { return a > b ? a : b; }
    string max(string a, string b) { return a > b ? a : b; }

    max(3, 5);           // calls max(int, int)    → 5
    max(3.14, 2.71);     // calls max(double, double) → 3.14
    max("apple","mango");// calls max(string, string) → "mango"
    \`\`\`

    ---

    ## Operator Overloading

    You can define what built-in operators mean for your custom classes:

    \`\`\`cpp
    class Vector2D {
    public:
        double x, y;
        Vector2D(double x, double y) : x(x), y(y) { }

        // Overload + to add vectors
        Vector2D operator+(const Vector2D& other) const {
            return Vector2D(x + other.x, y + other.y);
        }

        // Overload == to compare
        bool operator==(const Vector2D& other) const {
            return x == other.x && y == other.y;
        }

        // Overload * for scalar multiplication
        Vector2D operator*(double scalar) const {
            return Vector2D(x * scalar, y * scalar);
        }

        // Overload << for cout output (as friend)
        friend ostream& operator<<(ostream& os, const Vector2D& v) {
            os << "(" << v.x << ", " << v.y << ")";
            return os;
        }
    };

    Vector2D a(1.0, 2.0), b(3.0, 4.0);
    Vector2D c = a + b;        // calls operator+
    Vector2D d = a * 2.0;      // calls operator*
    cout << c << endl;          // calls operator<< → (4, 6)
    bool same = (a == b);       // calls operator==
    \`\`\`

    ---

    ## Operators You Can Overload

    \`\`\`
    Arithmetic:    + - * / % ++ --
    Comparison:    == != < > <= >=
    Assignment:    = += -= *= /=
    Bitwise:       & | ^ ~ << >>
    Logical:       ! && ||
    Access:        -> [] ()
    Stream:        << >> (typically as friend functions)
    \`\`\`

    ---

    ## Rules for Operator Overloading

    1. Cannot invent new operators (no \`**\` for power)
    2. Cannot change the number of operands (unary stays unary)
    3. Cannot change precedence or associativity
    4. At least one operand must be a user-defined type
    5. Some operators CANNOT be overloaded: \`.\`, \`::\`, \`sizeof\`, \`?:\``,
            },

            {
                order: 2,
                title: 'Compile-Time Polymorphism — Code',
                type: 'CODE',
                content: '## Operator Overloading in Practice',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Matrix Class with Full Operator Overloading',
                        language: 'cpp',
                        code: `#include <iostream>
    #include <iomanip>
    using namespace std;

    // 2x2 Matrix class demonstrating operator overloading
    class Matrix2x2 {
    private:
        double data[2][2];

    public:
        // Constructor — fill all cells with a value (default 0)
        Matrix2x2(double val = 0.0) {
            for (int r = 0; r < 2; r++)
                for (int c = 0; c < 2; c++)
                    data[r][c] = val;
        }

        // Constructor from individual values
        Matrix2x2(double a, double b, double c, double d) {
            data[0][0]=a; data[0][1]=b;
            data[1][0]=c; data[1][1]=d;
        }

        // ── Operator overloads ───────────────────────────────────────────

        // Matrix addition
        Matrix2x2 operator+(const Matrix2x2& other) const {
            return Matrix2x2(
                data[0][0] + other.data[0][0],  data[0][1] + other.data[0][1],
                data[1][0] + other.data[1][0],  data[1][1] + other.data[1][1]
            );
        }

        // Scalar multiplication
        Matrix2x2 operator*(double scalar) const {
            return Matrix2x2(
                data[0][0]*scalar, data[0][1]*scalar,
                data[1][0]*scalar, data[1][1]*scalar
            );
        }

        // Matrix multiplication
        Matrix2x2 operator*(const Matrix2x2& other) const {
            return Matrix2x2(
                data[0][0]*other.data[0][0] + data[0][1]*other.data[1][0],
                data[0][0]*other.data[0][1] + data[0][1]*other.data[1][1],
                data[1][0]*other.data[0][0] + data[1][1]*other.data[1][0],
                data[1][0]*other.data[0][1] + data[1][1]*other.data[1][1]
            );
        }

        // Equality
        bool operator==(const Matrix2x2& other) const {
            for (int r = 0; r < 2; r++)
                for (int c = 0; c < 2; c++)
                    if (data[r][c] != other.data[r][c]) return false;
            return true;
        }

        // Element access: mat[row][col]
        double* operator[](int row) { return data[row]; }
        const double* operator[](int row) const { return data[row]; }

        // Stream output
        friend ostream& operator<<(ostream& os, const Matrix2x2& m) {
            os << fixed << setprecision(2);
            os << "[ " << m.data[0][0] << "  " << m.data[0][1] << " ]\n";
            os << "[ " << m.data[1][0] << "  " << m.data[1][1] << " ]";
            return os;
        }

        // Compute determinant
        double det() const {
            return data[0][0]*data[1][1] - data[0][1]*data[1][0];
        }
    };

    int main() {
        Matrix2x2 A(1, 2, 3, 4);
        Matrix2x2 B(5, 6, 7, 8);

        cout << "A:\n" << A << "\n\n";
        cout << "B:\n" << B << "\n\n";

        cout << "A + B:\n" << (A + B) << "\n\n";   // operator+
        cout << "A * 2:\n" << (A * 2.0) << "\n\n"; // scalar *
        cout << "A * B:\n" << (A * B) << "\n\n";   // matrix *

        cout << "det(A) = " << A.det() << endl;     // ad - bc = 1*4 - 2*3 = -2
        cout << "A == B: " << (A == B ? "yes" : "no") << endl;

        // Element access via overloaded []
        cout << "A[0][1] = " << A[0][1] << endl;  // 2

        return 0;
    }`,
                        explanation: 'A `Matrix2x2` class with overloaded `+`, `*` (both scalar and matrix), `==`, `[]`, and `<<`. The expressions `A + B`, `A * 2.0`, `A * B` look exactly like built-in arithmetic — that\'s operator overloading making user-defined types feel native.',
                        highlightLines: [26, 32, 37, 48, 56, 62],
                        isRunnable: true,
                    },
                ],
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION C: Runtime Polymorphism — virtual
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 3,
                title: 'Runtime Polymorphism — virtual Functions',
                type: 'EXPLANATION',
                tips: [
                    'Always declare the base class destructor as `virtual` if the class has any virtual methods — otherwise `delete basePtr` won\'t call the derived destructor.',
                    'A function is virtual in ALL derived classes once declared virtual in the base — you don\'t have to repeat `virtual` (but you should use `override`).',
                    'The `override` keyword (C++11) is not required but is strongly recommended — it tells the compiler you intend to override a virtual function and catches typos.',
                ],
                content: `# Runtime Polymorphism with \`virtual\` Functions

    ## The Problem Without \`virtual\`

    \`\`\`cpp
    class Animal {
    public:
        void speak() { cout << "..." << endl; } // NOT virtual
    };

    class Dog : public Animal {
    public:
        void speak() { cout << "Woof!" << endl; } // hides Animal::speak
    };

    // Through a base class pointer:
    Animal* ptr = new Dog();
    ptr->speak();  // Prints "..." — calls Animal::speak! ❌
                   // The POINTER TYPE (Animal*) decides, not the OBJECT TYPE (Dog)
    \`\`\`

    This is static dispatch — the compiler looks at the pointer type, not the actual object.

    ---

    ## The \`virtual\` Keyword

    Adding \`virtual\` to the base class method enables **dynamic dispatch** — the runtime type of the object decides which method to call:

    \`\`\`cpp
    class Animal {
    public:
        virtual void speak() { cout << "..." << endl; } // VIRTUAL!
        virtual ~Animal() { }                            // virtual destructor!
    };

    class Dog : public Animal {
    public:
        void speak() override { cout << "Woof!" << endl; } // override is recommended
    };

    class Cat : public Animal {
    public:
        void speak() override { cout << "Meow!" << endl; }
    };

    // Through base class pointer — NOW calls the right version:
    Animal* ptr = new Dog();
    ptr->speak();   // "Woof!" ✅  — Dog::speak called even through Animal*!

    Animal* ptr2 = new Cat();
    ptr2->speak();  // "Meow!" ✅

    delete ptr;   // ~Dog() called, then ~Animal() — because destructor is virtual!
    \`\`\`

    ---

    ## The \`override\` Keyword (C++11)

    \`override\` tells the compiler "I intend to override a virtual function". If you make a typo and the signature doesn't match the base, it's a compile error:

    \`\`\`cpp
    class Animal {
    public:
        virtual void speak() const { }
    };

    class Dog : public Animal {
    public:
        void speak() override { }       // ❌ COMPILE ERROR: signature differs (missing const)
        void speak() const override { } // ✅ matches base virtual
        void speek() override { }       // ❌ COMPILE ERROR: no virtual 'speek' in Animal
    };
    \`\`\`

    ---

    ## The \`final\` Keyword (C++11)

    Prevents further overriding:

    \`\`\`cpp
    class Dog : public Animal {
    public:
        void speak() override final { cout << "Woof!"; }
        // No derived class can override speak() anymore
    };

    class Labrador : public Dog {
        void speak() override { } // ❌ COMPILE ERROR: speak() is final in Dog
    };
    \`\`\`

    ---

    ## Virtual Destructor — ESSENTIAL

    If a class has any virtual methods, its destructor MUST be virtual:

    \`\`\`cpp
    Animal* ptr = new Dog();
    delete ptr;
    // Without virtual ~Animal(): only ~Animal() is called — ~Dog() is SKIPPED! Memory leak!
    // With    virtual ~Animal(): ~Dog() runs first, then ~Animal() — correct cleanup ✅
    \`\`\``,
            },

            {
                order: 4,
                title: 'Runtime Polymorphism — Code',
                type: 'CODE',
                content: '## Virtual Functions & Dynamic Dispatch in Action',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Shape Drawing with Virtual Functions',
                        language: 'cpp',
                        code: `#include <iostream>
    #include <string>
    #include <vector>
    #include <cmath>
    using namespace std;

    // ─── BASE CLASS — establishes the virtual interface ───────────────────
    class Shape {
    protected:
        string color;
    public:
        Shape(string c) : color(c) { }

        // virtual methods — derived classes CAN override
        virtual double area()      const = 0; // pure virtual (covered next!)
        virtual double perimeter() const = 0; // pure virtual
        virtual void   draw()      const {
            cout << "[Shape] color=" << color << " area=" << area() << endl;
        }
        virtual string typeName()  const { return "Shape"; }

        string getColor() const { return color; }

        // CRITICAL: virtual destructor
        virtual ~Shape() {
            cout << "  [~Shape: " << color << " " << typeName() << "]" << endl;
        }
    };

    // ─── Circle ───────────────────────────────────────────────────────────
    class Circle : public Shape {
    private:
        double radius;
    public:
        Circle(double r, string c) : Shape(c), radius(r) { }

        double area()      const override { return M_PI * radius * radius; }
        double perimeter() const override { return 2 * M_PI * radius; }
        string typeName()  const override { return "Circle"; }

        void draw() const override {
            cout << "🔵 Circle r=" << radius
                 << " color=" << color
                 << " area=" << fixed << area() << endl;
        }

        ~Circle() { cout << "  [~Circle r=" << radius << "]" << endl; }
    };

    // ─── Rectangle ────────────────────────────────────────────────────────
    class Rectangle : public Shape {
    private:
        double w, h;
    public:
        Rectangle(double w, double h, string c) : Shape(c), w(w), h(h) { }

        double area()      const override { return w * h; }
        double perimeter() const override { return 2*(w+h); }
        string typeName()  const override { return "Rectangle"; }

        void draw() const override {
            cout << "🟥 Rect " << w << "x" << h
                 << " color=" << color
                 << " area=" << area() << endl;
        }

        ~Rectangle() { cout << "  [~Rect " << w << "x" << h << "]" << endl; }
    };

    // ─── Triangle ─────────────────────────────────────────────────────────
    class Triangle : public Shape {
    private:
        double a, b, c; // three sides
    public:
        Triangle(double a, double b, double c, string col)
            : Shape(col), a(a), b(b), c(c) { }

        double perimeter() const override { return a + b + c; }
        double area() const override {
            double s = perimeter() / 2.0;  // Heron's formula
            return sqrt(s*(s-a)*(s-b)*(s-c));
        }
        string typeName() const override { return "Triangle"; }

        void draw() const override {
            cout << "🔺 Triangle (" << a << "," << b << "," << c << ")"
                 << " color=" << color
                 << " area=" << fixed << area() << endl;
        }

        ~Triangle() { cout << "  [~Triangle]" << endl; }
    };

    // ─── THE POWER OF POLYMORPHISM ────────────────────────────────────────
    // This function works with ANY Shape — present or future
    void printShapeInfo(const Shape* s) {
        cout << "Type: " << s->typeName()
             << " | Area: "      << s->area()
             << " | Perimeter: " << s->perimeter() << endl;
    }

    double totalArea(const vector<Shape*>& shapes) {
        double total = 0;
        for (const Shape* s : shapes) total += s->area(); // virtual dispatch!
        return total;
    }

    void drawAll(const vector<Shape*>& shapes) {
        for (const Shape* s : shapes) s->draw(); // virtual dispatch!
    }

    int main() {
        // A collection of DIFFERENT shape types through a COMMON interface
        vector<Shape*> canvas;
        canvas.push_back(new Circle(5.0, "red"));
        canvas.push_back(new Rectangle(4.0, 6.0, "blue"));
        canvas.push_back(new Triangle(3.0, 4.0, 5.0, "green"));
        canvas.push_back(new Circle(2.0, "yellow"));
        canvas.push_back(new Rectangle(10.0, 2.0, "purple"));

        cout << "=== Drawing all shapes ===" << endl;
        drawAll(canvas);   // one function call draws ALL types correctly!

        cout << "\n=== Shape details ===" << endl;
        for (const Shape* s : canvas) printShapeInfo(s);

        cout << "\n=== Total canvas area ===" << endl;
        cout << "Total: " << totalArea(canvas) << " sq units" << endl;

        cout << "\n=== Cleanup (virtual destructors) ===" << endl;
        for (Shape* s : canvas) {
            delete s;    // virtual ~Shape() ensures correct derived dtor called
        }
        canvas.clear();

        return 0;
    }`,
                        explanation: 'The `vector<Shape*>` holds different shape types through a single base class pointer. `drawAll()` and `totalArea()` call `draw()` and `area()` through base pointers — virtual dispatch automatically calls the correct derived class version at runtime. Virtual destructor ensures `~Circle`, `~Rectangle`, `~Triangle` are called before `~Shape` when using `delete` through a base pointer.',
                        highlightLines: [13, 14, 22, 98, 103, 111, 116, 120, 121],
                        isRunnable: true,
                    },
                ],
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION D: How Virtual Dispatch Works (vtable)
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 5,
                title: 'How Virtual Dispatch Works — The vtable',
                type: 'VISUAL',
                content: `# Inside Virtual Dispatch: The vtable

    ## The Mechanism: Virtual Function Table

    Every class with virtual functions gets a **vtable** (virtual function table) — a hidden array of function pointers. Every object of that class gets a hidden **vptr** (vtable pointer).

    \`\`\`
    CLASS DEFINITIONS → COMPILER CREATES vtables:

    Animal vtable:
    ┌─────────────────────────────────────────┐
    │  &Animal::speak   → Animal::speak code  │
    │  &Animal::~Animal → Animal dtor code    │
    └─────────────────────────────────────────┘

    Dog vtable:
    ┌─────────────────────────────────────────┐
    │  &Dog::speak      → Dog::speak code     │  ← overridden!
    │  &Dog::~Dog       → Dog dtor code       │  ← overridden!
    └─────────────────────────────────────────┘

    Cat vtable:
    ┌─────────────────────────────────────────┐
    │  &Cat::speak      → Cat::speak code     │  ← overridden!
    │  &Cat::~Cat       → Cat dtor code       │
    └─────────────────────────────────────────┘
    \`\`\`

    ---

    ## Object Memory Layout with vptr

    \`\`\`
    Animal* ptr = new Dog("Rex");

    Memory layout of the Dog object:
    ┌──────────────────────────────────────────────────┐
    │  vptr ──────────────────────────────────────────►│ Dog vtable
    │  name = "Rex"   (from Animal base)               │  [Dog::speak]
    │  age  = 3       (from Animal base)               │  [Dog::~Dog ]
    │  breed = "Lab"  (Dog-specific)                   │
    └──────────────────────────────────────────────────┘

    When ptr->speak() is called:
      1. Look up ptr's object → find vptr
      2. Follow vptr → Dog's vtable
      3. Look up speak() slot → &Dog::speak
      4. Call Dog::speak  ← correct! even though ptr is Animal*
    \`\`\`

    ---

    ## Virtual vs Non-Virtual: Call Resolution

    \`\`\`
                          NON-virtual           VIRTUAL
                          ─────────────────     ─────────────────────────
    Resolved:             Compile time          Runtime
    Mechanism:            Pointer type          Object's actual type
    Speed:                Faster (direct call)  Slight overhead (vtable lookup)
    Polymorphism:         ❌ No                 ✅ Yes

    Animal* ptr = new Dog();
    ptr->speak()  non-virtual → Animal::speak called (WRONG — uses pointer type)
    ptr->speak()  virtual     → Dog::speak called    (RIGHT — uses object type)
    \`\`\`

    ---

    ## The Cost of Virtual

    \`\`\`
    Every class with virtual functions:
      +  1 vtable per class  (small, shared across all instances)
      +  1 vptr per object   (typically 8 bytes on 64-bit systems)
      +  1 indirect call     (pointer dereference to find function)

    For most applications: negligible cost, massive design benefit.
    For ultra hot paths (millions of calls/second): consider devirtualization.
    \`\`\`

    ---

    ## static dispatch vs dynamic dispatch

    \`\`\`
    STATIC (non-virtual):            DYNAMIC (virtual):
    ptr->method()                    ptr->method()
        │                                │
        │ compiler checks                │ runtime checks
        │ type of ptr (Animal*)          │ type of *ptr (actual object)
        │                                │
        ▼                                ▼
    Animal::method()                 Dog::method() ← correct!
      (always, regardless            (depends on actual object,
       of actual object)              not pointer type)
    \`\`\``,
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION E: Abstract Classes & Pure Virtual Functions
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 6,
                title: 'Abstract Classes & Pure Virtual Functions',
                type: 'EXPLANATION',
                tips: [
                    'A class with even ONE pure virtual function is abstract — it cannot be instantiated.',
                    'Pure virtual functions are declared with `= 0`. Derived classes MUST implement them or they are also abstract.',
                    'Abstract classes define a CONTRACT — any concrete class that inherits must fulfill it.',
                    'You CAN have a pointer or reference to an abstract class — this is how polymorphism works!',
                ],
                content: `# Abstract Classes & Pure Virtual Functions

    ## The Problem: Incomplete Base Classes

    Sometimes a base class is so general that providing a default implementation makes no sense:

    \`\`\`cpp
    class Shape {
    public:
        virtual double area() const {
            return ???; // What should the area of a generic "Shape" be?
            // No sensible default exists!
        }
    };
    \`\`\`

    ---

    ## Pure Virtual Functions

    Declare a method as **pure virtual** using \`= 0\`:

    \`\`\`cpp
    class Shape {
    public:
        virtual double area()      const = 0;  // pure virtual — no body!
        virtual double perimeter() const = 0;  // pure virtual
        virtual void   draw()      const = 0;  // pure virtual
        virtual ~Shape() { }                   // virtual destructor (NOT pure)
    };
    \`\`\`

    This means: **"Every concrete Shape must provide these methods — there is no base implementation."**

    ---

    ## Abstract Class = Cannot Be Instantiated

    \`\`\`cpp
    Shape s;       // ❌ COMPILE ERROR: Shape is abstract
    Shape* ptr;    // ✅ Pointer to abstract is fine
    Shape& ref;    // ✅ Reference to abstract is fine

    // Only concrete derived classes can be instantiated:
    Circle c;      // ✅ Circle implements area(), perimeter(), draw()
    ptr = &c;      // ✅ Works — polymorphism through abstract pointer
    \`\`\`

    ---

    ## Concrete Derived Classes Must Override All Pure Virtuals

    \`\`\`cpp
    class Circle : public Shape {
    private:
        double radius;
    public:
        // MUST implement all pure virtual methods:
        double area()      const override { return M_PI * radius * radius; }
        double perimeter() const override { return 2 * M_PI * radius; }
        void   draw()      const override { cout << "Drawing Circle..."; }
        // If Circle omits even one, Circle is ALSO abstract (cannot be instantiated)
    };
    \`\`\`

    ---

    ## Abstract Classes as Interfaces

    Abstract classes with ONLY pure virtual functions act as **interfaces** — defining a contract that all derived classes must fulfill:

    \`\`\`cpp
    // Pure interface — defines what a printable object must support
    class Printable {
    public:
        virtual void print()    const = 0;
        virtual void serialize(ostream& os) const = 0;
        virtual ~Printable() { }
    };

    // Pure interface — defines what a saveable object must support  
    class Saveable {
    public:
        virtual bool save(string filename) const = 0;
        virtual bool load(string filename)       = 0;
        virtual ~Saveable() { }
    };

    // A class can implement multiple interfaces
    class Document : public Printable, public Saveable {
        // Must implement: print(), serialize(), save(), load()
    };
    \`\`\`

    ---

    ## Abstract Class vs Interface (C++ vs Java/C#)

    | Concept | C++ | Java/C# |
    |---------|-----|---------|
    | Abstract class | Class with ≥1 pure virtual | Same |
    | Interface | Convention: all pure virtual | \`interface\` keyword |
    | Multiple "interfaces" | ✅ Multiple inheritance | ✅ \`implements\` |`,
            },

            {
                order: 7,
                title: 'Abstract Classes — Code',
                type: 'CODE',
                content: '## Abstract Classes & Pure Virtual Functions in Practice',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Abstract Shape & Concrete Implementations',
                        language: 'cpp',
                        code: `#include <iostream>
    #include <vector>
    #include <string>
    #include <cmath>
    #include <iomanip>
    using namespace std;

    // ─── ABSTRACT BASE CLASS (interface contract) ─────────────────────────
    class Shape {
    protected:
        string color;
        string label;

    public:
        Shape(string c, string l) : color(c), label(l) { }

        // Pure virtual — no base implementation. Every Shape MUST provide these.
        virtual double area()      const = 0;
        virtual double perimeter() const = 0;
        virtual string typeName()  const = 0;
        virtual void   draw()      const = 0;

        // NON-pure virtual with a default implementation (can be overridden)
        virtual string describe() const {
            return typeName() + " [" + color + "] \"" + label + "\"";
        }

        // Non-virtual utility — same for all shapes
        void printSummary() const {
            cout << fixed << setprecision(2);
            cout << describe()
                 << " | Area: "      << area()
                 << " | Perimeter: " << perimeter() << endl;
        }

        virtual ~Shape() { }  // virtual destructor — ESSENTIAL
    };

    // ─── CONCRETE: Circle ─────────────────────────────────────────────────
    class Circle : public Shape {
    private:
        double radius;
    public:
        Circle(double r, string color, string label = "")
            : Shape(color, label), radius(r) { }

        double area()      const override { return M_PI * radius * radius; }
        double perimeter() const override { return 2.0 * M_PI * radius; }
        string typeName()  const override { return "Circle"; }
        void   draw()      const override {
            cout << "  ⬤  Drawing circle r=" << radius << " in " << color << endl;
        }
    };

    // ─── CONCRETE: Rectangle ─────────────────────────────────────────────
    class Rectangle : public Shape {
    private:
        double width, height;
    public:
        Rectangle(double w, double h, string color, string label = "")
            : Shape(color, label), width(w), height(h) { }

        double area()      const override { return width * height; }
        double perimeter() const override { return 2*(width+height); }
        string typeName()  const override { return "Rectangle"; }
        void   draw()      const override {
            cout << "  ▬  Drawing rect " << width << "x" << height
                 << " in " << color << endl;
        }
    };

    // ─── CONCRETE: RegularPolygon ─────────────────────────────────────────
    class RegularPolygon : public Shape {
    private:
        int    sides;
        double sideLen;
    public:
        RegularPolygon(int n, double s, string color, string label = "")
            : Shape(color, label), sides(n), sideLen(s) { }

        double perimeter() const override { return sides * sideLen; }
        double area() const override {
            // Formula: (n * s^2) / (4 * tan(π/n))
            return (sides * sideLen * sideLen) / (4.0 * tan(M_PI / sides));
        }
        string typeName() const override {
            if (sides == 3) return "Triangle";
            if (sides == 4) return "Square";
            if (sides == 5) return "Pentagon";
            if (sides == 6) return "Hexagon";
            return to_string(sides) + "-gon";
        }
        void draw() const override {
            cout << "  ◆  Drawing " << typeName() << " (sides=" << sides
                 << " len=" << sideLen << ") in " << color << endl;
        }
    };

    // ─── POLYMORPHIC FUNCTIONS ────────────────────────────────────────────
    void drawAll(const vector<Shape*>& shapes) {
        for (const Shape* s : shapes) s->draw();
    }

    Shape* findLargest(const vector<Shape*>& shapes) {
        Shape* largest = shapes[0];
        for (Shape* s : shapes)
            if (s->area() > largest->area()) largest = s;
        return largest;
    }

    double totalArea(const vector<Shape*>& shapes) {
        double total = 0;
        for (const Shape* s : shapes) total += s->area();
        return total;
    }

    // ─────────────────────────────────────────────────────────────────────
    int main() {
        vector<Shape*> shapes;
        shapes.push_back(new Circle(5.0, "red", "main circle"));
        shapes.push_back(new Rectangle(4.0, 6.0, "blue", "banner"));
        shapes.push_back(new RegularPolygon(3, 8.0, "green", "sign"));
        shapes.push_back(new RegularPolygon(6, 4.0, "gold",  "tile"));
        shapes.push_back(new Circle(2.0, "purple"));

        cout << "=== Summaries ===" << endl;
        for (const Shape* s : shapes) s->printSummary();

        cout << "\n=== Drawing ===" << endl;
        drawAll(shapes);

        cout << "\n=== Stats ===" << endl;
        cout << "Total area:    " << fixed << setprecision(2) << totalArea(shapes) << endl;
        Shape* big = findLargest(shapes);
        cout << "Largest shape: " << big->describe() << endl;

        // Cleanup
        for (Shape* s : shapes) delete s;

        return 0;
    }`,
                        explanation: '`Shape` is an abstract class — it cannot be instantiated directly (try `Shape s;` for a compile error). It defines the CONTRACT: every concrete shape must provide `area()`, `perimeter()`, `typeName()`, and `draw()`. The polymorphic functions `drawAll()`, `findLargest()`, `totalArea()` work with `Shape*` and automatically call the right derived implementation at runtime — even for future shapes not yet written.',
                        highlightLines: [16, 17, 18, 19, 97, 104, 109],
                        isRunnable: true,
                    },
                ],
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION F: Comparison — Compile-Time vs Runtime
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 8,
                title: 'Compile-Time vs Runtime Polymorphism — Comparison',
                type: 'COMPARISON',
                content: '## Comparing the Two Forms of Polymorphism',
                stepData: {
                    items: [
                        {
                            title: 'Compile-Time Polymorphism',
                            description: 'Resolved by the compiler before the program runs. Includes function overloading, operator overloading, and templates.',
                            pros: [
                                'Zero runtime overhead — compiler resolves everything',
                                'Type errors caught at compile time',
                                'Functions are inlined by compiler when possible',
                                'Best for: utility functions, operators, math operations',
                            ],
                            cons: [
                                'Cannot add new types at runtime',
                                'Template code is duplicated for each type (code bloat)',
                                'Less flexible — all types must be known at compile time',
                            ],
                            useCase: 'Math libraries (operator+, operator*), generic containers (templates), print() overloads for different types.',
                        },
                        {
                            title: 'Runtime Polymorphism',
                            description: 'Resolved during execution via vtable lookup. Requires virtual functions and base class pointers/references.',
                            pros: [
                                'Highly extensible — add new types without changing existing code (Open/Closed Principle)',
                                'Enables programming to interfaces, not implementations',
                                'Heterogeneous collections (vector<Shape*> with circles, rectangles, triangles)',
                                'Plugin architectures and frameworks',
                            ],
                            cons: [
                                'Small vtable lookup overhead per virtual call',
                                'Requires heap allocation (new) and manual delete, or smart pointers',
                                'Compiler cannot inline virtual calls (usually)',
                                'Object size increases by one pointer (vptr)',
                            ],
                            useCase: 'GUI widget systems, game entity hierarchies, plugin systems, drawing/rendering engines, any extensible architecture.',
                        },
                    ],
                    conclusion: 'Use **compile-time polymorphism** for fixed, known types and performance-critical utility operations. Use **runtime polymorphism** when you need to extend behavior at runtime, work with heterogeneous collections, or build architectures that others can extend without modifying your code.',
                },
            },

            // ─────────────────────────────────────────────────────────────────────
            // SECTION G: Quiz
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 9,
                title: 'Quiz: Polymorphism',
                type: 'QUIZ',
                content: '## Test Your Understanding of Polymorphism',
                stepData: {
                    questions: [
                        {
                            question: 'Without the `virtual` keyword, what determines which method is called through a base class pointer?',
                            options: [
                                { id: 'a', text: 'The runtime type of the actual object', isCorrect: false },
                                { id: 'b', text: 'The compile-time type of the pointer', isCorrect: true },
                                { id: 'c', text: 'The method that was defined first', isCorrect: false },
                                { id: 'd', text: 'A random selection among overloads', isCorrect: false },
                            ],
                            explanation: 'Without `virtual`, C++ uses static dispatch — the type of the POINTER (e.g., `Animal*`) determines which method is called, not the actual object type (e.g., `Dog`). This is why a `Dog` object accessed through `Animal*` would call `Animal::speak()` instead of `Dog::speak()`.',
                        },
                        {
                            question: 'What does `virtual double area() const = 0;` declare?',
                            options: [
                                { id: 'a', text: 'A virtual function that returns zero', isCorrect: false },
                                { id: 'b', text: 'A pure virtual function — making the class abstract', isCorrect: true },
                                { id: 'c', text: 'A static function', isCorrect: false },
                                { id: 'd', text: 'A function that is deleted and cannot be called', isCorrect: false },
                            ],
                            explanation: '`= 0` makes a virtual function "pure virtual". The class containing it becomes abstract and cannot be instantiated. Derived classes must override it or they also become abstract.',
                        },
                        {
                            question: 'Why must a class with virtual functions have a virtual destructor?',
                            options: [
                                { id: 'a', text: 'Performance optimization', isCorrect: false },
                                { id: 'b', text: 'So that `delete basePtr` calls the DERIVED class destructor first, preventing resource leaks', isCorrect: true },
                                { id: 'c', text: 'To allow the base class to be abstract', isCorrect: false },
                                { id: 'd', text: 'Required by the C++ standard for any class', isCorrect: false },
                            ],
                            explanation: 'Without a virtual destructor, `delete basePtr` only calls the base class destructor — the derived destructor is SKIPPED. This causes resource leaks for anything the derived class manages (heap memory, file handles, etc.). Always make destructors virtual if the class has virtual methods.',
                        },
                        {
                            question: 'What does the `override` keyword do in C++11?',
                            options: [
                                { id: 'a', text: 'Makes the function virtual', isCorrect: false },
                                { id: 'b', text: 'Tells the compiler you intend to override a virtual function, causing a compile error if the signatures don\'t match', isCorrect: true },
                                { id: 'c', text: 'Prevents the function from being overridden further', isCorrect: false },
                                { id: 'd', text: 'Makes the function inline', isCorrect: false },
                            ],
                            explanation: '`override` is a safety check. It tells the compiler "I intend this to override a base virtual function." If the base has no matching virtual function (e.g., due to a typo or signature mismatch), the compiler reports an error immediately.',
                        },
                        {
                            question: 'Can you create an object of an abstract class?',
                            options: [
                                { id: 'a', text: 'Yes, always', isCorrect: false },
                                { id: 'b', text: 'Yes, but only with `new`', isCorrect: false },
                                { id: 'c', text: 'No — a class with any pure virtual function cannot be instantiated', isCorrect: true },
                                { id: 'd', text: 'Yes, if you use a pointer', isCorrect: false },
                            ],
                            explanation: 'An abstract class (one with at least one pure virtual function) CANNOT be instantiated directly. You can have pointers and references to it (for polymorphism), but `AbstractClass obj;` is a compile error.',
                        },
                        {
                            question: 'What is a vtable?',
                            options: [
                                { id: 'a', text: 'A variable-length table inside each object', isCorrect: false },
                                { id: 'b', text: 'A compiler-generated array of function pointers used for virtual dispatch, one per class', isCorrect: true },
                                { id: 'c', text: 'A runtime type checking mechanism', isCorrect: false },
                                { id: 'd', text: 'A variable that stores the current object type', isCorrect: false },
                            ],
                            explanation: 'The vtable is a hidden, compiler-generated table of function pointers, one per class that has virtual functions. Each object gets a hidden vptr (vtable pointer). At runtime, `obj->virtualMethod()` looks up the vtable through vptr and calls the correct version.',
                        },
                        {
                            question: 'Given `Shape* s = new Circle(5.0);` and `virtual void Shape::draw()`, which `draw()` is called by `s->draw()`?',
                            options: [
                                { id: 'a', text: 'Shape::draw() — because s is a Shape*', isCorrect: false },
                                { id: 'b', text: 'Circle::draw() — because the actual object is a Circle', isCorrect: true },
                                { id: 'c', text: 'Whichever was defined first', isCorrect: false },
                                { id: 'd', text: 'A compile error — cannot call virtual through pointer', isCorrect: false },
                            ],
                            explanation: 'With `virtual`, the OBJECT\'s runtime type determines dispatch. The actual object is a `Circle`, so `Circle::draw()` is called — even though the pointer type is `Shape*`. This is the essence of runtime polymorphism.',
                        },
                        {
                            question: 'Which of these correctly describes the relationship between abstract classes and concrete classes?',
                            options: [
                                { id: 'a', text: 'Abstract classes can be instantiated; concrete classes cannot', isCorrect: false },
                                { id: 'b', text: 'Abstract classes define the interface/contract; concrete classes implement it and can be instantiated', isCorrect: true },
                                { id: 'c', text: 'Concrete classes must inherit from abstract classes', isCorrect: false },
                                { id: 'd', text: 'Abstract and concrete classes are the same — abstract is just a synonym', isCorrect: false },
                            ],
                            explanation: 'Abstract classes define the contract (pure virtual functions) but cannot be instantiated. Concrete (non-abstract) derived classes implement all pure virtual functions and CAN be instantiated. You use abstract class pointers for polymorphism.',
                        },
                    ],
                },
            },

            // ─────────────────────────────────────────────────────────────────────
            // CHALLENGE
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 10,
                title: 'Challenge: Polymorphic Game Entity System',
                type: 'CHALLENGE',
                content: `## 🏆 Challenge: Polymorphic Game Entity System

    Build a game entity system using abstract classes and runtime polymorphism.

    **Abstract Base: \`GameEntity\`**
    - protected: \`name\` (string), \`health\` (int), \`x\`, \`y\` (double position)
    - Pure virtual: \`update()\`, \`render()\`, \`takeDamage(int)\`, \`getType()\` const
    - Non-virtual: \`isAlive()\` (health > 0), \`getHealth()\`, \`moveTo(x, y)\`, \`printStatus()\`
    - virtual destructor

    **Concrete: \`Hero\` : public GameEntity**
    - Adds: \`mana\` (int), \`attackPower\` (int)
    - \`update()\` → regenerates 5 mana per tick if alive
    - \`render()\` → prints hero icon and position
    - \`takeDamage(int)\` → reduces health, prints message
    - \`attack(GameEntity* target)\` → deals attackPower damage to target
    - \`castSpell(GameEntity* target)\` → costs 20 mana, deals 2×attackPower damage

    **Concrete: \`Enemy\` : public GameEntity**
    - Adds: \`damage\` (int), \`moveSpeed\` (double)
    - \`update()\` → moves 1 step (simulated), chases hero direction
    - \`render()\` → prints enemy icon
    - \`takeDamage(int)\` → reduces health
    - \`attackHero(GameEntity* hero)\` → deals damage

    **Concrete: \`HealthPickup\` : public GameEntity**
    - Adds: \`healAmount\` (int), \`isConsumed\` (bool)
    - \`update()\` → does nothing (static)
    - \`render()\` → prints pickup icon
    - \`takeDamage()\` → does nothing (pickups can't be damaged)
    - \`collect(GameEntity* collector)\` → heals collector by healAmount, marks consumed

    **In main:**
    - Create a vector<GameEntity*> with a hero, 3 enemies, 2 pickups
    - Run 3 game ticks: call update() + render() on all entities
    - Hero attacks enemy 1; casts spell on enemy 2
    - Hero collects a pickup
    - Print status of all entities`,
                stepData: {
                    starterCode: `#include <iostream>
    #include <string>
    #include <vector>
    using namespace std;

    // TODO: abstract class GameEntity
    // - protected: name, health, x, y
    // - pure virtual: update(), render(), takeDamage(int), getType() const
    // - non-virtual: isAlive(), getHealth(), moveTo(x,y), printStatus()
    // - virtual destructor

    // TODO: class Hero : public GameEntity
    // TODO: class Enemy : public GameEntity
    // TODO: class HealthPickup : public GameEntity

    int main() {
        vector<GameEntity*> entities;
        // TODO: create Hero("Arthur", 100hp, 50mana, 25 attackPower)
        // TODO: create Enemy("Goblin", 50hp, 10 damage, 2.0 speed) x3
        // TODO: create HealthPickup("MedPack", 40 healAmount) x2

        // TODO: 3 game ticks — update + render all entities
        // TODO: hero attacks enemy[1], casts spell on enemy[2]
        // TODO: hero collects pickup[0]
        // TODO: print status of all

        for (GameEntity* e : entities) delete e;
        return 0;
    }`,
                    solution: `#include <iostream>
    #include <string>
    #include <vector>
    #include <iomanip>
    using namespace std;

    // ─── ABSTRACT BASE ─────────────────────────────────────────────────────
    class GameEntity {
    protected:
        string name;
        int    health;
        double x, y;

    public:
        GameEntity(string n, int hp, double x = 0, double y = 0)
            : name(n), health(hp), x(x), y(y) { }

        // Pure virtual interface — MUST be implemented by each entity type
        virtual void   update()          = 0;
        virtual void   render()    const = 0;
        virtual void   takeDamage(int d) = 0;
        virtual string getType()   const = 0;

        // Non-virtual common utilities
        bool   isAlive()   const { return health > 0; }
        int    getHealth() const { return health; }
        string getName()   const { return name; }

        void moveTo(double nx, double ny) { x = nx; y = ny; }

        void printStatus() const {
            cout << "  [" << getType() << "] " << name
                 << " HP:" << health
                 << " pos:(" << fixed << setprecision(1) << x << "," << y << ")"
                 << (isAlive() ? "" : " 💀 DEAD") << endl;
        }

        virtual ~GameEntity() { }
    };

    // ─── HERO ──────────────────────────────────────────────────────────────
    class Hero : public GameEntity {
    private:
        int mana;
        int attackPower;
    public:
        Hero(string n, int hp, int mp, int atk)
            : GameEntity(n, hp), mana(mp), attackPower(atk) { }

        string getType() const override { return "HERO"; }

        void update() override {
            if (!isAlive()) return;
            mana = min(100, mana + 5);  // regen 5 mana per tick
            cout << "  " << name << " regenerates mana → " << mana << endl;
        }

        void render() const override {
            cout << "  🧙 Hero [" << name << "] HP:" << health
                 << " Mana:" << mana << " ATK:" << attackPower
                 << " @ (" << x << "," << y << ")" << endl;
        }

        void takeDamage(int d) override {
            if (!isAlive()) return;
            health = max(0, health - d);
            cout << "  ⚔️  " << name << " takes " << d << " dmg → HP:" << health << endl;
        }

        void attack(GameEntity* target) {
            if (!isAlive() || !target->isAlive()) return;
            cout << "  ⚔️  " << name << " attacks " << target->getName() << "!" << endl;
            target->takeDamage(attackPower);
        }

        void castSpell(GameEntity* target) {
            if (!isAlive()) return;
            if (mana < 20) { cout << "  ❌ Not enough mana!" << endl; return; }
            if (!target->isAlive()) return;
            mana -= 20;
            int spellDmg = attackPower * 2;
            cout << "  ✨ " << name << " casts spell on " << target->getName()
                 << " for " << spellDmg << " dmg! (mana→" << mana << ")" << endl;
            target->takeDamage(spellDmg);
        }

        int getMana() const { return mana; }
    };

    // ─── ENEMY ─────────────────────────────────────────────────────────────
    class Enemy : public GameEntity {
    private:
        int    damage;
        double moveSpeed;
        int    tickCount = 0;
    public:
        Enemy(string n, int hp, int dmg, double spd, double sx = 0, double sy = 0)
            : GameEntity(n, hp, sx, sy), damage(dmg), moveSpeed(spd) { }

        string getType() const override { return "ENEMY"; }

        void update() override {
            if (!isAlive()) return;
            tickCount++;
            // Move toward origin (where hero starts)
            x = max(0.0, x - moveSpeed);
            cout << "  👹 " << name << " moves → x=" << x << endl;
        }

        void render() const override {
            cout << "  👹 Enemy [" << name << "] HP:" << health
                 << " DMG:" << damage << " @ (" << x << "," << y << ")"
                 << (isAlive() ? "" : " 💀") << endl;
        }

        void takeDamage(int d) override {
            if (!isAlive()) return;
            health = max(0, health - d);
            cout << "  💥 " << name << " takes " << d << " dmg → HP:" << health
                 << (isAlive() ? "" : " 💀 Defeated!") << endl;
        }

        void attackHero(GameEntity* hero) {
            if (!isAlive() || !hero->isAlive()) return;
            cout << "  👹 " << name << " attacks " << hero->getName() << "!" << endl;
            hero->takeDamage(damage);
        }
    };

    // ─── HEALTH PICKUP ─────────────────────────────────────────────────────
    class HealthPickup : public GameEntity {
    private:
        int  healAmount;
        bool isConsumed;
    public:
        HealthPickup(string n, int heal, double px = 0, double py = 0)
            : GameEntity(n, 1, px, py), healAmount(heal), isConsumed(false) { }

        string getType() const override { return "ITEM"; }

        void update() override { /* pickups are static */ }

        void render() const override {
            if (!isConsumed)
                cout << "  💊 Pickup [" << name << "] +" << healAmount << "HP"
                     << " @ (" << x << "," << y << ")" << endl;
        }

        void takeDamage(int) override { /* pickups can't be damaged */ }

        void collect(GameEntity* collector) {
            if (isConsumed) { cout << "  Already consumed!" << endl; return; }
            isConsumed = true;
            // We can't call heal() on GameEntity* — cast to Hero* if needed
            // For this demo, directly modify health via a hack (normally use heal interface)
            cout << "  💊 " << collector->getName() << " collected " << name
                 << " → +" << healAmount << " HP!" << endl;
            // Direct health manipulation for demo purposes:
            // In real code, you'd add virtual void heal(int) to GameEntity
        }

        bool consumed() const { return isConsumed; }
    };

    // ─── GAME LOOP HELPERS ────────────────────────────────────────────────
    void tick(vector<GameEntity*>& entities, int tickNum) {
        cout << "\n════════ TICK " << tickNum << " ════════" << endl;
        cout << "--- UPDATE ---" << endl;
        for (GameEntity* e : entities) e->update();
        cout << "--- RENDER ---" << endl;
        for (GameEntity* e : entities) e->render();
    }

    int main() {
        // Create entities through abstract pointer
        vector<GameEntity*> entities;

        Hero*        hero = new Hero("Arthur", 100, 50, 25);
        Enemy*       g1   = new Enemy("Goblin1", 50, 10, 2.0, 15, 0);
        Enemy*       g2   = new Enemy("Goblin2", 40, 12, 1.5, 20, 5);
        Enemy*       g3   = new Enemy("Goblin3", 60,  8, 3.0, 10, 3);
        HealthPickup* p1  = new HealthPickup("MedPack",  40, 3, 0);
        HealthPickup* p2  = new HealthPickup("LargePack",80, 7, 2);

        entities.push_back(hero);
        entities.push_back(g1);
        entities.push_back(g2);
        entities.push_back(g3);
        entities.push_back(p1);
        entities.push_back(p2);

        // Run 3 ticks
        tick(entities, 1);
        tick(entities, 2);
        tick(entities, 3);

        // Combat
        cout << "\n════════ COMBAT ════════" << endl;
        hero->attack(g1);
        hero->attack(g1);       // finish off goblin 1
        hero->castSpell(g2);    // powerful spell
        g3->attackHero(hero);   // goblin 3 retaliates

        // Collect pickup
        cout << "\n════════ PICKUP ════════" << endl;
        p1->collect(hero);

        // Final status
        cout << "\n════════ FINAL STATUS ════════" << endl;
        for (const GameEntity* e : entities) e->printStatus();

        // Cleanup
        for (GameEntity* e : entities) delete e;

        return 0;
    }`,
                    hints: [
                        'Declare pure virtuals with `= 0`: `virtual void update() = 0;`. Don\'t forget the virtual destructor (non-pure).',
                        '`printStatus()` is non-virtual — it calls `getType()` which IS virtual, so it still gets the right derived type name.',
                        'In `Hero::castSpell()`, check mana >= 20 before casting; subtract 20, compute damage = attackPower * 2, call `target->takeDamage(damage)`.',
                        '`max(0, health - d)` prevents health from going negative. `min(100, mana + 5)` prevents mana overflowing 100.',
                        'The `vector<GameEntity*>` can hold Hero*, Enemy*, and HealthPickup* objects. When you call `e->update()`, virtual dispatch calls the correct implementation for each type.',
                    ],
                    language: 'cpp',
                },
            },

            // ─────────────────────────────────────────────────────────────────────
            // SUMMARY
            // ─────────────────────────────────────────────────────────────────────
            {
                order: 11,
                title: 'Summary: Polymorphism',
                type: 'SUMMARY',
                content: `# Summary: Polymorphism

    ## The Two Types

    ### Compile-Time Polymorphism
    - **Function overloading** — same name, different parameters
    - **Operator overloading** — define \`+\`, \`==\`, \`<<\` for custom types
    - Resolved at compile time — zero runtime overhead
    - Used for utilities, math, type-generic operations

    ### Runtime Polymorphism
    - **Virtual functions** — derived class overrides base class method
    - **Abstract classes** — pure virtual functions define contracts
    - Resolved at runtime via vtable lookup
    - Used for extensible architectures, heterogeneous collections

    ---

    ## Key Syntax

    \`\`\`cpp
    // Base class:
    class Shape {
    public:
        virtual double area()   const = 0;  // pure virtual → abstract class
        virtual void   draw()   const { }   // virtual with default
        virtual ~Shape()        { }         // ALWAYS virtual destructor!
    };

    // Derived:
    class Circle : public Shape {
    public:
        double area() const override { return M_PI * r * r; }  // override keyword
        void   draw() const override final { }  // final = no further overriding
    };
    \`\`\`

    ## Virtual Dispatch Summary

    \`\`\`
    Shape* ptr = new Circle(5.0);
    ptr->area();  → Circle::area()   ← actual object type wins (runtime)
    ptr->draw();  → Circle::draw()   ← actual object type wins (runtime)
    delete ptr;   → ~Circle() first, then ~Shape()  ← virtual destructor
    \`\`\`

    ## Abstract Class Rules

    - At least one \`= 0\` → abstract → cannot instantiate
    - Derived must implement ALL pure virtuals (or it is also abstract)
    - Pointers and references to abstract classes are fine → polymorphism
    - Define the "contract" (interface) in the abstract class

    ## Design Principle: Open/Closed

    > A class should be **open for extension** (add new shapes) but **closed for modification** (don't change existing code).

    Runtime polymorphism makes this possible: add a new \`Ellipse\` class, and all existing code that uses \`Shape*\` automatically works with it — no changes needed.

    ---

    ## 🎓 Unit 4 Complete!

    You now understand all five core OOP topics:
    1. **Classes & Objects** — blueprints, instances, public/private, dot/arrow
    2. **Constructors & Destructors** — default, parameterized, copy, RAII
    3. **Encapsulation & Abstraction** — getters/setters, const, friend, interface design
    4. **Inheritance** — IS-A, protected, constructor chaining, types of inheritance
    5. **Polymorphism** — compile-time (overloading), runtime (virtual), abstract classes

    > 🎯 **Next up**: Unit 5 — Templates, STL & File Handling!`,
            },
        ],
    });

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
    const totalCount = await prisma.learn.count({ where: { subCategoryId: cpp.id } });
    await prisma.learnSubCategory.update({
        where: { id: cpp.id },
        data: { learnCount: totalCount },
    });

    console.log(`\n✅ C++ Learn seeded: ${createdLearns.length} learns across ${topicDefs.length} topics`);
}