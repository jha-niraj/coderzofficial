import {
    pgTable,
    text,
    integer,
    timestamp,
    jsonb,
    index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./schema.js";

// ===========================
// codebaseProject
// ===========================

export const codebaseProject = pgTable(
    "CodebaseProject",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        slug: text("slug").notNull().unique(),
        description: text("description"),
        sourceType: text("sourceType").notNull(),
        sourceUrl: text("sourceUrl"),
        repoOwner: text("repoOwner"),
        repoName: text("repoName"),
        branch: text("branch").default("main"),
        fileCount: integer("fileCount"),
        totalLines: integer("totalLines"),
        detectedStack: jsonb("detectedStack"),
        fileTree: jsonb("fileTree"),
        indexStatus: text("indexStatus").notNull().default("pending"),
        errorMessage: text("errorMessage"),
        indexedAt: timestamp("indexedAt"),
        optimizedAt: timestamp("optimizedAt"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().defaultNow().$onUpdateFn(() => new Date()),
    },
    (t) => [
        index("codebaseProject_userId_idx").on(t.userId),
        index("codebaseProject_slug_idx").on(t.slug),
    ]
);

export const codebaseProjectRelations = relations(codebaseProject, ({ one, many }) => ({
    user: one(users, {
        fields: [codebaseProject.userId],
        references: [users.id],
        relationName: "UserCodebaseProjects",
    }),
    files: many(codebaseFile),
    askSessions: many(codebaseAskSession),
    optimizationIssues: many(codebaseOptimizationIssue),
    interviews: many(codebaseInterview),
}));

// ===========================
// codebaseFile
// ===========================

export const codebaseFile = pgTable(
    "CodebaseFile",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        projectId: text("projectId").notNull().references(() => codebaseProject.id, { onDelete: "cascade" }),
        filePath: text("filePath").notNull(),
        fileName: text("fileName").notNull(),
        extension: text("extension").notNull(),
        content: text("content").notNull(),
        lineCount: integer("lineCount").notNull().default(0),
        sizeBytes: integer("sizeBytes").notNull().default(0),
        language: text("language"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (t) => [
        index("codebaseFile_projectId_idx").on(t.projectId),
        index("codebaseFile_filePath_idx").on(t.filePath),
    ]
);

export const codebaseFileRelations = relations(codebaseFile, ({ one }) => ({
    project: one(codebaseProject, {
        fields: [codebaseFile.projectId],
        references: [codebaseProject.id],
    }),
}));

// ===========================
// codebaseAskSession
// ===========================

export const codebaseAskSession = pgTable(
    "CodebaseAskSession",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        projectId: text("projectId").notNull().references(() => codebaseProject.id, { onDelete: "cascade" }),
        userId: text("userId").notNull(),
        title: text("title"),
        messages: jsonb("messages").notNull().default("[]"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt").notNull().defaultNow().$onUpdateFn(() => new Date()),
    },
    (t) => [
        index("codebaseAskSession_projectId_idx").on(t.projectId),
        index("codebaseAskSession_userId_idx").on(t.userId),
    ]
);

export const codebaseAskSessionRelations = relations(codebaseAskSession, ({ one }) => ({
    project: one(codebaseProject, {
        fields: [codebaseAskSession.projectId],
        references: [codebaseProject.id],
    }),
}));

// ===========================
// codebaseOptimizationIssue
// ===========================

export const codebaseOptimizationIssue = pgTable(
    "CodebaseOptimizationIssue",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        projectId: text("projectId").notNull().references(() => codebaseProject.id, { onDelete: "cascade" }),
        category: text("category").notNull(),
        severity: text("severity").notNull(),
        title: text("title").notNull(),
        filePath: text("filePath"),
        lineStart: integer("lineStart"),
        lineEnd: integer("lineEnd"),
        description: text("description").notNull(),
        currentCode: text("currentCode"),
        fixedCode: text("fixedCode"),
        explanation: text("explanation"),
        effortLevel: text("effortLevel").notNull().default("medium"),
        status: text("status").notNull().default("open"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (t) => [
        index("codebaseOptimizationIssue_projectId_idx").on(t.projectId),
        index("codebaseOptimizationIssue_status_idx").on(t.status),
    ]
);

export const codebaseOptimizationIssueRelations = relations(codebaseOptimizationIssue, ({ one }) => ({
    project: one(codebaseProject, {
        fields: [codebaseOptimizationIssue.projectId],
        references: [codebaseProject.id],
    }),
}));

// ===========================
// codebaseInterview
// ===========================

export const codebaseInterview = pgTable(
    "CodebaseInterview",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        projectId: text("projectId").notNull().references(() => codebaseProject.id, { onDelete: "cascade" }),
        userId: text("userId").notNull(),
        mode: text("mode").notNull(),
        difficulty: text("difficulty").notNull().default("mid"),
        focusArea: text("focusArea"),
        score: integer("score"),
        status: text("status").notNull().default("setup"),
        questions: jsonb("questions").notNull().default("[]"),
        completedAt: timestamp("completedAt"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (t) => [
        index("codebaseInterview_projectId_idx").on(t.projectId),
        index("codebaseInterview_userId_idx").on(t.userId),
    ]
);

export const codebaseInterviewRelations = relations(codebaseInterview, ({ one }) => ({
    project: one(codebaseProject, {
        fields: [codebaseInterview.projectId],
        references: [codebaseProject.id],
    }),
}));
