# Operating Systems — Learn Module Masterplan
**Platform: BuildrHQ**
**SubCategory: Operating Systems**
**Total Learns: 44 | Units: 6**

---

## Category Hierarchy

```
LearnMainCategory: "Computer Science"
  └── LearnSubCategory: "Operating Systems"
        ├── slug: "operating-systems"
        ├── icon: "🖥️"
        ├── color: "#8B5CF6"
        │
        └── LearnTopics:
              ├── Unit 1 — OS Fundamentals (6 Learns)
              ├── Unit 2 — Process Management (7 Learns)
              ├── Unit 3 — Memory Management (7 Learns)
              ├── Unit 4 — Storage, File Systems & I/O (6 Learns)
              ├── Unit 5 — Concurrency & Synchronization (7 Learns)
              └── Unit 6 — Advanced OS & Interview Mastery (5 Learns)
```

---

## UNIT 1 — OS Fundamentals
**Unit Goal:** Understand what an OS is, its core responsibilities, how it boots, and the foundational abstractions it provides. These are the definitions and theory questions that open every OS interview.

---

### Learn 1.1 — What is an Operating System?
**Difficulty:** BEGINNER | **Est. Time:** 20 min | **Tags:** `[os, kernel, system-calls, abstraction]`

**Steps:** `EXPLANATION → VISUALIZATION(OS layer diagram) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Definition and purpose of an OS
- OS as a resource manager and abstraction layer
- Types of OS: batch, time-sharing, real-time, distributed, embedded
- Kernel vs user space
- System calls: the bridge between user programs and kernel
- Examples: Linux, Windows, macOS, Android internals

**Interview relevance:** "What does an OS do?" / "What is a kernel?" — always asked as openers.

---

### Learn 1.2 — OS Architecture: Monolithic, Microkernel & Layered
**Difficulty:** BEGINNER | **Est. Time:** 20 min | **Tags:** `[monolithic, microkernel, layered, hybrid, architecture]`

**Steps:** `EXPLANATION → COMPARISON(architecture types) → VISUALIZATION → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Monolithic kernel: all services in kernel space (Linux)
- Microkernel: minimal kernel, services in user space (Mach, QNX)
- Layered OS: each layer uses services of layer below
- Hybrid kernel: Windows NT, macOS XNU
- Exokernel and unikernel concepts
- Trade-offs: performance vs modularity vs security
- Why Linux is monolithic but with loadable modules

**Interview relevance:** "Difference between monolithic and microkernel?" — common in systems and OS interviews.

---

### Learn 1.3 — System Calls, Interrupts & Mode Switching
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[system-calls, interrupts, user-mode, kernel-mode, trap]`

**Steps:** `EXPLANATION → VISUALIZATION(mode switch diagram) → CODE(2 blocks: syscall examples) → QUIZ(5) → SUMMARY`

**What you'll learn:**
- User mode vs kernel mode (privilege levels)
- How system calls work: trap instruction → mode switch → kernel handler → return
- Categories of system calls: process, file, device, information, communication
- Interrupts: hardware interrupts vs software interrupts (traps/exceptions)
- Interrupt Service Routine (ISR) and the interrupt vector table
- Context of a system call: expensive due to mode switch
- Examples: `read()`, `write()`, `fork()`, `exec()`, `exit()`

**Interview relevance:** "What happens when you call read()?" — deep system understanding question.

---

### Learn 1.4 — OS Boot Process
**Difficulty:** BEGINNER | **Est. Time:** 20 min | **Tags:** `[boot, bios, uefi, bootloader, grub, kernel-init]`

**Steps:** `EXPLANATION → VISUALIZATION(boot sequence flowchart) → QUIZ(3) → SUMMARY`

**What you'll learn:**
- Power-on → BIOS/UEFI POST → Bootloader (GRUB) → Kernel load → Init system
- BIOS vs UEFI differences
- MBR vs GPT partition tables
- What init/systemd does after kernel loads
- Kernel initialization: memory detection, driver loading, mounting root filesystem
- Why this matters: understanding what's running before your program

**Interview relevance:** Systems programmers and kernel-level questions touch on boot sequence.

---

### Learn 1.5 — Virtualization & Hypervisors
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[virtualization, hypervisor, vm, containers, docker]`

**Steps:** `EXPLANATION → COMPARISON(Type 1 vs Type 2 vs Containers) → VISUALIZATION → QUIZ(4) → SUMMARY`

**What you'll learn:**
- What virtualization is: illusion of dedicated hardware
- Type 1 hypervisor (bare-metal): VMware ESXi, KVM, Hyper-V
- Type 2 hypervisor (hosted): VirtualBox, VMware Workstation
- Hardware virtualization: Intel VT-x, AMD-V
- Containers vs VMs: key differences (namespace, cgroups vs full VM)
- Docker internals: namespaces + cgroups + union filesystem
- Why VMs are slower than containers (and when VMs are better)

