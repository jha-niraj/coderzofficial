import {
    pgTable,
    pgEnum,
    text,
    integer,
    boolean,
    timestamp,
    jsonb,
    index,
    uniqueIndex,
    real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./schema.js";

// ===========================
// Enums
// ===========================

export const osProjectTypeEnum = pgEnum("OSProjectType", [
    "LEARNING",
    "FREE",
    "PAID",
    "EXCLUSIVE",
]);

export const osProjectCategoryEnum = pgEnum("OSProjectCategory", [
    "WEB_DEVELOPMENT",
    "MOBILE_DEVELOPMENT",
    "BACKEND",
    "FULLSTACK",
    "AI_ML",
    "DEVOPS",
    "BLOCKCHAIN",
    "GAME_DEVELOPMENT",
    "OTHER",
]);

export const osProjectStatusEnum = pgEnum("OSProjectStatus", [
    "DRAFT",
    "ACTIVE",
    "PAUSED",
    "COMPLETED",
    "ARCHIVED",
]);

export const osIssueStatusEnum = pgEnum("OSIssueStatus", [
    "OPEN",
    "ASSIGNED",
    "IN_REVIEW",
    "COMPLETED",
    "CLOSED",
]);

export const osIssueDifficultyEnum = pgEnum("OSIssueDifficulty", [
    "GOOD_FIRST_ISSUE",
    "EASY",
    "MEDIUM",
    "HARD",
    "EXPERT",
]);

export const osContributionTypeEnum = pgEnum("OSContributionType", [
    "ISSUE_CREATED",
    "ISSUE_SOLVED",
    "PR_SUBMITTED",
    "PR_MERGED",
    "CODE_REVIEW",
    "DOCUMENTATION",
    "BUG_FIX",
    "FEATURE",
]);

export const osContributionStatusEnum = pgEnum("OSContributionStatus", [
    "PENDING",
    "IN_REVIEW",
    "APPROVED",
    "REJECTED",
    "MERGED",
    "CHANGES_REQUESTED",
]);

export const osLearnModuleTypeEnum = pgEnum("OSLearnModuleType", [
    "VIDEO",
    "READING",
    "INTERACTIVE",
    "QUIZ",
    "PROJECT",
]);

export const osCertificationStatusEnum = pgEnum("OSCertificationStatus", [
    "NOT_STARTED",
    "IN_PROGRESS",
    "PASSED",
    "FAILED",
]);

export const osLearnLabTypeEnum = pgEnum("OSLearnLabType", [
    "CODE",
    "TERMINAL",
    "QUIZ",
    "PROJECT",
]);

// ===========================
// Tables
// ===========================

export const openSourceProjects = pgTable(
    "OpenSourceProject",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        slug: text("slug").notNull().unique(),
        title: text("title").notNull(),
        description: text("description").notNull(),
        longDescription: text("longDescription"),
        githubRepoUrl: text("githubRepoUrl").notNull(),
        githubOwner: text("githubOwner").notNull(),
        githubRepo: text("githubRepo").notNull(),
        defaultBranch: text("defaultBranch").notNull().default("main"),
        type: osProjectTypeEnum("type").notNull().default("FREE"),
        category: osProjectCategoryEnum("category").notNull().default("WEB_DEVELOPMENT"),
        status: osProjectStatusEnum("status").notNull().default("DRAFT"),
        technologies: text("technologies").array().notNull().default([]),
        tags: text("tags").array().notNull().default([]),
        difficulty: osIssueDifficultyEnum("difficulty").notNull().default("MEDIUM"),
        learningGoals: text("learningGoals").array().notNull().default([]),
        prerequisites: text("prerequisites").array().notNull().default([]),
        estimatedHours: integer("estimatedHours"),
        totalBudget: real("totalBudget").notNull().default(0),
        remainingBudget: real("remainingBudget").notNull().default(0),
        currency: text("currency").notNull().default("USD"),
        companyName: text("companyName"),
        companyLogo: text("companyLogo"),
        companyUrl: text("companyUrl"),
        totalIssues: integer("totalIssues").notNull().default(0),
        openIssues: integer("openIssues").notNull().default(0),
        closedIssues: integer("closedIssues").notNull().default(0),
        totalContributors: integer("totalContributors").notNull().default(0),
        totalPRsMerged: integer("totalPRsMerged").notNull().default(0),
        totalPRsOpen: integer("totalPRsOpen").notNull().default(0),
        totalCommits: integer("totalCommits").notNull().default(0),
        stars: integer("stars").notNull().default(0),
        forks: integer("forks").notNull().default(0),
        watchers: integer("watchers").notNull().default(0),
        lastSyncedAt: timestamp("lastSyncedAt"),
        syncError: text("syncError"),
        requiresCertification: boolean("requiresCertification").notNull().default(true),
        maxActiveIssues: integer("maxActiveIssues").notNull().default(2),
        prDeadlineHours: integer("prDeadlineHours").notNull().default(48),
        maxContributionsPerUser: integer("maxContributionsPerUser").notNull().default(0),
        readmeContent: text("readmeContent"),
        contributingGuide: text("contributingGuide"),
        coverImage: text("coverImage"),
        bannerImage: text("bannerImage"),
        orderIndex: integer("orderIndex").notNull().default(0),
        isFeatured: boolean("isFeatured").notNull().default(false),
        maintainerId: text("maintainerId").references(() => users.id, { onDelete: "set null" }),
        createdById: text("createdById")
            .notNull()
            .references(() => users.id, { onDelete: "restrict" }),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_osp_type").on(table.type),
        index("idx_osp_category").on(table.category),
        index("idx_osp_status").on(table.status),
        index("idx_osp_maintainerId").on(table.maintainerId),
        index("idx_osp_createdById").on(table.createdById),
        index("idx_osp_slug").on(table.slug),
        index("idx_osp_orderIndex").on(table.orderIndex),
        index("idx_osp_isFeatured").on(table.isFeatured),
    ],
);

