import { prisma } from '@repo/prisma'

// ============================================================================
// GIT LEARNING CONTENT - COMPREHENSIVE SEED DATA
// ============================================================================

// Module 1: Getting Started with Git
const module1Lessons = [
    {
        title: "What is Version Control?",
        description: "Understanding the fundamentals of version control and why it matters",
        type: "READING" as const,
        orderIndex: 0,
        estimatedMinutes: 10,
        content: `# What is Version Control?

Version control is a system that records changes to files over time so you can recall specific versions later. Think of it as a **time machine for your code**.

## Why Version Control Matters

### 1. Track Every Change
Every modification you make is recorded with:
- **Who** made the change
- **When** it was made
- **What** was changed
- **Why** (through commit messages)

### 2. Collaborate Without Chaos
Multiple developers can work on the same project without overwriting each other's work. Version control manages merging different changes together.

### 3. Recover from Mistakes
Made a mistake? You can easily revert to a previous working version. Accidentally deleted a file? Restore it from history.

### 4. Experiment Safely
Create branches to try new features without affecting the main codebase. If the experiment fails, simply delete the branch.

## Types of Version Control Systems

### Centralized Version Control (CVCS)
- Single server holds all versioned files
- Examples: SVN, Perforce
- **Drawback**: Single point of failure

### Distributed Version Control (DVCS)
- Every developer has a full copy of the repository
- Examples: **Git**, Mercurial
- **Advantage**: Work offline, no single point of failure

## Why Git?

Git has become the **industry standard** for several reasons:

\`\`\`
✅ Speed - Operations are fast because they're local
✅ Distributed - Full backup on every developer's machine
✅ Branching - Lightweight branching and merging
✅ Data Integrity - Every file is checksummed
✅ Free & Open Source - Developed by Linus Torvalds
\`\`\`

## Git's Three States

Understanding these states is crucial:

| State | Description |
|-------|-------------|
| **Modified** | You've changed the file but haven't committed |
| **Staged** | You've marked a modified file to go into your next commit |
| **Committed** | The data is safely stored in your local database |

## The Git Workflow

\`\`\`
Working Directory → Staging Area → Repository
      ↓                  ↓              ↓
   (modify)          (git add)     (git commit)
\`\`\`

> 💡 **Pro Tip**: Think of the staging area as a "loading dock" where you prepare your shipment (commit) before sending it off.

## Real-World Analogy

Imagine writing a book:
- **Working Directory** = Your draft paper
- **Staging Area** = Pages you've reviewed and approved
- **Repository** = The published chapters

Each chapter (commit) has a table of contents (history) so you can always go back to any previous version.

---

In the next lesson, we'll install Git and set up our environment. Let's turn theory into practice! 🚀`,
    },
    {
        title: "Introduction to Git - Video Overview",
        description: "Visual introduction to Git concepts and workflow",
        type: "VIDEO" as const,
        orderIndex: 1,
        estimatedMinutes: 15,
        videoUrl: "https://www.youtube.com/watch?v=8JJ101D3knE",
        content: `# Introduction to Git - Video Overview

Watch this comprehensive video introduction to understand Git fundamentals visually.

## What You'll Learn

- What is Git and why developers use it
- Basic Git concepts: repositories, commits, branches
- The Git workflow visualization
- How Git enables collaboration

## Key Takeaways

After watching this video, you should understand:

1. **Git is a distributed version control system** - every developer has a complete copy of the project history
2. **Commits are snapshots** - not differences, but complete snapshots of your project
3. **Branches are lightweight** - creating branches is fast and encouraged
4. **Git is local-first** - most operations don't require network access

## Follow Along

As you watch, try to identify:
- The three main areas in Git (working directory, staging area, repository)
- How commits form a timeline of your project
- Why branching is a core feature of Git

> 💡 **Note**: Take notes on any concepts that are unclear - we'll cover each topic in detail in subsequent lessons.`
    },
    {
        title: "Installing Git",
        description: "Step-by-step guide to install Git on any operating system",
        type: "READING" as const,
        orderIndex: 2,
        estimatedMinutes: 8,
        content: `# Installing Git

Let's get Git installed on your system! Follow the instructions for your operating system.

## Windows Installation

### Option 1: Git for Windows (Recommended)
1. Download from [git-scm.com](https://git-scm.com/download/win)
2. Run the installer
3. **Important settings during installation:**
   - Use Git from Git Bash only (or Windows Command Prompt)
   - Use bundled OpenSSH
   - Checkout Windows-style, commit Unix-style line endings
   - Use MinTTY terminal

### Option 2: Using Winget
\`\`\`bash
winget install --id Git.Git -e --source winget
\`\`\`

## macOS Installation

### Option 1: Xcode Command Line Tools (Easiest)
\`\`\`bash
xcode-select --install
\`\`\`

### Option 2: Homebrew
\`\`\`bash
brew install git
\`\`\`

### Option 3: Direct Download
Download from [git-scm.com](https://git-scm.com/download/mac)

## Linux Installation

### Ubuntu/Debian
\`\`\`bash
sudo apt update
sudo apt install git
\`\`\`

### Fedora
\`\`\`bash
sudo dnf install git
\`\`\`

### Arch Linux
\`\`\`bash
sudo pacman -S git
\`\`\`

## Verify Installation

After installation, verify Git is working:

\`\`\`bash
git --version
\`\`\`

You should see output like:
\`\`\`
git version 2.42.0
\`\`\`

## Initial Setup

Before using Git, configure your identity:

\`\`\`bash
# Set your name
git config --global user.name "Your Name"

# Set your email (use your GitHub email)
git config --global user.email "your.email@example.com"
\`\`\`

### Verify Configuration
\`\`\`bash
git config --list
\`\`\`

## Optional: Recommended Settings

\`\`\`bash
# Set default branch name to 'main'
git config --global init.defaultBranch main

# Enable colored output
git config --global color.ui auto

# Set default editor (choose your preferred)
git config --global core.editor "code --wait"  # VS Code
# git config --global core.editor "vim"        # Vim
# git config --global core.editor "nano"       # Nano
\`\`\`

## GUI Clients (Optional)

While we focus on command line, GUI clients can be helpful:

| Client | Platform | Cost |
|--------|----------|------|
| GitHub Desktop | Windows, macOS | Free |
| GitKraken | All platforms | Freemium |
| Sourcetree | Windows, macOS | Free |
| VS Code | All platforms | Free (Built-in) |

---

> ✅ **Checkpoint**: You should now have Git installed. Run \`git --version\` to confirm before proceeding!`,
    },
    {
        title: "Practice: Install and Configure Git",
        description: "Hands-on practice installing and configuring Git on your system",
        type: "INTERACTIVE" as const,
        orderIndex: 3,
        estimatedMinutes: 10,
        terminalLab: {
            title: "Install and Configure Git",
            description: "Practice the essential Git configuration commands",
            scenario: {
                currentDirectory: "~",
                isGitRepo: false,
                existingFiles: []
            },
            steps: [
                {
                    id: "step-1",
                    instruction: "First, check if Git is installed by displaying its version",
                    task: "Display the Git version",
                    expectedCommands: ["git --version", "git -v"],
                    expectedOutput: "git version 2.x.x",
                    hints: [
                        "Use the --version flag with git",
                        "The command is: git --version"
                    ],
                    xpReward: 10
                },
                {
                    id: "step-2",
                    instruction: "Configure your Git username (use your actual name)",
                    task: "Set your Git username globally",
                    expectedCommands: ["git config --global user.name"],
                    validatePattern: "git config --global user.name",
                    expectedOutput: "Configuration updated",
                    hints: [
                        "Use git config --global user.name followed by your name in quotes",
                        "Example: git config --global user.name \"John Doe\""
                    ],
                    xpReward: 15
                },
                {
                    id: "step-3",
                    instruction: "Configure your Git email address",
                    task: "Set your Git email globally",
                    expectedCommands: ["git config --global user.email"],
                    validatePattern: "git config --global user.email",
                    expectedOutput: "Configuration updated",
                    hints: [
                        "Use git config --global user.email followed by your email in quotes",
                        "Example: git config --global user.email \"john@example.com\""
                    ],
                    xpReward: 15
                },
                {
                    id: "step-4",
                    instruction: "Verify your configuration by listing all Git settings",
                    task: "List all Git configuration",
                    expectedCommands: ["git config --list", "git config -l"],
                    expectedOutput: "user.name=...\nuser.email=...",
                    hints: [
                        "Use git config with the --list flag",
                        "The command is: git config --list"
                    ],
                    xpReward: 10
                }
            ],
            completionCriteria: {
                allStepsComplete: true,
                maxAttempts: 10
            }
        }
    },
    {
        title: "Your First Repository: git init & git clone",
        description: "Learn to create and clone Git repositories",
        type: "READING" as const,
        orderIndex: 4,
        estimatedMinutes: 12,
        content: `# Your First Repository: git init & git clone

There are two ways to get a Git repository: create one or clone an existing one. Let's master both!

## Creating a New Repository: \`git init\`

The \`git init\` command creates a new Git repository in the current directory.

### Basic Usage
\`\`\`bash
# Create a new directory and initialize it
mkdir my-project
cd my-project
git init
\`\`\`

### What Happens?
Git creates a hidden \`.git\` directory containing:
\`\`\`
.git/
├── HEAD          # Points to current branch
├── config        # Repository configuration
├── description   # GitWeb description
├── hooks/        # Client/server-side hook scripts
├── info/         # Global exclude file
├── objects/      # All content (commits, trees, blobs)
└── refs/         # Pointers to commits (branches, tags)
\`\`\`

> ⚠️ **Never manually edit the .git folder** unless you know exactly what you're doing!

### Initialize with a Specific Branch
\`\`\`bash
# Create repo with 'main' as the default branch
git init -b main

# Or set default globally first
git config --global init.defaultBranch main
git init
\`\`\`

### Initialize in an Existing Folder
\`\`\`bash
cd existing-project
git init
\`\`\`

## Cloning an Existing Repository: \`git clone\`

The \`git clone\` command creates a copy of an existing repository.

### Basic Clone
\`\`\`bash
git clone https://github.com/username/repository.git
\`\`\`

This creates a directory named \`repository\` with the full project history.

### Clone to a Specific Directory
\`\`\`bash
git clone https://github.com/username/repository.git my-folder-name
\`\`\`

### Clone via SSH (Recommended)
\`\`\`bash
git clone git@github.com:username/repository.git
\`\`\`

SSH provides:
- No need to enter password each time
- More secure authentication
- Required for some private repos

### Clone Options

\`\`\`bash
# Clone only recent history (shallow clone)
git clone --depth 1 https://github.com/user/repo.git

# Clone a specific branch
git clone -b develop https://github.com/user/repo.git

# Clone without checking out files
git clone --no-checkout https://github.com/user/repo.git
\`\`\`

## Understanding What Clone Does

When you \`git clone\`, Git:
1. Creates a new directory
2. Initializes a \`.git\` directory
3. Downloads all data from the remote
4. Checks out a working copy of the latest version
5. Sets up \`origin\` as the default remote

### After Cloning
\`\`\`bash
cd repository
git remote -v
# origin  https://github.com/user/repo.git (fetch)
# origin  https://github.com/user/repo.git (push)
\`\`\`

## git init vs git clone

| Feature | git init | git clone |
|---------|----------|-----------|
| Creates new repo | ✅ | ✅ (copy) |
| Has history | ❌ (starts empty) | ✅ (full history) |
| Connected to remote | ❌ | ✅ (origin) |
| Use case | New project | Existing project |

## Common Workflows

### Starting a New Project
\`\`\`bash
mkdir awesome-project
cd awesome-project
git init
# Create your files...
git add .
git commit -m "Initial commit"
\`\`\`

### Contributing to Existing Project
\`\`\`bash
git clone https://github.com/org/project.git
cd project
# Make changes...
git add .
git commit -m "Add feature"
git push
\`\`\`

---

> 🎯 **Practice**: In the next exercise, you'll create a repository from scratch and clone an existing one!`,
    },
    {
        title: "Practice: Creating and Cloning Repositories",
        description: "Hands-on practice with git init and git clone",
        type: "INTERACTIVE" as const,
        orderIndex: 5,
        estimatedMinutes: 12,
        terminalLab: {
            title: "Creating and Cloning Repositories",
            description: "Practice creating new repositories and cloning existing ones",
            scenario: {
                currentDirectory: "~/projects",
                isGitRepo: false,
                existingFiles: []
            },
            steps: [
                {
                    id: "step-1",
                    instruction: "Create a new directory called 'my-first-repo'",
                    task: "Create a new project directory",
                    expectedCommands: ["mkdir my-first-repo"],
                    expectedOutput: "Directory created",
                    hints: [
                        "Use the mkdir command",
                        "mkdir my-first-repo"
                    ],
                    xpReward: 5
                },
                {
                    id: "step-2",
                    instruction: "Navigate into the new directory",
                    task: "Change to the new directory",
                    expectedCommands: ["cd my-first-repo"],
                    expectedOutput: "~/projects/my-first-repo",
                    hints: [
                        "Use the cd command",
                        "cd my-first-repo"
                    ],
                    xpReward: 5
                },
                {
                    id: "step-3",
                    instruction: "Initialize a new Git repository",
                    task: "Create a new Git repository",
                    expectedCommands: ["git init", "git init -b main"],
                    expectedOutput: "Initialized empty Git repository in ~/projects/my-first-repo/.git/",
                    hints: [
                        "Use git init to create a new repository",
                        "The command is simply: git init"
                    ],
                    xpReward: 15
                },
                {
                    id: "step-4",
                    instruction: "Check the status of your new repository",
                    task: "View repository status",
                    expectedCommands: ["git status"],
                    expectedOutput: "On branch main\nNo commits yet\nnothing to commit",
                    hints: [
                        "Use git status to see the current state",
                        "git status"
                    ],
                    xpReward: 10
                },
                {
                    id: "step-5",
                    instruction: "List all files including hidden ones to see the .git folder",
                    task: "View the .git directory",
                    expectedCommands: ["ls -la", "ls -a", "ls -al"],
                    expectedOutput: ".git/",
                    hints: [
                        "Use ls with the -a flag to show hidden files",
                        "ls -la shows all files with details"
                    ],
                    xpReward: 10
                }
            ],
            completionCriteria: {
                allStepsComplete: true,
                maxAttempts: 10
            }
        }
    },
    {
        title: "Module 1 Quiz: Git Fundamentals",
        description: "Test your knowledge of Git basics",
        type: "QUIZ" as const,
        orderIndex: 6,
        estimatedMinutes: 15,
        passingScore: 70,
        quizQuestions: [
            {
                id: "m1-q1",
                text: "What type of version control system is Git?",
                type: "single",
                difficulty: "EASY",
                category: "Fundamentals",
                points: 10,
                options: [
                    { id: "a", text: "Centralized Version Control System", isCorrect: false },
                    { id: "b", text: "Distributed Version Control System", isCorrect: true },
                    { id: "c", text: "Local Version Control System", isCorrect: false },
                    { id: "d", text: "Cloud Version Control System", isCorrect: false }
                ],
                explanation: "Git is a Distributed Version Control System (DVCS). Every developer has a complete copy of the repository, including its full history.",
                hint: "Think about where the repository data lives - on one server or on every developer's machine?"
            },
            {
                id: "m1-q2",
                text: "What does the `git init` command do?",
                type: "single",
                difficulty: "EASY",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "Downloads a repository from GitHub", isCorrect: false },
                    { id: "b", text: "Creates a new Git repository in the current directory", isCorrect: true },
                    { id: "c", text: "Initializes a connection to a remote server", isCorrect: false },
                    { id: "d", text: "Starts the Git daemon process", isCorrect: false }
                ],
                explanation: "git init creates a new Git repository by creating a .git directory in the current folder with all necessary Git metadata.",
                hint: "Init is short for 'initialize' - what would you be initializing?"
            },
            {
                id: "m1-q3",
                text: "Which hidden directory does Git create to store repository data?",
                type: "single",
                difficulty: "EASY",
                category: "Fundamentals",
                points: 10,
                options: [
                    { id: "a", text: ".github", isCorrect: false },
                    { id: "b", text: ".gitconfig", isCorrect: false },
                    { id: "c", text: ".git", isCorrect: true },
                    { id: "d", text: ".repository", isCorrect: false }
                ],
                explanation: "Git creates a .git directory that contains all the repository data including commits, branches, configuration, and history.",
                hint: "The directory name is straightforward - named after Git itself."
            },
            {
                id: "m1-q4",
                text: "What is the difference between `git init` and `git clone`?",
                type: "single",
                difficulty: "MEDIUM",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "git init creates a new empty repository, git clone copies an existing repository", isCorrect: true },
                    { id: "b", text: "git init is for private repos, git clone is for public repos", isCorrect: false },
                    { id: "c", text: "git init creates local repos, git clone creates remote repos", isCorrect: false },
                    { id: "d", text: "There is no difference, they are aliases", isCorrect: false }
                ],
                explanation: "git init creates a new empty repository from scratch, while git clone creates a copy of an existing repository with all its history.",
                hint: "One creates something new, the other makes a copy of something existing."
            },
            {
                id: "m1-q5",
                text: "Which command sets your Git username globally?",
                type: "single",
                difficulty: "EASY",
                category: "Configuration",
                points: 10,
                options: [
                    { id: "a", text: "git set user.name \"Your Name\"", isCorrect: false },
                    { id: "b", text: "git config --global user.name \"Your Name\"", isCorrect: true },
                    { id: "c", text: "git username --global \"Your Name\"", isCorrect: false },
                    { id: "d", text: "git setup name \"Your Name\"", isCorrect: false }
                ],
                explanation: "git config --global user.name sets your username globally. The --global flag applies the setting to all repositories on your system.",
                hint: "The command involves 'config' and uses the --global flag."
            },
            {
                id: "m1-q6",
                text: "What are the three states a file can be in within a Git repository?",
                type: "single",
                difficulty: "MEDIUM",
                category: "Fundamentals",
                points: 10,
                options: [
                    { id: "a", text: "Created, Modified, Deleted", isCorrect: false },
                    { id: "b", text: "New, Changed, Removed", isCorrect: false },
                    { id: "c", text: "Modified, Staged, Committed", isCorrect: true },
                    { id: "d", text: "Draft, Review, Published", isCorrect: false }
                ],
                explanation: "Git tracks files through three states: Modified (changed but not staged), Staged (marked for next commit), and Committed (safely stored in the database).",
                hint: "Think about the Git workflow: working directory → staging area → repository."
            },
            {
                id: "m1-q7",
                text: "What flag would you use with `git clone` to download only the most recent commit?",
                type: "single",
                difficulty: "MEDIUM",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "--shallow", isCorrect: false },
                    { id: "b", text: "--depth 1", isCorrect: true },
                    { id: "c", text: "--recent", isCorrect: false },
                    { id: "d", text: "--latest", isCorrect: false }
                ],
                explanation: "git clone --depth 1 creates a shallow clone with only the most recent commit. This is useful for large repositories when you don't need the full history.",
                hint: "The flag specifies how 'deep' into history you want to go."
            },
            {
                id: "m1-q8",
                text: "Who created Git and in what year?",
                type: "single",
                difficulty: "EASY",
                category: "History",
                points: 10,
                options: [
                    { id: "a", text: "Bill Gates in 2000", isCorrect: false },
                    { id: "b", text: "Linus Torvalds in 2005", isCorrect: true },
                    { id: "c", text: "Mark Zuckerberg in 2010", isCorrect: false },
                    { id: "d", text: "Guido van Rossum in 2003", isCorrect: false }
                ],
                explanation: "Git was created by Linus Torvalds in 2005 for development of the Linux kernel, after the relationship with BitKeeper broke down.",
                hint: "The same person who created Linux also created Git."
            },
            {
                id: "m1-q9",
                text: "What command lists all your Git configuration settings?",
                type: "single",
                difficulty: "EASY",
                category: "Configuration",
                points: 10,
                options: [
                    { id: "a", text: "git settings --all", isCorrect: false },
                    { id: "b", text: "git config --show", isCorrect: false },
                    { id: "c", text: "git config --list", isCorrect: true },
                    { id: "d", text: "git show config", isCorrect: false }
                ],
                explanation: "git config --list displays all configuration settings including user.name, user.email, and other customizations.",
                hint: "The --list flag is commonly used in Git commands to display information."
            },
            {
                id: "m1-q10",
                text: "What is the staging area in Git also known as?",
                type: "single",
                difficulty: "MEDIUM",
                category: "Fundamentals",
                points: 10,
                options: [
                    { id: "a", text: "The commit area", isCorrect: false },
                    { id: "b", text: "The index", isCorrect: true },
                    { id: "c", text: "The workspace", isCorrect: false },
                    { id: "d", text: "The cache", isCorrect: false }
                ],
                explanation: "The staging area is also called 'the index'. It's where you prepare files before committing them.",
                hint: "It's a technical term that Git uses internally to refer to the staging area."
            }
        ]
    }
]

