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

export const studioCategoryEnum = pgEnum("StudioCategory", [
    "GENERAL",
    "PROGRAMMING",
    "WEB_DEVELOPMENT",
    "DATA_SCIENCE",
    "DEVOPS",
    "MOBILE_DEVELOPMENT",
    "SYSTEM_DESIGN",
    "INTERVIEW_PREP",
    "PROJECT_NOTES",
    "TUTORIAL",
    "COURSE_NOTES",
    "OTHER",
]);

export const studioBlockTypeEnum = pgEnum("StudioBlockType", [
    "TEXT",
    "HEADING",
    "CODE",
    "QUIZ",
    "FLASHCARD",
    "IMAGE",
    "VIDEO",
    "PRACTICE",
    "MOCK_INTERVIEW",
    "EMBED",
    "DIVIDER",
    "CALLOUT",
    "BULLET_LIST",
    "NUMBERED_LIST",
]);

export const studioVisibilityEnum = pgEnum("StudioVisibility", [
    "PRIVATE",
    "PUBLIC",
    "COMMUNITY",
]);

export const studioSourceEnum = pgEnum("StudioSource", [
    "MANUAL",
    "PATHFINDER",
    "SPACE",
]);

export const studioStepTypeEnum = pgEnum("StudioStepType", [
    "EXPLANATION",
    "NOTE",
    "QUIZ",
    "CODE",
    "IMAGE",
    "VIDEO",
    "DOCUMENT",
    "PROJECT",
    "MOCK_INTERVIEW",
    "FLASHCARD",
]);

export const studioStepStatusEnum = pgEnum("StudioStepStatus", [
    "DRAFT",
    "COMPLETED",
    "ARCHIVED",
]);

export const contentSourceEnum = pgEnum("ContentSource", [
    "AI",
    "USER",
]);

export const studioMediaTypeEnum = pgEnum("StudioMediaType", [
    "IMAGE",
    "VIDEO",
    "DIAGRAM",
    "UPLOAD",
]);

// ===========================
// Tables
// ===========================

export const studios = pgTable(
    "Studio",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        slug: text("slug").unique(),
        title: text("title").notNull(),
        description: text("description"),
        emoji: text("emoji").default("📚"),
        coverImage: text("coverImage"),
        source: studioSourceEnum("source").notNull().default("MANUAL"),
        sourceId: text("sourceId"),
        stepCount: integer("stepCount").notNull().default(0),
        category: studioCategoryEnum("category").notNull().default("GENERAL"),
        tags: text("tags").array().notNull().default([]),
        visibility: studioVisibilityEnum("visibility").notNull().default("PRIVATE"),
        isTemplate: boolean("isTemplate").notNull().default(false),
        views: integer("views").notNull().default(0),
        clones: integer("clones").notNull().default(0),
        likes: integer("likes").notNull().default(0),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        projectId: text("projectId"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
        lastEditedAt: timestamp("lastEditedAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_studio_userId").on(table.userId),
        index("idx_studio_category").on(table.category),
        index("idx_studio_visibility").on(table.visibility),
        index("idx_studio_source_sourceId").on(table.source, table.sourceId),
    ],
);

export const studioSteps = pgTable(
    "StudioStep",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        studioId: text("studioId")
            .notNull()
            .references(() => studios.id, { onDelete: "cascade" }),
        orderNumber: integer("orderNumber").notNull(),
        type: studioStepTypeEnum("type").notNull(),
        content: text("content"),
        metadata: jsonb("metadata").notNull().default({}),
        source: contentSourceEnum("source").notNull(),
        status: studioStepStatusEnum("status").notNull().default("COMPLETED"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_ss_studioId_orderNumber").on(table.studioId, table.orderNumber),
        index("idx_ss_type").on(table.type),
    ],
);

export const studioQuizzes = pgTable(
    "StudioQuiz",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        blockId: text("blockId").notNull(),
        title: text("title").notNull(),
        questions: jsonb("questions").notNull(),
        timeLimit: integer("timeLimit"),
        shuffleQuestions: boolean("shuffleQuestions").notNull().default(true),
        showCorrectAnswers: boolean("showCorrectAnswers").notNull().default(true),
        studioId: text("studioId")
            .notNull()
            .references(() => studios.id, { onDelete: "cascade" }),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_sq_studioId").on(table.studioId),
        index("idx_sq_blockId").on(table.blockId),
    ],
);

export const studioQuizAttempts = pgTable(
    "StudioQuizAttempt",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        quizId: text("quizId")
            .notNull()
            .references(() => studioQuizzes.id, { onDelete: "cascade" }),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        score: integer("score").notNull(),
        maxScore: integer("maxScore").notNull(),
        answers: jsonb("answers").notNull(),
        timeTaken: integer("timeTaken"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_sqa_quizId").on(table.quizId),
        index("idx_sqa_userId").on(table.userId),
    ],
);