export const osProjectSetupGuides = pgTable(
    "OSProjectSetupGuide",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        projectId: text("projectId")
            .notNull()
            .unique()
            .references(() => openSourceProjects.id, { onDelete: "cascade" }),
        steps: jsonb("steps").notNull(),
        nodeVersion: text("nodeVersion"),
        npmPackages: text("npmPackages").array().notNull().default([]),
        envVariables: jsonb("envVariables"),
        installCommand: text("installCommand").notNull().default("npm install"),
        devCommand: text("devCommand").notNull().default("npm run dev"),
        buildCommand: text("buildCommand").notNull().default("npm run build"),
        testCommand: text("testCommand").notNull().default("npm test"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
);

export const osIssues = pgTable(
    "OSIssue",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        projectId: text("projectId")
            .notNull()
            .references(() => openSourceProjects.id, { onDelete: "cascade" }),
        githubIssueNumber: integer("githubIssueNumber"),
        githubIssueUrl: text("githubIssueUrl"),
        githubIssueId: text("githubIssueId"),
        title: text("title").notNull(),
        description: text("description").notNull(),
        requirements: text("requirements").array().notNull().default([]),
        acceptanceCriteria: text("acceptanceCriteria").array().notNull().default([]),
        hints: text("hints").array().notNull().default([]),
        learningGoals: text("learningGoals").array().notNull().default([]),
        filesToModify: text("filesToModify").array().notNull().default([]),
        relatedDocs: text("relatedDocs").array().notNull().default([]),
        status: osIssueStatusEnum("status").notNull().default("OPEN"),
        difficulty: osIssueDifficultyEnum("difficulty").notNull().default("EASY"),
        labels: text("labels").array().notNull().default([]),
        estimatedHours: integer("estimatedHours").notNull().default(4),
        bountyAmount: real("bountyAmount").notNull().default(0),
        bountyPaid: boolean("bountyPaid").notNull().default(false),
        assignedToId: text("assignedToId").references(() => users.id, { onDelete: "set null" }),
        assignedAt: timestamp("assignedAt"),
        deadlineAt: timestamp("deadlineAt"),
        prNumber: integer("prNumber"),
        prUrl: text("prUrl"),
        prStatus: text("prStatus"),
        totalAttempts: integer("totalAttempts").notNull().default(0),
        orderIndex: integer("orderIndex").notNull().default(0),
        lastSyncedAt: timestamp("lastSyncedAt"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_osi_projectId").on(table.projectId),
        index("idx_osi_status").on(table.status),
        index("idx_osi_difficulty").on(table.difficulty),
        index("idx_osi_assignedToId").on(table.assignedToId),
        index("idx_osi_githubIssueNumber").on(table.githubIssueNumber),
        index("idx_osi_orderIndex").on(table.orderIndex),
    ],
);

export const osContributions = pgTable(
    "OSContribution",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        projectId: text("projectId")
            .notNull()
            .references(() => openSourceProjects.id, { onDelete: "cascade" }),
        issueId: text("issueId").references(() => osIssues.id, { onDelete: "set null" }),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: osContributionTypeEnum("type").notNull(),
        status: osContributionStatusEnum("status").notNull().default("PENDING"),
        githubPrNumber: integer("githubPrNumber"),
        githubPrUrl: text("githubPrUrl"),
        githubPrId: text("githubPrId"),
        githubCommitSha: text("githubCommitSha"),
        githubBranch: text("githubBranch"),
        forkRepoUrl: text("forkRepoUrl"),
        forkOwner: text("forkOwner"),
        title: text("title"),
        description: text("description"),
        reviewScore: integer("reviewScore"),
        reviewFeedback: text("reviewFeedback"),
        reviewCycles: integer("reviewCycles").notNull().default(0),
        reviewedById: text("reviewedById").references(() => users.id, { onDelete: "set null" }),
        reviewedAt: timestamp("reviewedAt"),
        xpEarned: integer("xpEarned").notNull().default(0),
        bountyEarned: real("bountyEarned").notNull().default(0),
        linesAdded: integer("linesAdded").notNull().default(0),
        linesRemoved: integer("linesRemoved").notNull().default(0),
        filesChanged: integer("filesChanged").notNull().default(0),
        commitsCount: integer("commitsCount").notNull().default(0),
        testsPassing: boolean("testsPassing").notNull().default(true),
        isMerged: boolean("isMerged").notNull().default(false),
        mergedAt: timestamp("mergedAt"),
        mergedBy: text("mergedBy"),
        closedAt: timestamp("closedAt"),
        checksStatus: text("checksStatus"),
        checksDetails: jsonb("checksDetails"),
        lastSyncedAt: timestamp("lastSyncedAt"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_osc_projectId").on(table.projectId),
        index("idx_osc_issueId").on(table.issueId),
        index("idx_osc_userId").on(table.userId),
        index("idx_osc_type").on(table.type),
        index("idx_osc_status").on(table.status),
        index("idx_osc_githubPrNumber").on(table.githubPrNumber),
        index("idx_osc_isMerged").on(table.isMerged),
    ],
);

export const osProjectContributors = pgTable(
    "OSProjectContributor",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        projectId: text("projectId")
            .notNull()
            .references(() => openSourceProjects.id, { onDelete: "cascade" }),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        totalContributions: integer("totalContributions").notNull().default(0),
        prsSubmitted: integer("prsSubmitted").notNull().default(0),
        prsMerged: integer("prsMerged").notNull().default(0),
        issuesSolved: integer("issuesSolved").notNull().default(0),
        reviewsGiven: integer("reviewsGiven").notNull().default(0),
        totalXpEarned: integer("totalXpEarned").notNull().default(0),
        totalBountyEarned: real("totalBountyEarned").notNull().default(0),
        rank: integer("rank"),
        contributionScore: real("contributionScore").notNull().default(0),
        isActive: boolean("isActive").notNull().default(true),
        joinedAt: timestamp("joinedAt").notNull().defaultNow(),
        lastActiveAt: timestamp("lastActiveAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("idx_ospc_projectId_userId").on(table.projectId, table.userId),
        index("idx_ospc_projectId").on(table.projectId),
        index("idx_ospc_userId").on(table.userId),
        index("idx_ospc_rank").on(table.rank),
    ],
);

export const osProjectLeaderboards = pgTable(
    "OSProjectLeaderboard",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        projectId: text("projectId")
            .notNull()
            .references(() => openSourceProjects.id, { onDelete: "cascade" }),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        rank: integer("rank").notNull(),
        score: real("score").notNull(),
        prsMerged: integer("prsMerged").notNull(),
        issuesSolved: integer("issuesSolved").notNull(),
        bountyEarned: real("bountyEarned").notNull().default(0),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("idx_ospl_projectId_userId").on(table.projectId, table.userId),
        index("idx_ospl_projectId_rank").on(table.projectId, table.rank),
    ],
);