// Module 2: Basic Git Operations
const module2Lessons = [
    {
        title: "Understanding Git Status",
        description: "Learn to read and interpret git status output",
        type: "READING" as const,
        orderIndex: 0,
        estimatedMinutes: 10,
        content: `# Understanding Git Status

The \`git status\` command is your best friend in Git. It tells you exactly what's happening in your repository at any moment.

## Basic Usage

\`\`\`bash
git status
\`\`\`

## Reading the Output

### Clean Working Directory
\`\`\`
On branch main
nothing to commit, working tree clean
\`\`\`
This means:
- You're on the \`main\` branch
- No files have been modified
- Nothing needs to be committed

### Untracked Files
\`\`\`
On branch main
Untracked files:
  (use "git add <file>..." to include in what will be committed)
        newfile.txt
\`\`\`
Untracked files are new files that Git doesn't know about yet.

### Modified Files (Not Staged)
\`\`\`
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   README.md
\`\`\`
These files have been changed but not added to the staging area.

### Staged Files
\`\`\`
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        new file:   index.html
        modified:   README.md
\`\`\`
These files will be included in your next commit.

## File States Flow

\`\`\`
Untracked → Staged → Committed
    ↓          ↓
Modified → Staged → Committed
\`\`\`

## Short Status

For a more compact view:

\`\`\`bash
git status -s
# or
git status --short
\`\`\`

Output looks like:
\`\`\`
 M README.md      # Modified, not staged
M  index.html     # Modified, staged
A  newfile.txt    # New file, staged
?? unknown.txt    # Untracked
\`\`\`

### Status Codes

| Code | Meaning |
|------|---------|
| \`??\` | Untracked |
| \`A\` | Added (staged) |
| \`M\` | Modified |
| \`D\` | Deleted |
| \`R\` | Renamed |
| \`C\` | Copied |

The position matters:
- **Left column**: Staging area status
- **Right column**: Working tree status

## Branch Information

\`\`\`bash
git status -b
\`\`\`

Shows branch tracking information:
\`\`\`
On branch main
Your branch is ahead of 'origin/main' by 2 commits.
\`\`\`

## Common Scenarios

### Scenario 1: Ready to Commit
\`\`\`
Changes to be committed:
        new file:   feature.js
        modified:   app.js
\`\`\`
✅ Run \`git commit\` to save these changes

### Scenario 2: Need to Stage
\`\`\`
Changes not staged for commit:
        modified:   config.json
\`\`\`
📝 Run \`git add config.json\` to stage

### Scenario 3: Mixed State
\`\`\`
Changes to be committed:
        modified:   app.js

Changes not staged for commit:
        modified:   app.js
\`\`\`
⚠️ The same file has staged AND unstaged changes!

---

> 💡 **Pro Tip**: Run \`git status\` frequently! It's the safest command and helps you understand your repository's state.`,
    },
    {
        title: "Adding Files with git add",
        description: "Master the staging area and git add command",
        type: "READING" as const,
        orderIndex: 1,
        estimatedMinutes: 12,
        content: `# Adding Files with git add

The \`git add\` command moves changes from your working directory to the staging area. Think of it as preparing files for a snapshot.

## Why Stage Files?

Staging lets you:
- **Select specific changes** to commit
- **Review what you're about to commit**
- **Create logical, focused commits**

## Basic Commands

### Add a Single File
\`\`\`bash
git add filename.txt
\`\`\`

### Add Multiple Specific Files
\`\`\`bash
git add file1.txt file2.txt file3.txt
\`\`\`

### Add All Files in Current Directory
\`\`\`bash
git add .
\`\`\`

### Add All Files in Repository
\`\`\`bash
git add -A
# or
git add --all
\`\`\`

## Understanding the Differences

| Command | New Files | Modified | Deleted | Scope |
|---------|-----------|----------|---------|-------|
| \`git add .\` | ✅ | ✅ | ✅ | Current dir & subdirs |
| \`git add -A\` | ✅ | ✅ | ✅ | Entire repository |
| \`git add -u\` | ❌ | ✅ | ✅ | Tracked files only |

## Advanced Usage

### Add by Pattern (Glob)
\`\`\`bash
# Add all JavaScript files
git add *.js

# Add all files in src folder
git add src/

# Add all TypeScript files recursively
git add "**/*.ts"
\`\`\`

### Interactive Staging
\`\`\`bash
git add -i
# or
git add --interactive
\`\`\`

This opens an interactive menu to:
- Stage specific files
- Revert staged changes
- Add untracked files

### Patch Mode (Stage Parts of Files)
\`\`\`bash
git add -p
# or
git add --patch
\`\`\`

This lets you stage specific chunks (hunks) of changes within a file!

Options in patch mode:
- \`y\` - stage this hunk
- \`n\` - don't stage this hunk
- \`s\` - split into smaller hunks
- \`q\` - quit
- \`?\` - help

## Common Patterns

### Stage All Then Unstage Specific
\`\`\`bash
git add .
git restore --staged config.local.js  # Don't commit this one
\`\`\`

### Stage Only Modified Files
\`\`\`bash
git add -u
\`\`\`

### Dry Run (Preview)
\`\`\`bash
git add -n .
# or
git add --dry-run .
\`\`\`

## The .gitignore File

Prevent files from being added:

\`\`\`bash
# .gitignore
node_modules/
*.log
.env
.DS_Store
dist/
\`\`\`

Files matching these patterns won't be staged even with \`git add .\`

## Best Practices

1. **Review before staging**
   \`\`\`bash
   git diff           # See unstaged changes
   git add .
   git diff --staged  # Review what's staged
   \`\`\`

2. **Use meaningful groupings**
   Stage related changes together for logical commits.

3. **Don't stage everything blindly**
   \`\`\`bash
   git status        # Check what will be staged
   git add .
   \`\`\`

4. **Use -p for complex changes**
   When modifying multiple features in one file, use patch mode.

---

> 🎯 **Remember**: The staging area is your commit preparation area. Take time to craft meaningful commits!`,
    },
    {
        title: "Practice: Staging Files",
        description: "Hands-on practice with git add and staging",
        type: "INTERACTIVE" as const,
        orderIndex: 2,
        estimatedMinutes: 12,
        terminalLab: {
            title: "Staging Files with git add",
            description: "Practice staging files for commit",
            scenario: {
                currentDirectory: "~/project",
                isGitRepo: true,
                existingFiles: ["index.html", "style.css", "app.js", "README.md"]
            },
            steps: [
                {
                    id: "step-1",
                    instruction: "Check the current status of the repository",
                    task: "View the repository status",
                    expectedCommands: ["git status"],
                    expectedOutput: "Untracked files:\n  index.html\n  style.css\n  app.js\n  README.md",
                    hints: ["Use git status"],
                    xpReward: 5
                },
                {
                    id: "step-2",
                    instruction: "Stage only the index.html file",
                    task: "Add index.html to staging area",
                    expectedCommands: ["git add index.html"],
                    expectedOutput: "Changes to be committed:\n  new file: index.html",
                    hints: ["git add <filename>", "git add index.html"],
                    xpReward: 10
                },
                {
                    id: "step-3",
                    instruction: "Stage all CSS files",
                    task: "Add all CSS files to staging",
                    expectedCommands: ["git add *.css", "git add style.css"],
                    expectedOutput: "Changes to be committed:\n  new file: style.css",
                    hints: ["You can use wildcards like *.css", "git add *.css"],
                    xpReward: 10
                },
                {
                    id: "step-4",
                    instruction: "Stage all remaining files at once",
                    task: "Add all untracked files",
                    expectedCommands: ["git add .", "git add -A", "git add --all"],
                    expectedOutput: "All files staged",
                    hints: ["Use git add . to stage everything", "git add ."],
                    xpReward: 10
                },
                {
                    id: "step-5",
                    instruction: "Check the status to confirm all files are staged",
                    task: "Verify staging status",
                    expectedCommands: ["git status"],
                    expectedOutput: "Changes to be committed:\n  new file: index.html\n  new file: style.css\n  new file: app.js\n  new file: README.md",
                    hints: ["git status"],
                    xpReward: 5
                }
            ],
            completionCriteria: {
                allStepsComplete: true,
                maxAttempts: 10
            }
        }
    },
    {
        title: "Making Commits with git commit",
        description: "Learn to create meaningful commits with good messages",
        type: "READING" as const,
        orderIndex: 3,
        estimatedMinutes: 15,
        content: `# Making Commits with git commit

A commit is a snapshot of your project at a specific point in time. Think of it as a save point in a video game.

## Basic Commit

\`\`\`bash
git commit -m "Your commit message"
\`\`\`

## Anatomy of a Good Commit Message

\`\`\`
<type>: <subject>

<body>

<footer>
\`\`\`

### Example:
\`\`\`
feat: Add user authentication

- Implement login and logout functionality
- Add password hashing with bcrypt
- Create session management

Closes #123
\`\`\`

## Commit Types (Conventional Commits)

| Type | Description |
|------|-------------|
| \`feat\` | New feature |
| \`fix\` | Bug fix |
| \`docs\` | Documentation only |
| \`style\` | Formatting, no code change |
| \`refactor\` | Code change, no new feature or fix |
| \`test\` | Adding tests |
| \`chore\` | Build process, auxiliary tools |

## Commit Message Guidelines

### DO ✅
- Use present tense: "Add feature" not "Added feature"
- Use imperative mood: "Fix bug" not "Fixes bug"
- Keep subject line under 50 characters
- Capitalize the subject line
- Don't end subject with a period

### DON'T ❌
- "Updated stuff" - too vague
- "Fixed bug in the login system that was causing users to not be able to log in properly when they used special characters" - too long
- "wip" - not descriptive

## Commit Options

### Commit with Editor
\`\`\`bash
git commit
# Opens your default editor for a detailed message
\`\`\`

### Commit with Inline Message
\`\`\`bash
git commit -m "Short message"
\`\`\`

### Commit with Multi-line Message
\`\`\`bash
git commit -m "Subject line" -m "Body paragraph"
\`\`\`

### Stage and Commit Together
\`\`\`bash
git commit -am "Message"
# Only works for already-tracked files!
\`\`\`

### Amend Last Commit
\`\`\`bash
git commit --amend -m "New message"
# Changes the last commit (before pushing!)
\`\`\`

### Empty Commit (for CI triggers)
\`\`\`bash
git commit --allow-empty -m "Trigger CI"
\`\`\`

## Viewing Commits

\`\`\`bash
# Show last commit
git show

# Show specific commit
git show abc123

# Show commit log
git log

# Show compact log
git log --oneline
\`\`\`

## Best Practices

### 1. Atomic Commits
Each commit should represent ONE logical change.

**Bad:**
\`\`\`
git commit -m "Add login, fix navbar, update styles"
\`\`\`

**Good:**
\`\`\`
git commit -m "Add login functionality"
git commit -m "Fix navbar alignment"
git commit -m "Update button styles"
\`\`\`

### 2. Commit Often
Small, frequent commits are better than large, infrequent ones.

### 3. Test Before Committing
Make sure your code works before committing.

\`\`\`bash
npm test
git commit -m "feat: Add user validation"
\`\`\`

### 4. Write for Future You
Your commit message should explain WHY, not just WHAT.

**Bad:**
\`\`\`
git commit -m "Change timeout to 5000"
\`\`\`

**Good:**
\`\`\`
git commit -m "Increase timeout to prevent slow network failures"
\`\`\`

## Commit Template

Create a commit template:

\`\`\`bash
# ~/.gitmessage
# <type>: <subject>
#
# <body>
#
# <footer>

git config --global commit.template ~/.gitmessage
\`\`\`

---

> 📝 **Remember**: A good commit message is a gift to your future self and your teammates!`,
    },
    {
        title: "Practice: Making Commits",
        description: "Hands-on practice creating commits",
        type: "INTERACTIVE" as const,
        orderIndex: 4,
        estimatedMinutes: 12,
        terminalLab: {
            title: "Making Commits",
            description: "Practice creating proper commits with good messages",
            scenario: {
                currentDirectory: "~/project",
                isGitRepo: true,
                existingFiles: ["index.html", "style.css"],
                stagedFiles: ["index.html", "style.css"]
            },
            steps: [
                {
                    id: "step-1",
                    instruction: "Create your first commit with a descriptive message",
                    task: "Commit the staged files",
                    expectedCommands: ["git commit -m"],
                    validatePattern: "git commit -m",
                    expectedOutput: "[main (root-commit) abc1234] Your message\n 2 files changed",
                    hints: [
                        "Use git commit -m \"Your message\"",
                        "Example: git commit -m \"Add initial HTML and CSS files\""
                    ],
                    xpReward: 15
                },
                {
                    id: "step-2",
                    instruction: "View the commit you just made",
                    task: "Show the last commit",
                    expectedCommands: ["git log", "git log --oneline", "git show"],
                    expectedOutput: "commit abc1234\nAuthor: ...\nDate: ...",
                    hints: ["Use git log or git show", "git log --oneline for compact view"],
                    xpReward: 10
                },
                {
                    id: "step-3",
                    instruction: "Check the status after committing",
                    task: "Verify clean working directory",
                    expectedCommands: ["git status"],
                    expectedOutput: "nothing to commit, working tree clean",
                    hints: ["git status"],
                    xpReward: 5
                }
            ],
            completionCriteria: {
                allStepsComplete: true,
                maxAttempts: 10
            }
        }
    },
    {
        title: "Viewing History with git log",
        description: "Navigate and understand your commit history",
        type: "READING" as const,
        orderIndex: 5,
        estimatedMinutes: 10,
        content: `# Viewing History with git log

The \`git log\` command shows the commit history of your repository. It's essential for understanding what happened and when.

## Basic Usage

\`\`\`bash
git log
\`\`\`

Output:
\`\`\`
commit a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0 (HEAD -> main)
Author: John Doe <john@example.com>
Date:   Mon Jan 15 10:30:00 2024 +0000

    Add user authentication feature

commit b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1
Author: Jane Smith <jane@example.com>
Date:   Sun Jan 14 15:45:00 2024 +0000

    Initial commit
\`\`\`

## Useful Options

### One-line Format
\`\`\`bash
git log --oneline
\`\`\`
Output:
\`\`\`
a1b2c3d (HEAD -> main) Add user authentication
b2c3d4e Initial commit
\`\`\`

### Limit Number of Commits
\`\`\`bash
git log -n 5
# or
git log -5
\`\`\`

### Show Graph
\`\`\`bash
git log --graph --oneline
\`\`\`
Output:
\`\`\`
* a1b2c3d (HEAD -> main) Merge feature branch
|\\
| * c3d4e5f Add new feature
| * d4e5f6g WIP feature
|/
* b2c3d4e Initial commit
\`\`\`

### Show Changes (Patch)
\`\`\`bash
git log -p
# or
git log --patch
\`\`\`

### Show Stats
\`\`\`bash
git log --stat
\`\`\`
Output:
\`\`\`
commit a1b2c3d
Author: John Doe
Date:   Mon Jan 15

    Add authentication

 src/auth.js | 50 +++++++++++++++++++++++++++++++++++
 1 file changed, 50 insertions(+)
\`\`\`

## Filtering Commits

### By Author
\`\`\`bash
git log --author="John"
\`\`\`

### By Date
\`\`\`bash
git log --after="2024-01-01"
git log --before="2024-02-01"
git log --since="2 weeks ago"
git log --until="yesterday"
\`\`\`

### By Message
\`\`\`bash
git log --grep="bug fix"
\`\`\`

### By File
\`\`\`bash
git log -- path/to/file.js
\`\`\`

### By Content Changes
\`\`\`bash
git log -S "function_name"
# Finds commits that added or removed "function_name"
\`\`\`

## Custom Format

\`\`\`bash
git log --pretty=format:"%h - %an, %ar : %s"
\`\`\`
Output:
\`\`\`
a1b2c3d - John Doe, 2 days ago : Add authentication
b2c3d4e - Jane Smith, 5 days ago : Initial commit
\`\`\`

### Format Placeholders
| Placeholder | Description |
|-------------|-------------|
| %H | Full commit hash |
| %h | Short commit hash |
| %an | Author name |
| %ae | Author email |
| %ar | Author date, relative |
| %s | Subject |
| %b | Body |

## Pro Tip: Create an Alias

\`\`\`bash
git config --global alias.lg "log --graph --oneline --all --decorate"
\`\`\`

Now you can use:
\`\`\`bash
git lg
\`\`\`

---

> 💡 **Tip**: Combine options! \`git log --oneline --graph --all -20\` shows a graph of all branches, 20 commits, in compact form.`,
    },
    {
        title: "Module 2 Quiz: Basic Operations",
        description: "Test your knowledge of basic Git operations",
        type: "QUIZ" as const,
        orderIndex: 6,
        estimatedMinutes: 15,
        passingScore: 70,
        quizQuestions: [
            {
                id: "m2-q1",
                text: "What command shows the current state of your working directory and staging area?",
                type: "single",
                difficulty: "EASY",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "git show", isCorrect: false },
                    { id: "b", text: "git status", isCorrect: true },
                    { id: "c", text: "git log", isCorrect: false },
                    { id: "d", text: "git check", isCorrect: false }
                ],
                explanation: "git status shows the state of your working directory and staging area, including which changes are staged, unstaged, and untracked.",
                hint: "The command name directly reflects what it does - shows the status."
            },
            {
                id: "m2-q2",
                text: "What does `git add .` do?",
                type: "single",
                difficulty: "EASY",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "Adds all files in the repository", isCorrect: false },
                    { id: "b", text: "Adds only modified files", isCorrect: false },
                    { id: "c", text: "Adds all files in current directory and subdirectories", isCorrect: true },
                    { id: "d", text: "Adds only new files", isCorrect: false }
                ],
                explanation: "git add . stages all new, modified, and deleted files in the current directory and its subdirectories.",
                hint: "The dot (.) represents the current directory."
            },
            {
                id: "m2-q3",
                text: "Which flag allows you to stage parts of a file interactively?",
                type: "single",
                difficulty: "MEDIUM",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "git add -i", isCorrect: false },
                    { id: "b", text: "git add -p", isCorrect: true },
                    { id: "c", text: "git add -s", isCorrect: false },
                    { id: "d", text: "git add -h", isCorrect: false }
                ],
                explanation: "git add -p (or --patch) allows you to interactively select portions (hunks) of files to stage.",
                hint: "The flag stands for 'patch', which refers to pieces of changes."
            },
            {
                id: "m2-q4",
                text: "What is the recommended style for commit message subjects?",
                type: "single",
                difficulty: "MEDIUM",
                category: "Best Practices",
                points: 10,
                options: [
                    { id: "a", text: "Past tense, lowercase", isCorrect: false },
                    { id: "b", text: "Imperative mood, capitalized", isCorrect: true },
                    { id: "c", text: "Future tense, all caps", isCorrect: false },
                    { id: "d", text: "Any style is acceptable", isCorrect: false }
                ],
                explanation: "Commit subjects should use imperative mood ('Add feature' not 'Added feature') and be capitalized. This matches Git's own style.",
                hint: "Think of completing the sentence: 'This commit will...'."
            },
            {
                id: "m2-q5",
                text: "What does `git commit -am \"message\"` do?",
                type: "single",
                difficulty: "MEDIUM",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "Stages all files and commits", isCorrect: false },
                    { id: "b", text: "Stages all tracked modified files and commits", isCorrect: true },
                    { id: "c", text: "Amends the last commit", isCorrect: false },
                    { id: "d", text: "Creates an annotated commit", isCorrect: false }
                ],
                explanation: "The -a flag stages all modified tracked files, and -m provides the message. Note: It doesn't stage untracked (new) files.",
                hint: "The -a stands for 'all' but only applies to files Git is already tracking."
            },
            {
                id: "m2-q6",
                text: "How can you view just the last 5 commits in a compact format?",
                type: "single",
                difficulty: "EASY",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "git log --last 5", isCorrect: false },
                    { id: "b", text: "git log -5 --oneline", isCorrect: true },
                    { id: "c", text: "git show 5", isCorrect: false },
                    { id: "d", text: "git history -5", isCorrect: false }
                ],
                explanation: "git log -5 limits to 5 commits, and --oneline shows each commit on a single line.",
                hint: "Combine the number limit with the format option."
            },
            {
                id: "m2-q7",
                text: "What does ?? mean in `git status -s` output?",
                type: "single",
                difficulty: "MEDIUM",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "File has conflicts", isCorrect: false },
                    { id: "b", text: "File is untracked", isCorrect: true },
                    { id: "c", text: "File is ignored", isCorrect: false },
                    { id: "d", text: "File has unknown changes", isCorrect: false }
                ],
                explanation: "In short status output, ?? indicates an untracked file - one that Git doesn't know about.",
                hint: "The question marks indicate Git is 'questioning' what this file is."
            },
            {
                id: "m2-q8",
                text: "Which command would you use to change the message of your last commit (before pushing)?",
                type: "single",
                difficulty: "MEDIUM",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "git commit --edit", isCorrect: false },
                    { id: "b", text: "git commit --amend", isCorrect: true },
                    { id: "c", text: "git fix --last", isCorrect: false },
                    { id: "d", text: "git rewrite -m", isCorrect: false }
                ],
                explanation: "git commit --amend allows you to modify the last commit, including its message.",
                hint: "Amend means to make changes or corrections."
            },
            {
                id: "m2-q9",
                text: "What does `git log -S \"functionName\"` do?",
                type: "single",
                difficulty: "HARD",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "Searches commit messages for 'functionName'", isCorrect: false },
                    { id: "b", text: "Finds commits that changed the number of occurrences of 'functionName'", isCorrect: true },
                    { id: "c", text: "Shows status of files containing 'functionName'", isCorrect: false },
                    { id: "d", text: "Sorts commits by 'functionName'", isCorrect: false }
                ],
                explanation: "The -S flag (pickaxe) finds commits that changed the number of occurrences of a string - useful for finding when code was added or removed.",
                hint: "This is called the 'pickaxe' search - it picks through changes."
            },
            {
                id: "m2-q10",
                text: "What is an 'atomic commit'?",
                type: "single",
                difficulty: "MEDIUM",
                category: "Best Practices",
                points: 10,
                options: [
                    { id: "a", text: "A commit that cannot be undone", isCorrect: false },
                    { id: "b", text: "A commit that contains exactly one logical change", isCorrect: true },
                    { id: "c", text: "A commit with a very short message", isCorrect: false },
                    { id: "d", text: "A commit that is encrypted", isCorrect: false }
                ],
                explanation: "An atomic commit represents a single logical change. This makes history easier to understand and changes easier to revert if needed.",
                hint: "Atomic means indivisible - can't be broken into smaller parts."
            }
        ]
    }
]

