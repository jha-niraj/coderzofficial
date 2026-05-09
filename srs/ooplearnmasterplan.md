# Object-Oriented Programming (OOP) — Learn Module Masterplan
**Platform: BuildrHQ**
**SubCategory: OOP Concepts**
**Total Learns: 40 | Units: 6**
**Language Examples:** Java (primary) + C++ + Python side-by-side

---

## Category Hierarchy

```
LearnMainCategory: "Computer Science"
  └── LearnSubCategory: "OOP Concepts"
        ├── slug: "oop-concepts"
        ├── icon: "🧩"
        ├── color: "#F59E0B"
        │
        └── LearnTopics:
              ├── Unit 1 — OOP Foundations (6 Learns)
              ├── Unit 2 — The Four Pillars of OOP (8 Learns)
              ├── Unit 3 — Relationships & Design (6 Learns)
              ├── Unit 4 — SOLID Principles (6 Learns)
              ├── Unit 5 — Design Patterns (8 Learns)
              └── Unit 6 — Advanced OOP & Interview Mastery (6 Learns)
```

---

## UNIT 1 — OOP Foundations
**Unit Goal:** Build the mental model for OOP from scratch — what it is, why it exists, and the core vocabulary every OOP interview starts with.

---

### Learn 1.1 — What is OOP? Procedural vs Object-Oriented
**Difficulty:** BEGINNER | **Est. Time:** 20 min | **Tags:** `[oop, procedural, paradigm, objects, classes]`

**Steps:** `EXPLANATION → COMPARISON(procedural vs OOP) → VISUALIZATION → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Programming paradigms: procedural, OOP, functional, declarative
- Why OOP was created: manage complexity, model real-world entities
- Core idea: bundle data (state) + behavior (methods) into objects
- Procedural limitations: global state, hard to scale, difficult to reuse
- OOP benefits: modularity, reusability, maintainability, scalability
- Real-world analogy: a Car has attributes (color, speed) and behaviors (accelerate, brake)
- OOP languages: Java, C++, Python, C#, Ruby
- Pure OOP vs multi-paradigm languages

**Interview relevance:** "What is OOP?" / "What are the advantages of OOP over procedural programming?" — always the first question.

---

### Learn 1.2 — Classes & Objects: Blueprint and Instance
**Difficulty:** BEGINNER | **Est. Time:** 25 min | **Tags:** `[class, object, instance, fields, methods, constructor]`

**Steps:** `EXPLANATION → VISUALIZATION(class diagram) → CODE(4 blocks: Java + C++ + Python) → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Class: template / blueprint defining structure and behavior
- Object: instance of a class, occupies memory, has state
- Fields (attributes/instance variables): the data an object holds
- Methods (member functions): the behavior an object has
- Constructor: special method called when object is created
- `new` keyword: allocates memory, calls constructor
- Multiple objects from one class: independent state
- Class vs struct: historical and practical differences
- The `this` reference: refers to current object instance
- Object identity vs equality: same reference vs same value

**Interview relevance:** "What is the difference between a class and an object?" — most basic OOP interview question.

---

### Learn 1.3 — Constructors: Types, Overloading & Constructor Chaining
**Difficulty:** BEGINNER | **Est. Time:** 25 min | **Tags:** `[constructor, default-constructor, parameterized, copy-constructor, constructor-chaining, this, super]`

**Steps:** `EXPLANATION → CODE(4 blocks) → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Default constructor: no parameters, compiler-generated if none defined
- Parameterized constructor: accepts arguments to initialize fields
- Copy constructor (C++): creates copy of existing object
- Constructor overloading: multiple constructors with different parameters
- Constructor chaining: calling one constructor from another (`this()`, `super()`)
- `this()` call: must be first statement in constructor
- `super()` call: invoke parent class constructor
- Java: if no constructor defined, compiler provides default
- C++: member initialization list (efficient field initialization)
- Python: `__init__` method

**Interview relevance:** Constructor questions appear in every OOP interview, especially Java.

---

### Learn 1.4 — Access Modifiers & Visibility
**Difficulty:** BEGINNER | **Est. Time:** 20 min | **Tags:** `[access-modifiers, public, private, protected, package-private, visibility]`

**Steps:** `EXPLANATION → COMPARISON(visibility table across languages) → CODE(3 blocks) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- `public`: accessible everywhere
- `private`: accessible only within the class
- `protected`: accessible within class, subclasses, and (in Java) same package
- Package-private (Java default): accessible within same package
- Why access control matters: encapsulation, API design
- Access modifier on class vs on member
- C++ `friend` classes and functions: breaking encapsulation intentionally
- Python: name mangling (`__field`), convention-based (`_field`)
- Getters and setters: controlled access to private fields
- Access modifiers in inheritance: what gets inherited and what doesn't

**Interview relevance:** "What is the difference between private and protected?" — frequently asked.

---

### Learn 1.5 — Static Members, Final/Const & Immutability
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[static, final, const, immutable, class-variable, singleton]`

**Steps:** `EXPLANATION → CODE(4 blocks) → COMPARISON(static vs instance) → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- `static` fields: shared across all instances (class-level, not instance-level)
- `static` methods: no `this`, can't access instance fields
- When to use static: utility methods, constants, factory methods, counters
- `final` (Java) / `const` (C++): prevents reassignment
- `final` class: cannot be subclassed (String in Java)
- `final` method: cannot be overridden
- `final` field: must be initialized once, then immutable
- Immutable objects: all fields final, no setters, defensive copies (String, Integer in Java)
- Benefits of immutability: thread safety, caching, simplicity
- `static final` = constant (e.g., `Math.PI`)

