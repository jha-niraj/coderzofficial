# SQL Learn Module — Complete Syllabus & Learn Mapping
**Platform: BuildrHQ**
**SubCategory: SQL**
**Total Learns: 38 | Units: 6**

---

## Category Hierarchy

```
LearnMainCategory: "Programming"
  └── LearnSubCategory: "SQL"
        ├── slug: "sql"
        ├── icon: "🗄️"
        ├── color: "#F97316"
        │
        └── LearnTopics:
              ├── Unit 1 — Foundations (6 Learns)
              ├── Unit 2 — Core SQL (6 Learns)
              ├── Unit 3 — Joins & Relationships (6 Learns)
              ├── Unit 4 — Subqueries, CTEs & Window Functions (7 Learns)
              ├── Unit 5 — Performance & Schema Design (7 Learns)
              └── Unit 6 — Advanced & Real-World SQL (6 Learns)
```

---

## UNIT 1 — Foundations of SQL & Databases
**Unit Goal:** Understand what SQL is, how databases work, and the core theory you'll be asked about in any interview.

---

### Learn 1.1 — What is SQL & How Databases Work
**Difficulty:** BEGINNER | **Est. Time:** 20 min | **Tags:** `[sql, rdbms, database, intro]`

**Steps:** `EXPLANATION → COMPARISON(SQL vs NoSQL) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- What a relational database is and why it exists
- Tables, rows, columns — the mental model
- SQL vs NoSQL: when each is used (interview classic)
- Popular databases: MySQL, PostgreSQL, SQL Server, SQLite, Oracle
- The role of a DBMS

**Interview relevance:** "What is SQL?" / "Difference between SQL and NoSQL?" — always asked.

---

### Learn 1.2 — ACID Properties & Database Transactions
**Difficulty:** BEGINNER | **Est. Time:** 20 min | **Tags:** `[acid, transactions, atomicity, consistency]`

**Steps:** `EXPLANATION → VISUALIZATION(ACID diagram) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Atomicity, Consistency, Isolation, Durability — each defined clearly
- What a transaction is and why it matters
- Real-world examples for each ACID property
- What happens when ACID is violated (data corruption, lost updates)
- Commit and Rollback basics

**Interview relevance:** "Explain ACID properties" — top 5 SQL interview question globally.

---

### Learn 1.3 — Data Types, NULL & Constraints
**Difficulty:** BEGINNER | **Est. Time:** 25 min | **Tags:** `[datatypes, null, constraints, primary-key, foreign-key]`

**Steps:** `EXPLANATION → CODE(3 blocks: CREATE TABLE examples) → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Core data types: INT, VARCHAR, TEXT, DATE, BOOLEAN, DECIMAL, FLOAT
- What NULL means (unknown, not zero, not empty string)
- PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, CHECK, DEFAULT
- Why constraints exist and what they enforce
- Common mistakes with NULL comparisons (`= NULL` vs `IS NULL`)

**Interview relevance:** "What is a primary key vs foreign key?" / "What is NULL in SQL?" — foundational.

---

### Learn 1.4 — Normalization & Database Design (1NF → 3NF / BCNF)
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[normalization, 1nf, 2nf, 3nf, bcnf, design]`

**Steps:** `EXPLANATION → VISUALIZATION(before/after tables) → CODE(2 blocks: schema design) → COMPARISON(NF levels) → QUIZ(5) → SUMMARY`

**What you'll learn:**
- Why we normalize: eliminate redundancy, prevent anomalies
- 1NF: atomic values, no repeating groups
- 2NF: no partial dependencies (composite key tables)
- 3NF: no transitive dependencies
- BCNF: the stricter 3NF
- When to deliberately denormalize (performance trade-off)
- Update, insert, delete anomalies — what they are

**Interview relevance:** "Explain normalization" / "Difference between 2NF and 3NF?" — extremely common.

---