**Interview relevance:** "Difference between VM and container?" — extremely common in backend/DevOps interviews.

---

### Learn 1.6 — OS Services & System Programs
**Difficulty:** BEGINNER | **Est. Time:** 15 min | **Tags:** `[os-services, shell, cli, system-programs]`

**Steps:** `EXPLANATION → QUIZ(3) → SUMMARY`

**What you'll learn:**
- Core OS services: program execution, I/O operations, file system, communication, error detection
- System programs vs application programs
- The shell: CLI interface to the OS
- Daemons and background services
- Standard I/O: stdin, stdout, stderr
- Environment variables and their role

**Interview relevance:** Background context for deeper OS questions.

---

### Unit 1 Review — OS Fundamentals
**Steps:** `SUMMARY(unit recap) → QUIZ(10) → MOCK_INTERVIEW → PROJECT(mini: Trace a system call with strace)`

---
---

## UNIT 2 — Process Management
**Unit Goal:** Deeply understand processes and threads — the most heavily tested OS topic in interviews. Cover scheduling, context switching, and IPC thoroughly.

---

### Learn 2.1 — Processes: Creation, States & PCB
**Difficulty:** BEGINNER | **Est. Time:** 25 min | **Tags:** `[process, pcb, process-states, fork, exec]`

**Steps:** `EXPLANATION → VISUALIZATION(process state diagram) → CODE(2 blocks: fork/exec) → QUIZ(5) → SUMMARY`

**What you'll learn:**
- What a process is: program in execution
- Process Control Block (PCB): PID, state, program counter, registers, memory maps, open files
- Process states: New → Ready → Running → Waiting → Terminated
- Process creation: `fork()` — creates a copy; `exec()` — replaces image
- `fork()` + `exec()` pattern (how shells work)
- Process termination: `exit()`, zombie processes, orphan processes
- Parent/child process relationship and `wait()`

**Interview relevance:** "What is a process?" / "What does fork() do?" / "What is a zombie process?" — all classics.

---

### Learn 2.2 — Threads: User-Level vs Kernel-Level & Multithreading Models
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[threads, user-thread, kernel-thread, multithreading, pthreads]`

**Steps:** `EXPLANATION → COMPARISON(process vs thread) → VISUALIZATION(threading models) → CODE(2 blocks) → QUIZ(5) → SUMMARY`

**What you'll learn:**
- Thread: lightweight process, shares address space
- Process vs thread: memory, file descriptors, stack, registers
- User-level threads: managed by user library, kernel sees one thread
- Kernel-level threads: OS manages, expensive but true parallelism
- Threading models: Many-to-One, One-to-One, Many-to-Many
- POSIX threads (pthreads) basics
- Thread benefits: responsiveness, resource sharing, economy, scalability
- Thread challenges: synchronization, race conditions, debugging difficulty

**Interview relevance:** "Difference between process and thread?" — top 3 OS interview question everywhere.

---

### Learn 2.3 — CPU Scheduling Algorithms
**Difficulty:** INTERMEDIATE | **Est. Time:** 35 min | **Tags:** `[scheduling, fcfs, sjf, round-robin, priority, multilevel]`

**Steps:** `EXPLANATION → VISUALIZATION(Gantt charts for each algorithm) → CODE(2 blocks: scheduling simulation) → COMPARISON(algorithms table) → QUIZ(6) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Scheduling criteria: CPU utilization, throughput, turnaround time, waiting time, response time
- **FCFS** (First Come First Served): simple, convoy effect problem
- **SJF** (Shortest Job First): optimal average wait, requires knowing burst time
- **SRTF** (Shortest Remaining Time First): preemptive SJF
- **Round Robin**: time quantum, preemptive, good response time
- **Priority Scheduling**: starvation problem, aging solution
- **Multilevel Queue**: separate queues for different process types
- **Multilevel Feedback Queue**: most flexible, most complex
- Preemptive vs non-preemptive scheduling
- Calculating: turnaround time, waiting time, response time (numerical problems)

**Interview relevance:** Gantt chart numerical questions appear in every OS exam and many interviews.

---

### Learn 2.4 — Context Switching & Dispatcher
**Difficulty:** INTERMEDIATE | **Est. Time:** 20 min | **Tags:** `[context-switch, dispatcher, scheduling-overhead]`