**Interview relevance:** "What does static mean?" / "What is the benefit of immutability?" — core OOP questions.

---

### Learn 1.6 — Object Lifecycle, Memory & Garbage Collection
**Difficulty:** INTERMEDIATE | **Est. Time:** 20 min | **Tags:** `[object-lifecycle, heap, stack, garbage-collection, finalize, raii]`

**Steps:** `EXPLANATION → VISUALIZATION(heap vs stack diagram) → COMPARISON(GC vs manual memory) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Object lifecycle: creation → use → no more references → eligible for GC
- Stack vs heap: where primitives and objects live
- Java GC: generational GC, young/old generation, minor/major GC
- GC roots: what keeps objects alive
- Memory leaks in GC languages: holding references longer than needed
- `finalize()` (deprecated) vs `try-with-resources` / `AutoCloseable`
- C++ RAII: Resource Acquisition Is Initialization — destructor releases resources
- C++ smart pointers vs Java GC
- Python reference counting + cyclic GC
- Weak references: allow GC to collect even if reference exists

**Interview relevance:** "How does garbage collection work?" / "Can Java have memory leaks?" — backend interview questions.

---

### Unit 1 Review — OOP Foundations
**Steps:** `SUMMARY → QUIZ(10) → MOCK_INTERVIEW → PROJECT(mini: Design a Bank Account class with all concepts applied)`

---
---

## UNIT 2 — The Four Pillars of OOP
**Unit Goal:** Master Encapsulation, Inheritance, Polymorphism, and Abstraction in complete depth. These are the core interview topics for every OOP round.

---

### Learn 2.1 — Encapsulation: Data Hiding & the Law of Demeter
**Difficulty:** BEGINNER | **Est. Time:** 25 min | **Tags:** `[encapsulation, data-hiding, getters, setters, law-of-demeter, information-hiding]`

**Steps:** `EXPLANATION → CODE(3 blocks) → VISUALIZATION(encapsulation diagram) → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Encapsulation: bind data and methods, control access
- Information hiding: hide implementation, expose interface
- Getter/setter pattern: controlled read/write access with validation
- Why not make everything public: breaks encapsulation, hard to change internals
- JavaBeans convention: `getX()`, `setX()`
- Encapsulation vs access modifiers: they're related but distinct
- Law of Demeter: "talk only to your friends" — avoid method chaining on unrelated objects
- Tell, Don't Ask principle: tell objects what to do, don't ask for data to decide
- Immutable encapsulation: no setters at all
- Encapsulation in real design: validating input in setters, computing derived values

**Interview relevance:** "What is encapsulation?" / "Why do we use getters and setters?" — always asked.

---

### Learn 2.2 — Inheritance: Single, Multilevel & Hierarchical
**Difficulty:** BEGINNER | **Est. Time:** 30 min | **Tags:** `[inheritance, extends, super, parent, child, method-inheritance, code-reuse]`

**Steps:** `EXPLANATION → VISUALIZATION(inheritance hierarchy diagram) → CODE(4 blocks) → QUIZ(6) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Inheritance: IS-A relationship, child class gets parent's fields and methods
- `extends` (Java), `:` (C++) — syntax for inheritance
- `super` keyword: access parent's constructor and methods
- Types of inheritance: single, multilevel, hierarchical
- Multiple inheritance in C++: allowed; in Java: not for classes (only interfaces)
- Constructor execution order: parent constructor before child
- Method inheritance: which methods are inherited, which are hidden
- `protected` members: specifically designed for inheritance
- Fragile base class problem: parent changes break children
- When to use inheritance vs composition

**Interview relevance:** "Explain inheritance" / "Why doesn't Java support multiple inheritance for classes?" — core OOP.

---

### Learn 2.3 — Method Overriding & the Liskov Substitution Principle
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[overriding, virtual, override, lsp, polymorphism, covariant]`

**Steps:** `EXPLANATION → CODE(3 blocks) → COMPARISON(overriding vs hiding) → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Method overriding: child provides its own implementation of parent method
- Rules for overriding: same name, same parameters, return type covariance
- `@Override` annotation (Java): compiler check
- `virtual` (C++) and `override` keyword: explicit opt-in to overriding
- Method hiding vs method overriding: static methods are hidden, not overridden
- `final` method: cannot be overridden
- **Liskov Substitution Principle**: child class must be usable wherever parent is
- LSP violations: classic Rectangle/Square problem
- Covariant return types: override can return more specific type
- Contravariant parameters (Liskov): override should accept same or broader types

**Interview relevance:** "What is the difference between method overloading and overriding?" — asked constantly.

---

### Learn 2.4 — Polymorphism: Compile-Time & Runtime
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[polymorphism, method-overloading, method-overriding, dynamic-dispatch, vtable]`

**Steps:** `EXPLANATION → VISUALIZATION(vtable diagram) → CODE(4 blocks) → COMPARISON(static vs dynamic polymorphism) → QUIZ(6) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Polymorphism: same interface, different behavior
- **Compile-time (static) polymorphism**: method overloading, operator overloading
- **Runtime (dynamic) polymorphism**: method overriding + dynamic dispatch
- How dynamic dispatch works: runtime type determines which method runs
- Virtual method table (vtable) in C++: how the runtime knows which method to call
- Upcasting: `Animal a = new Dog()` — legal, uses Animal reference
- Downcasting: `Dog d = (Dog) a` — risky, needs `instanceof` check
- `instanceof` / `is` operator for safe downcasting
- Parametric polymorphism: generics (another form of polymorphism)
- Why polymorphism is powerful: open-closed, extensible designs

**Interview relevance:** "What is polymorphism?" / "How does method overriding work at runtime?" — deep OOP question.

---

### Learn 2.5 — Abstraction: Abstract Classes
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[abstraction, abstract-class, abstract-method, template-method, partial-implementation]`