### Learn 1.5 — Schema Design & Table Relationships
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[schema, relationships, one-to-many, many-to-many, erd]`

**Steps:** `EXPLANATION → VISUALIZATION(ERD diagram) → CODE(3 blocks: schema examples) → QUIZ(4) → CHALLENGE → SUMMARY`

**What you'll learn:**
- One-to-One, One-to-Many, Many-to-Many relationships
- How to implement Many-to-Many with a junction table
- Foreign key references and cascading (ON DELETE CASCADE)
- Reading and designing an ERD
- Practical schema for real apps: users/orders/products

**Interview relevance:** Schema design rounds are extremely common in data engineering and backend interviews.

---

### Learn 1.6 — Isolation Levels & Concurrency Problems
**Difficulty:** INTERMEDIATE | **Est. Time:** 20 min | **Tags:** `[isolation, concurrency, dirty-read, phantom-read, transactions]`

**Steps:** `EXPLANATION → COMPARISON(isolation levels table) → VISUALIZATION → QUIZ(4) → SUMMARY`

**What you'll learn:**
- The 4 concurrency problems: dirty read, non-repeatable read, phantom read, lost update
- The 4 isolation levels: READ UNCOMMITTED → READ COMMITTED → REPEATABLE READ → SERIALIZABLE
- Which problems each isolation level prevents
- Default isolation level in MySQL vs PostgreSQL
- Performance trade-offs of higher isolation

**Interview relevance:** "What are isolation levels?" — asked frequently in senior/data engineering interviews.

---

### Unit 1 Review — Foundations Quiz & Mock Interview
**Steps:** `SUMMARY(unit recap) → QUIZ(10 comprehensive) → MOCK_INTERVIEW → PROJECT(mini: Design a schema for an e-commerce app)`

---
---

## UNIT 2 — Core SQL: Writing Queries
**Unit Goal:** Write confident, clean SQL queries covering everything from basic SELECT to complex filtering, aggregation and grouping.

---

### Learn 2.1 — SELECT, FROM, WHERE & Filtering Basics
**Difficulty:** BEGINNER | **Est. Time:** 25 min | **Tags:** `[select, where, filter, comparison, logical-operators]`

**Steps:** `EXPLANATION → CODE(5 blocks) → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- SELECT *, SELECT columns, expressions and aliases (`AS`)
- WHERE clause with comparison operators: `=`, `!=`, `<`, `>`, `<=`, `>=`
- Logical operators: `AND`, `OR`, `NOT`
- Filtering with NULL: `IS NULL`, `IS NOT NULL`
- `BETWEEN`, `IN`, `LIKE` pattern matching (`%`, `_`)
- `DISTINCT` to remove duplicates
- `ORDER BY` (ASC/DESC), `LIMIT` and `OFFSET`

**Interview relevance:** Every SQL round starts here. Must be flawless.

---

### Learn 2.2 — String, Date & Type Functions
**Difficulty:** BEGINNER | **Est. Time:** 25 min | **Tags:** `[string-functions, date-functions, type-casting, concat]`

**Steps:** `EXPLANATION → CODE(5 blocks) → COMPARISON(MySQL vs PostgreSQL syntax) → QUIZ(4) → CHALLENGE → SUMMARY`

**What you'll learn:**
- String: `UPPER`, `LOWER`, `TRIM`, `LENGTH`, `SUBSTRING`, `REPLACE`, `CONCAT`, `COALESCE`
- Date: `NOW()`, `CURRENT_DATE`, `DATE_DIFF`, `DATE_ADD`, `EXTRACT`, `DATE_FORMAT`
- Type casting: `CAST()`, `CONVERT()`, implicit vs explicit casting
- `COALESCE` and `NULLIF` for NULL handling
- Differences across MySQL / PostgreSQL / SQL Server

**Interview relevance:** String/date function questions appear in almost every practical SQL test.

---

### Learn 2.3 — Aggregate Functions & GROUP BY
**Difficulty:** BEGINNER | **Est. Time:** 30 min | **Tags:** `[aggregate, count, sum, avg, min, max, group-by, having]`

**Steps:** `EXPLANATION → VISUALIZATION(GROUP BY mental model) → CODE(5 blocks) → QUIZ(5) → CHALLENGE(2) → SUMMARY`

**What you'll learn:**
- `COUNT(*)` vs `COUNT(column)` — NULL behaviour difference
- `SUM`, `AVG`, `MIN`, `MAX` with NULLs
- `GROUP BY` — grouping rows into buckets
- `HAVING` — filtering after grouping (vs WHERE which filters before)
- Multiple aggregates in one query
- Conditional aggregation: `SUM(CASE WHEN ... END)`, `COUNT(CASE WHEN ... END)`
- `GROUP BY` with expressions and aliases

**Interview relevance:** "Find the top N per group" type questions are everywhere. GROUP BY is a core skill.

---

### Learn 2.4 — CASE Statements & Conditional Logic
**Difficulty:** BEGINNER | **Est. Time:** 20 min | **Tags:** `[case, conditional, if, coalesce, nullif]`

