// ═══════════════════════════════════════════════════════════════════════════════
// UNIT 4: Object-Oriented Programming (OOP) Fundamentals
// Topics: cpp-classes-objects, cpp-constructors, cpp-encapsulation
// ═══════════════════════════════════════════════════════════════════════════════
//
// Paste inside your seedCppLearnContent() function, after Unit 3 topics.
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// TOPIC 1: cpp-classes-objects
// ═══════════════════════════════════════════════════════════════════════════════

await createLearn({
    slug: 'cpp-classes-objects',
    title: 'Classes and Objects',
    description:
        'Understand the pillars of Object-Oriented Programming: what a class is, how to define attributes and methods, the difference between public and private access specifiers, how to instantiate objects, and the difference between dot and arrow member access.',
    difficulty: 'BEGINNER',
    unitNumber: 4,
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
    unitNumber: 4,
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
    unitNumber: 4,
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
    unitNumber: 4,
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
    unitNumber: 4,
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