**Steps:** `EXPLANATION → CODE(4 blocks) → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Abstraction: hide implementation details, show only essential features
- Abstract class: cannot be instantiated, may have abstract methods
- Abstract method: declaration only, no implementation — subclass must implement
- Concrete class: provides implementation for all abstract methods
- Why abstract classes: share common code while enforcing structure
- Abstract class vs interface: when to use which
- Template Method Pattern: abstract class defines algorithm skeleton
- Partial implementation: abstract class can have concrete methods too
- `abstract` keyword in Java; pure virtual function `= 0` in C++
- Python abstract classes: `ABC` and `@abstractmethod`

**Interview relevance:** "What is an abstract class?" / "Can you instantiate an abstract class?" — standard questions.

---

### Learn 2.6 — Interfaces: Contracts & Multiple Inheritance
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[interface, implements, contract, multiple-interface, default-method, marker-interface]`

**Steps:** `EXPLANATION → CODE(4 blocks) → COMPARISON(interface vs abstract class) → QUIZ(6) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Interface: 100% abstract type — a contract, not an implementation
- `implements` keyword; a class can implement multiple interfaces
- Interface fields: implicitly `public static final`
- Interface methods: implicitly `public abstract` (before Java 8)
- Java 8+: `default` methods in interfaces (backward-compatible evolution)
- Java 8+: `static` methods in interfaces
- Java 9+: `private` methods in interfaces (code reuse inside interface)
- Marker interfaces: `Serializable`, `Cloneable` — convey metadata
- Functional interfaces: one abstract method, usable with lambda
- When interface, when abstract class: the definitive rule
- Interface segregation: many small interfaces > one large interface
- Programming to an interface: `List<String> list = new ArrayList<>()`

**Interview relevance:** "What is the difference between abstract class and interface?" — most common OOP interview question ever.

---

### Learn 2.7 — The Diamond Problem & Multiple Inheritance
**Difficulty:** INTERMEDIATE | **Est. Time:** 20 min | **Tags:** `[diamond-problem, multiple-inheritance, virtual-inheritance, default-method-conflict]`

**Steps:** `EXPLANATION → VISUALIZATION(diamond diagram) → CODE(3 blocks) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Diamond problem: ambiguity when class inherits from two classes with same method
- C++: virtual inheritance solves diamond problem, `virtual` base class
- Java: no multiple class inheritance → no diamond problem (for classes)
- Java default method conflict: two interfaces same default method → must override
- How Java resolves conflicts: class wins over interface, more specific interface wins
- Python MRO (Method Resolution Order): C3 linearization algorithm
- Mixin pattern: using multiple interfaces/traits for composition
- Why Java designers chose interfaces over multiple class inheritance

**Interview relevance:** "What is the diamond problem?" — asked to test depth of inheritance knowledge.

---

### Learn 2.8 — Four Pillars Summary & Comparison
**Difficulty:** BEGINNER | **Est. Time:** 20 min | **Tags:** `[four-pillars, encapsulation, inheritance, polymorphism, abstraction, comparison]`

**Steps:** `EXPLANATION → COMPARISON(pillars side-by-side) → VISUALIZATION → QUIZ(8) → MOCK_INTERVIEW → SUMMARY`

**What you'll learn:**
- Complete comparison of all four pillars: definition, mechanism, benefit, example
- How the four pillars work together in a real design
- Common interview trap questions: which pillar does X belong to?
- Real-world example: designing a Shape hierarchy using all four pillars
- Which pillar is demonstrated by each OOP concept
- How to explain each pillar with a 30-second answer in interviews
- Common misconceptions: "interface = abstraction", "virtual method = polymorphism"

**Interview relevance:** This entire Learn is an interview drill for the four pillars.

---

### Unit 2 Review — Four Pillars
**Steps:** `SUMMARY → QUIZ(12) → MOCK_INTERVIEW → PROJECT(mini: Design a vehicle hierarchy using all four pillars)`

---
---

## UNIT 3 — Relationships, Composition & Class Design
**Unit Goal:** Understand how classes relate to each other — composition, aggregation, association — and how to choose the right relationship for each design problem.

---

### Learn 3.1 — Association, Aggregation & Composition
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[association, aggregation, composition, has-a, uses-a, lifecycle]`

**Steps:** `EXPLANATION → VISUALIZATION(UML relationship diagrams) → CODE(3 blocks) → COMPARISON → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- **Association**: one class uses another (loose: "uses-a")
- **Aggregation**: one class "has-a" another, but part can exist independently (weak ownership)
- **Composition**: one class "contains" another, part cannot exist without whole (strong ownership)
- Lifecycle dependency: composition = child dies with parent, aggregation = child survives
- UML notation: open diamond (aggregation), filled diamond (composition), arrow (association)
- Code examples: University has Departments (aggregation), House has Rooms (composition)
- Dependency: weakest relationship — method parameter or local variable
- Choosing relationships: is this an IS-A (inheritance) or HAS-A (composition)?

**Interview relevance:** "What is the difference between aggregation and composition?" — common design question.

---