**Steps:** `EXPLANATION → CODE(4 blocks) → QUIZ(4) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Simple CASE: `CASE column WHEN value THEN result`
- Searched CASE: `CASE WHEN condition THEN result`
- CASE inside SELECT, WHERE, ORDER BY, and aggregate functions
- Pivoting rows to columns using CASE + GROUP BY
- `COALESCE` as shorthand for NULL-fallback CASE
- Nesting CASE statements

**Interview relevance:** Pivot-style questions and conditional bucketing are very common in analytics interviews.

---

### Learn 2.5 — INSERT, UPDATE, DELETE & MERGE
**Difficulty:** BEGINNER | **Est. Time:** 25 min | **Tags:** `[insert, update, delete, truncate, merge, upsert, dml]`

**Steps:** `EXPLANATION → CODE(5 blocks) → QUIZ(4) → CHALLENGE → SUMMARY`

**What you'll learn:**
- `INSERT INTO` — single row, multiple rows, INSERT from SELECT
- `UPDATE` — updating one or many rows, UPDATE with JOIN
- `DELETE` vs `TRUNCATE` vs `DROP` — the key differences
- `MERGE` / `UPSERT` — INSERT if not exists, UPDATE if exists
- Safe UPDATE/DELETE: always filter first, use transactions
- Returning affected rows

**Interview relevance:** "Difference between DELETE and TRUNCATE?" — nearly universal interview question.

---

### Learn 2.6 — ROLLUP, CUBE & Advanced Grouping
**Difficulty:** INTERMEDIATE | **Est. Time:** 20 min | **Tags:** `[rollup, cube, grouping-sets, subtotals]`

**Steps:** `EXPLANATION → CODE(3 blocks) → COMPARISON(ROLLUP vs CUBE vs GROUPING SETS) → QUIZ(3) → CHALLENGE → SUMMARY`

**What you'll learn:**
- `ROLLUP` — hierarchical subtotals (great for reports)
- `CUBE` — all possible subtotal combinations
- `GROUPING SETS` — custom grouping combinations
- `GROUPING()` function to identify subtotal rows
- Real-world use: sales reports with subtotals per region/category/total

**Interview relevance:** Appears in analytics/data engineering interviews, especially for reporting roles.

---

### Unit 2 Review — Core SQL Quiz & Mock Interview
**Steps:** `SUMMARY → QUIZ(10) → MOCK_INTERVIEW → PROJECT(mini: Sales summary report query)`

---
---

## UNIT 3 — Joins & Multi-Table Queries
**Unit Goal:** Master every join type, understand NULL behaviour across joins, and solve the classic "find rows with no match" pattern confidently.

---

### Learn 3.1 — INNER JOIN & The Join Mental Model
**Difficulty:** BEGINNER | **Est. Time:** 25 min | **Tags:** `[inner-join, join, foreign-key, matching]`

**Steps:** `EXPLANATION → VISUALIZATION(Venn diagrams + row matching) → CODE(4 blocks) → QUIZ(4) → CHALLENGE → SUMMARY`

**What you'll learn:**
- The join mental model: matching rows across tables
- `INNER JOIN` — only rows that match on both sides
- Join on primary key / foreign key
- Multi-column join conditions
- Joining on non-key columns (join conditions beyond equality)
- Table aliases for readability
- Why join order matters for readability (not always for performance)

**Interview relevance:** Every SQL test has at least one join question. This must be rock solid.

---

### Learn 3.2 — LEFT, RIGHT & FULL OUTER JOIN
**Difficulty:** BEGINNER | **Est. Time:** 25 min | **Tags:** `[left-join, right-join, full-outer-join, null-in-joins]`

**Steps:** `EXPLANATION → VISUALIZATION(Venn + table output comparison) → CODE(4 blocks) → COMPARISON(all join types) → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- `LEFT JOIN` — all rows from left, NULLs where no match on right
- `RIGHT JOIN` — all rows from right (less common, prefer LEFT)
- `FULL OUTER JOIN` — all rows from both sides
- NULL behaviour: unmatched rows get NULL for the other table's columns
- Filtering NULLs after a LEFT JOIN (`WHERE right.id IS NULL`) — the ANTI-JOIN
- When to use LEFT JOIN vs INNER JOIN
- Common mistake: filtering LEFT JOIN results in WHERE (converts it to INNER)

**Interview relevance:** "Difference between INNER and LEFT JOIN?" is the most common SQL interview question.

---

### Learn 3.3 — SELF JOIN & CROSS JOIN
**Difficulty:** INTERMEDIATE | **Est. Time:** 20 min | **Tags:** `[self-join, cross-join, cartesian-product]`

**Steps:** `EXPLANATION → CODE(3 blocks) → QUIZ(3) → CHALLENGE → SUMMARY`

**What you'll learn:**
- `SELF JOIN` — joining a table to itself (employee/manager hierarchies)
- Use cases: comparing rows within the same table, hierarchy queries
- `CROSS JOIN` — cartesian product, every row with every row
- When CROSS JOIN is intentional (generating combinations, date grids)
- CROSS JOIN size explosion — why it's dangerous on large tables

**Interview relevance:** Self-join "find employees and their managers" is a classic interview question.

---

