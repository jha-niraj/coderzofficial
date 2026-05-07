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
    date,
    real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./schema.js";

// ===========================
// Enums
// ===========================

export const pathfinderCategoryEnum = pgEnum("PathfinderCategory", [
    "DSA",
    "WEB_DEVELOPMENT",
    "FRONTEND",
    "BACKEND",
    "DEVOPS",
    "AI_ML",
    "DATABASE",
    "SYSTEM_DESIGN",
    "MOBILE",
    "OTHER",
]);

export const pathfinderLevelEnum = pgEnum("PathfinderLevel", [
    "BEGINNER",
    "INTERMEDIATE",
    "ADVANCED",
    "EXPERT",
]);

export const pathfinderStatusEnum = pgEnum("PathfinderStatus", [
    "ACTIVE",
    "VERIFICATION",
    "COMPLETED",
    "FAILED",
    "ABANDONED",
]);

export const pathfinderGoalDurationEnum = pgEnum("PathfinderGoalDuration", [
    "ONE_WEEK",
    "FORTNIGHT",
    "ONE_MONTH",
    "TWO_MONTHS",
    "THREE_MONTHS",
    "SIX_MONTHS",
    "CUSTOM",
]);

export const verificationSectionStatusEnum = pgEnum("VerificationSectionStatus", [
    "LOCKED",
    "PENDING",
    "IN_PROGRESS",
    "COMPLETED",
    "FAILED",
]);

export const subGoalStatusEnum = pgEnum("SubGoalStatus", [
    "PENDING",
    "IN_PROGRESS",
    "COMPLETED",
    "SKIPPED",
]);

// ===========================
// Tables
// ===========================

export const pathfinderGroups = pgTable(
    "PathfinderGroup",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        emoji: text("emoji").default("📁"),
        color: text("color").default("#7c3aed"),
        description: text("description"),
        order: integer("order").notNull().default(0),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("idx_pfg_userId_name").on(table.userId, table.name),
        index("idx_pfg_userId").on(table.userId),
    ],
);

export const pathfinderGoals = pgTable(
    "PathfinderGoal",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        groupId: text("groupId").references(() => pathfinderGroups.id, { onDelete: "set null" }),
        title: text("title").notNull(),
        slug: text("slug").notNull(),
        category: pathfinderCategoryEnum("category").notNull(),
        level: pathfinderLevelEnum("level").notNull(),
        focusAreas: text("focusAreas").array().notNull().default([]),
        targetDate: timestamp("targetDate"),
        duration: pathfinderGoalDurationEnum("duration"),
        isPublic: boolean("isPublic").notNull().default(true),
        forkedFromId: text("forkedFromId"),
        creditPrice: integer("creditPrice"),
        overview: text("overview"),
        estimatedDays: integer("estimatedDays"),
        estimatedHours: integer("estimatedHours"),
        learningObjectives: text("learningObjectives").array().notNull().default([]),
        prerequisites: text("prerequisites").array().notNull().default([]),
        status: pathfinderStatusEnum("status").notNull().default("ACTIVE"),
        progressPercent: integer("progressPercent").notNull().default(0),
        totalSubGoals: integer("totalSubGoals").notNull().default(0),
        completedSubGoals: integer("completedSubGoals").notNull().default(0),
        totalQuizAnswered: integer("totalQuizAnswered").notNull().default(0),
        totalCodingSolved: integer("totalCodingSolved").notNull().default(0),
        streakDays: integer("streakDays").notNull().default(0),
        lastActivityAt: timestamp("lastActivityAt"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
        startedAt: timestamp("startedAt"),
        verificationStartedAt: timestamp("verificationStartedAt"),
        completedAt: timestamp("completedAt"),
    },
    (table) => [
        uniqueIndex("idx_pfgoal_userId_slug").on(table.userId, table.slug),
        index("idx_pfgoal_userId").on(table.userId),
        index("idx_pfgoal_groupId").on(table.groupId),
        index("idx_pfgoal_status").on(table.status),
        index("idx_pfgoal_category").on(table.category),
        index("idx_pfgoal_createdAt").on(table.createdAt),
    ],
);

export const pathfinderDailySessions = pgTable(
    "PathfinderDailySession",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        goalId: text("goalId")
            .notNull()
            .references(() => pathfinderGoals.id, { onDelete: "cascade" }),
        userId: text("userId").notNull(),
        date: date("date").notNull(),
        totalSubGoals: integer("totalSubGoals").notNull().default(0),
        completedSubGoals: integer("completedSubGoals").notNull().default(0),
        totalQuizQuestions: integer("totalQuizQuestions").notNull().default(0),
        correctQuizAnswers: integer("correctQuizAnswers").notNull().default(0),
        totalCodingProblems: integer("totalCodingProblems").notNull().default(0),
        solvedCodingProblems: integer("solvedCodingProblems").notNull().default(0),
        totalTimeMinutes: integer("totalTimeMinutes").notNull().default(0),
        notes: text("notes"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("idx_pfds_goalId_date").on(table.goalId, table.date),
        index("idx_pfds_goalId").on(table.goalId),
        index("idx_pfds_userId").on(table.userId),
        index("idx_pfds_date").on(table.date),
    ],
);

