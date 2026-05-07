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
import { users } from "./schema";

// ===========================
// Tables
// ===========================

export const backgroundJobs = pgTable(
    "BackgroundJob",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        jobId: text("jobId").notNull().unique(),
        status: text("status").notNull(),
        progress: integer("progress").notNull().default(0),
        input: jsonb("input").notNull(),
        result: jsonb("result"),
        error: text("error"),
        userId: text("userId").references(() => users.id),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_backgroundJob_jobId").on(table.jobId),
        index("idx_backgroundJob_status").on(table.status),
        index("idx_backgroundJob_userId").on(table.userId),
    ],
);

// ===========================
// Relations
// ===========================

export const backgroundJobsRelations = relations(backgroundJobs, ({ one }) => ({
    user: one(users, {
        fields: [backgroundJobs.userId],
        references: [users.id],
        relationName: "BackgroundJobs",
    }),
}));