### Learn 3.2 — Composition Over Inheritance
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[composition-over-inheritance, strategy, delegation, flexibility]`

**Steps:** `EXPLANATION → CODE(3 blocks: inheritance problem → composition solution) → COMPARISON → QUIZ(4) → CHALLENGE → SUMMARY`

**What you'll learn:**
- The problem with deep inheritance hierarchies: rigidity, fragile base class
- "Favor composition over inheritance" — GoF principle
- Delegation: forward work to a contained object
- How to replace inheritance with composition
- Strategy Pattern as composition: inject behavior as a dependency
- Duck typing analogy: if it walks like a duck and quacks like a duck...
- When inheritance is still correct: true IS-A relationships
- Mixins / traits as a middle ground
- Java's approach: `Comparable`, `Iterable` interfaces + composition

**Interview relevance:** "Composition vs Inheritance" — design interview question with no single correct answer, tests reasoning.

---

### Learn 3.3 — Generics & Type Safety in OOP
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[generics, type-parameter, wildcard, bounded-type, type-erasure]`

**Steps:** `EXPLANATION → CODE(4 blocks) → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Generics: write code that works with any type, type-safe at compile time
- Generic class: `class Stack<T>`, generic method: `<T> T identity(T t)`
- Type bounds: `<T extends Comparable<T>>` — constrain type parameter
- Wildcards (Java): `List<?>`, `List<? extends Animal>`, `List<? super Dog>`
- PECS rule: Producer Extends, Consumer Super
- Type erasure (Java): generics removed at runtime — implications
- `instanceof` with generics: can't do `instanceof List<String>` due to erasure
- C++ templates: compile-time, no erasure, more powerful but code bloat risk
- Python generics: `typing.Generic`, `TypeVar`
- Generic design: collections, repositories, result types

**Interview relevance:** Generics and type safety are tested in Java and C++ interviews.

---

### Learn 3.4 — Inner Classes, Anonymous Classes & Lambda
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[inner-class, anonymous-class, lambda, functional-interface, nested-class]`

**Steps:** `EXPLANATION → CODE(4 blocks) → COMPARISON → QUIZ(4) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Member inner class: has access to outer class members
- Static nested class: no access to outer instance, just logically grouped
- Local inner class: defined inside a method
- Anonymous class: one-off implementation of interface/abstract class, no name
- Functional interface: one abstract method, foundation of lambdas
- Lambda expression: compact anonymous class syntax for functional interfaces
- Method references: `ClassName::method` — even more compact
- `Comparator`, `Runnable`, `Predicate`, `Function`, `Consumer` as functional interfaces
- Effectively final: local variables captured by lambda must be final or effectively final
- When to use each: anonymous class for multiple methods, lambda for single-method interfaces

**Interview relevance:** Lambda and functional interfaces are tested in Java 8+ interviews heavily.

---

### Learn 3.5 — Exception Handling in OOP
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[exceptions, checked, unchecked, custom-exception, exception-hierarchy, try-catch]`

**Steps:** `EXPLANATION → VISUALIZATION(exception hierarchy) → CODE(4 blocks) → COMPARISON(checked vs unchecked) → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Exception: OOP mechanism to handle errors
- Exception class hierarchy: `Throwable` → `Exception` / `Error`
- Checked exceptions: must be declared or caught (compile-time enforcement)
- Unchecked exceptions (RuntimeException): not required to catch
- `Error`: JVM-level issues, should not catch (`OutOfMemoryError`, `StackOverflowError`)
- `try-catch-finally`: execution guarantees
- `try-with-resources`: auto-close `AutoCloseable` objects
- Custom exceptions: extend `Exception` or `RuntimeException`
- Exception chaining: wrapping original cause
- Best practices: catch specific, not `Exception`; don't swallow exceptions; fail fast

**Interview relevance:** "Difference between checked and unchecked exceptions?" — very commonly asked Java question.

---

### Learn 3.6 — Object Cloning, Serialization & Comparison
**Difficulty:** INTERMEDIATE | **Est. Time:** 20 min | **Tags:** `[cloning, shallow-copy, deep-copy, serialization, equals, hashcode, comparable]`

**Steps:** `EXPLANATION → CODE(4 blocks) → COMPARISON(shallow vs deep copy) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Cloning: creating a copy of an object
- Shallow copy: copies field values, nested objects share references
- Deep copy: recursively copies all nested objects
- `Cloneable` interface and `clone()` method issues in Java
- Copy constructor: preferred alternative to `clone()`
- `equals()` vs `==`: reference equality vs value equality
- `hashCode()` contract: equal objects must have equal hash codes
- `equals()` and `hashCode()` in collections: HashMap, HashSet
- `Comparable` vs `Comparator`: natural ordering vs custom ordering
- Java serialization: `Serializable`, `ObjectOutputStream`, `transient` fields

**Interview relevance:** "What is the contract between equals and hashCode?" — classic Java interview question.

---

### Unit 3 Review — Relationships & Class Design
**Steps:** `SUMMARY → QUIZ(10) → MOCK_INTERVIEW → PROJECT(mini: Design an inventory system with proper relationships)`

---
---

## UNIT 4 — SOLID Principles
**Unit Goal:** Master the five most important object-oriented design principles. SOLID is asked in virtually every senior OOP and software design interview.

---

### Learn 4.1 — S: Single Responsibility Principle (SRP)
**Difficulty:** INTERMEDIATE | **Est. Time:** 20 min | **Tags:** `[srp, single-responsibility, cohesion, separation-of-concerns]`

**Steps:** `EXPLANATION → CODE(2 blocks: violation → fix) → QUIZ(4) → CHALLENGE → SUMMARY`

**What you'll learn:**
- SRP: a class should have only one reason to change
- "Reason to change" = one actor / stakeholder responsible for it
- Violation signs: class named `UserManagerAndEmailSenderAndDBHandler`
- How to split: separate concerns into focused classes
- Cohesion: high cohesion = strong SRP
- SRP applied to methods, modules, and microservices too
- God object anti-pattern: one class that does everything
- Practical balance: too many tiny classes is also bad
- SRP and testability: small classes are easier to unit test