### Learn 3.4 — ANTI-JOIN, SEMI-JOIN & EXISTS Pattern
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[anti-join, semi-join, exists, not-exists, not-in]`

**Steps:** `EXPLANATION → CODE(4 blocks) → COMPARISON(EXISTS vs NOT IN vs LEFT JOIN IS NULL) → QUIZ(4) → CHALLENGE → SUMMARY`

**What you'll learn:**
- ANTI-JOIN: find rows in A with no match in B (3 ways to write it)
- Method 1: `LEFT JOIN ... WHERE B.id IS NULL`
- Method 2: `NOT EXISTS (subquery)`
- Method 3: `NOT IN (subquery)` — and the NULL trap with NOT IN
- SEMI-JOIN: filter A based on existence in B (`EXISTS`)
- Performance comparison: which approach is fastest and why
- Real-world: "Find customers who never placed an order"

**Interview relevance:** "Find records with no match" is asked constantly. The NOT IN NULL trap is a famous gotcha.

---

### Learn 3.5 — Multi-Table Joins & JOIN with Aggregation
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[multi-join, join-aggregation, group-by-join]`

**Steps:** `EXPLANATION → CODE(5 blocks) → QUIZ(5) → CHALLENGE(2) → SUMMARY`

**What you'll learn:**
- Joining 3+ tables in a single query
- Join order and how it affects readability
- Combining JOINs with GROUP BY and aggregate functions
- Many-to-Many joins through junction tables
- Avoiding duplicate rows with aggregation after joins
- Common mistake: aggregating before joining vs after
- Interview-style problems: orders + customers + products + categories

**Interview relevance:** Real-world query writing rounds always involve 3+ table joins with aggregation.

---

### Learn 3.6 — LATERAL JOIN & Advanced Join Patterns
**Difficulty:** ADVANCED | **Est. Time:** 25 min | **Tags:** `[lateral-join, apply, correlated-join, advanced-join]`

**Steps:** `EXPLANATION → CODE(3 blocks) → COMPARISON(LATERAL vs subquery) → QUIZ(3) → CHALLENGE → SUMMARY`

**What you'll learn:**
- `LATERAL JOIN` (PostgreSQL) / `CROSS APPLY` (SQL Server) — what it means
- When LATERAL is needed: referencing outer query columns inside a subquery
- "Top N per group" pattern using LATERAL JOIN
- Differences from regular subqueries
- Performance considerations

**Interview relevance:** Appears in senior and data engineering interviews. Shows depth of SQL knowledge.

---

### Unit 3 Review — Joins Quiz & Mock Interview
**Steps:** `SUMMARY → QUIZ(10) → MOCK_INTERVIEW → PROJECT(mini: Multi-table reporting query — orders, customers, products)`

---
---

## UNIT 4 — Subqueries, CTEs & Window Functions
**Unit Goal:** Go from writing flat queries to composing complex, layered SQL. Master the tools that separate average SQL writers from strong ones.

---

### Learn 4.1 — Subqueries (Scalar, IN, EXISTS, Derived Tables)
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[subquery, scalar, derived-table, correlated]`

**Steps:** `EXPLANATION → CODE(5 blocks) → COMPARISON(subquery types) → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Scalar subquery: returns single value, usable in SELECT or WHERE
- Subquery in WHERE with IN / NOT IN / EXISTS / NOT EXISTS
- Derived table (subquery in FROM): treating a query as a table
- Correlated subquery: references the outer query, runs once per row
- When subqueries are bad for performance and when they're fine
- Rewriting subqueries as JOINs (and when not to)

**Interview relevance:** Subqueries are in every intermediate SQL test. Correlated subqueries are a common hard question.

---

### Learn 4.2 — Common Table Expressions (CTEs)
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[cte, with-clause, readability, reusable-queries]`

**Steps:** `EXPLANATION → CODE(4 blocks) → COMPARISON(CTE vs subquery vs temp table) → QUIZ(4) → CHALLENGE → SUMMARY`

**What you'll learn:**
- CTE syntax: `WITH cte_name AS (SELECT ...)`
- Multiple CTEs chained together
- CTE vs subquery: when CTEs are cleaner
- CTE vs temp tables: key differences
- Materialized vs non-materialized CTEs (PostgreSQL)
- Using CTEs for step-by-step problem solving in interviews
- Common pitfall: CTEs are not always more performant

**Interview relevance:** CTEs are the clean, readable way to write complex queries. Interviewers love seeing them.

---

### Learn 4.3 — Recursive CTEs & Hierarchical Data
**Difficulty:** ADVANCED | **Est. Time:** 30 min | **Tags:** `[recursive-cte, hierarchy, tree, org-chart, graph]`

**Steps:** `EXPLANATION → VISUALIZATION(tree traversal) → CODE(4 blocks) → QUIZ(4) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Recursive CTE structure: anchor member + recursive member + UNION ALL
- Traversing org charts: employee → manager → manager's manager
- Building a path or breadcrumb trail through recursion
- Depth limiting to prevent infinite loops (`MAXRECURSION` / level counter)
- Generating number sequences and date ranges with recursive CTEs
- Bottom-up vs top-down traversal

