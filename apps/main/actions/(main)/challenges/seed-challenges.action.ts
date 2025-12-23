'use server'

import { prisma } from '@/lib/prisma'

// This action seeds sample challenges for testing
export async function seedSampleChallenges() {
    try {
        // Check if already seeded
        const existingTrack = await prisma.forgeTrack.findFirst({
            where: { slug: 'javascript-quest' }
        })

        if (existingTrack) {
            return { success: true, message: 'Already seeded' }
        }

        // ===============================================
        // SEED THE FORGE - JavaScript Quest
        // ===============================================
        const jsTrack = await prisma.forgeTrack.create({
            data: {
                name: 'Script Sentinel Quest',
                slug: 'javascript-quest',
                description: `Master JavaScript by building real things. You've been recruited by a secret tech collective called "The Architects". Your mission: Infiltrate MegaCorp by mastering their web systems. Each step gets you deeper into their infrastructure. Complete all steps to become a full member of The Architects.`,
                shortDescription: 'Master JavaScript fundamentals through hands-on building challenges',
                icon: '⚡',
                themeColor: '#F59E0B',
                technology: 'JavaScript',
                level: 'BEGINNER',
                estimatedHours: 8,
                creditsRequired: 10,
                isFree: false,
                status: 'PUBLISHED',
                narrativeTitle: 'The Interface Architect',
                narrativePremise: `You've been recruited by The Architects, a secret collective of elite developers. Your first mission: prove your JavaScript skills by infiltrating MegaCorp's digital systems.`,
                totalXp: 300,
                publishedAt: new Date(),
                steps: {
                    create: [
                        {
                            stepNumber: 1,
                            title: 'The Console Awakens',
                            slug: 'console-awakens',
                            storyContent: `**TRANSMISSION RECEIVED**

*Static crackles, then clears...*

"Welcome, recruit. I'm Atlas, your handler at The Architects. We've been watching you, and we think you have what it takes.

Your first task is simple: MegaCorp has a security console that they think is unhackable. They're wrong.

The console accepts commands, but only those who understand JavaScript can unlock its secrets. We've intercepted their test page – your job is to find the hidden activation code."

*A link appears in your terminal...*

"Remember: In JavaScript, everything speaks through the console. Listen carefully."

**-- END TRANSMISSION --**`,
                            missionContent: `## Mission Briefing

MegaCorp's test console is live. Your task:

1. Open the browser's Developer Console (Right-click → Inspect → Console tab)
2. The page at \`https://quest.thecoderz.in/step1\` (simulated below) has hidden JavaScript
3. Find the activation code stored in a global variable
4. Submit the code to proceed

### What You're Looking For

The page contains JavaScript that sets a global variable. Use the console to:
- Type variable names to see their values
- Look for variables like \`ACTIVATION_CODE\`, \`secretCode\`, or similar
- The code is an 8-character string

### Test Environment

\`\`\`javascript
// The page contains something like this (hidden from view):
const MEGACORP_SECRET = "INIT2024";
window.activationCode = "ARCH" + "IVES";
\`\`\`

### Your Task

What is the full activation code? (Combine the clues!)

**Hint**: The answer combines elements from the hidden code snippets above.`,
                            deliverableType: 'TEXT',
                            expectedAnswer: 'ARCHIVES',
                            xpReward: 50,
                            hints: JSON.stringify([
                                { text: 'Look at the code snippet carefully. What does "ARCH" + "IVES" equal?', xpCost: 0 },
                                { text: 'JavaScript concatenates strings with +. "ARCH" + "IVES" = ?', xpCost: 5 },
                                { text: 'The answer is: ARCHIVES', xpCost: 20 }
                            ]),
                            isPublished: true,
                            learningModules: {
                                create: [
                                    {
                                        conceptName: 'Browser Console',
                                        sortOrder: 1,
                                        quickExplanation: `## What is the Browser Console?

The browser console is a powerful tool built into every modern browser. It lets you:
- **Execute JavaScript** directly in the browser
- **View errors** and warnings from web pages
- **Inspect variables** and objects
- **Debug code** step by step

### How to Open It

- **Chrome/Edge**: Right-click → Inspect → Console tab (or Ctrl+Shift+J / Cmd+Option+J)
- **Firefox**: Right-click → Inspect → Console tab (or Ctrl+Shift+K / Cmd+Option+K)
- **Safari**: Enable Developer menu in Preferences → Develop → Show JavaScript Console

### Why It Matters

Every JavaScript developer uses the console daily. It's your window into what's happening in your code.`,
                                        codeExamples: JSON.stringify({
                                            javascript: `// Try these in the console:
console.log("Hello, World!");

// Check a variable
let myName = "Atlas";
console.log(myName); // Output: Atlas

// Do math
console.log(5 + 3); // Output: 8

// String concatenation
console.log("Hello" + " " + "World"); // Output: Hello World`
                                        }),
                                        interactiveCode: `// Type a console.log statement below:
// Example: console.log("Your name");
`,
                                        interactiveSolution: `console.log("Hello from The Architects!");`,
                                        quizQuestion: 'What keyboard shortcut opens Chrome DevTools Console on Windows?',
                                        quizOptions: JSON.stringify(['Ctrl+Shift+C', 'Ctrl+Shift+J', 'Ctrl+Alt+J', 'F12 only']),
                                        quizAnswer: 1
                                    },
                                    {
                                        conceptName: 'String Concatenation',
                                        sortOrder: 2,
                                        quickExplanation: `## String Concatenation in JavaScript

**Concatenation** means joining strings together. In JavaScript, you can use the \`+\` operator to combine strings.

### Basic Example
\`\`\`javascript
let firstName = "John";
let lastName = "Doe";
let fullName = firstName + " " + lastName;
// fullName is now "John Doe"
\`\`\`

### Why It's Important
- Building dynamic messages
- Creating URLs
- Combining user input
- Constructing HTML strings`,
                                        codeExamples: JSON.stringify({
                                            javascript: `// Different ways to concatenate strings:

// Using + operator
let result = "Hello" + " " + "World";
// result: "Hello World"

// Using template literals (modern way)
let name = "Atlas";
let greeting = \`Hello, \${name}!\`;
// greeting: "Hello, Atlas!"

// Concatenating with numbers
let age = 25;
let message = "I am " + age + " years old";
// message: "I am 25 years old"`
                                        }),
                                        quizQuestion: 'What does "Java" + "Script" evaluate to?',
                                        quizOptions: JSON.stringify(['Java Script', 'JavaScript', 'JavaandScript', 'Error']),
                                        quizAnswer: 1
                                    }
                                ]
                            }
                        },
                        {
                            stepNumber: 2,
                            title: 'The Variable Vault',
                            slug: 'variable-vault',
                            storyContent: `**TRANSMISSION RECEIVED**

*Atlas's voice comes through clearer this time...*

"Excellent work, recruit! You've proven you can find hidden information. But finding is one thing – creating is another.

MegaCorp stores their sensitive data in what they call 'The Vault' – a system of variables that holds everything from user credentials to secret project codes.

We've obtained access to their variable initialization system. Your task: understand how they declare and manipulate data. Show me you can work with variables."

*A training module appears...*

"Remember: Variables are containers for data. Master them, and you master the flow of information."

**-- END TRANSMISSION --**`,
                            missionContent: `## Mission Briefing

Learn to create and manipulate JavaScript variables. Then prove your understanding.

### Your Task

Given the following scenario, calculate the final answer:

\`\`\`javascript
let agentLevel = 1;
const BONUS_MULTIPLIER = 10;
var missionCount = 5;

// You complete 3 more missions
missionCount = missionCount + 3;

// Your level increases by the mission count divided by 2
agentLevel = agentLevel + (missionCount / 2);

// Calculate your score
let score = agentLevel * BONUS_MULTIPLIER;
\`\`\`

**What is the final value of \`score\`?**

Submit just the number (no extra characters).`,
                            deliverableType: 'TEXT',
                            expectedAnswer: '50',
                            xpReward: 50,
                            hints: JSON.stringify([
                                { text: 'Follow the code step by step. missionCount becomes 5 + 3 = 8', xpCost: 0 },
                                { text: 'agentLevel becomes 1 + (8 / 2) = 1 + 4 = 5', xpCost: 5 },
                                { text: 'score = 5 * 10 = 50', xpCost: 15 }
                            ]),
                            isPublished: true,
                            learningModules: {
                                create: [
                                    {
                                        conceptName: 'Variables: let, const, var',
                                        sortOrder: 1,
                                        quickExplanation: `## JavaScript Variables

Variables store data that your program can use and manipulate.

### Three Ways to Declare Variables

| Keyword | Reassignable | Block Scoped | Use Case |
|---------|--------------|--------------|----------|
| \`let\` | ✅ Yes | ✅ Yes | General purpose, modern |
| \`const\` | ❌ No | ✅ Yes | Values that won't change |
| \`var\` | ✅ Yes | ❌ No | Legacy code (avoid in new code) |

### Best Practice
- Use \`const\` by default
- Use \`let\` when you need to reassign
- Avoid \`var\` in modern JavaScript`,
                                        codeExamples: JSON.stringify({
                                            javascript: `// Using let - value can change
let score = 0;
score = 100; // ✅ Works!

// Using const - value cannot change
const MAX_SCORE = 1000;
// MAX_SCORE = 2000; // ❌ Error!

// Using var - old way, avoid it
var oldWay = "legacy";

// Variable naming
let userName = "Atlas";     // camelCase (recommended)
let user_name = "Atlas";    // snake_case (less common in JS)
const API_KEY = "secret";   // SCREAMING_CASE (for constants)`
                                        }),
                                        quizQuestion: 'Which keyword should you use for a value that will never change?',
                                        quizOptions: JSON.stringify(['let', 'var', 'const', 'variable']),
                                        quizAnswer: 2
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        })

        // ===============================================
        // SEED THE CRUCIBLE - Logic Event
        // ===============================================
        const crucibleEvent = await prisma.crucibleEvent.create({
            data: {
                name: 'Logic Foundations',
                slug: 'logic-foundations',
                description: `Welcome to Logic Foundations – a collection of programming puzzles designed to sharpen your algorithmic thinking. Each problem tells a story and challenges you to find the answer using any programming language of your choice. The puzzles start simple and progressively increase in difficulty.`,
                shortDescription: 'Sharpen your logic with story-driven programming puzzles',
                icon: '🔥',
                themeColor: '#EF4444',
                eventType: 'evergreen',
                status: 'ACTIVE',
                isFree: true,
                problems: {
                    create: [
                        {
                            dayNumber: 1,
                            title: 'The Secret Entrance',
                            slug: 'secret-entrance',
                            storyContent: `## Day 1: The Secret Entrance

The Elves have good news and bad news.

The **good news** is that they've discovered project management! This has given them the tools they need to prevent their usual Christmas emergency.

The **bad news** is that they've realized they have a different emergency: according to their resource planning, none of them have any time left to decorate the North Pole!

To save Christmas, the Elves need **your** help to finish decorating the North Pole.

---

You arrive at the secret entrance to the North Pole base ready to start decorating. Unfortunately, the password seems to have been changed, so you can't get in. A document taped to the wall helpfully explains:

*"Due to new security protocols, the password is locked in the safe below. Please see the attached document for the new combination."*

The safe has a dial with only an arrow on it; around the dial are the numbers **0 through 99** in order. As you turn the dial, it makes a small click noise as it reaches each number.`,
                            problemContent: `## The Problem

The attached document (your puzzle input) contains a sequence of **rotations**, one per line, which tell you how to open the safe.

A rotation starts with an **L** or **R** which indicates whether the rotation should be to the left (toward lower numbers) or to the right (toward higher numbers). Then, the rotation has a distance value which indicates how many clicks the dial should be rotated in that direction.

### Examples
- If the dial were pointing at **11**, a rotation of \`R8\` would cause the dial to point at **19**
- After that, a rotation of \`L19\` would cause it to point at **0**

Because the dial is a circle:
- Turning the dial **left** from 0 one click makes it point at **99**
- Turning the dial **right** from 99 one click makes it point at **0**

So, if the dial were pointing at 5, a rotation of \`L10\` would cause it to point at 95.

### The Key Insight

The dial starts by pointing at **50**.

You could follow the instructions, but your recent required official North Pole secret entrance security training seminar taught you that the safe is actually a **decoy**. 

**The actual password is the number of times the dial is left pointing at 0 after any rotation in the sequence.**

### Example

If the rotations were:
\`\`\`
L68
L30
R48
L5
R60
L55
L1
L99
R14
L82
\`\`\`

Following these:
- Start at 50
- L68 → 82
- L30 → 52
- R48 → **0** ✓
- L5 → 95
- R60 → 55
- L55 → **0** ✓
- L1 → 99
- L99 → **0** ✓
- R14 → 14
- L82 → 32

The dial points at 0 a total of **3 times**, so the password would be **3**.

---

**Analyze the rotations in your puzzle input. What's the actual password to open the door?**`,
                            inputTemplate: JSON.stringify({
                                type: 'dial_rotations',
                                count: 200,
                                startPosition: 50
                            }),
                            sampleInput: `L68
L30
R48
L5
R60
L55
L1
L99
R14
L82`,
                            sampleOutput: '3',
                            answerType: 'NUMBER',
                            difficulty: 1,
                            xpReward: 50,
                            hints: JSON.stringify([
                                { text: 'This is about modular arithmetic. The dial wraps around at 100.', xpCost: 0 },
                                { text: 'For left rotations: newPos = (currentPos - distance + 100) % 100', xpCost: 5 },
                                { text: 'For right rotations: newPos = (currentPos + distance) % 100', xpCost: 10 }
                            ]),
                            concepts: ['modulo', 'loops', 'string-parsing'],
                            isLocked: false,
                            learningModules: {
                                create: [
                                    {
                                        conceptName: 'Modulo Operator',
                                        sortOrder: 1,
                                        explanation: `## The Modulo Operator (%)

The modulo operator returns the **remainder** after division. It's incredibly useful for:
- Wrapping values (like a clock or dial)
- Checking if numbers are even/odd
- Cycling through arrays

### Basic Examples
\`\`\`
10 % 3 = 1   (10 ÷ 3 = 3 remainder 1)
15 % 5 = 0   (15 ÷ 5 = 3 remainder 0)
7 % 10 = 7   (7 ÷ 10 = 0 remainder 7)
\`\`\`

### For This Problem
A dial with positions 0-99:
- Position 95 + 10 steps right = (95 + 10) % 100 = **5**
- Position 5 - 10 steps left = (5 - 10 + 100) % 100 = **95**

The trick with going left (negative) is to add 100 first to avoid negative numbers.`,
                                        codeExamples: JSON.stringify({
                                            javascript: `// JavaScript
let position = 50;
let distance = 68;

// Going LEFT (toward lower numbers)
position = ((position - distance) % 100 + 100) % 100;
// Result: 82

// Going RIGHT (toward higher numbers)  
position = (position + distance) % 100;`,
                                            python: `# Python
position = 50
distance = 68

# Going LEFT
position = (position - distance) % 100
# Result: 82 (Python handles negative mod nicely)

# Going RIGHT
position = (position + distance) % 100`
                                        }),
                                        quizQuestion: 'What is 105 % 100?',
                                        quizOptions: JSON.stringify(['105', '5', '1.05', '100']),
                                        quizAnswer: 1
                                    },
                                    {
                                        conceptName: 'String Parsing',
                                        sortOrder: 2,
                                        explanation: `## Parsing Input Strings

Each line in your input looks like: \`L68\` or \`R42\`

You need to extract:
1. The **direction** (L or R)
2. The **distance** (the number)

### Approaches

**Method 1: String slicing**
\`\`\`javascript
let line = "L68";
let direction = line[0];        // "L"
let distance = parseInt(line.slice(1));  // 68
\`\`\`

**Method 2: Regex**
\`\`\`javascript
let match = line.match(/([LR])(\\d+)/);
let direction = match[1];  // "L"
let distance = parseInt(match[2]);  // 68
\`\`\``,
                                        codeExamples: JSON.stringify({
                                            javascript: `// Complete solution structure
const input = \`L68
L30
R48\`.split('\\n');

let position = 50;
let zeroCount = 0;

for (const line of input) {
    const direction = line[0];
    const distance = parseInt(line.slice(1));
    
    if (direction === 'L') {
        position = ((position - distance) % 100 + 100) % 100;
    } else {
        position = (position + distance) % 100;
    }
    
    if (position === 0) {
        zeroCount++;
    }
}

console.log(zeroCount);`,
                                            python: `# Complete solution in Python
input_data = """L68
L30
R48""".strip().split('\\n')

position = 50
zero_count = 0

for line in input_data:
    direction = line[0]
    distance = int(line[1:])
    
    if direction == 'L':
        position = (position - distance) % 100
    else:
        position = (position + distance) % 100
    
    if position == 0:
        zero_count += 1

print(zero_count)`
                                        }),
                                        quizQuestion: 'Given "R42", what does line.slice(1) return in JavaScript?',
                                        quizOptions: JSON.stringify(['R', '42', 'R42', '2']),
                                        quizAnswer: 1
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        })

        return { 
            success: true, 
            message: 'Sample challenges seeded!',
            forgeTrackId: jsTrack.id,
            crucibleEventId: crucibleEvent.id
        }
    } catch (error) {
        console.error('Error seeding challenges:', error)
        return { success: false, error: 'Failed to seed challenges' }
    }
}