export const pathfinderSubGoals = pgTable(
    "PathfinderSubGoal",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        goalId: text("goalId")
            .notNull()
            .references(() => pathfinderGoals.id, { onDelete: "cascade" }),
        sessionId: text("sessionId")
            .notNull()
            .references(() => pathfinderDailySessions.id, { onDelete: "cascade" }),
        title: text("title").notNull(),
        description: text("description"),
        source: text("source").notNull().default("text"),
        voiceTranscript: text("voiceTranscript"),
        status: subGoalStatusEnum("status").notNull().default("PENDING"),
        order: integer("order").notNull().default(0),
        isAIGenerated: boolean("isAIGenerated").notNull().default(false),
        isContentLoaded: boolean("isContentLoaded").notNull().default(false),
        aiCodingProblem: jsonb("aiCodingProblem"),
        hasCoding: boolean("hasCoding").notNull().default(false),
        // studioId is a soft FK to Studio (defined in studio.ts) — no .references() to avoid circular imports
        studioId: text("studioId").unique(),
        quizCompleted: boolean("quizCompleted").notNull().default(false),
        quizScore: integer("quizScore"),
        codingCompleted: boolean("codingCompleted").notNull().default(false),
        codingPassed: boolean("codingPassed").notNull().default(false),
        codingProgress: jsonb("codingProgress"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
        completedAt: timestamp("completedAt"),
    },
    (table) => [
        index("idx_pfsg_goalId").on(table.goalId),
        index("idx_pfsg_sessionId").on(table.sessionId),
        index("idx_pfsg_status").on(table.status),
    ],
);

export const pathfinderVerifications = pgTable(
    "PathfinderVerification",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        goalId: text("goalId")
            .notNull()
            .unique()
            .references(() => pathfinderGoals.id, { onDelete: "cascade" }),
        overallScore: integer("overallScore"),
        passed: boolean("passed").notNull().default(false),
        quizStatus: verificationSectionStatusEnum("quizStatus").notNull().default("PENDING"),
        codingStatus: verificationSectionStatusEnum("codingStatus").notNull().default("LOCKED"),
        mockStatus: verificationSectionStatusEnum("mockStatus").notNull().default("LOCKED"),
        projectStatus: verificationSectionStatusEnum("projectStatus").notNull().default("LOCKED"),
        quizScore: integer("quizScore"),
        codingScore: integer("codingScore"),
        mockScore: integer("mockScore"),
        projectComplete: boolean("projectComplete").notNull().default(false),
        quizAttempts: integer("quizAttempts").notNull().default(0),
        codingAttempts: integer("codingAttempts").notNull().default(0),
        mockAttempts: integer("mockAttempts").notNull().default(0),
        verificationCreditsCharged: integer("verificationCreditsCharged").notNull().default(0),
        generatedPlan: jsonb("generatedPlan"),
        mockInterviewId: text("mockInterviewId"),
        mockSessionId: text("mockSessionId"),
        projectType: text("projectType"),
        projectId: text("projectId"),
        startedAt: timestamp("startedAt").notNull().defaultNow(),
        quizCompletedAt: timestamp("quizCompletedAt"),
        codingCompletedAt: timestamp("codingCompletedAt"),
        mockCompletedAt: timestamp("mockCompletedAt"),
        projectCompletedAt: timestamp("projectCompletedAt"),
        completedAt: timestamp("completedAt"),
    },
    (table) => [
        index("idx_pfv_goalId").on(table.goalId),
    ],
);

export const pathfinderQuizAttempts = pgTable(
    "PathfinderQuizAttempt",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        goalId: text("goalId")
            .notNull()
            .references(() => pathfinderGoals.id, { onDelete: "cascade" }),
        userId: text("userId").notNull(),
        quizType: text("quizType").notNull(),
        dayNumber: integer("dayNumber"),
        score: integer("score").notNull(),
        correctCount: integer("correctCount").notNull(),
        totalQuestions: integer("totalQuestions").notNull(),
        timeTaken: integer("timeTaken").notNull(),
        answers: jsonb("answers").notNull(),
        startedAt: timestamp("startedAt").notNull(),
        completedAt: timestamp("completedAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_pfqa_goalId").on(table.goalId),
        index("idx_pfqa_userId").on(table.userId),
        index("idx_pfqa_quizType").on(table.quizType),
    ],
);

export const pathfinderCodingSubmissions = pgTable(
    "PathfinderCodingSubmission",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        goalId: text("goalId")
            .notNull()
            .references(() => pathfinderGoals.id, { onDelete: "cascade" }),
        userId: text("userId").notNull(),
        submissionType: text("submissionType").notNull(),
        dayNumber: integer("dayNumber"),
        problemId: text("problemId").notNull(),
        code: text("code").notNull(),
        language: text("language").notNull(),
        passed: boolean("passed").notNull().default(false),
        testsPassed: integer("testsPassed").notNull().default(0),
        totalTests: integer("totalTests").notNull().default(0),
        executionTime: integer("executionTime"),
        testResults: jsonb("testResults"),
        submittedAt: timestamp("submittedAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_pfcs_goalId").on(table.goalId),
        index("idx_pfcs_userId").on(table.userId),
        index("idx_pfcs_problemId").on(table.problemId),
    ],
);

