import {
    pgTable,
    text,
    timestamp,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { users } from "./schema";

// ===========================
// projectV2Bookmark
// ===========================

export const projectV2Bookmark = pgTable(
    "ProjectV2Bookmark",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        // No .references() to avoid circular import with projects.ts
        projectId: text("projectId").notNull(),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        folder: text("folder").default("Saved"),
        notes: text("notes"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (t) => [
        uniqueIndex("projectV2Bookmark_projectId_userId_key").on(t.projectId, t.userId),
        index("projectV2Bookmark_projectId_idx").on(t.projectId),
        index("projectV2Bookmark_userId_idx").on(t.userId),
        index("projectV2Bookmark_folder_idx").on(t.folder),
    ]
);

export const projectV2BookmarkRelations = relations(projectV2Bookmark, ({ one }) => ({
    user: one(users, {
        fields: [projectV2Bookmark.userId],
        references: [users.id],
        relationName: "ProjectV2Bookmarks",
    }),
}));

// ===========================
// communityPostBookmark
// ===========================

export const communityPostBookmark = pgTable(
    "CommunityPostBookmark",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        // No .references() to avoid circular import with community posts table
        postId: text("postId").notNull(),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        folder: text("folder").default("Saved"),
        notes: text("notes"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (t) => [
        uniqueIndex("communityPostBookmark_postId_userId_key").on(t.postId, t.userId),
        index("communityPostBookmark_postId_idx").on(t.postId),
        index("communityPostBookmark_userId_idx").on(t.userId),
        index("communityPostBookmark_folder_idx").on(t.folder),
    ]
);

export const communityPostBookmarkRelations = relations(communityPostBookmark, ({ one }) => ({
    user: one(users, {
        fields: [communityPostBookmark.userId],
        references: [users.id],
        relationName: "CommunityPostBookmarks",
    }),
}));

// ===========================
// mockInterviewBookmark
// ===========================

export const mockInterviewBookmark = pgTable(
    "MockInterviewBookmark",
    {
        id: text("id").primaryKey().$defaultFn(() => createId()),
        // No .references() to avoid circular import with mock interview sessions table
        sessionId: text("sessionId").notNull(),
        userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
        folder: text("folder").default("Saved"),
        notes: text("notes"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        mockVoiceSessionId: text("mockVoiceSessionId"),
    },
    (t) => [
        uniqueIndex("mockInterviewBookmark_sessionId_userId_key").on(t.sessionId, t.userId),
        index("mockInterviewBookmark_sessionId_idx").on(t.sessionId),
        index("mockInterviewBookmark_userId_idx").on(t.userId),
        index("mockInterviewBookmark_folder_idx").on(t.folder),
    ]
);

export const mockInterviewBookmarkRelations = relations(mockInterviewBookmark, ({ one }) => ({
    user: one(users, {
        fields: [mockInterviewBookmark.userId],
        references: [users.id],
        relationName: "MockInterviewBookmarks",
    }),
}));