**Interview relevance:** "Write a query to find all employees under a given manager" — classic advanced question.

---

### Learn 4.4 — Window Functions: ROW_NUMBER, RANK, DENSE_RANK
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[window-functions, row-number, rank, dense-rank, partition-by]`

**Steps:** `EXPLANATION → VISUALIZATION(partition + ranking diagram) → CODE(5 blocks) → QUIZ(5) → CHALLENGE(2) → SUMMARY`

**What you'll learn:**
- What window functions are: compute across a "window" without collapsing rows
- `OVER()` clause — the key to window functions
- `PARTITION BY` — reset the calculation per group
- `ORDER BY` inside OVER — controls ranking/sequence order
- `ROW_NUMBER()` — unique sequential number per partition
- `RANK()` — gaps after ties
- `DENSE_RANK()` — no gaps after ties
- Classic use: "Get the latest order per customer" (ROW_NUMBER + CTE filter)
- `NTILE(n)` — divide rows into n equal buckets

**Interview relevance:** "Top N per group" and "Rank within a category" — the most common intermediate SQL interview question type.

---

### Learn 4.5 — Window Functions: LAG, LEAD, Running Totals & Frames
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[lag, lead, running-total, moving-average, window-frame]`

**Steps:** `EXPLANATION → CODE(5 blocks) → VISUALIZATION(frame diagram) → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- `LAG(col, n)` — access a previous row's value
- `LEAD(col, n)` — access a next row's value
- `FIRST_VALUE()` / `LAST_VALUE()` — first/last in window
- `NTH_VALUE()` — nth row in window
- Running totals: `SUM() OVER (ORDER BY date)`
- Moving averages: `AVG() OVER (ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)`
- Window frame: `ROWS` vs `RANGE` — the subtle and important difference
- `UNBOUNDED PRECEDING`, `CURRENT ROW`, `UNBOUNDED FOLLOWING`

**Interview relevance:** "Calculate month-over-month growth" / "7-day moving average" — very common in data/analytics interviews.

---

### Learn 4.6 — Window Functions vs GROUP BY vs Subqueries
**Difficulty:** INTERMEDIATE | **Est. Time:** 20 min | **Tags:** `[window-vs-groupby, performance, when-to-use]`

**Steps:** `EXPLANATION → COMPARISON(3-way comparison with examples) → CODE(3 blocks) → QUIZ(4) → CHALLENGE → SUMMARY`

**What you'll learn:**
- When to use GROUP BY: you want one row per group
- When to use window functions: you want all rows + aggregate values alongside
- When to use subqueries/CTEs: you need intermediate results
- Rewriting GROUP BY queries as window functions (and vice versa)
- Performance implications of each approach
- The "filter after window function" pattern using CTE wrapper

**Interview relevance:** Shows you understand not just syntax but the right tool for each situation.

---

### Learn 4.7 — Real-World Query Patterns (Interview Classics)
**Difficulty:** ADVANCED | **Est. Time:** 35 min | **Tags:** `[interview-patterns, top-n, running-total, gaps-islands, pivot]`

**Steps:** `EXPLANATION → CODE(6 blocks) → QUIZ(5) → CHALLENGE(3) → MOCK_INTERVIEW → SUMMARY`

**What you'll learn (each is a standalone pattern):**
- **Top N per group** — most recent order per customer, top 3 products per category
- **Running totals & cumulative sums** — revenue over time
- **Month-over-month / YoY comparison** using LAG
- **Pivot: rows to columns** using CASE + GROUP BY
- **Gaps and Islands** — finding consecutive sequences (classic hard question)
- **Deduplication** — keep one row per duplicate group
- **Consecutive day streaks** — login streaks, activity tracking

**Interview relevance:** This entire Learn IS interview prep. These are the questions that separate strong candidates.

---

### Unit 4 Review — Subqueries/CTEs/Window Functions
**Steps:** `SUMMARY → QUIZ(10) → MOCK_INTERVIEW → PROJECT(major: Full analytics report — cohort retention, top products, MoM growth)`

---
---

## UNIT 5 — Query Performance & Schema Design
**Unit Goal:** Understand why queries are slow, how to read execution plans, how indexes work, and how to design schemas that scale.

---

### Learn 5.1 — How SQL Query Execution Works
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[query-execution, execution-order, optimizer, parsing]`