**Steps:** `EXPLANATION → VISUALIZATION(context switch sequence) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- What context switching is: saving and restoring process state
- Steps in a context switch: save PCB, load next PCB, flush TLB, cache warming
- Dispatcher: the module that gives CPU control to selected process
- Dispatch latency: time to stop one process and start another
- Cost of context switching: why it's expensive
- Voluntary vs involuntary context switch
- How to minimize context switch overhead

**Interview relevance:** "What happens during a context switch?" — deep systems question.

---

### Learn 2.5 — Inter-Process Communication (IPC)
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[ipc, pipes, shared-memory, message-queue, signals, sockets]`

**Steps:** `EXPLANATION → COMPARISON(IPC mechanisms) → CODE(3 blocks) → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Why IPC is needed: isolated processes need to communicate
- **Pipes**: unnamed (parent-child), named (FIFO, unrelated processes)
- **Shared Memory**: fastest IPC, requires synchronization
- **Message Queues**: structured messages, kernel manages
- **Signals**: software interrupts for notifications
- **Sockets**: IPC across machines (TCP/UDP) or local (Unix domain sockets)
- **Semaphores**: synchronization primitive (covered more in Unit 5)
- Trade-offs: speed, ease of use, across-machine support

**Interview relevance:** "How do processes communicate?" — IPC mechanisms are frequently tested.

---

### Learn 2.6 — Process Synchronization: Race Conditions & Critical Section
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[race-condition, critical-section, mutex, synchronization]`

**Steps:** `EXPLANATION → VISUALIZATION(race condition example) → CODE(2 blocks) → QUIZ(5) → SUMMARY`

**What you'll learn:**
- Race condition: outcome depends on execution order
- Critical section: code segment accessing shared resources
- Requirements for critical section solution: mutual exclusion, progress, bounded waiting
- Peterson's Algorithm (software solution for 2 processes)
- Hardware solutions: test-and-set, compare-and-swap (atomic operations)
- Mutex lock: the basic solution
- Why disabling interrupts is a bad solution in multiprocessor systems

**Interview relevance:** "What is a race condition?" / "What is a critical section?" — foundational concurrency questions.

---

### Learn 2.7 — Deadlocks: Conditions, Detection & Recovery
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[deadlock, coffman-conditions, prevention, avoidance, bankers-algorithm]`

**Steps:** `EXPLANATION → VISUALIZATION(resource allocation graph) → CODE(2 blocks) → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Deadlock definition: circular wait for resources
- **Coffman's 4 conditions**: mutual exclusion, hold and wait, no preemption, circular wait
- Resource Allocation Graph (RAG): detect deadlock visually
- **Deadlock Prevention**: negate one Coffman condition
- **Deadlock Avoidance**: Banker's Algorithm — safe state concept
- **Deadlock Detection**: allow deadlocks, detect and recover
- Recovery: process termination, resource preemption
- Deadlock vs livelock vs starvation

**Interview relevance:** "What are the necessary conditions for deadlock?" — one of the most asked OS questions ever.

---

### Unit 2 Review — Process Management
**Steps:** `SUMMARY → QUIZ(12) → MOCK_INTERVIEW → PROJECT(mini: Simulate round-robin scheduling)`

---
---

## UNIT 3 — Memory Management
**Unit Goal:** Understand how the OS manages RAM — from simple partitioning to virtual memory, paging, and segmentation. These are core interview topics for systems roles.

---

### Learn 3.1 — Memory Hierarchy & Address Spaces
**Difficulty:** BEGINNER | **Est. Time:** 20 min | **Tags:** `[memory-hierarchy, registers, cache, ram, virtual-address, physical-address]`

**Steps:** `EXPLANATION → VISUALIZATION(memory hierarchy pyramid) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Memory hierarchy: registers → L1/L2/L3 cache → RAM → SSD → HDD
- Speed vs cost vs size trade-offs at each level
- Physical address vs logical (virtual) address
- Address binding: compile time, load time, execution time
- Memory Management Unit (MMU): hardware translating virtual → physical
- Base and limit registers: simplest memory protection
- Why each process gets its own address space

**Interview relevance:** "What is virtual memory?" context setup. Memory hierarchy is always asked.

---

### Learn 3.2 — Contiguous Memory Allocation & Fragmentation
**Difficulty:** INTERMEDIATE | **Est. Time:** 20 min | **Tags:** `[memory-allocation, fragmentation, first-fit, best-fit, worst-fit]`

**Steps:** `EXPLANATION → VISUALIZATION(memory hole diagrams) → COMPARISON(allocation strategies) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Fixed partitioning vs variable partitioning
- External fragmentation: free space exists but is non-contiguous
- Internal fragmentation: allocated space larger than requested
- Allocation strategies: First Fit, Best Fit, Worst Fit — trade-offs
- Compaction: moving processes to consolidate free space (expensive)
- The 50% rule for external fragmentation
- Why contiguous allocation is largely replaced by paging

