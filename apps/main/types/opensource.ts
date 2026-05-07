import { 
    OSProjectType, 
    OSProjectStatus, 
    OSProjectCategory,
    OSIssueStatus,
    OSIssueDifficulty,
    OSContributionType,
    OSContributionStatus,
    OSLearnModuleType,
    OSCertificationStatus
} from '@repo/db'

// ============================================
// PROJECT TYPES
// ============================================

export interface OSProject {
    id: string
    slug: string
    title: string
    description: string
    longDescription?: string | null
    githubRepoUrl: string
    githubOwner: string
    githubRepo: string
    defaultBranch: string
    type: OSProjectType
    category: OSProjectCategory
    status: OSProjectStatus
    technologies: string[]
    tags: string[]
    difficulty: OSIssueDifficulty
    learningGoals: string[]
    prerequisites: string[]
    estimatedHours?: number | null
    totalBudget: number
    remainingBudget: number
    currency: string
    companyName?: string | null
    companyLogo?: string | null
    companyUrl?: string | null
    totalIssues: number
    openIssues: number
    closedIssues: number
    totalContributors: number
    totalPRsMerged: number
    totalPRsOpen: number
    totalCommits: number
    stars: number
    forks: number
    watchers: number
    lastSyncedAt?: Date | null
    requiresCertification: boolean
    maxActiveIssues: number
    prDeadlineHours: number
    maxContributionsPerUser: number
    readmeContent?: string | null
    contributingGuide?: string | null
    coverImage?: string | null
    bannerImage?: string | null
    orderIndex: number
    isFeatured: boolean
    maintainer?: OSUser | null
    createdBy: OSUser
    createdAt: Date
    updatedAt: Date
    _count?: {
        issues: number
        contributions: number
        contributors: number
    }
}

export interface OSProjectWithDetails extends OSProject {
    issues?: OSIssue[]
    contributors?: OSProjectContributor[]
    setupGuide?: OSProjectSetupGuide | null
}

export interface OSProjectSetupGuide {
    id: string
    projectId: string
    steps: SetupStep[]
    nodeVersion?: string | null
    npmPackages: string[]
    envVariables?: Record<string, string> | null
    installCommand: string
    devCommand: string
    buildCommand: string
    testCommand: string
}

export interface SetupStep {
    title: string
    description: string
    commands?: string[]
    expectedOutput?: string
}

// ============================================
// ISSUE TYPES
// ============================================

export interface OSIssue {
    id: string
    projectId: string
    githubIssueNumber?: number | null
    githubIssueUrl?: string | null
    githubIssueId?: string | null
    title: string
    description: string
    requirements: string[]
    acceptanceCriteria: string[]
    hints: string[]
    learningGoals: string[]
    filesToModify: string[]
    relatedDocs: string[]
    status: OSIssueStatus
    difficulty: OSIssueDifficulty
    labels: string[]
    estimatedHours: number
    bountyAmount: number
    bountyPaid: boolean
    assignedToId?: string | null
    assignedTo?: OSUser | null
    assignedAt?: Date | null
    deadlineAt?: Date | null
    prNumber?: number | null
    prUrl?: string | null
    prStatus?: string | null
    totalAttempts: number
    orderIndex: number
    lastSyncedAt?: Date | null
    createdAt: Date
    updatedAt: Date
    project?: OSProject
}

// ============================================
// CONTRIBUTION TYPES
// ============================================

export interface OSContribution {
    id: string
    projectId: string
    issueId?: string | null
    userId: string
    type: OSContributionType
    status: OSContributionStatus
    githubPrNumber?: number | null
    githubPrUrl?: string | null
    githubPrId?: string | null
    githubCommitSha?: string | null
    githubBranch?: string | null
    forkRepoUrl?: string | null
    forkOwner?: string | null
    title?: string | null
    description?: string | null
    reviewScore?: number | null
    reviewFeedback?: string | null
    reviewCycles: number
    reviewedById?: string | null
    reviewedBy?: OSUser | null
    reviewedAt?: Date | null
    xpEarned: number
    bountyEarned: number
    linesAdded: number
    linesRemoved: number
    filesChanged: number
    commitsCount: number
    testsPassing: boolean
    isMerged: boolean
    mergedAt?: Date | null
    mergedBy?: string | null
    closedAt?: Date | null
    checksStatus?: string | null
    checksDetails?: Record<string, unknown> | null
    lastSyncedAt?: Date | null
    createdAt: Date
    updatedAt: Date
    project?: OSProject
    issue?: OSIssue | null
    user?: OSUser
}

