/**
 * OpenSource Learning Platform - Comprehensive Seed Data
 * This file contains all the learning modules, lessons, and project data
 */

export const learningModulesData = [
    // ==========================================
    // MODULE 1: GIT FUNDAMENTALS
    // ==========================================
    {
        slug: 'git-fundamentals',
        title: 'Git Fundamentals',
        description: 'Master the core Learns of Git version control. Learn how to track changes, create commits, and understand the Git workflow from scratch.',
        icon: '📚',
        coverImage: '/images/opensource/git-fundamentals.png',
        orderIndex: 0,
        isRequired: true,
        estimatedMinutes: 45,
        isActive: true,
        lessons: [
            {
                title: 'What is Version Control?',
                description: 'Understand why version control matters and how Git revolutionized software development.',
                type: 'READING',
                orderIndex: 0,
                estimatedMinutes: 8,
                isRequired: true,
                content: `# What is Version Control?

## Why Version Control Matters

Imagine you're writing a document. You make changes, but then realize you want to go back to an earlier version. Without version control, you might have files like:
- document_v1.txt
- document_v2_final.txt
- document_v2_final_REAL.txt
- document_v2_final_REAL_USE_THIS.txt

Sound familiar? Version control solves this chaos.

## What is Git?

**Git** is a distributed version control system created by Linus Torvalds in 2005. It tracks changes to files over time, allowing you to:

- **Track History**: See every change ever made to your code
- **Collaborate**: Work with others without overwriting each other's work
- **Branch**: Experiment safely without affecting the main codebase
- **Revert**: Go back to any previous version instantly

## Key Learns

### Repository (Repo)
A repository is a folder that Git is tracking. It contains all your project files and the entire history of changes.

\`\`\`bash
# Initialize a new repository
git init
\`\`\`

### Commit
A commit is a snapshot of your project at a specific point in time. Think of it like a save point in a video game.

### Branch
A branch is an independent line of development. You can create branches to work on features without affecting the main code.

### Remote
A remote is a version of your repository hosted on a server (like GitHub). It allows collaboration with others.

## Why Git is Different

Unlike older systems (SVN, CVS), Git is:
- **Distributed**: Every developer has a full copy of the repository
- **Fast**: Operations are local, so they're lightning fast
- **Secure**: Uses SHA-1 hashing to ensure data integrity
- **Flexible**: Supports many workflows (centralized, feature branch, Gitflow)

## Real-World Example

When you contribute to open source:
1. **Fork** the project (create your copy)
2. **Clone** it to your computer
3. **Create a branch** for your changes
4. **Commit** your changes
5. **Push** to your fork
6. Create a **Pull Request** to propose your changes

This workflow ensures quality and collaboration!`
            },
            {
                title: 'Installing and Configuring Git',
                description: 'Set up Git on your machine and configure your identity.',
                type: 'INTERACTIVE',
                orderIndex: 1,
                estimatedMinutes: 10,
                isRequired: true,
                content: `# Installing and Configuring Git

## Installation

### Windows
Download from [git-scm.com](https://git-scm.com/download/win) or use:
\`\`\`bash
winget install Git.Git
\`\`\`

### macOS
\`\`\`bash
brew install git
# or use Xcode Command Line Tools:
xcode-select --install
\`\`\`

### Linux (Ubuntu/Debian)
\`\`\`bash
sudo apt update
sudo apt install git
\`\`\`

## Configuration

After installing, configure your identity. This is **required** before making commits.`,
                interactiveData: {
                    steps: [
                        {
                            instruction: 'Verify Git is installed by checking the version:',
                            command: 'git --version',
                            expectedOutput: 'git version',
                            hint: 'This shows the installed Git version'
                        },
                        {
                            instruction: 'Set your username (use your real name):',
                            command: 'git config --global user.name "Your Name"',
                            expectedOutput: '',
                            hint: 'This name appears in your commits'
                        },
                        {
                            instruction: 'Set your email (use the same email as your GitHub account):',
                            command: 'git config --global user.email "your@email.com"',
                            expectedOutput: '',
                            hint: 'This email links commits to your GitHub profile'
                        },
                        {
                            instruction: 'Verify your configuration:',
                            command: 'git config --list',
                            expectedOutput: 'user.name',
                            hint: 'Shows all Git configuration settings'
                        }
                    ]
                }
            },
            {
                title: 'Your First Repository',
                description: 'Create and initialize your first Git repository.',
                type: 'INTERACTIVE',
                orderIndex: 2,
                estimatedMinutes: 12,
                isRequired: true,
                content: `# Creating Your First Repository

## What is a Repository?

A Git repository (repo) is a folder that Git tracks. It contains:
- Your project files
- A hidden \`.git\` folder with all history and metadata

## Two Ways to Create a Repo

### 1. Initialize a New Repository
\`\`\`bash
mkdir my-project
cd my-project
git init
\`\`\`

### 2. Clone an Existing Repository
\`\`\`bash
git clone https://github.com/user/repo.git
\`\`\``,
                interactiveData: {
                    steps: [
                        {
                            instruction: 'Create a new directory for your project:',
                            command: 'mkdir my-first-repo && cd my-first-repo',
                            expectedOutput: '',
                            hint: 'mkdir creates directory, cd enters it'
                        },
                        {
                            instruction: 'Initialize a Git repository:',
                            command: 'git init',
                            expectedOutput: 'Initialized empty Git repository',
                            hint: 'This creates the .git folder'
                        },
                        {
                            instruction: 'Check the status of your repository:',
                            command: 'git status',
                            expectedOutput: 'On branch',
                            hint: 'git status shows the current state'
                        },
                        {
                            instruction: 'Create a README file:',
                            command: 'echo "# My First Repo" > README.md',
                            expectedOutput: '',
                            hint: 'Every project should have a README'
                        },
                        {
                            instruction: 'Check status again to see the new file:',
                            command: 'git status',
                            expectedOutput: 'Untracked files',
                            hint: 'Git sees the new file but isn\'t tracking it yet'
                        }
                    ]
                }
            },
            {
                title: 'Staging and Committing',
                description: 'Learn the Git workflow: staging changes and creating commits.',
                type: 'INTERACTIVE',
                orderIndex: 3,
                estimatedMinutes: 15,
                isRequired: true,
                content: `# The Git Workflow: Stage → Commit

## Understanding the Three States

Files in Git can be in three states:

1. **Modified**: You've changed the file but haven't staged it
2. **Staged**: You've marked a modified file to go into your next commit
3. **Committed**: The data is safely stored in your local database

\`\`\`
Working Directory → Staging Area → Repository
   (modified)        (staged)      (committed)
\`\`\`

## The Commands

### Stage Changes
\`\`\`bash
git add <file>        # Stage specific file
git add .             # Stage all changes
git add -p            # Stage changes interactively
\`\`\`

### Commit Changes
\`\`\`bash
git commit -m "Your message"   # Commit with message
git commit                      # Opens editor for message
git commit -am "message"        # Add + commit (tracked files only)
\`\`\`

## Writing Good Commit Messages

**DO:**
- Use imperative mood: "Add feature" not "Added feature"
- Be concise but descriptive
- Reference issue numbers when applicable

**Examples:**
\`\`\`
✅ Add user authentication
✅ Fix login button not responding on mobile
✅ Update README with installation instructions
✅ Refactor payment processing for better error handling

❌ Fixed stuff
❌ WIP
❌ asdfasdf
❌ changes
\`\`\``,
                interactiveData: {
                    steps: [
                        {
                            instruction: 'Stage the README file you created:',
                            command: 'git add README.md',
                            expectedOutput: '',
                            hint: 'This moves README.md to the staging area'
                        },
                        {
                            instruction: 'Check the status to see the staged file:',
                            command: 'git status',
                            expectedOutput: 'Changes to be committed',
                            hint: 'The file is now staged (green)'
                        },
                        {
                            instruction: 'Create your first commit:',
                            command: 'git commit -m "Initial commit: Add README"',
                            expectedOutput: 'Initial commit',
                            hint: 'This saves the staged changes permanently'
                        },
                        {
                            instruction: 'View your commit history:',
                            command: 'git log --oneline',
                            expectedOutput: 'Initial commit',
                            hint: 'Shows a summary of all commits'
                        }
                    ]
                }
            },
            {
                title: 'Viewing History and Changes',
                description: 'Navigate through your project history and view differences.',
                type: 'READING',
                orderIndex: 4,
                estimatedMinutes: 8,
                isRequired: true,
                content: `# Viewing History and Changes

## Git Log - Your Project Timeline

\`\`\`bash
# Basic log
git log

# Compact one-line format
git log --oneline

# Show graph of branches
git log --oneline --graph --all

# Show last 5 commits
git log -5

# Show commits by author
git log --author="John"

# Show commits since a date
git log --since="2024-01-01"
\`\`\`

## Git Diff - See What Changed

\`\`\`bash
# Changes not yet staged
git diff

# Changes that are staged
git diff --staged

# Compare two commits
git diff abc123 def456

# Compare branches
git diff main feature-branch

# Show changes in a specific file
git diff -- path/to/file.js
\`\`\`

## Git Show - Examine a Specific Commit

\`\`\`bash
# Show the latest commit
git show

# Show a specific commit
git show abc123

# Show only the files changed
git show --stat abc123
\`\`\`

## Git Blame - Who Wrote This?

\`\`\`bash
# See who last modified each line
git blame file.js

# Blame with email
git blame -e file.js
\`\`\`

## Pro Tips

1. **Alias for pretty log:**
\`\`\`bash
git config --global alias.lg "log --oneline --graph --all --decorate"
# Now use: git lg
\`\`\`

2. **Search commit messages:**
\`\`\`bash
git log --grep="bug fix"
\`\`\`

3. **Find when a bug was introduced:**
\`\`\`bash
git bisect start
git bisect bad          # Current version is broken
git bisect good abc123  # This version worked
# Git will help you find the breaking commit
\`\`\``
            },
            {
                title: 'Git Fundamentals Quiz',
                description: 'Test your understanding of Git basics.',
                type: 'QUIZ',
                orderIndex: 5,
                estimatedMinutes: 10,
                isRequired: true,
                passingScore: 70,
                quizQuestions: [
                    {
                        question: 'What command initializes a new Git repository?',
                        options: ['git start', 'git init', 'git create', 'git new'],
                        correctAnswer: 1,
                        explanation: 'git init creates a new .git directory and initializes version control.'
                    },
                    {
                        question: 'What is the correct order to save changes in Git?',
                        options: [
                            'commit → add → push',
                            'add → commit → push',
                            'push → add → commit',
                            'commit → push → add'
                        ],
                        correctAnswer: 1,
                        explanation: 'First add (stage), then commit (save locally), then push (upload).'
                    },
                    {
                        question: 'What does "git status" show?',
                        options: [
                            'Your GitHub profile',
                            'The current state of your working directory',
                            'A list of all branches',
                            'Your commit history'
                        ],
                        correctAnswer: 1,
                        explanation: 'git status shows modified, staged, and untracked files.'
                    },
                    {
                        question: 'Which command shows the commit history?',
                        options: ['git history', 'git commits', 'git log', 'git show-all'],
                        correctAnswer: 2,
                        explanation: 'git log displays the commit history of your repository.'
                    },
                    {
                        question: 'What does HEAD refer to in Git?',
                        options: [
                            'The first commit ever made',
                            'The currently checked-out commit',
                            'The remote repository',
                            'The main branch only'
                        ],
                        correctAnswer: 1,
                        explanation: 'HEAD points to the current commit/branch you have checked out.'
                    }
                ]
            }
        ]
    },
    // ==========================================
    // MODULE 2: BRANCHING & MERGING
    // ==========================================
    {
        slug: 'branching-merging',
        title: 'Branching & Merging',
        description: 'Learn how to create branches, switch between them, and merge changes. Master the art of parallel development.',
        icon: '🌳',
        coverImage: '/images/opensource/branching.png',
        orderIndex: 1,
        isRequired: true,
        estimatedMinutes: 50,
        isActive: true,
        lessons: [
            {
                title: 'Understanding Branches',
                description: 'Learn what branches are and why they are essential for collaborative development.',
                type: 'READING',
                orderIndex: 0,
                estimatedMinutes: 10,
                isRequired: true,
                content: `# Understanding Branches

## What is a Branch?

A branch in Git is simply a lightweight movable pointer to a commit. The default branch is usually called \`main\` (or \`master\` in older repos).

Think of branches like parallel universes:
- Each branch is a separate timeline
- You can experiment without affecting the main timeline
- You can merge timelines when ready

## Why Use Branches?

1. **Feature Development**: Work on new features without breaking main
2. **Bug Fixes**: Isolate fixes from ongoing development
3. **Experimentation**: Try ideas without consequences
4. **Code Review**: Submit changes for review before merging
5. **Release Management**: Maintain multiple versions

## Branch Naming Conventions

\`\`\`bash
# Feature branches
feature/user-authentication
feature/payment-gateway

# Bug fix branches
fix/login-error
bugfix/memory-leak

# Hotfix branches (urgent production fixes)
hotfix/security-patch

# Release branches
release/v1.0.0
release/2024-q1
\`\`\`

## Visualizing Branches

\`\`\`
      A---B---C  feature
     /
D---E---F---G  main
\`\`\`

In this diagram:
- \`main\` has commits D, E, F, G
- \`feature\` branched off at E
- \`feature\` has commits A, B, C

## The HEAD Pointer

HEAD is a special pointer that tells Git which branch/commit you're currently on.

\`\`\`bash
git branch           # Shows current branch with *
cat .git/HEAD        # Shows what HEAD points to
\`\`\``
            },
            {
                title: 'Creating and Switching Branches',
                description: 'Practice creating branches and navigating between them.',
                type: 'INTERACTIVE',
                orderIndex: 1,
                estimatedMinutes: 12,
                isRequired: true,
                content: `# Creating and Switching Branches

## Essential Branch Commands

\`\`\`bash
# List all local branches
git branch

# List all branches (including remote)
git branch -a

# Create a new branch
git branch <branch-name>

# Switch to a branch
git checkout <branch-name>
# or (newer syntax)
git switch <branch-name>

# Create AND switch in one command
git checkout -b <branch-name>
# or
git switch -c <branch-name>

# Delete a branch
git branch -d <branch-name>    # Safe delete
git branch -D <branch-name>    # Force delete

# Rename current branch
git branch -m <new-name>
\`\`\``,
                interactiveData: {
                    steps: [
                        {
                            instruction: 'List all branches (you should see main or master):',
                            command: 'git branch',
                            expectedOutput: 'main',
                            hint: 'The * indicates your current branch'
                        },
                        {
                            instruction: 'Create a new branch called "feature/add-login":',
                            command: 'git branch feature/add-login',
                            expectedOutput: '',
                            hint: 'This creates the branch but doesn\'t switch to it'
                        },
                        {
                            instruction: 'List branches again to see the new one:',
                            command: 'git branch',
                            expectedOutput: 'feature/add-login',
                            hint: 'You should now see two branches'
                        },
                        {
                            instruction: 'Switch to the new branch:',
                            command: 'git checkout feature/add-login',
                            expectedOutput: 'Switched to branch',
                            hint: 'Now HEAD points to feature/add-login'
                        },
                        {
                            instruction: 'Create and switch to another branch in one command:',
                            command: 'git checkout -b feature/user-profile',
                            expectedOutput: 'Switched to a new branch',
                            hint: 'The -b flag creates the branch'
                        },
                        {
                            instruction: 'Switch back to main:',
                            command: 'git checkout main',
                            expectedOutput: 'Switched to branch',
                            hint: 'Always good to return to main'
                        }
                    ]
                }
            },
            {
                title: 'Merging Branches',
                description: 'Learn different merge strategies and when to use them.',
                type: 'INTERACTIVE',
                orderIndex: 2,
                estimatedMinutes: 15,
                isRequired: true,
                content: `# Merging Branches

## What is Merging?

Merging combines the history of two branches. When you merge branch B into branch A, all commits from B become part of A's history.

## Types of Merges

### 1. Fast-Forward Merge
When main hasn't changed since you branched:
\`\`\`
Before:
D---E---F  main
         \\
          A---B---C  feature

After merge:
D---E---F---A---B---C  main
\`\`\`

### 2. Three-Way Merge
When both branches have new commits:
\`\`\`
Before:
      A---B  main
     /
D---E---F  feature

After merge:
      A---B---M  main
     /       /
D---E---F----  feature
\`\`\`
(M is the merge commit)

## Merge Commands

\`\`\`bash
# Merge branch into current branch
git merge <branch-name>

# Merge with a specific message
git merge <branch-name> -m "Merge feature into main"

# Abort a merge (if conflicts)
git merge --abort
\`\`\``,
                interactiveData: {
                    steps: [
                        {
                            instruction: 'Make sure you\'re on main branch:',
                            command: 'git checkout main',
                            expectedOutput: '',
                            hint: 'You should merge INTO main'
                        },
                        {
                            instruction: 'Switch to feature branch and create a file:',
                            command: 'git checkout feature/add-login && echo "Login feature" > login.js && git add . && git commit -m "Add login feature"',
                            expectedOutput: 'Add login feature',
                            hint: 'Creating a commit on the feature branch'
                        },
                        {
                            instruction: 'Switch back to main:',
                            command: 'git checkout main',
                            expectedOutput: 'Switched to branch',
                            hint: 'Now we\'ll merge the feature into main'
                        },
                        {
                            instruction: 'Merge the feature branch:',
                            command: 'git merge feature/add-login',
                            expectedOutput: 'Fast-forward',
                            hint: 'This is a fast-forward merge'
                        },
                        {
                            instruction: 'View the log to see the merged commit:',
                            command: 'git log --oneline -3',
                            expectedOutput: 'Add login feature',
                            hint: 'The feature commit is now in main\'s history'
                        }
                    ]
                }
            },
            {
                title: 'Handling Merge Conflicts',
                description: 'Learn to resolve conflicts when Git can\'t automatically merge.',
                type: 'READING',
                orderIndex: 3,
                estimatedMinutes: 12,
                isRequired: true,
                content: `# Handling Merge Conflicts

## What Causes Conflicts?

Conflicts happen when two branches modify the same part of the same file differently. Git can't decide which change to keep.

## Anatomy of a Conflict

When you encounter a conflict, Git marks the file:

\`\`\`
<<<<<<< HEAD
Your changes on the current branch
=======
Changes from the branch being merged
>>>>>>> feature-branch
\`\`\`

## Resolving Conflicts

### Step 1: Identify Conflicting Files
\`\`\`bash
git status
# Shows "both modified" files
\`\`\`

### Step 2: Open and Edit the File
1. Find the conflict markers
2. Decide what to keep
3. Remove the markers
4. Save the file

### Step 3: Mark as Resolved
\`\`\`bash
git add <resolved-file>
\`\`\`

### Step 4: Complete the Merge
\`\`\`bash
git commit
# Git auto-generates a merge commit message
\`\`\`

## Example Resolution

**Before (conflicted):**
\`\`\`javascript
function greet(name) {
<<<<<<< HEAD
    return \`Hello, \${name}!\`;
=======
    return \`Hi there, \${name}!\`;
>>>>>>> feature-branch
}
\`\`\`

**After (resolved):**
\`\`\`javascript
function greet(name) {
    return \`Hello, \${name}! Welcome back!\`;
}
\`\`\`

## Pro Tips

1. **Use a merge tool:**
\`\`\`bash
git mergetool
\`\`\`

2. **See what changed on each side:**
\`\`\`bash
git diff --ours    # Your changes
git diff --theirs  # Their changes
\`\`\`

3. **Abort if needed:**
\`\`\`bash
git merge --abort
\`\`\`

4. **Prevent future conflicts:**
   - Pull often to stay in sync
   - Keep branches short-lived
   - Communicate with your team`
            },
            {
                title: 'Branching & Merging Quiz',
                description: 'Test your understanding of branching and merging.',
                type: 'QUIZ',
                orderIndex: 4,
                estimatedMinutes: 8,
                isRequired: true,
                passingScore: 70,
                quizQuestions: [
                    {
                        question: 'What command creates AND switches to a new branch?',
                        options: [
                            'git branch -new feature',
                            'git checkout -b feature',
                            'git new-branch feature',
                            'git create feature'
                        ],
                        correctAnswer: 1,
                        explanation: 'git checkout -b creates a new branch and switches to it in one command.'
                    },
                    {
                        question: 'When does a fast-forward merge occur?',
                        options: [
                            'When there are merge conflicts',
                            'When main has not diverged from the feature branch',
                            'When you use the --fast flag',
                            'When merging remote branches'
                        ],
                        correctAnswer: 1,
                        explanation: 'Fast-forward happens when main has no new commits since branching.'
                    },
                    {
                        question: 'What do the conflict markers <<<<<<< and >>>>>>> indicate?',
                        options: [
                            'Git syntax errors',
                            'The boundaries of conflicting changes',
                            'Debug information',
                            'File corruption'
                        ],
                        correctAnswer: 1,
                        explanation: 'These markers show where the conflicting changes from each branch are.'
                    },
                    {
                        question: 'How do you abort a merge that has conflicts?',
                        options: [
                            'git merge --stop',
                            'git merge --abort',
                            'git cancel merge',
                            'git undo merge'
                        ],
                        correctAnswer: 1,
                        explanation: 'git merge --abort cancels the merge and returns to the pre-merge state.'
                    }
                ]
            }
        ]
    },
    // ==========================================
    // MODULE 3: GITHUB WORKFLOW
    // ==========================================
    {
        slug: 'github-workflow',
        title: 'GitHub Workflow',
        description: 'Master the GitHub collaboration workflow: forking, cloning, pull requests, and code reviews.',
        icon: '🐙',
        coverImage: '/images/opensource/github.png',
        orderIndex: 2,
        isRequired: true,
        estimatedMinutes: 55,
        isActive: true,
        lessons: [
            {
                title: 'GitHub vs Git',
                description: 'Understand the difference between Git and GitHub.',
                type: 'READING',
                orderIndex: 0,
                estimatedMinutes: 8,
                isRequired: true,
                content: `# GitHub vs Git

## Git ≠ GitHub

| Git | GitHub |
|-----|--------|
| Version control software | Hosting platform |
| Runs locally | Cloud service |
| Created in 2005 | Created in 2008 |
| Command-line tool | Web interface |
| Free and open source | Free + paid tiers |

## What is GitHub?

GitHub is a web-based platform that hosts Git repositories. It adds:

- **Remote Storage**: Cloud backup of your code
- **Collaboration**: Work with others worldwide
- **Pull Requests**: Propose and discuss changes
- **Issues**: Track bugs and features
- **Actions**: Automate workflows (CI/CD)
- **Pages**: Host websites
- **Discussions**: Community forums

## GitHub Alternatives

- **GitLab**: Self-hostable, integrated CI/CD
- **Bitbucket**: Atlassian's offering, Jira integration
- **Azure DevOps**: Microsoft's platform
- **Gitea**: Lightweight, self-hosted

## Why GitHub for Open Source?

1. **Largest Community**: 100M+ developers
2. **Discoverability**: Easy to find projects
3. **Standard Workflow**: PRs are universal
4. **Free for Public Repos**: No cost for open source
5. **Integrations**: Connects with everything`
            },
            {
                title: 'Forking and Cloning',
                description: 'Learn how to fork repositories and clone them locally.',
                type: 'INTERACTIVE',
                orderIndex: 1,
                estimatedMinutes: 12,
                isRequired: true,
                content: `# Forking and Cloning

## The Fork & Clone Workflow

\`\`\`
1. Original Repo (upstream)
         ↓ Fork (GitHub)
2. Your Fork (origin)
         ↓ Clone (Local)
3. Local Repository
\`\`\`

## Why Fork?

- You don't have write access to original repo
- You want your own copy to experiment
- Standard way to contribute to open source

## Cloning Your Fork

\`\`\`bash
# Clone via HTTPS
git clone https://github.com/YOUR-USERNAME/repo.git

# Clone via SSH (recommended)
git clone git@github.com:YOUR-USERNAME/repo.git

# Clone into specific directory
git clone <url> my-folder-name
\`\`\`

## Setting Up Remotes

After cloning, set up the original repo as "upstream":

\`\`\`bash
# Add upstream remote
git remote add upstream https://github.com/ORIGINAL-OWNER/repo.git

# Verify remotes
git remote -v
# origin    (your fork)
# upstream  (original repo)
\`\`\``,
                interactiveData: {
                    steps: [
                        {
                            instruction: 'Clone a repository (using a sample URL):',
                            command: 'git clone https://github.com/octocat/Hello-World.git',
                            expectedOutput: 'Cloning into',
                            hint: 'This downloads the entire repository'
                        },
                        {
                            instruction: 'Enter the cloned directory:',
                            command: 'cd Hello-World',
                            expectedOutput: '',
                            hint: 'Navigate into the project folder'
                        },
                        {
                            instruction: 'View the configured remotes:',
                            command: 'git remote -v',
                            expectedOutput: 'origin',
                            hint: 'origin is automatically set when you clone'
                        },
                        {
                            instruction: 'Add the original repo as upstream:',
                            command: 'git remote add upstream https://github.com/octocat/Hello-World.git',
                            expectedOutput: '',
                            hint: 'This lets you sync with the original'
                        },
                        {
                            instruction: 'Verify both remotes are configured:',
                            command: 'git remote -v',
                            expectedOutput: 'upstream',
                            hint: 'You should see both origin and upstream'
                        }
                    ]
                }
            },
            {
                title: 'Creating Pull Requests',
                description: 'Learn the complete PR workflow from branch to merge.',
                type: 'READING',
                orderIndex: 2,
                estimatedMinutes: 15,
                isRequired: true,
                content: `# Creating Pull Requests

## What is a Pull Request?

A Pull Request (PR) is a proposal to merge your changes into another branch. It:

- Shows what changes you made
- Allows discussion and code review
- Runs automated checks (CI/CD)
- Documents the change history

## The PR Workflow

### 1. Create a Feature Branch
\`\`\`bash
git checkout -b feature/add-search
\`\`\`

### 2. Make Your Changes
\`\`\`bash
# Edit files
git add .
git commit -m "Add search functionality"
\`\`\`

### 3. Push to Your Fork
\`\`\`bash
git push origin feature/add-search
\`\`\`

### 4. Create PR on GitHub
1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill in the PR template
4. Click "Create pull request"

## Writing a Good PR

### Title
\`\`\`
✅ Add search functionality to navbar
✅ Fix: Memory leak in user service
❌ Update stuff
❌ WIP
\`\`\`

### Description Template
\`\`\`markdown
## What does this PR do?
Adds a search bar to the navigation that allows users to search products.

## Why is this change needed?
Users requested search functionality (#123).

## How to test?
1. Navigate to homepage
2. Click search icon
3. Type a product name
4. Verify results appear

## Screenshots
[If UI changes, add screenshots]

## Checklist
- [ ] Tests added
- [ ] Documentation updated
- [ ] No breaking changes
\`\`\`

## Handling Feedback

When reviewers comment:
1. Address each comment
2. Make necessary changes
3. Push new commits
4. Reply to comments
5. Request re-review if needed

## Best Practices

1. **Keep PRs small**: <400 lines ideally
2. **One concern per PR**: Don't mix features
3. **Self-review first**: Check your own code
4. **Be responsive**: Reply to feedback promptly
5. **Be patient**: Reviews take time`
            },
            {
                title: 'Keeping Your Fork in Sync',
                description: 'Learn to sync your fork with the upstream repository.',
                type: 'INTERACTIVE',
                orderIndex: 3,
                estimatedMinutes: 10,
                isRequired: true,
                content: `# Keeping Your Fork in Sync

## Why Sync?

The original repository (upstream) continues to receive updates. Your fork becomes outdated if you don't sync regularly.

## Sync Workflow

\`\`\`
upstream/main → your-fork/main → local/main
\`\`\`

## Commands to Sync

\`\`\`bash
# 1. Fetch upstream changes
git fetch upstream

# 2. Switch to main
git checkout main

# 3. Merge upstream into local main
git merge upstream/main

# 4. Push updated main to your fork
git push origin main
\`\`\`

## Alternative: Rebase

\`\`\`bash
git checkout main
git pull upstream main --rebase
git push origin main
\`\`\``,
                interactiveData: {
                    steps: [
                        {
                            instruction: 'Fetch changes from upstream:',
                            command: 'git fetch upstream',
                            expectedOutput: '',
                            hint: 'Downloads upstream changes without merging'
                        },
                        {
                            instruction: 'Make sure you\'re on main:',
                            command: 'git checkout main',
                            expectedOutput: '',
                            hint: 'You need to be on main to sync it'
                        },
                        {
                            instruction: 'Merge upstream changes into your main:',
                            command: 'git merge upstream/main',
                            expectedOutput: '',
                            hint: 'This brings upstream changes into your local main'
                        },
                        {
                            instruction: 'Push the updated main to your fork:',
                            command: 'git push origin main',
                            expectedOutput: '',
                            hint: 'Now your fork is in sync!'
                        }
                    ]
                }
            },
            {
                title: 'GitHub Workflow Quiz',
                description: 'Test your understanding of GitHub workflow.',
                type: 'QUIZ',
                orderIndex: 4,
                estimatedMinutes: 8,
                isRequired: true,
                passingScore: 70,
                quizQuestions: [
                    {
                        question: 'What is the purpose of forking a repository?',
                        options: [
                            'To delete the original repository',
                            'To create your own copy for contributions',
                            'To rename the repository',
                            'To report bugs'
                        ],
                        correctAnswer: 1,
                        explanation: 'Forking creates a personal copy where you can make changes.'
                    },
                    {
                        question: 'What is "upstream" typically referring to?',
                        options: [
                            'Your local repository',
                            'Your forked repository',
                            'The original repository you forked from',
                            'A backup server'
                        ],
                        correctAnswer: 2,
                        explanation: 'Upstream is the conventional name for the original source repo.'
                    },
                    {
                        question: 'What\'s the first step before making changes to contribute?',
                        options: [
                            'Push directly to main',
                            'Create a new branch',
                            'Delete all existing branches',
                            'Merge with upstream'
                        ],
                        correctAnswer: 1,
                        explanation: 'Always create a feature branch before making changes.'
                    },
                    {
                        question: 'How do you update your fork with the latest upstream changes?',
                        options: [
                            'Delete fork and re-fork',
                            'git fetch upstream && git merge upstream/main',
                            'git force-update',
                            'Click "Sync" on every commit'
                        ],
                        correctAnswer: 1,
                        explanation: 'Fetch upstream changes and merge them into your main branch.'
                    }
                ]
            }
        ]
    },
    // ==========================================
    // MODULE 4: CONTRIBUTING TO OPEN SOURCE
    // ==========================================
    {
        slug: 'open-source-contributing',
        title: 'Contributing to Open Source',
        description: 'Learn the complete workflow for contributing to open source projects professionally.',
        icon: '🌟',
        coverImage: '/images/opensource/contributing.png',
        orderIndex: 3,
        isRequired: true,
        estimatedMinutes: 50,
        isActive: true,
        lessons: [
            {
                title: 'Finding Projects to Contribute',
                description: 'Discover how to find beginner-friendly open source projects.',
                type: 'READING',
                orderIndex: 0,
                estimatedMinutes: 10,
                isRequired: true,
                content: `# Finding Projects to Contribute

## Where to Find Projects

### 1. GitHub Labels
Search for beginner-friendly issues:
- \`good first issue\`
- \`beginner\`
- \`easy\`
- \`help wanted\`
- \`up-for-grabs\`

\`\`\`
GitHub search: label:"good first issue" language:javascript is:open
\`\`\`

### 2. Curated Lists
- **First Contributions**: github.com/firstcontributions
- **Good First Issues**: goodfirstissues.com
- **Up For Grabs**: up-for-grabs.net
- **Awesome for Beginners**: github.com/MunGell/awesome-for-beginners

### 3. Projects You Use
- Tools you use daily
- Libraries in your projects
- Frameworks you're learning

## Evaluating a Project

### ✅ Good Signs
- Active commits (recent activity)
- Responsive maintainers
- Clear CONTRIBUTING.md
- Good documentation
- Welcoming community
- Tests and CI/CD

### ⚠️ Warning Signs
- No activity in months
- Unanswered issues/PRs
- No documentation
- Toxic discussions
- No clear guidelines

## Reading the Project

Before contributing, read:
1. **README.md**: Project overview
2. **CONTRIBUTING.md**: How to contribute
3. **CODE_OF_CONDUCT.md**: Community rules
4. **Open Issues**: Current needs
5. **Open PRs**: What's in progress

## Starting Small

Your first contribution doesn't need to be code:
- Fix typos in documentation
- Improve error messages
- Add code comments
- Write tests
- Update examples`
            },
            {
                title: 'Understanding Issues',
                description: 'Learn how to read, claim, and work on GitHub issues.',
                type: 'READING',
                orderIndex: 1,
                estimatedMinutes: 10,
                isRequired: true,
                content: `# Understanding Issues

## Anatomy of an Issue

\`\`\`markdown
# Issue Title
Clear, concise description of what needs to be done

## Description
Detailed explanation of the problem or feature

## Steps to Reproduce (for bugs)
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What currently happens

## Labels
🏷️ bug, enhancement, good first issue, etc.

## Assignee
Who's working on it

## Milestone
Target release or sprint
\`\`\`

## Issue Labels

| Label | Meaning |
|-------|---------|
| \`good first issue\` | Great for newcomers |
| \`help wanted\` | Maintainers want help |
| \`bug\` | Something is broken |
| \`enhancement\` | New feature request |
| \`documentation\` | Docs need work |
| \`blocked\` | Waiting on something |
| \`wontfix\` | Won't be addressed |

## Claiming an Issue

1. **Comment first**: "I'd like to work on this!"
2. **Wait for assignment**: Maintainer assigns you
3. **Ask questions**: Clarify requirements
4. **Set expectations**: "I'll have a PR in 3 days"

## Good Issue Comments

\`\`\`markdown
✅ "I'd like to work on this. I'm thinking of implementing it using 
   React hooks. Should I also add tests?"

❌ "Assign to me"

✅ "I've been investigating this bug. It seems to be caused by 
   the async handling in line 42. Here's what I found..."

❌ "Same problem here"
\`\`\`

## Creating Your Own Issues

If you find a bug or have an idea:

\`\`\`markdown
## Bug Report: Login fails on Safari

### Environment
- Browser: Safari 15.4
- OS: macOS 12.3
- Version: 2.4.1

### Steps to Reproduce
1. Navigate to /login
2. Enter valid credentials
3. Click "Login"

### Expected
Redirect to dashboard

### Actual
Error: "Session invalid"

### Additional Context
Works fine on Chrome and Firefox.
Screenshot attached.
\`\`\``
            },
            {
                title: 'Making Quality Contributions',
                description: 'Best practices for writing code that gets merged.',
                type: 'READING',
                orderIndex: 2,
                estimatedMinutes: 12,
                isRequired: true,
                content: `# Making Quality Contributions

## Before You Code

1. **Understand the issue completely**
2. **Check if anyone else is working on it**
3. **Ask clarifying questions**
4. **Understand the codebase structure**
5. **Run existing tests locally**

## Writing Good Code

### Follow Project Style
\`\`\`javascript
// If project uses single quotes
const name = 'Hello'

// If project uses semicolons
const value = 42;

// Follow existing patterns
function projectStyleFunction() {
    // ...
}
\`\`\`

### Keep Changes Focused
\`\`\`
✅ One PR = One issue
❌ "Fixed login bug AND refactored auth AND updated docs"
\`\`\`

### Write Clear Commit Messages
\`\`\`bash
# Conventional Commits format
git commit -m "fix: resolve login timeout on slow connections"
git commit -m "feat: add search functionality to navbar"
git commit -m "docs: update API documentation for v2"
git commit -m "test: add unit tests for UserService"
\`\`\`

## The Perfect PR

### Small and Focused
- <400 lines changed
- Single responsibility
- Easy to review

### Well-Documented
- Clear title
- Detailed description
- Screenshots (if UI)
- Testing instructions

### Tested
- All existing tests pass
- New tests for new code
- Manual testing done

### Following Guidelines
- Linting passes
- Formatting correct
- No unnecessary changes

## Responding to Reviews

\`\`\`markdown
Reviewer: "Can you add error handling here?"

✅ You: "Good point! I've added try-catch with proper 
   error logging. See commit abc123."

❌ You: "It works fine without it"
\`\`\`

## Common Mistakes to Avoid

1. **Changing too many files** - Keep it minimal
2. **Ignoring linting** - Always fix lint errors
3. **Skipping tests** - Tests protect everyone
4. **Poor commit messages** - Be descriptive
5. **Not responding to feedback** - Be communicative
6. **Giving up too soon** - First PRs are hard!`
            },
            {
                title: 'Code Review Etiquette',
                description: 'Learn how to give and receive code reviews professionally.',
                type: 'READING',
                orderIndex: 3,
                estimatedMinutes: 10,
                isRequired: true,
                content: `# Code Review Etiquette

## Receiving Reviews

### Mindset
- Reviews aren't personal attacks
- Every suggestion is a learning opportunity
- Maintainers want to help you succeed
- Questions are welcome

### Responding to Feedback

\`\`\`markdown
Comment: "This could cause a memory leak"

✅ Good response:
"Thanks for catching this! I've updated the code to properly 
clean up the subscription in useEffect. Let me know if this 
looks better."

❌ Bad response:
"It works on my machine"
\`\`\`

### When You Disagree

\`\`\`markdown
✅ "I see your point, but I chose this approach because...
   Would you be open to discussing the tradeoffs?"

❌ "No, my way is better"
\`\`\`

## Giving Reviews

### Be Kind and Constructive

\`\`\`markdown
❌ "This code is terrible"
✅ "Consider extracting this logic into a separate function 
   for better readability"

❌ "Why would you do it this way?"
✅ "I'm curious about this approach. Have you considered using X?"

❌ "Fix this"
✅ "This might cause issues with Y. Here's a potential solution..."
\`\`\`

### Types of Comments

1. **Required Changes**
   - Security issues
   - Bugs
   - Breaking changes

2. **Suggestions**
   - Better patterns
   - Performance improvements
   - Style preferences

3. **Questions**
   - Clarify intent
   - Learn the reasoning

### Using GitHub Review Features

\`\`\`markdown
# Suggestions with code
\`\`\`suggestion
const [isLoading, setIsLoading] = useState(false);
\`\`\`

# Praise good work
This is a really elegant solution! 👏

# Ask questions
Why did you choose X over Y here?
\`\`\`

## Review Best Practices

1. **Review promptly** - Don't block others
2. **Be thorough but focused** - Don't nitpick everything
3. **Explain the "why"** - Not just what to change
4. **Approve when ready** - Don't drag it out
5. **Follow up** - Check if your feedback was addressed`
            },
            {
                title: 'Contributing Quiz',
                description: 'Test your open source contribution knowledge.',
                type: 'QUIZ',
                orderIndex: 4,
                estimatedMinutes: 8,
                isRequired: true,
                passingScore: 70,
                quizQuestions: [
                    {
                        question: 'What should you do before starting work on an issue?',
                        options: [
                            'Just start coding immediately',
                            'Comment asking to be assigned and wait for confirmation',
                            'Submit a PR without checking',
                            'Email the repository owner'
                        ],
                        correctAnswer: 1,
                        explanation: 'Always ask to be assigned to avoid duplicate work.'
                    },
                    {
                        question: 'What is a "good first issue" label?',
                        options: [
                            'The most important issue',
                            'An issue suitable for newcomers',
                            'An issue that\'s been open the longest',
                            'A bug that needs immediate fixing'
                        ],
                        correctAnswer: 1,
                        explanation: 'Good first issues are beginner-friendly entry points.'
                    },
                    {
                        question: 'How should you respond to code review feedback?',
                        options: [
                            'Ignore comments you disagree with',
                            'Delete the PR and start over',
                            'Address feedback professionally and push updates',
                            'Argue with the reviewer'
                        ],
                        correctAnswer: 2,
                        explanation: 'Professional engagement with feedback leads to better code.'
                    },
                    {
                        question: 'What makes a good pull request?',
                        options: [
                            'As many changes as possible',
                            'Focused changes, clear description, tests included',
                            'Only code, no description needed',
                            'Changing all files in the project'
                        ],
                        correctAnswer: 1,
                        explanation: 'Quality PRs are focused, well-documented, and tested.'
                    }
                ]
            }
        ]
    },
    // ==========================================
    // MODULE 5: ADVANCED GIT
    // ==========================================
    {
        slug: 'advanced-git',
        title: 'Advanced Git Techniques',
        description: 'Master advanced Git operations: rebasing, cherry-picking, stashing, and more.',
        icon: '🚀',
        coverImage: '/images/opensource/advanced-git.png',
        orderIndex: 4,
        isRequired: true,
        estimatedMinutes: 50,
        isActive: true,
        lessons: [
            {
                title: 'Interactive Rebase',
                description: 'Learn to rewrite history and clean up commits.',
                type: 'INTERACTIVE',
                orderIndex: 0,
                estimatedMinutes: 15,
                isRequired: true,
                content: `# Interactive Rebase

## What is Rebasing?

Rebasing rewrites commit history. Interactive rebase lets you:
- **Squash** commits together
- **Reword** commit messages
- **Reorder** commits
- **Drop** unwanted commits
- **Edit** commit content

## When to Use

✅ Clean up before PR
✅ Combine WIP commits
✅ Fix commit messages
❌ Never on shared branches
❌ After pushing to main

## Interactive Rebase Commands

\`\`\`bash
# Rebase last 3 commits
git rebase -i HEAD~3

# Rebase since specific commit
git rebase -i abc123^
\`\`\`

## The Interactive Editor

\`\`\`
pick abc123 Add feature
pick def456 WIP more work
pick ghi789 Fix typo

# Commands:
# p, pick = use commit
# r, reword = use commit, edit message
# e, edit = use commit, stop for amending
# s, squash = meld into previous commit
# f, fixup = squash without message
# d, drop = remove commit
\`\`\`

## Example: Squash Commits

Before:
\`\`\`
abc123 Add login feature
def456 WIP
ghi789 Fix bug
jkl012 Oops forgot file
\`\`\`

Interactive rebase file:
\`\`\`
pick abc123 Add login feature
squash def456 WIP
squash ghi789 Fix bug
squash jkl012 Oops forgot file
\`\`\`

After:
\`\`\`
mno345 Add login feature
\`\`\``,
                interactiveData: {
                    steps: [
                        {
                            instruction: 'Create several test commits to practice with:',
                            command: 'echo "1" > test.txt && git add . && git commit -m "First commit" && echo "2" >> test.txt && git add . && git commit -m "WIP" && echo "3" >> test.txt && git add . && git commit -m "More work"',
                            expectedOutput: 'More work',
                            hint: 'This creates 3 commits we can practice with'
                        },
                        {
                            instruction: 'View the commit log:',
                            command: 'git log --oneline -5',
                            expectedOutput: 'WIP',
                            hint: 'You should see the 3 commits we just created'
                        },
                        {
                            instruction: 'Start interactive rebase for the last 3 commits:',
                            command: 'echo "To squash commits, you would run: git rebase -i HEAD~3"',
                            expectedOutput: 'git rebase -i HEAD~3',
                            hint: 'In a real scenario, this opens an editor'
                        }
                    ]
                }
            },
            {
                title: 'Git Stash',
                description: 'Temporarily save changes without committing.',
                type: 'INTERACTIVE',
                orderIndex: 1,
                estimatedMinutes: 10,
                isRequired: true,
                content: `# Git Stash

## What is Stash?

Stash lets you save uncommitted changes temporarily. Perfect when you need to:
- Switch branches with uncommitted work
- Pull latest changes without conflicts
- Try something quickly without losing work

## Stash Commands

\`\`\`bash
# Save current changes
git stash

# Save with a message
git stash save "WIP: login feature"

# Save including untracked files
git stash -u

# Save including ignored files
git stash -a
\`\`\`

## Restoring Stashed Changes

\`\`\`bash
# Apply most recent stash (keep in stash list)
git stash apply

# Apply AND remove from stash list
git stash pop

# Apply specific stash
git stash apply stash@{2}
\`\`\`

## Managing Stashes

\`\`\`bash
# List all stashes
git stash list

# Show stash contents
git stash show -p stash@{0}

# Drop a stash
git stash drop stash@{0}

# Clear all stashes
git stash clear
\`\`\``,
                interactiveData: {
                    steps: [
                        {
                            instruction: 'Make some changes to simulate work in progress:',
                            command: 'echo "Work in progress" >> test.txt',
                            expectedOutput: '',
                            hint: 'This adds uncommitted changes'
                        },
                        {
                            instruction: 'Check status to see the modified file:',
                            command: 'git status',
                            expectedOutput: 'modified',
                            hint: 'You should see test.txt as modified'
                        },
                        {
                            instruction: 'Stash your changes:',
                            command: 'git stash',
                            expectedOutput: 'Saved working directory',
                            hint: 'Your changes are now stashed'
                        },
                        {
                            instruction: 'Verify the working directory is clean:',
                            command: 'git status',
                            expectedOutput: 'nothing to commit',
                            hint: 'Working directory is now clean'
                        },
                        {
                            instruction: 'List your stashes:',
                            command: 'git stash list',
                            expectedOutput: 'stash@{0}',
                            hint: 'Shows all saved stashes'
                        },
                        {
                            instruction: 'Restore your stashed changes:',
                            command: 'git stash pop',
                            expectedOutput: 'Dropped',
                            hint: 'Changes are restored and stash is removed'
                        }
                    ]
                }
            },
            {
                title: 'Cherry-picking Commits',
                description: 'Apply specific commits from other branches.',
                type: 'READING',
                orderIndex: 2,
                estimatedMinutes: 10,
                isRequired: true,
                content: `# Cherry-picking Commits

## What is Cherry-pick?

Cherry-pick lets you apply a specific commit from another branch to your current branch. Like picking a single cherry from a tree!

## When to Use

- Apply a bug fix from another branch
- Move a commit that landed on the wrong branch
- Backport changes to older versions

## Commands

\`\`\`bash
# Apply a single commit
git cherry-pick <commit-hash>

# Apply multiple commits
git cherry-pick <hash1> <hash2> <hash3>

# Apply a range of commits
git cherry-pick A..B    # A to B (exclusive of A)
git cherry-pick A^..B   # A to B (inclusive)

# Cherry-pick without committing
git cherry-pick --no-commit <hash>

# Abort if there are conflicts
git cherry-pick --abort
\`\`\`

## Example Workflow

\`\`\`bash
# You're on main, want a fix from feature-branch
git log feature-branch --oneline  # Find commit hash
# abc123 Fix critical bug

git cherry-pick abc123
# Commit abc123 is now applied to main
\`\`\`

## Handling Conflicts

If there are conflicts:
1. Resolve conflicts manually
2. Stage resolved files: \`git add .\`
3. Continue: \`git cherry-pick --continue\`

## Pro Tips

1. **Don't cherry-pick merged commits** - They have two parents
2. **Track cherry-picks** - Leave a note in commit message
3. **Consider alternatives** - Sometimes merge/rebase is better
4. **Use for small fixes** - Not entire features`
            },
            {
                title: 'Git Reset vs Revert',
                description: 'Understand the difference between reset and revert.',
                type: 'READING',
                orderIndex: 3,
                estimatedMinutes: 12,
                isRequired: true,
                content: `# Git Reset vs Revert

## The Key Difference

| Reset | Revert |
|-------|--------|
| Removes commits | Creates new commit |
| Rewrites history | Preserves history |
| Use on local branches | Safe for shared branches |

## Git Reset

\`\`\`bash
# Three modes of reset
git reset --soft HEAD~1   # Undo commit, keep changes staged
git reset --mixed HEAD~1  # Undo commit, keep changes unstaged (default)
git reset --hard HEAD~1   # Undo commit, discard all changes ⚠️

# Reset to specific commit
git reset --hard abc123
\`\`\`

### Visual: Reset Modes

\`\`\`
Before: A---B---C (HEAD)

--soft:  A---B (HEAD)
         Changes from C are staged

--mixed: A---B (HEAD)
         Changes from C are unstaged

--hard:  A---B (HEAD)
         Changes from C are GONE
\`\`\`

## Git Revert

\`\`\`bash
# Revert a single commit
git revert abc123

# Revert without creating commit
git revert --no-commit abc123

# Revert multiple commits
git revert abc123 def456

# Revert a range
git revert HEAD~3..HEAD
\`\`\`

### Visual: Revert

\`\`\`
Before: A---B---C (HEAD)
After:  A---B---C---D (HEAD)
        D "undoes" C but history preserved
\`\`\`

## When to Use Which

### Use Reset When:
- ✅ Commit hasn't been pushed
- ✅ You're on a personal branch
- ✅ You want to combine commits
- ✅ You want to redo work

### Use Revert When:
- ✅ Commit is already pushed
- ✅ You're on a shared branch
- ✅ You need to preserve history
- ✅ In production hotfixes

## ⚠️ Warning: Reset on Shared Branches

NEVER \`git reset --hard\` on branches others are using!
It rewrites history and causes problems:

\`\`\`bash
# DON'T do this on shared branches!
git reset --hard HEAD~3
git push --force  # This breaks everyone else!
\`\`\``
            },
            {
                title: 'Advanced Git Quiz',
                description: 'Test your advanced Git knowledge.',
                type: 'QUIZ',
                orderIndex: 4,
                estimatedMinutes: 10,
                isRequired: true,
                passingScore: 70,
                quizQuestions: [
                    {
                        question: 'What does "git rebase -i HEAD~3" do?',
                        options: [
                            'Deletes the last 3 commits',
                            'Opens interactive editor to modify last 3 commits',
                            'Creates 3 new branches',
                            'Pushes last 3 commits'
                        ],
                        correctAnswer: 1,
                        explanation: 'Interactive rebase (-i) opens an editor where you can squash, reorder, edit, or drop commits.'
                    },
                    {
                        question: 'What is the difference between git reset --soft and --hard?',
                        options: [
                            'No difference',
                            '--soft is faster, --hard is slower',
                            '--soft keeps changes staged, --hard discards all changes',
                            '--soft is for branches, --hard is for tags'
                        ],
                        correctAnswer: 2,
                        explanation: '--soft keeps your changes staged, --hard permanently discards them.'
                    },
                    {
                        question: 'When should you use git revert instead of git reset?',
                        options: [
                            'When working alone',
                            'When the commit has already been pushed to a shared branch',
                            'When you want to delete files',
                            'Revert and reset are the same'
                        ],
                        correctAnswer: 1,
                        explanation: 'Revert preserves history, making it safe for shared branches.'
                    },
                    {
                        question: 'What does git cherry-pick do?',
                        options: [
                            'Deletes specific commits',
                            'Applies specific commits from another branch',
                            'Creates a new branch',
                            'Merges all branches'
                        ],
                        correctAnswer: 1,
                        explanation: 'Cherry-pick applies individual commits from one branch to another.'
                    },
                    {
                        question: 'What happens when you run "git stash pop"?',
                        options: [
                            'Deletes the stash permanently',
                            'Lists all stashes',
                            'Applies stashed changes and removes from stash list',
                            'Creates a new stash'
                        ],
                        correctAnswer: 2,
                        explanation: 'Pop applies the stash and removes it from the stash list (unlike apply which keeps it).'
                    }
                ]
            }
        ]
    }
];