**Steps:** `EXPLANATION → VISUALIZATION(execution order diagram) → CODE(3 blocks) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- The logical order of SQL execution: FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
- Why you can't use a SELECT alias in WHERE (execution order!)
- How the query optimizer works (simplified)
- Query parsing, planning, and execution phases
- Why understanding execution order prevents common mistakes

**Interview relevance:** "Can you use a column alias in WHERE?" — tests execution order knowledge. Common gotcha question.

---

### Learn 5.2 — Indexes: Types, How They Work & When to Use Them
**Difficulty:** INTERMEDIATE | **Est. Time:** 35 min | **Tags:** `[indexes, b-tree, composite-index, covering-index, index-design]`

**Steps:** `EXPLANATION → VISUALIZATION(B-tree diagram) → CODE(4 blocks) → COMPARISON(index types) → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- What an index is: a sorted data structure for fast lookups
- B-Tree index (the default): how it works, what queries it helps
- Composite index: column order matters (`(a, b)` vs `(b, a)`)
- The leftmost prefix rule for composite indexes
- Covering index: index includes all columns needed (no table lookup)
- Unique index, Full-text index, Hash index, Partial index
- When NOT to index: write-heavy tables, low-cardinality columns
- Index on foreign key columns (often forgotten)

**Interview relevance:** "What is an index?" / "How do composite indexes work?" — very frequent in backend and data interviews.

---

### Learn 5.3 — Reading EXPLAIN Plans
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[explain, execution-plan, seq-scan, index-scan, cost]`

**Steps:** `EXPLANATION → CODE(5 blocks: EXPLAIN outputs) → VISUALIZATION(plan tree) → QUIZ(4) → CHALLENGE → SUMMARY`

**What you'll learn:**
- `EXPLAIN` and `EXPLAIN ANALYZE` — what each shows
- Reading EXPLAIN output: type, key, rows, Extra columns (MySQL)
- PostgreSQL EXPLAIN output: Seq Scan, Index Scan, Bitmap Scan, Hash Join, Nested Loop
- Cost estimates: startup cost vs total cost
- `rows` estimate vs actual: why they differ (stale statistics)
- Warning signs in EXPLAIN: full table scans, filesort, temporary tables
- How to use EXPLAIN to validate an index is being used

**Interview relevance:** Senior SQL interviews ask "How would you optimize this query?" — EXPLAIN is the answer.

---

### Learn 5.4 — Query Optimization Techniques
**Difficulty:** ADVANCED | **Est. Time:** 30 min | **Tags:** `[optimization, rewriting, sargable, index-hints, avoid-functions-on-columns]`

**Steps:** `EXPLANATION → CODE(5 blocks: before/after rewrites) → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- SARGable queries: write filters the index can use (`WHERE date >= '2024-01-01'` not `WHERE YEAR(date) = 2024`)
- Avoid functions on indexed columns in WHERE
- SELECT only what you need (avoid SELECT *)
- Prefer EXISTS over COUNT for existence checks
- Avoid `NOT IN` with NULLs — use NOT EXISTS
- Optimize LIKE: `LIKE 'abc%'` uses index, `LIKE '%abc%'` does not
- Join order and its impact on performance
- Rewriting correlated subqueries as joins

**Interview relevance:** Optimization questions are the core of senior SQL interviews.

---

### Learn 5.5 — Views, Materialized Views & Stored Procedures
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[views, materialized-views, stored-procedures, triggers]`

**Steps:** `EXPLANATION → CODE(4 blocks) → COMPARISON(view vs materialized view) → QUIZ(4) → CHALLENGE → SUMMARY`

**What you'll learn:**
- `CREATE VIEW` — a saved query, always fresh data
- Using views for security (expose only certain columns/rows)
- Updatable vs non-updatable views
- Materialized view — physically stores results, needs refreshing
- `CREATE MATERIALIZED VIEW ... WITH DATA` (PostgreSQL)
- When to use materialized views: expensive aggregations
- Stored procedures: parameterized reusable SQL blocks
- Triggers: auto-run on INSERT/UPDATE/DELETE
- Pros and cons of stored procedures vs application-layer logic

**Interview relevance:** "Difference between view and materialized view?" is a common intermediate question.

---

### Learn 5.6 — Partitioning, Sharding & Scaling Concepts
**Difficulty:** ADVANCED | **Est. Time:** 25 min | **Tags:** `[partitioning, sharding, horizontal-scaling, table-partitioning]`

**Steps:** `EXPLANATION → VISUALIZATION(partition diagram) → CODE(3 blocks) → COMPARISON(partitioning strategies) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Table partitioning: splitting one large table into smaller physical parts
- Range partitioning (by date), List partitioning, Hash partitioning
- Benefits: faster queries on partitions, easier data archival
- Partition pruning — how the optimizer skips irrelevant partitions
- Sharding: horizontal partitioning across multiple servers
- Sharding vs partitioning: key conceptual difference
- When to shard: true web-scale write/read demands