// Module 3: Branching & Merging
const module3Lessons = [
    {
        title: "Understanding Branches",
        description: "Learn what branches are and why they're essential",
        type: "READING" as const,
        orderIndex: 0,
        estimatedMinutes: 12,
        content: `# Understanding Branches

Branches are one of Git's most powerful features. They allow you to diverge from the main line of development and work independently.

## What is a Branch?

A branch is simply a lightweight movable pointer to a commit. The default branch is called \`main\` (or \`master\` in older repositories).

\`\`\`
     main
       ↓
A ← B ← C
\`\`\`

When you create a new branch, you create a new pointer:

\`\`\`
     main
       ↓
A ← B ← C
       ↑
    feature
\`\`\`

## Why Use Branches?

### 1. Isolated Development
Work on features without affecting the main codebase.

### 2. Parallel Work
Multiple team members can work on different features simultaneously.

### 3. Safe Experimentation
Try ideas without risking stable code.

### 4. Organized History
Keep the main branch clean and deployable.

## The HEAD Pointer

HEAD is a special pointer that indicates which branch you're currently on.

\`\`\`
     main
       ↓
A ← B ← C
       ↑
    feature ← HEAD
\`\`\`

## Basic Branch Commands

### View Branches
\`\`\`bash
git branch           # List local branches
git branch -a        # List all branches (including remote)
git branch -v        # List with last commit info
\`\`\`

### Create a Branch
\`\`\`bash
git branch feature-name
\`\`\`

### Switch to a Branch
\`\`\`bash
git checkout feature-name
# or (Git 2.23+)
git switch feature-name
\`\`\`

### Create and Switch (One Command)
\`\`\`bash
git checkout -b feature-name
# or (Git 2.23+)
git switch -c feature-name
\`\`\`

### Delete a Branch
\`\`\`bash
git branch -d feature-name    # Safe delete (must be merged)
git branch -D feature-name    # Force delete
\`\`\`

### Rename a Branch
\`\`\`bash
git branch -m old-name new-name
\`\`\`

## Branch Naming Conventions

Good branch names are:
- Descriptive
- Use hyphens (not spaces or underscores)
- Include ticket/issue numbers

### Common Patterns
\`\`\`
feature/user-authentication
feature/JIRA-123-add-login
bugfix/fix-navbar-alignment
hotfix/security-patch
release/v2.0.0
\`\`\`

## Visualizing Branches

\`\`\`bash
git log --graph --oneline --all
\`\`\`

Output:
\`\`\`
* e5f6g7h (HEAD -> feature) Add new feature
| * d4e5f6g (main) Update readme
|/
* c3d4e5f Initial commit
\`\`\`

## Best Practices

1. **Keep branches short-lived** - Merge frequently
2. **One feature per branch** - Keep changes focused
3. **Pull before creating** - Start from latest main
4. **Delete after merging** - Keep repository clean

---

> 💡 **Pro Tip**: Branches are cheap in Git. Don't hesitate to create them for even small changes!`,
    },
    {
        title: "Branching Strategies - Video Tutorial",
        description: "Visual guide to Git branching workflows",
        type: "VIDEO" as const,
        orderIndex: 1,
        estimatedMinutes: 12,
        videoUrl: "https://www.youtube.com/watch?v=aJnFGMclhU8",
        content: `# Branching Strategies - Video Tutorial

Watch this comprehensive video on Git branching strategies and workflows.

## Topics Covered

- Creating and switching branches
- Different branching strategies (Git Flow, GitHub Flow)
- When to branch and when to merge
- Real-world branching scenarios

## Key Concepts

### Git Flow
- **main**: Production-ready code
- **develop**: Integration branch
- **feature/**: New features
- **release/**: Preparing releases
- **hotfix/**: Emergency fixes

### GitHub Flow (Simpler)
- **main**: Always deployable
- **feature branches**: All new work
- Pull requests for review
- Deploy from main

## After Watching

You should understand:
1. How branches diverge and merge
2. Which workflow suits your team
3. When to create a new branch
4. How to keep branches organized`
    },
    {
        title: "Practice: Creating and Switching Branches",
        description: "Hands-on practice with branching",
        type: "INTERACTIVE" as const,
        orderIndex: 2,
        estimatedMinutes: 15,
        terminalLab: {
            title: "Branch Management",
            description: "Practice creating, switching, and managing branches",
            scenario: {
                currentDirectory: "~/project",
                isGitRepo: true,
                branches: ["main"],
                currentBranch: "main"
            },
            steps: [
                {
                    id: "step-1",
                    instruction: "List all existing branches",
                    task: "View current branches",
                    expectedCommands: ["git branch", "git branch -a"],
                    expectedOutput: "* main",
                    hints: ["git branch lists all local branches"],
                    xpReward: 5
                },
                {
                    id: "step-2",
                    instruction: "Create a new branch called 'feature/login'",
                    task: "Create a new branch",
                    expectedCommands: ["git branch feature/login"],
                    expectedOutput: "Branch 'feature/login' created",
                    hints: ["git branch <branch-name>", "git branch feature/login"],
                    xpReward: 10
                },
                {
                    id: "step-3",
                    instruction: "Switch to the new feature/login branch",
                    task: "Checkout the new branch",
                    expectedCommands: ["git checkout feature/login", "git switch feature/login"],
                    expectedOutput: "Switched to branch 'feature/login'",
                    hints: ["Use git checkout or git switch", "git checkout feature/login"],
                    xpReward: 10
                },
                {
                    id: "step-4",
                    instruction: "Create and switch to a new branch 'bugfix/header' in one command",
                    task: "Create and switch to branch",
                    expectedCommands: ["git checkout -b bugfix/header", "git switch -c bugfix/header"],
                    expectedOutput: "Switched to a new branch 'bugfix/header'",
                    hints: ["Use -b flag with checkout or -c with switch", "git checkout -b bugfix/header"],
                    xpReward: 15
                },
                {
                    id: "step-5",
                    instruction: "List all branches to see your new branches",
                    task: "Verify branch creation",
                    expectedCommands: ["git branch"],
                    expectedOutput: "  feature/login\n  main\n* bugfix/header",
                    hints: ["git branch"],
                    xpReward: 5
                },
                {
                    id: "step-6",
                    instruction: "Switch back to main branch",
                    task: "Return to main branch",
                    expectedCommands: ["git checkout main", "git switch main"],
                    expectedOutput: "Switched to branch 'main'",
                    hints: ["git checkout main"],
                    xpReward: 5
                }
            ],
            completionCriteria: {
                allStepsComplete: true,
                maxAttempts: 10
            }
        }
    },
    {
        title: "Merging Branches",
        description: "Learn to merge branches and resolve conflicts",
        type: "READING" as const,
        orderIndex: 3,
        estimatedMinutes: 15,
        content: `# Merging Branches

Merging is how you combine work from different branches. Git handles most merges automatically, but sometimes you need to help.

## Basic Merge

To merge a branch into your current branch:

\`\`\`bash
# Switch to the target branch (e.g., main)
git checkout main

# Merge the feature branch
git merge feature-branch
\`\`\`

## Types of Merges

### Fast-Forward Merge
When there's a direct path between branches:

\`\`\`
Before:
main: A ← B ← C
              ↑
feature:      D ← E

After (fast-forward):
main: A ← B ← C ← D ← E
\`\`\`

Git just moves the pointer forward. No new commit created.

### Three-Way Merge
When branches have diverged:

\`\`\`
Before:
       C ← D (main)
      /
A ← B
      \\
       E ← F (feature)

After:
       C ← D
      /     \\
A ← B       M (merge commit)
      \\     /
       E ← F
\`\`\`

Git creates a new "merge commit" with two parents.

## Merge Options

### No Fast-Forward
Always create a merge commit:
\`\`\`bash
git merge --no-ff feature-branch
\`\`\`

### Squash Merge
Combine all commits into one:
\`\`\`bash
git merge --squash feature-branch
git commit -m "Add feature (squashed)"
\`\`\`

### Abort Merge
If something goes wrong:
\`\`\`bash
git merge --abort
\`\`\`

## Merge Conflicts

Conflicts occur when both branches modified the same lines.

### Conflict Markers
\`\`\`
<<<<<<< HEAD
Current branch changes
=======
Incoming branch changes
>>>>>>> feature-branch
\`\`\`

### Resolving Conflicts

1. **Open the conflicted file**
2. **Decide which changes to keep**
3. **Remove conflict markers**
4. **Stage the resolved file**
5. **Complete the merge**

\`\`\`bash
# After fixing conflicts
git add resolved-file.js
git commit -m "Merge feature-branch, resolve conflicts"
\`\`\`

### Using a Merge Tool
\`\`\`bash
git mergetool
\`\`\`

## Conflict Prevention Tips

1. **Pull frequently** - Stay up to date
2. **Small, focused branches** - Easier merges
3. **Communicate with team** - Avoid parallel edits
4. **Merge main into feature regularly** - Catch conflicts early

## Viewing Merge Status

\`\`\`bash
# See which files have conflicts
git status

# See the commits being merged
git log --merge

# See the actual conflicts
git diff
\`\`\`

## Best Practices

1. **Test before merging** - Ensure both branches work
2. **Review changes** - Use \`git diff main...feature\`
3. **Write good merge commits** - Explain what was merged
4. **Delete merged branches** - Keep repo clean

\`\`\`bash
git branch -d feature-branch
\`\`\`

---

> ⚠️ **Warning**: Never merge untested code into main. Always verify your changes work!`,
    },
    {
        title: "Practice: Merging Branches",
        description: "Hands-on practice with merging",
        type: "INTERACTIVE" as const,
        orderIndex: 4,
        estimatedMinutes: 12,
        terminalLab: {
            title: "Merging Branches",
            description: "Practice merging branches",
            scenario: {
                currentDirectory: "~/project",
                isGitRepo: true,
                branches: ["main", "feature/add-footer"],
                currentBranch: "main"
            },
            steps: [
                {
                    id: "step-1",
                    instruction: "Make sure you're on the main branch",
                    task: "Checkout main branch",
                    expectedCommands: ["git checkout main", "git switch main"],
                    expectedOutput: "Already on 'main'",
                    hints: ["git checkout main"],
                    xpReward: 5
                },
                {
                    id: "step-2",
                    instruction: "Merge the feature/add-footer branch into main",
                    task: "Merge the feature branch",
                    expectedCommands: ["git merge feature/add-footer"],
                    expectedOutput: "Merge made by the 'ort' strategy.\n footer.html | 1 +",
                    hints: ["git merge <branch-name>", "git merge feature/add-footer"],
                    xpReward: 15
                },
                {
                    id: "step-3",
                    instruction: "View the merge in the commit history",
                    task: "Check the log with graph",
                    expectedCommands: ["git log --oneline --graph", "git log --graph"],
                    expectedOutput: "*   Merge branch 'feature/add-footer'\n|\\",
                    hints: ["git log --oneline --graph shows branch history"],
                    xpReward: 10
                },
                {
                    id: "step-4",
                    instruction: "Delete the merged feature branch",
                    task: "Clean up the merged branch",
                    expectedCommands: ["git branch -d feature/add-footer"],
                    expectedOutput: "Deleted branch feature/add-footer",
                    hints: ["Use git branch -d to safely delete merged branches"],
                    xpReward: 10
                }
            ],
            completionCriteria: {
                allStepsComplete: true,
                maxAttempts: 10
            }
        }
    },
    {
        title: "Module 3 Quiz: Branching & Merging",
        description: "Test your knowledge of branches and merging",
        type: "QUIZ" as const,
        orderIndex: 5,
        estimatedMinutes: 15,
        passingScore: 70,
        quizQuestions: [
            {
                id: "m3-q1",
                text: "What is a Git branch?",
                type: "single",
                difficulty: "EASY",
                category: "Concepts",
                points: 10,
                options: [
                    { id: "a", text: "A copy of the entire repository", isCorrect: false },
                    { id: "b", text: "A lightweight movable pointer to a commit", isCorrect: true },
                    { id: "c", text: "A separate folder on your computer", isCorrect: false },
                    { id: "d", text: "A different version control system", isCorrect: false }
                ],
                explanation: "A branch is simply a lightweight pointer to a specific commit. Creating a branch just creates a new pointer, not a copy of files.",
                hint: "Branches are extremely lightweight in Git."
            },
            {
                id: "m3-q2",
                text: "Which command creates AND switches to a new branch?",
                type: "single",
                difficulty: "EASY",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "git branch new-branch", isCorrect: false },
                    { id: "b", text: "git checkout -b new-branch", isCorrect: true },
                    { id: "c", text: "git create new-branch", isCorrect: false },
                    { id: "d", text: "git switch new-branch", isCorrect: false }
                ],
                explanation: "git checkout -b creates a new branch and switches to it in one command. git switch -c is the newer alternative.",
                hint: "The -b flag stands for 'branch'."
            },
            {
                id: "m3-q3",
                text: "What is HEAD in Git?",
                type: "single",
                difficulty: "MEDIUM",
                category: "Concepts",
                points: 10,
                options: [
                    { id: "a", text: "The first commit in a repository", isCorrect: false },
                    { id: "b", text: "A pointer to the currently checked-out branch/commit", isCorrect: true },
                    { id: "c", text: "The main branch of the repository", isCorrect: false },
                    { id: "d", text: "The latest commit on any branch", isCorrect: false }
                ],
                explanation: "HEAD is a special pointer that indicates which branch or commit you're currently working on.",
                hint: "Think of it as 'where you are right now' in Git."
            },
            {
                id: "m3-q4",
                text: "What is a fast-forward merge?",
                type: "single",
                difficulty: "MEDIUM",
                category: "Concepts",
                points: 10,
                options: [
                    { id: "a", text: "A merge that is performed very quickly", isCorrect: false },
                    { id: "b", text: "A merge where Git just moves the pointer forward because there's a direct path", isCorrect: true },
                    { id: "c", text: "A merge that skips testing", isCorrect: false },
                    { id: "d", text: "A merge that only includes recent commits", isCorrect: false }
                ],
                explanation: "A fast-forward merge occurs when the target branch hasn't diverged from the source - Git just moves the pointer forward.",
                hint: "No divergence means no need for a merge commit."
            },
            {
                id: "m3-q5",
                text: "What do the conflict markers <<<<<<< and >>>>>>> indicate?",
                type: "single",
                difficulty: "MEDIUM",
                category: "Concepts",
                points: 10,
                options: [
                    { id: "a", text: "Syntax errors in the code", isCorrect: false },
                    { id: "b", text: "Start and end of conflicting changes", isCorrect: true },
                    { id: "c", text: "Important comments", isCorrect: false },
                    { id: "d", text: "Encrypted content", isCorrect: false }
                ],
                explanation: "These markers show where conflicts exist. Content between <<<<<<< and ======= is from current branch, ======= to >>>>>>> is from the merging branch.",
                hint: "They mark the boundaries of conflicting sections."
            },
            {
                id: "m3-q6",
                text: "What does `git merge --no-ff` do?",
                type: "single",
                difficulty: "HARD",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "Merges without including any files", isCorrect: false },
                    { id: "b", text: "Creates a merge commit even if fast-forward is possible", isCorrect: true },
                    { id: "c", text: "Merges without any confirmation", isCorrect: false },
                    { id: "d", text: "Prevents any merge from happening", isCorrect: false }
                ],
                explanation: "--no-ff forces Git to create a merge commit even when fast-forward would be possible. This preserves feature branch history.",
                hint: "no-ff means 'no fast-forward'."
            },
            {
                id: "m3-q7",
                text: "What command would you use to abort a merge that has conflicts?",
                type: "single",
                difficulty: "EASY",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "git merge --stop", isCorrect: false },
                    { id: "b", text: "git merge --abort", isCorrect: true },
                    { id: "c", text: "git cancel merge", isCorrect: false },
                    { id: "d", text: "git undo merge", isCorrect: false }
                ],
                explanation: "git merge --abort cancels the merge and returns your working directory to the state before the merge started.",
                hint: "The flag literally says what it does."
            },
            {
                id: "m3-q8",
                text: "Which command safely deletes a merged branch?",
                type: "single",
                difficulty: "EASY",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "git branch -D branch-name", isCorrect: false },
                    { id: "b", text: "git branch -d branch-name", isCorrect: true },
                    { id: "c", text: "git delete branch-name", isCorrect: false },
                    { id: "d", text: "git remove branch-name", isCorrect: false }
                ],
                explanation: "git branch -d safely deletes a branch only if it has been merged. -D forces deletion regardless.",
                hint: "Lowercase -d is the safe option."
            },
            {
                id: "m3-q9",
                text: "What is a 'squash merge'?",
                type: "single",
                difficulty: "HARD",
                category: "Concepts",
                points: 10,
                options: [
                    { id: "a", text: "A merge that combines all branch commits into a single commit", isCorrect: true },
                    { id: "b", text: "A merge that removes duplicate commits", isCorrect: false },
                    { id: "c", text: "A merge that compresses the repository size", isCorrect: false },
                    { id: "d", text: "A merge that automatically resolves conflicts", isCorrect: false }
                ],
                explanation: "A squash merge combines all commits from a feature branch into a single commit on the target branch, creating a cleaner history.",
                hint: "All commits get 'squashed' together."
            },
            {
                id: "m3-q10",
                text: "Which is a recommended practice for branch management?",
                type: "single",
                difficulty: "MEDIUM",
                category: "Best Practices",
                points: 10,
                options: [
                    { id: "a", text: "Keep branches open for months to track all work", isCorrect: false },
                    { id: "b", text: "Delete branches immediately after creating them", isCorrect: false },
                    { id: "c", text: "Keep branches short-lived and merge frequently", isCorrect: true },
                    { id: "d", text: "Never delete any branches", isCorrect: false }
                ],
                explanation: "Short-lived branches that merge frequently reduce merge conflicts and keep the codebase up to date.",
                hint: "Smaller, more frequent merges are easier to manage."
            }
        ]
    }
]