**Interview relevance:** SOLID questions are asked in 90% of senior developer interviews.

---

### Learn 4.2 — O: Open/Closed Principle (OCP)
**Difficulty:** INTERMEDIATE | **Est. Time:** 20 min | **Tags:** `[ocp, open-closed, extension, modification, strategy-pattern, polymorphism]`

**Steps:** `EXPLANATION → CODE(2 blocks: violation → fix using polymorphism) → QUIZ(4) → CHALLENGE → SUMMARY`

**What you'll learn:**
- OCP: open for extension, closed for modification
- Violation: adding new behavior requires modifying existing code (fragile)
- Solution: use polymorphism and interfaces to extend without modifying
- Strategy Pattern as OCP implementation
- Decorator Pattern as OCP implementation
- When OCP is overkill: not every class needs to be extensible
- "Protected variation" concept
- OCP in frameworks: plugin architectures, hooks, callbacks
- Practical balance: apply OCP where change is expected

**Interview relevance:** "Explain the Open/Closed Principle with an example" — standard SOLID interview question.

---

### Learn 4.3 — L: Liskov Substitution Principle (LSP)
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[lsp, liskov, behavioral-subtyping, contract, rectangle-square]`

**Steps:** `EXPLANATION → CODE(3 blocks: violation → fix) → VISUALIZATION → QUIZ(4) → CHALLENGE → SUMMARY`

**What you'll learn:**
- LSP: subtype must be substitutable for its supertype without altering correctness
- Behavioral subtyping: not just type-safe, but behaviorally correct
- Classic violation: Square extends Rectangle — breaks width/height invariant
- LSP violations: subclass throws exception parent doesn't, subclass ignores method, subclass strengthens preconditions
- Design by Contract: preconditions, postconditions, invariants
- How to fix: don't inherit if behavior differs; use composition or different hierarchy
- Covariance and contravariance in LSP
- "Tell me when you violated LSP" — what a good answer looks like

**Interview relevance:** The Rectangle/Square problem is the most famous OOP interview question for LSP.

---

### Learn 4.4 — I: Interface Segregation Principle (ISP)
**Difficulty:** INTERMEDIATE | **Est. Time:** 20 min | **Tags:** `[isp, interface-segregation, fat-interface, role-interface, cohesion]`

**Steps:** `EXPLANATION → CODE(2 blocks: fat interface → segregated) → QUIZ(4) → CHALLENGE → SUMMARY`

**What you'll learn:**
- ISP: clients should not depend on interfaces they don't use
- Fat interface: one large interface with many unrelated methods
- Violation: implementing class forced to have empty/throw methods
- Solution: split into role-specific interfaces
- ISP and SRP: ISP applies to interfaces, SRP to classes
- Role interfaces: `Printable`, `Saveable`, `Displayable` vs one `Document` interface
- How ISP relates to cohesion: each interface has one cohesive purpose
- ISP in REST APIs: separate endpoints vs one mega-endpoint
- Practical application: abstract base classes with many methods

**Interview relevance:** "What is the Interface Segregation Principle?" — SOLID interview standard.

---

### Learn 4.5 — D: Dependency Inversion Principle (DIP) & Dependency Injection
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[dip, dependency-inversion, dependency-injection, ioc, di-container]`

**Steps:** `EXPLANATION → CODE(3 blocks: tight coupling → DIP → DI) → COMPARISON → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- DIP: depend on abstractions, not concretions
- High-level modules should not depend on low-level modules — both on abstractions
- Tight coupling: `class OrderService { MySQLDatabase db = new MySQLDatabase(); }`
- Loose coupling via DIP: `class OrderService { Database db; }` — interface, not class
- **Dependency Injection (DI)**: provide dependencies from outside (constructor, setter, field)
- Constructor injection vs setter injection vs field injection — pros/cons
- IoC Container: framework manages dependency creation and injection (Spring, .NET DI)
- Benefits: testability (inject mocks), flexibility (swap implementations), decoupling
- The difference between DIP (principle) and DI (technique)

**Interview relevance:** "What is dependency injection?" / "What is Inversion of Control?" — extremely common in Java/Spring interviews.

---

### Learn 4.6 — SOLID in Practice: Applying All 5 Together
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[solid, design, refactoring, code-review, principles]`

**Steps:** `EXPLANATION → CODE(3 blocks: before SOLID → after SOLID) → QUIZ(6) → CHALLENGE(refactor exercise) → MOCK_INTERVIEW → SUMMARY`

**What you'll learn:**
- Walking through a realistic codebase and applying all 5 SOLID principles
- How violations compound: breaking SRP usually leads to OCP and DIP violations
- SOLID and testability: SOLID code is naturally easier to unit test
- SOLID and design patterns: most patterns implement one or more SOLID principles
- When SOLID is overkill: prototypes, small scripts, throw-away code
- Common misconceptions about each principle
- How to communicate SOLID reasoning in a code review
- SOLID and microservices: SOLID at the architecture level

**Interview relevance:** This entire Learn is a code design walkthrough — the format of real-world OOP interviews.

---

### Unit 4 Review — SOLID Principles
**Steps:** `SUMMARY → QUIZ(10) → MOCK_INTERVIEW → PROJECT(mini: Refactor a violating codebase to be SOLID-compliant)`

---
---

## UNIT 5 — Design Patterns
**Unit Goal:** Learn the most important and most interviewed design patterns — Creational, Structural, and Behavioral. Understand not just the pattern but *why* it exists.

---