**Interview relevance:** System design and data engineering interviews ask about scaling databases.

---

### Learn 5.7 — Denormalization, Caching & Real-World Trade-offs
**Difficulty:** ADVANCED | **Est. Time:** 20 min | **Tags:** `[denormalization, caching, trade-offs, read-vs-write]`

**Steps:** `EXPLANATION → COMPARISON(normalized vs denormalized) → CODE(2 blocks) → QUIZ(3) → SUMMARY`

**What you'll learn:**
- When normalization hurts performance (too many joins)
- Denormalization strategies: pre-aggregated tables, flattened tables, redundant columns
- Caching query results: application layer cache vs database cache
- Read replicas: route SELECT queries to replicas
- Trade-off framework: consistency vs performance vs simplicity
- Real examples: social media feed, e-commerce product listing

**Interview relevance:** Shows you understand production realities, not just theory — senior interview signal.

---

### Unit 5 Review — Performance & Design Quiz & Mock Interview
**Steps:** `SUMMARY → QUIZ(10) → MOCK_INTERVIEW → PROJECT(major: Optimize a slow query + redesign schema for scale)`

---
---

## UNIT 6 — Advanced SQL & Interview Mastery
**Unit Goal:** Cover the remaining advanced topics and prepare for real interview rounds with practice on hard SQL problems.

---

### Learn 6.1 — Advanced Filtering: REGEX, Complex Patterns & NULL-Safe Logic
**Difficulty:** INTERMEDIATE | **Est. Time:** 20 min | **Tags:** `[regex, like, null-safe, complex-filtering]`

**Steps:** `EXPLANATION → CODE(4 blocks) → QUIZ(4) → CHALLENGE → SUMMARY`

**What you'll learn:**
- `LIKE` advanced patterns and limitations
- `REGEXP` / `RLIKE` (MySQL) / `~` (PostgreSQL) — regex in SQL
- NULL-safe equality: `<=>` (MySQL), `IS NOT DISTINCT FROM` (PostgreSQL)
- Filtering with subqueries and CTEs as filter sources
- Complex multi-condition WHERE with proper parenthesization
- `ANY`, `ALL` with subqueries

**Interview relevance:** Advanced filtering appears in practical test rounds.

---

### Learn 6.2 — String Aggregation, Statistical Functions & DISTINCT tricks
**Difficulty:** INTERMEDIATE | **Est. Time:** 20 min | **Tags:** `[group-concat, string-agg, percentile, distinct-on]`

**Steps:** `EXPLANATION → CODE(4 blocks) → COMPARISON(MySQL vs PostgreSQL) → QUIZ(3) → CHALLENGE → SUMMARY`

**What you'll learn:**
- `GROUP_CONCAT` (MySQL) / `STRING_AGG` (PostgreSQL/SQL Server) — aggregate strings
- `LISTAGG` (Oracle)
- `PERCENTILE_CONT`, `PERCENTILE_DISC` — median and percentile
- `STDDEV`, `VARIANCE` — statistical aggregates
- `DISTINCT ON` (PostgreSQL) — get one row per group without window functions
- `COUNT(DISTINCT col)` nuances

**Interview relevance:** String aggregation is commonly tested; DISTINCT ON is a PostgreSQL power feature.

---

### Learn 6.3 — Database-Specific Features: MySQL vs PostgreSQL vs SQL Server
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[mysql, postgresql, sql-server, cross-database, differences]`

**Steps:** `EXPLANATION → COMPARISON(feature matrix) → CODE(4 blocks: same query, different syntax) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Key syntax differences: LIMIT vs TOP vs FETCH FIRST
- Auto-increment: AUTO_INCREMENT vs SERIAL vs IDENTITY
- JSON support: MySQL JSON vs PostgreSQL JSONB
- String concatenation: `CONCAT()` vs `||`
- Date functions: differences across databases
- Full-text search: MySQL FULLTEXT vs PostgreSQL tsvector
- Window function support differences
- When to choose which database

**Interview relevance:** Many teams ask "What databases have you worked with?" and follow up with difference questions.

---

### Learn 6.4 — JSON in SQL (MySQL JSON & PostgreSQL JSONB)
**Difficulty:** ADVANCED | **Est. Time:** 25 min | **Tags:** `[json, jsonb, postgresql, mysql, semi-structured]`

**Steps:** `EXPLANATION → CODE(4 blocks) → COMPARISON(JSON vs JSONB) → QUIZ(4) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Storing JSON in SQL: when it's appropriate
- MySQL: `JSON_EXTRACT`, `->`, `->>`, `JSON_ARRAYAGG`, `JSON_OBJECT`
- PostgreSQL JSONB: `->>`, `#>>`, `@>` (contains), `?` (key exists)
- Indexing JSON fields with GIN indexes (PostgreSQL)
- Querying nested JSON structures
- JSON aggregation: building JSON from relational rows
- When NOT to use JSON in SQL (breaks normalization)