export const pathfinderUsageLedger = pgTable(
    "PathfinderUsageLedger",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        goalId: text("goalId")
            .notNull()
            .references(() => pathfinderGoals.id, { onDelete: "cascade" }),
        userId: text("userId").notNull(),
        action: text("action").notNull(),
        provider: text("provider").notNull(),
        inputTokens: integer("inputTokens").notNull().default(0),
        outputTokens: integer("outputTokens").notNull().default(0),
        creditsCost: integer("creditsCost").notNull().default(0),
        deducted: boolean("deducted").notNull().default(false),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_pful_goalId").on(table.goalId),
        index("idx_pful_userId").on(table.userId),
        index("idx_pful_createdAt").on(table.createdAt),
    ],
);

export const pathfinderGoalPurchases = pgTable(
    "PathfinderGoalPurchase",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        goalId: text("goalId")
            .notNull()
            .references(() => pathfinderGoals.id, { onDelete: "cascade" }),
        buyerId: text("buyerId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        creditsPaid: integer("creditsPaid").notNull(),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("idx_pfgp_goalId_buyerId").on(table.goalId, table.buyerId),
        index("idx_pfgp_goalId").on(table.goalId),
        index("idx_pfgp_buyerId").on(table.buyerId),
    ],
);

// ===========================
// Relations
// ===========================

export const pathfinderGroupsRelations = relations(pathfinderGroups, ({ one, many }) => ({
    user: one(users, {
        fields: [pathfinderGroups.userId],
        references: [users.id],
        relationName: "UserPathfinderGroups",
    }),
    goals: many(pathfinderGoals),
}));

export const pathfinderGoalsRelations = relations(pathfinderGoals, ({ one, many }) => ({
    user: one(users, {
        fields: [pathfinderGoals.userId],
        references: [users.id],
        relationName: "UserPathfinderGoals",
    }),
    group: one(pathfinderGroups, {
        fields: [pathfinderGoals.groupId],
        references: [pathfinderGroups.id],
        relationName: "GroupGoals",
    }),
    subGoals: many(pathfinderSubGoals),
    dailySessions: many(pathfinderDailySessions),
    verification: one(pathfinderVerifications),
    quizAttempts: many(pathfinderQuizAttempts),
    codingSubmissions: many(pathfinderCodingSubmissions),
    usageLedger: many(pathfinderUsageLedger),
    purchases: many(pathfinderGoalPurchases),
}));

export const pathfinderDailySessionsRelations = relations(pathfinderDailySessions, ({ one, many }) => ({
    goal: one(pathfinderGoals, {
        fields: [pathfinderDailySessions.goalId],
        references: [pathfinderGoals.id],
    }),
    subGoals: many(pathfinderSubGoals),
}));

export const pathfinderSubGoalsRelations = relations(pathfinderSubGoals, ({ one }) => ({
    goal: one(pathfinderGoals, {
        fields: [pathfinderSubGoals.goalId],
        references: [pathfinderGoals.id],
    }),
    session: one(pathfinderDailySessions, {
        fields: [pathfinderSubGoals.sessionId],
        references: [pathfinderDailySessions.id],
    }),
}));

export const pathfinderVerificationsRelations = relations(pathfinderVerifications, ({ one }) => ({
    goal: one(pathfinderGoals, {
        fields: [pathfinderVerifications.goalId],
        references: [pathfinderGoals.id],
    }),
}));

export const pathfinderQuizAttemptsRelations = relations(pathfinderQuizAttempts, ({ one }) => ({
    goal: one(pathfinderGoals, {
        fields: [pathfinderQuizAttempts.goalId],
        references: [pathfinderGoals.id],
    }),
}));

export const pathfinderCodingSubmissionsRelations = relations(pathfinderCodingSubmissions, ({ one }) => ({
    goal: one(pathfinderGoals, {
        fields: [pathfinderCodingSubmissions.goalId],
        references: [pathfinderGoals.id],
    }),
}));

export const pathfinderUsageLedgerRelations = relations(pathfinderUsageLedger, ({ one }) => ({
    goal: one(pathfinderGoals, {
        fields: [pathfinderUsageLedger.goalId],
        references: [pathfinderGoals.id],
    }),
}));

export const pathfinderGoalPurchasesRelations = relations(pathfinderGoalPurchases, ({ one }) => ({
    goal: one(pathfinderGoals, {
        fields: [pathfinderGoalPurchases.goalId],
        references: [pathfinderGoals.id],
    }),
    buyer: one(users, {
        fields: [pathfinderGoalPurchases.buyerId],
        references: [users.id],
        relationName: "PathfinderGoalPurchases",
    }),
}));
