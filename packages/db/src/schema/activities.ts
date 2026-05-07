import {
    pgTable,
    text,
    integer,
    boolean,
    timestamp,
    jsonb,
    index,
    uniqueIndex,
    date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { users, activityTypeEnum } from "./schema.js";

// ===========================
// Tables
// ===========================

export const dailyActivities = pgTable(
    "DailyActivity",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .references(() => users.id),
        date: date("date").unique().notNull(),
        hasActivity: boolean("hasActivity").notNull().default(false),
        totalXpEarned: integer("totalXpEarned").notNull().default(0),
        totalCreditsEarned: integer("totalCreditsEarned").notNull().default(0),
        totalTimeSpent: integer("totalTimeSpent").notNull().default(0),
        activitiesCount: integer("activitiesCount").notNull().default(0),
        isStreakDay: boolean("isStreakDay").notNull().default(false),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("uq_dailyActivity_userId_date").on(table.userId, table.date),
        index("idx_dailyActivity_userId").on(table.userId),
        index("idx_dailyActivity_date").on(table.date),
        index("idx_dailyActivity_userId_date").on(table.userId, table.date),
        index("idx_dailyActivity_isStreakDay").on(table.isStreakDay),
    ],
);

export const activityEntries = pgTable(
    "ActivityEntry",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        dailyActivityId: text("dailyActivityId")
            .notNull()
            .references(() => dailyActivities.id, { onDelete: "cascade" }),
        activityType: activityTypeEnum("activityType").notNull(),
        title: text("title").notNull(),
        description: text("description"),
        xpEarned: integer("xpEarned").notNull().default(0),
        creditsEarned: integer("creditsEarned").notNull().default(0),
        timeSpent: integer("timeSpent").notNull().default(0),
        metadata: jsonb("metadata"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_activityEntry_userId").on(table.userId),
        index("idx_activityEntry_dailyActivityId").on(table.dailyActivityId),
        index("idx_activityEntry_activityType").on(table.activityType),
        index("idx_activityEntry_userId_createdAt").on(table.userId, table.createdAt),
    ],
);

export const userStats = pgTable(
    "UserStats",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .unique()
            .notNull()
            .references(() => users.id),
        currentStreak: integer("currentStreak").notNull().default(0),
        longestStreak: integer("longestStreak").notNull().default(0),
        totalSpeakingTime: integer("totalSpeakingTime").notNull().default(0),
        weeklyTalkingTime: integer("weeklyTalkingTime").notNull().default(0),
        totalConversations: integer("totalConversations").notNull().default(0),
        weeklyConversations: integer("weeklyConversations").notNull().default(0),
        lastActivityDate: timestamp("lastActivityDate"),
        weekStartDate: timestamp("weekStartDate").notNull().defaultNow(),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_userStats_userId").on(table.userId),
    ],
);

export const streakRewards = pgTable(
    "StreakReward",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .references(() => users.id),
        streakDays: integer("streakDays").notNull(),
        creditsAwarded: integer("creditsAwarded").notNull(),
        awardedAt: timestamp("awardedAt").notNull().defaultNow(),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex("uq_streakReward_userId_streakDays").on(table.userId, table.streakDays),
        index("idx_streakReward_userId").on(table.userId),
    ],
);

export const userAchievements = pgTable(
    "UserAchievement",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .references(() => users.id),
        achievementType: text("achievementType").notNull(),
        title: text("title").notNull(),
        description: text("description").notNull(),
        badgeIcon: text("badgeIcon").notNull(),
        badgeColor: text("badgeColor").notNull(),
        creditsAwarded: integer("creditsAwarded").notNull().default(0),
        unlockedAt: timestamp("unlockedAt").notNull().defaultNow(),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_userAchievement_userId").on(table.userId),
        index("idx_userAchievement_achievementType").on(table.achievementType),
    ],
);

// ===========================
// Relations
// ===========================

export const dailyActivitiesRelations = relations(dailyActivities, ({ one, many }) => ({
    user: one(users, {
        fields: [dailyActivities.userId],
        references: [users.id],
    }),
    activities: many(activityEntries),
}));

export const activityEntriesRelations = relations(activityEntries, ({ one }) => ({
    user: one(users, {
        fields: [activityEntries.userId],
        references: [users.id],
    }),
    dailyActivity: one(dailyActivities, {
        fields: [activityEntries.dailyActivityId],
        references: [dailyActivities.id],
    }),
}));

export const userStatsRelations = relations(userStats, ({ one }) => ({
    user: one(users, {
        fields: [userStats.userId],
        references: [users.id],
    }),
}));

export const streakRewardsRelations = relations(streakRewards, ({ one }) => ({
    user: one(users, {
        fields: [streakRewards.userId],
        references: [users.id],
    }),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
    user: one(users, {
        fields: [userAchievements.userId],
        references: [users.id],
    }),
}));