// Module 4: Remote Repositories
const module4Lessons = [
    {
        title: "Understanding Remote Repositories",
        description: "Learn about remotes and distributed collaboration",
        type: "READING" as const,
        orderIndex: 0,
        estimatedMinutes: 12,
        content: `# Understanding Remote Repositories

Remote repositories are versions of your project hosted on the internet or a network. They enable collaboration with others.

## What is a Remote?

A remote is a reference to another copy of your repository. Common hosting platforms:
- **GitHub** - Most popular
- **GitLab** - Self-hosted option
- **Bitbucket** - Atlassian's solution
- **Azure DevOps** - Microsoft's platform

## Viewing Remotes

\`\`\`bash
# List remotes
git remote

# List with URLs
git remote -v
\`\`\`

Output:
\`\`\`
origin  https://github.com/user/repo.git (fetch)
origin  https://github.com/user/repo.git (push)
\`\`\`

## Adding a Remote

\`\`\`bash
git remote add origin https://github.com/user/repo.git
\`\`\`

### Common Remote Names
- **origin** - Your primary remote (default)
- **upstream** - Original repo (for forks)

## Remote Operations

### Fetch
Downloads data from remote but doesn't merge:
\`\`\`bash
git fetch origin
\`\`\`

### Pull
Fetches AND merges in one step:
\`\`\`bash
git pull origin main
\`\`\`

### Push
Uploads your commits to the remote:
\`\`\`bash
git push origin main
\`\`\`

## The origin/main Branch

When you clone, Git creates a "remote-tracking branch":
- \`origin/main\` - Points to where \`main\` is on the remote
- It's read-only locally
- Updated when you fetch/pull

\`\`\`
Local:                     Remote:
main ← HEAD                main
origin/main                
\`\`\`

## Managing Remotes

\`\`\`bash
# Rename a remote
git remote rename origin github

# Remove a remote
git remote remove origin

# Change URL
git remote set-url origin new-url.git

# Show remote details
git remote show origin
\`\`\`

## SSH vs HTTPS

### HTTPS
\`\`\`bash
git clone https://github.com/user/repo.git
\`\`\`
- Easier to set up
- Requires username/password (or token)

### SSH
\`\`\`bash
git clone git@github.com:user/repo.git
\`\`\`
- More secure
- Requires SSH key setup
- No password needed after setup

---

> 💡 **Tip**: Always use SSH for repositories you push to frequently. It's more secure and convenient.`,
    },
    {
        title: "Push, Pull, and Fetch",
        description: "Master syncing with remote repositories",
        type: "READING" as const,
        orderIndex: 1,
        estimatedMinutes: 15,
        content: `# Push, Pull, and Fetch

These three commands are essential for working with remote repositories. Understanding their differences is crucial.

## git fetch

**Downloads commits, files, and refs from remote without merging.**

\`\`\`bash
git fetch origin
\`\`\`

### What Happens:
1. Contacts the remote repository
2. Downloads new commits/branches
3. Updates remote-tracking branches
4. Does NOT change your working files

### When to Use:
- See what others have done
- Before deciding to merge
- Update remote-tracking branches

\`\`\`bash
# Fetch all remotes
git fetch --all

# Fetch and prune deleted branches
git fetch --prune
\`\`\`

## git pull

**Fetches AND merges in one command.**

\`\`\`bash
git pull origin main
\`\`\`

This is equivalent to:
\`\`\`bash
git fetch origin
git merge origin/main
\`\`\`

### Pull Options

\`\`\`bash
# Pull with rebase instead of merge
git pull --rebase origin main

# Pull and update submodules
git pull --recurse-submodules
\`\`\`

### Handling Pull Conflicts

If there are conflicts:
1. Git will pause the merge
2. Resolve conflicts in the files
3. \`git add\` the resolved files
4. \`git commit\` to complete

## git push

**Uploads local commits to the remote.**

\`\`\`bash
git push origin main
\`\`\`

### First Push (Set Upstream)

\`\`\`bash
git push -u origin main
# or
git push --set-upstream origin main
\`\`\`

After this, you can just use \`git push\`.

### Push Options

\`\`\`bash
# Push all branches
git push --all

# Push tags
git push --tags

# Force push (DANGEROUS!)
git push --force

# Safer force push
git push --force-with-lease
\`\`\`

## Comparison Table

| Command | Downloads | Merges | Changes Working Dir |
|---------|-----------|--------|---------------------|
| fetch | ✅ | ❌ | ❌ |
| pull | ✅ | ✅ | ✅ |
| push | ❌ | N/A | N/A |

## Common Workflows

### Start of Day
\`\`\`bash
git fetch origin
git status  # See if behind/ahead
git pull origin main
\`\`\`

### Before Pushing
\`\`\`bash
git pull origin main  # Get latest
# Resolve any conflicts
git push origin main
\`\`\`

### Feature Branch Workflow
\`\`\`bash
git checkout -b feature
# ... make changes ...
git push -u origin feature
# Create pull request on GitHub
\`\`\`

## Tracking Branches

\`\`\`bash
# See tracking info
git branch -vv

# Set tracking for existing branch
git branch -u origin/main
\`\`\`

---

> ⚠️ **Warning**: Never force push to shared branches like main. It rewrites history and causes problems for collaborators.`,
    },
    {
        title: "Practice: Working with Remotes",
        description: "Hands-on practice with remote operations",
        type: "INTERACTIVE" as const,
        orderIndex: 2,
        estimatedMinutes: 15,
        terminalLab: {
            title: "Remote Repository Operations",
            description: "Practice fetch, pull, and push operations",
            scenario: {
                currentDirectory: "~/project",
                isGitRepo: true,
                hasRemote: true,
                remoteName: "origin",
                remoteUrl: "https://github.com/user/project.git"
            },
            steps: [
                {
                    id: "step-1",
                    instruction: "List all configured remotes with their URLs",
                    task: "View remote repositories",
                    expectedCommands: ["git remote -v"],
                    expectedOutput: "origin  https://github.com/user/project.git (fetch)\norigin  https://github.com/user/project.git (push)",
                    hints: ["Use git remote with -v flag", "git remote -v"],
                    xpReward: 5
                },
                {
                    id: "step-2",
                    instruction: "Fetch the latest changes from the remote without merging",
                    task: "Fetch from origin",
                    expectedCommands: ["git fetch origin", "git fetch"],
                    expectedOutput: "From https://github.com/user/project\n * branch main -> FETCH_HEAD",
                    hints: ["git fetch downloads without merging", "git fetch origin"],
                    xpReward: 10
                },
                {
                    id: "step-3",
                    instruction: "Check if your branch is behind or ahead of the remote",
                    task: "Check branch status",
                    expectedCommands: ["git status", "git branch -vv"],
                    expectedOutput: "Your branch is behind 'origin/main' by 2 commits",
                    hints: ["git status shows if you're ahead/behind"],
                    xpReward: 5
                },
                {
                    id: "step-4",
                    instruction: "Pull the latest changes from the main branch",
                    task: "Pull from origin main",
                    expectedCommands: ["git pull origin main", "git pull"],
                    expectedOutput: "Updating abc123..def456\nFast-forward",
                    hints: ["git pull fetches and merges", "git pull origin main"],
                    xpReward: 10
                },
                {
                    id: "step-5",
                    instruction: "Push your local commits to the remote (after making changes)",
                    task: "Push to origin",
                    expectedCommands: ["git push origin main", "git push"],
                    expectedOutput: "Enumerating objects: 5, done.\nTo https://github.com/user/project.git\n   def456..ghi789  main -> main",
                    hints: ["git push uploads your commits", "git push origin main"],
                    xpReward: 15
                }
            ],
            completionCriteria: {
                allStepsComplete: true,
                maxAttempts: 10
            }
        }
    },
    {
        title: "Module 4 Quiz: Remote Repositories",
        description: "Test your knowledge of remote operations",
        type: "QUIZ" as const,
        orderIndex: 3,
        estimatedMinutes: 12,
        passingScore: 70,
        quizQuestions: [
            {
                id: "m4-q1",
                text: "What does `git fetch` do?",
                type: "single",
                difficulty: "EASY",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "Downloads and merges changes from remote", isCorrect: false },
                    { id: "b", text: "Downloads changes from remote without merging", isCorrect: true },
                    { id: "c", text: "Uploads local changes to remote", isCorrect: false },
                    { id: "d", text: "Deletes remote branches", isCorrect: false }
                ],
                explanation: "git fetch downloads commits, files, and refs from a remote but doesn't merge them into your working branch.",
                hint: "Fetch gets data but doesn't change your working files."
            },
            {
                id: "m4-q2",
                text: "What is 'origin' in Git?",
                type: "single",
                difficulty: "EASY",
                category: "Concepts",
                points: 10,
                options: [
                    { id: "a", text: "The first commit in a repository", isCorrect: false },
                    { id: "b", text: "The default name for the remote repository", isCorrect: true },
                    { id: "c", text: "The main branch", isCorrect: false },
                    { id: "d", text: "Your local repository", isCorrect: false }
                ],
                explanation: "'origin' is the default name Git gives to the remote repository you cloned from.",
                hint: "It's where your repository originally came from."
            },
            {
                id: "m4-q3",
                text: "What is the difference between `git pull` and `git fetch`?",
                type: "single",
                difficulty: "MEDIUM",
                category: "Concepts",
                points: 10,
                options: [
                    { id: "a", text: "pull is faster than fetch", isCorrect: false },
                    { id: "b", text: "fetch downloads and merges, pull only downloads", isCorrect: false },
                    { id: "c", text: "pull downloads and merges, fetch only downloads", isCorrect: true },
                    { id: "d", text: "There is no difference", isCorrect: false }
                ],
                explanation: "git pull = git fetch + git merge. Pull fetches changes AND merges them, while fetch only downloads.",
                hint: "Pull does two operations in one."
            },
            {
                id: "m4-q4",
                text: "What does the `-u` flag do in `git push -u origin main`?",
                type: "single",
                difficulty: "MEDIUM",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "Updates the remote branch", isCorrect: false },
                    { id: "b", text: "Sets the upstream tracking reference", isCorrect: true },
                    { id: "c", text: "Uploads all branches", isCorrect: false },
                    { id: "d", text: "Undoes the last push", isCorrect: false }
                ],
                explanation: "The -u (or --set-upstream) flag sets the remote branch as the default upstream, so future pushes can use just 'git push'.",
                hint: "It sets up tracking for easier future pushes."
            },
            {
                id: "m4-q5",
                text: "What command shows detailed information about a remote?",
                type: "single",
                difficulty: "EASY",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "git remote info origin", isCorrect: false },
                    { id: "b", text: "git remote show origin", isCorrect: true },
                    { id: "c", text: "git remote details origin", isCorrect: false },
                    { id: "d", text: "git describe origin", isCorrect: false }
                ],
                explanation: "git remote show <name> displays detailed information about a remote including its branches and tracking info.",
                hint: "The command uses 'show' to display information."
            },
            {
                id: "m4-q6",
                text: "Why is `git push --force` considered dangerous?",
                type: "single",
                difficulty: "HARD",
                category: "Best Practices",
                points: 10,
                options: [
                    { id: "a", text: "It can corrupt the repository", isCorrect: false },
                    { id: "b", text: "It can overwrite others' work on shared branches", isCorrect: true },
                    { id: "c", text: "It uses too much bandwidth", isCorrect: false },
                    { id: "d", text: "It deletes all local branches", isCorrect: false }
                ],
                explanation: "Force push rewrites remote history. If others have based work on that history, their work becomes incompatible.",
                hint: "Think about what happens to others who have already pulled those commits."
            },
            {
                id: "m4-q7",
                text: "What is the safer alternative to `git push --force`?",
                type: "single",
                difficulty: "HARD",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "git push --safe", isCorrect: false },
                    { id: "b", text: "git push --force-with-lease", isCorrect: true },
                    { id: "c", text: "git push --careful", isCorrect: false },
                    { id: "d", text: "git push --verify", isCorrect: false }
                ],
                explanation: "--force-with-lease checks that no one else has pushed since your last fetch, failing if the remote has new commits.",
                hint: "The 'lease' ensures no one else has made changes."
            },
            {
                id: "m4-q8",
                text: "What does `git fetch --prune` do?",
                type: "single",
                difficulty: "MEDIUM",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "Removes local branches", isCorrect: false },
                    { id: "b", text: "Removes remote-tracking references to deleted remote branches", isCorrect: true },
                    { id: "c", text: "Cleans up the repository size", isCorrect: false },
                    { id: "d", text: "Removes untracked files", isCorrect: false }
                ],
                explanation: "--prune removes local remote-tracking branches that no longer exist on the remote (e.g., deleted feature branches).",
                hint: "Prune cleans up references to branches that no longer exist remotely."
            },
            {
                id: "m4-q9",
                text: "What is 'upstream' typically used for in Git?",
                type: "single",
                difficulty: "MEDIUM",
                category: "Concepts",
                points: 10,
                options: [
                    { id: "a", text: "The default name for your personal remote", isCorrect: false },
                    { id: "b", text: "A reference to the original repository you forked from", isCorrect: true },
                    { id: "c", text: "The main branch of any repository", isCorrect: false },
                    { id: "d", text: "A backup remote location", isCorrect: false }
                ],
                explanation: "'upstream' is conventionally used to refer to the original repository you forked from, while 'origin' is your fork.",
                hint: "Think about the flow of changes in a fork workflow."
            },
            {
                id: "m4-q10",
                text: "Which command adds a new remote called 'backup'?",
                type: "single",
                difficulty: "EASY",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "git remote backup add https://...", isCorrect: false },
                    { id: "b", text: "git remote add backup https://...", isCorrect: true },
                    { id: "c", text: "git add remote backup https://...", isCorrect: false },
                    { id: "d", text: "git remote create backup https://...", isCorrect: false }
                ],
                explanation: "git remote add <name> <url> adds a new remote with the specified name and URL.",
                hint: "The syntax is: git remote add <name> <url>"
            }
        ]
    }
]