export const osLearnModules = pgTable(
    "OSLearnModule",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        slug: text("slug").notNull().unique(),
        title: text("title").notNull(),
        description: text("description").notNull(),
        icon: text("icon"),
        coverImage: text("coverImage"),
        orderIndex: integer("orderIndex").notNull().default(0),
        isRequired: boolean("isRequired").notNull().default(true),
        estimatedMinutes: integer("estimatedMinutes").notNull().default(30),
        totalEnrolled: integer("totalEnrolled").notNull().default(0),
        totalCompleted: integer("totalCompleted").notNull().default(0),
        averageScore: real("averageScore").notNull().default(0),
        isActive: boolean("isActive").notNull().default(true),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_oslm_orderIndex").on(table.orderIndex),
        index("idx_oslm_isRequired").on(table.isRequired),
    ],
);

export const osLearnLessons = pgTable(
    "OSLearnLesson",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        moduleId: text("moduleId")
            .notNull()
            .references(() => osLearnModules.id, { onDelete: "cascade" }),
        title: text("title").notNull(),
        description: text("description"),
        type: osLearnModuleTypeEnum("type").notNull().default("READING"),
        content: text("content"),
        videoUrl: text("videoUrl"),
        interactiveData: jsonb("interactiveData"),
        codeLab: jsonb("codeLab"),
        terminalLab: jsonb("terminalLab"),
        quizQuestions: jsonb("quizQuestions"),
        passingScore: integer("passingScore").notNull().default(70),
        orderIndex: integer("orderIndex").notNull().default(0),
        estimatedMinutes: integer("estimatedMinutes").notNull().default(10),
        isRequired: boolean("isRequired").notNull().default(true),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_osll_moduleId").on(table.moduleId),
        index("idx_osll_orderIndex").on(table.orderIndex),
    ],
);