**Interview relevance:** "What is fragmentation?" / "Difference between internal and external fragmentation?" — classic.

---

### Learn 3.3 — Paging: The Core Concept
**Difficulty:** INTERMEDIATE | **Est. Time:** 35 min | **Tags:** `[paging, page-table, frame, tlb, page-size]`

**Steps:** `EXPLANATION → VISUALIZATION(address translation diagram) → CODE(2 blocks: address calculation) → QUIZ(6) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Paging: divide memory into fixed-size pages (logical) and frames (physical)
- Page table: maps page number → frame number
- Address translation: logical address = page number + offset
- How MMU uses page table for every memory access
- TLB (Translation Lookaside Buffer): cache for page table entries
- TLB hit vs TLB miss: effective access time calculation
- Page table size problem: why large address spaces make huge page tables
- Protection bits in page table entries: read/write/execute
- Shared pages: multiple processes map to same frame (code sharing)

**Interview relevance:** "How does paging work?" / "What is a TLB?" — core memory management questions.

---

### Learn 3.4 — Multi-Level Paging, Inverted Page Tables & Segmentation
**Difficulty:** ADVANCED | **Est. Time:** 30 min | **Tags:** `[multi-level-paging, inverted-page-table, segmentation, segment-table]`

**Steps:** `EXPLANATION → VISUALIZATION(multi-level page table tree) → COMPARISON(paging vs segmentation) → QUIZ(5) → SUMMARY`

**What you'll learn:**
- Problem with single-level page table: too large for 64-bit address spaces
- Two-level paging: outer page table → inner page table → frame
- Three-level paging (used in x86-64: PML4 → PDPT → PD → PT)
- Inverted page table: one entry per physical frame (saves memory, slow lookup)
- Hashed page table: for sparse address spaces
- Segmentation: variable-size logical segments (code, data, stack, heap)
- Segment table: base + limit per segment
- Segmentation with paging (Intel x86 uses both)
- Paging vs segmentation trade-offs

**Interview relevance:** Advanced memory questions in systems programming interviews.

---

### Learn 3.5 — Virtual Memory & Demand Paging
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[virtual-memory, demand-paging, page-fault, swap-space]`

**Steps:** `EXPLANATION → VISUALIZATION(page fault handling flow) → CODE(2 blocks) → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Virtual memory: run programs larger than physical RAM
- Demand paging: load pages only when needed
- Valid/invalid bit in page table entries
- Page fault: what triggers it, what happens step by step
- Page fault handler: find page on disk → load to free frame → update page table → restart instruction
- Swap space: disk area for evicted pages
- Effective access time with page faults
- Pure demand paging vs pre-paging

**Interview relevance:** "What is virtual memory?" / "Explain page fault handling" — extremely common.

---

### Learn 3.6 — Page Replacement Algorithms
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[page-replacement, fifo, lru, optimal, clock-algorithm, belady-anomaly]`

**Steps:** `EXPLANATION → VISUALIZATION(page replacement traces) → COMPARISON(algorithms) → QUIZ(6) → CHALLENGE(numerical) → SUMMARY`

**What you'll learn:**
- Why page replacement is needed: all frames full, new page needed
- **FIFO**: replace oldest page — simple but poor, Belady's anomaly
- **Optimal (OPT)**: replace page used furthest in future — theoretical best
- **LRU** (Least Recently Used): replace least recently used — good approximation of OPT
- LRU approximations: counter, stack, reference bit, second-chance (Clock) algorithm
- **Enhanced Second-Chance**: uses (reference bit, modify bit) pair
- **LFU** (Least Frequently Used) and **MFU** (Most Frequently Used)
- Belady's anomaly: more frames → more page faults (only in FIFO)
- Thrashing: excessive paging, CPU utilization collapses

**Interview relevance:** Numerical page replacement problems and "What is Belady's anomaly?" are exam/interview staples.

---

### Learn 3.7 — Thrashing, Working Set & Memory Allocation Policies
**Difficulty:** ADVANCED | **Est. Time:** 25 min | **Tags:** `[thrashing, working-set, locality, frame-allocation, global-vs-local]`