// Module 5: Undoing Changes
const module5Lessons = [
    {
        title: "Undoing Changes in Git",
        description: "Learn different ways to undo mistakes in Git",
        type: "READING" as const,
        orderIndex: 0,
        estimatedMinutes: 15,
        content: `# Undoing Changes in Git

Everyone makes mistakes. Git provides several ways to undo changes, depending on where those changes are.

## The Three Areas

Remember Git's three areas:
1. **Working Directory** - Your current files
2. **Staging Area** - Files ready to commit
3. **Repository** - Committed history

Each area has different undo commands.

## Discard Working Directory Changes

### Discard changes in a file
\`\`\`bash
git restore file.txt
# or (older syntax)
git checkout -- file.txt
\`\`\`

### Discard ALL changes
\`\`\`bash
git restore .
# or
git checkout -- .
\`\`\`

⚠️ **Warning**: This permanently deletes uncommitted changes!

## Unstage Files

### Unstage a file (keep changes)
\`\`\`bash
git restore --staged file.txt
# or (older syntax)
git reset HEAD file.txt
\`\`\`

### Unstage everything
\`\`\`bash
git restore --staged .
# or
git reset HEAD
\`\`\`

## Amend Last Commit

### Change commit message
\`\`\`bash
git commit --amend -m "New message"
\`\`\`

### Add forgotten files
\`\`\`bash
git add forgotten-file.txt
git commit --amend --no-edit
\`\`\`

⚠️ Only amend commits that haven't been pushed!

## Undo Commits

### git reset (moves HEAD)

Three modes:

| Mode | Staging | Working Dir |
|------|---------|-------------|
| --soft | Keeps | Keeps |
| --mixed (default) | Clears | Keeps |
| --hard | Clears | Clears |

\`\`\`bash
# Undo last commit, keep changes staged
git reset --soft HEAD~1

# Undo last commit, unstage changes
git reset HEAD~1

# Undo last commit, delete changes
git reset --hard HEAD~1
\`\`\`

### git revert (creates new commit)

\`\`\`bash
git revert abc123
\`\`\`

Creates a new commit that undoes the changes. **Safe for shared branches!**

## Summary: When to Use What

| Situation | Command |
|-----------|---------|
| Discard working changes | \`git restore\` |
| Unstage files | \`git restore --staged\` |
| Change last commit | \`git commit --amend\` |
| Undo local commits | \`git reset\` |
| Undo pushed commits | \`git revert\` |

---

> 🎯 **Remember**: \`reset\` rewrites history (bad for shared work), \`revert\` adds history (safe for shared work).`,
    },
    {
        title: "Practice: Undoing Changes",
        description: "Hands-on practice with undo operations",
        type: "INTERACTIVE" as const,
        orderIndex: 1,
        estimatedMinutes: 15,
        terminalLab: {
            title: "Undoing Changes",
            description: "Practice various undo operations",
            scenario: {
                currentDirectory: "~/project",
                isGitRepo: true
            },
            steps: [
                {
                    id: "step-1",
                    instruction: "A file has been modified but you want to discard the changes",
                    task: "Discard changes in app.js",
                    expectedCommands: ["git restore app.js", "git checkout -- app.js"],
                    expectedOutput: "Changes discarded",
                    hints: ["Use git restore <filename>", "git restore app.js"],
                    xpReward: 10
                },
                {
                    id: "step-2",
                    instruction: "A file has been staged but you want to unstage it",
                    task: "Unstage config.js",
                    expectedCommands: ["git restore --staged config.js", "git reset HEAD config.js"],
                    expectedOutput: "Unstaged changes after reset:\nM\tconfig.js",
                    hints: ["Use git restore --staged <filename>", "git restore --staged config.js"],
                    xpReward: 10
                },
                {
                    id: "step-3",
                    instruction: "You made a typo in your last commit message",
                    task: "Amend the last commit message",
                    expectedCommands: ["git commit --amend"],
                    validatePattern: "git commit --amend",
                    expectedOutput: "[main abc1234] Fixed commit message",
                    hints: ["Use git commit --amend -m \"new message\"", "git commit --amend -m \"Fix: correct implementation\""],
                    xpReward: 10
                },
                {
                    id: "step-4",
                    instruction: "Undo the last commit but keep changes staged",
                    task: "Soft reset last commit",
                    expectedCommands: ["git reset --soft HEAD~1", "git reset --soft HEAD^"],
                    expectedOutput: "HEAD is now at previous-commit",
                    hints: ["Use git reset --soft HEAD~1", "The --soft flag keeps changes staged"],
                    xpReward: 15
                },
                {
                    id: "step-5",
                    instruction: "Create a new commit that undoes a specific commit",
                    task: "Revert a commit",
                    expectedCommands: ["git revert"],
                    validatePattern: "git revert",
                    expectedOutput: "[main abc123] Revert \"Previous commit\"",
                    hints: ["Use git revert <commit-hash>", "git revert HEAD creates a commit that undoes the last commit"],
                    xpReward: 15
                }
            ],
            completionCriteria: {
                allStepsComplete: true,
                maxAttempts: 10
            }
        }
    },
    {
        title: "Module 5 Quiz: Undoing Changes",
        description: "Test your knowledge of undo operations",
        type: "QUIZ" as const,
        orderIndex: 2,
        estimatedMinutes: 12,
        passingScore: 70,
        quizQuestions: [
            {
                id: "m5-q1",
                text: "What command discards changes in a file in your working directory?",
                type: "single",
                difficulty: "EASY",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "git discard file.txt", isCorrect: false },
                    { id: "b", text: "git restore file.txt", isCorrect: true },
                    { id: "c", text: "git undo file.txt", isCorrect: false },
                    { id: "d", text: "git remove file.txt", isCorrect: false }
                ],
                explanation: "git restore <file> discards changes in your working directory, reverting the file to its last committed state.",
                hint: "The command 'restores' the file to its previous state."
            },
            {
                id: "m5-q2",
                text: "What is the difference between `git reset` and `git revert`?",
                type: "single",
                difficulty: "MEDIUM",
                category: "Concepts",
                points: 10,
                options: [
                    { id: "a", text: "reset creates a new commit, revert moves HEAD", isCorrect: false },
                    { id: "b", text: "reset moves HEAD, revert creates a new undo commit", isCorrect: true },
                    { id: "c", text: "There is no difference", isCorrect: false },
                    { id: "d", text: "reset is for files, revert is for commits", isCorrect: false }
                ],
                explanation: "reset moves HEAD backward (rewrites history), while revert creates a new commit that undoes changes (preserves history).",
                hint: "Think about what happens to the commit history."
            },
            {
                id: "m5-q3",
                text: "Which reset mode keeps changes in the staging area?",
                type: "single",
                difficulty: "MEDIUM",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "--hard", isCorrect: false },
                    { id: "b", text: "--mixed", isCorrect: false },
                    { id: "c", text: "--soft", isCorrect: true },
                    { id: "d", text: "--staged", isCorrect: false }
                ],
                explanation: "--soft keeps all changes staged, --mixed (default) unstages but keeps working directory changes, --hard deletes everything.",
                hint: "Soft is the gentlest option - it keeps the most."
            },
            {
                id: "m5-q4",
                text: "Why should you use `git revert` instead of `git reset` for pushed commits?",
                type: "single",
                difficulty: "HARD",
                category: "Best Practices",
                points: 10,
                options: [
                    { id: "a", text: "Revert is faster", isCorrect: false },
                    { id: "b", text: "Revert preserves history, which is safer for shared branches", isCorrect: true },
                    { id: "c", text: "Reset doesn't work on pushed commits", isCorrect: false },
                    { id: "d", text: "There's no difference for pushed commits", isCorrect: false }
                ],
                explanation: "Revert creates new commits that undo changes, preserving history. Reset rewrites history, which causes problems when others have already pulled those commits.",
                hint: "Think about what happens to other team members who have pulled the commits."
            },
            {
                id: "m5-q5",
                text: "What does `git commit --amend` do?",
                type: "single",
                difficulty: "EASY",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "Creates a new commit", isCorrect: false },
                    { id: "b", text: "Modifies the last commit", isCorrect: true },
                    { id: "c", text: "Deletes the last commit", isCorrect: false },
                    { id: "d", text: "Merges commits together", isCorrect: false }
                ],
                explanation: "--amend modifies the last commit, allowing you to change the message or add forgotten files.",
                hint: "Amend means to make changes or corrections."
            },
            {
                id: "m5-q6",
                text: "How do you unstage a file while keeping its changes?",
                type: "single",
                difficulty: "EASY",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "git restore file.txt", isCorrect: false },
                    { id: "b", text: "git restore --staged file.txt", isCorrect: true },
                    { id: "c", text: "git remove --cached file.txt", isCorrect: false },
                    { id: "d", text: "git unstage file.txt", isCorrect: false }
                ],
                explanation: "git restore --staged removes a file from the staging area but keeps the changes in your working directory.",
                hint: "The --staged flag specifies you want to unstage, not discard."
            },
            {
                id: "m5-q7",
                text: "What does `HEAD~1` represent?",
                type: "single",
                difficulty: "MEDIUM",
                category: "Concepts",
                points: 10,
                options: [
                    { id: "a", text: "The next commit", isCorrect: false },
                    { id: "b", text: "The parent of the current commit", isCorrect: true },
                    { id: "c", text: "The first commit in the repository", isCorrect: false },
                    { id: "d", text: "A special marker for deleted commits", isCorrect: false }
                ],
                explanation: "HEAD~1 (or HEAD^) refers to the parent of the current commit. HEAD~2 would be the grandparent, and so on.",
                hint: "The ~ followed by a number means 'go back that many commits'."
            },
            {
                id: "m5-q8",
                text: "What happens with `git reset --hard HEAD~3`?",
                type: "single",
                difficulty: "HARD",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "Moves HEAD back 3 commits and deletes all changes after that point", isCorrect: true },
                    { id: "b", text: "Creates 3 new commits", isCorrect: false },
                    { id: "c", text: "Reverts the last 3 commits", isCorrect: false },
                    { id: "d", text: "Stages the last 3 commits for removal", isCorrect: false }
                ],
                explanation: "--hard moves HEAD back 3 commits AND deletes all changes in the staging area and working directory. This is destructive!",
                hint: "--hard is the most destructive option - it removes all traces of changes."
            },
            {
                id: "m5-q9",
                text: "Which command would you use to add a forgotten file to your last commit?",
                type: "single",
                difficulty: "MEDIUM",
                category: "Commands",
                points: 10,
                options: [
                    { id: "a", text: "git add file && git commit --add", isCorrect: false },
                    { id: "b", text: "git add file && git commit --amend --no-edit", isCorrect: true },
                    { id: "c", text: "git include file", isCorrect: false },
                    { id: "d", text: "git update --last commit", isCorrect: false }
                ],
                explanation: "Stage the forgotten file with git add, then use --amend --no-edit to add it to the last commit without changing the message.",
                hint: "You need to stage first, then amend without editing the message."
            },
            {
                id: "m5-q10",
                text: "After a hard reset, can you recover the lost commits?",
                type: "single",
                difficulty: "HARD",
                category: "Concepts",
                points: 10,
                options: [
                    { id: "a", text: "No, they are permanently deleted", isCorrect: false },
                    { id: "b", text: "Yes, using git reflog to find the commit hash", isCorrect: true },
                    { id: "c", text: "Only if you had pushed them to a remote", isCorrect: false },
                    { id: "d", text: "Only within 24 hours", isCorrect: false }
                ],
                explanation: "git reflog tracks all HEAD movements. Even after a hard reset, you can find the 'lost' commit's hash in reflog and reset back to it.",
                hint: "Git has a safety net that tracks where HEAD has been."
            }
        ]
    }
]

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function seedOpenSourceLearn() {
    console.log('🌱 Starting Open Source Learning Seed...')

    // Define all modules
    const modules = [
        {
            slug: 'getting-started-with-git',
            title: 'Getting Started with Git',
            description: 'Learn the fundamentals of version control and set up Git on your system. This module covers what Git is, why it matters, and how to configure it for your development workflow.',
            icon: '🚀',
            orderIndex: 0,
            estimatedMinutes: 60,
            isRequired: true,
            lessons: module1Lessons
        },
        {
            slug: 'basic-git-operations',
            title: 'Basic Git Operations',
            description: 'Master the essential Git commands for daily development. Learn to track changes, stage files, create commits, and view your project history.',
            icon: '📝',
            orderIndex: 1,
            estimatedMinutes: 75,
            isRequired: true,
            lessons: module2Lessons
        },
        {
            slug: 'branching-and-merging',
            title: 'Branching & Merging',
            description: 'Understand Git branches and how to merge them effectively. Learn branching strategies, conflict resolution, and best practices for collaborative development.',
            icon: '🌿',
            orderIndex: 2,
            estimatedMinutes: 70,
            isRequired: true,
            lessons: module3Lessons
        },
        {
            slug: 'remote-repositories',
            title: 'Remote Repositories',
            description: 'Learn to collaborate using remote repositories. Master push, pull, fetch operations and understand how to work with GitHub and other platforms.',
            icon: '🌐',
            orderIndex: 3,
            estimatedMinutes: 55,
            isRequired: true,
            lessons: module4Lessons
        },
        {
            slug: 'undoing-changes',
            title: 'Undoing Changes',
            description: 'Learn various ways to undo mistakes in Git. Master reset, revert, restore, and amend to confidently fix errors at any stage of your workflow.',
            icon: '↩️',
            orderIndex: 4,
            estimatedMinutes: 45,
            isRequired: true,
            lessons: module5Lessons
        }
    ]

    // Clear existing data
    console.log('🗑️ Clearing existing modules and lessons...')
    await prisma.oSLessonCompletion.deleteMany({})
    await prisma.oSLearnProgress.deleteMany({})
    await prisma.oSLearnLesson.deleteMany({})
    await prisma.oSLearnModule.deleteMany({})

    // Create modules and lessons
    for (const moduleData of modules) {
        console.log(`📚 Creating module: ${moduleData.title}`)

        const module = await prisma.oSLearnModule.create({
            data: {
                slug: moduleData.slug,
                title: moduleData.title,
                description: moduleData.description,
                icon: moduleData.icon,
                orderIndex: moduleData.orderIndex,
                estimatedMinutes: moduleData.estimatedMinutes,
                isRequired: moduleData.isRequired,
                isActive: true
            }
        })

        // Create lessons for this module
        for (const lessonData of moduleData.lessons) {
            console.log(`  📖 Creating lesson: ${lessonData.title}`)

            await prisma.oSLearnLesson.create({
                data: {
                    moduleId: module.id,
                    title: lessonData.title,
                    description: lessonData.description || null,
                    type: lessonData.type,
                    orderIndex: lessonData.orderIndex,
                    estimatedMinutes: lessonData.estimatedMinutes,
                    content: lessonData.content || null,
                    videoUrl: lessonData.videoUrl || null,
                    quizQuestions: lessonData.quizQuestions || null,
                    terminalLab: lessonData.terminalLab || null,
                    passingScore: lessonData.passingScore || 70,
                    isRequired: true
                }
            })
        }
    }

    console.log('✅ Open Source Learning Seed completed!')
    console.log(`📊 Created ${modules.length} modules with ${modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons`)
}

// Export for use in main seed file
export { seedOpenSourceLearn }