export const osLearnProgress = pgTable(
    "OSLearnProgress",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        moduleId: text("moduleId")
            .notNull()
            .references(() => osLearnModules.id, { onDelete: "cascade" }),
        lessonsCompleted: integer("lessonsCompleted").notNull().default(0),
        totalLessons: integer("totalLessons").notNull().default(0),
        progressPercent: real("progressPercent").notNull().default(0),
        quizScore: integer("quizScore"),
        quizAttempts: integer("quizAttempts").notNull().default(0),
        isCompleted: boolean("isCompleted").notNull().default(false),
        completedAt: timestamp("completedAt"),
        startedAt: timestamp("startedAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("idx_oslp_userId_moduleId").on(table.userId, table.moduleId),
        index("idx_oslp_userId").on(table.userId),
        index("idx_oslp_moduleId").on(table.moduleId),
    ],
);

export const osLessonCompletions = pgTable(
    "OSLessonCompletion",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        lessonId: text("lessonId")
            .notNull()
            .references(() => osLearnLessons.id, { onDelete: "cascade" }),
        score: integer("score"),
        timeSpent: integer("timeSpent").notNull().default(0),
        commandsRun: jsonb("commandsRun"),
        isCompleted: boolean("isCompleted").notNull().default(false),
        completedAt: timestamp("completedAt"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("idx_oslc_userId_lessonId").on(table.userId, table.lessonId),
        index("idx_oslc_userId").on(table.userId),
        index("idx_oslc_lessonId").on(table.lessonId),
    ],
);