**Steps:** `EXPLANATION → VISUALIZATION(thrashing curve) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Thrashing: process spends more time paging than executing
- Cause: too many processes, too few frames per process
- Locality of reference: temporal and spatial locality
- Working Set Model: set of pages used in last Δ references
- Working set size vs allocated frames — balance is key
- Page fault frequency (PFF) strategy
- Global vs local page replacement
- Frame allocation policies: equal allocation, proportional allocation
- Memory-mapped files: treating file I/O as memory accesses

**Interview relevance:** "What is thrashing and how do you prevent it?" — deeper OS question.

---

### Unit 3 Review — Memory Management
**Steps:** `SUMMARY → QUIZ(12) → MOCK_INTERVIEW → PROJECT(mini: Simulate LRU page replacement)`

---
---

## UNIT 4 — Storage, File Systems & I/O
**Unit Goal:** Understand how data persists — from disk hardware to file systems, directory structures, and I/O management.

---

### Learn 4.1 — Storage Devices: HDD, SSD & Disk Structure
**Difficulty:** BEGINNER | **Est. Time:** 20 min | **Tags:** `[hdd, ssd, disk, sector, cylinder, rpm, nand-flash]`

**Steps:** `EXPLANATION → VISUALIZATION(HDD anatomy diagram) → COMPARISON(HDD vs SSD) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- HDD structure: platters, tracks, sectors, cylinders, read/write heads
- Seek time, rotational latency, transfer time — disk access time calculation
- SSD: NAND flash, no moving parts, wear leveling, write amplification
- NVMe vs SATA SSD: interface differences
- RAID: RAID 0, 1, 5, 6, 10 — purpose and trade-offs
- Storage access patterns: sequential vs random (why matters for HDD vs SSD)

**Interview relevance:** System design interviews ask about storage choices and why SSDs are preferred.

---

### Learn 4.2 — Disk Scheduling Algorithms
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[disk-scheduling, fcfs, sstf, scan, c-scan, look]`

**Steps:** `EXPLANATION → VISUALIZATION(seek movement diagrams) → COMPARISON(algorithms) → QUIZ(5) → CHALLENGE(numerical) → SUMMARY`

**What you'll learn:**
- Why disk scheduling matters: minimize seek time
- **FCFS**: simple, fair, high seek time
- **SSTF** (Shortest Seek Time First): greedy, starvation risk
- **SCAN** (Elevator algorithm): sweeps back and forth
- **C-SCAN** (Circular SCAN): only sweeps in one direction, resets
- **LOOK / C-LOOK**: like SCAN but stops at last request (more practical)
- Numerical problems: calculate total head movement
- Modern relevance: less important for SSDs (no seek time)

**Interview relevance:** Numerical disk scheduling problems are common in OS exams and some interviews.

---

### Learn 4.3 — File Systems: Concepts, Structure & Allocation Methods
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[file-system, inode, fat, ext4, ntfs, file-allocation]`

**Steps:** `EXPLANATION → VISUALIZATION(inode structure) → COMPARISON(allocation methods) → CODE(2 blocks) → QUIZ(5) → SUMMARY`

**What you'll learn:**
- File: named collection of related data, attributes (name, size, type, permissions, timestamps)
- File operations: create, read, write, seek, delete, truncate
- **Contiguous allocation**: fast sequential access, external fragmentation
- **Linked allocation**: no fragmentation, poor random access (FAT uses this)
- **Indexed allocation**: index block holds all block pointers (Unix inodes)
- Inode: index node storing file metadata and block pointers (direct, indirect, double-indirect)
- FAT (File Allocation Table): linked allocation with table in memory
- Directory structure: linear list, hash table
- Modern file systems: ext4 (Linux), NTFS (Windows), APFS (macOS)

**Interview relevance:** "What is an inode?" — very common in Linux/backend interviews.

---

### Learn 4.4 — Directory Structure, Mounting & File System Implementation
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[directory, path, mounting, vfs, open-file-table]`

**Steps:** `EXPLANATION → VISUALIZATION(directory tree + VFS layers) → CODE(2 blocks) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Single-level, two-level, tree-structured, acyclic-graph directories
- Absolute vs relative path
- Virtual File System (VFS): uniform interface over different file systems
- Mounting: attaching a file system to the directory tree
- Open file table: per-process and system-wide
- File descriptor: integer index into open file table
- Hard links vs soft (symbolic) links
- File system journaling: crash recovery in ext4, NTFS

**Interview relevance:** "What is a file descriptor?" / "What is the difference between hard link and symbolic link?" — Linux interview classics.

---

### Learn 4.5 — I/O Systems, Device Management & Drivers
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[io, device-driver, dma, polling, interrupt-driven, buffering]`

**Steps:** `EXPLANATION → VISUALIZATION(I/O subsystem layers) → COMPARISON(I/O techniques) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- I/O hardware: ports, buses, device controllers
- I/O techniques: **polling** (busy-wait), **interrupt-driven**, **DMA** (Direct Memory Access)
- DMA: device transfers data to memory directly, CPU free
- Device driver: OS abstraction over hardware specifics
- I/O subsystem layers: user programs → kernel I/O → device driver → hardware
- Buffering: store data in memory while transferring
- Caching: keep copy in faster storage
- Spooling: for devices that can't interleave (printers)
- Blocking vs non-blocking I/O

