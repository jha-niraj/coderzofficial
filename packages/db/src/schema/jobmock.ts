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
import { companies } from "./hiring.js";

// ===========================
// Enums
// ===========================

export const interviewRoundTypeEnum = pgEnum("InterviewRoundType", [
    "PHONE_SCREEN",
    "TECHNICAL_CODING",
    "SYSTEM_DESIGN",
    "BEHAVIORAL",
    "TAKE_HOME",
    "PANEL",
    "HIRING_MANAGER",
    "CULTURE_FIT",
    "HR_FINAL",
    "CUSTOM",
]);

export const interviewFormatEnum = pgEnum("InterviewFormat", [
    "VOICE",
    "VIDEO",
    "IN_PERSON",
    "TAKE_HOME",
    "LIVE_CODING",
    "WHITEBOARD",
]);

export const jobMockSessionTypeEnum = pgEnum("JobMockSessionType", [
    "VOICE",
    "CODING",
    "SYSTEM_DESIGN",
    "BEHAVIORAL",
]);

export const jobMockStatusEnum = pgEnum("JobMockStatus", [
    "SCHEDULED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "FAILED",
]);

// ===========================
// Tables
// ===========================

export const interviewProcesses = pgTable(
    "InterviewProcess",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        companyId: text("companyId")
            .notNull()
            .references(() => companies.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        description: text("description"),
        isDefault: boolean("isDefault").notNull().default(false),
        estimatedDurationWeeks: real("estimatedDurationWeeks"),
        avgTimeToHireDays: integer("avgTimeToHireDays"),
        responseRatePercent: real("responseRatePercent"),
        applicationToInterviewPercent: real("applicationToInterviewPercent"),
        interviewToOfferPercent: real("interviewToOfferPercent"),
        isActive: boolean("isActive").notNull().default(true),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_interviewProcess_companyId").on(table.companyId),
        index("idx_interviewProcess_isDefault").on(table.isDefault),
    ],
);

export const interviewRounds = pgTable(
    "InterviewRound",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        processId: text("processId")
            .notNull()
            .references(() => interviewProcesses.id, { onDelete: "cascade" }),
        roundNumber: integer("roundNumber").notNull(),
        roundType: interviewRoundTypeEnum("roundType").notNull(),
        title: text("title").notNull(),
        durationMinutes: integer("durationMinutes"),
        format: interviewFormatEnum("format").notNull().default("VIDEO"),
        description: text("description").notNull(),
        whatToExpect: jsonb("whatToExpect"),
        sampleQuestions: jsonb("sampleQuestions"),
        evaluationCriteria: jsonb("evaluationCriteria"),
        topicsCovered: jsonb("topicsCovered"),
        tipsForCandidates: jsonb("tipsForCandidates"),
        passRatePercent: real("passRatePercent"),
        daysToNextRound: integer("daysToNextRound"),
        internalNotes: text("internalNotes"),
        interviewerGuide: text("interviewerGuide"),
        hasMockInterview: boolean("hasMockInterview").notNull().default(true),
        mockKnowledgeBase: text("mockKnowledgeBase"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("uq_interviewRound_processId_roundNumber").on(
            table.processId,
            table.roundNumber,
        ),
        index("idx_interviewRound_processId").on(table.processId),
        index("idx_interviewRound_roundType").on(table.roundType),
    ],
);

export const jobMockSessions = pgTable(
    "JobMockSession",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        jobId: text("jobId"),
        companyId: text("companyId")
            .notNull()
            .references(() => companies.id, { onDelete: "cascade" }),
        roundId: text("roundId")
            .notNull()
            .references(() => interviewRounds.id, { onDelete: "cascade" }),
        sessionType: jobMockSessionTypeEnum("sessionType").notNull().default("VOICE"),
        status: jobMockStatusEnum("status").notNull().default("SCHEDULED"),
        conversationId: text("conversationId").unique(),
        agentId: text("agentId"),
        variables: jsonb("variables"),
        scheduledFor: timestamp("scheduledFor"),
        startedAt: timestamp("startedAt"),
        completedAt: timestamp("completedAt"),
        durationSeconds: integer("durationSeconds"),
        recordingUrl: text("recordingUrl"),
        transcriptUrl: text("transcriptUrl"),
        transcript: text("transcript"),
        codeSubmission: text("codeSubmission"),
        codeLanguage: text("codeLanguage"),
        testResults: jsonb("testResults"),
        diagramUrl: text("diagramUrl"),
        designNotes: text("designNotes"),
        overallScore: integer("overallScore"),
        aiAnalysis: jsonb("aiAnalysis"),
        categoryScores: jsonb("categoryScores"),
        strengths: jsonb("strengths"),
        improvements: jsonb("improvements"),
        percentileRank: integer("percentileRank"),
        trend: text("trend"),
        userRating: integer("userRating"),
        userFeedback: text("userFeedback"),
        creditsUsed: integer("creditsUsed").notNull().default(15),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_jobMockSession_userId").on(table.userId),
        index("idx_jobMockSession_jobId").on(table.jobId),
        index("idx_jobMockSession_companyId").on(table.companyId),
        index("idx_jobMockSession_roundId").on(table.roundId),
        index("idx_jobMockSession_status").on(table.status),
        index("idx_jobMockSession_conversationId").on(table.conversationId),
    ],
);

export const interviewPrepProgress = pgTable(
    "InterviewPrepProgress",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        applicationId: text("applicationId").notNull().unique(),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        overallReadinessScore: integer("overallReadinessScore").notNull().default(0),
        targetReadinessScore: integer("targetReadinessScore").notNull().default(80),
        roundsCompleted: integer("roundsCompleted").notNull().default(0),
        totalRounds: integer("totalRounds").notNull().default(0),
        lastPracticedAt: timestamp("lastPracticedAt"),
        totalPracticeSessions: integer("totalPracticeSessions").notNull().default(0),
        totalPracticeMinutes: integer("totalPracticeMinutes").notNull().default(0),
        bestScores: jsonb("bestScores"),
        nextRecommendedRound: text("nextRecommendedRound"),
        recommendedResources: jsonb("recommendedResources"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_interviewPrepProgress_userId").on(table.userId),
    ],
);

// ===========================
// Relations
// ===========================

export const interviewProcessesRelations = relations(interviewProcesses, ({ one, many }) => ({
    company: one(companies, {
        fields: [interviewProcesses.companyId],
        references: [companies.id],
    }),
    rounds: many(interviewRounds),
}));

export const interviewRoundsRelations = relations(interviewRounds, ({ one, many }) => ({
    process: one(interviewProcesses, {
        fields: [interviewRounds.processId],
        references: [interviewProcesses.id],
    }),
    mockSessions: many(jobMockSessions),
}));

export const jobMockSessionsRelations = relations(jobMockSessions, ({ one }) => ({
    user: one(users, {
        fields: [jobMockSessions.userId],
        references: [users.id],
        relationName: "UserJobMockSessions",
    }),
    company: one(companies, {
        fields: [jobMockSessions.companyId],
        references: [companies.id],
    }),
    round: one(interviewRounds, {
        fields: [jobMockSessions.roundId],
        references: [interviewRounds.id],
    }),
}));

export const interviewPrepProgressRelations = relations(interviewPrepProgress, ({ one }) => ({
    user: one(users, {
        fields: [interviewPrepProgress.userId],
        references: [users.id],
        relationName: "UserInterviewPrepProgress",
    }),
}));