export const osCertificationExams = pgTable(
    "OSCertificationExam",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        status: osCertificationStatusEnum("status").notNull().default("NOT_STARTED"),
        quizScore: integer("quizScore"),
        codeScore: integer("codeScore"),
        scenarioScore: integer("scenarioScore"),
        totalScore: integer("totalScore"),
        passingScore: integer("passingScore").notNull().default(75),
        quizQuestions: jsonb("quizQuestions"),
        codeExercises: jsonb("codeExercises"),
        scenarioQuestions: jsonb("scenarioQuestions"),
        quizAnswers: jsonb("quizAnswers"),
        codeAnswers: jsonb("codeAnswers"),
        scenarioAnswers: jsonb("scenarioAnswers"),
        startedAt: timestamp("startedAt"),
        completedAt: timestamp("completedAt"),
        timeLimit: integer("timeLimit").notNull().default(60),
        attemptNumber: integer("attemptNumber").notNull().default(1),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_osce_userId").on(table.userId),
        index("idx_osce_status").on(table.status),
    ],
);

export const osCertifications = pgTable(
    "OSCertification",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        certificateId: text("certificateId").notNull().unique(),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        title: text("title").notNull().default("Open Source Contributor Certification"),
        score: integer("score").notNull(),
        issuedAt: timestamp("issuedAt").notNull().defaultNow(),
        expiresAt: timestamp("expiresAt").notNull(),
        isActive: boolean("isActive").notNull().default(true),
        verificationUrl: text("verificationUrl"),
        qrCode: text("qrCode"),
    },
    (table) => [
        index("idx_oscert_userId").on(table.userId),
        index("idx_oscert_certificateId").on(table.certificateId),
    ],
);

export const userOSStats = pgTable(
    "UserOSStats",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .unique()
            .references(() => users.id, { onDelete: "cascade" }),
        modulesCompleted: integer("modulesCompleted").notNull().default(0),
        lessonsCompleted: integer("lessonsCompleted").notNull().default(0),
        totalLearningTime: integer("totalLearningTime").notNull().default(0),
        isCertified: boolean("isCertified").notNull().default(false),
        certificationScore: integer("certificationScore"),
        certifiedAt: timestamp("certifiedAt"),
        totalProjects: integer("totalProjects").notNull().default(0),
        totalContributions: integer("totalContributions").notNull().default(0),
        prsSubmitted: integer("prsSubmitted").notNull().default(0),
        prsMerged: integer("prsMerged").notNull().default(0),
        issuesSolved: integer("issuesSolved").notNull().default(0),
        reviewsGiven: integer("reviewsGiven").notNull().default(0),
        avgPrScore: real("avgPrScore").notNull().default(0),
        acceptanceRate: real("acceptanceRate").notNull().default(0),
        totalBountyEarned: real("totalBountyEarned").notNull().default(0),
        pendingBounty: real("pendingBounty").notNull().default(0),
        osXp: integer("osXp").notNull().default(0),
        globalRank: integer("globalRank"),
        currentStreak: integer("currentStreak").notNull().default(0),
        longestStreak: integer("longestStreak").notNull().default(0),
        lastContributionAt: timestamp("lastContributionAt"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_uos_userId").on(table.userId),
        index("idx_uos_globalRank").on(table.globalRank),
    ],
);