export interface OSProjectContributor {
    id: string
    projectId: string
    userId: string
    totalContributions: number
    prsSubmitted: number
    prsMerged: number
    issuesSolved: number
    reviewsGiven: number
    totalXpEarned: number
    totalBountyEarned: number
    rank?: number | null
    contributionScore: number
    isActive: boolean
    joinedAt: Date
    lastActiveAt: Date
    user?: OSUser
    project?: OSProject
}

// ============================================
// USER TYPES
// ============================================

export interface OSUser {
    id: string
    name?: string | null
    username?: string | null
    email?: string | null
    image?: string | null
    githubUsername?: string | null
}

export interface OSUserStats {
    id: string
    userId: string
    modulesCompleted: number
    lessonsCompleted: number
    totalLearningTime: number
    isCertified: boolean
    certificationScore?: number | null
    certifiedAt?: Date | null
    totalProjects: number
    totalContributions: number
    prsSubmitted: number
    prsMerged: number
    issuesSolved: number
    reviewsGiven: number
    avgPrScore: number
    acceptanceRate: number
    totalBountyEarned: number
    pendingBounty: number
    osXp: number
    globalRank?: number | null
    currentStreak: number
    longestStreak: number
    lastContributionAt?: Date | null
}

export interface OSGitHubProfile {
    id: string
    userId: string
    githubId: string
    githubUsername: string
    githubName?: string | null
    githubAvatar?: string | null
    githubBio?: string | null
    githubLocation?: string | null
    githubCompany?: string | null
    githubBlog?: string | null
    publicRepos: number
    publicGists: number
    followers: number
    following: number
    scopes: string[]
    showOnProfile: boolean
    autoSync: boolean
    lastSyncedAt?: Date | null
}

// ============================================
// LEARNING TYPES
// ============================================

export interface OSLearnModule {
    id: string
    slug: string
    title: string
    description: string
    icon?: string | null
    coverImage?: string | null
    orderIndex: number
    isRequired: boolean
    estimatedMinutes: number
    totalEnrolled: number
    totalCompleted: number
    averageScore: number
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    lessons?: OSLearnLesson[]
    _count?: {
        lessons: number
    }
}

export interface OSLearnLesson {
    id: string
    moduleId: string
    title: string
    description?: string | null
    type: OSLearnModuleType
    content?: string | null
    videoUrl?: string | null
    interactiveData?: InteractiveLabData | null
    codeLab?: CodeLabData | null
    terminalLab?: TerminalLabData | null
    quizQuestions?: QuizQuestion[] | null
    passingScore: number
    orderIndex: number
    estimatedMinutes: number
    isRequired: boolean
    createdAt: Date
    updatedAt: Date
    module?: OSLearnModule
}

export interface InteractiveLabData {
    instructions: string
    steps: LabStep[]
    expectedOutputs: string[]
}

export interface LabStep {
    title: string
    description: string
    command?: string
    expectedOutput?: string
    hint?: string
}

export interface CodeLabData {
    language: string
    starterCode: string
    solution?: string
    expectedOutput?: string
    hints: string[]
    validationRules?: string[]
    taskDescription: string
}

export interface TerminalLabData {
    commands: TerminalCommand[]
    context?: string
    validationPrompt?: string
}

export interface TerminalCommand {
    command: string
    expectedOutput?: string
    description?: string
    isRequired: boolean
}

export interface QuizQuestion {
    id: string
    question: string
    options: string[]
    correctAnswer: number
    explanation?: string
}

export interface OSLearnProgress {
    id: string
    userId: string
    moduleId: string
    lessonsCompleted: number
    totalLessons: number
    progressPercent: number
    quizScore?: number | null
    quizAttempts: number
    isCompleted: boolean
    completedAt?: Date | null
    startedAt: Date
    updatedAt: Date
    module?: OSLearnModule
}

export interface OSLessonCompletion {
    id: string
    userId: string
    lessonId: string
    score?: number | null
    timeSpent: number
    commandsRun?: Record<string, unknown> | null
    isCompleted: boolean
    completedAt?: Date | null
    createdAt: Date
    lesson?: OSLearnLesson
}

// ============================================
// CERTIFICATION TYPES
// ============================================