### Learn 5.1 — Introduction to Design Patterns & GoF
**Difficulty:** INTERMEDIATE | **Est. Time:** 20 min | **Tags:** `[design-patterns, gof, creational, structural, behavioral, pattern-overview]`

**Steps:** `EXPLANATION → COMPARISON(pattern categories) → VISUALIZATION → QUIZ(4) → SUMMARY`

**What you'll learn:**
- What design patterns are: reusable solutions to recurring design problems
- Gang of Four (GoF): the book, the 23 patterns, their categorization
- **Creational**: how objects are created (5 patterns)
- **Structural**: how objects are composed/structured (7 patterns)
- **Behavioral**: how objects communicate and behave (11 patterns)
- Patterns vs algorithms: patterns are design templates, not code
- When NOT to use patterns: over-engineering risk
- Pattern language: how to communicate design decisions
- Patterns and SOLID: each pattern typically implements SOLID

**Interview relevance:** "What are design patterns?" / "Name some design patterns you've used" — universal question.

---

### Learn 5.2 — Creational Patterns: Singleton & Factory
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[singleton, factory, factory-method, simple-factory, thread-safe-singleton]`

**Steps:** `EXPLANATION → CODE(4 blocks) → COMPARISON(singleton variations) → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- **Singleton**: ensure only one instance exists, global access point
- Singleton implementation: lazy, eager, double-checked locking, enum (best in Java)
- Thread-safety in singleton: `volatile` + synchronized, Bill Pugh idiom
- Singleton problems: testing difficulty, global state, tight coupling
- **Simple Factory**: static method creates objects — not a GoF pattern
- **Factory Method**: define interface for creation, subclasses decide which class
- Factory Method vs Simple Factory: extensibility (OCP)
- Real examples: `Calendar.getInstance()`, `NumberFormat.getInstance()`
- Spring beans are singletons by default

**Interview relevance:** "Explain Singleton pattern" / "How to make Singleton thread-safe?" — asked constantly.

---

### Learn 5.3 — Creational Patterns: Abstract Factory & Builder
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[abstract-factory, builder, fluent-interface, step-builder, telescoping-constructor]`

**Steps:** `EXPLANATION → CODE(3 blocks) → COMPARISON(factory vs abstract factory vs builder) → QUIZ(4) → CHALLENGE → SUMMARY`

**What you'll learn:**
- **Abstract Factory**: create families of related objects without specifying classes
- Abstract Factory vs Factory Method: factory of factories
- Use case: cross-platform UI (WindowsButton + MacButton from one factory)
- **Builder**: construct complex objects step by step
- Builder vs constructor: when object has many optional parameters
- Telescoping constructor anti-pattern: what Builder solves
- Fluent interface: method chaining in builder (`builder.setA().setB().build()`)
- Director class: orchestrates builder steps
- Java `StringBuilder`, `Stream.builder()` as examples
- Immutable object construction via builder

**Interview relevance:** Builder pattern is heavily used and frequently asked in Java interviews.

---

### Learn 5.4 — Structural Patterns: Adapter, Decorator & Facade
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[adapter, decorator, facade, wrapper, structural-patterns]`

**Steps:** `EXPLANATION → CODE(4 blocks) → COMPARISON → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- **Adapter**: convert one interface to another — "plug adapter" pattern
- Object adapter vs class adapter (C++)
- Real examples: `Arrays.asList()`, InputStreamReader wrapping InputStream
- **Decorator**: add behavior to object dynamically without subclassing
- Decorator vs inheritance: more flexible, follows OCP
- Java I/O streams: the most famous Decorator example
- Decorator chain: wrapping multiple decorators
- **Facade**: simplified interface to a complex subsystem
- Facade vs Adapter: Adapter changes interface, Facade simplifies it
- Real examples: Java's `JdbcTemplate`, Spring's `RestTemplate`

**Interview relevance:** All three are commonly asked; "What design patterns are used in Java I/O?" leads to Decorator.

---

### Learn 5.5 — Structural Patterns: Proxy, Composite & Bridge
**Difficulty:** ADVANCED | **Est. Time:** 25 min | **Tags:** `[proxy, composite, bridge, virtual-proxy, lazy-loading, tree-structure]`

**Steps:** `EXPLANATION → CODE(3 blocks) → COMPARISON → QUIZ(4) → CHALLENGE → SUMMARY`

**What you'll learn:**
- **Proxy**: surrogate or placeholder for another object
- Virtual proxy: delay expensive object creation (lazy loading)
- Protection proxy: control access
- Remote proxy: represent object in different address space (RMI, gRPC stubs)
- Spring AOP uses proxies for transactions, logging, security
- **Composite**: treat individual objects and compositions uniformly (tree structures)
- Component + Leaf + Composite: the pattern structure
- Real examples: file system (files and folders), UI component tree
- **Bridge**: decouple abstraction from implementation, both can vary independently
- Bridge vs Adapter: Bridge is designed upfront, Adapter retrofits

**Interview relevance:** Proxy is important for Spring AOP; Composite for tree-structured problems.

---

### Learn 5.6 — Behavioral Patterns: Observer, Strategy & Command
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[observer, strategy, command, event-driven, pub-sub, behavioral]`