export const osEarningsTransactions = pgTable(
    "OSEarningsTransaction",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").notNull(),
        amount: real("amount").notNull(),
        currency: text("currency").notNull().default("USD"),
        projectId: text("projectId"),
        issueId: text("issueId"),
        contributionId: text("contributionId"),
        status: text("status").notNull().default("COMPLETED"),
        payoutMethod: text("payoutMethod"),
        payoutDetails: jsonb("payoutDetails"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_oset_userId").on(table.userId),
        index("idx_oset_type").on(table.type),
        index("idx_oset_status").on(table.status),
    ],
);

export const osGitHubProfiles = pgTable(
    "OSGitHubProfile",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .unique()
            .references(() => users.id, { onDelete: "cascade" }),
        githubId: text("githubId").notNull().unique(),
        githubUsername: text("githubUsername").notNull(),
        githubName: text("githubName"),
        githubAvatar: text("githubAvatar"),
        githubBio: text("githubBio"),
        githubLocation: text("githubLocation"),
        githubCompany: text("githubCompany"),
        githubBlog: text("githubBlog"),
        publicRepos: integer("publicRepos").notNull().default(0),
        publicGists: integer("publicGists").notNull().default(0),
        followers: integer("followers").notNull().default(0),
        following: integer("following").notNull().default(0),
        accessToken: text("accessToken"),
        refreshToken: text("refreshToken"),
        tokenExpiresAt: timestamp("tokenExpiresAt"),
        scopes: text("scopes").array().notNull().default([]),
        lastSyncedAt: timestamp("lastSyncedAt"),
        syncError: text("syncError"),
        showOnProfile: boolean("showOnProfile").notNull().default(true),
        autoSync: boolean("autoSync").notNull().default(true),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_osgh_githubUsername").on(table.githubUsername),
        index("idx_osgh_githubId").on(table.githubId),
    ],
);

export const osLearnPracticeProjects = pgTable(
    "OSLearnPracticeProject",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        moduleId: text("moduleId"),
        slug: text("slug").notNull().unique(),
        title: text("title").notNull(),
        description: text("description").notNull(),
        techStack: text("techStack").array().notNull().default([]),
        category: osProjectCategoryEnum("category").notNull().default("WEB_DEVELOPMENT"),
        difficulty: osIssueDifficultyEnum("difficulty").notNull().default("EASY"),
        starterFiles: jsonb("starterFiles").notNull(),
        solutionFiles: jsonb("solutionFiles"),
        learningGoals: text("learningGoals").array().notNull().default([]),
        prerequisites: text("prerequisites").array().notNull().default([]),
        estimatedHours: integer("estimatedHours").notNull().default(2),
        orderIndex: integer("orderIndex").notNull().default(0),
        isActive: boolean("isActive").notNull().default(true),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_oslpp_slug").on(table.slug),
        index("idx_oslpp_difficulty").on(table.difficulty),
        index("idx_oslpp_orderIndex").on(table.orderIndex),
    ],
);

export const osLearnPracticeTasks = pgTable(
    "OSLearnPracticeTask",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        projectId: text("projectId")
            .notNull()
            .references(() => osLearnPracticeProjects.id, { onDelete: "cascade" }),
        title: text("title").notNull(),
        description: text("description").notNull(),
        requirements: text("requirements").array().notNull().default([]),
        hints: text("hints").array().notNull().default([]),
        targetFiles: text("targetFiles").array().notNull().default([]),
        validationRules: jsonb("validationRules"),
        expectedChanges: jsonb("expectedChanges"),
        difficulty: osIssueDifficultyEnum("difficulty").notNull().default("EASY"),
        estimatedMinutes: integer("estimatedMinutes").notNull().default(30),
        xpReward: integer("xpReward").notNull().default(50),
        orderIndex: integer("orderIndex").notNull().default(0),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_oslpt_projectId").on(table.projectId),
        index("idx_oslpt_orderIndex").on(table.orderIndex),
    ],
);

