import {
    pgTable,
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
import {
    users,
    mockCategoryEnum,
    mockLevelEnum,
} from "./schema.js";

// ===========================
// Tables
// ===========================

export const mockInterviewVoice = pgTable(
    "MockInterviewVoice",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        title: text("title").notNull(),
        description: text("description").notNull(),
        category: mockCategoryEnum("category").notNull().default("TECHNICAL"),
        level: mockLevelEnum("level").notNull().default("INTERMEDIATE"),
        duration: integer("duration").notNull().default(15),
        questionsCount: integer("questionsCount").notNull().default(5),
        isPublic: boolean("isPublic").notNull().default(true),
        isPredefined: boolean("isPredefined").notNull().default(false),
        byAdmin: boolean("byAdmin").notNull().default(false),
        knowledgeBase: text("knowledgeBase").notNull(),
        createdById: text("createdById").references(() => users.id, { onDelete: "cascade" }),
        includesResume: boolean("includesResume").notNull().default(false),
        isFeatured: boolean("isFeatured").notNull().default(false),
        baseCredits: integer("baseCredits").notNull().default(15),
        creditsRequired: integer("creditsRequired").notNull().default(15),
        tags: text("tags").array().notNull().default([]),
        popularity: integer("popularity").notNull().default(0),
        totalSessions: integer("totalSessions").notNull().default(0),
        averageRating: real("averageRating"),
        predefinedId: text("predefinedId").unique(),
        isUniversityMock: boolean("isUniversityMock").notNull().default(false),
        universityId: text("universityId"),
        teacherMemberId: text("teacherMemberId"),
        classIds: text("classIds").array().notNull().default([]),
        assignmentDeadline: timestamp("assignmentDeadline"),
        assignmentCredits: integer("assignmentCredits"),
        assignmentInstructions: text("assignmentInstructions"),
        pathfinderSubGoalId: text("pathfinderSubGoalId").unique(),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_mockInterviewVoice_category").on(table.category),
        index("idx_mockInterviewVoice_level").on(table.level),
        index("idx_mockInterviewVoice_isPublic").on(table.isPublic),
        index("idx_mockInterviewVoice_isPredefined").on(table.isPredefined),
        index("idx_mockInterviewVoice_createdById").on(table.createdById),
        index("idx_mockInterviewVoice_popularity").on(table.popularity),
        index("idx_mockInterviewVoice_universityId").on(table.universityId),
        index("idx_mockInterviewVoice_isUniversityMock").on(table.isUniversityMock),
    ],
);

export const mockVoiceSession = pgTable(
    "MockVoiceSession",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        mockId: text("mockId").notNull().references(() => mockInterviewVoice.id, { onDelete: "cascade" }),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        status: text("status").notNull().default("SCHEDULED"),
        conversationId: text("conversationId").unique(),
        agentId: text("agentId"),
        variables: jsonb("variables").notNull(),
        scheduledFor: timestamp("scheduledFor"),
        startedAt: timestamp("startedAt"),
        completedAt: timestamp("completedAt"),
        duration: integer("duration"),
        recordingUrl: text("recordingUrl"),
        transcriptUrl: text("transcriptUrl"),
        transcript: text("transcript"),
        aiAnalysis: jsonb("aiAnalysis"),
        userRating: integer("userRating"),
        userFeedback: text("userFeedback"),
        reviewedAt: timestamp("reviewedAt"),
        hasIssues: boolean("hasIssues").notNull().default(false),
        reportedIssues: text("reportedIssues").array().notNull().default([]),
        issueDetails: text("issueDetails"),
        issueReportedAt: timestamp("issueReportedAt"),
        creditsUsed: integer("creditsUsed").notNull(),
        metadata: jsonb("metadata"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_mockVoiceSession_mockId").on(table.mockId),
        index("idx_mockVoiceSession_userId").on(table.userId),
        index("idx_mockVoiceSession_status").on(table.status),
        index("idx_mockVoiceSession_conversationId").on(table.conversationId),
        index("idx_mockVoiceSession_scheduledFor").on(table.scheduledFor),
    ],
);

export const mockVoiceRating = pgTable(
    "MockVoiceRating",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        mockId: text("mockId").notNull().references(() => mockInterviewVoice.id, { onDelete: "cascade" }),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        rating: integer("rating").notNull(),
        review: text("review"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("uq_mockVoiceRating_mockId_userId").on(table.mockId, table.userId),
        index("idx_mockVoiceRating_mockId").on(table.mockId),
        index("idx_mockVoiceRating_userId").on(table.userId),
    ],
);

// ===========================
// Relations
// ===========================

export const mockInterviewVoiceRelations = relations(mockInterviewVoice, ({ one, many }) => ({
    createdBy: one(users, {
        fields: [mockInterviewVoice.createdById],
        references: [users.id],
        relationName: "MockVoiceCreator",
    }),
    sessions: many(mockVoiceSession),
    ratings: many(mockVoiceRating),
}));

export const mockVoiceSessionRelations = relations(mockVoiceSession, ({ one }) => ({
    mock: one(mockInterviewVoice, {
        fields: [mockVoiceSession.mockId],
        references: [mockInterviewVoice.id],
    }),
    user: one(users, {
        fields: [mockVoiceSession.userId],
        references: [users.id],
        relationName: "MockVoiceSessions",
    }),
}));

export const mockVoiceRatingRelations = relations(mockVoiceRating, ({ one }) => ({
    mock: one(mockInterviewVoice, {
        fields: [mockVoiceRating.mockId],
        references: [mockInterviewVoice.id],
    }),
    user: one(users, {
        fields: [mockVoiceRating.userId],
        references: [users.id],
        relationName: "MockVoiceRatings",
    }),
}));