**Interview relevance:** "What is DMA?" / "Difference between blocking and non-blocking I/O?" — systems knowledge test.

---

### Learn 4.6 — Free Space Management & File System Performance
**Difficulty:** INTERMEDIATE | **Est. Time:** 20 min | **Tags:** `[free-space, bitmap, linked-list, grouping, fs-performance]`

**Steps:** `EXPLANATION → COMPARISON(free space methods) → QUIZ(3) → SUMMARY`

**What you'll learn:**
- Free space list: tracking available disk blocks
- **Bit vector (bitmap)**: one bit per block, fast but memory-intensive
- **Linked list**: free blocks chained, poor performance
- **Grouping**: first free block stores n free block addresses
- **Counting**: (address, count) pairs for contiguous free blocks
- Buffer cache / page cache: caching disk blocks in RAM
- Read-ahead: prefetching anticipated blocks
- Free-behind: release buffer after reading sequential blocks

**Interview relevance:** Storage internals for systems programming roles.

---

### Unit 4 Review — Storage & File Systems
**Steps:** `SUMMARY → QUIZ(10) → MOCK_INTERVIEW → PROJECT(mini: Simulate inode-based file lookup)`

---
---

## UNIT 5 — Concurrency & Synchronization
**Unit Goal:** Master the hardest and most interview-critical OS topic — synchronization primitives, classic problems, and concurrent programming challenges.

---

### Learn 5.1 — Semaphores: Binary & Counting
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[semaphore, binary-semaphore, counting-semaphore, wait, signal]`

**Steps:** `EXPLANATION → VISUALIZATION(semaphore operations) → CODE(3 blocks) → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Semaphore: integer variable + two atomic operations (wait/P, signal/V)
- Binary semaphore (mutex): 0 or 1, for mutual exclusion
- Counting semaphore: non-negative integer, for resource counting
- Busy-wait (spinlock) vs blocking semaphore
- Implementation with a waiting queue
- Semaphore for mutual exclusion: protect critical section
- Semaphore for ordering: process A before process B
- Problems with semaphores: incorrect use causes deadlock or broken mutual exclusion

**Interview relevance:** Semaphores are a core OS primitive — understanding them is required.

---

### Learn 5.2 — Mutex, Monitors & Condition Variables
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[mutex, monitor, condition-variable, lock, high-level-sync]`

**Steps:** `EXPLANATION → CODE(3 blocks: mutex + monitor examples) → COMPARISON(semaphore vs mutex vs monitor) → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Mutex: mutual exclusion lock, simpler API than semaphore
- Mutex vs semaphore: key differences (ownership, signaling)
- Monitor: high-level synchronization construct (Java `synchronized`)
- Condition variables: `wait()`, `signal()`, `broadcast()` inside monitors
- Mesa vs Hoare monitor semantics
- The "spurious wakeup" problem and why `while` not `if` for condition check
- `pthread_mutex_t`, `pthread_cond_t` in C
- Java `synchronized` and `wait()/notify()/notifyAll()`

**Interview relevance:** "What is a mutex?" / "Difference between mutex and semaphore?" — very frequently asked.

---

### Learn 5.3 — Classic Synchronization Problems
**Difficulty:** INTERMEDIATE | **Est. Time:** 35 min | **Tags:** `[producer-consumer, readers-writers, dining-philosophers, sleeping-barber]`

**Steps:** `EXPLANATION → CODE(4 blocks: solutions to each) → QUIZ(5) → CHALLENGE(2) → SUMMARY`

**What you'll learn:**
- **Producer-Consumer (Bounded Buffer)**: semaphore solution with empty, full, mutex
- **Readers-Writers Problem**: readers can share, writers need exclusive access; starvation issues
- **Dining Philosophers**: 5 philosophers, 5 forks, deadlock-prone, solutions
- **Sleeping Barber**: synchronizing barber and customers with waiting room
- Why these problems matter: they model real synchronization scenarios
- Deadlock possibility in naive solutions and how to avoid
- Semaphore-based vs monitor-based solutions

**Interview relevance:** "Explain the Producer-Consumer problem" / "Solve Dining Philosophers" — classic interview questions.

---

### Learn 5.4 — Spinlocks, Read-Write Locks & Lock-Free Programming
**Difficulty:** ADVANCED | **Est. Time:** 25 min | **Tags:** `[spinlock, rw-lock, atomic, compare-and-swap, lock-free]`