**Steps:** `EXPLANATION → CODE(4 blocks) → COMPARISON → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- **Observer**: define one-to-many dependency, notify all dependents on change
- Push vs pull model in Observer
- Observer in Java: `EventListener`, JavaFX bindings; in JavaScript: DOM events
- Observer vs Pub/Sub: Pub/Sub has a message broker, Observer is direct
- **Strategy**: define family of algorithms, encapsulate each, make them interchangeable
- Strategy and OCP: add new strategy without modifying context
- Real examples: sorting strategies, payment methods, authentication strategies
- **Command**: encapsulate request as object, support undo, queuing, logging
- Undo/redo implementation using Command
- Command Queue / Job Queue using Command pattern

**Interview relevance:** Observer is the most asked behavioral pattern. Strategy and Command are standard interview material.

---

### Learn 5.7 — Behavioral Patterns: Iterator, Template Method & State
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[iterator, template-method, state, state-machine, behavioral]`

**Steps:** `EXPLANATION → CODE(3 blocks) → COMPARISON → QUIZ(4) → CHALLENGE → SUMMARY`

**What you'll learn:**
- **Iterator**: traverse collection without exposing structure
- Java `Iterable` and `Iterator` interfaces
- External vs internal iterators
- **Template Method**: define algorithm skeleton in base class, defer steps to subclasses
- Template Method vs Strategy: Template uses inheritance, Strategy uses composition
- Real examples: `HttpServlet.service()`, `AbstractList` in Java
- **State**: object changes behavior when internal state changes
- State vs switch statement: State pattern is OOP, switch is procedural
- State machine implementation using State pattern
- Real examples: vending machine, traffic light, order lifecycle

**Interview relevance:** Template Method is common in framework design questions; State for state machine questions.

---

### Learn 5.8 — Behavioral Patterns: Chain of Responsibility, Mediator & Flyweight
**Difficulty:** ADVANCED | **Est. Time:** 20 min | **Tags:** `[chain-of-responsibility, mediator, flyweight, middleware, pipeline]`

**Steps:** `EXPLANATION → CODE(3 blocks) → QUIZ(3) → SUMMARY`

**What you'll learn:**
- **Chain of Responsibility**: pass request along a chain of handlers
- Each handler decides to process or pass along
- Real examples: HTTP middleware, exception handling, logger levels
- **Mediator**: centralize complex communications between objects
- Mediator vs Observer: Mediator is two-way coordination, Observer is broadcast
- Air traffic controller analogy
- Real examples: chat room, event bus, MVC controller
- **Flyweight**: share intrinsic state to support many fine-grained objects efficiently
- Intrinsic vs extrinsic state
- Real examples: Java String pool, character rendering in word processors

**Interview relevance:** Chain of Responsibility (middleware) is very commonly asked in web backend interviews.

---

### Unit 5 Review — Design Patterns
**Steps:** `SUMMARY → QUIZ(12) → MOCK_INTERVIEW → PROJECT(major: Build a mini e-commerce checkout system using 5+ patterns)`

---
---

## UNIT 6 — Advanced OOP & Interview Mastery
**Unit Goal:** Cover advanced OOP topics — covariance, reflection, OOP in different languages — and master the interview format for OOP design questions.

---

### Learn 6.1 — OOP in Java vs C++ vs Python: Differences That Matter
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[java-oop, cpp-oop, python-oop, language-comparison, duck-typing]`

**Steps:** `EXPLANATION → COMPARISON(language feature matrix) → CODE(3 blocks: same design, 3 languages) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Java OOP: everything is a class, no multiple inheritance, interfaces, GC
- C++ OOP: multiple inheritance, operator overloading, RAII, no GC, manual memory
- Python OOP: duck typing, no access modifiers (convention), MRO, dunder methods
- Operator overloading: C++ and Python support it, Java mostly doesn't
- Duck typing: Python checks behavior, not type hierarchy
- Python magic methods: `__str__`, `__repr__`, `__eq__`, `__hash__`, `__len__`
- C++ destructors vs Java finalize vs Python `__del__`
- How to answer "What language is best for OOP?" in an interview

**Interview relevance:** Language-specific OOP differences matter for language-specific roles.

---

### Learn 6.2 — Reflection, Annotations & Metaprogramming
**Difficulty:** ADVANCED | **Est. Time:** 25 min | **Tags:** `[reflection, annotations, metadata, proxy, aop, spring]`

**Steps:** `EXPLANATION → CODE(3 blocks) → QUIZ(3) → SUMMARY`

**What you'll learn:**
- Reflection: inspect and modify classes/objects at runtime
- Java Reflection API: `Class.forName()`, `getFields()`, `getMethods()`, `invoke()`
- Use cases: frameworks (Spring, Hibernate), serialization libraries, testing
- Annotations: metadata on classes, fields, methods
- Retention policies: SOURCE, CLASS, RUNTIME
- Processing annotations at compile time (annotation processors) vs runtime (reflection)
- Annotation examples: `@Override`, `@Autowired`, `@Entity`, `@Test`
- Dynamic proxies: `java.lang.reflect.Proxy` — runtime interface implementation
- AOP (Aspect-Oriented Programming): cross-cutting concerns via proxies
- Cost of reflection: performance implications

**Interview relevance:** Spring framework internals questions rely on understanding annotations and reflection.

---

### Learn 6.3 — Concurrency in OOP: Thread Safety & Immutability
**Difficulty:** ADVANCED | **Est. Time:** 25 min | **Tags:** `[thread-safety, immutability, synchronized, volatile, concurrent-collections]`