// ==========================================
// LEARNING PROJECTS - Practice Projects
// ==========================================

export const learningProjectsData = [
    {
        slug: 'devtools-cli',
        title: 'DevTools CLI',
        description: 'Build a command-line tool that helps developers with common tasks like project scaffolding, git shortcuts, and code generation.',
        techStack: ['Node.js', 'Commander.js', 'Chalk', 'Inquirer'],
        difficulty: 'BEGINNER',
        estimatedHours: 15,
        tier: 'LEARN',
        githubRepoUrl: 'https://github.com/thecoderzhq/devtools-cli',
        githubOwner: 'thecoderzhq',
        githubRepo: 'devtools-cli',
        maxContributors: 50,
        skills: ['Node.js Basics', 'CLI Development', 'Git Operations', 'File System'],
        learningOutcomes: [
            'Build CLI applications from scratch',
            'Handle user input and arguments',
            'Work with file system operations',
            'Create reusable utility functions'
        ],
        issues: [
            {
                title: 'Add --version flag to display current version',
                description: 'Implement a --version flag that reads version from package.json',
                difficulty: 'BEGINNER',
                labels: ['good first issue', 'enhancement'],
                estimatedHours: 1
            },
            {
                title: 'Add colorful output using chalk',
                description: 'Make the CLI output more readable with colors for success, error, and info messages',
                difficulty: 'BEGINNER',
                labels: ['good first issue', 'enhancement'],
                estimatedHours: 2
            },
            {
                title: 'Implement init command for project scaffolding',
                description: 'Create an interactive init command that generates project boilerplate',
                difficulty: 'INTERMEDIATE',
                labels: ['feature', 'help wanted'],
                estimatedHours: 4
            },
            {
                title: 'Add git shortcut commands',
                description: 'Implement shortcuts like "dt commit" for common git workflows',
                difficulty: 'INTERMEDIATE',
                labels: ['feature'],
                estimatedHours: 3
            },
            {
                title: 'Create config file support',
                description: 'Allow users to save preferences in a .devtoolsrc file',
                difficulty: 'INTERMEDIATE',
                labels: ['feature', 'enhancement'],
                estimatedHours: 4
            }
        ]
    },
    {
        slug: 'api-testing-tool',
        title: 'API Testing Tool',
        description: 'A lightweight REST API testing tool similar to Postman, built with React and Node.js for learning full-stack development.',
        techStack: ['React', 'Node.js', 'Express', 'Prisma', 'PostgreSQL'],
        difficulty: 'BEGINNER',
        estimatedHours: 25,
        tier: 'LEARN',
        githubRepoUrl: 'https://github.com/thecoderzhq/api-tester',
        githubOwner: 'thecoderzhq',
        githubRepo: 'api-tester',
        maxContributors: 50,
        skills: ['React Basics', 'REST APIs', 'Database Design', 'State Management'],
        learningOutcomes: [
            'Build a full-stack application',
            'Work with REST APIs',
            'Implement CRUD operations',
            'Handle HTTP requests and responses'
        ],
        issues: [
            {
                title: 'Create request history sidebar',
                description: 'Display list of recent API requests in a collapsible sidebar',
                difficulty: 'BEGINNER',
                labels: ['good first issue', 'frontend'],
                estimatedHours: 3
            },
            {
                title: 'Add response body formatting',
                description: 'Pretty-print JSON responses with syntax highlighting',
                difficulty: 'BEGINNER',
                labels: ['good first issue', 'enhancement'],
                estimatedHours: 2
            },
            {
                title: 'Implement request collections',
                description: 'Allow users to organize requests into collections/folders',
                difficulty: 'INTERMEDIATE',
                labels: ['feature', 'full-stack'],
                estimatedHours: 6
            },
            {
                title: 'Add environment variables support',
                description: 'Support {{variable}} syntax in URLs and headers',
                difficulty: 'INTERMEDIATE',
                labels: ['feature'],
                estimatedHours: 5
            }
        ]
    },
    {
        slug: 'markdown-notes',
        title: 'Markdown Notes App',
        description: 'A Next.js note-taking application with Markdown support, real-time preview, and cloud sync.',
        techStack: ['Next.js', 'Node.js', 'Express', 'Prisma', 'PostgreSQL'],
        difficulty: 'BEGINNER',
        estimatedHours: 20,
        tier: 'LEARN',
        githubRepoUrl: 'https://github.com/thecoderzhq/markdown-notes',
        githubOwner: 'thecoderzhq',
        githubRepo: 'markdown-notes',
        maxContributors: 50,
        skills: ['Next.js', 'Markdown Parsing', 'Real-time Updates', 'Authentication'],
        learningOutcomes: [
            'Build with Next.js App Router',
            'Implement real-time features',
            'Handle file uploads and storage',
            'Create responsive layouts'
        ],
        issues: [
            {
                title: 'Add dark mode toggle',
                description: 'Implement system and manual dark mode switching',
                difficulty: 'BEGINNER',
                labels: ['good first issue', 'enhancement'],
                estimatedHours: 2
            },
            {
                title: 'Create note export functionality',
                description: 'Export notes as PDF or HTML files',
                difficulty: 'INTERMEDIATE',
                labels: ['feature'],
                estimatedHours: 4
            },
            {
                title: 'Implement note sharing',
                description: 'Generate shareable links for notes with read-only access',
                difficulty: 'INTERMEDIATE',
                labels: ['feature', 'backend'],
                estimatedHours: 5
            },
            {
                title: 'Add keyboard shortcuts',
                description: 'Implement keyboard shortcuts for common actions',
                difficulty: 'BEGINNER',
                labels: ['good first issue', 'enhancement'],
                estimatedHours: 3
            }
        ]
    }
];