export const osLearnPracticeSubmissions = pgTable(
    "OSLearnPracticeSubmission",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId").notNull(),
        taskId: text("taskId")
            .notNull()
            .references(() => osLearnPracticeTasks.id, { onDelete: "cascade" }),
        submittedCode: jsonb("submittedCode").notNull(),
        isCorrect: boolean("isCorrect").notNull().default(false),
        score: integer("score"),
        feedback: text("feedback"),
        aiReview: jsonb("aiReview"),
        attemptNumber: integer("attemptNumber").notNull().default(1),
        xpEarned: integer("xpEarned").notNull().default(0),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_oslps_userId").on(table.userId),
        index("idx_oslps_taskId").on(table.taskId),
    ],
);

export const osLearnPracticeCompletions = pgTable(
    "OSLearnPracticeCompletion",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId").notNull(),
        projectId: text("projectId")
            .notNull()
            .references(() => osLearnPracticeProjects.id, { onDelete: "cascade" }),
        tasksCompleted: integer("tasksCompleted").notNull().default(0),
        totalTasks: integer("totalTasks").notNull().default(0),
        progressPercent: real("progressPercent").notNull().default(0),
        isCompleted: boolean("isCompleted").notNull().default(false),
        completedAt: timestamp("completedAt"),
        totalXpEarned: integer("totalXpEarned").notNull().default(0),
        totalAttempts: integer("totalAttempts").notNull().default(0),
        averageScore: real("averageScore").notNull().default(0),
        startedAt: timestamp("startedAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("idx_oslpcompl_userId_projectId").on(table.userId, table.projectId),
        index("idx_oslpcompl_userId").on(table.userId),
        index("idx_oslpcompl_projectId").on(table.projectId),
    ],
);

// ===========================
// Relations
// ===========================

export const openSourceProjectsRelations = relations(openSourceProjects, ({ one, many }) => ({
    maintainer: one(users, {
        fields: [openSourceProjects.maintainerId],
        references: [users.id],
        relationName: "OSProjectMaintainer",
    }),
    createdBy: one(users, {
        fields: [openSourceProjects.createdById],
        references: [users.id],
        relationName: "OSProjectCreator",
    }),
    setupGuide: one(osProjectSetupGuides),
    issues: many(osIssues),
    contributions: many(osContributions),
    contributors: many(osProjectContributors),
    leaderboard: many(osProjectLeaderboards),
}));

export const osProjectSetupGuidesRelations = relations(osProjectSetupGuides, ({ one }) => ({
    project: one(openSourceProjects, {
        fields: [osProjectSetupGuides.projectId],
        references: [openSourceProjects.id],
    }),
}));

export const osIssuesRelations = relations(osIssues, ({ one, many }) => ({
    project: one(openSourceProjects, {
        fields: [osIssues.projectId],
        references: [openSourceProjects.id],
    }),
    assignedTo: one(users, {
        fields: [osIssues.assignedToId],
        references: [users.id],
        relationName: "OSIssueAssignee",
    }),
    contributions: many(osContributions),
}));

export const osContributionsRelations = relations(osContributions, ({ one }) => ({
    project: one(openSourceProjects, {
        fields: [osContributions.projectId],
        references: [openSourceProjects.id],
    }),
    issue: one(osIssues, {
        fields: [osContributions.issueId],
        references: [osIssues.id],
    }),
    user: one(users, {
        fields: [osContributions.userId],
        references: [users.id],
        relationName: "OSContributions",
    }),
    reviewedBy: one(users, {
        fields: [osContributions.reviewedById],
        references: [users.id],
        relationName: "OSContributionReviewer",
    }),
}));

export const osProjectContributorsRelations = relations(osProjectContributors, ({ one }) => ({
    project: one(openSourceProjects, {
        fields: [osProjectContributors.projectId],
        references: [openSourceProjects.id],
    }),
    user: one(users, {
        fields: [osProjectContributors.userId],
        references: [users.id],
        relationName: "OSProjectContributors",
    }),
}));