**Interview relevance:** JSON in databases is increasingly common; JSONB knowledge shows modern PostgreSQL depth.

---

### Learn 6.5 — Transactions, Locking & Deadlocks
**Difficulty:** ADVANCED | **Est. Time:** 25 min | **Tags:** `[transactions, locking, deadlock, row-lock, table-lock]`

**Steps:** `EXPLANATION → VISUALIZATION(deadlock diagram) → CODE(3 blocks) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- `BEGIN`, `COMMIT`, `ROLLBACK`, `SAVEPOINT`
- Optimistic vs pessimistic locking
- Row-level lock vs table-level lock
- `SELECT ... FOR UPDATE` — explicit row locking
- What causes deadlocks and how to prevent them
- `LOCK TIMEOUT` and deadlock detection
- Two-phase locking (2PL)
- Real-world: e-commerce inventory update with transactions

**Interview relevance:** "What is a deadlock?" / "How do you handle concurrent writes?" — common in backend interviews.

---

### Learn 6.6 — SQL Interview Strategy & Problem-Solving Framework
**Difficulty:** ALL LEVELS | **Est. Time:** 30 min | **Tags:** `[interview-strategy, problem-solving, communication, approach]`

**Steps:** `EXPLANATION → CODE(5 blocks: walk-through of 5 problems) → MOCK_INTERVIEW → CHALLENGE(3) → SUMMARY`

**What you'll learn:**
- The 5-step SQL interview framework:
  1. Understand the schema (ask questions)
  2. Understand the output (what does one row represent?)
  3. Plan the approach (joins? window? CTE?)
  4. Write step by step (CTE each intermediate result)
  5. Validate with edge cases (NULLs, duplicates, empty sets)
- How to communicate while writing SQL
- Common edge cases to always check: NULLs, duplicates, empty tables, ties in ranking
- Top 10 SQL interview question types and approaches
- Platforms to practice: LeetCode SQL, StrataScratch, DataLemur, Mode Analytics

**Interview relevance:** This Learn is pure interview prep — the meta-skill of solving SQL problems under pressure.

---

### Unit 6 Review — Full SQL Mock Interview & Capstone
**Steps:** `SUMMARY → QUIZ(15 mixed difficulty) → MOCK_INTERVIEW → PROJECT(major: Full end-to-end analytics pipeline — schema design + complex queries + optimization)`

---
---

## Summary: Complete Learn Count

| Unit | Topic | Learns |
|------|-------|--------|
| Unit 1 | Foundations | 6 + 1 review = **7** |
| Unit 2 | Core SQL | 6 + 1 review = **7** |
| Unit 3 | Joins | 6 + 1 review = **7** |
| Unit 4 | Subqueries, CTEs, Window Functions | 7 + 1 review = **8** |
| Unit 5 | Performance & Schema | 7 + 1 review = **8** |
| Unit 6 | Advanced & Interview Mastery | 6 + 1 review = **7** |
| **TOTAL** | | **44 Learns** |

---

## What This Covers vs The Original List

| Original Topic Area | Covered In |
|---------------------|------------|
| Foundational Concepts | Unit 1 (1.1–1.6) |
| SQL Fundamentals | Unit 2 (2.1–2.6) |
| Advanced Filtering | Learn 2.1, 6.1 |
| Aggregate Functions & Grouping | Learn 2.3, 2.6 |
| Joins & Relationships | Unit 3 (3.1–3.6) |
| Subqueries & CTEs | Learn 4.1–4.3 |
| Window Functions | Learn 4.4–4.6 |
| Real-World Patterns | Learn 4.7 |
| Query Optimization & Performance | Unit 5 (5.1–5.4) |
| Database-Specific Features | Learn 6.3, 6.4 |
| Data Modification & Transactions | Learn 2.5, 6.5 |
| Schema Design & DDL | Learn 1.4, 1.5 |
| Views & Procedures | Learn 5.5 |
| Partitioning & Sharding | Learn 5.6 |
| Interview Strategy | Learn 6.6 |

---

## Step Template Reference (Per Learn)

Each Learn uses this standard step flow (adapted per topic):

```
EXPLANATION → [VISUALIZATION?] → CODE → [COMPARISON?] → QUIZ → CHALLENGE → [RESOURCE?] → SUMMARY
```

Unit-end Learns:
```
SUMMARY(recap) → QUIZ(10-15) → MOCK_INTERVIEW → PROJECT
```

---

*Document created for BuildrHQ — SQL Learn Module*