// ==========================================
// FREE PROJECTS - Real Open Source Projects
// ==========================================

export const freeProjectsData = [
    {
        slug: 'issue-tracker-pro',
        title: 'Issue Tracker Pro',
        description: 'A full-featured issue tracking system with Kanban boards, sprint planning, and team collaboration features. Perfect for learning how enterprise software is built.',
        techStack: ['React', 'Node.js', 'Express', 'Prisma', 'PostgreSQL', 'Redis'],
        difficulty: 'INTERMEDIATE',
        estimatedHours: 100,
        tier: 'FREE',
        githubRepoUrl: 'https://github.com/thecoderzhq/issue-tracker-pro',
        githubOwner: 'thecoderzhq',
        githubRepo: 'issue-tracker-pro',
        maxContributors: 30,
        skills: ['React', 'Node.js', 'Database Design', 'Real-time Updates', 'Authentication'],
        features: [
            'Kanban board with drag-and-drop',
            'Sprint planning and management',
            'Real-time notifications',
            'Team workspaces',
            'Issue dependencies',
            'Custom workflows'
        ],
        issues: [
            {
                title: 'Implement drag-and-drop for Kanban columns',
                description: 'Allow users to reorder columns by dragging',
                difficulty: 'INTERMEDIATE',
                labels: ['feature', 'frontend'],
                estimatedHours: 6
            },
            {
                title: 'Add issue templates',
                description: 'Create customizable templates for bug reports, features, etc.',
                difficulty: 'INTERMEDIATE',
                labels: ['feature', 'full-stack'],
                estimatedHours: 8
            },
            {
                title: 'Implement sprint burndown chart',
                description: 'Create a visual chart showing sprint progress',
                difficulty: 'ADVANCED',
                labels: ['feature', 'analytics'],
                estimatedHours: 10
            },
            {
                title: 'Add webhook integrations',
                description: 'Allow external services to receive issue updates',
                difficulty: 'ADVANCED',
                labels: ['feature', 'backend'],
                estimatedHours: 12
            },
            {
                title: 'Create mobile-responsive design',
                description: 'Ensure all components work well on mobile devices',
                difficulty: 'INTERMEDIATE',
                labels: ['enhancement', 'frontend'],
                estimatedHours: 8
            }
        ]
    },
    {
        slug: 'ai-code-reviewer',
        title: 'AI Code Reviewer',
        description: 'An intelligent code review assistant powered by AI. Analyzes PRs, suggests improvements, and helps maintain code quality. Uses OpenAI for intelligent suggestions.',
        techStack: ['Next.js', 'Node.js', 'Express', 'Prisma', 'PostgreSQL', 'OpenAI API'],
        difficulty: 'ADVANCED',
        estimatedHours: 150,
        tier: 'FREE',
        githubRepoUrl: 'https://github.com/thecoderzhq/ai-code-reviewer',
        githubOwner: 'thecoderzhq',
        githubRepo: 'ai-code-reviewer',
        maxContributors: 25,
        skills: ['Next.js', 'AI Integration', 'GitHub API', 'Webhooks', 'Code Analysis'],
        features: [
            'Automatic PR review comments',
            'Code quality scoring',
            'Security vulnerability detection',
            'Performance suggestions',
            'Style consistency checks',
            'Learning from feedback'
        ],
        issues: [
            {
                title: 'Add TypeScript support for code analysis',
                description: 'Extend the analyzer to understand TypeScript-specific patterns',
                difficulty: 'INTERMEDIATE',
                labels: ['feature', 'backend'],
                estimatedHours: 8
            },
            {
                title: 'Implement review dashboard',
                description: 'Create a dashboard showing review statistics and trends',
                difficulty: 'INTERMEDIATE',
                labels: ['feature', 'frontend'],
                estimatedHours: 10
            },
            {
                title: 'Add custom rule configuration',
                description: 'Allow teams to define their own code review rules',
                difficulty: 'ADVANCED',
                labels: ['feature', 'full-stack'],
                estimatedHours: 15
            },
            {
                title: 'Integrate with GitHub Actions',
                description: 'Run code review as part of CI/CD pipeline',
                difficulty: 'ADVANCED',
                labels: ['feature', 'integration'],
                estimatedHours: 12
            },
            {
                title: 'Add security scanning',
                description: 'Detect potential security vulnerabilities in code changes',
                difficulty: 'ADVANCED',
                labels: ['feature', 'security'],
                estimatedHours: 20
            }
        ]
    }
];