**Steps:** `EXPLANATION → CODE(4 blocks) → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Thread-safety: object behaves correctly when accessed by multiple threads
- Immutable objects are inherently thread-safe (no state to corrupt)
- `synchronized` keyword: lock on object monitor
- `volatile`: ensure visibility across threads (not atomicity)
- `Atomic` classes: `AtomicInteger`, `AtomicReference` — lock-free thread safety
- Thread-safe collections: `ConcurrentHashMap`, `CopyOnWriteArrayList`, `BlockingQueue`
- The `synchronized` pitfalls: deadlock, performance, over-synchronization
- `java.util.concurrent` package overview
- Thread-local storage: `ThreadLocal<T>` — per-thread object copy

**Interview relevance:** Concurrency in OOP is heavily tested for senior Java developer roles.

---

### Learn 6.4 — Anti-Patterns & Code Smells
**Difficulty:** INTERMEDIATE | **Est. Time:** 20 min | **Tags:** `[anti-patterns, code-smells, god-object, spaghetti, anemic-model, refactoring]`

**Steps:** `EXPLANATION → COMPARISON(anti-patterns list) → CODE(2 blocks: smell → fix) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- **God Object / Blob**: one class does too much (SRP violation)
- **Spaghetti Code**: no structure, everything is tangled
- **Anemic Domain Model**: classes with only getters/setters, no behavior
- **Premature Optimization**: optimize before measuring
- **Copy-Paste Programming**: duplication instead of abstraction
- **Magic Numbers/Strings**: hardcoded values without named constants
- **Feature Envy**: method more interested in another class's data
- **Data Clumps**: groups of data that always appear together should be a class
- **Shotgun Surgery**: one change requires modifying many classes
- How to identify and refactor each smell

**Interview relevance:** Code review and refactoring interviews test pattern recognition of these issues.

---

### Learn 6.5 — Object-Oriented Design Interview: How to Approach
**Difficulty:** ALL LEVELS | **Est. Time:** 30 min | **Tags:** `[ood, system-design, class-design, uml, interview-approach]`

**Steps:** `EXPLANATION → CODE(4 blocks: OOD walkthroughs) → QUIZ(5) → MOCK_INTERVIEW → SUMMARY`

**What you'll learn:**
- The OOD interview format: "Design a parking lot / elevator / library / ATM"
- 5-step approach to any OOD question:
  1. Clarify requirements (ask questions)
  2. Identify key objects/entities
  3. Define relationships (IS-A, HAS-A)
  4. Define interfaces and abstract classes
  5. Apply SOLID and relevant patterns
- Class diagrams: quickly sketch classes and relationships
- Walking through: Parking Lot design with all classes
- Walking through: Library Management System
- Walking through: ATM / Vending Machine
- Common design interview mistakes and how to avoid them
- How to demonstrate SOLID without being asked

**Interview relevance:** This IS the OOD interview format used at Amazon, Google, Microsoft, etc.

---

### Learn 6.6 — OOP Interview Masterclass: Quick Reference & Practice
**Difficulty:** ALL LEVELS | **Est. Time:** 35 min | **Tags:** `[interview-prep, cheatsheet, patterns, oop-questions, 30-questions]`

**Steps:** `EXPLANATION → QUIZ(10) → MOCK_INTERVIEW → CHALLENGE(3 OOD scenarios) → SUMMARY`

**What you'll learn:**
- Top 30 OOP interview questions with structured answers
- Quick-reference cards: Four Pillars, SOLID, common patterns
- How to answer questions at different depths (junior vs senior)
- Comparison cheatsheet: interface vs abstract, overloading vs overriding, aggregation vs composition
- Pattern recognition: "given this problem, which pattern applies?"
- Common gotcha questions: Can abstract class have constructors? (Yes) Can interface extend another? (Yes) Can you override static methods? (No)
- How to structure a 2-minute answer to "Tell me about OOP"
- Red flags interviewers watch for in OOP answers

**Interview relevance:** This entire Learn is pure interview prep — the format, the patterns, the quick reference.

---

### Unit 6 Review — Full OOP Mock Interview & Capstone
**Steps:** `SUMMARY → QUIZ(15 mixed) → MOCK_INTERVIEW → PROJECT(major: Design a hotel booking system using full OOP + SOLID + patterns)`

---
---

## Summary: Complete Learn Count

| Unit | Topic | Learns |
|------|-------|--------|
| Unit 1 | OOP Foundations | 6 + 1 review = **7** |
| Unit 2 | Four Pillars of OOP | 8 + 1 review = **9** |
| Unit 3 | Relationships & Class Design | 6 + 1 review = **7** |
| Unit 4 | SOLID Principles | 6 + 1 review = **7** |
| Unit 5 | Design Patterns | 8 + 1 review = **9** |
| Unit 6 | Advanced OOP & Interview Mastery | 6 + 1 review = **7** |
| **TOTAL** | | **46 Learns** |

---

## Interview Question Coverage Map

| OOP Topic | Learns That Cover It |
|-----------|---------------------|
| Four pillars definitions | 2.1–2.6, 2.8 |
| Abstract vs interface | 2.5, 2.6 |
| Overloading vs overriding | 2.3, 2.4 |
| SOLID principles | All of Unit 4 |
| Design patterns | All of Unit 5 |
| Singleton thread-safety | 5.2 |
| Composition vs inheritance | 3.2 |
| equals/hashCode contract | 3.6 |
| Checked vs unchecked exceptions | 3.5 |
| Dependency injection | 4.5 |
| OOD interview problems | 6.5 |
| Diamond problem | 2.7 |
| Generics & type safety | 3.3 |
| Concurrency in OOP | 6.3 |

---

## Step Template Reference

Standard Learn flow:
```
EXPLANATION → [VISUALIZATION?] → CODE(Java+C++/Python) → [COMPARISON?] → QUIZ → CHALLENGE → [RESOURCE?] → SUMMARY
```

Unit-end Learns:
```
SUMMARY(recap) → QUIZ(10-15) → MOCK_INTERVIEW → PROJECT
```

---

*Document created for BuildrHQ — OOP Concepts Learn Module*