**Steps:** `EXPLANATION → CODE(3 blocks) → COMPARISON(lock types) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Spinlock: busy-waits instead of blocking — when it's better
- Read-Write Lock: multiple readers OR one writer
- `pthread_rwlock_t` usage
- Atomic operations: test-and-set, compare-and-swap (CAS), fetch-and-add
- Lock-free programming: using atomics to avoid locks
- ABA problem in lock-free algorithms
- Memory ordering: acquire, release, sequential consistency
- When spinlocks beat mutexes (short critical sections, multicore)

**Interview relevance:** Advanced concurrency for senior/systems engineering interviews.

---

### Learn 5.5 — Deadlock in Concurrent Programs (Deep Dive)
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[deadlock, livelock, starvation, priority-inversion]`

**Steps:** `EXPLANATION → VISUALIZATION(deadlock scenarios) → CODE(2 blocks: deadlock + fix) → QUIZ(4) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Revisiting deadlock: practical code-level examples
- Livelock: processes keep changing state but make no progress
- Starvation: a process never gets resources
- Priority inversion: high-priority task blocked by low-priority (Mars Pathfinder bug)
- Priority inheritance: solution to priority inversion
- Lock ordering: always acquire locks in consistent order
- Timeout-based deadlock resolution
- Real-world deadlock examples: database transactions, OS resource allocation

**Interview relevance:** "What is priority inversion?" — senior systems interview question.

---

### Learn 5.6 — CPU Caches, Cache Coherence & Memory Models
**Difficulty:** ADVANCED | **Est. Time:** 25 min | **Tags:** `[cache-coherence, mesi, false-sharing, memory-model, volatile]`

**Steps:** `EXPLANATION → VISUALIZATION(MESI state diagram) → CODE(2 blocks) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- CPU cache hierarchy and cache lines
- Cache coherence problem: multiple cores, multiple caches, same memory
- MESI protocol: Modified, Exclusive, Shared, Invalid states
- False sharing: two variables on same cache line thrash between cores
- Memory consistency models: sequential consistency, relaxed models
- Memory barriers / fences: prevent CPU reordering
- `volatile` in Java/C++: what it does and doesn't guarantee
- Why double-checked locking is broken without proper synchronization

**Interview relevance:** Performance-oriented senior interviews and systems design questions.

---

### Learn 5.7 — Concurrency in Modern Systems: Async, Event Loops & Coroutines
**Difficulty:** ADVANCED | **Est. Time:** 25 min | **Tags:** `[async, event-loop, coroutines, non-blocking, nodejs, epoll]`

**Steps:** `EXPLANATION → COMPARISON(threads vs async vs event loop) → CODE(2 blocks) → QUIZ(3) → SUMMARY`

**What you'll learn:**
- The C10K problem: why threads don't scale to thousands of connections
- Event-driven I/O: `select`, `poll`, `epoll` (Linux), `kqueue` (BSD)
- Event loop: single thread handles thousands of connections
- Node.js libuv event loop internals
- Coroutines / green threads: cooperative multitasking
- async/await: syntactic sugar over coroutines
- Thread pool + event loop hybrid (Go runtime)
- When to use threads vs async vs event loop

**Interview relevance:** "How does Node.js handle concurrency?" / "What is epoll?" — backend engineering interviews.

---

### Unit 5 Review — Concurrency & Synchronization
**Steps:** `SUMMARY → QUIZ(12) → MOCK_INTERVIEW → PROJECT(major: Implement thread-safe bounded buffer with semaphores)`

---
---

## UNIT 6 — Advanced OS & Interview Mastery
**Unit Goal:** Cover real-time OS, Linux internals, OS security, and build interview problem-solving confidence across all OS topics.

---

### Learn 6.1 — Linux Internals: Kernel, Processes & System Calls
**Difficulty:** ADVANCED | **Est. Time:** 30 min | **Tags:** `[linux, kernel, proc-filesystem, signals, linux-internals]`

**Steps:** `EXPLANATION → CODE(4 blocks: Linux commands + system calls) → QUIZ(4) → CHALLENGE → SUMMARY`

**What you'll learn:**
- Linux kernel architecture: monolithic + loadable modules
- `/proc` filesystem: virtual filesystem exposing kernel data
- Signals in Linux: `SIGKILL`, `SIGTERM`, `SIGSEGV`, `SIGINT` and handlers
- Linux process lifecycle from userspace perspective
- `strace`: tracing system calls
- `lsof`, `ps`, `top`, `htop`: process inspection tools
- Linux scheduler: CFS (Completely Fair Scheduler)
- cgroups and namespaces: resource isolation (foundation of containers)
- eBPF: modern Linux observability

**Interview relevance:** Linux knowledge is mandatory for backend, DevOps, and systems engineering roles.

---

### Learn 6.2 — Real-Time Operating Systems (RTOS)
**Difficulty:** ADVANCED | **Est. Time:** 20 min | **Tags:** `[rtos, hard-real-time, soft-real-time, scheduling, embedded]`

**Steps:** `EXPLANATION → COMPARISON(RTOS vs GPOS) → QUIZ(3) → SUMMARY`