export const studioFlashcardDecks = pgTable(
    "StudioFlashcardDeck",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        blockId: text("blockId").notNull(),
        title: text("title").notNull(),
        cards: jsonb("cards").notNull(),
        studioId: text("studioId")
            .notNull()
            .references(() => studios.id, { onDelete: "cascade" }),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_sfd_studioId").on(table.studioId),
        index("idx_sfd_blockId").on(table.blockId),
    ],
);

export const studioFlashcardSessions = pgTable(
    "StudioFlashcardSession",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        deckId: text("deckId")
            .notNull()
            .references(() => studioFlashcardDecks.id, { onDelete: "cascade" }),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        cardsStudied: integer("cardsStudied").notNull(),
        correctCount: integer("correctCount").notNull(),
        studyTime: integer("studyTime").notNull(),
        cardProgress: jsonb("cardProgress").notNull(),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_sfs_deckId").on(table.deckId),
        index("idx_sfs_userId").on(table.userId),
    ],
);

export const studioCodeBlocks = pgTable(
    "StudioCodeBlock",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        blockId: text("blockId").notNull(),
        language: text("language").notNull(),
        code: text("code").notNull(),
        isPractice: boolean("isPractice").notNull().default(false),
        problemTitle: text("problemTitle"),
        problemDescription: text("problemDescription"),
        testCases: jsonb("testCases"),
        hints: text("hints").array().notNull().default([]),
        solution: text("solution"),
        studioId: text("studioId")
            .notNull()
            .references(() => studios.id, { onDelete: "cascade" }),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_scb_studioId").on(table.studioId),
        index("idx_scb_blockId").on(table.blockId),
    ],
);

export const studioMediaBlocks = pgTable(
    "StudioMediaBlock",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        blockId: text("blockId").notNull(),
        type: studioMediaTypeEnum("type").notNull(),
        url: text("url").notNull(),
        prompt: text("prompt"),
        width: integer("width"),
        height: integer("height"),
        duration: integer("duration"),
        studioId: text("studioId")
            .notNull()
            .references(() => studios.id, { onDelete: "cascade" }),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_smb_studioId").on(table.studioId),
        index("idx_smb_blockId").on(table.blockId),
    ],
);

export const studioChatMessages = pgTable(
    "StudioChatMessage",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        studioId: text("studioId")
            .notNull()
            .references(() => studios.id, { onDelete: "cascade" }),
        role: text("role").notNull(),
        content: text("content").notNull(),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_scm_studioId").on(table.studioId),
    ],
);

// ===========================
// Relations
// ===========================

export const studiosRelations = relations(studios, ({ one, many }) => ({
    user: one(users, {
        fields: [studios.userId],
        references: [users.id],
        relationName: "UserStudios",
    }),
    steps: many(studioSteps),
    quizzes: many(studioQuizzes),
    flashcardDecks: many(studioFlashcardDecks),
    codeBlocks: many(studioCodeBlocks),
    mediaBlocks: many(studioMediaBlocks),
    chatMessages: many(studioChatMessages),
}));

export const studioStepsRelations = relations(studioSteps, ({ one }) => ({
    studio: one(studios, {
        fields: [studioSteps.studioId],
        references: [studios.id],
    }),
}));

export const studioQuizzesRelations = relations(studioQuizzes, ({ one, many }) => ({
    studio: one(studios, {
        fields: [studioQuizzes.studioId],
        references: [studios.id],
    }),
    attempts: many(studioQuizAttempts),
}));

export const studioQuizAttemptsRelations = relations(studioQuizAttempts, ({ one }) => ({
    quiz: one(studioQuizzes, {
        fields: [studioQuizAttempts.quizId],
        references: [studioQuizzes.id],
    }),
    user: one(users, {
        fields: [studioQuizAttempts.userId],
        references: [users.id],
        relationName: "UserStudioQuizAttempts",
    }),
}));

export const studioFlashcardDecksRelations = relations(studioFlashcardDecks, ({ one, many }) => ({
    studio: one(studios, {
        fields: [studioFlashcardDecks.studioId],
        references: [studios.id],
    }),
    sessions: many(studioFlashcardSessions),
}));

export const studioFlashcardSessionsRelations = relations(studioFlashcardSessions, ({ one }) => ({
    deck: one(studioFlashcardDecks, {
        fields: [studioFlashcardSessions.deckId],
        references: [studioFlashcardDecks.id],
    }),
    user: one(users, {
        fields: [studioFlashcardSessions.userId],
        references: [users.id],
        relationName: "UserFlashcardSessions",
    }),
}));

export const studioCodeBlocksRelations = relations(studioCodeBlocks, ({ one }) => ({
    studio: one(studios, {
        fields: [studioCodeBlocks.studioId],
        references: [studios.id],
    }),
}));

export const studioMediaBlocksRelations = relations(studioMediaBlocks, ({ one }) => ({
    studio: one(studios, {
        fields: [studioMediaBlocks.studioId],
        references: [studios.id],
    }),
}));

export const studioChatMessagesRelations = relations(studioChatMessages, ({ one }) => ({
    studio: one(studios, {
        fields: [studioChatMessages.studioId],
        references: [studios.id],
    }),
}));