export const osProjectLeaderboardsRelations = relations(osProjectLeaderboards, ({ one }) => ({
    project: one(openSourceProjects, {
        fields: [osProjectLeaderboards.projectId],
        references: [openSourceProjects.id],
    }),
    user: one(users, {
        fields: [osProjectLeaderboards.userId],
        references: [users.id],
        relationName: "OSProjectLeaderboard",
    }),
}));

export const osLearnModulesRelations = relations(osLearnModules, ({ many }) => ({
    lessons: many(osLearnLessons),
    progress: many(osLearnProgress),
}));

export const osLearnLessonsRelations = relations(osLearnLessons, ({ one, many }) => ({
    module: one(osLearnModules, {
        fields: [osLearnLessons.moduleId],
        references: [osLearnModules.id],
    }),
    completions: many(osLessonCompletions),
}));

export const osLearnProgressRelations = relations(osLearnProgress, ({ one }) => ({
    user: one(users, {
        fields: [osLearnProgress.userId],
        references: [users.id],
        relationName: "OSLearnProgress",
    }),
    module: one(osLearnModules, {
        fields: [osLearnProgress.moduleId],
        references: [osLearnModules.id],
    }),
}));

export const osLessonCompletionsRelations = relations(osLessonCompletions, ({ one }) => ({
    user: one(users, {
        fields: [osLessonCompletions.userId],
        references: [users.id],
        relationName: "OSLessonCompletions",
    }),
    lesson: one(osLearnLessons, {
        fields: [osLessonCompletions.lessonId],
        references: [osLearnLessons.id],
    }),
}));

export const osCertificationExamsRelations = relations(osCertificationExams, ({ one }) => ({
    user: one(users, {
        fields: [osCertificationExams.userId],
        references: [users.id],
        relationName: "OSCertificationExams",
    }),
}));

export const osCertificationsRelations = relations(osCertifications, ({ one }) => ({
    user: one(users, {
        fields: [osCertifications.userId],
        references: [users.id],
        relationName: "OSCertifications",
    }),
}));

export const userOSStatsRelations = relations(userOSStats, ({ one }) => ({
    user: one(users, {
        fields: [userOSStats.userId],
        references: [users.id],
        relationName: "UserOSStats",
    }),
}));

export const osEarningsTransactionsRelations = relations(osEarningsTransactions, ({ one }) => ({
    user: one(users, {
        fields: [osEarningsTransactions.userId],
        references: [users.id],
        relationName: "OSEarningsTransactions",
    }),
}));

export const osGitHubProfilesRelations = relations(osGitHubProfiles, ({ one }) => ({
    user: one(users, {
        fields: [osGitHubProfiles.userId],
        references: [users.id],
        relationName: "OSGitHubProfile",
    }),
}));

export const osLearnPracticeProjectsRelations = relations(osLearnPracticeProjects, ({ many }) => ({
    tasks: many(osLearnPracticeTasks),
    completions: many(osLearnPracticeCompletions),
}));

export const osLearnPracticeTasksRelations = relations(osLearnPracticeTasks, ({ one, many }) => ({
    project: one(osLearnPracticeProjects, {
        fields: [osLearnPracticeTasks.projectId],
        references: [osLearnPracticeProjects.id],
    }),
    submissions: many(osLearnPracticeSubmissions),
}));

export const osLearnPracticeSubmissionsRelations = relations(osLearnPracticeSubmissions, ({ one }) => ({
    task: one(osLearnPracticeTasks, {
        fields: [osLearnPracticeSubmissions.taskId],
        references: [osLearnPracticeTasks.id],
    }),
}));

export const osLearnPracticeCompletionsRelations = relations(osLearnPracticeCompletions, ({ one }) => ({
    project: one(osLearnPracticeProjects, {
        fields: [osLearnPracticeCompletions.projectId],
        references: [osLearnPracticeProjects.id],
    }),
}));