**What you'll learn:**
- Hard vs soft real-time systems
- RTOS characteristics: determinism, minimal latency, priority-based scheduling
- Rate Monotonic Scheduling (RMS): fixed priority, provably optimal
- Earliest Deadline First (EDF): dynamic priority, optimal for soft real-time
- Priority ceiling protocol: prevent priority inversion in RTOS
- Examples: FreeRTOS, VxWorks, Zephyr, QNX
- Interrupt latency: the key RTOS metric
- Embedded systems context

**Interview relevance:** Embedded systems and IoT roles require RTOS knowledge.

---

### Learn 6.3 — OS Security: Protection, Access Control & Exploits
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[security, access-control, acl, capability, buffer-overflow, aslr]`

**Steps:** `EXPLANATION → VISUALIZATION(protection ring diagram) → CODE(2 blocks) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Protection goals: confidentiality, integrity, availability
- Protection rings: Ring 0 (kernel) → Ring 3 (user)
- Access Control Lists (ACLs): per-resource permission list
- Capability-based access control: per-process token
- Unix file permissions: owner/group/other, rwx bits, setuid
- Common vulnerabilities: buffer overflow, stack smashing
- ASLR (Address Space Layout Randomization): randomize memory layout
- Stack canaries, DEP/NX bit: buffer overflow mitigations
- Spectre and Meltdown: hardware-level CPU vulnerabilities

**Interview relevance:** Security-aware engineering interviews and security-focused roles.

---

### Learn 6.4 — Distributed OS Concepts: Clocks, Consistency & Distributed Memory
**Difficulty:** ADVANCED | **Est. Time:** 25 min | **Tags:** `[distributed, logical-clocks, lamport, consistency, distributed-memory]`

**Steps:** `EXPLANATION → VISUALIZATION(Lamport clock example) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Distributed OS goals: transparency, scalability, fault tolerance
- Clock synchronization problem: no global clock
- Lamport logical clocks: happen-before relationship
- Vector clocks: detect causality violations
- Distributed mutual exclusion: token ring, Ricart-Agrawala
- Distributed shared memory (DSM): illusion of shared RAM across machines
- CAP theorem: cannot have all three (Consistency, Availability, Partition tolerance)
- Link to system design: why this matters for distributed databases

**Interview relevance:** System design interviews at senior level; bridges OS to distributed systems.

---

### Learn 6.5 — OS Interview Masterclass: Patterns & Problem-Solving
**Difficulty:** ALL LEVELS | **Est. Time:** 35 min | **Tags:** `[interview-prep, os-patterns, problem-solving, cheatsheet]`

**Steps:** `EXPLANATION → CODE(5 blocks: walk-through problems) → QUIZ(8) → MOCK_INTERVIEW → CHALLENGE(3) → SUMMARY`

**What you'll learn:**
- The OS interview question taxonomy (which topic each company focuses on)
- Top 20 OS interview questions with structured answers
- How to answer "explain X" questions: definition → mechanism → example → trade-off
- Numerical problems: scheduling (Gantt charts), page replacement, disk scheduling
- Diagram-based answers: process state diagram, virtual memory diagram, semaphore flow
- Common misconceptions that trip candidates
- Quick-reference: processes vs threads, paging vs segmentation, semaphore vs mutex
- How to structure answers for system design questions that touch OS

**Interview relevance:** This IS the interview. Practice patterns, not just knowledge.

---

### Unit 6 Review — Full OS Mock Interview & Capstone
**Steps:** `SUMMARY → QUIZ(15 mixed difficulty) → MOCK_INTERVIEW → PROJECT(major: Design a simple task scheduler simulation)`

---
---

## Summary: Complete Learn Count

| Unit | Topic | Learns |
|------|-------|--------|
| Unit 1 | OS Fundamentals | 6 + 1 review = **7** |
| Unit 2 | Process Management | 7 + 1 review = **8** |
| Unit 3 | Memory Management | 7 + 1 review = **8** |
| Unit 4 | Storage, File Systems & I/O | 6 + 1 review = **7** |
| Unit 5 | Concurrency & Synchronization | 7 + 1 review = **8** |
| Unit 6 | Advanced OS & Interview Mastery | 5 + 1 review = **6** |
| **TOTAL** | | **44 Learns** |

---

## Step Template Reference

Standard Learn flow:
```
EXPLANATION → [VISUALIZATION?] → CODE → [COMPARISON?] → QUIZ → CHALLENGE → [RESOURCE?] → SUMMARY
```

Unit-end Learns:
```
SUMMARY(recap) → QUIZ(10-15) → MOCK_INTERVIEW → PROJECT
```

---

*Document created for BuildrHQ — Operating Systems Learn Module*