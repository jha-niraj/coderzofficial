import { prisma } from '@repo/prisma';

export async function seedSqlLearnContent() {
    console.log('📚 Seeding SQL Learn Content...');

    const admin = await prisma.user.findFirst({ where: { role: 'Admin' } });
    if (!admin) { console.log('⚠️ No admin user found, skipping SQL seed'); return; }
    const creatorId = admin.id;

    // ── Step 0: Clean up existing SQL learns ──
    console.log('  🗑️ Cleaning existing SQL data...');
    const existingSql = await prisma.learnSubCategory.findUnique({ where: { slug: 'sql' } });
    if (existingSql) {
        await prisma.learn.deleteMany({ where: { subCategoryId: existingSql.id } });
        await prisma.learnTopic.deleteMany({ where: { subCategoryId: existingSql.id } });
    }

    // ── Step 1: Categories ──
    const programming = await prisma.learnMainCategory.upsert({
        where: { slug: 'programming' },
        update: {},
        create: { slug: 'programming', name: 'Programming', description: 'Learn programming languages and fundamentals', icon: '💻', color: '#3B82F6', order: 1 },
    });

    const sql = await prisma.learnSubCategory.upsert({
        where: { slug: 'sql' },
        update: {},
        create: { slug: 'sql', name: 'SQL', description: 'Master SQL from foundations to advanced query optimization — interview-ready', mainCategoryId: programming.id, icon: '🗄️', color: '#F97316', order: 3 },
    });

    // ── Step 2: Create LearnTopics (one per unit) ──
    const topicDefs = [
        { slug: 'sql-unit1-foundations', name: 'Foundations of SQL & Databases', description: 'What SQL is, ACID, data types, normalization, schema design, isolation', icon: '🧱', order: 1 },
        { slug: 'sql-unit2-core-sql', name: 'Core SQL: Writing Queries', description: 'SELECT, functions, aggregates, GROUP BY, CASE, DML, ROLLUP', icon: '✍️', order: 2 },
        { slug: 'sql-unit3-joins', name: 'Joins & Multi-Table Queries', description: 'INNER, LEFT, SELF, CROSS, ANTI-JOIN, multi-table joins, LATERAL', icon: '🔗', order: 3 },
        { slug: 'sql-unit4-subqueries-windows', name: 'Subqueries, CTEs & Window Functions', description: 'Subqueries, CTEs, recursive CTEs, ROW_NUMBER, LAG/LEAD, frames', icon: '🪟', order: 4 },
        { slug: 'sql-unit5-performance', name: 'Performance & Schema Design', description: 'Execution plans, indexes, EXPLAIN, optimization, views, partitioning', icon: '⚡', order: 5 },
        { slug: 'sql-unit6-advanced', name: 'Advanced SQL & Interview Mastery', description: 'REGEX, JSON, transactions, locking, interview strategy', icon: '🏆', order: 6 },
    ];
    const topics: Record<string, any> = {};
    for (const t of topicDefs) {
        topics[t.slug] = await prisma.learnTopic.create({
            data: { slug: t.slug, name: t.name, description: t.description, icon: t.icon, order: t.order, subCategoryId: sql.id },
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
            order: number; title: string; type: string; content: string; tips?: string[]; keyTakeaways?: string[]; warnings?: string[]; stepData?: object;
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
                estimatedTime: data.estimatedTime, iconEmoji: data.iconEmoji, accentColor: '#F97316',
                status: 'PUBLISHED', publishedAt: new Date(), creatorId,
                mainCategoryId: programming.id, subCategoryId: sql.id,
                topicId: topic?.id || null,
            },
        });

        for (const step of data.steps) {
            const createdStep = await prisma.learnStep.create({
                data: {
                    learnId: learn.id, order: step.order, title: step.title,
                    type: step.type as any, content: step.content,
                    tips: step.tips || [], keyTakeaways: step.keyTakeaways || [], warnings: step.warnings || [],
                    stepData: step.stepData ? (step.stepData as any) : undefined,
                },
            });

            if (step.codeBlocks) {
                for (const cb of step.codeBlocks) {
                    await prisma.learnCodeBlock.create({
                        data: {
                            stepId: createdStep.id, order: cb.order, title: cb.title,
                            language: cb.language, code: cb.code, explanation: cb.explanation,
                            highlightLines: cb.highlightLines || [], showLineNumbers: true, isRunnable: cb.isRunnable ?? false,
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
                            codeLanguage: card.codeLanguage || 'sql',
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
                            codeLanguage: q.codeLanguage || 'sql',
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

    // ═══════════════════════════════════════════════════════════════════════════
    // UNIT 1 — Foundations of SQL & Databases
    // ═══════════════════════════════════════════════════════════════════════════

    // ── Learn 1.1: What is SQL & How Databases Work ──
    await createLearn({
        slug: 'sql-what-is-sql-and-databases',
        title: 'What is SQL & How Databases Work',
        description: 'Understand what relational databases are, why SQL exists, how tables/rows/columns map to real-world data, the difference between SQL and NoSQL, and the role of a DBMS. This is where every SQL journey begins.',
        difficulty: 'BEGINNER',
        topicSlug: 'sql-unit1-foundations',
        unitTitle: 'Unit 1: Foundations of SQL & Databases',
        estimatedTime: 20,
        tags: ['sql', 'rdbms', 'database', 'intro', 'sql-vs-nosql'],
        iconEmoji: '🗄️',
        steps: [
            {
                order: 0,
                title: 'What is a Database & Why SQL?',
                type: 'EXPLANATION',
                tips: [
                    'Think of a database as a super-powered spreadsheet that can handle millions of rows and multiple users simultaneously.',
                    'SQL is pronounced both "sequel" and "S-Q-L" — both are accepted.',
                    'Every major tech company uses SQL databases: Google, Meta, Amazon, Netflix, Uber.',
                ],
                content: `# What is SQL & How Databases Work

## What is a Database?

A **database** is an organized collection of structured data stored electronically. Unlike a spreadsheet, a database can:

- Store **millions to billions of rows** efficiently
- Allow **multiple users** to read and write simultaneously
- Enforce **rules** (constraints) to keep data valid
- Provide **fast lookups** even on massive datasets via indexing
- Guarantee **data integrity** even during crashes (ACID properties)

---

## What is a Relational Database?

A **relational database** organizes data into **tables** (also called *relations*). Each table has:

| Concept | Analogy | Description |
|---------|---------|-------------|
| **Table** | A spreadsheet sheet | A collection of related data |
| **Row** (Record/Tuple) | One spreadsheet row | A single entity (e.g., one customer) |
| **Column** (Field/Attribute) | A spreadsheet column | A single property (e.g., customer name) |
| **Primary Key** | A unique row ID | Uniquely identifies each row |
| **Foreign Key** | A reference/link | Points to a row in another table |

### Example: A \`customers\` Table

| id | name | email | city |
|----|------|-------|------|
| 1 | Alice | alice@mail.com | Mumbai |
| 2 | Bob | bob@mail.com | Delhi |
| 3 | Carol | carol@mail.com | Bangalore |

Here, \`id\` is the **primary key** — each value is unique and identifies one customer.

---

## What is SQL?

**SQL (Structured Query Language)** is the standard language for interacting with relational databases. It lets you:

- **Query** data: "Give me all customers from Mumbai"
- **Insert** data: "Add a new customer"
- **Update** data: "Change Bob's city to Pune"
- **Delete** data: "Remove customer with id 3"
- **Define** structure: "Create a new table for orders"

SQL is **declarative** — you describe *what* you want, not *how* to get it. The database engine figures out the best way to execute your request.

\`\`\`sql
-- You tell SQL WHAT you want:
SELECT name, email FROM customers WHERE city = 'Mumbai';

-- You DON'T tell it HOW to scan the table, which index to use, etc.
-- The database optimizer handles that.
\`\`\`

---

## SQL Sub-Languages

SQL is divided into several sub-languages:

| Sub-Language | Full Name | What It Does | Key Commands |
|-------------|-----------|-------------|--------------|
| **DDL** | Data Definition Language | Define/modify structure | \`CREATE\`, \`ALTER\`, \`DROP\`, \`TRUNCATE\` |
| **DML** | Data Manipulation Language | Read/write data | \`SELECT\`, \`INSERT\`, \`UPDATE\`, \`DELETE\` |
| **DCL** | Data Control Language | Manage permissions | \`GRANT\`, \`REVOKE\` |
| **TCL** | Transaction Control Language | Manage transactions | \`COMMIT\`, \`ROLLBACK\`, \`SAVEPOINT\` |

> The vast majority of your work (and interview questions) will be **DML** — reading and writing data.

---

## How a DBMS Works

A **DBMS (Database Management System)** is the software that manages the database. Think of it as the "engine" that:

1. **Parses** your SQL query
2. **Optimizes** the execution plan (chooses the fastest approach)
3. **Executes** the plan against stored data
4. **Returns** results to you

\`\`\`mermaid
flowchart LR
    A[You write SQL] --> B[Query Parser]
    B --> C[Query Optimizer]
    C --> D[Execution Engine]
    D --> E[Storage Engine]
    E --> F[Data on Disk]
    F --> D
    D --> G[Results returned to you]
\`\`\`

---

## Popular Relational Databases

| Database | Creator | Best For | License |
|----------|---------|----------|---------|
| **PostgreSQL** | Community | Complex queries, extensions, JSONB | Open source |
| **MySQL** | Oracle | Web apps, read-heavy workloads | Open source |
| **SQLite** | D. Richard Hipp | Embedded, mobile, local apps | Public domain |
| **SQL Server** | Microsoft | Enterprise, .NET ecosystem | Commercial |
| **Oracle DB** | Oracle | Large enterprise, banking | Commercial |
| **MariaDB** | Community | MySQL-compatible fork | Open source |

> **For interviews**: PostgreSQL and MySQL are the most commonly tested. SQL Server appears in enterprise/Microsoft stack interviews.`,
            },
            {
                order: 1,
                title: 'SQL vs NoSQL — When to Use Each',
                type: 'COMPARISON',
                content: `# SQL vs NoSQL — The Most Common Interview Question

Understanding when to use SQL (relational) vs NoSQL (non-relational) databases is one of the most frequently asked interview questions across all levels.

## Side-by-Side Comparison

| Aspect | SQL (Relational) | NoSQL (Non-Relational) |
|--------|-------------------|----------------------|
| **Data Model** | Tables with rows & columns | Documents, key-value, graph, column-family |
| **Schema** | Fixed schema (defined upfront) | Flexible/dynamic schema |
| **Query Language** | SQL (standardized) | Database-specific APIs |
| **Relationships** | JOINs across tables | Denormalized / embedded data |
| **Scaling** | Vertical (bigger server) | Horizontal (more servers) |
| **ACID Compliance** | Yes (strong consistency) | Varies (eventual consistency common) |
| **Best For** | Complex queries, transactions, data integrity | High throughput, flexible data, rapid iteration |

## When to Choose SQL

- You need **strong data integrity** (banking, e-commerce, healthcare)
- Your data has **clear relationships** (users → orders → products)
- You need **complex queries** with JOINs, aggregations, window functions
- You need **ACID transactions** (money transfers, inventory updates)
- Your **schema is well-defined** and doesn't change frequently

## When to Choose NoSQL

- You need **massive horizontal scaling** (millions of writes/sec)
- Your data is **semi-structured or varies** per record (user profiles with different fields)
- You need **low-latency reads** for simple lookups (caching, sessions)
- Your data is **document-oriented** (blog posts, product catalogs)
- You're building a **real-time app** with rapidly changing requirements

## NoSQL Types at a Glance

| Type | Example | Data Model | Use Case |
|------|---------|-----------|----------|
| **Document** | MongoDB, CouchDB | JSON-like documents | Content management, catalogs |
| **Key-Value** | Redis, DynamoDB | Simple key→value pairs | Caching, sessions, leaderboards |
| **Column-Family** | Cassandra, HBase | Wide columns per row | Time-series, IoT, analytics |
| **Graph** | Neo4j, ArangoDB | Nodes and edges | Social networks, recommendations |

## The Real-World Answer (Interview Gold)

> "In practice, most production systems use **both**. SQL for the core transactional data (users, orders, payments) and NoSQL for specific use cases (caching with Redis, search with Elasticsearch, real-time feeds with MongoDB). The choice depends on the specific access patterns and consistency requirements of each part of the system."

This answer shows maturity and real-world understanding — interviewers love it.`,
                stepData: {
                    items: [
                        { title: 'SQL (Relational)', description: 'Structured data in tables with fixed schemas, powerful query language, strong consistency', pros: ['ACID transactions', 'Complex JOINs and aggregations', 'Data integrity via constraints', 'Standardized query language', 'Mature tooling and ecosystem'], cons: ['Harder to scale horizontally', 'Schema changes can be painful', 'Not ideal for unstructured data'], useCase: 'Banking, e-commerce, ERP, any system needing data integrity' },
                        { title: 'NoSQL (Non-Relational)', description: 'Flexible schemas, horizontal scaling, optimized for specific access patterns', pros: ['Easy horizontal scaling', 'Flexible schema', 'High write throughput', 'Low-latency simple reads', 'Great for specific access patterns'], cons: ['Limited query capabilities (no JOINs)', 'Eventual consistency (data may be stale)', 'No standardized query language', 'Data duplication is common'], useCase: 'Real-time apps, caching, IoT, content management, social feeds' },
                    ],
                },
            },
            {
                order: 2,
                title: 'How a Query Gets Executed — Visualization',
                type: 'VISUALIZATION',
                content: `# How a SQL Query Gets Executed

When you write a SQL query, it goes through several stages before returning results. Understanding this pipeline helps you write better, faster queries.

\`\`\`mermaid
flowchart TD
    A["1. SQL Query Written by You"] --> B["2. Parser"]
    B --> |"Syntax check"| C["3. Analyzer / Binder"]
    C --> |"Table & column validation"| D["4. Query Optimizer"]
    D --> |"Choose best execution plan"| E["5. Execution Engine"]
    E --> F["6. Storage Engine"]
    F --> |"Read from disk/cache"| G["7. Data Pages"]
    G --> E
    E --> H["8. Results Returned"]

    style A fill:#f97316,stroke:#333,color:#fff
    style D fill:#3b82f6,stroke:#333,color:#fff
    style H fill:#10b981,stroke:#333,color:#fff
\`\`\`

## Stage Breakdown

### 1. Parser
Checks if your SQL is **syntactically valid**. Is every keyword spelled correctly? Are parentheses balanced? Missing a comma? The parser catches these.

### 2. Analyzer / Binder
Checks if the tables, columns, and functions you referenced **actually exist**. "Does the \`customers\` table have a \`city\` column?" If not, you get an error here.

### 3. Query Optimizer (The Brain)
This is the most important stage. The optimizer considers **multiple execution plans** and picks the cheapest one:
- Should it use an index or do a full table scan?
- Should it join Table A to Table B first, or B to C first?
- Should it sort in memory or use a temporary file?

### 4. Execution Engine
Follows the chosen plan step by step — scanning tables, joining rows, filtering, sorting, aggregating.

### 5. Storage Engine
Reads actual data from **disk pages** or **memory cache** (buffer pool). Recently accessed data is kept in memory for speed.

---

## The Logical Execution Order of SQL

This is **critical** for interviews — SQL does NOT execute in the order you write it:

\`\`\`mermaid
flowchart TD
    A["1. FROM / JOIN"] --> B["2. WHERE"]
    B --> C["3. GROUP BY"]
    C --> D["4. HAVING"]
    D --> E["5. SELECT"]
    E --> F["6. DISTINCT"]
    F --> G["7. ORDER BY"]
    G --> H["8. LIMIT / OFFSET"]

    style A fill:#ef4444,stroke:#333,color:#fff
    style E fill:#3b82f6,stroke:#333,color:#fff
    style H fill:#10b981,stroke:#333,color:#fff
\`\`\`

**Why this matters:** You CANNOT use a column alias defined in \`SELECT\` inside a \`WHERE\` clause — because \`WHERE\` runs BEFORE \`SELECT\`.

\`\`\`sql
-- ❌ This FAILS:
SELECT name, salary * 12 AS annual_salary
FROM employees
WHERE annual_salary > 100000;  -- annual_salary doesn't exist yet!

-- ✅ This WORKS:
SELECT name, salary * 12 AS annual_salary
FROM employees
WHERE salary * 12 > 100000;  -- use the expression directly
\`\`\``,
            },
            {
                order: 3,
                title: 'Quiz: SQL Fundamentals',
                type: 'QUIZ',
                content: '## Test Your Understanding of SQL Fundamentals',
                quizQuestions: [
                    {
                        order: 0, difficulty: 'EASY',
                        question: 'What does SQL stand for?',
                        options: [
                            { id: 'a', text: 'Simple Query Language', isCorrect: false },
                            { id: 'b', text: 'Structured Query Language', isCorrect: true },
                            { id: 'c', text: 'Standard Query Logic', isCorrect: false },
                            { id: 'd', text: 'System Query Language', isCorrect: false },
                        ],
                        explanation: 'SQL stands for Structured Query Language. It was originally developed at IBM in the 1970s and is the standard language for relational database management.',
                    },
                    {
                        order: 1, difficulty: 'EASY',
                        question: 'In a relational database, what uniquely identifies each row in a table?',
                        options: [
                            { id: 'a', text: 'Foreign Key', isCorrect: false },
                            { id: 'b', text: 'Index', isCorrect: false },
                            { id: 'c', text: 'Primary Key', isCorrect: true },
                            { id: 'd', text: 'Column Name', isCorrect: false },
                        ],
                        explanation: 'A Primary Key uniquely identifies each row in a table. It must be unique and cannot be NULL. A table can have only one primary key.',
                    },
                    {
                        order: 2, difficulty: 'MEDIUM',
                        question: 'Which SQL sub-language is used for SELECT, INSERT, UPDATE, DELETE?',
                        options: [
                            { id: 'a', text: 'DDL (Data Definition Language)', isCorrect: false },
                            { id: 'b', text: 'DML (Data Manipulation Language)', isCorrect: true },
                            { id: 'c', text: 'DCL (Data Control Language)', isCorrect: false },
                            { id: 'd', text: 'TCL (Transaction Control Language)', isCorrect: false },
                        ],
                        explanation: 'DML (Data Manipulation Language) handles reading and writing data: SELECT (read), INSERT (create), UPDATE (modify), DELETE (remove). DDL handles structure (CREATE TABLE), DCL handles permissions (GRANT), TCL handles transactions (COMMIT).',
                    },
                    {
                        order: 3, difficulty: 'MEDIUM',
                        question: 'SQL is a declarative language. What does that mean?',
                        options: [
                            { id: 'a', text: 'You declare variables before using them', isCorrect: false },
                            { id: 'b', text: 'You describe WHAT data you want, not HOW to get it', isCorrect: true },
                            { id: 'c', text: 'You must declare the return type of every query', isCorrect: false },
                            { id: 'd', text: 'You write step-by-step instructions for the database', isCorrect: false },
                        ],
                        explanation: 'In declarative languages like SQL, you specify WHAT result you want (e.g., "all customers from Mumbai"), and the database engine decides HOW to retrieve it efficiently (which index to use, join order, etc.).',
                    },
                ],
            },
            {
                order: 4,
                title: 'Interview Questions: SQL & Database Basics',
                type: 'INTERVIEW_QUESTIONS',
                content: `# Interview Questions — SQL & Database Fundamentals

Master these questions to confidently answer foundational SQL interview questions.`,
                interviewCards: [
                    {
                        order: 0, category: 'Conceptual', difficulty: 'EASY',
                        question: 'What is SQL and why is it important?',
                        answer: `**SQL (Structured Query Language)** is the standard language for managing and querying relational databases.\n\n**Why it's important:**\n- It's the **universal language** for relational databases — works across PostgreSQL, MySQL, SQL Server, Oracle\n- It's **declarative** — you say WHAT you want, not HOW to get it\n- It handles everything: querying, inserting, updating, deleting data; creating tables; managing permissions; controlling transactions\n- Virtually **every backend application** in the world uses SQL\n- It has been the standard since the **1970s** and shows no signs of being replaced`,
                        tags: ['basics', 'fundamentals'],
                    },
                    {
                        order: 1, category: 'Conceptual', difficulty: 'EASY',
                        question: 'What is the difference between SQL and NoSQL databases?',
                        answer: `**SQL databases** (PostgreSQL, MySQL):\n- Store data in **tables with fixed schemas**\n- Use **SQL** for querying\n- Support **JOINs** across tables\n- Provide **ACID transactions**\n- Scale **vertically** (bigger hardware)\n\n**NoSQL databases** (MongoDB, Redis, Cassandra):\n- Store data in **documents, key-value pairs, or graphs**\n- Use **database-specific APIs**\n- Typically **denormalize** data (no JOINs)\n- Often use **eventual consistency**\n- Scale **horizontally** (more servers)\n\n**When to use which:** SQL when you need data integrity, complex queries, and transactions. NoSQL for high-throughput, flexible schemas, and simple access patterns. Most production systems use **both**.`,
                        tags: ['sql-vs-nosql', 'comparison'],
                    },
                    {
                        order: 2, category: 'Conceptual', difficulty: 'MEDIUM',
                        question: 'What is the logical execution order of a SQL SELECT statement?',
                        answer: `SQL does NOT execute in the order you write it. The logical execution order is:\n\n1. **FROM** / **JOIN** — identify the source tables\n2. **WHERE** — filter individual rows\n3. **GROUP BY** — group rows into buckets\n4. **HAVING** — filter groups\n5. **SELECT** — choose columns and compute expressions\n6. **DISTINCT** — remove duplicates\n7. **ORDER BY** — sort results\n8. **LIMIT / OFFSET** — paginate results\n\n**Key insight:** This is why you can't use a SELECT alias in WHERE — WHERE runs BEFORE SELECT.`,
                        tags: ['execution-order', 'advanced'],
                    },
                    {
                        order: 3, category: 'Conceptual', difficulty: 'EASY',
                        question: 'What is a DBMS? Name some popular ones.',
                        answer: `A **DBMS (Database Management System)** is software that manages databases. It handles:\n- **Storage** — efficiently storing data on disk\n- **Querying** — parsing and executing SQL\n- **Optimization** — choosing the fastest execution plan\n- **Concurrency** — allowing multiple users simultaneously\n- **Recovery** — restoring data after crashes\n\n**Popular RDBMS:**\n- **PostgreSQL** — most feature-rich open-source, great for complex queries\n- **MySQL** — most popular for web apps, read-heavy workloads\n- **SQLite** — embedded, serverless, great for mobile/desktop\n- **SQL Server** — Microsoft ecosystem, enterprise\n- **Oracle DB** — banking, large enterprise`,
                        tags: ['dbms', 'databases'],
                    },
                    {
                        order: 4, category: 'Tricky', difficulty: 'MEDIUM',
                        question: 'Can you use a column alias defined in SELECT inside the WHERE clause?',
                        answer: `**No!** This is a classic interview gotcha.\n\n\`\`\`sql\n-- ❌ WRONG: WHERE runs BEFORE SELECT\nSELECT salary * 12 AS annual_salary\nFROM employees\nWHERE annual_salary > 100000;\n\n-- ✅ CORRECT: repeat the expression\nSELECT salary * 12 AS annual_salary\nFROM employees\nWHERE salary * 12 > 100000;\n\n-- ✅ ALSO CORRECT: use a subquery/CTE\nWITH emp AS (\n  SELECT *, salary * 12 AS annual_salary\n  FROM employees\n)\nSELECT * FROM emp WHERE annual_salary > 100000;\n\`\`\`\n\n**Why:** The SQL execution order is FROM → WHERE → SELECT. The alias \`annual_salary\` doesn't exist yet when WHERE runs.`,
                        codeSnippet: `-- This FAILS:\nSELECT salary * 12 AS annual_salary\nFROM employees\nWHERE annual_salary > 100000;\n\n-- This WORKS:\nSELECT salary * 12 AS annual_salary\nFROM employees\nWHERE salary * 12 > 100000;`,
                        codeLanguage: 'sql',
                        tags: ['execution-order', 'gotcha'],
                    },
                ],
            },
            {
                order: 5,
                title: 'Summary: SQL & Database Fundamentals',
                type: 'SUMMARY',
                keyTakeaways: [
                    'A relational database stores data in tables with rows and columns',
                    'SQL is a declarative language — you describe WHAT you want, the engine decides HOW',
                    'SQL has four sub-languages: DDL, DML, DCL, TCL',
                    'SQL vs NoSQL depends on the use case — most systems use both',
                    'SQL execution order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT',
                    'A DBMS (like PostgreSQL or MySQL) is the software that runs SQL queries against stored data',
                ],
                content: `# Summary — What is SQL & How Databases Work

## Key Concepts Covered

1. **Relational databases** store data in tables (relations) with rows and columns
2. **SQL** is the standard declarative language for querying relational databases
3. **SQL sub-languages**: DDL (structure), DML (data), DCL (permissions), TCL (transactions)
4. **SQL vs NoSQL**: SQL for integrity and complex queries, NoSQL for scale and flexibility
5. **DBMS** parses, optimizes, and executes your queries
6. **Execution order** is critical: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT

## What's Next

Now that you understand what SQL is and how databases work, we'll dive into **ACID Properties & Transactions** — the foundation of data integrity that every interviewer asks about.`,
            },
        ],
    });

    // ── Learn 1.2: ACID Properties & Database Transactions ──
    await createLearn({
        slug: 'sql-acid-properties-transactions',
        title: 'ACID Properties & Database Transactions',
        description: 'Learn the four pillars of database reliability — Atomicity, Consistency, Isolation, Durability. Understand what transactions are, why they matter, and what happens when ACID is violated. This is a top-5 SQL interview question.',
        difficulty: 'BEGINNER',
        topicSlug: 'sql-unit1-foundations',
        unitTitle: 'Unit 1: Foundations of SQL & Databases',
        estimatedTime: 20,
        tags: ['acid', 'transactions', 'atomicity', 'consistency', 'isolation', 'durability'],
        iconEmoji: '🔒',
        steps: [
            {
                order: 0,
                title: 'ACID Properties Explained',
                type: 'EXPLANATION',
                tips: [
                    'ACID is the single most asked theoretical SQL concept in interviews.',
                    'Remember ACID with the analogy of a bank transfer — it covers all four properties perfectly.',
                    'NoSQL databases often sacrifice Isolation and sometimes Durability for performance.',
                ],
                content: `# ACID Properties & Database Transactions

## What is a Transaction?

A **transaction** is a sequence of one or more SQL operations that are treated as a **single unit of work**. Either **all operations succeed** (commit), or **none of them take effect** (rollback).

\`\`\`sql
-- Example: Transfer $500 from Account A to Account B
BEGIN TRANSACTION;
  UPDATE accounts SET balance = balance - 500 WHERE id = 'A';
  UPDATE accounts SET balance = balance + 500 WHERE id = 'B';
COMMIT;
\`\`\`

If the system crashes after the first UPDATE but before the second, the entire transaction is **rolled back**. Account A gets its $500 back. No money is lost.

---

## The ACID Properties

ACID stands for **Atomicity, Consistency, Isolation, Durability** — the four guarantees that every reliable database provides.

---

### A — Atomicity ("All or Nothing")

A transaction is **atomic**: it either completes entirely or has no effect at all. There is no "half-done" state.

**Bank Transfer Analogy:**
- ✅ Both debit and credit happen → transaction succeeds
- ❌ Debit happens but credit fails → entire transaction rolls back (debit undone)
- ❌ Neither happens → safe, no change

**What would happen WITHOUT atomicity?**
Money could be deducted from Account A but never added to Account B — money just disappears from the system.

---

### C — Consistency ("Rules Are Never Broken")

A transaction moves the database from one **valid state** to another valid state. All constraints, triggers, and rules are enforced.

**Example constraints:**
- Balance can never be negative (\`CHECK (balance >= 0)\`)
- Email must be unique (\`UNIQUE\` constraint)
- Every order must reference a valid customer (\`FOREIGN KEY\`)

If a transaction would violate any constraint, it is **rejected and rolled back**.

---

### I — Isolation ("Transactions Don't Interfere")

Concurrent transactions execute as if they were running **one at a time** (serially). One transaction cannot see the intermediate (uncommitted) changes of another.

**Without isolation (dirty read):**
1. Transaction A deducts $500 from Account A (not yet committed)
2. Transaction B reads Account A's balance → sees the reduced amount
3. Transaction A fails and rolls back
4. Transaction B made a decision based on **data that never existed**

---

### D — Durability ("Committed = Permanent")

Once a transaction is **committed**, its changes are **permanent** — even if the server crashes, loses power, or restarts.

How? The database writes changes to a **Write-Ahead Log (WAL)** on disk *before* confirming the commit. On restart, it replays the log to recover committed data.

---

## ACID at a Glance

| Property | Guarantee | Failure Without It |
|----------|-----------|-------------------|
| **Atomicity** | All or nothing | Partial updates (lost money) |
| **Consistency** | Rules always hold | Invalid data in database |
| **Isolation** | No interference between transactions | Dirty reads, lost updates |
| **Durability** | Committed = permanent | Data lost after crash |`,
            },
            {
                order: 1,
                title: 'ACID Visualization',
                type: 'VISUALIZATION',
                content: `# ACID Properties — Visual Model

## The Bank Transfer — ACID in Action

\`\`\`mermaid
flowchart TD
    A["BEGIN TRANSACTION"] --> B["Debit $500 from Account A"]
    B --> C["Credit $500 to Account B"]
    C --> D{"All operations\nsucceeded?"}
    D -->|Yes| E["COMMIT ✅"]
    D -->|No| F["ROLLBACK ❌"]
    E --> G["Changes are PERMANENT\n(Durability)"]
    F --> H["ALL changes UNDONE\n(Atomicity)"]

    style A fill:#f97316,stroke:#333,color:#fff
    style E fill:#10b981,stroke:#333,color:#fff
    style F fill:#ef4444,stroke:#333,color:#fff
\`\`\`

## Isolation — What Happens Without It

\`\`\`mermaid
sequenceDiagram
    participant T1 as Transaction 1
    participant DB as Database
    participant T2 as Transaction 2

    T1->>DB: BEGIN
    T1->>DB: UPDATE balance = balance - 500 (Acct A)
    Note over DB: Acct A shows $500 less (UNCOMMITTED)
    T2->>DB: SELECT balance FROM Acct A
    Note over T2: Reads $500 less (DIRTY READ! ❌)
    T1->>DB: ROLLBACK
    Note over DB: Acct A balance restored
    Note over T2: T2's data was WRONG — it read phantom data
\`\`\`

## Transaction Lifecycle

\`\`\`mermaid
stateDiagram-v2
    [*] --> Active: BEGIN TRANSACTION
    Active --> PartiallyCommitted: All operations done
    Active --> Failed: Error occurs
    PartiallyCommitted --> Committed: Write to WAL + COMMIT
    Failed --> Aborted: ROLLBACK
    Committed --> [*]: Changes permanent
    Aborted --> [*]: Changes undone
\`\`\``,
            },
            {
                order: 2,
                title: 'Transaction Syntax — Code Examples',
                type: 'CODE',
                content: '## SQL Transaction Syntax\n\nLet\'s see how transactions work in practice with real SQL code.',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Basic Transaction — Bank Transfer',
                        language: 'sql',
                        code: `-- Transfer $500 from Account A to Account B
BEGIN TRANSACTION;

-- Step 1: Deduct from sender
UPDATE accounts
SET balance = balance - 500
WHERE account_id = 'A';

-- Step 2: Add to receiver
UPDATE accounts
SET balance = balance + 500
WHERE account_id = 'B';

-- If both succeeded, make it permanent
COMMIT;`,
                        explanation: 'BEGIN starts the transaction. If any statement fails, we can ROLLBACK to undo everything. COMMIT makes changes permanent. Without the transaction wrapper, a crash between the two UPDATEs would leave the data inconsistent.',
                        highlightLines: [2, 5, 6, 10, 11, 14],
                    },
                    {
                        order: 1,
                        title: 'Transaction with Error Handling (ROLLBACK)',
                        language: 'sql',
                        code: `-- Safe transfer with error handling (PostgreSQL style)
BEGIN;

UPDATE accounts SET balance = balance - 1000
WHERE account_id = 'A' AND balance >= 1000;
-- Check: did the debit actually happen?
-- If balance was less than 1000, 0 rows updated

UPDATE accounts SET balance = balance + 1000
WHERE account_id = 'B';

-- In application code, you'd check row counts:
-- if (rows_affected == 0) ROLLBACK; else COMMIT;
COMMIT;

-- If anything goes wrong:
-- ROLLBACK;  -- undoes everything since BEGIN`,
                        explanation: 'In production, your application code wraps the transaction and checks for errors. If the debit fails (insufficient balance), you ROLLBACK to undo any partial changes.',
                    },
                    {
                        order: 2,
                        title: 'SAVEPOINT — Partial Rollback',
                        language: 'sql',
                        code: `BEGIN;

INSERT INTO orders (customer_id, total) VALUES (1, 99.99);
SAVEPOINT after_order;

INSERT INTO order_items (order_id, product_id, qty)
VALUES (currval('orders_id_seq'), 101, 2);

-- Oops, product 101 doesn't exist — rollback just this part
ROLLBACK TO SAVEPOINT after_order;

-- The order INSERT is still intact!
-- Try a different product
INSERT INTO order_items (order_id, product_id, qty)
VALUES (currval('orders_id_seq'), 202, 2);

COMMIT;  -- order + order_item(202) are saved`,
                        explanation: 'SAVEPOINT creates a checkpoint within a transaction. ROLLBACK TO SAVEPOINT undoes work back to that checkpoint without aborting the entire transaction. Useful for complex multi-step operations.',
                    },
                ],
            },
            {
                order: 3,
                title: 'Quiz: ACID Properties',
                type: 'QUIZ',
                content: '## Test Your Knowledge of ACID Properties & Transactions',
                quizQuestions: [
                    {
                        order: 0, difficulty: 'EASY',
                        question: 'What does the "A" in ACID stand for?',
                        options: [
                            { id: 'a', text: 'Availability', isCorrect: false },
                            { id: 'b', text: 'Atomicity', isCorrect: true },
                            { id: 'c', text: 'Accuracy', isCorrect: false },
                            { id: 'd', text: 'Authentication', isCorrect: false },
                        ],
                        explanation: 'Atomicity means "all or nothing" — a transaction either completes entirely or has no effect.',
                    },
                    {
                        order: 1, difficulty: 'MEDIUM',
                        question: 'A bank transfer deducts $500 from Account A but the system crashes before crediting Account B. With ACID, what happens?',
                        options: [
                            { id: 'a', text: 'Account A loses $500 permanently', isCorrect: false },
                            { id: 'b', text: 'The deduction is rolled back — Account A gets $500 back', isCorrect: true },
                            { id: 'c', text: 'The system completes the credit on restart', isCorrect: false },
                            { id: 'd', text: 'Both accounts lose $500', isCorrect: false },
                        ],
                        explanation: 'Atomicity guarantees "all or nothing." Since the transaction didn\'t complete (no COMMIT), the entire transaction is rolled back on recovery. Durability ensures that only committed transactions survive crashes.',
                    },
                    {
                        order: 2, difficulty: 'MEDIUM',
                        question: 'Which ACID property prevents one transaction from seeing uncommitted changes of another?',
                        options: [
                            { id: 'a', text: 'Atomicity', isCorrect: false },
                            { id: 'b', text: 'Consistency', isCorrect: false },
                            { id: 'c', text: 'Isolation', isCorrect: true },
                            { id: 'd', text: 'Durability', isCorrect: false },
                        ],
                        explanation: 'Isolation ensures that concurrent transactions don\'t interfere with each other. Without isolation, you get problems like dirty reads (reading uncommitted data).',
                    },
                    {
                        order: 3, difficulty: 'MEDIUM',
                        question: 'What is the purpose of the Write-Ahead Log (WAL)?',
                        options: [
                            { id: 'a', text: 'To speed up SELECT queries', isCorrect: false },
                            { id: 'b', text: 'To ensure committed transactions survive crashes (Durability)', isCorrect: true },
                            { id: 'c', text: 'To prevent dirty reads', isCorrect: false },
                            { id: 'd', text: 'To check constraints', isCorrect: false },
                        ],
                        explanation: 'The WAL writes changes to a log on disk BEFORE confirming the commit. If the server crashes, it replays the WAL on restart to recover all committed transactions. This is how Durability is implemented.',
                    },
                ],
            },
            {
                order: 4,
                title: 'Interview Questions: ACID & Transactions',
                type: 'INTERVIEW_QUESTIONS',
                content: `# Interview Questions — ACID Properties & Transactions

These are the most commonly asked ACID questions in database interviews.`,
                interviewCards: [
                    {
                        order: 0, category: 'Conceptual', difficulty: 'EASY',
                        question: 'Explain the ACID properties of a database.',
                        answer: `**ACID** stands for:\n\n1. **Atomicity** — A transaction is all-or-nothing. If any part fails, the entire transaction is rolled back.\n2. **Consistency** — A transaction moves the database from one valid state to another. All constraints are enforced.\n3. **Isolation** — Concurrent transactions don't interfere. Each runs as if it were alone.\n4. **Durability** — Once committed, changes are permanent even if the system crashes.\n\n**Example:** A bank transfer deducting from Account A and crediting Account B. Atomicity ensures both happen or neither does. Consistency ensures balances can't go negative. Isolation prevents other transactions from seeing partial changes. Durability ensures the transfer survives a power outage.`,
                        tags: ['acid', 'theory', 'top-question'],
                    },
                    {
                        order: 1, category: 'Conceptual', difficulty: 'MEDIUM',
                        question: 'What happens if a database does NOT provide atomicity?',
                        answer: `Without atomicity, transactions can be **partially applied**, leading to:\n\n- **Data corruption**: Money deducted from Account A but never credited to Account B\n- **Inconsistent state**: Half of a multi-table update is applied, breaking referential integrity\n- **Unrecoverable errors**: No way to automatically undo partial changes\n\n**Real-world impact:** In e-commerce, an order could be created but inventory never decremented, leading to overselling. In banking, money could vanish from the system.`,
                        tags: ['atomicity', 'failures'],
                    },
                    {
                        order: 2, category: 'Tricky', difficulty: 'HARD',
                        question: 'How does a database implement Durability?',
                        answer: `Databases use a **Write-Ahead Log (WAL)** strategy:\n\n1. Before modifying actual data pages, the change is written to a **sequential log file** on disk\n2. The COMMIT only returns success **after the WAL entry is flushed to disk**\n3. If the system crashes, on restart the database **replays the WAL** to recover committed transactions\n4. Uncommitted transactions found in the WAL are **rolled back**\n\n**Why WAL is fast:** Writing to the WAL is a **sequential disk write** (fast), while updating actual data pages would require **random disk writes** (slow). The actual data pages are updated lazily in the background (checkpoint process).`,
                        tags: ['durability', 'wal', 'internals'],
                    },
                    {
                        order: 3, category: 'Conceptual', difficulty: 'MEDIUM',
                        question: 'What is the difference between COMMIT and ROLLBACK?',
                        answer: `**COMMIT** makes all changes in the current transaction **permanent**. Once committed, the changes survive crashes (durability).\n\n**ROLLBACK** **undoes** all changes in the current transaction. The database is restored to the state before BEGIN.\n\n\`\`\`sql\nBEGIN;\nUPDATE products SET price = 29.99 WHERE id = 1;\n-- Changed our mind:\nROLLBACK;  -- price goes back to original\n\nBEGIN;\nUPDATE products SET price = 29.99 WHERE id = 1;\nCOMMIT;    -- price is now permanently 29.99\n\`\`\`\n\n**Key point:** Until you COMMIT, other transactions (at default isolation) cannot see your changes.`,
                        codeSnippet: `BEGIN;\nUPDATE products SET price = 29.99 WHERE id = 1;\nROLLBACK;  -- undone\n\nBEGIN;\nUPDATE products SET price = 29.99 WHERE id = 1;\nCOMMIT;    -- permanent`,
                        codeLanguage: 'sql',
                        tags: ['commit', 'rollback', 'syntax'],
                    },
                ],
            },
            {
                order: 5,
                title: 'Summary: ACID Properties',
                type: 'SUMMARY',
                keyTakeaways: [
                    'A transaction is a group of operations treated as one unit — all succeed or all fail',
                    'Atomicity: all-or-nothing execution',
                    'Consistency: database moves between valid states only',
                    'Isolation: concurrent transactions don\'t see each other\'s uncommitted changes',
                    'Durability: committed data survives crashes (via WAL)',
                    'COMMIT makes changes permanent; ROLLBACK undoes them; SAVEPOINT allows partial rollback',
                ],
                content: `# Summary — ACID Properties & Transactions

## Key Concepts

- **Transaction** = group of SQL operations executed as a single unit
- **ACID** = Atomicity + Consistency + Isolation + Durability
- **COMMIT** makes changes permanent, **ROLLBACK** undoes them
- **SAVEPOINT** allows partial rollback within a transaction
- **WAL (Write-Ahead Log)** is how durability is implemented

## Interview Tips

- Always use the **bank transfer** example when explaining ACID — interviewers expect it
- Know that NoSQL databases often relax ACID for performance (BASE: Basically Available, Soft state, Eventually consistent)
- Understand that Isolation has **levels** (covered in Learn 1.6)`,
            },
        ],
    });

    // ── Learn 1.3: Data Types, NULL & Constraints ──
    await createLearn({
        slug: 'sql-data-types-null-constraints',
        title: 'Data Types, NULL & Constraints',
        description: 'Master SQL data types (INT, VARCHAR, TEXT, DATE, BOOLEAN), understand what NULL really means, and learn all constraints (PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, CHECK, DEFAULT). The foundation of correct schema design.',
        difficulty: 'BEGINNER',
        topicSlug: 'sql-unit1-foundations',
        unitTitle: 'Unit 1: Foundations of SQL & Databases',
        estimatedTime: 25,
        tags: ['datatypes', 'null', 'constraints', 'primary-key', 'foreign-key', 'create-table'],
        iconEmoji: '🧱',
        steps: [
            {
                order: 0,
                title: 'SQL Data Types',
                type: 'EXPLANATION',
                tips: [
                    'Choose the smallest data type that fits your data — it saves storage and improves query speed.',
                    'VARCHAR(255) is not "free" — prefer VARCHAR(100) if 100 chars is enough.',
                    'Use DECIMAL for money, never FLOAT — floating point errors will bite you.',
                ],
                content: `# SQL Data Types, NULL & Constraints

## Why Data Types Matter

Every column in a SQL table has a **data type** that defines what kind of values it can hold. Choosing the right data type:
- **Prevents invalid data** (can't store "abc" in an INT column)
- **Optimizes storage** (INT uses 4 bytes, BIGINT uses 8)
- **Enables proper operations** (arithmetic on numbers, sorting on dates)

---

## Core Data Types

### Numeric Types

| Type | Storage | Range | Use Case |
|------|---------|-------|----------|
| \`SMALLINT\` | 2 bytes | -32,768 to 32,767 | Age, small counts |
| \`INT\` / \`INTEGER\` | 4 bytes | -2.1 billion to 2.1 billion | IDs, counts |
| \`BIGINT\` | 8 bytes | ±9.2 quintillion | Large IDs, timestamps |
| \`DECIMAL(p,s)\` | Variable | Exact precision | **Money**, financial data |
| \`FLOAT\` / \`REAL\` | 4 bytes | Approximate | Scientific calculations |
| \`DOUBLE PRECISION\` | 8 bytes | Approximate | Scientific calculations |
| \`SERIAL\` (PG) / \`AUTO_INCREMENT\` (MySQL) | 4 bytes | Auto-incrementing INT | Primary keys |

> ⚠️ **Never use FLOAT for money!** \`0.1 + 0.2 = 0.30000000000000004\` in floating point. Use \`DECIMAL(10,2)\` instead.

### String Types

| Type | Max Length | Use Case |
|------|-----------|----------|
| \`CHAR(n)\` | Fixed n chars (padded) | Fixed-length codes (country: CHAR(2)) |
| \`VARCHAR(n)\` | Variable, up to n chars | Names, emails, titles |
| \`TEXT\` | Unlimited (practically) | Long descriptions, blog posts |

### Date/Time Types

| Type | Format | Example |
|------|--------|---------|
| \`DATE\` | YYYY-MM-DD | \`'2025-01-15'\` |
| \`TIME\` | HH:MM:SS | \`'14:30:00'\` |
| \`TIMESTAMP\` | Date + Time | \`'2025-01-15 14:30:00'\` |
| \`TIMESTAMPTZ\` (PG) | Timestamp + Timezone | \`'2025-01-15 14:30:00+05:30'\` |
| \`INTERVAL\` | Duration | \`'2 days 3 hours'\` |

### Boolean & Other Types

| Type | Values | Notes |
|------|--------|-------|
| \`BOOLEAN\` | \`TRUE\`, \`FALSE\`, \`NULL\` | MySQL: stored as TINYINT(1) |
| \`JSON\` / \`JSONB\` | JSON documents | PostgreSQL JSONB is indexed |
| \`UUID\` | Universally unique ID | \`'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'\` |
| \`BYTEA\` / \`BLOB\` | Binary data | Files, images (prefer external storage) |

---

## What is NULL?

**NULL means "unknown" or "missing"** — it is NOT zero, NOT an empty string, NOT false.

| Value | Meaning |
|-------|---------|
| \`0\` | The number zero |
| \`''\` | An empty string |
| \`FALSE\` | Boolean false |
| \`NULL\` | **Unknown / not set / missing** |

### The NULL Trap — Three-Valued Logic

SQL uses **three-valued logic**: TRUE, FALSE, and UNKNOWN. Any comparison with NULL returns UNKNOWN:

\`\`\`sql
-- All of these return UNKNOWN (not TRUE, not FALSE):
SELECT NULL = NULL;     -- UNKNOWN
SELECT NULL != NULL;    -- UNKNOWN  
SELECT NULL > 5;        -- UNKNOWN
SELECT NULL = 0;        -- UNKNOWN
SELECT NULL = '';       -- UNKNOWN
\`\`\`

### How to Work with NULL

\`\`\`sql
-- ✅ CORRECT: use IS NULL / IS NOT NULL
SELECT * FROM customers WHERE phone IS NULL;
SELECT * FROM customers WHERE phone IS NOT NULL;

-- ❌ WRONG: using = or != with NULL
SELECT * FROM customers WHERE phone = NULL;    -- returns nothing!
SELECT * FROM customers WHERE phone != NULL;   -- returns nothing!
\`\`\`

### NULL in Aggregations

\`\`\`sql
-- COUNT(*) counts ALL rows (including NULL)
-- COUNT(column) counts only NON-NULL values
SELECT COUNT(*) FROM employees;         -- 100
SELECT COUNT(phone) FROM employees;     -- 85 (15 have NULL phone)
SELECT AVG(salary) FROM employees;      -- ignores NULL salaries
\`\`\``,
            },
            {
                order: 1,
                title: 'Constraints — CREATE TABLE Examples',
                type: 'CODE',
                content: `## SQL Constraints

Constraints are **rules** that enforce data integrity at the database level. They prevent invalid data from being inserted or updated.

| Constraint | What It Does |
|-----------|-------------|
| \`PRIMARY KEY\` | Uniquely identifies each row (NOT NULL + UNIQUE) |
| \`FOREIGN KEY\` | References a row in another table |
| \`UNIQUE\` | No duplicate values allowed |
| \`NOT NULL\` | Column cannot be NULL |
| \`CHECK\` | Custom validation rule |
| \`DEFAULT\` | Provides a fallback value |`,
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Creating Tables with Constraints',
                        language: 'sql',
                        code: `-- Table with all major constraints
CREATE TABLE employees (
    id          SERIAL PRIMARY KEY,
    first_name  VARCHAR(50) NOT NULL,
    last_name   VARCHAR(50) NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    age         INT CHECK (age >= 18 AND age <= 120),
    salary      DECIMAL(10,2) DEFAULT 0.00,
    department  VARCHAR(50) DEFAULT 'Unassigned',
    hire_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active   BOOLEAN DEFAULT TRUE
);`,
                        explanation: 'SERIAL auto-generates IDs. PRIMARY KEY = UNIQUE + NOT NULL. CHECK enforces age range. DEFAULT provides fallback values. Every column has intentional constraints.',
                        highlightLines: [3, 5, 6, 7, 8],
                    },
                    {
                        order: 1,
                        title: 'Foreign Key — Linking Tables',
                        language: 'sql',
                        code: `-- Departments table
CREATE TABLE departments (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(100) UNIQUE NOT NULL
);

-- Employees reference departments via FOREIGN KEY
CREATE TABLE employees (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    department_id INT REFERENCES departments(id)
                  ON DELETE SET NULL
                  ON UPDATE CASCADE,
    manager_id    INT REFERENCES employees(id)
                  ON DELETE SET NULL
);

-- What the cascading options mean:
-- ON DELETE CASCADE    → delete employee if department is deleted
-- ON DELETE SET NULL   → set department_id to NULL if dept deleted
-- ON DELETE RESTRICT   → prevent deleting dept if employees exist
-- ON UPDATE CASCADE    → update FK if referenced PK changes`,
                        explanation: 'FOREIGN KEY creates a link between tables. ON DELETE/UPDATE defines what happens to child rows when the parent is modified. SET NULL is safest for optional relationships; CASCADE for dependent data; RESTRICT for protection.',
                        highlightLines: [11, 12, 13, 14, 15],
                    },
                    {
                        order: 2,
                        title: 'Composite Keys & Named Constraints',
                        language: 'sql',
                        code: `-- Junction table for many-to-many (students <-> courses)
CREATE TABLE enrollments (
    student_id  INT NOT NULL,
    course_id   INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT NOW(),
    grade       CHAR(2),

    -- Composite primary key
    PRIMARY KEY (student_id, course_id),

    -- Named foreign keys (better error messages)
    CONSTRAINT fk_student
        FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_course
        FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE CASCADE,

    -- Custom check
    CONSTRAINT valid_grade
        CHECK (grade IN ('A+','A','A-','B+','B','B-','C+','C','C-','D','F'))
);`,
                        explanation: 'Composite PRIMARY KEY uses two columns — the combination must be unique (a student can enroll in each course only once). Named constraints (CONSTRAINT fk_student ...) produce clearer error messages than anonymous ones.',
                        highlightLines: [8, 9, 11, 12, 22, 23],
                    },
                ],
            },
            {
                order: 2,
                title: 'Quiz: Data Types, NULL & Constraints',
                type: 'QUIZ',
                content: '## Test Your Knowledge of Data Types, NULL, and Constraints',
                quizQuestions: [
                    {
                        order: 0, difficulty: 'EASY',
                        question: 'What data type should you use for storing currency/money values?',
                        options: [
                            { id: 'a', text: 'FLOAT', isCorrect: false },
                            { id: 'b', text: 'INT', isCorrect: false },
                            { id: 'c', text: 'DECIMAL(10,2)', isCorrect: true },
                            { id: 'd', text: 'VARCHAR(20)', isCorrect: false },
                        ],
                        explanation: 'DECIMAL provides exact precision. FLOAT has rounding errors (0.1 + 0.2 ≠ 0.3 in floating point). For money, always use DECIMAL.',
                    },
                    {
                        order: 1, difficulty: 'MEDIUM',
                        question: 'What is the result of: SELECT NULL = NULL;',
                        options: [
                            { id: 'a', text: 'TRUE', isCorrect: false },
                            { id: 'b', text: 'FALSE', isCorrect: false },
                            { id: 'c', text: 'NULL (UNKNOWN)', isCorrect: true },
                            { id: 'd', text: 'Error', isCorrect: false },
                        ],
                        explanation: 'In SQL\'s three-valued logic, any comparison with NULL returns NULL (UNKNOWN) — even NULL = NULL. To check for NULL, use IS NULL or IS NOT NULL.',
                        hint: 'NULL means "unknown" — can you compare two unknowns?',
                    },
                    {
                        order: 2, difficulty: 'EASY',
                        question: 'What does PRIMARY KEY enforce?',
                        options: [
                            { id: 'a', text: 'UNIQUE only', isCorrect: false },
                            { id: 'b', text: 'NOT NULL only', isCorrect: false },
                            { id: 'c', text: 'Both UNIQUE and NOT NULL', isCorrect: true },
                            { id: 'd', text: 'UNIQUE, NOT NULL, and AUTO_INCREMENT', isCorrect: false },
                        ],
                        explanation: 'PRIMARY KEY = UNIQUE + NOT NULL. It uniquely identifies each row. AUTO_INCREMENT/SERIAL is separate and optional.',
                    },
                    {
                        order: 3, difficulty: 'MEDIUM',
                        question: 'What is the difference between COUNT(*) and COUNT(column)?',
                        options: [
                            { id: 'a', text: 'They are identical', isCorrect: false },
                            { id: 'b', text: 'COUNT(*) counts all rows; COUNT(column) counts only non-NULL values', isCorrect: true },
                            { id: 'c', text: 'COUNT(*) is faster; COUNT(column) is slower', isCorrect: false },
                            { id: 'd', text: 'COUNT(*) counts unique rows; COUNT(column) counts all', isCorrect: false },
                        ],
                        explanation: 'COUNT(*) counts every row regardless of NULL values. COUNT(column) skips rows where that column is NULL. This is a critical distinction for interviews.',
                    },
                    {
                        order: 4, difficulty: 'MEDIUM',
                        question: 'What does ON DELETE CASCADE mean on a FOREIGN KEY?',
                        options: [
                            { id: 'a', text: 'Prevent deletion of the parent row', isCorrect: false },
                            { id: 'b', text: 'Set the foreign key column to NULL when parent is deleted', isCorrect: false },
                            { id: 'c', text: 'Automatically delete child rows when the parent row is deleted', isCorrect: true },
                            { id: 'd', text: 'Throw an error and require manual cleanup', isCorrect: false },
                        ],
                        explanation: 'ON DELETE CASCADE automatically deletes all child rows that reference the deleted parent. ON DELETE SET NULL sets the FK to NULL instead. ON DELETE RESTRICT prevents the deletion entirely.',
                    },
                ],
            },
            {
                order: 3,
                title: 'Interview Questions: Data Types & Constraints',
                type: 'INTERVIEW_QUESTIONS',
                content: `# Interview Questions — Data Types, NULL & Constraints`,
                interviewCards: [
                    {
                        order: 0, category: 'Conceptual', difficulty: 'EASY',
                        question: 'What is the difference between a PRIMARY KEY and a FOREIGN KEY?',
                        answer: `**PRIMARY KEY:**\n- Uniquely identifies each row in a table\n- Combines UNIQUE + NOT NULL\n- A table can have only ONE primary key\n- Can be a single column or composite (multiple columns)\n\n**FOREIGN KEY:**\n- References a PRIMARY KEY in another (or the same) table\n- Creates a relationship between two tables\n- CAN be NULL (optional relationship)\n- A table can have MANY foreign keys\n\n**Example:**\n\`\`\`sql\n-- orders.customer_id is a FK referencing customers.id (PK)\nCREATE TABLE orders (\n  id SERIAL PRIMARY KEY,\n  customer_id INT REFERENCES customers(id)\n);\n\`\`\``,
                        codeSnippet: `CREATE TABLE orders (\n  id SERIAL PRIMARY KEY,\n  customer_id INT REFERENCES customers(id)\n);`,
                        codeLanguage: 'sql',
                        tags: ['primary-key', 'foreign-key', 'top-question'],
                    },
                    {
                        order: 1, category: 'Tricky', difficulty: 'MEDIUM',
                        question: 'What is NULL in SQL and how do you query for it?',
                        answer: `**NULL** means "unknown" or "missing data." It is NOT zero, NOT an empty string, NOT false.\n\n**Key rules:**\n- NULL = NULL → UNKNOWN (not TRUE)\n- NULL != NULL → UNKNOWN (not TRUE)\n- Any arithmetic with NULL → NULL (5 + NULL = NULL)\n- Any comparison with NULL → UNKNOWN\n\n**How to query:**\n\`\`\`sql\n-- ✅ Correct:\nWHERE column IS NULL\nWHERE column IS NOT NULL\n\n-- ❌ Wrong:\nWHERE column = NULL    -- never matches!\nWHERE column != NULL   -- never matches!\n\`\`\`\n\n**Aggregation:** COUNT(*) includes NULLs, COUNT(column) skips them. SUM/AVG/MIN/MAX all ignore NULLs.`,
                        tags: ['null', 'three-valued-logic', 'top-question'],
                    },
                    {
                        order: 2, category: 'Conceptual', difficulty: 'EASY',
                        question: 'What is the difference between CHAR and VARCHAR?',
                        answer: `**CHAR(n):**\n- **Fixed-length** — always uses n characters of storage\n- Pads shorter values with spaces\n- Faster for fixed-length data\n- Use for: country codes (CHAR(2)), state codes, fixed IDs\n\n**VARCHAR(n):**\n- **Variable-length** — uses only as much space as the actual value + 1-2 bytes overhead\n- No padding\n- More storage-efficient for varying lengths\n- Use for: names, emails, titles, most string data\n\n**Example:** Storing "Hi" in CHAR(10) uses 10 bytes (padded). In VARCHAR(10) uses 4 bytes (2 chars + 2 overhead).`,
                        tags: ['char', 'varchar', 'data-types'],
                    },
                    {
                        order: 3, category: 'Coding', difficulty: 'MEDIUM',
                        question: 'Why should you never use FLOAT for money? What should you use instead?',
                        answer: `**FLOAT** uses binary floating-point representation which **cannot exactly represent many decimal fractions:**\n\n\`\`\`sql\nSELECT CAST(0.1 AS FLOAT) + CAST(0.2 AS FLOAT);\n-- Returns: 0.30000000000000004 (NOT 0.3!)\n\`\`\`\n\nFor financial calculations, even tiny errors compound:\n- $0.01 rounding error × 1 million transactions = **$10,000 discrepancy**\n\n**Use DECIMAL(p,s) instead:**\n\`\`\`sql\nCREATE TABLE products (\n  price DECIMAL(10,2)  -- 10 digits total, 2 after decimal\n);\n-- DECIMAL(10,2) stores exact values: 0.1 + 0.2 = 0.30\n\`\`\``,
                        codeSnippet: `-- ❌ WRONG:\nCREATE TABLE products (price FLOAT);\n\n-- ✅ CORRECT:\nCREATE TABLE products (price DECIMAL(10,2));`,
                        codeLanguage: 'sql',
                        tags: ['float', 'decimal', 'money', 'gotcha'],
                    },
                ],
            },
            {
                order: 4,
                title: 'Challenge: Design a Table',
                type: 'CHALLENGE',
                content: `# Challenge: Design a Products Table

## Requirements

Create a \`products\` table with the following requirements:

1. Auto-incrementing primary key (\`id\`)
2. Product name (required, max 200 chars)
3. Description (optional, unlimited text)
4. Price (required, exact decimal, must be > 0)
5. Stock quantity (required, integer, must be >= 0, default 0)
6. Category (required, one of: 'Electronics', 'Clothing', 'Books', 'Food')
7. Created timestamp (auto-set)
8. Is active flag (default true)

Use appropriate data types and constraints for each column.`,
                stepData: {
                    challengeType: 'CODE',
                    language: 'sql',
                    starterCode: `-- Create the products table with proper types and constraints\nCREATE TABLE products (\n    -- Your code here\n);`,
                    solution: `CREATE TABLE products (\n    id          SERIAL PRIMARY KEY,\n    name        VARCHAR(200) NOT NULL,\n    description TEXT,\n    price       DECIMAL(10,2) NOT NULL CHECK (price > 0),\n    stock       INT NOT NULL DEFAULT 0 CHECK (stock >= 0),\n    category    VARCHAR(50) NOT NULL CHECK (category IN ('Electronics', 'Clothing', 'Books', 'Food')),\n    created_at  TIMESTAMP DEFAULT NOW(),\n    is_active   BOOLEAN DEFAULT TRUE\n);`,
                    hints: ['SERIAL auto-generates incrementing IDs', 'Use CHECK constraints for validation', 'DECIMAL(10,2) gives exact money precision'],
                },
            },
            {
                order: 5,
                title: 'Summary: Data Types, NULL & Constraints',
                type: 'SUMMARY',
                keyTakeaways: [
                    'Choose the right data type: INT for IDs, DECIMAL for money, VARCHAR for strings, TIMESTAMP for dates',
                    'NULL means "unknown" — not zero, not empty string. Use IS NULL to check.',
                    'PRIMARY KEY = UNIQUE + NOT NULL, one per table',
                    'FOREIGN KEY links tables; ON DELETE CASCADE/SET NULL/RESTRICT controls behavior',
                    'CHECK constraints enforce custom validation rules',
                    'DEFAULT provides fallback values for optional columns',
                ],
                content: `# Summary — Data Types, NULL & Constraints

## Quick Reference

- **Numeric:** INT, BIGINT, DECIMAL(p,s), FLOAT
- **String:** CHAR(n), VARCHAR(n), TEXT
- **Date/Time:** DATE, TIME, TIMESTAMP, INTERVAL
- **Other:** BOOLEAN, JSON/JSONB, UUID

## NULL Rules
- NULL = NULL → UNKNOWN
- Use IS NULL / IS NOT NULL
- COUNT(*) includes NULLs, COUNT(column) excludes them

## Constraints: PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, CHECK, DEFAULT`,
            },
        ],
    });

    // ── Learn 1.4: Normalization & Database Design ──
    await createLearn({
        slug: 'sql-normalization-database-design',
        title: 'Normalization & Database Design (1NF → 3NF / BCNF)',
        description: 'Master database normalization from 1NF through BCNF. Understand why we normalize, how to identify violations, and when to deliberately denormalize. This is an extremely common interview topic.',
        difficulty: 'INTERMEDIATE',
        topicSlug: 'sql-unit1-foundations',
        unitTitle: 'Unit 1: Foundations of SQL & Databases',
        estimatedTime: 30,
        tags: ['normalization', '1nf', '2nf', '3nf', 'bcnf', 'database-design', 'anomalies'],
        iconEmoji: '📐',
        steps: [
            {
                order: 0,
                title: 'Why Normalize? — Understanding Anomalies',
                type: 'EXPLANATION',
                tips: [
                    'Think of normalization as removing redundancy — each fact should be stored exactly once.',
                    'Memorize the progression: 1NF → 2NF → 3NF → BCNF. Each builds on the previous.',
                    'In interviews, always mention the trade-off: normalization helps writes but can hurt reads (too many JOINs).',
                ],
                content: `# Normalization & Database Design

## Why Normalize?

**Normalization** is the process of organizing a database to **reduce redundancy** and **prevent anomalies**. A poorly designed (denormalized) table stores the same information in multiple places, leading to three types of problems:

---

## The Three Anomalies

Consider this poorly designed table:

| order_id | customer_name | customer_email | product | price |
|----------|--------------|----------------|---------|-------|
| 1 | Alice | alice@mail.com | Laptop | 999 |
| 2 | Alice | alice@mail.com | Mouse | 29 |
| 3 | Bob | bob@mail.com | Laptop | 999 |

### 1. Update Anomaly
If Alice changes her email, we must update **every row** where she appears. If we miss one, we have **inconsistent data** — two different emails for Alice.

### 2. Insert Anomaly
We can't add a new customer until they place an order — there's no way to store customer info without an order.

### 3. Delete Anomaly
If we delete Bob's only order (order 3), we **lose Bob's information entirely** — his name and email disappear.

---

## The Goal of Normalization

> **Store each fact exactly once.** Customer info in a customers table, product info in a products table, orders linking them together.

After normalization:

**customers table:**
| id | name | email |
|----|------|-------|
| 1 | Alice | alice@mail.com |
| 2 | Bob | bob@mail.com |

**products table:**
| id | name | price |
|----|------|-------|
| 1 | Laptop | 999 |
| 2 | Mouse | 29 |

**orders table:**
| id | customer_id | product_id |
|----|-------------|------------|
| 1 | 1 | 1 |
| 2 | 1 | 2 |
| 3 | 2 | 1 |

Now: Update Alice's email in **one place**. Add customers without orders. Delete orders without losing customer data. ✅

---

## Normal Forms

### First Normal Form (1NF)

**Rule:** Every column must contain **atomic (indivisible) values**. No repeating groups or arrays.

❌ **Violates 1NF:**
| student_id | name | phone_numbers |
|-----------|------|---------------|
| 1 | Alice | 111-1111, 222-2222 |

✅ **1NF compliant:**
| student_id | name | phone_number |
|-----------|------|--------------|
| 1 | Alice | 111-1111 |
| 1 | Alice | 222-2222 |

Or better: separate \`student_phones\` table.

---

### Second Normal Form (2NF)

**Rule:** Must be in 1NF AND every non-key column must depend on the **entire** primary key (no partial dependencies).

This only matters when you have a **composite primary key**.

❌ **Violates 2NF** (composite key: student_id + course_id):
| student_id | course_id | student_name | grade |
|-----------|----------|-------------|-------|
| 1 | CS101 | Alice | A |

\`student_name\` depends only on \`student_id\`, not on the full key (\`student_id\`, \`course_id\`). That's a **partial dependency**.

✅ **2NF:** Move \`student_name\` to a \`students\` table.

---

### Third Normal Form (3NF)

**Rule:** Must be in 2NF AND no non-key column depends on another non-key column (no **transitive dependencies**).

❌ **Violates 3NF:**
| employee_id | department_id | department_name |
|------------|--------------|----------------|
| 1 | 10 | Engineering |

\`department_name\` depends on \`department_id\` (non-key), not directly on \`employee_id\` (key). That's a **transitive dependency**.

✅ **3NF:** Move \`department_name\` to a \`departments\` table.

> **Mnemonic:** "Every non-key attribute must depend on **the key, the whole key, and nothing but the key** — so help me Codd."

---

### Boyce-Codd Normal Form (BCNF)

**Rule:** For every functional dependency X → Y, X must be a **superkey** (a candidate key or superset of one).

BCNF is a stricter version of 3NF. In practice, most 3NF tables are already BCNF. The difference only matters in rare cases with **overlapping composite candidate keys**.

---

## When to Denormalize

Normalization is not always the answer. Sometimes you **deliberately denormalize** for performance:

| Scenario | Why Denormalize |
|---------|----------------|
| Read-heavy dashboards | Too many JOINs make queries slow |
| Reporting tables | Pre-compute aggregates for speed |
| Caching layers | Store computed results to avoid re-calculation |
| High-traffic feeds | Embed user name with posts to avoid JOIN on every read |

> **Interview answer:** "I would normalize the transactional schema for data integrity, but create denormalized materialized views or read-optimized tables for reporting and high-read workloads."`,
            },
            {
                order: 1,
                title: 'Normalization Visualization',
                type: 'VISUALIZATION',
                content: `# Normalization — Before vs After

## The Normalization Journey

\`\`\`mermaid
flowchart TD
    A["Unnormalized Data\n(One big table with redundancy)"] --> B["1NF\nAtomic values\nNo repeating groups"]
    B --> C["2NF\nNo partial dependencies\n(every non-key → full PK)"]
    C --> D["3NF\nNo transitive dependencies\n(non-key → non-key removed)"]
    D --> E["BCNF\nEvery determinant is a superkey"]

    style A fill:#ef4444,stroke:#333,color:#fff
    style B fill:#f97316,stroke:#333,color:#fff
    style C fill:#eab308,stroke:#333,color:#fff
    style D fill:#10b981,stroke:#333,color:#fff
    style E fill:#3b82f6,stroke:#333,color:#fff
\`\`\`

## Functional Dependencies (3NF Example)

\`\`\`mermaid
flowchart LR
    subgraph "❌ Violates 3NF"
        EMP_ID["employee_id (PK)"] --> DEPT_ID["department_id"]
        EMP_ID --> DEPT_NAME["department_name"]
        DEPT_ID --> DEPT_NAME
    end

    subgraph "✅ 3NF Compliant"
        EMP_ID2["employee_id (PK)"] --> DEPT_ID2["department_id (FK)"]
        DEPT_ID2 -.->|"references"| DEPT_TABLE["departments(id → name)"]
    end
\`\`\`

The key insight: \`department_name\` transitively depends on \`employee_id\` through \`department_id\`. Breaking this into two tables eliminates the transitive dependency.

## Anomalies Summary

\`\`\`mermaid
flowchart TD
    DENORM["Denormalized Table"] --> UA["Update Anomaly\nChange in one place but not another"]
    DENORM --> IA["Insert Anomaly\nCan't add data without unrelated data"]
    DENORM --> DA["Delete Anomaly\nDeleting one thing loses unrelated data"]
    
    NORM["Normalized Tables"] --> NONE["No anomalies ✅"]
    NORM --> TRADEOFF["More JOINs needed ⚠️"]

    style DENORM fill:#ef4444,stroke:#333,color:#fff
    style NORM fill:#10b981,stroke:#333,color:#fff
\`\`\``,
            },
            {
                order: 2,
                title: 'Schema Design Examples',
                type: 'CODE',
                content: '## Normalization in Practice — SQL Schema Design',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Before Normalization (Bad Design)',
                        language: 'sql',
                        code: `-- ❌ BAD: Everything in one table (denormalized)
CREATE TABLE orders_bad (
    order_id      INT PRIMARY KEY,
    customer_name VARCHAR(100),
    customer_email VARCHAR(100),
    customer_city  VARCHAR(100),
    product_name   VARCHAR(100),
    product_price  DECIMAL(10,2),
    quantity       INT,
    order_date     DATE
);

-- Problems:
-- 1. customer info repeated in EVERY order (redundancy)
-- 2. product price duplicated (update anomaly risk)
-- 3. can't add a customer without an order (insert anomaly)
-- 4. deleting last order loses customer info (delete anomaly)`,
                        explanation: 'This single-table design duplicates customer and product info in every order row. Changing a customer\'s email requires updating every row for that customer — miss one and you have inconsistent data.',
                    },
                    {
                        order: 1,
                        title: 'After Normalization (3NF Design)',
                        language: 'sql',
                        code: `-- ✅ GOOD: Properly normalized (3NF)

CREATE TABLE customers (
    id     SERIAL PRIMARY KEY,
    name   VARCHAR(100) NOT NULL,
    email  VARCHAR(100) UNIQUE NOT NULL,
    city   VARCHAR(100)
);

CREATE TABLE products (
    id     SERIAL PRIMARY KEY,
    name   VARCHAR(100) NOT NULL,
    price  DECIMAL(10,2) NOT NULL CHECK (price > 0)
);

CREATE TABLE orders (
    id           SERIAL PRIMARY KEY,
    customer_id  INT NOT NULL REFERENCES customers(id),
    order_date   DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE order_items (
    id          SERIAL PRIMARY KEY,
    order_id    INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  INT NOT NULL REFERENCES products(id),
    quantity    INT NOT NULL CHECK (quantity > 0),
    unit_price  DECIMAL(10,2) NOT NULL
);`,
                        explanation: 'Each entity gets its own table. Customer info stored once. Product info stored once. Orders link to customers. Order items link to orders and products. unit_price in order_items captures the price at time of purchase (products.price may change later).',
                        highlightLines: [3, 10, 17, 23],
                    },
                ],
            },
            {
                order: 3,
                title: 'Comparison: Normal Form Levels',
                type: 'COMPARISON',
                content: `# Comparing Normal Forms

Understanding the progression from 1NF to BCNF — each level builds on the previous.`,
                stepData: {
                    items: [
                        { title: '1NF (First Normal Form)', description: 'All columns contain atomic (indivisible) values. No repeating groups, no arrays in a single cell.', pros: ['Eliminates multi-valued columns', 'Basic tabular structure'], cons: ['Still allows redundancy', 'Anomalies still possible'], useCase: 'Minimum requirement for any relational table' },
                        { title: '2NF (Second Normal Form)', description: 'In 1NF + no partial dependencies. Every non-key column depends on the ENTIRE primary key.', pros: ['Eliminates partial dependencies', 'Reduces redundancy with composite keys'], cons: ['Transitive dependencies still possible'], useCase: 'Tables with composite primary keys' },
                        { title: '3NF (Third Normal Form)', description: 'In 2NF + no transitive dependencies. Non-key columns depend only on the primary key, not on other non-key columns.', pros: ['Eliminates all common redundancy', 'Prevents update/insert/delete anomalies', 'Standard target for OLTP systems'], cons: ['May require more JOINs', 'Some read performance impact'], useCase: 'Standard for most production transactional databases' },
                        { title: 'BCNF (Boyce-Codd Normal Form)', description: 'Stricter than 3NF: every determinant must be a superkey. Handles edge cases with overlapping candidate keys.', pros: ['Handles all functional dependency anomalies'], cons: ['Rarely needed beyond 3NF', 'May not preserve all functional dependencies'], useCase: 'Academic completeness; rare real-world need beyond 3NF' },
                    ],
                },
            },
            {
                order: 4,
                title: 'Quiz: Normalization',
                type: 'QUIZ',
                content: '## Test Your Knowledge of Normalization',
                quizQuestions: [
                    {
                        order: 0, difficulty: 'EASY',
                        question: 'What problem does normalization solve?',
                        options: [
                            { id: 'a', text: 'Slow query performance', isCorrect: false },
                            { id: 'b', text: 'Data redundancy and anomalies', isCorrect: true },
                            { id: 'c', text: 'Missing indexes', isCorrect: false },
                            { id: 'd', text: 'Lack of backups', isCorrect: false },
                        ],
                        explanation: 'Normalization\'s primary goal is eliminating data redundancy (same data stored multiple times) and preventing update, insert, and delete anomalies.',
                    },
                    {
                        order: 1, difficulty: 'MEDIUM',
                        question: 'A table has a composite PK (student_id, course_id) and a column "student_name" that depends only on student_id. Which normal form is violated?',
                        options: [
                            { id: 'a', text: '1NF', isCorrect: false },
                            { id: 'b', text: '2NF', isCorrect: true },
                            { id: 'c', text: '3NF', isCorrect: false },
                            { id: 'd', text: 'BCNF', isCorrect: false },
                        ],
                        explanation: '2NF violation: student_name depends only on student_id (part of the composite key), not on the full key (student_id + course_id). This is a partial dependency.',
                    },
                    {
                        order: 2, difficulty: 'MEDIUM',
                        question: 'In a table with PK "employee_id", columns "dept_id" and "dept_name", and dept_name depends on dept_id (not on employee_id directly). Which normal form is violated?',
                        options: [
                            { id: 'a', text: '1NF', isCorrect: false },
                            { id: 'b', text: '2NF', isCorrect: false },
                            { id: 'c', text: '3NF', isCorrect: true },
                            { id: 'd', text: 'None — this is fine', isCorrect: false },
                        ],
                        explanation: '3NF violation: dept_name depends on dept_id (a non-key column), which depends on employee_id (the key). This is a transitive dependency: employee_id → dept_id → dept_name.',
                    },
                    {
                        order: 3, difficulty: 'MEDIUM',
                        question: 'Complete the mnemonic: "Every non-key attribute must depend on the key, the whole key, and..."',
                        options: [
                            { id: 'a', text: '...nothing else', isCorrect: false },
                            { id: 'b', text: '...nothing but the key', isCorrect: true },
                            { id: 'c', text: '...only the key', isCorrect: false },
                            { id: 'd', text: '...the primary key', isCorrect: false },
                        ],
                        explanation: '"The key (1NF), the whole key (2NF), and nothing but the key (3NF) — so help me Codd." This famous mnemonic captures all three normal forms. Edgar F. Codd invented the relational model.',
                    },
                    {
                        order: 4, difficulty: 'HARD',
                        question: 'When is deliberate denormalization appropriate?',
                        options: [
                            { id: 'a', text: 'Always — normalized tables are too slow', isCorrect: false },
                            { id: 'b', text: 'Never — normalization must always be maintained', isCorrect: false },
                            { id: 'c', text: 'When read performance needs outweigh the risk of anomalies (e.g., reporting tables, caching)', isCorrect: true },
                            { id: 'd', text: 'Only when using NoSQL databases', isCorrect: false },
                        ],
                        explanation: 'Denormalization is a deliberate trade-off: accept some redundancy to avoid expensive JOINs in read-heavy scenarios. Common in reporting/analytics tables, materialized views, and caching layers. The transactional (write) schema should remain normalized.',
                    },
                ],
            },
            {
                order: 5,
                title: 'Interview Questions: Normalization',
                type: 'INTERVIEW_QUESTIONS',
                content: `# Interview Questions — Normalization & Database Design`,
                interviewCards: [
                    {
                        order: 0, category: 'Conceptual', difficulty: 'MEDIUM',
                        question: 'Explain normalization. What are 1NF, 2NF, and 3NF?',
                        answer: `**Normalization** organizes a database to eliminate redundancy and prevent anomalies.\n\n**1NF:** All columns contain **atomic values** (no arrays/lists in a cell). Each row is unique.\n\n**2NF:** In 1NF + no **partial dependencies**. Every non-key column depends on the **entire** primary key (relevant for composite keys).\n\n**3NF:** In 2NF + no **transitive dependencies**. Non-key columns depend ONLY on the primary key, not on other non-key columns.\n\n**Mnemonic:** "The key (1NF), the whole key (2NF), and nothing but the key (3NF)."`,
                        tags: ['normalization', 'top-question'],
                    },
                    {
                        order: 1, category: 'Conceptual', difficulty: 'MEDIUM',
                        question: 'What are update, insert, and delete anomalies?',
                        answer: `These are problems caused by **denormalized (redundant) data:**\n\n**Update Anomaly:** Same data exists in multiple rows. Changing it requires updating ALL copies. Missing one creates inconsistency.\n- Example: Customer email stored in every order row → change email, must update all order rows.\n\n**Insert Anomaly:** Can't add certain data without unrelated data.\n- Example: Can't add a customer until they place an order.\n\n**Delete Anomaly:** Removing one thing causes unintended loss of other data.\n- Example: Deleting the last order for a customer also loses the customer's info.\n\n**Solution:** Normalize — each fact stored in exactly one place.`,
                        tags: ['anomalies', 'design'],
                    },
                    {
                        order: 2, category: 'Conceptual', difficulty: 'HARD',
                        question: 'When would you deliberately denormalize a database?',
                        answer: `Denormalization is a **deliberate trade-off** — accepting redundancy for read performance:\n\n1. **Reporting / Analytics tables** — pre-join and pre-aggregate data to avoid expensive runtime JOINs\n2. **Materialized views** — store precomputed query results, refresh periodically\n3. **Read-heavy feeds** — embed author name with posts to avoid JOIN on every read (social media feed)\n4. **Caching layers** — redundant data in Redis/cache for ultra-fast reads\n5. **Search indexes** — denormalized documents in Elasticsearch\n\n**The pattern:** Keep the **transactional (write) schema normalized** for data integrity. Create **denormalized read replicas/views** for performance.\n\n> "Normalize for writes, denormalize for reads."`,
                        tags: ['denormalization', 'trade-offs', 'senior'],
                    },
                ],
            },
            {
                order: 6,
                title: 'Summary: Normalization',
                type: 'SUMMARY',
                keyTakeaways: [
                    'Normalization eliminates redundancy and prevents update/insert/delete anomalies',
                    '1NF: atomic values, no repeating groups',
                    '2NF: no partial dependencies (all non-key columns depend on the FULL key)',
                    '3NF: no transitive dependencies (non-key columns depend only on the key)',
                    'BCNF: every determinant is a superkey (stricter 3NF)',
                    'Denormalize deliberately for read performance — materialized views, reporting tables',
                    'Mnemonic: "The key, the whole key, and nothing but the key"',
                ],
                content: `# Summary — Normalization

## Normal Forms Quick Reference

| NF | Rule | Eliminates |
|----|------|------------|
| **1NF** | Atomic values | Multi-valued columns |
| **2NF** | No partial dependencies | Redundancy with composite keys |
| **3NF** | No transitive dependencies | Non-key → non-key chains |
| **BCNF** | Every determinant is superkey | Remaining FD anomalies |

## Trade-Off
- **Normalize** the transactional schema (writes)
- **Denormalize** for read-heavy workloads (materialized views, reporting)`,
            },
        ],
    });

    // ── Learn 1.5: Schema Design & Table Relationships ──
    await createLearn({
        slug: 'sql-schema-design-relationships',
        title: 'Schema Design & Table Relationships',
        description: 'Master One-to-One, One-to-Many, and Many-to-Many relationships. Learn to design junction tables, foreign key references, and ERD diagrams. Schema design is tested in almost every backend and data engineering interview.',
        difficulty: 'INTERMEDIATE',
        topicSlug: 'sql-unit1-foundations',
        unitTitle: 'Unit 1: Foundations of SQL & Databases',
        estimatedTime: 25,
        tags: ['schema', 'relationships', 'one-to-many', 'many-to-many', 'erd', 'junction-table'],
        iconEmoji: '🔗',
        steps: [
            {
                order: 0,
                title: 'Table Relationships Explained',
                type: 'EXPLANATION',
                tips: [
                    'Many-to-Many always requires a junction (bridge/pivot) table.',
                    'The "many" side holds the foreign key in One-to-Many.',
                    'In interviews, always draw the relationship before writing SQL.',
                ],
                content: `# Schema Design & Table Relationships

## The Three Relationship Types

Every real-world data model consists of these three fundamental relationship patterns.

---

### One-to-One (1:1)

Each row in Table A maps to **exactly one row** in Table B, and vice versa.

**Example:** Each user has exactly one profile.

| users |  | profiles |
|-------|--|----------|
| id (PK) | ← | user_id (PK, FK) |
| name | | bio |
| email | | avatar_url |

**When to use 1:1:**
- Splitting a wide table for organization (user + user_profile)
- Isolating optional or rarely-accessed data
- Security: keep sensitive data in a separate table with different permissions

---

### One-to-Many (1:N)

Each row in Table A can relate to **many rows** in Table B, but each row in B relates to **exactly one** in A.

**Example:** One customer has many orders. Each order belongs to exactly one customer.

| customers |  | orders |
|-----------|--|--------|
| id (PK) | ← | customer_id (FK) |
| name | | total |
| email | | order_date |

**Rule:** The foreign key goes on the **"many" side** (orders has customer_id).

This is the most common relationship in databases.

---

### Many-to-Many (M:N)

Each row in Table A can relate to **many rows** in Table B, and each row in B can relate to **many rows** in A.

**Example:** Students can enroll in many courses; each course has many students.

This CANNOT be represented directly — you need a **junction table** (also called bridge/pivot/join table):

| students | | enrollments (junction) | | courses |
|----------|-|------------------------|-|---------|
| id (PK) | ← | student_id (FK) | | id (PK) |
| name | | course_id (FK) | → | name |
| | | enrolled_at | | credits |
| | | grade | | |

The junction table has a **composite primary key**: (student_id, course_id).

---

## Cascading Actions

When a parent row is deleted or updated, what happens to child rows?

| Action | Behavior |
|--------|----------|
| \`CASCADE\` | Delete/update child rows automatically |
| \`SET NULL\` | Set FK to NULL in child rows |
| \`RESTRICT\` / \`NO ACTION\` | Prevent the delete/update |
| \`SET DEFAULT\` | Set FK to its default value |

**Guidelines:**
- **CASCADE** for truly dependent data (order_items when order deleted)
- **SET NULL** for optional relationships (employee's department deleted)
- **RESTRICT** when deletion should be prevented (can't delete customer with active orders)`,
            },
            {
                order: 1,
                title: 'ERD Diagram — Visual Schema',
                type: 'VISUALIZATION',
                content: `# Entity-Relationship Diagram — E-Commerce Schema

## Full E-Commerce ERD

\`\`\`mermaid
erDiagram
    CUSTOMERS ||--o{ ORDERS : places
    CUSTOMERS {
        int id PK
        varchar name
        varchar email UK
        varchar city
    }
    ORDERS ||--|{ ORDER_ITEMS : contains
    ORDERS {
        int id PK
        int customer_id FK
        date order_date
        decimal total
    }
    PRODUCTS ||--o{ ORDER_ITEMS : "included in"
    PRODUCTS {
        int id PK
        varchar name
        decimal price
        int stock
    }
    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal unit_price
    }
    CATEGORIES ||--o{ PRODUCTS : categorizes
    CATEGORIES {
        int id PK
        varchar name
    }
    CUSTOMERS ||--o| PROFILES : has
    PROFILES {
        int id PK
        int user_id FK
        text bio
        varchar avatar_url
    }
\`\`\`

## Relationship Summary

| Relationship | Type | Foreign Key Location |
|-------------|------|---------------------|
| Customers → Orders | One-to-Many | orders.customer_id |
| Orders → Order Items | One-to-Many | order_items.order_id |
| Products → Order Items | One-to-Many | order_items.product_id |
| Students ↔ Courses | Many-to-Many | enrollments junction table |
| Customers → Profiles | One-to-One | profiles.user_id (UNIQUE) |`,
            },
            {
                order: 2,
                title: 'Schema Design — Code Examples',
                type: 'CODE',
                content: '## Building the E-Commerce Schema in SQL',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'One-to-Many: Customers & Orders',
                        language: 'sql',
                        code: `CREATE TABLE customers (
    id     SERIAL PRIMARY KEY,
    name   VARCHAR(100) NOT NULL,
    email  VARCHAR(150) UNIQUE NOT NULL,
    city   VARCHAR(100)
);

CREATE TABLE orders (
    id           SERIAL PRIMARY KEY,
    customer_id  INT NOT NULL,
    order_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    total        DECIMAL(12,2) DEFAULT 0.00,
    status       VARCHAR(20) DEFAULT 'pending'
                 CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),

    CONSTRAINT fk_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE RESTRICT
);

-- RESTRICT: can't delete a customer who has orders
-- This protects data integrity`,
                        explanation: 'The FK goes on the "many" side (orders). ON DELETE RESTRICT prevents accidentally deleting a customer who has existing orders. The CHECK constraint limits order status to valid values.',
                        highlightLines: [10, 16, 17, 18, 19],
                    },
                    {
                        order: 1,
                        title: 'Many-to-Many: Students & Courses (Junction Table)',
                        language: 'sql',
                        code: `CREATE TABLE students (
    id     SERIAL PRIMARY KEY,
    name   VARCHAR(100) NOT NULL,
    email  VARCHAR(150) UNIQUE NOT NULL
);

CREATE TABLE courses (
    id       SERIAL PRIMARY KEY,
    name     VARCHAR(200) NOT NULL,
    credits  INT NOT NULL CHECK (credits BETWEEN 1 AND 6)
);

-- Junction table: links students to courses
CREATE TABLE enrollments (
    student_id   INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id    INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at  TIMESTAMP DEFAULT NOW(),
    grade        CHAR(2),

    PRIMARY KEY (student_id, course_id)
);

-- The composite PK (student_id, course_id) ensures
-- a student can't enroll in the same course twice`,
                        explanation: 'The junction table "enrollments" resolves the M:N relationship. Its composite PK (student_id, course_id) prevents duplicate enrollments. Additional columns like grade and enrolled_at store relationship-specific data.',
                        highlightLines: [14, 15, 16, 21],
                    },
                    {
                        order: 2,
                        title: 'One-to-One: Users & Profiles',
                        language: 'sql',
                        code: `CREATE TABLE users (
    id     SERIAL PRIMARY KEY,
    name   VARCHAR(100) NOT NULL,
    email  VARCHAR(150) UNIQUE NOT NULL
);

CREATE TABLE profiles (
    id         SERIAL PRIMARY KEY,
    user_id    INT UNIQUE NOT NULL,
    bio        TEXT,
    avatar_url VARCHAR(500),
    website    VARCHAR(200),

    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- UNIQUE on user_id enforces 1:1
-- Each user can have at most one profile
-- CASCADE: deleting user also deletes their profile`,
                        explanation: 'The UNIQUE constraint on user_id in profiles enforces the 1:1 relationship — a user_id can appear at most once. Without UNIQUE, it would be 1:N. CASCADE ensures cleaning up profiles when a user is deleted.',
                        highlightLines: [9, 14, 15, 16, 17],
                    },
                ],
            },
            {
                order: 3,
                title: 'Quiz: Schema Design',
                type: 'QUIZ',
                content: '## Test Your Knowledge of Table Relationships',
                quizQuestions: [
                    {
                        order: 0, difficulty: 'EASY',
                        question: 'In a One-to-Many relationship (customers → orders), which table holds the foreign key?',
                        options: [
                            { id: 'a', text: 'The "one" side (customers)', isCorrect: false },
                            { id: 'b', text: 'The "many" side (orders)', isCorrect: true },
                            { id: 'c', text: 'Both tables', isCorrect: false },
                            { id: 'd', text: 'A separate junction table', isCorrect: false },
                        ],
                        explanation: 'In 1:N relationships, the FK goes on the "many" side. Each order has one customer_id. Putting it on the "one" side would mean a customer could only have one order.',
                    },
                    {
                        order: 1, difficulty: 'MEDIUM',
                        question: 'How do you implement a Many-to-Many relationship in SQL?',
                        options: [
                            { id: 'a', text: 'Put foreign keys on both tables', isCorrect: false },
                            { id: 'b', text: 'Use an array column', isCorrect: false },
                            { id: 'c', text: 'Create a junction (bridge) table with FKs to both tables', isCorrect: true },
                            { id: 'd', text: 'Use a single table with duplicate rows', isCorrect: false },
                        ],
                        explanation: 'M:N relationships require a junction table that holds two FKs — one to each related table. The composite PK of both FKs prevents duplicates.',
                    },
                    {
                        order: 2, difficulty: 'MEDIUM',
                        question: 'How do you enforce a One-to-One relationship with a foreign key?',
                        options: [
                            { id: 'a', text: 'Add a regular FOREIGN KEY', isCorrect: false },
                            { id: 'b', text: 'Add a FOREIGN KEY with a UNIQUE constraint', isCorrect: true },
                            { id: 'c', text: 'Use the same primary key in both tables', isCorrect: false },
                            { id: 'd', text: 'It\'s impossible — use a single table instead', isCorrect: false },
                        ],
                        explanation: 'A FK alone allows 1:N (many rows can reference the same parent). Adding UNIQUE to the FK column restricts it to 1:1 — each parent can be referenced at most once.',
                    },
                    {
                        order: 3, difficulty: 'EASY',
                        question: 'What does ON DELETE CASCADE do?',
                        options: [
                            { id: 'a', text: 'Prevents deletion of the parent row', isCorrect: false },
                            { id: 'b', text: 'Sets the FK to NULL in child rows', isCorrect: false },
                            { id: 'c', text: 'Automatically deletes child rows when the parent is deleted', isCorrect: true },
                            { id: 'd', text: 'Logs the deletion for audit', isCorrect: false },
                        ],
                        explanation: 'CASCADE means "do the same thing to children." ON DELETE CASCADE deletes all child rows that reference the deleted parent row. Use it for truly dependent data (order_items when order is deleted).',
                    },
                ],
            },
            {
                order: 4,
                title: 'Challenge: Design a Blog Schema',
                type: 'CHALLENGE',
                content: `# Challenge: Design a Blog Schema

## Requirements

Design tables for a blog platform with:

1. **users** — id, name, email (unique)
2. **posts** — id, title, content, author (FK to users), created_at
3. **tags** — id, name (unique)
4. **post_tags** — junction table (a post can have many tags, a tag can be on many posts)
5. **comments** — id, post (FK), author (FK to users), content, created_at

Think about:
- Which relationships are 1:N vs M:N?
- What cascade behaviors make sense?
- What constraints are needed?`,
                stepData: {
                    challengeType: 'CODE',
                    language: 'sql',
                    starterCode: `-- Design the blog schema\n-- Create all 5 tables with proper relationships\n`,
                    solution: `CREATE TABLE users (\n    id    SERIAL PRIMARY KEY,\n    name  VARCHAR(100) NOT NULL,\n    email VARCHAR(150) UNIQUE NOT NULL\n);\n\nCREATE TABLE posts (\n    id         SERIAL PRIMARY KEY,\n    title      VARCHAR(300) NOT NULL,\n    content    TEXT NOT NULL,\n    author_id  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n    created_at TIMESTAMP DEFAULT NOW()\n);\n\nCREATE TABLE tags (\n    id   SERIAL PRIMARY KEY,\n    name VARCHAR(50) UNIQUE NOT NULL\n);\n\nCREATE TABLE post_tags (\n    post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,\n    tag_id  INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,\n    PRIMARY KEY (post_id, tag_id)\n);\n\nCREATE TABLE comments (\n    id         SERIAL PRIMARY KEY,\n    post_id    INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,\n    author_id  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n    content    TEXT NOT NULL,\n    created_at TIMESTAMP DEFAULT NOW()\n);`,
                    hints: ['Posts and tags are M:N — you need a junction table', 'Think about what happens when a user or post is deleted'],
                },
            },
            {
                order: 5,
                title: 'Interview Questions: Schema Design',
                type: 'INTERVIEW_QUESTIONS',
                content: `# Interview Questions — Schema Design & Relationships`,
                interviewCards: [
                    {
                        order: 0, category: 'Conceptual', difficulty: 'EASY',
                        question: 'Explain the difference between One-to-One, One-to-Many, and Many-to-Many relationships.',
                        answer: `**One-to-One (1:1):** Each row in Table A maps to exactly one row in Table B.\n- Example: user ↔ profile\n- Implementation: FK with UNIQUE constraint\n\n**One-to-Many (1:N):** One row in A maps to many rows in B, but each B row maps to one A.\n- Example: customer → orders\n- Implementation: FK on the "many" side\n\n**Many-to-Many (M:N):** Many rows in A relate to many rows in B.\n- Example: students ↔ courses\n- Implementation: Junction table with two FKs and a composite PK`,
                        tags: ['relationships', 'top-question'],
                    },
                    {
                        order: 1, category: 'Coding', difficulty: 'MEDIUM',
                        question: 'Design a schema for an e-commerce application with users, products, orders, and order items.',
                        answer: `\`\`\`sql\nCREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(100) NOT NULL,\n  email VARCHAR(150) UNIQUE NOT NULL\n);\n\nCREATE TABLE products (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(200) NOT NULL,\n  price DECIMAL(10,2) NOT NULL\n);\n\nCREATE TABLE orders (\n  id SERIAL PRIMARY KEY,\n  user_id INT NOT NULL REFERENCES users(id),\n  created_at TIMESTAMP DEFAULT NOW(),\n  status VARCHAR(20) DEFAULT 'pending'\n);\n\nCREATE TABLE order_items (\n  id SERIAL PRIMARY KEY,\n  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,\n  product_id INT NOT NULL REFERENCES products(id),\n  quantity INT NOT NULL CHECK (quantity > 0),\n  unit_price DECIMAL(10,2) NOT NULL\n);\n\`\`\`\n\n**Key decisions:**\n- unit_price in order_items captures price at purchase time\n- CASCADE on order_items: delete items when order deleted\n- RESTRICT on orders→users: can't delete user with orders`,
                        codeSnippet: `CREATE TABLE orders (\n  id SERIAL PRIMARY KEY,\n  user_id INT NOT NULL REFERENCES users(id),\n  created_at TIMESTAMP DEFAULT NOW()\n);\n\nCREATE TABLE order_items (\n  order_id INT REFERENCES orders(id) ON DELETE CASCADE,\n  product_id INT REFERENCES products(id),\n  quantity INT CHECK (quantity > 0),\n  unit_price DECIMAL(10,2) NOT NULL\n);`,
                        codeLanguage: 'sql',
                        tags: ['schema-design', 'e-commerce'],
                    },
                    {
                        order: 2, category: 'Tricky', difficulty: 'HARD',
                        question: 'What is a self-referencing foreign key? Give an example.',
                        answer: `A **self-referencing FK** is a foreign key that references the **same table**. It models **hierarchical** or **recursive** relationships.\n\n**Example: Employee-Manager hierarchy**\n\`\`\`sql\nCREATE TABLE employees (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(100) NOT NULL,\n  manager_id INT REFERENCES employees(id)\n);\n\`\`\`\n\n- The CEO has \`manager_id = NULL\` (no manager)\n- Other employees have \`manager_id\` pointing to their manager's \`id\`\n- This creates a tree structure\n\n**Other examples:** Categories with parent categories, comments with parent comments (threaded replies), folder structures.`,
                        codeSnippet: `CREATE TABLE employees (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(100) NOT NULL,\n  manager_id INT REFERENCES employees(id)\n);`,
                        codeLanguage: 'sql',
                        tags: ['self-reference', 'hierarchy'],
                    },
                ],
            },
            {
                order: 6,
                title: 'Summary: Schema Design',
                type: 'SUMMARY',
                keyTakeaways: [
                    'One-to-Many: FK on the "many" side',
                    'Many-to-Many: requires a junction table with composite PK',
                    'One-to-One: FK with UNIQUE constraint',
                    'CASCADE for dependent data, RESTRICT for protection, SET NULL for optional',
                    'Self-referencing FKs model hierarchies (employee→manager)',
                    'Always store price-at-purchase in order items (not just a FK to products)',
                ],
                content: `# Summary — Schema Design & Table Relationships

## Quick Reference

| Relationship | FK Location | Constraint |
|-------------|------------|------------|
| 1:1 | Either side | FK + UNIQUE |
| 1:N | "Many" side | FK |
| M:N | Junction table | Two FKs + Composite PK |`,
            },
        ],
    });

    // ── Learn 1.6: Isolation Levels & Concurrency Problems ──
    await createLearn({
        slug: 'sql-isolation-levels-concurrency',
        title: 'Isolation Levels & Concurrency Problems',
        description: 'Understand dirty reads, non-repeatable reads, phantom reads, and lost updates. Master the four isolation levels from READ UNCOMMITTED to SERIALIZABLE and know which problems each prevents.',
        difficulty: 'INTERMEDIATE',
        topicSlug: 'sql-unit1-foundations',
        unitTitle: 'Unit 1: Foundations of SQL & Databases',
        estimatedTime: 20,
        tags: ['isolation', 'concurrency', 'dirty-read', 'phantom-read', 'transactions', 'serializable'],
        iconEmoji: '🔀',
        steps: [
            {
                order: 0,
                title: 'Concurrency Problems Explained',
                type: 'EXPLANATION',
                tips: [
                    'Draw a timeline of two transactions to visualize each problem — interviewers love diagrams.',
                    'PostgreSQL default is READ COMMITTED; MySQL InnoDB default is REPEATABLE READ.',
                    'SERIALIZABLE is the safest but slowest. Most apps use READ COMMITTED or REPEATABLE READ.',
                ],
                content: `# Isolation Levels & Concurrency Problems

## Why Concurrency Matters

In production, hundreds of transactions run **simultaneously**. Without proper isolation, they can interfere with each other in dangerous ways.

---

## The Four Concurrency Problems

### 1. Dirty Read

A transaction reads data that **another transaction has written but not yet committed**. If that transaction rolls back, the read data **never actually existed**.

| Time | Transaction A | Transaction B |
|------|--------------|--------------|
| T1 | UPDATE salary = 5000 WHERE id = 1 | |
| T2 | | SELECT salary WHERE id = 1 → **5000** (uncommitted!) |
| T3 | ROLLBACK (undoes the update) | |
| T4 | | **B used data that never existed** ❌ |

---

### 2. Non-Repeatable Read

A transaction reads the same row **twice** and gets **different values** because another transaction modified and committed it in between.

| Time | Transaction A | Transaction B |
|------|--------------|--------------|
| T1 | SELECT salary WHERE id = 1 → **3000** | |
| T2 | | UPDATE salary = 5000 WHERE id = 1; COMMIT; |
| T3 | SELECT salary WHERE id = 1 → **5000** | |
| | **Same query, different result** ❌ | |

---

### 3. Phantom Read

A transaction runs the same **range query** twice and gets **different rows** because another transaction inserted or deleted rows that match the criteria.

| Time | Transaction A | Transaction B |
|------|--------------|--------------|
| T1 | SELECT COUNT(*) FROM employees WHERE dept = 'Eng' → **10** | |
| T2 | | INSERT INTO employees (name, dept) VALUES ('New', 'Eng'); COMMIT; |
| T3 | SELECT COUNT(*) FROM employees WHERE dept = 'Eng' → **11** | |
| | **A "phantom" row appeared** ❌ | |

---

### 4. Lost Update

Two transactions read the same data, then both update it. The **second update overwrites the first**, losing that change.

| Time | Transaction A | Transaction B |
|------|--------------|--------------|
| T1 | READ balance → 1000 | READ balance → 1000 |
| T2 | balance = 1000 - 200 = 800 | |
| T3 | | balance = 1000 + 500 = 1500 |
| T4 | WRITE 800 | |
| T5 | | WRITE 1500 |
| | **A's -200 is lost!** Final: 1500 instead of 1300 ❌ | |

---

## The Four Isolation Levels

SQL defines four isolation levels, each preventing more problems but adding more overhead:

| Isolation Level | Dirty Read | Non-Repeatable Read | Phantom Read |
|----------------|-----------|-------------------|-------------|
| **READ UNCOMMITTED** | ❌ Possible | ❌ Possible | ❌ Possible |
| **READ COMMITTED** | ✅ Prevented | ❌ Possible | ❌ Possible |
| **REPEATABLE READ** | ✅ Prevented | ✅ Prevented | ❌ Possible* |
| **SERIALIZABLE** | ✅ Prevented | ✅ Prevented | ✅ Prevented |

*PostgreSQL's REPEATABLE READ also prevents phantom reads using MVCC (snapshot isolation).

### Setting Isolation Level

\`\`\`sql
-- Per transaction:
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
BEGIN;
-- ... your queries ...
COMMIT;

-- Session-wide:
SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL REPEATABLE READ;
\`\`\`

---

## Database Defaults

| Database | Default Isolation |
|----------|------------------|
| **PostgreSQL** | READ COMMITTED |
| **MySQL (InnoDB)** | REPEATABLE READ |
| **SQL Server** | READ COMMITTED |
| **Oracle** | READ COMMITTED |

> **Performance Trade-off:** Higher isolation = more locking/blocking = slower throughput. Most applications use READ COMMITTED and handle specific concurrency issues at the application level.`,
            },
            {
                order: 1,
                title: 'Isolation Levels — Visualization',
                type: 'VISUALIZATION',
                content: `# Isolation Levels — Visual Comparison

## Problems vs Protection

\`\`\`mermaid
flowchart TD
    A["READ UNCOMMITTED\n❌ All problems possible\n⚡ Fastest"] --> B["READ COMMITTED\n✅ No dirty reads\n❌ Non-repeatable + Phantom"]
    B --> C["REPEATABLE READ\n✅ No dirty/non-repeatable\n❌ Phantom reads possible"]
    C --> D["SERIALIZABLE\n✅ All problems prevented\n🐌 Slowest"]

    style A fill:#ef4444,stroke:#333,color:#fff
    style B fill:#f97316,stroke:#333,color:#fff
    style C fill:#eab308,stroke:#333,color:#fff
    style D fill:#10b981,stroke:#333,color:#fff
\`\`\`

## Dirty Read Timeline

\`\`\`mermaid
sequenceDiagram
    participant TA as Transaction A
    participant DB as Database
    participant TB as Transaction B

    TA->>DB: BEGIN
    TA->>DB: UPDATE salary = 5000
    Note over DB: Uncommitted change
    TB->>DB: SELECT salary → 5000 ❌
    Note over TB: DIRTY READ!
    TA->>DB: ROLLBACK
    Note over DB: Change undone
    Note over TB: TB used data that never existed
\`\`\`

## Trade-off Scale

\`\`\`mermaid
flowchart LR
    A["🐌 SERIALIZABLE"] --- B["Safety\n(More protection)"]
    C["⚡ READ UNCOMMITTED"] --- D["Speed\n(More throughput)"]

    style A fill:#10b981,stroke:#333,color:#fff
    style C fill:#ef4444,stroke:#333,color:#fff
\`\`\``,
            },
            {
                order: 2,
                title: 'Quiz: Isolation Levels',
                type: 'QUIZ',
                content: '## Test Your Knowledge of Isolation Levels & Concurrency',
                quizQuestions: [
                    {
                        order: 0, difficulty: 'MEDIUM',
                        question: 'Which concurrency problem occurs when you read data that another transaction wrote but has not yet committed?',
                        options: [
                            { id: 'a', text: 'Non-repeatable read', isCorrect: false },
                            { id: 'b', text: 'Phantom read', isCorrect: false },
                            { id: 'c', text: 'Dirty read', isCorrect: true },
                            { id: 'd', text: 'Lost update', isCorrect: false },
                        ],
                        explanation: 'A dirty read occurs when Transaction B reads uncommitted data from Transaction A. If A rolls back, B has used data that never actually existed.',
                    },
                    {
                        order: 1, difficulty: 'MEDIUM',
                        question: 'What is the default isolation level in PostgreSQL?',
                        options: [
                            { id: 'a', text: 'READ UNCOMMITTED', isCorrect: false },
                            { id: 'b', text: 'READ COMMITTED', isCorrect: true },
                            { id: 'c', text: 'REPEATABLE READ', isCorrect: false },
                            { id: 'd', text: 'SERIALIZABLE', isCorrect: false },
                        ],
                        explanation: 'PostgreSQL defaults to READ COMMITTED, which prevents dirty reads. MySQL (InnoDB) defaults to REPEATABLE READ.',
                    },
                    {
                        order: 2, difficulty: 'HARD',
                        question: 'Which isolation level prevents ALL concurrency problems including phantom reads?',
                        options: [
                            { id: 'a', text: 'READ COMMITTED', isCorrect: false },
                            { id: 'b', text: 'REPEATABLE READ', isCorrect: false },
                            { id: 'c', text: 'SERIALIZABLE', isCorrect: true },
                            { id: 'd', text: 'SNAPSHOT', isCorrect: false },
                        ],
                        explanation: 'SERIALIZABLE prevents all concurrency problems by making transactions behave as if they ran one after another. It\'s the safest but slowest isolation level.',
                    },
                    {
                        order: 3, difficulty: 'MEDIUM',
                        question: 'A transaction runs "SELECT COUNT(*) WHERE dept = \'Eng\'" twice and gets 10, then 11. What happened?',
                        options: [
                            { id: 'a', text: 'Dirty read', isCorrect: false },
                            { id: 'b', text: 'Non-repeatable read', isCorrect: false },
                            { id: 'c', text: 'Phantom read', isCorrect: true },
                            { id: 'd', text: 'Lost update', isCorrect: false },
                        ],
                        explanation: 'This is a phantom read — another transaction inserted a row matching the WHERE condition between the two reads. The "phantom" row appeared out of nowhere.',
                    },
                ],
            },
            {
                order: 3,
                title: 'Interview Questions: Isolation & Concurrency',
                type: 'INTERVIEW_QUESTIONS',
                content: `# Interview Questions — Isolation Levels & Concurrency`,
                interviewCards: [
                    {
                        order: 0, category: 'Conceptual', difficulty: 'MEDIUM',
                        question: 'What are the four isolation levels in SQL? What does each prevent?',
                        answer: `| Level | Prevents | Allows |\n|-------|---------|--------|\n| **READ UNCOMMITTED** | Nothing | Dirty reads, non-repeatable reads, phantoms |\n| **READ COMMITTED** | Dirty reads | Non-repeatable reads, phantoms |\n| **REPEATABLE READ** | Dirty + non-repeatable reads | Phantom reads |\n| **SERIALIZABLE** | All problems | Nothing (fully isolated) |\n\n**Trade-off:** Higher isolation = more locking = slower throughput.\n\n**Defaults:** PostgreSQL/Oracle/SQL Server → READ COMMITTED. MySQL InnoDB → REPEATABLE READ.`,
                        tags: ['isolation-levels', 'top-question'],
                    },
                    {
                        order: 1, category: 'Conceptual', difficulty: 'MEDIUM',
                        question: 'What is a dirty read and how do you prevent it?',
                        answer: `A **dirty read** happens when Transaction B reads data that Transaction A has written but **not yet committed**. If A rolls back, B used data that never existed.\n\n**Prevention:** Use READ COMMITTED isolation level (or higher). This is the default in PostgreSQL.\n\nAt READ COMMITTED, a transaction only sees data that has been **committed** by other transactions. Uncommitted changes are invisible.\n\n**Real-world impact:** Without this protection, financial calculations could be based on phantom data — a transfer that was rolled back.`,
                        tags: ['dirty-read', 'concurrency'],
                    },
                    {
                        order: 2, category: 'Tricky', difficulty: 'HARD',
                        question: 'What is the difference between a non-repeatable read and a phantom read?',
                        answer: `Both involve getting different results when re-reading, but they differ in scope:\n\n**Non-Repeatable Read:**\n- Same **row** read twice → different **values**\n- Another transaction **UPDATED** the row between reads\n- Prevented by: REPEATABLE READ\n\n**Phantom Read:**\n- Same **range query** run twice → different **set of rows**\n- Another transaction **INSERTED or DELETED** rows matching the criteria\n- Prevented by: SERIALIZABLE\n\n**Key distinction:** Non-repeatable read is about **existing rows changing**. Phantom read is about **new rows appearing or existing rows disappearing** from a result set.`,
                        tags: ['phantom-read', 'non-repeatable-read', 'distinction'],
                    },
                ],
            },
            {
                order: 4,
                title: 'Summary: Isolation Levels',
                type: 'SUMMARY',
                keyTakeaways: [
                    'Four concurrency problems: dirty read, non-repeatable read, phantom read, lost update',
                    'Four isolation levels: READ UNCOMMITTED → READ COMMITTED → REPEATABLE READ → SERIALIZABLE',
                    'Higher isolation = more protection but worse performance',
                    'PostgreSQL default: READ COMMITTED; MySQL default: REPEATABLE READ',
                    'Most apps use READ COMMITTED and handle specific issues at application level',
                ],
                content: `# Summary — Isolation Levels

## Quick Reference

| Problem | What Happens | Prevented By |
|---------|-------------|-------------|
| Dirty Read | Read uncommitted data | READ COMMITTED |
| Non-Repeatable Read | Same row, different value on re-read | REPEATABLE READ |
| Phantom Read | Same query, different row count | SERIALIZABLE |
| Lost Update | Two updates, one is lost | Application-level locking |`,
            },
        ],
    });

    // ── Learn 1.7: Unit 1 Review — Foundations Quiz & Mock Interview ──
    await createLearn({
        slug: 'sql-unit1-review-foundations',
        title: 'Unit 1 Review — Foundations Quiz & Interview Prep',
        description: 'Comprehensive review of Unit 1: SQL fundamentals, ACID properties, data types, NULL, constraints, normalization, schema design, and isolation levels. 30+ quiz questions and interview flashcards to test your knowledge.',
        difficulty: 'INTERMEDIATE',
        topicSlug: 'sql-unit1-foundations',
        unitTitle: 'Unit 1: Foundations of SQL & Databases',
        estimatedTime: 40,
        tags: ['review', 'quiz', 'interview-prep', 'unit1', 'foundations'],
        iconEmoji: '🎯',
        steps: [
            {
                order: 0,
                title: 'Unit 1 Recap',
                type: 'SUMMARY',
                content: `# Unit 1 Recap — Foundations of SQL & Databases

## What We Covered

### Learn 1.1: What is SQL & How Databases Work
- Relational databases: tables, rows, columns
- SQL is declarative — describe WHAT, not HOW
- SQL sub-languages: DDL, DML, DCL, TCL
- SQL vs NoSQL trade-offs
- DBMS and query execution pipeline

### Learn 1.2: ACID Properties & Transactions
- Atomicity: all-or-nothing
- Consistency: rules always hold
- Isolation: transactions don't interfere
- Durability: committed = permanent (WAL)
- BEGIN, COMMIT, ROLLBACK, SAVEPOINT

### Learn 1.3: Data Types, NULL & Constraints
- Numeric: INT, DECIMAL, FLOAT
- String: CHAR, VARCHAR, TEXT
- Date: DATE, TIMESTAMP, INTERVAL
- NULL = unknown (three-valued logic)
- Constraints: PK, FK, UNIQUE, NOT NULL, CHECK, DEFAULT

### Learn 1.4: Normalization (1NF → BCNF)
- Update, insert, delete anomalies
- 1NF: atomic values
- 2NF: no partial dependencies
- 3NF: no transitive dependencies
- When to denormalize

### Learn 1.5: Schema Design & Relationships
- One-to-One, One-to-Many, Many-to-Many
- Junction tables for M:N
- Cascading: CASCADE, SET NULL, RESTRICT
- Self-referencing foreign keys

### Learn 1.6: Isolation Levels & Concurrency
- Dirty read, non-repeatable read, phantom read, lost update
- READ UNCOMMITTED → READ COMMITTED → REPEATABLE READ → SERIALIZABLE
- PostgreSQL default: READ COMMITTED`,
                keyTakeaways: [
                    'SQL is the universal language for relational databases',
                    'ACID ensures reliable transactions: Atomicity, Consistency, Isolation, Durability',
                    'NULL means unknown — use IS NULL, not = NULL',
                    'Normalization eliminates redundancy: 1NF → 2NF → 3NF',
                    'FK on the "many" side; junction table for M:N; UNIQUE FK for 1:1',
                    'Higher isolation = more safety but less performance',
                ],
            },
            {
                order: 1,
                title: 'Comprehensive Quiz — Unit 1 Foundations',
                type: 'QUIZ',
                content: '## Unit 1 Comprehensive Quiz — 15 Questions\n\nThis quiz covers ALL topics from Unit 1. Aim for 80%+ to confirm mastery.',
                quizQuestions: [
                    {
                        order: 0, difficulty: 'EASY',
                        question: 'Which SQL command is used to retrieve data from a table?',
                        options: [
                            { id: 'a', text: 'GET', isCorrect: false },
                            { id: 'b', text: 'FETCH', isCorrect: false },
                            { id: 'c', text: 'SELECT', isCorrect: true },
                            { id: 'd', text: 'RETRIEVE', isCorrect: false },
                        ],
                        explanation: 'SELECT is the SQL command for querying data. It\'s part of DML (Data Manipulation Language).',
                    },
                    {
                        order: 1, difficulty: 'EASY',
                        question: 'What does ACID stand for in database context?',
                        options: [
                            { id: 'a', text: 'Automated, Cached, Indexed, Distributed', isCorrect: false },
                            { id: 'b', text: 'Atomicity, Consistency, Isolation, Durability', isCorrect: true },
                            { id: 'c', text: 'Access, Control, Integration, Data', isCorrect: false },
                            { id: 'd', text: 'Atomic, Consistent, Independent, Durable', isCorrect: false },
                        ],
                        explanation: 'ACID = Atomicity (all or nothing), Consistency (rules hold), Isolation (no interference), Durability (committed = permanent).',
                    },
                    {
                        order: 2, difficulty: 'MEDIUM',
                        question: 'What is the result of: SELECT 5 + NULL;',
                        options: [
                            { id: 'a', text: '5', isCorrect: false },
                            { id: 'b', text: '0', isCorrect: false },
                            { id: 'c', text: 'NULL', isCorrect: true },
                            { id: 'd', text: 'Error', isCorrect: false },
                        ],
                        explanation: 'Any arithmetic operation with NULL returns NULL. 5 + unknown = unknown. This is a common interview gotcha.',
                    },
                    {
                        order: 3, difficulty: 'MEDIUM',
                        question: 'Which constraint combination defines a PRIMARY KEY?',
                        options: [
                            { id: 'a', text: 'UNIQUE only', isCorrect: false },
                            { id: 'b', text: 'NOT NULL only', isCorrect: false },
                            { id: 'c', text: 'UNIQUE + NOT NULL', isCorrect: true },
                            { id: 'd', text: 'UNIQUE + AUTO_INCREMENT', isCorrect: false },
                        ],
                        explanation: 'A PRIMARY KEY is equivalent to UNIQUE + NOT NULL. It ensures each row has a unique, non-null identifier.',
                    },
                    {
                        order: 4, difficulty: 'MEDIUM',
                        question: 'A table stores customer_name and customer_email in every order row. Which anomaly is most likely?',
                        options: [
                            { id: 'a', text: 'Phantom read', isCorrect: false },
                            { id: 'b', text: 'Update anomaly', isCorrect: true },
                            { id: 'c', text: 'Deadlock', isCorrect: false },
                            { id: 'd', text: 'Lost update', isCorrect: false },
                        ],
                        explanation: 'Storing customer info in every order row creates redundancy. If the customer changes their email, you must update ALL order rows — miss one and you have an update anomaly.',
                    },
                    {
                        order: 5, difficulty: 'MEDIUM',
                        question: 'In 3NF, which type of dependency is eliminated?',
                        options: [
                            { id: 'a', text: 'Primary dependencies', isCorrect: false },
                            { id: 'b', text: 'Partial dependencies', isCorrect: false },
                            { id: 'c', text: 'Transitive dependencies', isCorrect: true },
                            { id: 'd', text: 'Circular dependencies', isCorrect: false },
                        ],
                        explanation: '3NF eliminates transitive dependencies (non-key → non-key). 2NF eliminates partial dependencies. 1NF ensures atomic values.',
                    },
                    {
                        order: 6, difficulty: 'EASY',
                        question: 'In a One-to-Many relationship (department → employees), where does the foreign key go?',
                        options: [
                            { id: 'a', text: 'In the department table', isCorrect: false },
                            { id: 'b', text: 'In the employees table', isCorrect: true },
                            { id: 'c', text: 'In a separate junction table', isCorrect: false },
                            { id: 'd', text: 'In both tables', isCorrect: false },
                        ],
                        explanation: 'The FK goes on the "many" side (employees). Each employee has one department_id pointing to their department.',
                    },
                    {
                        order: 7, difficulty: 'MEDIUM',
                        question: 'How do you implement a Many-to-Many relationship?',
                        options: [
                            { id: 'a', text: 'Foreign keys on both tables', isCorrect: false },
                            { id: 'b', text: 'An array column in one table', isCorrect: false },
                            { id: 'c', text: 'A junction table with FKs to both tables', isCorrect: true },
                            { id: 'd', text: 'A self-referencing FK', isCorrect: false },
                        ],
                        explanation: 'M:N requires a junction (bridge) table with two FKs — one to each related table — and typically a composite PK.',
                    },
                    {
                        order: 8, difficulty: 'HARD',
                        question: 'Which isolation level is the default in MySQL (InnoDB)?',
                        options: [
                            { id: 'a', text: 'READ UNCOMMITTED', isCorrect: false },
                            { id: 'b', text: 'READ COMMITTED', isCorrect: false },
                            { id: 'c', text: 'REPEATABLE READ', isCorrect: true },
                            { id: 'd', text: 'SERIALIZABLE', isCorrect: false },
                        ],
                        explanation: 'MySQL InnoDB defaults to REPEATABLE READ (prevents dirty reads and non-repeatable reads). PostgreSQL, Oracle, and SQL Server default to READ COMMITTED.',
                    },
                    {
                        order: 9, difficulty: 'MEDIUM',
                        question: 'Transaction A reads a salary as $3000. Transaction B updates it to $5000 and commits. Transaction A reads again and sees $5000. What problem is this?',
                        options: [
                            { id: 'a', text: 'Dirty read', isCorrect: false },
                            { id: 'b', text: 'Non-repeatable read', isCorrect: true },
                            { id: 'c', text: 'Phantom read', isCorrect: false },
                            { id: 'd', text: 'Lost update', isCorrect: false },
                        ],
                        explanation: 'This is a non-repeatable read — the same row is read twice within one transaction and gets different values because another committed transaction changed it between reads.',
                    },
                    {
                        order: 10, difficulty: 'MEDIUM',
                        question: 'What does the ROLLBACK command do?',
                        options: [
                            { id: 'a', text: 'Saves all changes permanently', isCorrect: false },
                            { id: 'b', text: 'Undoes all changes since the last BEGIN', isCorrect: true },
                            { id: 'c', text: 'Creates a savepoint', isCorrect: false },
                            { id: 'd', text: 'Resets the entire database', isCorrect: false },
                        ],
                        explanation: 'ROLLBACK undoes all changes made since BEGIN, restoring the database to its state before the transaction started. COMMIT does the opposite — makes changes permanent.',
                    },
                    {
                        order: 11, difficulty: 'HARD',
                        question: 'Which SQL execution step runs FIRST: WHERE or SELECT?',
                        options: [
                            { id: 'a', text: 'SELECT (it\'s written first)', isCorrect: false },
                            { id: 'b', text: 'WHERE (it filters before selecting)', isCorrect: true },
                            { id: 'c', text: 'They run simultaneously', isCorrect: false },
                            { id: 'd', text: 'It depends on the optimizer', isCorrect: false },
                        ],
                        explanation: 'The logical execution order is: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. WHERE runs before SELECT, which is why you can\'t use a SELECT alias in WHERE.',
                    },
                    {
                        order: 12, difficulty: 'EASY',
                        question: 'Which data type should you use for storing prices?',
                        options: [
                            { id: 'a', text: 'FLOAT', isCorrect: false },
                            { id: 'b', text: 'INT', isCorrect: false },
                            { id: 'c', text: 'DECIMAL', isCorrect: true },
                            { id: 'd', text: 'VARCHAR', isCorrect: false },
                        ],
                        explanation: 'DECIMAL provides exact precision for monetary values. FLOAT has rounding errors that can cause financial discrepancies.',
                    },
                    {
                        order: 13, difficulty: 'MEDIUM',
                        question: 'What does ON DELETE SET NULL do on a FOREIGN KEY?',
                        options: [
                            { id: 'a', text: 'Deletes the child rows', isCorrect: false },
                            { id: 'b', text: 'Prevents deletion of the parent', isCorrect: false },
                            { id: 'c', text: 'Sets the FK column to NULL in child rows', isCorrect: true },
                            { id: 'd', text: 'Sets all columns to NULL in child rows', isCorrect: false },
                        ],
                        explanation: 'SET NULL changes the FK column to NULL in child rows when the parent is deleted. The child rows survive but lose their reference to the parent.',
                    },
                    {
                        order: 14, difficulty: 'HARD',
                        question: 'A column stores "John,Jane,Bob" as a single value. Which normal form is violated?',
                        options: [
                            { id: 'a', text: '1NF (values are not atomic)', isCorrect: true },
                            { id: 'b', text: '2NF (partial dependency)', isCorrect: false },
                            { id: 'c', text: '3NF (transitive dependency)', isCorrect: false },
                            { id: 'd', text: 'No violation — this is fine', isCorrect: false },
                        ],
                        explanation: '1NF requires atomic (indivisible) values in each column. Storing multiple names in one cell violates 1NF. The fix is a separate row per name, or a related table.',
                    },
                ],
            },
            {
                order: 2,
                title: 'Interview Prep — Unit 1 Flashcards',
                type: 'INTERVIEW_QUESTIONS',
                content: `# Unit 1 Interview Flashcards — Comprehensive Review

These 10 flashcards cover the most commonly asked questions from Unit 1 topics. Review these before any SQL interview.`,
                interviewCards: [
                    {
                        order: 0, category: 'Conceptual', difficulty: 'EASY',
                        question: 'What is the difference between SQL and NoSQL?',
                        answer: `**SQL:** Fixed schema, tables with rows/columns, JOINs, ACID transactions, vertical scaling. Best for: complex queries, data integrity, transactional systems.\n\n**NoSQL:** Flexible schema, documents/key-value/graph, denormalized, eventual consistency, horizontal scaling. Best for: high throughput, flexible data, simple access patterns.\n\n**Real answer:** "Most production systems use both — SQL for transactional data, NoSQL for caching/search/feeds."`,
                        tags: ['sql-vs-nosql'],
                    },
                    {
                        order: 1, category: 'Conceptual', difficulty: 'MEDIUM',
                        question: 'Explain ACID properties with an example.',
                        answer: `**Bank transfer example ($500 from A to B):**\n\n- **Atomicity:** Both debit and credit happen, or neither does\n- **Consistency:** Balances can't go negative (CHECK constraint enforced)\n- **Isolation:** Other transactions can't see the partial state (A debited but B not yet credited)\n- **Durability:** Once committed, the transfer survives a power outage (WAL)`,
                        tags: ['acid', 'must-know'],
                    },
                    {
                        order: 2, category: 'Tricky', difficulty: 'MEDIUM',
                        question: 'What is NULL in SQL? Why is NULL = NULL not TRUE?',
                        answer: `NULL means **"unknown/missing"** — not zero, not empty string.\n\nNULL = NULL returns **UNKNOWN** (not TRUE) because SQL uses **three-valued logic**. You can't determine if two unknown values are equal.\n\n**Analogy:** "I don't know Alice's age, and I don't know Bob's age. Are they the same age? I don't know (UNKNOWN)."\n\n**Correct way:** \`WHERE col IS NULL\` / \`WHERE col IS NOT NULL\``,
                        tags: ['null', 'three-valued-logic'],
                    },
                    {
                        order: 3, category: 'Conceptual', difficulty: 'MEDIUM',
                        question: 'What is normalization? Explain up to 3NF.',
                        answer: `**Normalization** eliminates data redundancy and prevents anomalies.\n\n**1NF:** Atomic values only (no arrays in cells)\n**2NF:** + No partial dependencies (every non-key column depends on the FULL key)\n**3NF:** + No transitive dependencies (non-key → non-key removed)\n\n**Mnemonic:** "The key, the whole key, and nothing but the key."\n\n**Trade-off:** Normalize for writes (integrity), denormalize for reads (performance).`,
                        tags: ['normalization', 'must-know'],
                    },
                    {
                        order: 4, category: 'Coding', difficulty: 'MEDIUM',
                        question: 'How do you design a Many-to-Many relationship? Give SQL example.',
                        answer: `Many-to-Many requires a **junction table** with two foreign keys:\n\n\`\`\`sql\n-- Students can take many courses, courses have many students\nCREATE TABLE enrollments (\n  student_id INT REFERENCES students(id) ON DELETE CASCADE,\n  course_id  INT REFERENCES courses(id) ON DELETE CASCADE,\n  grade      CHAR(2),\n  PRIMARY KEY (student_id, course_id)\n);\n\`\`\`\n\nThe composite PK prevents duplicates (a student can't enroll in the same course twice). Additional columns (grade, enrolled_at) store relationship-specific data.`,
                        codeSnippet: `CREATE TABLE enrollments (\n  student_id INT REFERENCES students(id),\n  course_id  INT REFERENCES courses(id),\n  PRIMARY KEY (student_id, course_id)\n);`,
                        codeLanguage: 'sql',
                        tags: ['many-to-many', 'schema'],
                    },
                    {
                        order: 5, category: 'Conceptual', difficulty: 'HARD',
                        question: 'What are isolation levels? When would you use SERIALIZABLE?',
                        answer: `**Isolation levels** control how transactions interact:\n\n1. **READ UNCOMMITTED** — can see uncommitted data (dirty reads)\n2. **READ COMMITTED** — only sees committed data (default in PostgreSQL)\n3. **REPEATABLE READ** — same row returns same value within transaction (default in MySQL)\n4. **SERIALIZABLE** — complete isolation, as if transactions ran sequentially\n\n**Use SERIALIZABLE when:**\n- Financial transactions where correctness is critical\n- Race conditions could cause data corruption\n- You need absolute consistency over throughput\n\n**Trade-off:** SERIALIZABLE is slowest but safest.`,
                        tags: ['isolation', 'concurrency'],
                    },
                    {
                        order: 6, category: 'Tricky', difficulty: 'MEDIUM',
                        question: 'What is the difference between DELETE, TRUNCATE, and DROP?',
                        answer: `| Command | What It Does | Rollback? | Triggers? |\n|---------|-------------|-----------|----------|\n| **DELETE** | Removes specific rows (WHERE clause) | ✅ Yes | ✅ Yes |\n| **TRUNCATE** | Removes ALL rows (resets table) | ❌ No* | ❌ No |\n| **DROP** | Removes entire table (structure + data) | ❌ No | ❌ No |\n\n*TRUNCATE can be rolled back in PostgreSQL within a transaction.\n\n**Key:** DELETE is DML (logged per row, can rollback). TRUNCATE is DDL (much faster, resets auto-increment). DROP destroys the table entirely.`,
                        tags: ['delete-truncate-drop', 'must-know'],
                    },
                    {
                        order: 7, category: 'Conceptual', difficulty: 'EASY',
                        question: 'What is a foreign key and what does it enforce?',
                        answer: `A **foreign key** is a column (or set of columns) that references the **primary key** of another table. It enforces **referential integrity** — you can't have an order referencing a customer that doesn't exist.\n\n\`\`\`sql\nCREATE TABLE orders (\n  id SERIAL PRIMARY KEY,\n  customer_id INT REFERENCES customers(id)\n);\n\`\`\`\n\n**What it prevents:**\n- Inserting an order with a non-existent customer_id\n- Creating "orphan" rows (children without parents)\n\n**Cascading options:** ON DELETE CASCADE (auto-delete children), SET NULL, RESTRICT.`,
                        tags: ['foreign-key', 'constraints'],
                    },
                    {
                        order: 8, category: 'Conceptual', difficulty: 'HARD',
                        question: 'What is the logical execution order of a SQL query?',
                        answer: `SQL executes in this order (NOT the order you write it):\n\n1. **FROM / JOIN** — identify source tables\n2. **WHERE** — filter rows\n3. **GROUP BY** — create groups\n4. **HAVING** — filter groups\n5. **SELECT** — compute columns and expressions\n6. **DISTINCT** — remove duplicates\n7. **ORDER BY** — sort results\n8. **LIMIT / OFFSET** — paginate\n\n**Key gotcha:** You CANNOT use a SELECT alias in WHERE because WHERE runs first.\n\`\`\`sql\n-- ❌ FAILS: WHERE runs before SELECT\nSELECT salary * 12 AS annual FROM emp WHERE annual > 100000;\n-- ✅ WORKS: repeat the expression\nSELECT salary * 12 AS annual FROM emp WHERE salary * 12 > 100000;\n\`\`\``,
                        tags: ['execution-order', 'must-know'],
                    },
                    {
                        order: 9, category: 'Conceptual', difficulty: 'MEDIUM',
                        question: 'When would you denormalize a database?',
                        answer: `Denormalize when **read performance** outweighs the risk of anomalies:\n\n1. **Reporting/analytics tables** — pre-join data to avoid expensive runtime JOINs\n2. **Materialized views** — pre-computed aggregates refreshed periodically\n3. **High-read social feeds** — embed author name with posts\n4. **Search indexes** — denormalized documents in Elasticsearch\n5. **Caching** — redundant data in Redis for fast reads\n\n**Best practice:** Keep the transactional schema **normalized** (writes). Create **denormalized views/tables** for reads.\n\n> "Normalize for writes, denormalize for reads."`,
                        tags: ['denormalization', 'trade-offs'],
                    },
                ],
            },
            {
                order: 3,
                title: 'Mini Project: Design an E-Commerce Schema',
                type: 'PROJECT',
                content: `# Mini Project — Design an E-Commerce Database Schema

## Requirements

Design a complete database schema for an e-commerce platform with these entities:

### Tables Needed
1. **users** — id, name, email, created_at
2. **addresses** — id, user_id, street, city, state, zip, is_default (one user can have many addresses)
3. **categories** — id, name, parent_category_id (self-referencing for subcategories)
4. **products** — id, name, description, price, stock, category_id, created_at
5. **orders** — id, user_id, shipping_address_id, total, status, created_at
6. **order_items** — order_id, product_id, quantity, unit_price
7. **reviews** — id, user_id, product_id, rating (1-5), comment, created_at

### Requirements
- Proper PRIMARY KEYs on all tables
- FOREIGN KEYs with appropriate cascading behavior
- NOT NULL where appropriate
- CHECK constraints for validation (rating 1-5, price > 0, quantity > 0)
- DEFAULT values where sensible
- A composite UNIQUE on reviews (user_id, product_id) — one review per product per user

### Relationship Summary
- Users ↔ Addresses: 1:N
- Categories → Products: 1:N
- Categories → Categories: self-referencing (subcategories)
- Users ↔ Orders: 1:N
- Orders ↔ Order Items: 1:N
- Products ↔ Order Items: 1:N (M:N through order_items)
- Users ↔ Products (via Reviews): M:N through reviews

This is the type of schema design question asked in backend and data engineering interviews. Practice drawing the ERD first, then writing the SQL.`,
                stepData: {
                    projectType: 'MINI',
                    description: 'Design a complete e-commerce database schema with proper relationships, constraints, and cascading behavior.',
                },
            },
            {
                order: 4,
                title: 'What\'s Next: Unit 2 — Core SQL Queries',
                type: 'SUMMARY',
                content: `# Congratulations! Unit 1 Complete 🎉

## You've Mastered the Foundations

You now understand:
- What SQL is and how databases work
- ACID properties and transactions
- Data types, NULL, and constraints
- Normalization (1NF → 3NF)
- Schema design and table relationships
- Isolation levels and concurrency

## Next: Unit 2 — Writing SQL Queries

In Unit 2, you'll start writing real SQL:
- **SELECT, FROM, WHERE** — querying data
- **String, Date & Type Functions** — manipulating data
- **Aggregate Functions & GROUP BY** — summarizing data
- **CASE Statements** — conditional logic
- **INSERT, UPDATE, DELETE** — modifying data
- **ROLLUP, CUBE** — advanced grouping

This is where SQL gets hands-on! Every topic includes runnable code examples and coding challenges.`,
            },
        ],
    });

    console.log('✅ SQL Unit 1 seeded successfully!');

    // ═══════════════════════════════════════════════════════════════════════════
    // UNIT 2 — Core SQL: Writing Queries
    // ═══════════════════════════════════════════════════════════════════════════

    // ── Learn 2.1: SELECT, FROM, WHERE & Filtering Basics ──
    await createLearn({
        slug: 'sql-select-from-where-filtering',
        title: 'SELECT, FROM, WHERE & Filtering Basics',
        description: 'Master the fundamentals of querying data: SELECT columns, filter with WHERE, use comparison and logical operators, pattern matching with LIKE, range filtering with BETWEEN and IN, handle NULLs, sort with ORDER BY, and paginate with LIMIT/OFFSET.',
        difficulty: 'BEGINNER',
        topicSlug: 'sql-unit2-core-sql',
        unitTitle: 'Unit 2: Core SQL — Writing Queries',
        estimatedTime: 25,
        tags: ['select', 'where', 'filter', 'comparison', 'logical-operators', 'like', 'between', 'in', 'order-by', 'limit'],
        iconEmoji: '🔍',
        steps: [
            {
                order: 0,
                title: 'SELECT, FROM & WHERE — The Foundation',
                type: 'EXPLANATION',
                tips: [
                    'Every SQL query starts with SELECT ... FROM. WHERE is the filter.',
                    'Use aliases (AS) to make column names readable — interviewers notice clean SQL.',
                    'Always qualify column names with table aliases in multi-table queries.',
                ],
                content: `# SELECT, FROM, WHERE & Filtering Basics

## The Basic Query Structure

Every SQL query follows this pattern:

\`\`\`sql
SELECT columns      -- WHAT do you want to see?
FROM table           -- WHERE is the data?
WHERE condition;     -- WHICH rows do you want?
\`\`\`

---

## SELECT — Choosing Columns

\`\`\`sql
-- Select all columns
SELECT * FROM employees;

-- Select specific columns
SELECT first_name, last_name, salary FROM employees;

-- Select with expression
SELECT first_name, salary, salary * 12 AS annual_salary FROM employees;

-- Select with alias
SELECT first_name AS "First Name", last_name AS "Last Name" FROM employees;

-- Select unique values
SELECT DISTINCT department FROM employees;
\`\`\`

> ⚠️ **Avoid SELECT * in production** — it fetches unnecessary data, breaks if columns are added, and prevents covering index optimization.

---

## WHERE — Filtering Rows

### Comparison Operators

| Operator | Meaning | Example |
|----------|---------|---------|
| \`=\` | Equal to | \`WHERE age = 25\` |
| \`!=\` or \`<>\` | Not equal to | \`WHERE status != 'inactive'\` |
| \`<\` | Less than | \`WHERE price < 100\` |
| \`>\` | Greater than | \`WHERE salary > 50000\` |
| \`<=\` | Less than or equal | \`WHERE age <= 30\` |
| \`>=\` | Greater than or equal | \`WHERE rating >= 4.0\` |

### Logical Operators

\`\`\`sql
-- AND: both conditions must be true
SELECT * FROM employees
WHERE department = 'Engineering' AND salary > 80000;

-- OR: either condition must be true
SELECT * FROM products
WHERE category = 'Electronics' OR category = 'Computers';

-- NOT: negates a condition
SELECT * FROM customers
WHERE NOT city = 'Mumbai';

-- Combining (use parentheses for clarity!)
SELECT * FROM employees
WHERE (department = 'Engineering' OR department = 'Design')
  AND salary > 70000;
\`\`\`

> ⚠️ **Operator Precedence:** NOT > AND > OR. Always use parentheses to make intent clear.

---

## Pattern Matching & Range Filters

### LIKE — Pattern Matching

| Pattern | Matches | Example |
|---------|---------|---------|
| \`%\` | Any sequence of characters | \`LIKE '%kumar'\` → "Raj Kumar", "Kumar" |
| \`_\` | Any single character | \`LIKE '_at'\` → "Cat", "Bat", "Hat" |

\`\`\`sql
-- Names starting with 'A'
SELECT * FROM customers WHERE name LIKE 'A%';

-- Email from gmail
SELECT * FROM users WHERE email LIKE '%@gmail.com';

-- Exactly 5-letter names
SELECT * FROM users WHERE name LIKE '_____';
\`\`\`

### BETWEEN — Range Filtering

\`\`\`sql
-- Salary between 40000 and 80000 (inclusive)
SELECT * FROM employees WHERE salary BETWEEN 40000 AND 80000;
-- Equivalent to: WHERE salary >= 40000 AND salary <= 80000

-- Dates in 2024
SELECT * FROM orders WHERE order_date BETWEEN '2024-01-01' AND '2024-12-31';
\`\`\`

### IN — Set Membership

\`\`\`sql
-- Cities in a specific list
SELECT * FROM customers WHERE city IN ('Mumbai', 'Delhi', 'Bangalore');
-- Equivalent to: WHERE city = 'Mumbai' OR city = 'Delhi' OR city = 'Bangalore'

-- NOT IN
SELECT * FROM products WHERE category NOT IN ('Archived', 'Draft');
\`\`\`

---

## NULL Filtering

\`\`\`sql
-- Find rows where phone is missing
SELECT * FROM customers WHERE phone IS NULL;

-- Find rows where phone exists
SELECT * FROM customers WHERE phone IS NOT NULL;

-- ❌ WRONG: This returns nothing!
SELECT * FROM customers WHERE phone = NULL;
\`\`\`

---

## ORDER BY — Sorting Results

\`\`\`sql
-- Sort ascending (default)
SELECT * FROM employees ORDER BY salary ASC;

-- Sort descending
SELECT * FROM employees ORDER BY salary DESC;

-- Multi-column sort
SELECT * FROM employees ORDER BY department ASC, salary DESC;

-- Sort by expression
SELECT name, price, price * 0.9 AS sale_price FROM products ORDER BY sale_price;

-- Sort with NULLs control (PostgreSQL)
SELECT * FROM employees ORDER BY commission NULLS LAST;
\`\`\`

---

## LIMIT & OFFSET — Pagination

\`\`\`sql
-- Get first 10 results
SELECT * FROM products ORDER BY price DESC LIMIT 10;

-- Skip first 20, get next 10 (page 3)
SELECT * FROM products ORDER BY price DESC LIMIT 10 OFFSET 20;

-- SQL Server syntax (TOP)
SELECT TOP 10 * FROM products ORDER BY price DESC;

-- Standard SQL syntax (FETCH FIRST)
SELECT * FROM products ORDER BY price DESC
FETCH FIRST 10 ROWS ONLY;
\`\`\`

> ⚠️ **OFFSET pagination is slow on large tables** — it still scans skipped rows. For production, use **keyset pagination** (WHERE id > last_seen_id LIMIT 10).`,
            },
            {
                order: 1,
                title: 'SELECT & WHERE — Code Examples',
                type: 'CODE',
                content: '## Practical SELECT & WHERE Queries',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Basic Filtering & Sorting',
                        language: 'sql',
                        code: `-- Setup: employees table
-- (id, name, department, salary, hire_date, is_active)

-- 1. High-salary engineers
SELECT name, salary
FROM employees
WHERE department = 'Engineering'
  AND salary > 80000
ORDER BY salary DESC;

-- 2. Recent hires in 2024, sorted by date
SELECT name, department, hire_date
FROM employees
WHERE hire_date >= '2024-01-01'
ORDER BY hire_date DESC
LIMIT 20;

-- 3. Active employees NOT in Engineering or Sales
SELECT name, department, salary
FROM employees
WHERE is_active = TRUE
  AND department NOT IN ('Engineering', 'Sales')
ORDER BY name;`,
                        explanation: 'These queries demonstrate basic filtering with =, >, >=, NOT IN, combined with AND/OR. Always ORDER BY before LIMIT to get meaningful results.',
                        highlightLines: [5, 6, 7, 8, 14, 15],
                    },
                    {
                        order: 1,
                        title: 'Pattern Matching & Ranges',
                        language: 'sql',
                        code: `-- 1. Customers with Gmail addresses
SELECT name, email
FROM customers
WHERE email LIKE '%@gmail.com';

-- 2. Products priced between $10 and $50
SELECT name, price
FROM products
WHERE price BETWEEN 10.00 AND 50.00
ORDER BY price;

-- 3. Search by name (case-insensitive with LOWER)
SELECT name, email
FROM customers
WHERE LOWER(name) LIKE '%kumar%';

-- 4. Products with missing description
SELECT name, price
FROM products
WHERE description IS NULL;

-- 5. Complex filter with parentheses
SELECT name, department, salary
FROM employees
WHERE (department = 'Engineering' OR department = 'Design')
  AND salary BETWEEN 60000 AND 120000
  AND is_active = TRUE
ORDER BY salary DESC;`,
                        explanation: 'LIKE with % matches any characters. BETWEEN is inclusive on both ends. IS NULL checks for missing data. Parentheses control operator precedence — critical when mixing AND/OR.',
                        highlightLines: [4, 10, 16, 21, 26, 27],
                    },
                    {
                        order: 2,
                        title: 'DISTINCT, Aliases & Expressions',
                        language: 'sql',
                        code: `-- 1. All unique departments
SELECT DISTINCT department FROM employees ORDER BY department;

-- 2. Calculated columns with aliases
SELECT
    name,
    salary AS monthly_salary,
    salary * 12 AS annual_salary,
    salary * 12 * 0.3 AS estimated_tax
FROM employees
WHERE salary > 50000
ORDER BY annual_salary DESC;

-- 3. Count distinct values
SELECT COUNT(DISTINCT department) AS dept_count FROM employees;

-- 4. Concatenation with alias
SELECT
    first_name || ' ' || last_name AS full_name,
    email
FROM employees
ORDER BY full_name;`,
                        explanation: 'DISTINCT removes duplicates. AS creates readable aliases. Expressions in SELECT create computed columns. The || operator concatenates strings in PostgreSQL (use CONCAT() in MySQL).',
                        highlightLines: [2, 7, 8, 9, 15, 19],
                    },
                    {
                        order: 3,
                        title: 'Pagination Patterns',
                        language: 'sql',
                        code: `-- OFFSET pagination (simple but slow on large tables)
-- Page 1:
SELECT * FROM products ORDER BY id LIMIT 20 OFFSET 0;
-- Page 2:
SELECT * FROM products ORDER BY id LIMIT 20 OFFSET 20;
-- Page 3:
SELECT * FROM products ORDER BY id LIMIT 20 OFFSET 40;

-- Keyset pagination (fast, scalable)
-- Page 1:
SELECT * FROM products ORDER BY id LIMIT 20;
-- Page 2 (where 20 is the last id from page 1):
SELECT * FROM products WHERE id > 20 ORDER BY id LIMIT 20;
-- Page 3 (where 40 is the last id from page 2):
SELECT * FROM products WHERE id > 40 ORDER BY id LIMIT 20;`,
                        explanation: 'OFFSET pagination scans and discards rows (O(n) — slow for page 1000). Keyset pagination uses WHERE to jump directly to the starting point (O(1) — always fast). Use keyset for production APIs.',
                        highlightLines: [3, 5, 7, 11, 13, 15],
                    },
                ],
            },
            {
                order: 2,
                title: 'Quiz: SELECT, WHERE & Filtering',
                type: 'QUIZ',
                content: '## Test Your Query Writing Skills',
                quizQuestions: [
                    {
                        order: 0, difficulty: 'EASY',
                        question: 'What does SELECT DISTINCT do?',
                        options: [
                            { id: 'a', text: 'Selects rows where all columns are different', isCorrect: false },
                            { id: 'b', text: 'Removes duplicate rows from the result set', isCorrect: true },
                            { id: 'c', text: 'Selects only the first occurrence of each value', isCorrect: false },
                            { id: 'd', text: 'Sorts unique values', isCorrect: false },
                        ],
                        explanation: 'DISTINCT eliminates duplicate rows from the result. If SELECT DISTINCT city returns 5 cities, there are exactly 5 unique cities in the data.',
                    },
                    {
                        order: 1, difficulty: 'MEDIUM',
                        question: 'Which WHERE clause finds names starting with "A" and ending with "n"?',
                        options: [
                            { id: 'a', text: "WHERE name LIKE 'A%n'", isCorrect: true },
                            { id: 'b', text: "WHERE name LIKE '%A%n%'", isCorrect: false },
                            { id: 'c', text: "WHERE name LIKE 'A_n'", isCorrect: false },
                            { id: 'd', text: "WHERE name = 'A*n'", isCorrect: false },
                        ],
                        explanation: "'A%n' means: starts with A, then any characters (%), then ends with n. _ matches exactly one character, * is not a SQL wildcard.",
                    },
                    {
                        order: 2, difficulty: 'MEDIUM',
                        question: 'What does BETWEEN 10 AND 20 include?',
                        options: [
                            { id: 'a', text: 'Values from 11 to 19 (exclusive)', isCorrect: false },
                            { id: 'b', text: 'Values from 10 to 20 (inclusive)', isCorrect: true },
                            { id: 'c', text: 'Values from 10 to 19 (left inclusive)', isCorrect: false },
                            { id: 'd', text: 'Depends on the database', isCorrect: false },
                        ],
                        explanation: 'BETWEEN is inclusive on both ends. BETWEEN 10 AND 20 is equivalent to >= 10 AND <= 20.',
                    },
                    {
                        order: 3, difficulty: 'MEDIUM',
                        question: 'Why should you avoid OFFSET pagination on large tables?',
                        options: [
                            { id: 'a', text: 'It requires an index', isCorrect: false },
                            { id: 'b', text: 'It scans and discards all skipped rows, getting slower as offset increases', isCorrect: true },
                            { id: 'c', text: 'It locks the table', isCorrect: false },
                            { id: 'd', text: 'It doesn\'t work with ORDER BY', isCorrect: false },
                        ],
                        explanation: 'OFFSET 10000 LIMIT 10 still reads 10,010 rows, discarding the first 10,000. For page 1000 of 20 per page, that\'s 20,000 rows scanned. Keyset pagination (WHERE id > last_id) avoids this.',
                    },
                    {
                        order: 4, difficulty: 'EASY',
                        question: 'What is the result of: WHERE department = \'Eng\' OR department = \'Design\' AND salary > 80000?',
                        options: [
                            { id: 'a', text: 'Eng OR Design employees with salary > 80000', isCorrect: false },
                            { id: 'b', text: 'All Eng employees + Design employees with salary > 80000', isCorrect: true },
                            { id: 'c', text: 'Only employees with salary > 80000', isCorrect: false },
                            { id: 'd', text: 'Syntax error', isCorrect: false },
                        ],
                        explanation: 'AND has higher precedence than OR. So this evaluates as: department = \'Eng\' OR (department = \'Design\' AND salary > 80000). Use parentheses to be explicit!',
                    },
                ],
            },
            {
                order: 3,
                title: 'Challenge: Write Filtering Queries',
                type: 'CHALLENGE',
                content: `# Challenge: Customer Filtering Queries

Given a \`customers\` table with columns: id, name, email, city, signup_date, total_orders, is_premium

Write queries to find:

1. Premium customers from Mumbai or Delhi who signed up in 2024
2. Customers with more than 10 orders, sorted by total_orders descending, top 5
3. Customers whose name contains "sharma" (case-insensitive) and have a non-null email
4. All unique cities where premium customers exist`,
                stepData: {
                    challengeType: 'CODE',
                    language: 'sql',
                    starterCode: `-- Query 1: Premium customers from Mumbai/Delhi in 2024\n\n-- Query 2: Top 5 by orders\n\n-- Query 3: Name contains "sharma"\n\n-- Query 4: Unique premium cities`,
                    solution: `-- Query 1\nSELECT name, email, city, signup_date\nFROM customers\nWHERE is_premium = TRUE\n  AND city IN ('Mumbai', 'Delhi')\n  AND signup_date BETWEEN '2024-01-01' AND '2024-12-31'\nORDER BY signup_date DESC;\n\n-- Query 2\nSELECT name, total_orders\nFROM customers\nWHERE total_orders > 10\nORDER BY total_orders DESC\nLIMIT 5;\n\n-- Query 3\nSELECT name, email\nFROM customers\nWHERE LOWER(name) LIKE '%sharma%'\n  AND email IS NOT NULL;\n\n-- Query 4\nSELECT DISTINCT city\nFROM customers\nWHERE is_premium = TRUE\nORDER BY city;`,
                    hints: ['Use IN for multiple cities', 'BETWEEN works for date ranges', 'LOWER() for case-insensitive search'],
                },
            },
            {
                order: 4,
                title: 'Interview Questions: SELECT & WHERE',
                type: 'INTERVIEW_QUESTIONS',
                content: `# Interview Questions — Querying Fundamentals`,
                interviewCards: [
                    {
                        order: 0, category: 'Coding', difficulty: 'EASY',
                        question: 'Write a query to find the top 5 highest-paid employees in the Engineering department.',
                        answer: `\`\`\`sql\nSELECT name, salary\nFROM employees\nWHERE department = 'Engineering'\nORDER BY salary DESC\nLIMIT 5;\n\`\`\`\n\n**Key points:**\n- Filter first (WHERE), then sort (ORDER BY), then limit (LIMIT)\n- DESC for highest-first ordering\n- LIMIT 5 returns only the top 5`,
                        codeSnippet: `SELECT name, salary\nFROM employees\nWHERE department = 'Engineering'\nORDER BY salary DESC\nLIMIT 5;`,
                        codeLanguage: 'sql',
                        tags: ['select', 'order-by', 'limit'],
                    },
                    {
                        order: 1, category: 'Tricky', difficulty: 'MEDIUM',
                        question: 'What is the difference between WHERE and HAVING?',
                        answer: `**WHERE** filters individual **rows** BEFORE grouping.\n**HAVING** filters **groups** AFTER GROUP BY.\n\n\`\`\`sql\n-- WHERE: filter rows before grouping\nSELECT department, AVG(salary)\nFROM employees\nWHERE is_active = TRUE        -- filters ROWS\nGROUP BY department\nHAVING AVG(salary) > 60000;   -- filters GROUPS\n\`\`\`\n\n**Execution order:** FROM → WHERE → GROUP BY → HAVING → SELECT\n\n**Rule of thumb:**\n- Filter on non-aggregated columns → WHERE\n- Filter on aggregated results (COUNT, SUM, AVG) → HAVING`,
                        codeSnippet: `SELECT department, AVG(salary)\nFROM employees\nWHERE is_active = TRUE\nGROUP BY department\nHAVING AVG(salary) > 60000;`,
                        codeLanguage: 'sql',
                        tags: ['where-vs-having', 'top-question'],
                    },
                    {
                        order: 2, category: 'Tricky', difficulty: 'MEDIUM',
                        question: 'Why should you avoid SELECT * in production code?',
                        answer: `**Problems with SELECT *:**\n\n1. **Performance:** Fetches all columns including large TEXT/BLOB fields you may not need\n2. **Network overhead:** More data transferred between DB and app\n3. **Index bypass:** Prevents covering index optimization (index-only scans)\n4. **Fragility:** If someone adds a column, your app might break\n5. **Readability:** Unclear what data the query actually needs\n\n**Instead:**\n\`\`\`sql\n-- ❌ Bad\nSELECT * FROM users;\n\n-- ✅ Good\nSELECT id, name, email FROM users;\n\`\`\`\n\n**Exception:** \`SELECT *\` is fine for ad-hoc exploration in development.`,
                        tags: ['best-practices', 'performance'],
                    },
                ],
            },
            {
                order: 5,
                title: 'Summary: SELECT, FROM, WHERE',
                type: 'SUMMARY',
                keyTakeaways: [
                    'SELECT chooses columns; FROM specifies the table; WHERE filters rows',
                    'LIKE with % (any chars) and _ (one char) for pattern matching',
                    'BETWEEN is inclusive; IN matches a set of values',
                    'IS NULL / IS NOT NULL for NULL checks (never use = NULL)',
                    'ORDER BY sorts results; LIMIT/OFFSET paginates',
                    'Use keyset pagination (WHERE id > last_id) instead of OFFSET for large tables',
                    'Operator precedence: NOT > AND > OR — use parentheses!',
                ],
                content: `# Summary — SELECT, FROM, WHERE & Filtering

## Query Template

\`\`\`sql
SELECT columns
FROM table
WHERE conditions
ORDER BY column [ASC|DESC]
LIMIT n OFFSET m;
\`\`\`

## Key Operators
- Comparison: =, !=, <, >, <=, >=
- Logical: AND, OR, NOT
- Pattern: LIKE '%pattern%'
- Range: BETWEEN a AND b
- Set: IN ('a', 'b', 'c')
- NULL: IS NULL, IS NOT NULL`,
            },
        ],
    });

    // ── Learn 2.2: String, Date & Type Functions ──
    await createLearn({
        slug: 'sql-string-date-type-functions',
        title: 'String, Date & Type Functions',
        description: 'Master essential SQL functions: string manipulation (UPPER, LOWER, TRIM, SUBSTRING, CONCAT), date operations (NOW, DATE_DIFF, EXTRACT), type casting (CAST, CONVERT), and NULL handling (COALESCE, NULLIF).',
        difficulty: 'BEGINNER',
        topicSlug: 'sql-unit2-core-sql',
        unitTitle: 'Unit 2: Core SQL — Writing Queries',
        estimatedTime: 25,
        tags: ['string-functions', 'date-functions', 'type-casting', 'concat', 'coalesce', 'nullif'],
        iconEmoji: '🔤',
        steps: [
            {
                order: 0,
                title: 'String & Date Functions',
                type: 'EXPLANATION',
                tips: [
                    'COALESCE is your best friend for handling NULLs — use it everywhere.',
                    'Date function syntax varies between MySQL and PostgreSQL — know both for interviews.',
                    'TRIM is essential for cleaning user input data.',
                ],
                content: `# String, Date & Type Functions

## String Functions

| Function | What It Does | Example | Result |
|----------|-------------|---------|--------|
| \`UPPER(s)\` | Convert to uppercase | \`UPPER('hello')\` | \`'HELLO'\` |
| \`LOWER(s)\` | Convert to lowercase | \`LOWER('HELLO')\` | \`'hello'\` |
| \`TRIM(s)\` | Remove leading/trailing spaces | \`TRIM('  hi  ')\` | \`'hi'\` |
| \`LTRIM(s)\` / \`RTRIM(s)\` | Trim left/right only | \`LTRIM('  hi')\` | \`'hi'\` |
| \`LENGTH(s)\` | String length | \`LENGTH('hello')\` | \`5\` |
| \`SUBSTRING(s, start, len)\` | Extract part | \`SUBSTRING('hello', 2, 3)\` | \`'ell'\` |
| \`REPLACE(s, old, new)\` | Replace occurrences | \`REPLACE('foo bar', 'foo', 'baz')\` | \`'baz bar'\` |
| \`CONCAT(a, b, ...)\` | Join strings | \`CONCAT('Hello', ' ', 'World')\` | \`'Hello World'\` |
| \`LEFT(s, n)\` / \`RIGHT(s, n)\` | First/last n chars | \`LEFT('hello', 3)\` | \`'hel'\` |
| \`REVERSE(s)\` | Reverse a string | \`REVERSE('abc')\` | \`'cba'\` |
| \`POSITION(sub IN s)\` | Find substring position | \`POSITION('lo' IN 'hello')\` | \`4\` |

### String Concatenation Across Databases

\`\`\`sql
-- PostgreSQL: || operator
SELECT first_name || ' ' || last_name AS full_name FROM employees;

-- MySQL: CONCAT function
SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM employees;

-- CONCAT works in all databases (safest choice)
\`\`\`

---

## Date Functions

| Function | Description | Example |
|----------|------------|---------|
| \`NOW()\` / \`CURRENT_TIMESTAMP\` | Current date and time | \`2025-03-15 14:30:00\` |
| \`CURRENT_DATE\` | Current date only | \`2025-03-15\` |
| \`CURRENT_TIME\` | Current time only | \`14:30:00\` |
| \`EXTRACT(part FROM date)\` | Get year/month/day/etc | \`EXTRACT(YEAR FROM hire_date)\` |
| \`DATE_TRUNC(part, date)\` | Truncate to unit (PG) | \`DATE_TRUNC('month', NOW())\` |
| \`AGE(d1, d2)\` | Difference as interval (PG) | \`AGE(NOW(), hire_date)\` |
| \`DATE_ADD(d, INTERVAL)\` | Add time (MySQL) | \`DATE_ADD(NOW(), INTERVAL 30 DAY)\` |
| \`d + INTERVAL '30 days'\` | Add time (PostgreSQL) | \`NOW() + INTERVAL '30 days'\` |

### Date Examples

\`\`\`sql
-- Get year from a date
SELECT name, EXTRACT(YEAR FROM hire_date) AS hire_year FROM employees;

-- Employees hired in the last 90 days
SELECT * FROM employees
WHERE hire_date >= CURRENT_DATE - INTERVAL '90 days';

-- Group by month
SELECT DATE_TRUNC('month', order_date) AS month, COUNT(*)
FROM orders
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY month;
\`\`\`

---

## NULL Handling Functions

### COALESCE — Return First Non-NULL Value

\`\`\`sql
-- If phone is NULL, show 'N/A'
SELECT name, COALESCE(phone, 'N/A') AS phone FROM customers;

-- Chain multiple fallbacks
SELECT COALESCE(nickname, first_name, 'Anonymous') AS display_name FROM users;
\`\`\`

### NULLIF — Return NULL If Values Are Equal

\`\`\`sql
-- Avoid division by zero (returns NULL instead of error)
SELECT revenue / NULLIF(cost, 0) AS profit_ratio FROM sales;
-- If cost = 0, NULLIF returns NULL, and revenue / NULL = NULL (safe)
\`\`\`

---

## Type Casting

\`\`\`sql
-- CAST syntax (standard SQL)
SELECT CAST('42' AS INTEGER);
SELECT CAST(price AS VARCHAR);
SELECT CAST('2025-01-15' AS DATE);

-- PostgreSQL shorthand
SELECT '42'::INTEGER;
SELECT price::VARCHAR;

-- MySQL CONVERT
SELECT CONVERT('42', SIGNED INTEGER);
\`\`\`

### Implicit vs Explicit Casting

\`\`\`sql
-- Implicit: SQL auto-converts compatible types
SELECT '10' + 5;  -- 15 (string auto-cast to number in MySQL)

-- Explicit: you control the conversion
SELECT CAST('10' AS INT) + 5;  -- 15 (explicit, safer)
\`\`\`

> ⚠️ **Always prefer explicit casting** — implicit behavior varies across databases and can cause subtle bugs.`,
            },
            {
                order: 1,
                title: 'Functions — Code Examples',
                type: 'CODE',
                content: '## Practical Function Usage',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'String Manipulation',
                        language: 'sql',
                        code: `-- 1. Clean and format customer names
SELECT
    TRIM(UPPER(first_name)) || ' ' || TRIM(UPPER(last_name)) AS full_name,
    LOWER(email) AS clean_email,
    LENGTH(TRIM(first_name)) AS name_length
FROM customers;

-- 2. Extract domain from email
SELECT
    email,
    SUBSTRING(email FROM POSITION('@' IN email) + 1) AS domain
FROM users;

-- 3. Mask sensitive data
SELECT
    name,
    LEFT(email, 3) || '***' || SUBSTRING(email FROM POSITION('@' IN email)) AS masked_email,
    '****' || RIGHT(phone, 4) AS masked_phone
FROM customers;

-- 4. Search and replace
SELECT
    REPLACE(description, 'old_brand', 'new_brand') AS updated_desc
FROM products;`,
                        explanation: 'String functions are essential for data cleaning, formatting, and masking. POSITION finds where a character appears. SUBSTRING extracts parts. These patterns appear frequently in interview coding rounds.',
                        highlightLines: [3, 4, 11, 17, 18],
                    },
                    {
                        order: 1,
                        title: 'Date Operations',
                        language: 'sql',
                        code: `-- 1. Employee tenure in years
SELECT
    name,
    hire_date,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, hire_date)) AS years_worked
FROM employees;

-- 2. Orders in the last 30 days
SELECT * FROM orders
WHERE order_date >= CURRENT_DATE - INTERVAL '30 days';

-- 3. Monthly revenue report
SELECT
    DATE_TRUNC('month', order_date) AS month,
    COUNT(*) AS order_count,
    SUM(total) AS revenue
FROM orders
WHERE order_date >= '2024-01-01'
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY month;

-- 4. Day of week analysis
SELECT
    EXTRACT(DOW FROM order_date) AS day_of_week,
    COUNT(*) AS orders
FROM orders
GROUP BY EXTRACT(DOW FROM order_date)
ORDER BY day_of_week;
-- 0 = Sunday, 6 = Saturday`,
                        explanation: 'DATE_TRUNC groups dates by month/week/year. EXTRACT pulls out parts (YEAR, MONTH, DOW). AGE computes the interval between two dates. These are heavily used in analytics queries.',
                        highlightLines: [5, 10, 14, 24],
                    },
                    {
                        order: 2,
                        title: 'COALESCE & NULL Handling',
                        language: 'sql',
                        code: `-- 1. Display fallback values
SELECT
    name,
    COALESCE(phone, 'No phone') AS phone,
    COALESCE(department, 'Unassigned') AS department
FROM employees;

-- 2. Safe division (avoid divide-by-zero)
SELECT
    product_name,
    total_revenue,
    total_cost,
    total_revenue / NULLIF(total_cost, 0) AS roi
FROM product_metrics;

-- 3. Conditional NULL replacement
SELECT
    name,
    CASE
        WHEN salary IS NULL THEN 'Not disclosed'
        ELSE CAST(salary AS VARCHAR) || '/year'
    END AS salary_display
FROM employees;

-- 4. Count NULLs vs non-NULLs
SELECT
    COUNT(*) AS total_rows,
    COUNT(phone) AS has_phone,
    COUNT(*) - COUNT(phone) AS missing_phone
FROM customers;`,
                        explanation: 'COALESCE returns the first non-NULL argument. NULLIF returns NULL if two values are equal (essential for safe division). COUNT(*) vs COUNT(column) is the key to counting NULL vs non-NULL.',
                        highlightLines: [4, 5, 13, 29, 30],
                    },
                ],
            },
            {
                order: 2,
                title: 'MySQL vs PostgreSQL Syntax Comparison',
                type: 'COMPARISON',
                content: `# MySQL vs PostgreSQL — Function Differences

Many SQL functions have different syntax in MySQL vs PostgreSQL. Know both for interviews.`,
                stepData: {
                    items: [
                        { title: 'PostgreSQL', description: 'Standard-compliant with powerful extensions', pros: ['Standard SQL syntax', '|| for string concat', 'EXTRACT, DATE_TRUNC for dates', '::type for casting', 'INTERVAL arithmetic', 'POSITION(sub IN str)'], cons: ['Some functions verbose', 'No IFNULL (use COALESCE)'], useCase: 'Complex analytics, data engineering, when you want standard SQL' },
                        { title: 'MySQL', description: 'Simpler syntax with MySQL-specific functions', pros: ['CONCAT for strings (clearer)', 'DATE_ADD, DATE_SUB for dates', 'IFNULL as COALESCE shorthand', 'CONVERT for casting', 'GROUP_CONCAT for string aggregation'], cons: ['Non-standard extensions', 'Some functions differ from SQL standard', 'No DATE_TRUNC (use DATE_FORMAT)'], useCase: 'Web applications, read-heavy workloads, simpler query patterns' },
                    ],
                },
            },
            {
                order: 3,
                title: 'Quiz: Functions',
                type: 'QUIZ',
                content: '## Test Your Knowledge of SQL Functions',
                quizQuestions: [
                    {
                        order: 0, difficulty: 'EASY',
                        question: 'What does COALESCE(NULL, NULL, \'default\', \'other\') return?',
                        options: [
                            { id: 'a', text: 'NULL', isCorrect: false },
                            { id: 'b', text: "'default'", isCorrect: true },
                            { id: 'c', text: "'other'", isCorrect: false },
                            { id: 'd', text: 'Error', isCorrect: false },
                        ],
                        explanation: "COALESCE returns the first non-NULL argument. It skips the two NULLs and returns 'default'.",
                    },
                    {
                        order: 1, difficulty: 'MEDIUM',
                        question: 'How do you safely divide revenue by cost without a divide-by-zero error?',
                        options: [
                            { id: 'a', text: 'revenue / cost', isCorrect: false },
                            { id: 'b', text: 'revenue / COALESCE(cost, 1)', isCorrect: false },
                            { id: 'c', text: 'revenue / NULLIF(cost, 0)', isCorrect: true },
                            { id: 'd', text: 'IF(cost = 0, NULL, revenue / cost)', isCorrect: false },
                        ],
                        explanation: 'NULLIF(cost, 0) returns NULL when cost is 0. Then revenue / NULL = NULL (safe). COALESCE(cost, 1) would incorrectly divide by 1 when cost is NULL, not when it\'s 0.',
                    },
                    {
                        order: 2, difficulty: 'MEDIUM',
                        question: 'What does EXTRACT(MONTH FROM \'2024-07-15\') return?',
                        options: [
                            { id: 'a', text: "'July'", isCorrect: false },
                            { id: 'b', text: '7', isCorrect: true },
                            { id: 'c', text: "'07'", isCorrect: false },
                            { id: 'd', text: '2024', isCorrect: false },
                        ],
                        explanation: 'EXTRACT returns the numeric value of the specified date part. MONTH returns the month number (7 for July).',
                    },
                    {
                        order: 3, difficulty: 'EASY',
                        question: 'What does TRIM(\'  Hello  \') return?',
                        options: [
                            { id: 'a', text: "'  Hello'", isCorrect: false },
                            { id: 'b', text: "'Hello  '", isCorrect: false },
                            { id: 'c', text: "'Hello'", isCorrect: true },
                            { id: 'd', text: "'Hello'  (with trailing space)", isCorrect: false },
                        ],
                        explanation: 'TRIM removes BOTH leading and trailing whitespace. Use LTRIM/RTRIM to remove only left/right whitespace.',
                    },
                ],
            },
            {
                order: 4,
                title: 'Interview Questions: Functions',
                type: 'INTERVIEW_QUESTIONS',
                content: `# Interview Questions — SQL Functions`,
                interviewCards: [
                    {
                        order: 0, category: 'Coding', difficulty: 'MEDIUM',
                        question: 'What is the difference between COALESCE and NULLIF?',
                        answer: `**COALESCE(a, b, c, ...)** — Returns the **first non-NULL** value from the list.\n\`\`\`sql\nCOALESCE(NULL, NULL, 'default') → 'default'\nCOALESCE(phone, 'N/A')          → phone if non-NULL, else 'N/A'\n\`\`\`\n\n**NULLIF(a, b)** — Returns **NULL if a = b**, otherwise returns a.\n\`\`\`sql\nNULLIF(10, 10) → NULL\nNULLIF(10, 20) → 10\n\`\`\`\n\n**Most common use of NULLIF:** Prevent division by zero:\n\`\`\`sql\nSELECT revenue / NULLIF(cost, 0) FROM sales;\n-- If cost = 0 → NULL (safe)\n\`\`\``,
                        tags: ['coalesce', 'nullif', 'null-handling'],
                    },
                    {
                        order: 1, category: 'Coding', difficulty: 'MEDIUM',
                        question: 'How do you get the current month\'s orders grouped by day?',
                        answer: `\`\`\`sql\nSELECT\n  DATE_TRUNC('day', order_date) AS day,\n  COUNT(*) AS order_count,\n  SUM(total) AS daily_revenue\nFROM orders\nWHERE order_date >= DATE_TRUNC('month', CURRENT_DATE)\n  AND order_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'\nGROUP BY DATE_TRUNC('day', order_date)\nORDER BY day;\n\`\`\`\n\n**Key techniques:**\n- DATE_TRUNC('month', CURRENT_DATE) gives the 1st of current month\n- Adding INTERVAL '1 month' gives the 1st of next month\n- This avoids issues with month-end dates (28/29/30/31)`,
                        codeSnippet: `SELECT DATE_TRUNC('day', order_date) AS day,\n  COUNT(*) AS orders, SUM(total) AS revenue\nFROM orders\nWHERE order_date >= DATE_TRUNC('month', CURRENT_DATE)\nGROUP BY 1 ORDER BY 1;`,
                        codeLanguage: 'sql',
                        tags: ['date-functions', 'analytics'],
                    },
                ],
            },
            {
                order: 5,
                title: 'Summary: Functions',
                type: 'SUMMARY',
                keyTakeaways: [
                    'String: UPPER, LOWER, TRIM, CONCAT, SUBSTRING, REPLACE, LENGTH',
                    'Date: NOW(), CURRENT_DATE, EXTRACT, DATE_TRUNC, INTERVAL arithmetic',
                    'NULL handling: COALESCE (first non-NULL), NULLIF (return NULL if equal)',
                    'Casting: CAST(x AS type) or PostgreSQL x::type',
                    'Syntax differs between MySQL and PostgreSQL — know both',
                ],
                content: `# Summary — String, Date & Type Functions

## Most Important Functions for Interviews

- **COALESCE** — handle NULLs gracefully
- **NULLIF** — safe division (prevent divide-by-zero)
- **DATE_TRUNC** — group by time periods (PG)
- **EXTRACT** — pull date parts (YEAR, MONTH, DOW)
- **CAST** — explicit type conversion`,
            },
        ],
    });

    // ── Learn 2.3: Aggregate Functions & GROUP BY ──
    await createLearn({
        slug: 'sql-aggregate-functions-group-by',
        title: 'Aggregate Functions & GROUP BY',
        description: 'Master COUNT, SUM, AVG, MIN, MAX with GROUP BY and HAVING. Understand NULL behavior in aggregates, conditional aggregation with CASE, and the critical difference between WHERE (filters rows) and HAVING (filters groups).',
        difficulty: 'BEGINNER',
        topicSlug: 'sql-unit2-core-sql',
        unitTitle: 'Unit 2: Core SQL — Writing Queries',
        estimatedTime: 30,
        tags: ['aggregate', 'count', 'sum', 'avg', 'min', 'max', 'group-by', 'having'],
        iconEmoji: '📊',
        steps: [
            {
                order: 0,
                title: 'Aggregates & GROUP BY',
                type: 'EXPLANATION',
                tips: [
                    'COUNT(*) counts all rows. COUNT(column) counts non-NULL values. This distinction is crucial.',
                    'Every column in SELECT must either be in GROUP BY or inside an aggregate function.',
                    'WHERE filters rows BEFORE grouping. HAVING filters groups AFTER grouping.',
                ],
                content: `# Aggregate Functions & GROUP BY

## Aggregate Functions

Aggregate functions compute a **single value** from a set of rows.

| Function | What It Does | NULL Behavior |
|----------|-------------|--------------|
| \`COUNT(*)\` | Count all rows | Counts NULLs |
| \`COUNT(col)\` | Count non-NULL values | Skips NULLs |
| \`SUM(col)\` | Sum of values | Ignores NULLs |
| \`AVG(col)\` | Average of values | Ignores NULLs |
| \`MIN(col)\` | Minimum value | Ignores NULLs |
| \`MAX(col)\` | Maximum value | Ignores NULLs |

### NULL Behavior — Critical for Interviews

\`\`\`sql
-- Given: salaries = [50000, 60000, NULL, 70000]

SELECT COUNT(*)          FROM emp; -- 4 (counts all rows)
SELECT COUNT(salary)     FROM emp; -- 3 (skips NULL)
SELECT SUM(salary)       FROM emp; -- 180000 (ignores NULL)
SELECT AVG(salary)       FROM emp; -- 60000 (180000 / 3, NOT 180000 / 4)
\`\`\`

> ⚠️ **AVG ignores NULLs.** If 1 of 4 employees has NULL salary, AVG divides by 3, not 4. This can skew results.

---

## GROUP BY — Grouping Rows

GROUP BY collapses rows into **groups** based on column values, then applies aggregate functions per group.

\`\`\`sql
SELECT department, COUNT(*) AS emp_count, AVG(salary) AS avg_salary
FROM employees
GROUP BY department;
\`\`\`

Result:
| department | emp_count | avg_salary |
|-----------|----------|------------|
| Engineering | 25 | 95000 |
| Marketing | 15 | 72000 |
| Sales | 20 | 68000 |

### The Golden Rule

> **Every column in SELECT must either be in GROUP BY or inside an aggregate function.**

\`\`\`sql
-- ❌ WRONG: name is not in GROUP BY or an aggregate
SELECT department, name, COUNT(*)
FROM employees
GROUP BY department;

-- ✅ CORRECT:
SELECT department, COUNT(*), MIN(name), MAX(name)
FROM employees
GROUP BY department;
\`\`\`

---

## HAVING — Filtering Groups

WHERE filters **individual rows** (before grouping).
HAVING filters **groups** (after grouping).

\`\`\`sql
-- Departments with more than 10 employees and avg salary > 80k
SELECT department, COUNT(*) AS emp_count, AVG(salary) AS avg_sal
FROM employees
WHERE is_active = TRUE          -- filter ROWS (before grouping)
GROUP BY department
HAVING COUNT(*) > 10            -- filter GROUPS (after grouping)
   AND AVG(salary) > 80000;
\`\`\`

### WHERE vs HAVING Decision Tree

- Filtering on a **raw column** (not aggregated)? → **WHERE**
- Filtering on an **aggregate result** (COUNT, SUM, AVG)? → **HAVING**
- Can you put it in WHERE? → Do it! WHERE is faster (reduces rows before grouping)

---

## Conditional Aggregation

Use CASE inside aggregate functions to count/sum only matching rows:

\`\`\`sql
SELECT
    department,
    COUNT(*) AS total,
    COUNT(CASE WHEN salary > 80000 THEN 1 END) AS high_earners,
    SUM(CASE WHEN is_active THEN salary ELSE 0 END) AS active_payroll,
    ROUND(
        100.0 * COUNT(CASE WHEN is_active THEN 1 END) / COUNT(*),
        1
    ) AS active_pct
FROM employees
GROUP BY department;
\`\`\`

This is **extremely powerful** for building summary reports in a single query.`,
            },
            {
                order: 1,
                title: 'GROUP BY Mental Model',
                type: 'VISUALIZATION',
                content: `# How GROUP BY Works — Visual Model

## Step-by-Step GROUP BY Execution

\`\`\`mermaid
flowchart TD
    A["Original Table\n(all rows)"] --> B["1. FROM: Load all rows"]
    B --> C["2. WHERE: Filter individual rows"]
    C --> D["3. GROUP BY: Sort into buckets"]
    D --> E["4. Aggregate: COUNT, SUM, AVG per bucket"]
    E --> F["5. HAVING: Filter buckets"]
    F --> G["6. SELECT: Choose output columns"]
    G --> H["7. ORDER BY: Sort results"]

    style A fill:#6b7280,stroke:#333,color:#fff
    style D fill:#f97316,stroke:#333,color:#fff
    style E fill:#3b82f6,stroke:#333,color:#fff
    style F fill:#10b981,stroke:#333,color:#fff
\`\`\`

## GROUP BY Bucket Analogy

Think of GROUP BY as sorting items into labeled buckets:

\`\`\`
Raw data: [Eng:Alice, Eng:Bob, Sales:Carol, Eng:Dave, Sales:Eve]

GROUP BY department:
  ┌────────────┐  ┌────────────┐
  │ Engineering │  │   Sales    │
  │ Alice       │  │ Carol      │
  │ Bob         │  │ Eve        │
  │ Dave        │  │            │
  └────────────┘  └────────────┘
  COUNT(*) = 3     COUNT(*) = 2
  AVG(sal) = 90k   AVG(sal) = 70k
\`\`\`

Each bucket produces ONE row in the result. The aggregate functions summarize what's inside each bucket.`,
            },
            {
                order: 2,
                title: 'Aggregate & GROUP BY — Code Examples',
                type: 'CODE',
                content: '## Practical Aggregate Queries',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Basic Aggregates & GROUP BY',
                        language: 'sql',
                        code: `-- 1. Department statistics
SELECT
    department,
    COUNT(*) AS employee_count,
    ROUND(AVG(salary), 2) AS avg_salary,
    MIN(salary) AS min_salary,
    MAX(salary) AS max_salary,
    SUM(salary) AS total_payroll
FROM employees
WHERE is_active = TRUE
GROUP BY department
ORDER BY avg_salary DESC;

-- 2. Monthly order summary
SELECT
    DATE_TRUNC('month', order_date) AS month,
    COUNT(*) AS total_orders,
    COUNT(DISTINCT customer_id) AS unique_customers,
    SUM(total) AS revenue,
    ROUND(AVG(total), 2) AS avg_order_value
FROM orders
WHERE order_date >= '2024-01-01'
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY month;`,
                        explanation: 'Notice COUNT(*) vs COUNT(DISTINCT customer_id) — the first counts all orders, the second counts unique customers. ROUND formats decimal output. WHERE filters before grouping.',
                        highlightLines: [4, 5, 6, 7, 8, 18, 19, 20],
                    },
                    {
                        order: 1,
                        title: 'HAVING — Filtering Groups',
                        language: 'sql',
                        code: `-- 1. Departments with more than 5 employees
SELECT department, COUNT(*) AS emp_count
FROM employees
GROUP BY department
HAVING COUNT(*) > 5
ORDER BY emp_count DESC;

-- 2. Customers who spent more than $1000 total
SELECT
    customer_id,
    COUNT(*) AS order_count,
    SUM(total) AS total_spent
FROM orders
GROUP BY customer_id
HAVING SUM(total) > 1000
ORDER BY total_spent DESC;

-- 3. Products with average rating below 3 (quality issues)
SELECT
    product_id,
    COUNT(*) AS review_count,
    ROUND(AVG(rating), 1) AS avg_rating
FROM reviews
GROUP BY product_id
HAVING AVG(rating) < 3.0
   AND COUNT(*) >= 5  -- at least 5 reviews for significance
ORDER BY avg_rating;`,
                        explanation: 'HAVING filters on aggregate results. You can combine multiple HAVING conditions with AND/OR. The last example requires both a low average AND enough reviews to be meaningful.',
                        highlightLines: [5, 15, 25, 26],
                    },
                    {
                        order: 2,
                        title: 'Conditional Aggregation',
                        language: 'sql',
                        code: `-- 1. Pivot-style report: orders by status per month
SELECT
    DATE_TRUNC('month', order_date) AS month,
    COUNT(*) AS total,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending,
    ROUND(
        100.0 * COUNT(CASE WHEN status = 'completed' THEN 1 END) / COUNT(*),
        1
    ) AS completion_rate_pct
FROM orders
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY month;

-- 2. Employee salary bands per department
SELECT
    department,
    COUNT(CASE WHEN salary < 50000 THEN 1 END) AS "Under 50K",
    COUNT(CASE WHEN salary BETWEEN 50000 AND 100000 THEN 1 END) AS "50K-100K",
    COUNT(CASE WHEN salary > 100000 THEN 1 END) AS "Over 100K"
FROM employees
GROUP BY department
ORDER BY department;`,
                        explanation: 'Conditional aggregation uses CASE inside COUNT/SUM to create pivot-like reports in a single query. This is a very common interview pattern for analytics roles.',
                        highlightLines: [5, 6, 7, 8, 9, 18, 19, 20],
                    },
                ],
            },
            {
                order: 3,
                title: 'Quiz: Aggregate Functions',
                type: 'QUIZ',
                content: '## Test Your Knowledge of Aggregates & GROUP BY',
                quizQuestions: [
                    {
                        order: 0, difficulty: 'MEDIUM',
                        question: 'Given salaries [50000, 60000, NULL, 70000], what does AVG(salary) return?',
                        options: [
                            { id: 'a', text: '45000 (180000 / 4)', isCorrect: false },
                            { id: 'b', text: '60000 (180000 / 3)', isCorrect: true },
                            { id: 'c', text: 'NULL', isCorrect: false },
                            { id: 'd', text: 'Error', isCorrect: false },
                        ],
                        explanation: 'AVG ignores NULL values. It sums non-NULL values (180000) and divides by the count of non-NULL values (3), giving 60000.',
                    },
                    {
                        order: 1, difficulty: 'MEDIUM',
                        question: 'You want to find departments where average salary > $80,000. Where do you put this filter?',
                        options: [
                            { id: 'a', text: 'WHERE AVG(salary) > 80000', isCorrect: false },
                            { id: 'b', text: 'HAVING AVG(salary) > 80000', isCorrect: true },
                            { id: 'c', text: 'Either WHERE or HAVING', isCorrect: false },
                            { id: 'd', text: 'ORDER BY AVG(salary) > 80000', isCorrect: false },
                        ],
                        explanation: 'Aggregate filters must go in HAVING (after grouping). WHERE runs before GROUP BY and can\'t use aggregate functions. "WHERE AVG(salary)" is a syntax error.',
                    },
                    {
                        order: 2, difficulty: 'EASY',
                        question: 'What is the difference between COUNT(*) and COUNT(column)?',
                        options: [
                            { id: 'a', text: 'No difference', isCorrect: false },
                            { id: 'b', text: 'COUNT(*) is faster', isCorrect: false },
                            { id: 'c', text: 'COUNT(*) counts all rows; COUNT(column) skips NULLs', isCorrect: true },
                            { id: 'd', text: 'COUNT(*) counts unique rows', isCorrect: false },
                        ],
                        explanation: 'COUNT(*) counts every row regardless of NULL. COUNT(column) counts only rows where that column is NOT NULL.',
                    },
                    {
                        order: 3, difficulty: 'MEDIUM',
                        question: 'What does GROUP BY with COUNT(DISTINCT column) do?',
                        options: [
                            { id: 'a', text: 'Counts all non-null values in the column per group', isCorrect: false },
                            { id: 'b', text: 'Counts unique non-null values in the column per group', isCorrect: true },
                            { id: 'c', text: 'Removes duplicate groups', isCorrect: false },
                            { id: 'd', text: 'Same as COUNT(column)', isCorrect: false },
                        ],
                        explanation: 'COUNT(DISTINCT column) counts the number of unique, non-NULL values per group. For example, COUNT(DISTINCT customer_id) per month gives unique customers that month.',
                    },
                    {
                        order: 4, difficulty: 'HARD',
                        question: 'What does COUNT(CASE WHEN status = \'active\' THEN 1 END) do?',
                        options: [
                            { id: 'a', text: 'Counts all rows', isCorrect: false },
                            { id: 'b', text: 'Returns 1 if status is active', isCorrect: false },
                            { id: 'c', text: 'Counts only rows where status = \'active\'', isCorrect: true },
                            { id: 'd', text: 'Syntax error', isCorrect: false },
                        ],
                        explanation: 'CASE returns 1 for active rows and NULL for others (implicit ELSE NULL). COUNT skips NULLs, so it counts only active rows. This is conditional aggregation — very powerful for reports.',
                    },
                ],
            },
            {
                order: 4,
                title: 'Interview Questions: Aggregates',
                type: 'INTERVIEW_QUESTIONS',
                content: `# Interview Questions — Aggregates & GROUP BY`,
                interviewCards: [
                    {
                        order: 0, category: 'Coding', difficulty: 'MEDIUM',
                        question: 'Find the top 3 departments by total payroll, showing employee count and average salary.',
                        answer: `\`\`\`sql\nSELECT\n    department,\n    COUNT(*) AS emp_count,\n    SUM(salary) AS total_payroll,\n    ROUND(AVG(salary), 2) AS avg_salary\nFROM employees\nWHERE is_active = TRUE\nGROUP BY department\nORDER BY total_payroll DESC\nLIMIT 3;\n\`\`\`\n\n**Approach:**\n1. Filter active employees (WHERE)\n2. Group by department\n3. Compute aggregates\n4. Sort by total payroll descending\n5. Take top 3`,
                        codeSnippet: `SELECT department,\n  COUNT(*) AS emp_count,\n  SUM(salary) AS total_payroll,\n  ROUND(AVG(salary), 2) AS avg_salary\nFROM employees\nWHERE is_active = TRUE\nGROUP BY department\nORDER BY total_payroll DESC\nLIMIT 3;`,
                        codeLanguage: 'sql',
                        tags: ['group-by', 'aggregates', 'top-n'],
                    },
                    {
                        order: 1, category: 'Tricky', difficulty: 'HARD',
                        question: 'What is the difference between WHERE and HAVING? Can you use WHERE instead of HAVING?',
                        answer: `**WHERE** filters **rows** BEFORE grouping (operates on raw data).\n**HAVING** filters **groups** AFTER grouping (operates on aggregate results).\n\n**Can WHERE replace HAVING?** Only if the condition doesn't involve an aggregate:\n\`\`\`sql\n-- This HAVING can be rewritten as WHERE:\nHAVING department != 'Admin'\n→ WHERE department != 'Admin'  -- better! filters earlier\n\n-- This HAVING CANNOT be WHERE:\nHAVING COUNT(*) > 5  -- aggregate → must be HAVING\n\`\`\`\n\n**Performance tip:** Prefer WHERE over HAVING when possible — WHERE reduces rows before GROUP BY, so less work for the aggregation.`,
                        tags: ['where-vs-having', 'performance'],
                    },
                    {
                        order: 2, category: 'Coding', difficulty: 'MEDIUM',
                        question: 'Count how many orders are completed, cancelled, and pending — in a single query.',
                        answer: `Use **conditional aggregation** (CASE inside COUNT):\n\n\`\`\`sql\nSELECT\n    COUNT(*) AS total_orders,\n    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed,\n    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled,\n    COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending\nFROM orders;\n\`\`\`\n\nAlternative with SUM:\n\`\`\`sql\nSELECT\n    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,\n    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled\nFROM orders;\n\`\`\`\n\nBoth work. COUNT ignores NULLs (CASE returns NULL for non-matches). SUM adds 0 for non-matches.`,
                        codeSnippet: `SELECT\n  COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed,\n  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled,\n  COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending\nFROM orders;`,
                        codeLanguage: 'sql',
                        tags: ['conditional-aggregation', 'pivot'],
                    },
                ],
            },
            {
                order: 5,
                title: 'Summary: Aggregates & GROUP BY',
                type: 'SUMMARY',
                keyTakeaways: [
                    'COUNT(*) counts all rows; COUNT(column) skips NULLs; COUNT(DISTINCT col) counts unique non-NULLs',
                    'AVG/SUM/MIN/MAX all ignore NULLs — be aware of this for averages',
                    'GROUP BY creates buckets; every SELECT column must be grouped or aggregated',
                    'WHERE filters rows BEFORE grouping; HAVING filters groups AFTER',
                    'Conditional aggregation (CASE inside COUNT/SUM) creates pivot-style reports',
                ],
                content: `# Summary — Aggregates & GROUP BY

## Pattern

\`\`\`sql
SELECT group_col, AGG(value_col)
FROM table
WHERE row_filter
GROUP BY group_col
HAVING group_filter
ORDER BY AGG(value_col) DESC;
\`\`\``,
            },
        ],
    });

    // ── Learn 2.4: CASE Statements & Conditional Logic ──
    await createLearn({
        slug: 'sql-case-statements-conditional-logic',
        title: 'CASE Statements & Conditional Logic',
        description: 'Master SQL conditional logic with simple CASE, searched CASE, CASE in SELECT/WHERE/ORDER BY, pivoting with CASE + GROUP BY, and COALESCE as shorthand. Essential for analytics and reporting queries.',
        difficulty: 'BEGINNER',
        topicSlug: 'sql-unit2-core-sql',
        unitTitle: 'Unit 2: Core SQL — Writing Queries',
        estimatedTime: 20,
        tags: ['case', 'conditional', 'if', 'coalesce', 'nullif', 'pivot'],
        iconEmoji: '🔀',
        steps: [
            {
                order: 0,
                title: 'CASE Expressions Explained',
                type: 'EXPLANATION',
                content: `# CASE Statements & Conditional Logic

## Two Forms of CASE

### Simple CASE — Compare to Values

\`\`\`sql
CASE expression
    WHEN value1 THEN result1
    WHEN value2 THEN result2
    ELSE default_result
END
\`\`\`

\`\`\`sql
SELECT name,
    CASE department
        WHEN 'Engineering' THEN 'Tech'
        WHEN 'Design' THEN 'Tech'
        WHEN 'Marketing' THEN 'Business'
        WHEN 'Sales' THEN 'Business'
        ELSE 'Other'
    END AS division
FROM employees;
\`\`\`

### Searched CASE — Complex Conditions

\`\`\`sql
CASE
    WHEN condition1 THEN result1
    WHEN condition2 THEN result2
    ELSE default_result
END
\`\`\`

\`\`\`sql
SELECT name, salary,
    CASE
        WHEN salary >= 120000 THEN 'Senior'
        WHEN salary >= 80000  THEN 'Mid-Level'
        WHEN salary >= 50000  THEN 'Junior'
        ELSE 'Entry-Level'
    END AS salary_band
FROM employees;
\`\`\`

> **Order matters!** CASE evaluates conditions top-to-bottom and returns the first match. Put more specific conditions first.

---

## CASE in Different Clauses

### In SELECT (categorize output)
\`\`\`sql
SELECT name,
    CASE WHEN age < 30 THEN 'Young' ELSE 'Senior' END AS category
FROM employees;
\`\`\`

### In WHERE (conditional filtering)
\`\`\`sql
SELECT * FROM orders
WHERE CASE
    WHEN @user_role = 'admin' THEN TRUE
    WHEN @user_role = 'manager' THEN department = @user_dept
    ELSE user_id = @user_id
END;
\`\`\`

### In ORDER BY (custom sort order)
\`\`\`sql
SELECT name, status FROM tasks
ORDER BY CASE status
    WHEN 'urgent' THEN 1
    WHEN 'high' THEN 2
    WHEN 'normal' THEN 3
    WHEN 'low' THEN 4
END;
\`\`\`

### In GROUP BY with aggregation (Pivoting!)
\`\`\`sql
SELECT
    CASE
        WHEN age < 25 THEN '18-24'
        WHEN age < 35 THEN '25-34'
        WHEN age < 45 THEN '35-44'
        ELSE '45+'
    END AS age_group,
    COUNT(*) AS count,
    AVG(salary) AS avg_salary
FROM employees
GROUP BY 1
ORDER BY 1;
\`\`\`

---

## Pivoting Rows to Columns

One of the most powerful patterns: turning row values into columns.

\`\`\`sql
-- Turn order statuses into columns per month
SELECT
    DATE_TRUNC('month', order_date) AS month,
    SUM(CASE WHEN status = 'completed' THEN total ELSE 0 END) AS completed_revenue,
    SUM(CASE WHEN status = 'refunded' THEN total ELSE 0 END) AS refunded_amount,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_count,
    COUNT(CASE WHEN status = 'refunded' THEN 1 END) AS refunded_count
FROM orders
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY month;
\`\`\``,
            },
            {
                order: 1,
                title: 'CASE — Code Examples',
                type: 'CODE',
                content: '## CASE Expressions in Practice',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Salary Bands & Conditional Display',
                        language: 'sql',
                        code: `-- Categorize employees into salary bands
SELECT
    name,
    department,
    salary,
    CASE
        WHEN salary >= 150000 THEN 'Executive'
        WHEN salary >= 100000 THEN 'Senior'
        WHEN salary >= 70000  THEN 'Mid-Level'
        WHEN salary >= 40000  THEN 'Junior'
        ELSE 'Intern'
    END AS level,
    CASE
        WHEN salary >= 100000 THEN salary * 0.30
        WHEN salary >= 70000  THEN salary * 0.25
        ELSE salary * 0.20
    END AS estimated_tax
FROM employees
ORDER BY salary DESC;`,
                        explanation: 'CASE evaluates conditions top-to-bottom, returning the first match. Salary of 120000 matches "Senior" (second condition) and stops — it never reaches "Mid-Level". The tax CASE shows using CASE for computed values.',
                        highlightLines: [6, 7, 8, 9, 10, 14, 15, 16],
                    },
                    {
                        order: 1,
                        title: 'Pivot: Status Counts Per Department',
                        language: 'sql',
                        code: `-- Pivot employee status counts per department
SELECT
    department,
    COUNT(*) AS total,
    COUNT(CASE WHEN is_active = TRUE  THEN 1 END) AS active,
    COUNT(CASE WHEN is_active = FALSE THEN 1 END) AS inactive,
    ROUND(
        100.0 * COUNT(CASE WHEN is_active = TRUE THEN 1 END) / COUNT(*),
        1
    ) AS active_pct
FROM employees
GROUP BY department
ORDER BY active_pct DESC;

-- Result:
-- department  | total | active | inactive | active_pct
-- Engineering |    25 |     23 |        2 |       92.0
-- Marketing   |    15 |     12 |        3 |       80.0`,
                        explanation: 'This is the classic pivot pattern: CASE inside COUNT turns row values into column counts. The percentage calculation shows dividing two aggregates. This pattern is asked in almost every analytics interview.',
                        highlightLines: [5, 6, 7, 8],
                    },
                ],
            },
            {
                order: 2,
                title: 'Quiz: CASE Statements',
                type: 'QUIZ',
                content: '## Test Your CASE Statement Knowledge',
                quizQuestions: [
                    {
                        order: 0, difficulty: 'EASY',
                        question: 'In a searched CASE, what happens if no WHEN condition matches and there is no ELSE?',
                        options: [
                            { id: 'a', text: 'Error', isCorrect: false },
                            { id: 'b', text: 'Returns 0', isCorrect: false },
                            { id: 'c', text: 'Returns NULL', isCorrect: true },
                            { id: 'd', text: 'Returns empty string', isCorrect: false },
                        ],
                        explanation: 'If no WHEN matches and there is no ELSE, CASE returns NULL. Always include ELSE for explicit default handling.',
                    },
                    {
                        order: 1, difficulty: 'MEDIUM',
                        question: 'CASE WHEN salary >= 100000 THEN \'High\' WHEN salary >= 50000 THEN \'Mid\' END — what does salary = 120000 return?',
                        options: [
                            { id: 'a', text: "'Mid'", isCorrect: false },
                            { id: 'b', text: "'High'", isCorrect: true },
                            { id: 'c', text: "Both 'High' and 'Mid'", isCorrect: false },
                            { id: 'd', text: 'NULL', isCorrect: false },
                        ],
                        explanation: 'CASE evaluates top-to-bottom and returns the FIRST match. 120000 >= 100000 is TRUE, so it returns \'High\' and stops. It never checks the second condition.',
                    },
                    {
                        order: 2, difficulty: 'MEDIUM',
                        question: 'How do you pivot row values into columns?',
                        options: [
                            { id: 'a', text: 'Use PIVOT keyword', isCorrect: false },
                            { id: 'b', text: 'CASE inside aggregate functions + GROUP BY', isCorrect: true },
                            { id: 'c', text: 'Multiple JOINs to the same table', isCorrect: false },
                            { id: 'd', text: 'UNION ALL', isCorrect: false },
                        ],
                        explanation: 'The standard SQL pivot pattern uses CASE inside COUNT/SUM with GROUP BY. While some databases have a PIVOT keyword, CASE + GROUP BY works everywhere and is what interviewers expect.',
                    },
                ],
            },
            {
                order: 3,
                title: 'Interview Questions: CASE',
                type: 'INTERVIEW_QUESTIONS',
                content: `# Interview Questions — CASE Statements`,
                interviewCards: [
                    {
                        order: 0, category: 'Coding', difficulty: 'MEDIUM',
                        question: 'Write a query to categorize customers into tiers based on total spending.',
                        answer: `\`\`\`sql\nSELECT\n    c.name,\n    SUM(o.total) AS total_spent,\n    CASE\n        WHEN SUM(o.total) >= 10000 THEN 'Platinum'\n        WHEN SUM(o.total) >= 5000  THEN 'Gold'\n        WHEN SUM(o.total) >= 1000  THEN 'Silver'\n        ELSE 'Bronze'\n    END AS tier\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nGROUP BY c.id, c.name\nORDER BY total_spent DESC;\n\`\`\`\n\n**Key insight:** CASE is evaluated AFTER GROUP BY, so you can use aggregate results (SUM) inside CASE.`,
                        codeSnippet: `SELECT c.name, SUM(o.total) AS spent,\n  CASE\n    WHEN SUM(o.total) >= 10000 THEN 'Platinum'\n    WHEN SUM(o.total) >= 5000  THEN 'Gold'\n    WHEN SUM(o.total) >= 1000  THEN 'Silver'\n    ELSE 'Bronze'\n  END AS tier\nFROM customers c JOIN orders o ON c.id = o.customer_id\nGROUP BY c.id, c.name ORDER BY spent DESC;`,
                        codeLanguage: 'sql',
                        tags: ['case', 'aggregation', 'customer-segmentation'],
                    },
                ],
            },
            {
                order: 4,
                title: 'Summary: CASE Statements',
                type: 'SUMMARY',
                keyTakeaways: [
                    'Simple CASE compares one expression to values; Searched CASE evaluates conditions',
                    'CASE evaluates top-to-bottom, returns first match',
                    'No ELSE and no match → returns NULL',
                    'CASE works in SELECT, WHERE, ORDER BY, and inside aggregates',
                    'Pivot pattern: CASE inside COUNT/SUM + GROUP BY turns rows into columns',
                ],
                content: `# Summary — CASE Statements

## Key Patterns

1. **Categorize:** CASE in SELECT to create buckets
2. **Pivot:** CASE inside aggregates + GROUP BY
3. **Custom sort:** CASE in ORDER BY for priority ordering
4. **Conditional aggregation:** COUNT(CASE WHEN ... THEN 1 END)`,
            },
        ],
    });

    // ── Learn 2.5: INSERT, UPDATE, DELETE & MERGE ──
    await createLearn({
        slug: 'sql-insert-update-delete-merge',
        title: 'INSERT, UPDATE, DELETE & MERGE',
        description: 'Master data modification: INSERT single/multiple rows, INSERT from SELECT, UPDATE with JOIN, DELETE vs TRUNCATE vs DROP, MERGE/UPSERT, and safe modification practices with transactions.',
        difficulty: 'BEGINNER',
        topicSlug: 'sql-unit2-core-sql',
        unitTitle: 'Unit 2: Core SQL — Writing Queries',
        estimatedTime: 25,
        tags: ['insert', 'update', 'delete', 'truncate', 'merge', 'upsert', 'dml'],
        iconEmoji: '✏️',
        steps: [
            {
                order: 0,
                title: 'INSERT, UPDATE, DELETE — Complete Guide',
                type: 'EXPLANATION',
                content: `# INSERT, UPDATE, DELETE & MERGE

## INSERT — Adding Data

### Single Row
\`\`\`sql
INSERT INTO employees (name, department, salary, hire_date)
VALUES ('Alice Kumar', 'Engineering', 95000, '2025-01-15');
\`\`\`

### Multiple Rows
\`\`\`sql
INSERT INTO employees (name, department, salary)
VALUES
    ('Bob Patel', 'Engineering', 88000),
    ('Carol Sharma', 'Marketing', 72000),
    ('Dave Singh', 'Sales', 65000);
\`\`\`

### INSERT from SELECT (copy data)
\`\`\`sql
INSERT INTO employee_archive (name, department, salary)
SELECT name, department, salary
FROM employees
WHERE is_active = FALSE;
\`\`\`

### INSERT with RETURNING (PostgreSQL)
\`\`\`sql
INSERT INTO orders (customer_id, total)
VALUES (1, 99.99)
RETURNING id, customer_id, total;
-- Returns the inserted row — no need for a separate SELECT
\`\`\`

---

## UPDATE — Modifying Data

### Basic UPDATE
\`\`\`sql
UPDATE employees
SET salary = 100000
WHERE id = 42;
\`\`\`

### Update Multiple Columns
\`\`\`sql
UPDATE employees
SET salary = salary * 1.10,  -- 10% raise
    department = 'Senior Engineering',
    updated_at = NOW()
WHERE department = 'Engineering'
  AND hire_date < '2023-01-01';
\`\`\`

### UPDATE with JOIN (PostgreSQL)
\`\`\`sql
UPDATE orders o
SET status = 'cancelled'
FROM customers c
WHERE o.customer_id = c.id
  AND c.is_banned = TRUE;
\`\`\`

> ⚠️ **Always use WHERE with UPDATE!** \`UPDATE employees SET salary = 0\` without WHERE changes EVERY row.

---

## DELETE — Removing Data

### Basic DELETE
\`\`\`sql
DELETE FROM employees WHERE id = 42;
\`\`\`

### DELETE with Subquery
\`\`\`sql
DELETE FROM orders
WHERE customer_id IN (
    SELECT id FROM customers WHERE is_banned = TRUE
);
\`\`\`

---

## DELETE vs TRUNCATE vs DROP

| Command | Effect | Rollback? | Triggers? | Speed |
|---------|--------|-----------|-----------|-------|
| \`DELETE\` | Remove specific rows | ✅ Yes | ✅ Yes | Slow (row by row) |
| \`TRUNCATE\` | Remove ALL rows | ❌ No* | ❌ No | Fast (resets table) |
| \`DROP\` | Remove entire table | ❌ No | ❌ No | Instant |

*PostgreSQL allows TRUNCATE within a transaction.

\`\`\`sql
DELETE FROM logs WHERE created_at < '2023-01-01';  -- specific rows
TRUNCATE TABLE temp_data;                           -- all rows, reset counters
DROP TABLE old_archive;                             -- table gone entirely
\`\`\`

---

## MERGE / UPSERT — Insert or Update

### PostgreSQL: ON CONFLICT (UPSERT)
\`\`\`sql
INSERT INTO products (sku, name, price, stock)
VALUES ('SKU-001', 'Widget', 29.99, 100)
ON CONFLICT (sku)
DO UPDATE SET
    price = EXCLUDED.price,
    stock = EXCLUDED.stock;
-- If SKU-001 exists: update price and stock
-- If SKU-001 doesn't exist: insert new row
\`\`\`

### MySQL: ON DUPLICATE KEY UPDATE
\`\`\`sql
INSERT INTO products (sku, name, price, stock)
VALUES ('SKU-001', 'Widget', 29.99, 100)
ON DUPLICATE KEY UPDATE
    price = VALUES(price),
    stock = VALUES(stock);
\`\`\`

---

## Safe Modification Practices

1. **Always use WHERE** with UPDATE/DELETE (preview with SELECT first)
2. **Wrap in transactions** for multi-step changes
3. **Preview before modifying:** Run the WHERE clause as a SELECT first

\`\`\`sql
-- Step 1: Preview what will be affected
SELECT * FROM employees WHERE department = 'Old Dept';

-- Step 2: If it looks right, modify
BEGIN;
UPDATE employees SET department = 'New Dept' WHERE department = 'Old Dept';
-- Step 3: Verify
SELECT * FROM employees WHERE department = 'New Dept';
-- Step 4: Commit if correct
COMMIT;
-- Or ROLLBACK if wrong
\`\`\``,
            },
            {
                order: 1,
                title: 'DML Operations — Code Examples',
                type: 'CODE',
                content: '## Data Modification in Practice',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'INSERT Patterns',
                        language: 'sql',
                        code: `-- 1. Single row with all columns
INSERT INTO customers (name, email, city)
VALUES ('Priya Nair', 'priya@example.com', 'Kochi');

-- 2. Multiple rows (batch insert)
INSERT INTO products (name, price, category) VALUES
    ('USB Cable', 9.99, 'Electronics'),
    ('Notebook', 4.99, 'Office'),
    ('Water Bottle', 14.99, 'Lifestyle');

-- 3. Insert from query (archive old orders)
INSERT INTO orders_archive (id, customer_id, total, order_date)
SELECT id, customer_id, total, order_date
FROM orders
WHERE order_date < '2023-01-01';

-- 4. Insert with default values
INSERT INTO employees (name, department)
VALUES ('New Hire', 'Onboarding');
-- salary uses DEFAULT, hire_date uses DEFAULT CURRENT_DATE`,
                        explanation: 'Batch INSERT is much faster than individual INSERTs. INSERT...SELECT is perfect for archiving or migrating data. Columns with DEFAULT values can be omitted.',
                        highlightLines: [2, 6, 7, 8, 12, 13, 14],
                    },
                    {
                        order: 1,
                        title: 'UPDATE & DELETE Safely',
                        language: 'sql',
                        code: `-- Safe update: preview, modify, verify
-- Step 1: See what we're changing
SELECT id, name, salary FROM employees
WHERE department = 'Engineering' AND salary < 60000;

-- Step 2: Apply the change inside a transaction
BEGIN;
UPDATE employees
SET salary = 60000
WHERE department = 'Engineering' AND salary < 60000;
-- Affected: 5 rows

-- Step 3: Verify
SELECT id, name, salary FROM employees
WHERE department = 'Engineering' AND salary = 60000;

COMMIT;  -- or ROLLBACK if something looks wrong

-- Safe delete: count first
SELECT COUNT(*) FROM logs WHERE created_at < '2023-01-01';
-- Returns: 50000

DELETE FROM logs WHERE created_at < '2023-01-01';
-- Deleted: 50000 rows`,
                        explanation: 'Always preview with SELECT before UPDATE/DELETE. Wrap in BEGIN/COMMIT for safety. Check the count of affected rows matches your expectation.',
                        highlightLines: [7, 8, 9, 10, 22],
                    },
                ],
            },
            {
                order: 2,
                title: 'Quiz: Data Modification',
                type: 'QUIZ',
                content: '## Test Your DML Knowledge',
                quizQuestions: [
                    {
                        order: 0, difficulty: 'EASY',
                        question: 'What is the key difference between DELETE and TRUNCATE?',
                        options: [
                            { id: 'a', text: 'DELETE is faster', isCorrect: false },
                            { id: 'b', text: 'DELETE removes specific rows and can be rolled back; TRUNCATE removes all rows and is faster but not rollbackable', isCorrect: true },
                            { id: 'c', text: 'TRUNCATE works on specific rows', isCorrect: false },
                            { id: 'd', text: 'There is no difference', isCorrect: false },
                        ],
                        explanation: 'DELETE is DML (logged per row, rollbackable, fires triggers). TRUNCATE is DDL (removes all rows instantly, resets auto-increment, no triggers). Use DELETE for targeted removal, TRUNCATE for clearing entire tables.',
                    },
                    {
                        order: 1, difficulty: 'MEDIUM',
                        question: 'What happens if you run UPDATE employees SET salary = 0 without a WHERE clause?',
                        options: [
                            { id: 'a', text: 'Error — WHERE is required', isCorrect: false },
                            { id: 'b', text: 'Only the first row is updated', isCorrect: false },
                            { id: 'c', text: 'ALL employees get salary = 0', isCorrect: true },
                            { id: 'd', text: 'Nothing happens', isCorrect: false },
                        ],
                        explanation: 'Without WHERE, UPDATE applies to EVERY row in the table. This is one of the most dangerous mistakes in SQL — always double-check your WHERE clause.',
                    },
                    {
                        order: 2, difficulty: 'MEDIUM',
                        question: 'What does ON CONFLICT DO UPDATE (PostgreSQL UPSERT) do?',
                        options: [
                            { id: 'a', text: 'Always updates existing rows', isCorrect: false },
                            { id: 'b', text: 'Inserts if the row doesn\'t exist; updates if it does', isCorrect: true },
                            { id: 'c', text: 'Throws an error on conflict', isCorrect: false },
                            { id: 'd', text: 'Deletes the conflicting row', isCorrect: false },
                        ],
                        explanation: 'UPSERT (INSERT ON CONFLICT DO UPDATE) is "insert or update" in one atomic operation. If the row exists (based on unique/PK constraint), it updates. Otherwise, it inserts. Essential for idempotent data syncing.',
                    },
                    {
                        order: 3, difficulty: 'EASY',
                        question: 'What does INSERT...RETURNING (PostgreSQL) do?',
                        options: [
                            { id: 'a', text: 'Rolls back the insert', isCorrect: false },
                            { id: 'b', text: 'Returns the inserted row data (including generated IDs)', isCorrect: true },
                            { id: 'c', text: 'Inserts and then selects all rows', isCorrect: false },
                            { id: 'd', text: 'Only works with SERIAL columns', isCorrect: false },
                        ],
                        explanation: 'RETURNING gives you the inserted row immediately — including auto-generated values like SERIAL IDs. Eliminates the need for a separate SELECT to get the new ID.',
                    },
                ],
            },
            {
                order: 3,
                title: 'Interview Questions: DML',
                type: 'INTERVIEW_QUESTIONS',
                content: `# Interview Questions — INSERT, UPDATE, DELETE`,
                interviewCards: [
                    {
                        order: 0, category: 'Conceptual', difficulty: 'EASY',
                        question: 'What is the difference between DELETE, TRUNCATE, and DROP?',
                        answer: `| Command | What It Removes | Rollback? | Fires Triggers? | Speed |\n|---------|----------------|-----------|-----------------|-------|\n| **DELETE** | Specific rows (WHERE) | ✅ Yes | ✅ Yes | Slow |\n| **TRUNCATE** | ALL rows | ❌ No* | ❌ No | Fast |\n| **DROP** | Entire table (structure + data) | ❌ No | ❌ No | Instant |\n\n*PostgreSQL allows TRUNCATE in transactions.\n\n**Use cases:**\n- DELETE: Remove specific records (expired sessions, banned users)\n- TRUNCATE: Clear staging/temp tables between ETL runs\n- DROP: Remove unused tables entirely`,
                        tags: ['delete-truncate-drop', 'must-know'],
                    },
                    {
                        order: 1, category: 'Coding', difficulty: 'MEDIUM',
                        question: 'How do you implement UPSERT (insert or update) in PostgreSQL?',
                        answer: `Use \`INSERT ... ON CONFLICT ... DO UPDATE\`:\n\n\`\`\`sql\nINSERT INTO inventory (sku, name, quantity)\nVALUES ('SKU-001', 'Widget', 50)\nON CONFLICT (sku)\nDO UPDATE SET\n    quantity = inventory.quantity + EXCLUDED.quantity,\n    updated_at = NOW();\n\`\`\`\n\n**EXCLUDED** refers to the row that was attempted to be inserted.\n\n**ON CONFLICT (sku)** specifies which unique constraint triggers the upsert.\n\n**Why it matters:** Upserts are essential for idempotent data pipelines — you can safely re-run imports without duplicating data.`,
                        codeSnippet: `INSERT INTO inventory (sku, name, quantity)\nVALUES ('SKU-001', 'Widget', 50)\nON CONFLICT (sku) DO UPDATE SET\n    quantity = inventory.quantity + EXCLUDED.quantity;`,
                        codeLanguage: 'sql',
                        tags: ['upsert', 'on-conflict', 'idempotent'],
                    },
                ],
            },
            {
                order: 4,
                title: 'Summary: Data Modification',
                type: 'SUMMARY',
                keyTakeaways: [
                    'INSERT: single row, batch, from SELECT, with RETURNING',
                    'UPDATE: always use WHERE; preview with SELECT first; wrap in transactions',
                    'DELETE removes specific rows (rollbackable); TRUNCATE removes all (fast); DROP removes the table',
                    'UPSERT: INSERT ON CONFLICT DO UPDATE (PostgreSQL) / ON DUPLICATE KEY UPDATE (MySQL)',
                    'Safe practice: SELECT first, BEGIN, modify, verify, COMMIT/ROLLBACK',
                ],
                content: `# Summary — INSERT, UPDATE, DELETE

## Safety Checklist

1. ✅ Preview with SELECT + same WHERE clause
2. ✅ Wrap in BEGIN/COMMIT transaction
3. ✅ Check affected row count matches expectation
4. ✅ ROLLBACK if anything looks wrong
5. ❌ Never UPDATE/DELETE without WHERE in production`,
            },
        ],
    });

    // ── Learn 2.6: ROLLUP, CUBE & Advanced Grouping ──
    await createLearn({
        slug: 'sql-rollup-cube-advanced-grouping',
        title: 'ROLLUP, CUBE & Advanced Grouping',
        description: 'Master advanced grouping: ROLLUP for hierarchical subtotals, CUBE for all possible combinations, GROUPING SETS for custom groupings, and the GROUPING() function. Essential for reporting and analytics.',
        difficulty: 'INTERMEDIATE',
        topicSlug: 'sql-unit2-core-sql',
        unitTitle: 'Unit 2: Core SQL — Writing Queries',
        estimatedTime: 20,
        tags: ['rollup', 'cube', 'grouping-sets', 'subtotals', 'analytics', 'reporting'],
        iconEmoji: '📈',
        steps: [
            {
                order: 0,
                title: 'Advanced Grouping Explained',
                type: 'EXPLANATION',
                content: `# ROLLUP, CUBE & Advanced Grouping

## Why Advanced Grouping?

Standard GROUP BY gives you one level of grouping. But reports often need **subtotals** and **grand totals**. ROLLUP, CUBE, and GROUPING SETS solve this.

---

## ROLLUP — Hierarchical Subtotals

ROLLUP creates **subtotals from right to left** plus a **grand total**.

\`\`\`sql
SELECT
    region,
    category,
    SUM(revenue) AS total_revenue
FROM sales
GROUP BY ROLLUP(region, category)
ORDER BY region, category;
\`\`\`

Result:
| region | category | total_revenue |
|--------|----------|--------------|
| East | Electronics | 50000 |
| East | Clothing | 30000 |
| East | **NULL** | **80000** ← subtotal for East |
| West | Electronics | 45000 |
| West | Clothing | 35000 |
| West | **NULL** | **80000** ← subtotal for West |
| **NULL** | **NULL** | **160000** ← grand total |

ROLLUP(a, b) produces groups: (a, b), (a), ()

---

## CUBE — All Combinations

CUBE creates subtotals for **every possible combination** of the grouping columns.

\`\`\`sql
SELECT region, category, SUM(revenue) AS total
FROM sales
GROUP BY CUBE(region, category);
\`\`\`

CUBE(a, b) produces: (a, b), (a), (b), () — all 2^n combinations.

This gives you:
- Revenue by region AND category
- Revenue by region only (subtotal)
- Revenue by category only (subtotal)
- Grand total

---

## GROUPING SETS — Custom Combinations

When you want specific groupings (not all):

\`\`\`sql
SELECT region, category, SUM(revenue)
FROM sales
GROUP BY GROUPING SETS (
    (region, category),  -- detail
    (region),            -- region subtotal
    ()                   -- grand total
);
\`\`\`

---

## GROUPING() Function

How do you tell if a NULL is a subtotal row or actual NULL data? Use GROUPING():

\`\`\`sql
SELECT
    CASE WHEN GROUPING(region) = 1 THEN 'ALL REGIONS' ELSE region END AS region,
    CASE WHEN GROUPING(category) = 1 THEN 'ALL CATEGORIES' ELSE category END AS category,
    SUM(revenue) AS total
FROM sales
GROUP BY ROLLUP(region, category);
\`\`\`

GROUPING(column) returns 1 if the row is a subtotal for that column, 0 if it's a regular group.`,
            },
            {
                order: 1,
                title: 'Advanced Grouping — Code Examples',
                type: 'CODE',
                content: '## ROLLUP, CUBE & GROUPING SETS in Action',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Sales Report with ROLLUP',
                        language: 'sql',
                        code: `-- Monthly sales report with subtotals and grand total
SELECT
    COALESCE(region, '*** TOTAL ***') AS region,
    COALESCE(product_category, '** All Categories **') AS category,
    COUNT(*) AS num_orders,
    SUM(amount) AS total_revenue,
    ROUND(AVG(amount), 2) AS avg_order
FROM orders
GROUP BY ROLLUP(region, product_category)
ORDER BY
    GROUPING(region),
    region,
    GROUPING(product_category),
    product_category;`,
                        explanation: 'ROLLUP creates hierarchical subtotals. COALESCE replaces NULL subtotal markers with readable labels. ORDER BY with GROUPING() keeps subtotals after their detail rows.',
                        highlightLines: [3, 4, 9, 11, 13],
                    },
                    {
                        order: 1,
                        title: 'CUBE for Complete Analysis',
                        language: 'sql',
                        code: `-- Revenue analysis by quarter and product
SELECT
    CASE WHEN GROUPING(quarter) = 1 THEN 'All Quarters' ELSE quarter END AS quarter,
    CASE WHEN GROUPING(product) = 1 THEN 'All Products' ELSE product END AS product,
    SUM(revenue) AS total_revenue,
    COUNT(*) AS transactions
FROM quarterly_sales
GROUP BY CUBE(quarter, product)
ORDER BY GROUPING(quarter), quarter, GROUPING(product), product;

-- Produces:
-- Q1 + ProductA, Q1 + ProductB, Q1 + All Products (subtotal)
-- Q2 + ProductA, Q2 + ProductB, Q2 + All Products (subtotal)
-- All Quarters + ProductA, All Quarters + ProductB (cross-totals)
-- All Quarters + All Products (grand total)`,
                        explanation: 'CUBE gives you every combination of subtotals — both row-wise and column-wise. GROUPING() distinguishes real NULLs from subtotal markers.',
                        highlightLines: [3, 4, 8],
                    },
                ],
            },
            {
                order: 2,
                title: 'ROLLUP vs CUBE vs GROUPING SETS',
                type: 'COMPARISON',
                content: `# Comparing Advanced Grouping Options`,
                stepData: {
                    items: [
                        { title: 'ROLLUP', description: 'Hierarchical subtotals from right to left, plus grand total', pros: ['Perfect for hierarchical reports (region → city → store)', 'Intuitive for drill-down reports', 'Fewer rows than CUBE'], cons: ['Only produces hierarchical subtotals', 'Can\'t get cross-dimension totals'], useCase: 'Sales reports by region/category, time-based rollups (year → month → day)' },
                        { title: 'CUBE', description: 'All possible subtotal combinations (2^n groups)', pros: ['Complete cross-tabulation', 'Every subtotal combination'], cons: ['Can produce many rows (2^n)', 'May include unnecessary groupings'], useCase: 'Executive dashboards, pivot tables, multi-dimensional analysis' },
                        { title: 'GROUPING SETS', description: 'Custom-defined grouping combinations', pros: ['Full control over which groupings to produce', 'Most flexible', 'Can replicate ROLLUP/CUBE behavior'], cons: ['More verbose syntax', 'Must manually define each combination'], useCase: 'When you need specific groupings that don\'t fit ROLLUP or CUBE patterns' },
                    ],
                },
            },
            {
                order: 3,
                title: 'Quiz: Advanced Grouping',
                type: 'QUIZ',
                content: '## Test Your Advanced Grouping Knowledge',
                quizQuestions: [
                    {
                        order: 0, difficulty: 'MEDIUM',
                        question: 'ROLLUP(region, category) produces which groupings?',
                        options: [
                            { id: 'a', text: '(region, category) and () only', isCorrect: false },
                            { id: 'b', text: '(region, category), (region), and ()', isCorrect: true },
                            { id: 'c', text: '(region, category), (region), (category), and ()', isCorrect: false },
                            { id: 'd', text: '(region) and (category) only', isCorrect: false },
                        ],
                        explanation: 'ROLLUP removes columns right-to-left: (region, category) → (region) → (). It does NOT produce (category) alone — that\'s what CUBE does.',
                    },
                    {
                        order: 1, difficulty: 'MEDIUM',
                        question: 'How many grouping combinations does CUBE(a, b, c) produce?',
                        options: [
                            { id: 'a', text: '3', isCorrect: false },
                            { id: 'b', text: '4', isCorrect: false },
                            { id: 'c', text: '8', isCorrect: true },
                            { id: 'd', text: '6', isCorrect: false },
                        ],
                        explanation: 'CUBE produces 2^n combinations. With 3 columns: 2^3 = 8 groupings: (a,b,c), (a,b), (a,c), (b,c), (a), (b), (c), ().',
                    },
                    {
                        order: 2, difficulty: 'MEDIUM',
                        question: 'What does GROUPING(column) return?',
                        options: [
                            { id: 'a', text: 'The grouped value', isCorrect: false },
                            { id: 'b', text: '1 if the row is a subtotal for that column, 0 otherwise', isCorrect: true },
                            { id: 'c', text: 'The count of the group', isCorrect: false },
                            { id: 'd', text: 'The group number', isCorrect: false },
                        ],
                        explanation: 'GROUPING(column) returns 1 when the NULL in that column represents a subtotal (aggregated away), and 0 for normal grouped rows. It distinguishes subtotal NULLs from actual NULL data.',
                    },
                ],
            },
            {
                order: 4,
                title: 'Summary: Advanced Grouping',
                type: 'SUMMARY',
                keyTakeaways: [
                    'ROLLUP: hierarchical subtotals (right-to-left removal) + grand total',
                    'CUBE: all 2^n combinations of subtotals',
                    'GROUPING SETS: manually specify which groupings you want',
                    'GROUPING() function: 1 for subtotal rows, 0 for normal rows',
                    'Use COALESCE or CASE with GROUPING() to label subtotal rows',
                ],
                content: `# Summary — ROLLUP, CUBE & GROUPING SETS

## Quick Comparison

| Feature | ROLLUP(a,b) | CUBE(a,b) | GROUPING SETS((a,b),(a),()) |
|---------|------------|----------|----------------------------|
| (a, b) | ✅ | ✅ | ✅ |
| (a) | ✅ | ✅ | ✅ |
| (b) | ❌ | ✅ | ❌ |
| () | ✅ | ✅ | ✅ |`,
            },
        ],
    });

    // ── Learn 2.7: Unit 2 Review — Core SQL Quiz & Mock Interview ──
    await createLearn({
        slug: 'sql-unit2-review-core-sql',
        title: 'Unit 2 Review — Core SQL Quiz & Interview Prep',
        description: 'Comprehensive review of Unit 2: SELECT/WHERE, string/date functions, aggregates, GROUP BY/HAVING, CASE statements, INSERT/UPDATE/DELETE, ROLLUP/CUBE. 15 quiz questions and interview flashcards.',
        difficulty: 'INTERMEDIATE',
        topicSlug: 'sql-unit2-core-sql',
        unitTitle: 'Unit 2: Core SQL — Writing Queries',
        estimatedTime: 35,
        tags: ['review', 'quiz', 'interview-prep', 'unit2', 'core-sql'],
        iconEmoji: '🎯',
        steps: [
            {
                order: 0,
                title: 'Unit 2 Recap',
                type: 'SUMMARY',
                content: `# Unit 2 Recap — Core SQL: Writing Queries

## What We Covered

### Learn 2.1: SELECT, FROM, WHERE & Filtering
- SELECT columns, expressions, aliases, DISTINCT
- WHERE with comparison, logical operators
- LIKE, BETWEEN, IN, IS NULL
- ORDER BY, LIMIT/OFFSET, keyset pagination

### Learn 2.2: String, Date & Type Functions
- String: UPPER, LOWER, TRIM, CONCAT, SUBSTRING, REPLACE
- Date: NOW, EXTRACT, DATE_TRUNC, INTERVAL
- COALESCE, NULLIF for NULL handling
- CAST for type conversion

### Learn 2.3: Aggregate Functions & GROUP BY
- COUNT(*) vs COUNT(col) vs COUNT(DISTINCT col)
- SUM, AVG, MIN, MAX — NULL behavior
- GROUP BY with HAVING
- Conditional aggregation (CASE in COUNT/SUM)

### Learn 2.4: CASE Statements
- Simple CASE vs Searched CASE
- CASE in SELECT, WHERE, ORDER BY
- Pivot pattern: CASE + GROUP BY

### Learn 2.5: INSERT, UPDATE, DELETE & MERGE
- INSERT single, batch, from SELECT
- UPDATE with JOIN, safe practices
- DELETE vs TRUNCATE vs DROP
- UPSERT: ON CONFLICT DO UPDATE

### Learn 2.6: ROLLUP, CUBE & Advanced Grouping
- ROLLUP for hierarchical subtotals
- CUBE for all combinations
- GROUPING SETS for custom groupings
- GROUPING() function`,
                keyTakeaways: [
                    'Master SELECT/WHERE for any filtering pattern',
                    'COALESCE and NULLIF are essential for NULL handling',
                    'GROUP BY + HAVING for aggregate filtering',
                    'CASE inside aggregates creates pivot-style reports',
                    'Always preview before UPDATE/DELETE; use transactions',
                    'ROLLUP/CUBE/GROUPING SETS for reporting subtotals',
                ],
            },
            {
                order: 1,
                title: 'Comprehensive Quiz — Unit 2 Core SQL',
                type: 'QUIZ',
                content: '## Unit 2 Comprehensive Quiz — 15 Questions',
                quizQuestions: [
                    {
                        order: 0, difficulty: 'EASY',
                        question: 'What does SELECT DISTINCT city FROM customers return?',
                        options: [
                            { id: 'a', text: 'All customer rows', isCorrect: false },
                            { id: 'b', text: 'One row per unique city', isCorrect: true },
                            { id: 'c', text: 'Only the first customer from each city', isCorrect: false },
                            { id: 'd', text: 'An error', isCorrect: false },
                        ],
                        explanation: 'DISTINCT removes duplicate values from the result, returning one row per unique city.',
                    },
                    {
                        order: 1, difficulty: 'MEDIUM',
                        question: 'What does COALESCE(NULL, 0, 5) return?',
                        options: [
                            { id: 'a', text: 'NULL', isCorrect: false },
                            { id: 'b', text: '0', isCorrect: true },
                            { id: 'c', text: '5', isCorrect: false },
                            { id: 'd', text: 'Error', isCorrect: false },
                        ],
                        explanation: 'COALESCE returns the first non-NULL value. NULL is skipped, 0 is non-NULL, so it returns 0.',
                    },
                    {
                        order: 2, difficulty: 'MEDIUM',
                        question: 'What is wrong with: SELECT department, name, COUNT(*) FROM employees GROUP BY department;',
                        options: [
                            { id: 'a', text: 'COUNT(*) can\'t be used with GROUP BY', isCorrect: false },
                            { id: 'b', text: 'name is not in GROUP BY or an aggregate function', isCorrect: true },
                            { id: 'c', text: 'department should be in HAVING', isCorrect: false },
                            { id: 'd', text: 'Nothing is wrong', isCorrect: false },
                        ],
                        explanation: 'Every column in SELECT must be in GROUP BY or inside an aggregate function. "name" is neither — it should be removed or wrapped in an aggregate like MIN(name).',
                    },
                    {
                        order: 3, difficulty: 'EASY',
                        question: 'What operator has higher precedence: AND or OR?',
                        options: [
                            { id: 'a', text: 'OR', isCorrect: false },
                            { id: 'b', text: 'AND', isCorrect: true },
                            { id: 'c', text: 'They are equal', isCorrect: false },
                            { id: 'd', text: 'It depends on the database', isCorrect: false },
                        ],
                        explanation: 'AND has higher precedence than OR. So "A OR B AND C" is evaluated as "A OR (B AND C)". Always use parentheses to be explicit.',
                    },
                    {
                        order: 4, difficulty: 'MEDIUM',
                        question: 'LIKE \'%@gmail.%\' will match which email?',
                        options: [
                            { id: 'a', text: 'user@gmail.com', isCorrect: true },
                            { id: 'b', text: 'gmail@user.com', isCorrect: false },
                            { id: 'c', text: 'user@yahoo.com', isCorrect: false },
                            { id: 'd', text: 'All of the above', isCorrect: false },
                        ],
                        explanation: '% matches any characters. The pattern requires @gmail. to appear somewhere in the string. user@gmail.com matches because it contains @gmail.',
                    },
                    {
                        order: 5, difficulty: 'MEDIUM',
                        question: 'What is the purpose of NULLIF(cost, 0)?',
                        options: [
                            { id: 'a', text: 'Replace NULL with 0', isCorrect: false },
                            { id: 'b', text: 'Return NULL if cost is 0 (prevent divide-by-zero)', isCorrect: true },
                            { id: 'c', text: 'Check if cost equals NULL', isCorrect: false },
                            { id: 'd', text: 'Set cost to 0 if NULL', isCorrect: false },
                        ],
                        explanation: 'NULLIF(a, b) returns NULL if a = b, otherwise returns a. NULLIF(cost, 0) returns NULL when cost is 0, making revenue/NULLIF(cost,0) return NULL instead of a division error.',
                    },
                    {
                        order: 6, difficulty: 'HARD',
                        question: 'What does COUNT(CASE WHEN status = \'active\' THEN 1 END) count?',
                        options: [
                            { id: 'a', text: 'All rows', isCorrect: false },
                            { id: 'b', text: 'Only rows where status = \'active\'', isCorrect: true },
                            { id: 'c', text: 'Returns 1 for active rows', isCorrect: false },
                            { id: 'd', text: 'Number of distinct statuses', isCorrect: false },
                        ],
                        explanation: 'CASE returns 1 for active rows and NULL for others. COUNT skips NULLs, so it only counts active rows. This is conditional aggregation.',
                    },
                    {
                        order: 7, difficulty: 'EASY',
                        question: 'What is the difference between DELETE and TRUNCATE?',
                        options: [
                            { id: 'a', text: 'DELETE is faster', isCorrect: false },
                            { id: 'b', text: 'DELETE removes specific rows (rollbackable); TRUNCATE removes all rows (fast, not rollbackable)', isCorrect: true },
                            { id: 'c', text: 'TRUNCATE can use WHERE', isCorrect: false },
                            { id: 'd', text: 'They are the same', isCorrect: false },
                        ],
                        explanation: 'DELETE is DML (per-row logging, rollbackable, fires triggers). TRUNCATE is DDL (instant, resets sequences, no triggers). DELETE for targeted removal, TRUNCATE for clearing tables.',
                    },
                    {
                        order: 8, difficulty: 'MEDIUM',
                        question: 'What does ROLLUP(region, category) NOT produce?',
                        options: [
                            { id: 'a', text: 'Subtotal per (region, category)', isCorrect: false },
                            { id: 'b', text: 'Subtotal per region', isCorrect: false },
                            { id: 'c', text: 'Subtotal per category alone', isCorrect: true },
                            { id: 'd', text: 'Grand total', isCorrect: false },
                        ],
                        explanation: 'ROLLUP removes columns right-to-left: (region, category), (region), (). It does NOT produce (category) alone. CUBE would produce that.',
                    },
                    {
                        order: 9, difficulty: 'MEDIUM',
                        question: 'Given salaries [100, 200, NULL, 300], what is SUM(salary)?',
                        options: [
                            { id: 'a', text: '600', isCorrect: true },
                            { id: 'b', text: '150 (600/4)', isCorrect: false },
                            { id: 'c', text: 'NULL', isCorrect: false },
                            { id: 'd', text: '0', isCorrect: false },
                        ],
                        explanation: 'SUM ignores NULLs. It adds 100 + 200 + 300 = 600. AVG would be 200 (600/3, not 600/4).',
                    },
                    {
                        order: 10, difficulty: 'EASY',
                        question: 'How do you get the 3rd page of results (20 items per page)?',
                        options: [
                            { id: 'a', text: 'LIMIT 20 OFFSET 40', isCorrect: true },
                            { id: 'b', text: 'LIMIT 20 OFFSET 60', isCorrect: false },
                            { id: 'c', text: 'LIMIT 3 OFFSET 20', isCorrect: false },
                            { id: 'd', text: 'LIMIT 20 OFFSET 20', isCorrect: false },
                        ],
                        explanation: 'Page 3 with 20 per page: skip (3-1)*20 = 40 rows. LIMIT 20 OFFSET 40. Page 1: OFFSET 0, Page 2: OFFSET 20, Page 3: OFFSET 40.',
                    },
                    {
                        order: 11, difficulty: 'HARD',
                        question: 'Why is keyset pagination faster than OFFSET pagination?',
                        options: [
                            { id: 'a', text: 'It uses less memory', isCorrect: false },
                            { id: 'b', text: 'It uses an index to jump directly to the starting point instead of scanning skipped rows', isCorrect: true },
                            { id: 'c', text: 'It doesn\'t need ORDER BY', isCorrect: false },
                            { id: 'd', text: 'It works without a primary key', isCorrect: false },
                        ],
                        explanation: 'OFFSET N scans N rows and throws them away (O(N)). Keyset uses WHERE id > last_seen_id with an index to jump directly to the right position (O(1)). Much faster for deep pages.',
                    },
                    {
                        order: 12, difficulty: 'MEDIUM',
                        question: 'How do you extract the month number from a date in standard SQL?',
                        options: [
                            { id: 'a', text: 'MONTH(date)', isCorrect: false },
                            { id: 'b', text: 'EXTRACT(MONTH FROM date)', isCorrect: true },
                            { id: 'c', text: 'DATE_PART(\'month\', date)', isCorrect: false },
                            { id: 'd', text: 'GET_MONTH(date)', isCorrect: false },
                        ],
                        explanation: 'EXTRACT(MONTH FROM date) is the standard SQL syntax. DATE_PART is PostgreSQL-specific. MONTH() is MySQL-specific. EXTRACT works across most databases.',
                    },
                    {
                        order: 13, difficulty: 'HARD',
                        question: 'What does INSERT ... ON CONFLICT (email) DO NOTHING do?',
                        options: [
                            { id: 'a', text: 'Throws an error if email exists', isCorrect: false },
                            { id: 'b', text: 'Silently skips the insert if a row with that email already exists', isCorrect: true },
                            { id: 'c', text: 'Updates the existing row', isCorrect: false },
                            { id: 'd', text: 'Deletes the conflicting row', isCorrect: false },
                        ],
                        explanation: 'ON CONFLICT DO NOTHING silently ignores the insert if the unique constraint is violated — no error, no update. Useful for idempotent imports where you don\'t want to modify existing data.',
                    },
                    {
                        order: 14, difficulty: 'MEDIUM',
                        question: 'In CASE WHEN, if no condition matches and there is no ELSE, what is returned?',
                        options: [
                            { id: 'a', text: '0', isCorrect: false },
                            { id: 'b', text: 'Empty string', isCorrect: false },
                            { id: 'c', text: 'NULL', isCorrect: true },
                            { id: 'd', text: 'Error', isCorrect: false },
                        ],
                        explanation: 'If no WHEN condition matches and there is no ELSE clause, CASE returns NULL. Always include ELSE for explicit handling.',
                    },
                ],
            },
            {
                order: 2,
                title: 'Interview Prep — Unit 2 Flashcards',
                type: 'INTERVIEW_QUESTIONS',
                content: `# Unit 2 Interview Flashcards — Core SQL Mastery

These cover the most frequently asked query-writing interview questions.`,
                interviewCards: [
                    {
                        order: 0, category: 'Coding', difficulty: 'MEDIUM',
                        question: 'Write a query to find the second highest salary in a company.',
                        answer: `**Method 1: LIMIT + OFFSET**\n\`\`\`sql\nSELECT DISTINCT salary\nFROM employees\nORDER BY salary DESC\nLIMIT 1 OFFSET 1;\n\`\`\`\n\n**Method 2: Subquery**\n\`\`\`sql\nSELECT MAX(salary)\nFROM employees\nWHERE salary < (SELECT MAX(salary) FROM employees);\n\`\`\`\n\n**Method 3: DENSE_RANK (Window Function)**\n\`\`\`sql\nSELECT salary FROM (\n  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rk\n  FROM employees\n) sub WHERE rk = 2;\n\`\`\`\n\n**Best for interview:** Method 3 (most flexible — easily adapts to Nth highest).`,
                        codeSnippet: `-- Second highest salary\nSELECT DISTINCT salary FROM employees\nORDER BY salary DESC LIMIT 1 OFFSET 1;`,
                        codeLanguage: 'sql',
                        tags: ['second-highest', 'classic-question'],
                    },
                    {
                        order: 1, category: 'Coding', difficulty: 'MEDIUM',
                        question: 'Write a query to find duplicate emails in a users table.',
                        answer: `\`\`\`sql\n-- Find duplicate emails\nSELECT email, COUNT(*) AS occurrence_count\nFROM users\nGROUP BY email\nHAVING COUNT(*) > 1\nORDER BY occurrence_count DESC;\n\`\`\`\n\n**To see the actual duplicate rows:**\n\`\`\`sql\nSELECT * FROM users\nWHERE email IN (\n    SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1\n)\nORDER BY email;\n\`\`\``,
                        codeSnippet: `SELECT email, COUNT(*) AS count\nFROM users\nGROUP BY email\nHAVING COUNT(*) > 1;`,
                        codeLanguage: 'sql',
                        tags: ['duplicates', 'classic-question'],
                    },
                    {
                        order: 2, category: 'Coding', difficulty: 'MEDIUM',
                        question: 'Write a query to get monthly revenue with month-over-month change.',
                        answer: `\`\`\`sql\nWITH monthly AS (\n    SELECT\n        DATE_TRUNC('month', order_date) AS month,\n        SUM(total) AS revenue\n    FROM orders\n    GROUP BY DATE_TRUNC('month', order_date)\n)\nSELECT\n    month,\n    revenue,\n    LAG(revenue) OVER (ORDER BY month) AS prev_month,\n    revenue - LAG(revenue) OVER (ORDER BY month) AS mom_change,\n    ROUND(\n        100.0 * (revenue - LAG(revenue) OVER (ORDER BY month)) /\n        NULLIF(LAG(revenue) OVER (ORDER BY month), 0),\n        1\n    ) AS mom_pct\nFROM monthly\nORDER BY month;\n\`\`\`\n\n**Key functions:** DATE_TRUNC for monthly grouping, LAG for previous value, NULLIF for safe division. This pattern is extremely common in analytics interviews.`,
                        codeSnippet: `WITH monthly AS (\n  SELECT DATE_TRUNC('month', order_date) AS month,\n    SUM(total) AS revenue\n  FROM orders GROUP BY 1\n)\nSELECT month, revenue,\n  LAG(revenue) OVER (ORDER BY month) AS prev,\n  revenue - LAG(revenue) OVER (ORDER BY month) AS change\nFROM monthly;`,
                        codeLanguage: 'sql',
                        tags: ['mom', 'analytics', 'lag'],
                    },
                    {
                        order: 3, category: 'Tricky', difficulty: 'MEDIUM',
                        question: 'What is the difference between WHERE and HAVING?',
                        answer: `**WHERE** filters **rows** BEFORE GROUP BY.\n**HAVING** filters **groups** AFTER GROUP BY.\n\n**Key differences:**\n- WHERE: can\'t use aggregate functions (COUNT, SUM, etc.)\n- HAVING: designed for aggregate filtering\n- WHERE: filters raw data (faster — reduces rows before grouping)\n- HAVING: filters computed results\n\n\`\`\`sql\nSELECT department, COUNT(*) AS cnt\nFROM employees\nWHERE is_active = TRUE     -- row filter (before grouping)\nGROUP BY department\nHAVING COUNT(*) > 5;       -- group filter (after grouping)\n\`\`\`\n\n**Performance tip:** If a filter can go in WHERE, put it there — it reduces rows before the expensive GROUP BY operation.`,
                        tags: ['where-vs-having', 'must-know'],
                    },
                    {
                        order: 4, category: 'Coding', difficulty: 'EASY',
                        question: 'Write a query to count orders by status.',
                        answer: `**Two approaches:**\n\n**Method 1: GROUP BY**\n\`\`\`sql\nSELECT status, COUNT(*) AS count\nFROM orders\nGROUP BY status\nORDER BY count DESC;\n\`\`\`\n\n**Method 2: Conditional Aggregation (pivot)**\n\`\`\`sql\nSELECT\n    COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending,\n    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed,\n    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled\nFROM orders;\n\`\`\`\n\nMethod 1 gives rows per status. Method 2 gives one row with status as columns (pivot). Know both!`,
                        tags: ['count', 'group-by', 'pivot'],
                    },
                ],
            },
            {
                order: 3,
                title: 'What\'s Next: Unit 3 — Joins & Multi-Table Queries',
                type: 'SUMMARY',
                content: `# Congratulations! Unit 2 Complete 🎉

## You Can Now

- Write any SELECT query with filtering, sorting, and pagination
- Use string, date, and NULL handling functions
- Aggregate data with GROUP BY and filter groups with HAVING
- Create conditional logic with CASE statements
- Safely modify data with INSERT, UPDATE, DELETE
- Create reports with ROLLUP and CUBE

## Next: Unit 3 — Joins & Multi-Table Queries

Unit 3 covers the heart of SQL — combining data from multiple tables:
- **INNER JOIN** — matching rows
- **LEFT/RIGHT/FULL JOIN** — including unmatched rows
- **SELF JOIN & CROSS JOIN** — special patterns
- **ANTI-JOIN & SEMI-JOIN** — find rows with/without matches
- **Multi-table JOINs** — complex real-world queries
- **LATERAL JOIN** — advanced correlated patterns

JOINs are tested in every SQL interview. Let's master them!`,
            },
        ],
    });

    console.log('✅ SQL Unit 2 seeded successfully!');

    // ═══════════════════════════════════════════════════════════════════════════
    // UNIT 3 — Joins & Multi-Table Queries
    // ═══════════════════════════════════════════════════════════════════════════

    // ── Learn 3.1: INNER JOIN & The Join Mental Model ──
    await createLearn({
        slug: 'sql-inner-join-mental-model',
        title: 'INNER JOIN & The Join Mental Model',
        description: 'Understand how joins work by matching rows across tables. Master INNER JOIN — the most common join type, multi-column join conditions, table aliases, and the mental model that makes all other joins easy.',
        difficulty: 'BEGINNER',
        topicSlug: 'sql-unit3-joins',
        unitTitle: 'Unit 3: Joins & Multi-Table Queries',
        estimatedTime: 25,
        tags: ['inner-join', 'join', 'foreign-key', 'matching', 'aliases'],
        iconEmoji: '🔗',
        steps: [
            {
                order: 0,
                title: 'The Join Mental Model',
                type: 'EXPLANATION',
                tips: [
                    'Think of a JOIN as matching rows from two tables side-by-side based on a condition.',
                    'INNER JOIN is the default — writing just "JOIN" means "INNER JOIN".',
                    'Always use table aliases (e, o, c) for readability in multi-table queries.',
                ],
                content: `# INNER JOIN & The Join Mental Model

## What is a JOIN?

A **JOIN** combines rows from two or more tables based on a **related column** (usually a foreign key). Think of it as placing two tables side-by-side and connecting matching rows.

---

## The Mental Model

Imagine two tables:

**customers:**
| id | name |
|----|------|
| 1 | Alice |
| 2 | Bob |
| 3 | Carol |

**orders:**
| id | customer_id | total |
|----|-------------|-------|
| 101 | 1 | 99.99 |
| 102 | 1 | 49.99 |
| 103 | 2 | 199.99 |

An **INNER JOIN** matches each order to its customer:

\`\`\`sql
SELECT c.name, o.id AS order_id, o.total
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id;
\`\`\`

Result:
| name | order_id | total |
|------|----------|-------|
| Alice | 101 | 99.99 |
| Alice | 102 | 49.99 |
| Bob | 103 | 199.99 |

**Notice:** Carol has no orders → she doesn't appear in INNER JOIN results. Only **matching rows** from both sides are included.

---

## INNER JOIN Syntax

\`\`\`sql
SELECT columns
FROM table_a a
INNER JOIN table_b b ON a.key = b.foreign_key;
\`\`\`

- \`INNER JOIN\` = \`JOIN\` (INNER is the default and optional)
- \`ON\` specifies the join condition (which columns to match)
- Use **table aliases** (a, b) for readability

---

## How INNER JOIN Works Internally

\`\`\`mermaid
flowchart LR
    subgraph "customers (left)"
        C1["Alice (id=1)"]
        C2["Bob (id=2)"]
        C3["Carol (id=3)"]
    end
    subgraph "orders (right)"
        O1["Order 101 (cust=1)"]
        O2["Order 102 (cust=1)"]
        O3["Order 103 (cust=2)"]
    end
    C1 --> O1
    C1 --> O2
    C2 --> O3
    C3 -.->|"No match ❌"| NONE["Not in result"]

    style C3 fill:#ef4444,stroke:#333,color:#fff
    style NONE fill:#ef4444,stroke:#333,color:#fff
\`\`\`

For each row in customers, the database looks for matching rows in orders where \`customers.id = orders.customer_id\`. No match = not in result.

---

## Multi-Column Join Conditions

Sometimes you need to join on multiple columns:

\`\`\`sql
SELECT *
FROM order_items oi
INNER JOIN inventory i
    ON oi.product_id = i.product_id
    AND oi.warehouse_id = i.warehouse_id;
\`\`\`

---

## Joining on Non-Equality Conditions

Joins aren't limited to \`=\`. You can use any condition:

\`\`\`sql
-- Find employees who earn more than their department's average
SELECT e.name, e.salary, d.avg_salary
FROM employees e
INNER JOIN (
    SELECT department, AVG(salary) AS avg_salary
    FROM employees
    GROUP BY department
) d ON e.department = d.department AND e.salary > d.avg_salary;
\`\`\`

---

## Table Aliases — Best Practice

\`\`\`sql
-- ❌ Hard to read without aliases
SELECT customers.name, orders.total, products.name
FROM customers
INNER JOIN orders ON customers.id = orders.customer_id
INNER JOIN order_items ON orders.id = order_items.order_id
INNER JOIN products ON order_items.product_id = products.id;

-- ✅ Clean with aliases
SELECT c.name, o.total, p.name
FROM customers c
JOIN orders o ON c.id = o.customer_id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id;
\`\`\`

> Always alias tables in multi-table queries. Use meaningful 1-2 letter abbreviations.`,
            },
            {
                order: 1,
                title: 'INNER JOIN — Code Examples',
                type: 'CODE',
                content: '## INNER JOIN in Practice',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Basic INNER JOIN — Orders & Customers',
                        language: 'sql',
                        code: `-- Get all orders with customer details
SELECT
    c.name AS customer_name,
    c.email,
    o.id AS order_id,
    o.total,
    o.order_date
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id
ORDER BY o.order_date DESC;

-- Only customers WITH orders appear (Carol with no orders is excluded)`,
                        explanation: 'INNER JOIN returns only rows where the join condition matches on both sides. Customers without orders and orders without valid customers are excluded.',
                        highlightLines: [8, 9],
                    },
                    {
                        order: 1,
                        title: '3-Table JOIN — Orders, Items, Products',
                        language: 'sql',
                        code: `-- Full order details: customer → order → items → products
SELECT
    c.name AS customer,
    o.id AS order_id,
    o.order_date,
    p.name AS product,
    oi.quantity,
    oi.unit_price,
    (oi.quantity * oi.unit_price) AS line_total
FROM customers c
JOIN orders o ON c.id = o.customer_id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.order_date >= '2024-01-01'
ORDER BY o.order_date DESC, c.name;`,
                        explanation: 'Multi-table joins chain together: customers → orders → order_items → products. Each JOIN connects two tables. The WHERE clause filters after all joins are applied.',
                        highlightLines: [11, 12, 13],
                    },
                    {
                        order: 2,
                        title: 'JOIN with Aggregation',
                        language: 'sql',
                        code: `-- Revenue per customer
SELECT
    c.name,
    COUNT(o.id) AS order_count,
    SUM(o.total) AS total_spent,
    ROUND(AVG(o.total), 2) AS avg_order_value,
    MAX(o.order_date) AS last_order_date
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
HAVING SUM(o.total) > 100
ORDER BY total_spent DESC;

-- Top selling products
SELECT
    p.name,
    SUM(oi.quantity) AS total_sold,
    SUM(oi.quantity * oi.unit_price) AS total_revenue
FROM products p
JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name
ORDER BY total_revenue DESC
LIMIT 10;`,
                        explanation: 'JOIN + GROUP BY is extremely common. Join the tables first to get the raw data, then GROUP BY to aggregate. Always include the PK (c.id, p.id) in GROUP BY for correctness.',
                        highlightLines: [9, 10, 11, 20, 21],
                    },
                ],
            },
            {
                order: 2,
                title: 'INNER JOIN Visualization',
                type: 'VISUALIZATION',
                content: `# How INNER JOIN Works — Visual

## Venn Diagram

\`\`\`mermaid
flowchart LR
    subgraph "INNER JOIN"
        direction TB
        A["Table A\n(customers)"]
        B["Table B\n(orders)"]
        AB["A ∩ B\nOnly matching rows\nfrom BOTH tables"]
    end
    A --> AB
    B --> AB

    style AB fill:#10b981,stroke:#333,color:#fff
    style A fill:#6b7280,stroke:#333,color:#fff
    style B fill:#6b7280,stroke:#333,color:#fff
\`\`\`

## Row Matching Process

\`\`\`mermaid
flowchart TD
    A["For each row in LEFT table"] --> B["Find matching rows in RIGHT table"]
    B --> C{"Match found?"}
    C -->|Yes| D["Combine columns from both rows\nAdd to result"]
    C -->|No| E["Skip — row not in result"]

    style D fill:#10b981,stroke:#333,color:#fff
    style E fill:#ef4444,stroke:#333,color:#fff
\`\`\`

## SQL Execution Order with JOINs

\`\`\`mermaid
flowchart TD
    A["1. FROM table_a"] --> B["2. JOIN table_b ON condition"]
    B --> C["3. WHERE filter"]
    C --> D["4. GROUP BY"]
    D --> E["5. HAVING"]
    E --> F["6. SELECT"]
    F --> G["7. ORDER BY"]
    G --> H["8. LIMIT"]

    style A fill:#f97316,stroke:#333,color:#fff
    style B fill:#f97316,stroke:#333,color:#fff
\`\`\`

JOIN happens early — right after FROM. This means WHERE filters the already-joined rows, not the individual tables.`,
            },
            {
                order: 3,
                title: 'Quiz: INNER JOIN',
                type: 'QUIZ',
                content: '## Test Your INNER JOIN Knowledge',
                quizQuestions: [
                    {
                        order: 0, difficulty: 'EASY',
                        question: 'What does INNER JOIN return?',
                        options: [
                            { id: 'a', text: 'All rows from the left table', isCorrect: false },
                            { id: 'b', text: 'All rows from both tables', isCorrect: false },
                            { id: 'c', text: 'Only rows that have a match in BOTH tables', isCorrect: true },
                            { id: 'd', text: 'Only rows that exist in the left table but not the right', isCorrect: false },
                        ],
                        explanation: 'INNER JOIN returns only rows where the join condition matches on both sides. No match = not in result.',
                    },
                    {
                        order: 1, difficulty: 'EASY',
                        question: 'Is "JOIN" the same as "INNER JOIN"?',
                        options: [
                            { id: 'a', text: 'No, JOIN defaults to LEFT JOIN', isCorrect: false },
                            { id: 'b', text: 'No, JOIN defaults to CROSS JOIN', isCorrect: false },
                            { id: 'c', text: 'Yes, INNER is the default and can be omitted', isCorrect: true },
                            { id: 'd', text: 'It depends on the database', isCorrect: false },
                        ],
                        explanation: 'In SQL, plain "JOIN" means "INNER JOIN". The INNER keyword is optional. Both produce identical results.',
                    },
                    {
                        order: 2, difficulty: 'MEDIUM',
                        question: 'Customers table has 100 rows. Orders table has 500 rows. How many rows can an INNER JOIN return?',
                        options: [
                            { id: 'a', text: 'Exactly 100', isCorrect: false },
                            { id: 'b', text: 'Exactly 500', isCorrect: false },
                            { id: 'c', text: 'Between 0 and 500 (or more if multiple matches exist)', isCorrect: true },
                            { id: 'd', text: 'Always 600', isCorrect: false },
                        ],
                        explanation: 'INNER JOIN can return 0 rows (no matches), up to 500 (every order matches a customer), or even more than 500 if the join condition produces multiple matches per row.',
                    },
                    {
                        order: 3, difficulty: 'MEDIUM',
                        question: 'What is wrong with: SELECT name, total FROM customers JOIN orders ON customer_id = id?',
                        options: [
                            { id: 'a', text: 'Missing INNER keyword', isCorrect: false },
                            { id: 'b', text: 'Ambiguous column references — need table aliases', isCorrect: true },
                            { id: 'c', text: 'Can\'t select from two tables', isCorrect: false },
                            { id: 'd', text: 'Nothing is wrong', isCorrect: false },
                        ],
                        explanation: 'Both tables might have columns named "id" or "name". Without aliases (c.id, o.customer_id), the database can\'t tell which table you mean. Always use aliases.',
                    },
                ],
            },
            {
                order: 4,
                title: 'Interview Questions: INNER JOIN',
                type: 'INTERVIEW_QUESTIONS',
                content: `# Interview Questions — INNER JOIN`,
                interviewCards: [
                    {
                        order: 0, category: 'Conceptual', difficulty: 'EASY',
                        question: 'What is an INNER JOIN and how does it work?',
                        answer: `**INNER JOIN** returns only rows that have **matching values in both tables** based on the join condition.\n\n**How it works:**\n1. For each row in Table A, find all rows in Table B where the condition is true\n2. Combine the matching columns from both rows\n3. Skip rows that have no match on either side\n\n\`\`\`sql\nSELECT c.name, o.total\nFROM customers c\nINNER JOIN orders o ON c.id = o.customer_id;\n\`\`\`\n\n**Key points:**\n- JOIN = INNER JOIN (INNER is default)\n- No match → row excluded from result\n- Can return more rows than either table (one-to-many)`,
                        codeSnippet: `SELECT c.name, o.total\nFROM customers c\nJOIN orders o ON c.id = o.customer_id;`,
                        codeLanguage: 'sql',
                        tags: ['inner-join', 'basics'],
                    },
                    {
                        order: 1, category: 'Tricky', difficulty: 'MEDIUM',
                        question: 'Does join order matter for INNER JOIN? (A JOIN B vs B JOIN A)',
                        answer: `**Logically: No.** INNER JOIN is **commutative** — A JOIN B gives the same result set as B JOIN A (columns may be in different order).\n\n**For performance: Sometimes.** The query optimizer usually reorders joins for efficiency, but:\n- In MySQL, join order can affect which indexes are used\n- In PostgreSQL, the optimizer is smarter about reordering\n- For LEFT/RIGHT joins, order DOES matter (changes which side keeps unmatched rows)\n\n**Best practice:** Write JOINs in the order that makes the query most **readable** — typically starting from the "main" entity (customers) and joining related tables (orders, order_items).`,
                        tags: ['join-order', 'optimization'],
                    },
                    {
                        order: 2, category: 'Coding', difficulty: 'MEDIUM',
                        question: 'Write a query to find the total revenue per product category.',
                        answer: `\`\`\`sql\nSELECT\n    cat.name AS category,\n    COUNT(DISTINCT o.id) AS order_count,\n    SUM(oi.quantity * oi.unit_price) AS total_revenue\nFROM categories cat\nJOIN products p ON cat.id = p.category_id\nJOIN order_items oi ON p.id = oi.product_id\nJOIN orders o ON oi.order_id = o.id\nWHERE o.status = 'completed'\nGROUP BY cat.id, cat.name\nORDER BY total_revenue DESC;\n\`\`\`\n\n**Approach:**\n1. Start from categories (the grouping entity)\n2. JOIN through products → order_items → orders\n3. Filter for completed orders\n4. GROUP BY category, aggregate revenue`,
                        codeSnippet: `SELECT cat.name, SUM(oi.quantity * oi.unit_price) AS revenue\nFROM categories cat\nJOIN products p ON cat.id = p.category_id\nJOIN order_items oi ON p.id = oi.product_id\nGROUP BY cat.id, cat.name\nORDER BY revenue DESC;`,
                        codeLanguage: 'sql',
                        tags: ['multi-join', 'aggregation'],
                    },
                ],
            },
            {
                order: 5,
                title: 'Summary: INNER JOIN',
                type: 'SUMMARY',
                keyTakeaways: [
                    'INNER JOIN returns only rows that match on both sides',
                    'JOIN = INNER JOIN (INNER keyword is optional)',
                    'Use table aliases (c, o, p) for readable multi-table queries',
                    'JOIN + GROUP BY is the most common pattern for reports',
                    'Join order doesn\'t affect INNER JOIN results (but readability matters)',
                    'Always qualify column names with table aliases in multi-join queries',
                ],
                content: `# Summary — INNER JOIN

## Pattern

\`\`\`sql
SELECT a.col, b.col
FROM table_a a
JOIN table_b b ON a.pk = b.fk
WHERE conditions
GROUP BY a.col;
\`\`\`

## Next: LEFT, RIGHT & FULL OUTER JOIN — what happens when rows DON'T match.`,
            },
        ],
    });

    // ── Learn 3.2: LEFT, RIGHT & FULL OUTER JOIN ──
    await createLearn({
        slug: 'sql-left-right-full-outer-join',
        title: 'LEFT, RIGHT & FULL OUTER JOIN',
        description: 'Master outer joins: LEFT JOIN keeps all rows from the left table (NULLs for no match), RIGHT JOIN from the right, FULL OUTER JOIN from both. Learn the anti-join pattern and the common LEFT JOIN + WHERE IS NULL trap.',
        difficulty: 'BEGINNER',
        topicSlug: 'sql-unit3-joins',
        unitTitle: 'Unit 3: Joins & Multi-Table Queries',
        estimatedTime: 25,
        tags: ['left-join', 'right-join', 'full-outer-join', 'null-in-joins', 'anti-join'],
        iconEmoji: '↔️',
        steps: [
            {
                order: 0,
                title: 'Outer Joins Explained',
                type: 'EXPLANATION',
                tips: [
                    '"Difference between INNER and LEFT JOIN?" is THE most asked SQL interview question.',
                    'RIGHT JOIN is rarely used — prefer LEFT JOIN (swap table order instead).',
                    'Filtering a LEFT JOIN in WHERE converts it to INNER JOIN — use ON instead.',
                ],
                content: `# LEFT, RIGHT & FULL OUTER JOIN

## LEFT JOIN — Keep All Left, NULL for No Match

\`\`\`sql
SELECT c.name, o.id AS order_id, o.total
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id;
\`\`\`

**customers:**
| id | name |
|----|------|
| 1 | Alice |
| 2 | Bob |
| 3 | Carol |

**orders:**
| id | customer_id | total |
|----|-------------|-------|
| 101 | 1 | 99.99 |
| 102 | 2 | 49.99 |

**LEFT JOIN result:**
| name | order_id | total |
|------|----------|-------|
| Alice | 101 | 99.99 |
| Bob | 102 | 49.99 |
| **Carol** | **NULL** | **NULL** |

Carol has no orders → she's still in the result, but order columns are NULL.

---

## RIGHT JOIN — Keep All Right

Same as LEFT JOIN with tables swapped. Rarely used in practice.

\`\`\`sql
-- These two are equivalent:
SELECT * FROM orders o RIGHT JOIN customers c ON c.id = o.customer_id;
SELECT * FROM customers c LEFT JOIN orders o ON c.id = o.customer_id;
\`\`\`

> **Convention:** Always use LEFT JOIN and put the "main" table on the left. This is clearer and more common.

---

## FULL OUTER JOIN — Keep All From Both

Returns all rows from both tables. NULLs where there's no match on either side.

\`\`\`sql
SELECT c.name, o.id, o.total
FROM customers c
FULL OUTER JOIN orders o ON c.id = o.customer_id;
\`\`\`

| name | order_id | total |
|------|----------|-------|
| Alice | 101 | 99.99 |
| Bob | 102 | 49.99 |
| Carol | NULL | NULL |
| NULL | 103 | 75.00 |

Row 4: Order 103 has no matching customer → customer columns are NULL.

> MySQL doesn't support FULL OUTER JOIN directly. Emulate with: LEFT JOIN UNION ALL RIGHT JOIN WHERE left.id IS NULL.

---

## The Anti-Join Pattern (LEFT JOIN + IS NULL)

Find rows in A with **NO match** in B:

\`\`\`sql
-- Customers who have NEVER placed an order
SELECT c.name, c.email
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE o.id IS NULL;
\`\`\`

This is the **anti-join** — one of the most useful and commonly tested patterns.

---

## ⚠️ The WHERE Trap — Most Common LEFT JOIN Bug

\`\`\`sql
-- ❌ WRONG: This converts LEFT JOIN to INNER JOIN!
SELECT c.name, o.total
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE o.total > 100;
-- Carol (no orders) is filtered out because o.total is NULL, and NULL > 100 is UNKNOWN

-- ✅ CORRECT: Put the filter in ON clause
SELECT c.name, o.total
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id AND o.total > 100;
-- Carol stays in result with NULL total
\`\`\`

**Rule:** Filters on the **right table** of a LEFT JOIN should go in the **ON clause**, not WHERE. WHERE filters AFTER the join and removes NULLs.`,
            },
            {
                order: 1,
                title: 'Outer Joins Visualization',
                type: 'VISUALIZATION',
                content: `# Join Types — Visual Comparison

## All Join Types at a Glance

\`\`\`mermaid
flowchart TD
    subgraph "INNER JOIN"
        I["Only matching rows\nfrom BOTH tables"]
    end
    subgraph "LEFT JOIN"
        L["ALL rows from LEFT\n+ matching from RIGHT\n+ NULL where no match"]
    end
    subgraph "RIGHT JOIN"
        R["ALL rows from RIGHT\n+ matching from LEFT\n+ NULL where no match"]
    end
    subgraph "FULL OUTER JOIN"
        F["ALL rows from BOTH\n+ NULL on either side\nwhere no match"]
    end

    style I fill:#3b82f6,stroke:#333,color:#fff
    style L fill:#10b981,stroke:#333,color:#fff
    style R fill:#f97316,stroke:#333,color:#fff
    style F fill:#8b5cf6,stroke:#333,color:#fff
\`\`\`

## The WHERE Trap Visualized

\`\`\`mermaid
sequenceDiagram
    participant LJ as LEFT JOIN Result
    participant WH as WHERE Filter
    participant RES as Final Result

    Note over LJ: Alice: order=101, total=150 ✅
    Note over LJ: Bob: order=102, total=50 ✅
    Note over LJ: Carol: order=NULL, total=NULL ✅

    LJ->>WH: WHERE total > 100
    Note over WH: Alice: 150 > 100 → KEEP ✅
    Note over WH: Bob: 50 > 100 → REMOVE ❌
    Note over WH: Carol: NULL > 100 → UNKNOWN → REMOVE ❌

    WH->>RES: Only Alice remains!
    Note over RES: LEFT JOIN became INNER JOIN 😱
\`\`\``,
            },
            {
                order: 2,
                title: 'Outer Joins — Code Examples',
                type: 'CODE',
                content: '## LEFT JOIN, Anti-Join & FULL OUTER JOIN',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'LEFT JOIN — Customers With and Without Orders',
                        language: 'sql',
                        code: `-- All customers with their order count (including those with 0 orders)
SELECT
    c.name,
    c.email,
    COUNT(o.id) AS order_count,
    COALESCE(SUM(o.total), 0) AS total_spent
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name, c.email
ORDER BY total_spent DESC;

-- Carol shows up with order_count=0, total_spent=0
-- COUNT(o.id) skips NULLs, so Carol gets 0 (not 1)`,
                        explanation: 'LEFT JOIN keeps all customers. COUNT(o.id) counts non-NULL order IDs (so customers with no orders get 0). COALESCE replaces NULL sum with 0.',
                        highlightLines: [5, 6, 8],
                    },
                    {
                        order: 1,
                        title: 'Anti-Join — Find Customers Without Orders',
                        language: 'sql',
                        code: `-- Method 1: LEFT JOIN + WHERE IS NULL (most common)
SELECT c.name, c.email
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE o.id IS NULL;

-- Method 2: NOT EXISTS (often faster)
SELECT c.name, c.email
FROM customers c
WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.customer_id = c.id
);

-- Method 3: NOT IN (watch out for NULLs!)
SELECT name, email
FROM customers
WHERE id NOT IN (
    SELECT customer_id FROM orders WHERE customer_id IS NOT NULL
);`,
                        explanation: 'Three ways to write anti-join. Method 1 (LEFT JOIN IS NULL) is most readable. Method 2 (NOT EXISTS) is often fastest. Method 3 (NOT IN) has a NULL trap: if ANY customer_id is NULL, NOT IN returns no rows.',
                        highlightLines: [4, 5, 10, 11, 18],
                    },
                ],
            },
            {
                order: 3,
                title: 'Quiz: Outer Joins',
                type: 'QUIZ',
                content: '## Test Your Outer Join Knowledge',
                quizQuestions: [
                    {
                        order: 0, difficulty: 'EASY',
                        question: 'What does LEFT JOIN do when there is no matching row in the right table?',
                        options: [
                            { id: 'a', text: 'Excludes the left row from the result', isCorrect: false },
                            { id: 'b', text: 'Includes the left row with NULLs for right table columns', isCorrect: true },
                            { id: 'c', text: 'Throws an error', isCorrect: false },
                            { id: 'd', text: 'Includes the left row with zeros for right table columns', isCorrect: false },
                        ],
                        explanation: 'LEFT JOIN keeps ALL rows from the left table. Where there\'s no match on the right, the right table\'s columns are filled with NULL.',
                    },
                    {
                        order: 1, difficulty: 'MEDIUM',
                        question: 'What is the difference between INNER JOIN and LEFT JOIN?',
                        options: [
                            { id: 'a', text: 'INNER JOIN is faster', isCorrect: false },
                            { id: 'b', text: 'INNER JOIN returns only matching rows; LEFT JOIN keeps all left rows (NULLs for no match)', isCorrect: true },
                            { id: 'c', text: 'LEFT JOIN always returns more rows', isCorrect: false },
                            { id: 'd', text: 'They are the same thing', isCorrect: false },
                        ],
                        explanation: 'INNER JOIN: only matching rows. LEFT JOIN: all left rows + matching right rows (NULLs where no match). This is the most asked SQL interview question.',
                    },
                    {
                        order: 2, difficulty: 'HARD',
                        question: 'LEFT JOIN orders o ON c.id = o.customer_id WHERE o.total > 100 — what is the problem?',
                        options: [
                            { id: 'a', text: 'Syntax error', isCorrect: false },
                            { id: 'b', text: 'The WHERE filter eliminates NULLs, converting LEFT JOIN to INNER JOIN', isCorrect: true },
                            { id: 'c', text: 'It\'s perfectly fine', isCorrect: false },
                            { id: 'd', text: 'o.total can\'t be used in WHERE', isCorrect: false },
                        ],
                        explanation: 'For unmatched rows, o.total is NULL. NULL > 100 is UNKNOWN, which WHERE treats as FALSE → row removed. This effectively converts the LEFT JOIN to INNER JOIN. Fix: move the filter to the ON clause.',
                    },
                    {
                        order: 3, difficulty: 'MEDIUM',
                        question: 'How do you find customers who have NEVER ordered?',
                        options: [
                            { id: 'a', text: 'INNER JOIN customers and orders, then filter', isCorrect: false },
                            { id: 'b', text: 'LEFT JOIN customers to orders, WHERE orders.id IS NULL', isCorrect: true },
                            { id: 'c', text: 'RIGHT JOIN orders to customers', isCorrect: false },
                            { id: 'd', text: 'CROSS JOIN customers and orders', isCorrect: false },
                        ],
                        explanation: 'The anti-join pattern: LEFT JOIN + WHERE right.id IS NULL. This keeps all customers, then filters to only those where no order matched (right side is all NULLs).',
                    },
                    {
                        order: 4, difficulty: 'HARD',
                        question: 'Why is NOT IN dangerous with NULLs?',
                        options: [
                            { id: 'a', text: 'It throws an error', isCorrect: false },
                            { id: 'b', text: 'If ANY value in the subquery is NULL, NOT IN returns no rows at all', isCorrect: true },
                            { id: 'c', text: 'It ignores NULLs', isCorrect: false },
                            { id: 'd', text: 'It\'s the same as NOT EXISTS', isCorrect: false },
                        ],
                        explanation: 'NOT IN (1, 2, NULL) checks: x != 1 AND x != 2 AND x != NULL. The last comparison is always UNKNOWN, so the entire AND becomes UNKNOWN for every x → no rows returned. Use NOT EXISTS instead.',
                    },
                ],
            },
            {
                order: 4,
                title: 'Interview Questions: Outer Joins',
                type: 'INTERVIEW_QUESTIONS',
                content: `# Interview Questions — Outer Joins`,
                interviewCards: [
                    {
                        order: 0, category: 'Conceptual', difficulty: 'EASY',
                        question: 'What is the difference between INNER JOIN and LEFT JOIN?',
                        answer: `**INNER JOIN:** Returns only rows that have a matching value in **both** tables. No match → row excluded.\n\n**LEFT JOIN:** Returns **all rows from the left table** plus matching rows from the right. No match on right → right columns are NULL.\n\n**Example:**\n\`\`\`sql\n-- INNER: only customers WITH orders\nSELECT c.name, o.total\nFROM customers c\nINNER JOIN orders o ON c.id = o.customer_id;\n\n-- LEFT: ALL customers, even without orders\nSELECT c.name, o.total\nFROM customers c\nLEFT JOIN orders o ON c.id = o.customer_id;\n\`\`\`\n\n**When to use LEFT:** When you need ALL records from the primary table regardless of whether related data exists (e.g., all customers, even those without orders).`,
                        tags: ['inner-vs-left', 'most-asked-question'],
                    },
                    {
                        order: 1, category: 'Tricky', difficulty: 'HARD',
                        question: 'What happens when you put a filter on the RIGHT table of a LEFT JOIN in the WHERE clause?',
                        answer: `It **converts the LEFT JOIN into an INNER JOIN!**\n\n**Why:** For unmatched rows, right table columns are NULL. WHERE filters out NULLs (NULL compared to anything is UNKNOWN, treated as FALSE).\n\n\`\`\`sql\n-- ❌ PROBLEM: WHERE removes Carol (her o.status is NULL)\nSELECT c.name, o.status\nFROM customers c\nLEFT JOIN orders o ON c.id = o.customer_id\nWHERE o.status = 'completed';\n\n-- ✅ FIX: Move filter to ON clause\nSELECT c.name, o.status\nFROM customers c\nLEFT JOIN orders o ON c.id = o.customer_id\n    AND o.status = 'completed';\n\`\`\`\n\n**Rule:** Filters on the right table of LEFT JOIN → put in ON, not WHERE.`,
                        codeSnippet: `-- ❌ Converts to INNER:\n... LEFT JOIN orders o ON c.id = o.cust_id\nWHERE o.status = 'completed';\n\n-- ✅ Preserves LEFT:\n... LEFT JOIN orders o ON c.id = o.cust_id\n    AND o.status = 'completed';`,
                        codeLanguage: 'sql',
                        tags: ['where-trap', 'gotcha', 'senior'],
                    },
                ],
            },
            {
                order: 5,
                title: 'Summary: Outer Joins',
                type: 'SUMMARY',
                keyTakeaways: [
                    'LEFT JOIN: all left rows + matching right (NULLs for no match)',
                    'RIGHT JOIN: same as LEFT JOIN with tables swapped (prefer LEFT JOIN)',
                    'FULL OUTER JOIN: all rows from both sides (NULLs on either side)',
                    'Anti-join: LEFT JOIN + WHERE right.id IS NULL — find rows with no match',
                    'WHERE trap: filtering right table in WHERE converts LEFT to INNER — use ON instead',
                    'NOT IN with NULLs is dangerous — prefer NOT EXISTS',
                ],
                content: `# Summary — Outer Joins

## Decision Guide

| I need... | Use |
|-----------|-----|
| Only matching rows | INNER JOIN |
| All left + matching right | LEFT JOIN |
| Rows in A but NOT in B | LEFT JOIN + WHERE IS NULL |
| All rows from both sides | FULL OUTER JOIN |`,
            },
        ],
    });

    // ── Learn 3.3: SELF JOIN & CROSS JOIN ──
    await createLearn({
        slug: 'sql-self-join-cross-join',
        title: 'SELF JOIN & CROSS JOIN',
        description: 'Master self-joins for hierarchical data (employee-manager) and row comparisons within the same table. Understand CROSS JOIN (cartesian product), when it\'s intentional, and why it\'s dangerous on large tables.',
        difficulty: 'INTERMEDIATE',
        topicSlug: 'sql-unit3-joins',
        unitTitle: 'Unit 3: Joins & Multi-Table Queries',
        estimatedTime: 20,
        tags: ['self-join', 'cross-join', 'cartesian-product', 'hierarchy'],
        iconEmoji: '🔄',
        steps: [
            {
                order: 0,
                title: 'SELF JOIN & CROSS JOIN Explained',
                type: 'EXPLANATION',
                content: `# SELF JOIN & CROSS JOIN

## SELF JOIN — Joining a Table to Itself

A **self join** joins a table to **itself** using different aliases. It's used when rows in a table have relationships to other rows in the **same table**.

### Classic Example: Employee-Manager Hierarchy

\`\`\`sql
-- employees table: id, name, manager_id (FK to employees.id)
SELECT
    e.name AS employee,
    m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
\`\`\`

| employee | manager |
|----------|---------|
| Alice (CEO) | NULL |
| Bob | Alice |
| Carol | Alice |
| Dave | Bob |

**Key:** Use different aliases (\`e\` for employee, \`m\` for manager) to treat the same table as two separate tables.

### Other Self-Join Use Cases

**Compare rows within a table:**
\`\`\`sql
-- Find employees who earn more than their manager
SELECT e.name AS employee, e.salary, m.name AS manager, m.salary AS mgr_salary
FROM employees e
JOIN employees m ON e.manager_id = m.id
WHERE e.salary > m.salary;
\`\`\`

**Find consecutive events:**
\`\`\`sql
-- Find consecutive logins (login today AND yesterday)
SELECT a.user_id, a.login_date, b.login_date AS next_day
FROM logins a
JOIN logins b ON a.user_id = b.user_id
    AND b.login_date = a.login_date + INTERVAL '1 day';
\`\`\`

---

## CROSS JOIN — Cartesian Product

**CROSS JOIN** combines **every row** from Table A with **every row** from Table B.

\`\`\`sql
-- 3 sizes × 4 colors = 12 combinations
SELECT s.size, c.color
FROM sizes s
CROSS JOIN colors c;
\`\`\`

| sizes | colors | → | Result (12 rows) |
|-------|--------|---|-----------------|
| S | Red | | S-Red, S-Blue, S-Green, S-Yellow |
| M | Blue | | M-Red, M-Blue, M-Green, M-Yellow |
| L | Green | | L-Red, L-Blue, L-Green, L-Yellow |
| | Yellow | | |

### When CROSS JOIN is Intentional
- Generating all combinations (sizes × colors, dates × categories)
- Creating date grids for reports (\`dates CROSS JOIN categories\`)
- Generating test data

### The Danger
\`\`\`sql
-- 10,000 rows × 10,000 rows = 100,000,000 rows 💀
-- This will kill your database!
SELECT * FROM big_table_a CROSS JOIN big_table_b;
\`\`\`

> ⚠️ **CROSS JOIN creates N×M rows.** Only use on small lookup tables.`,
            },
            {
                order: 1,
                title: 'SELF JOIN & CROSS JOIN — Code Examples',
                type: 'CODE',
                content: '## Practical Examples',
                codeBlocks: [
                    {
                        order: 0,
                        title: 'Employee-Manager Hierarchy',
                        language: 'sql',
                        code: `-- Full hierarchy with levels
SELECT
    e.name AS employee,
    e.department,
    COALESCE(m.name, '(No Manager)') AS manager,
    COALESCE(m2.name, '') AS managers_manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id
LEFT JOIN employees m2 ON m.manager_id = m2.id
ORDER BY m2.name NULLS FIRST, m.name NULLS FIRST, e.name;

-- Count direct reports per manager
SELECT
    m.name AS manager,
    COUNT(e.id) AS direct_reports
FROM employees e
JOIN employees m ON e.manager_id = m.id
GROUP BY m.id, m.name
ORDER BY direct_reports DESC;`,
                        explanation: 'Self-join chains: e → m → m2 gives us three levels of the hierarchy. LEFT JOIN ensures the CEO (no manager) and top-level managers (no manager\'s manager) are included.',
                        highlightLines: [7, 8, 9, 17],
                    },
                    {
                        order: 1,
                        title: 'CROSS JOIN — Generate Report Grid',
                        language: 'sql',
                        code: `-- Generate a complete date × category grid for reporting
-- (ensures every category has a row for every month, even with 0 sales)
WITH months AS (
    SELECT generate_series(
        '2024-01-01'::date,
        '2024-12-01'::date,
        '1 month'::interval
    )::date AS month
),
categories AS (
    SELECT DISTINCT category FROM products
)
SELECT
    m.month,
    c.category,
    COALESCE(SUM(o.total), 0) AS revenue
FROM months m
CROSS JOIN categories c
LEFT JOIN orders o ON DATE_TRUNC('month', o.order_date) = m.month
    AND o.category = c.category
GROUP BY m.month, c.category
ORDER BY m.month, c.category;`,
                        explanation: 'CROSS JOIN months × categories creates a complete grid. LEFT JOIN orders fills in actual revenue. Without CROSS JOIN, months with 0 sales for a category would be missing from the report.',
                        highlightLines: [18],
                    },
                ],
            },
            {
                order: 2,
                title: 'Quiz: SELF JOIN & CROSS JOIN',
                type: 'QUIZ',
                content: '## Test Your Knowledge',
                quizQuestions: [
                    {
                        order: 0, difficulty: 'EASY',
                        question: 'What is a self join?',
                        options: [
                            { id: 'a', text: 'A join that happens automatically', isCorrect: false },
                            { id: 'b', text: 'Joining a table to itself using different aliases', isCorrect: true },
                            { id: 'c', text: 'A join without an ON clause', isCorrect: false },
                            { id: 'd', text: 'A join that references itself recursively', isCorrect: false },
                        ],
                        explanation: 'A self join uses different aliases to treat one table as two: FROM employees e JOIN employees m ON e.manager_id = m.id.',
                    },
                    {
                        order: 1, difficulty: 'MEDIUM',
                        question: 'Table A has 100 rows, Table B has 50 rows. How many rows does CROSS JOIN produce?',
                        options: [
                            { id: 'a', text: '150', isCorrect: false },
                            { id: 'b', text: '100', isCorrect: false },
                            { id: 'c', text: '5000', isCorrect: true },
                            { id: 'd', text: '50', isCorrect: false },
                        ],
                        explanation: 'CROSS JOIN produces the cartesian product: N × M = 100 × 50 = 5000 rows. Every row from A is paired with every row from B.',
                    },
                    {
                        order: 2, difficulty: 'MEDIUM',
                        question: 'Which real-world problem is best solved with a self join?',
                        options: [
                            { id: 'a', text: 'Finding products in multiple categories', isCorrect: false },
                            { id: 'b', text: 'Finding employees and their managers from the same table', isCorrect: true },
                            { id: 'c', text: 'Aggregating sales by month', isCorrect: false },
                            { id: 'd', text: 'Joining two different databases', isCorrect: false },
                        ],
                        explanation: 'Employee-manager hierarchies are stored in one table where manager_id references id in the same table. A self join connects each employee to their manager row.',
                    },
                ],
            },
            {
                order: 3,
                title: 'Interview Questions: SELF & CROSS JOIN',
                type: 'INTERVIEW_QUESTIONS',
                content: `# Interview Questions — SELF JOIN & CROSS JOIN`,
                interviewCards: [
                    {
                        order: 0, category: 'Coding', difficulty: 'MEDIUM',
                        question: 'Write a query to find employees who earn more than their manager.',
                        answer: `\`\`\`sql\nSELECT\n    e.name AS employee,\n    e.salary AS emp_salary,\n    m.name AS manager,\n    m.salary AS mgr_salary\nFROM employees e\nJOIN employees m ON e.manager_id = m.id\nWHERE e.salary > m.salary;\n\`\`\`\n\n**How it works:**\n1. Self-join: alias \`e\` for employees, \`m\` for managers\n2. Join condition: \`e.manager_id = m.id\` connects each employee to their manager\n3. WHERE: filter to only those earning more than their manager\n\nThis is a classic interview question testing self-join understanding.`,
                        codeSnippet: `SELECT e.name AS employee, e.salary,\n       m.name AS manager, m.salary AS mgr_salary\nFROM employees e\nJOIN employees m ON e.manager_id = m.id\nWHERE e.salary > m.salary;`,
                        codeLanguage: 'sql',
                        tags: ['self-join', 'classic-question'],
                    },
                ],
            },
            {
                order: 4,
                title: 'Summary: SELF JOIN & CROSS JOIN',
                type: 'SUMMARY',
                keyTakeaways: [
                    'Self join: same table, different aliases — for hierarchies and row comparisons',
                    'Classic use: employee-manager, consecutive events, compare rows within a table',
                    'CROSS JOIN: cartesian product (N × M rows) — every combination',
                    'CROSS JOIN use: generating grids, combinations, test data',
                    'CROSS JOIN danger: N × M can explode on large tables',
                ],
                content: `# Summary — SELF JOIN & CROSS JOIN

## When to Use

| Pattern | Use Case |
|---------|----------|
| Self Join | Hierarchies, row comparisons, consecutive events |
| Cross Join | Generating all combinations, report grids |`,
            },
        ],
    });

    // ── Learn 3.4: Unit 3 Review — Joins Quiz & Mock Interview ──
    await createLearn({
        slug: 'sql-unit3-review-joins',
        title: 'Unit 3 Review — Joins Quiz & Interview Prep',
        description: 'Comprehensive review of Unit 3: INNER JOIN, LEFT/RIGHT/FULL OUTER JOIN, SELF JOIN, CROSS JOIN, anti-join patterns. 10 quiz questions and interview flashcards covering the most tested join topics.',
        difficulty: 'INTERMEDIATE',
        topicSlug: 'sql-unit3-joins',
        unitTitle: 'Unit 3: Joins & Multi-Table Queries',
        estimatedTime: 30,
        tags: ['review', 'quiz', 'interview-prep', 'unit3', 'joins'],
        iconEmoji: '🎯',
        steps: [
            {
                order: 0,
                title: 'Unit 3 Recap',
                type: 'SUMMARY',
                content: `# Unit 3 Recap — Joins & Multi-Table Queries

## What We Covered

### Learn 3.1: INNER JOIN
- Join mental model: matching rows across tables
- ON clause specifies the match condition
- JOIN = INNER JOIN (INNER is default)
- Multi-table joins and JOIN + GROUP BY

### Learn 3.2: LEFT, RIGHT & FULL OUTER JOIN
- LEFT JOIN keeps all left rows (NULLs for no match)
- Anti-join: LEFT JOIN + WHERE IS NULL
- The WHERE trap: filtering right table converts to INNER
- NOT IN with NULLs danger

### Learn 3.3: SELF JOIN & CROSS JOIN
- Self join: same table, different aliases
- Employee-manager hierarchies
- CROSS JOIN: cartesian product for combinations
- CROSS JOIN danger on large tables`,
                keyTakeaways: [
                    'INNER JOIN: only matching rows from both tables',
                    'LEFT JOIN: all left + matching right (NULL for no match)',
                    'Anti-join: LEFT JOIN + WHERE IS NULL finds rows without matches',
                    'Self join uses aliases to compare rows within the same table',
                    'CROSS JOIN creates N×M rows — use only on small tables',
                    'WHERE trap: filtering right table in WHERE converts LEFT to INNER JOIN',
                ],
            },
            {
                order: 1,
                title: 'Comprehensive Quiz — Unit 3 Joins',
                type: 'QUIZ',
                content: '## Unit 3 Comprehensive Quiz — 10 Questions',
                quizQuestions: [
                    {
                        order: 0, difficulty: 'EASY',
                        question: 'What does INNER JOIN return?',
                        options: [
                            { id: 'a', text: 'All rows from both tables', isCorrect: false },
                            { id: 'b', text: 'Only rows that match on both sides', isCorrect: true },
                            { id: 'c', text: 'All rows from the left table', isCorrect: false },
                            { id: 'd', text: 'The cartesian product', isCorrect: false },
                        ],
                        explanation: 'INNER JOIN returns only rows where the join condition is satisfied on both sides.',
                    },
                    {
                        order: 1, difficulty: 'EASY',
                        question: 'What does LEFT JOIN do when there is no match on the right?',
                        options: [
                            { id: 'a', text: 'Excludes the row', isCorrect: false },
                            { id: 'b', text: 'Fills right columns with NULLs', isCorrect: true },
                            { id: 'c', text: 'Fills right columns with zeros', isCorrect: false },
                            { id: 'd', text: 'Throws an error', isCorrect: false },
                        ],
                        explanation: 'LEFT JOIN keeps all left rows. When no match exists on the right, right-side columns are filled with NULL.',
                    },
                    {
                        order: 2, difficulty: 'MEDIUM',
                        question: 'How do you find customers who have never placed an order?',
                        options: [
                            { id: 'a', text: 'INNER JOIN customers and orders', isCorrect: false },
                            { id: 'b', text: 'LEFT JOIN customers to orders WHERE orders.id IS NULL', isCorrect: true },
                            { id: 'c', text: 'CROSS JOIN customers and orders', isCorrect: false },
                            { id: 'd', text: 'RIGHT JOIN orders to customers', isCorrect: false },
                        ],
                        explanation: 'The anti-join pattern: LEFT JOIN + WHERE right.id IS NULL keeps only left rows that had NO match on the right.',
                    },
                    {
                        order: 3, difficulty: 'HARD',
                        question: 'What happens when you filter the RIGHT table of a LEFT JOIN in WHERE instead of ON?',
                        options: [
                            { id: 'a', text: 'Nothing different', isCorrect: false },
                            { id: 'b', text: 'It converts the LEFT JOIN into an INNER JOIN', isCorrect: true },
                            { id: 'c', text: 'It throws an error', isCorrect: false },
                            { id: 'd', text: 'It makes the query faster', isCorrect: false },
                        ],
                        explanation: 'WHERE filters after the join. For unmatched rows, right columns are NULL. NULL compared to anything is UNKNOWN → row removed → behaves like INNER JOIN.',
                    },
                    {
                        order: 4, difficulty: 'MEDIUM',
                        question: 'What is a self join?',
                        options: [
                            { id: 'a', text: 'A join that runs automatically', isCorrect: false },
                            { id: 'b', text: 'Joining a table to itself using different aliases', isCorrect: true },
                            { id: 'c', text: 'A recursive query', isCorrect: false },
                            { id: 'd', text: 'A join without conditions', isCorrect: false },
                        ],
                        explanation: 'Self join: same table with different aliases. FROM employees e JOIN employees m ON e.manager_id = m.id.',
                    },
                    {
                        order: 5, difficulty: 'EASY',
                        question: 'Table A has 5 rows, Table B has 4 rows. CROSS JOIN produces how many rows?',
                        options: [
                            { id: 'a', text: '9', isCorrect: false },
                            { id: 'b', text: '5', isCorrect: false },
                            { id: 'c', text: '20', isCorrect: true },
                            { id: 'd', text: '4', isCorrect: false },
                        ],
                        explanation: 'CROSS JOIN = cartesian product = N × M = 5 × 4 = 20 rows.',
                    },
                    {
                        order: 6, difficulty: 'HARD',
                        question: 'Why is NOT IN (subquery) dangerous when the subquery can return NULLs?',
                        options: [
                            { id: 'a', text: 'It throws an error', isCorrect: false },
                            { id: 'b', text: 'If ANY value is NULL, NOT IN returns no rows at all', isCorrect: true },
                            { id: 'c', text: 'It ignores the NULLs', isCorrect: false },
                            { id: 'd', text: 'It\'s slower', isCorrect: false },
                        ],
                        explanation: 'NOT IN (1, 2, NULL) evaluates x != 1 AND x != 2 AND x != NULL. The NULL comparison is always UNKNOWN, making the entire AND UNKNOWN → no rows returned.',
                    },
                    {
                        order: 7, difficulty: 'MEDIUM',
                        question: 'Which is preferred: RIGHT JOIN or LEFT JOIN?',
                        options: [
                            { id: 'a', text: 'RIGHT JOIN is standard', isCorrect: false },
                            { id: 'b', text: 'LEFT JOIN is preferred (swap table order instead of RIGHT)', isCorrect: true },
                            { id: 'c', text: 'They can\'t be interchanged', isCorrect: false },
                            { id: 'd', text: 'Neither — use FULL OUTER JOIN', isCorrect: false },
                        ],
                        explanation: 'LEFT JOIN is the convention. A RIGHT JOIN B is identical to B LEFT JOIN A. Using LEFT JOIN consistently makes queries more readable.',
                    },
                    {
                        order: 8, difficulty: 'MEDIUM',
                        question: 'When should you use CROSS JOIN intentionally?',
                        options: [
                            { id: 'a', text: 'To combine large tables for analysis', isCorrect: false },
                            { id: 'b', text: 'To generate all combinations from small lookup tables (sizes × colors, dates × categories)', isCorrect: true },
                            { id: 'c', text: 'As a faster alternative to INNER JOIN', isCorrect: false },
                            { id: 'd', text: 'Never — it\'s always wrong', isCorrect: false },
                        ],
                        explanation: 'CROSS JOIN is useful for generating complete grids: all date × category combinations, all size × color combinations for product variants. Only use on small tables.',
                    },
                    {
                        order: 9, difficulty: 'MEDIUM',
                        question: 'COUNT(o.id) in a LEFT JOIN query where some customers have no orders — what does it return for those customers?',
                        options: [
                            { id: 'a', text: '1 (counts the NULL row)', isCorrect: false },
                            { id: 'b', text: '0 (COUNT skips NULLs)', isCorrect: true },
                            { id: 'c', text: 'NULL', isCorrect: false },
                            { id: 'd', text: 'Error', isCorrect: false },
                        ],
                        explanation: 'COUNT(column) skips NULLs. For customers with no orders, o.id is NULL → COUNT(o.id) = 0. COUNT(*) would return 1 (counts the row regardless of NULLs).',
                    },
                ],
            },
            {
                order: 2,
                title: 'Interview Prep — Unit 3 Flashcards',
                type: 'INTERVIEW_QUESTIONS',
                content: `# Unit 3 Interview Flashcards — Joins Mastery`,
                interviewCards: [
                    {
                        order: 0, category: 'Conceptual', difficulty: 'EASY',
                        question: 'Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN.',
                        answer: `**INNER JOIN:** Only rows that match in **both** tables.\n\n**LEFT JOIN:** All rows from the **left** table + matching from right. NULLs where no match.\n\n**FULL OUTER JOIN:** All rows from **both** tables. NULLs on either side where no match.\n\n**Visual:**\n- INNER: A ∩ B\n- LEFT: A + (A ∩ B)\n- FULL OUTER: A ∪ B\n\n**Key insight:** INNER is restrictive (fewer rows). LEFT is inclusive of the left table. FULL OUTER is inclusive of everything.`,
                        tags: ['join-types', 'must-know'],
                    },
                    {
                        order: 1, category: 'Coding', difficulty: 'MEDIUM',
                        question: 'Write a query to find all products that have never been ordered.',
                        answer: `**Three equivalent approaches:**\n\n**Method 1: LEFT JOIN + IS NULL (most common)**\n\`\`\`sql\nSELECT p.name, p.price\nFROM products p\nLEFT JOIN order_items oi ON p.id = oi.product_id\nWHERE oi.id IS NULL;\n\`\`\`\n\n**Method 2: NOT EXISTS (often fastest)**\n\`\`\`sql\nSELECT p.name, p.price\nFROM products p\nWHERE NOT EXISTS (\n    SELECT 1 FROM order_items oi WHERE oi.product_id = p.id\n);\n\`\`\`\n\n**Method 3: NOT IN (avoid if NULLs possible)**\n\`\`\`sql\nSELECT name, price FROM products\nWHERE id NOT IN (SELECT product_id FROM order_items WHERE product_id IS NOT NULL);\n\`\`\``,
                        codeSnippet: `SELECT p.name FROM products p\nLEFT JOIN order_items oi ON p.id = oi.product_id\nWHERE oi.id IS NULL;`,
                        codeLanguage: 'sql',
                        tags: ['anti-join', 'classic-question'],
                    },
                    {
                        order: 2, category: 'Coding', difficulty: 'MEDIUM',
                        question: 'Write a query to find employees and their managers from the same table.',
                        answer: `\`\`\`sql\nSELECT\n    e.name AS employee,\n    e.department,\n    COALESCE(m.name, 'No Manager') AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.id\nORDER BY m.name NULLS FIRST, e.name;\n\`\`\`\n\n**Key points:**\n- **Self join:** same table, two aliases (e for employee, m for manager)\n- **LEFT JOIN:** CEO has no manager (manager_id = NULL) — still included\n- **COALESCE:** display "No Manager" instead of NULL for the CEO\n\nThis is the most classic self-join interview question.`,
                        codeSnippet: `SELECT e.name AS employee, COALESCE(m.name, 'No Manager') AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.id;`,
                        codeLanguage: 'sql',
                        tags: ['self-join', 'classic-question'],
                    },
                ],
            },
            {
                order: 3,
                title: 'What\'s Next: Unit 4 — Subqueries, CTEs & Window Functions',
                type: 'SUMMARY',
                content: `# Unit 3 Complete!

## You Now Know

- INNER JOIN for matching rows from multiple tables
- LEFT/RIGHT/FULL OUTER JOIN for inclusive queries
- Anti-join pattern to find rows without matches
- Self join for hierarchies and row comparisons
- CROSS JOIN for generating combinations

## Next: Unit 4 — Subqueries, CTEs & Window Functions

Unit 4 covers the tools that separate average SQL writers from strong ones:
- **Subqueries** — queries inside queries
- **CTEs** — readable, reusable query building blocks
- **Recursive CTEs** — hierarchical data traversal
- **Window Functions** — ROW_NUMBER, RANK, LAG, LEAD, running totals
- **Real-World Patterns** — top-N per group, gaps & islands, consecutive streaks

These are the most tested topics in intermediate-to-senior SQL interviews!`,
            },
        ],
    });

    // ── Step 3: Create LearnPrerequisite links for sequential navigation ──
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
    const totalCount = await prisma.learn.count({ where: { subCategoryId: sql.id } });
    await prisma.learnSubCategory.update({
        where: { id: sql.id },
        data: { learnCount: totalCount },
    });

    console.log(`\n✅ SQL Learn seeded: ${createdLearns.length} learns across ${topicDefs.length} topics`);
}