export interface OSCertificationExam {
    id: string
    userId: string
    status: OSCertificationStatus
    quizScore?: number | null
    codeScore?: number | null
    scenarioScore?: number | null
    totalScore?: number | null
    passingScore: number
    quizQuestions?: QuizQuestion[] | null
    codeExercises?: CodeExercise[] | null
    scenarioQuestions?: ScenarioQuestion[] | null
    quizAnswers?: Record<string, unknown> | null
    codeAnswers?: Record<string, unknown> | null
    scenarioAnswers?: Record<string, unknown> | null
    startedAt?: Date | null
    completedAt?: Date | null
    timeLimit: number
    attemptNumber: number
    createdAt: Date
    updatedAt: Date
}

export interface CodeExercise {
    id: string
    title: string
    description: string
    starterCode: string
    language: string
    expectedOutput?: string
    testCases?: TestCase[]
}

export interface TestCase {
    input: string
    expectedOutput: string
}

export interface ScenarioQuestion {
    id: string
    scenario: string
    question: string
    options?: string[]
    correctAnswer?: string
}

export interface OSCertification {
    id: string
    certificateId: string
    userId: string
    title: string
    score: number
    issuedAt: Date
    expiresAt: Date
    isActive: boolean
    verificationUrl?: string | null
    qrCode?: string | null
}

// ============================================
// PRACTICE PROJECT TYPES
// ============================================

export interface OSLearnPracticeProject {
    id: string
    moduleId?: string | null
    slug: string
    title: string
    description: string
    techStack: string[]
    category: OSProjectCategory
    difficulty: OSIssueDifficulty
    starterFiles: Record<string, string>
    solutionFiles?: Record<string, string> | null
    learningGoals: string[]
    prerequisites: string[]
    estimatedHours: number
    orderIndex: number
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    tasks?: OSLearnPracticeTask[]
    _count?: {
        tasks: number
        completions: number
    }
}

export interface OSLearnPracticeTask {
    id: string
    projectId: string
    title: string
    description: string
    requirements: string[]
    hints: string[]
    targetFiles: string[]
    validationRules?: ValidationRule[] | null
    expectedChanges?: Record<string, unknown> | null
    difficulty: OSIssueDifficulty
    estimatedMinutes: number
    xpReward: number
    orderIndex: number
    createdAt: Date
    updatedAt: Date
    project?: OSLearnPracticeProject
}

export interface ValidationRule {
    type: 'contains' | 'regex' | 'function' | 'ai'
    value: string
    file?: string
    message?: string
}

export interface OSLearnPracticeSubmission {
    id: string
    userId: string
    taskId: string
    submittedCode: Record<string, string>
    isCorrect: boolean
    score?: number | null
    feedback?: string | null
    aiReview?: Record<string, unknown> | null
    attemptNumber: number
    xpEarned: number
    createdAt: Date
    task?: OSLearnPracticeTask
}

export interface OSLearnPracticeCompletion {
    id: string
    userId: string
    projectId: string
    tasksCompleted: number
    totalTasks: number
    progressPercent: number
    isCompleted: boolean
    completedAt?: Date | null
    totalXpEarned: number
    totalAttempts: number
    averageScore: number
    startedAt: Date
    updatedAt: Date
    project?: OSLearnPracticeProject
}

// ============================================
// LEADERBOARD TYPES
// ============================================

export interface OSProjectLeaderboard {
    id: string
    projectId: string
    userId: string
    rank: number
    score: number
    prsMerged: number
    issuesSolved: number
    bountyEarned: number
    updatedAt: Date
    user?: OSUser
}

export interface OSGlobalLeaderboard {
    userId: string
    rank: number
    totalContributions: number
    prsMerged: number
    totalXp: number
    totalBounty: number
    projectCount: number
    user?: OSUser
}

// ============================================
// FILTER & QUERY TYPES
// ============================================

export interface ProjectFilters {
    type?: OSProjectType | 'ALL'
    category?: OSProjectCategory | 'ALL'
    difficulty?: OSIssueDifficulty | 'ALL'
    status?: OSProjectStatus | 'ALL'
    search?: string
    technologies?: string[]
    page?: number
    limit?: number
}

export interface IssueFilters {
    status?: OSIssueStatus | 'ALL'
    difficulty?: OSIssueDifficulty | 'ALL'
    labels?: string[]
    search?: string
    page?: number
    limit?: number
}

export interface ContributionFilters {
    type?: OSContributionType | 'ALL'
    status?: OSContributionStatus | 'ALL'
    projectId?: string
    page?: number
    limit?: number
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    limit: number
    totalPages: number
    hasMore: boolean
}

export interface ActionResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
    message?: string
}





