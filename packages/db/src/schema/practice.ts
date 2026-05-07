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
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./schema";

// ===========================
// Enums
// ===========================

export const practiceModuleEnum = pgEnum("PracticeModule", [
    "DSA",
    "SYSTEM_DESIGN",
    "WEB_FRONTEND",
    "WEB_BACKEND",
]);

export const practiceDifficultyEnum = pgEnum("PracticeDifficulty", [
    "EASY",
    "MEDIUM",
    "HARD",
]);

export const practiceSessionStatusEnum = pgEnum("PracticeSessionStatus", [
    "NOT_STARTED",
    "IN_PROGRESS",
    "COMPLETED",
]);

export const practiceModeEnum = pgEnum("PracticeMode", [
    "EXAM",
    "ASSIST",
]);

// ===========================
// Tables
// ===========================

export const practiceProblem = pgTable(
    "PracticeProblem",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        slug: text("slug").notNull().unique(),
        title: text("title").notNull(),
        description: text("description").notNull(),
        module: practiceModuleEnum("module").notNull(),
        category: text("category").notNull(),
        difficulty: practiceDifficultyEnum("difficulty").notNull(),
        requirements: text("requirements").array().notNull().default([]),
        hints: text("hints").array().notNull().default([]),
        starterCode: text("starterCode"),
        starterCss: text("starterCss"),
        testCases: jsonb("testCases"),
        tags: text("tags").array().notNull().default([]),
        sortOrder: integer("sortOrder").notNull().default(0),
        isActive: boolean("isActive").notNull().default(true),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_practiceProblem_module_category").on(table.module, table.category),
        index("idx_practiceProblem_module_difficulty").on(table.module, table.difficulty),
        index("idx_practiceProblem_slug").on(table.slug),
    ],
);

export const practiceUserSession = pgTable(
    "PracticeUserSession",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        problemId: text("problemId").notNull().references(() => practiceProblem.id, { onDelete: "cascade" }),
        module: practiceModuleEnum("module").notNull(),
        mode: practiceModeEnum("mode").notNull(),
        status: practiceSessionStatusEnum("status").notNull().default("IN_PROGRESS"),
        code: text("code"),
        cssCode: text("cssCode"),
        canvasData: jsonb("canvasData"),
        language: text("language").default("javascript"),
        attempts: integer("attempts").notNull().default(0),
        bestScore: integer("bestScore").notNull().default(0),
        lastFeedback: text("lastFeedback"),
        requirementsMet: jsonb("requirementsMet"),
        totalTimeSeconds: integer("totalTimeSeconds").notNull().default(0),
        startedAt: timestamp("startedAt").notNull().defaultNow(),
        completedAt: timestamp("completedAt"),
        voiceUsed: boolean("voiceUsed").notNull().default(false),
        chatHistory: jsonb("chatHistory"),
        xpAwarded: integer("xpAwarded").notNull().default(0),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("uq_practiceUserSession_userId_problemId_mode").on(table.userId, table.problemId, table.mode),
        index("idx_practiceUserSession_userId_module").on(table.userId, table.module),
        index("idx_practiceUserSession_userId_problemId").on(table.userId, table.problemId),
        index("idx_practiceUserSession_userId_module_status").on(table.userId, table.module, table.status),
    ],
);

export const practiceModuleProgress = pgTable(
    "PracticeModuleProgress",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        module: practiceModuleEnum("module").notNull(),
        totalProblems: integer("totalProblems").notNull().default(0),
        completed: integer("completed").notNull().default(0),
        inProgress: integer("inProgress").notNull().default(0),
        totalXP: integer("totalXP").notNull().default(0),
        currentStreak: integer("currentStreak").notNull().default(0),
        longestStreak: integer("longestStreak").notNull().default(0),
        lastPracticedAt: timestamp("lastPracticedAt"),
        easyCompleted: integer("easyCompleted").notNull().default(0),
        mediumCompleted: integer("mediumCompleted").notNull().default(0),
        hardCompleted: integer("hardCompleted").notNull().default(0),
        averageScore: integer("averageScore").notNull().default(0),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("uq_practiceModuleProgress_userId_module").on(table.userId, table.module),
        index("idx_practiceModuleProgress_userId").on(table.userId),
        index("idx_practiceModuleProgress_module").on(table.module),
    ],
);

export const practiceLeaderboard = pgTable(
    "PracticeLeaderboard",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        module: practiceModuleEnum("module").notNull(),
        rank: integer("rank").notNull().default(0),
        totalXP: integer("totalXP").notNull().default(0),
        completed: integer("completed").notNull().default(0),
        averageScore: integer("averageScore").notNull().default(0),
        streak: integer("streak").notNull().default(0),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("uq_practiceLeaderboard_userId_module").on(table.userId, table.module),
        index("idx_practiceLeaderboard_module").on(table.module),
        index("idx_practiceLeaderboard_module_rank").on(table.module, table.rank),
    ],
);

// ===========================
// Relations
// ===========================

export const practiceProblemRelations = relations(practiceProblem, ({ many }) => ({
    sessions: many(practiceUserSession),
}));

export const practiceUserSessionRelations = relations(practiceUserSession, ({ one }) => ({
    user: one(users, {
        fields: [practiceUserSession.userId],
        references: [users.id],
        relationName: "UserPracticeSessions",
    }),
    problem: one(practiceProblem, {
        fields: [practiceUserSession.problemId],
        references: [practiceProblem.id],
    }),
}));

export const practiceModuleProgressRelations = relations(practiceModuleProgress, ({ one }) => ({
    user: one(users, {
        fields: [practiceModuleProgress.userId],
        references: [users.id],
        relationName: "UserPracticeProgress",
    }),
}));

export const practiceLeaderboardRelations = relations(practiceLeaderboard, ({ one }) => ({
    user: one(users, {
        fields: [practiceLeaderboard.userId],
        references: [users.id],
        relationName: "UserPracticeLeaderboard",
    }),
}));