// ==========================================
// EXAM QUESTIONS (AI-Generated Template)
// ==========================================

export const examQuestionTemplates = {
    quiz: [
        {
            category: 'git-basics',
            difficulty: 'easy',
            template: 'What command is used to {action}?',
            topics: ['initialize repository', 'stage files', 'create commits', 'view history']
        },
        {
            category: 'branching',
            difficulty: 'medium',
            template: 'Explain the difference between {Learn1} and {Learn2}.',
            topics: ['merge vs rebase', 'fast-forward vs three-way merge', 'reset vs revert']
        },
        {
            category: 'github',
            difficulty: 'medium',
            template: 'What is the purpose of {Learn} in GitHub workflow?',
            topics: ['fork', 'pull request', 'code review', 'branch protection']
        }
    ],
    terminal: [
        {
            category: 'commands',
            difficulty: 'easy',
            scenario: 'You need to {task}',
            tasks: [
                'create a new branch called feature/login',
                'stage all changes',
                'undo the last commit keeping changes',
                'sync your fork with upstream'
            ]
        },
        {
            category: 'workflow',
            difficulty: 'medium',
            scenario: 'You are working on a feature branch and need to {task}',
            tasks: [
                'squash your last 3 commits into one',
                'apply a specific commit from another branch',
                'temporarily save your work to switch branches'
            ]
        }
    ],
    scenario: [
        {
            category: 'collaboration',
            difficulty: 'medium',
            scenario: 'You submitted a PR and the reviewer requested changes. The changes involve {situation}.',
            situations: [
                'refactoring a function for better readability',
                'adding error handling',
                'fixing merge conflicts',
                'updating documentation'
            ]
        },
        {
            category: 'troubleshooting',
            difficulty: 'hard',
            scenario: 'You accidentally {mistake}. What should you do?',
            mistakes: [
                'committed sensitive data',
                'pushed to the wrong branch',
                'deleted important commits',
                'created a merge conflict'
            ]
        }
    ]
};

// Export all data
export const openSourceSeedData = {
    modules: learningModulesData,
    learningProjects: learningProjectsData,
    freeProjects: freeProjectsData,
    examTemplates: examQuestionTemplates
}