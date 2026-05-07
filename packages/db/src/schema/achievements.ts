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
    serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { users, xpTransactionPropsEnum } from "./schema.js";

// ===========================
// Enums
// ===========================

export const badgeCategoryEnum = pgEnum("BadgeCategory", [
    "PROJECTS",
    "ASSESSMENTS",
    "CHALLENGES",
    "MOCK_INTERVIEWS",
    "COMMUNITY",
    "CONCEPTS",
    "SPACES",
    "STUDIO",
    "OPENSOURCE",
    "PATHFINDER",
    "LAUNCHPADS",
    "COLLECTIVE",
    "PORTFOLIO",
    "CONSISTENCY",
    "SOCIAL",
    "MILESTONE",
    "SPECIAL",
]);

export const badgeRarityEnum = pgEnum("BadgeRarity", [
    "COMMON",
    "RARE",
    "EPIC",
    "LEGENDARY",
    "MYTHIC",
]);

export const achievementStatusEnum = pgEnum("AchievementStatus", [
    "LOCKED",
    "IN_PROGRESS",
    "READY_TO_CLAIM",
    "CLAIMED",
]);

export const socialProviderEnum = pgEnum("SocialProvider", [
    "TWITTER",
    "LINKEDIN",
]);

// ===========================
// Tables
// ===========================

export const badges = pgTable(
    "Badge",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        slug: text("slug").unique().notNull(),
        name: text("name").notNull(),
        description: text("description").notNull(),
        icon: text("icon").notNull(),
        color: text("color").notNull(),
        bgGradient: text("bgGradient"),
        category: badgeCategoryEnum("category").notNull(),
        rarity: badgeRarityEnum("rarity").notNull().default("COMMON"),
        requirements: jsonb("requirements").notNull(),
        xpReward: integer("xpReward").notNull().default(0),
        creditsReward: integer("creditsReward").notNull().default(0),
        order: integer("order").notNull().default(0),
        tier: integer("tier").notNull().default(1),
        isActive: boolean("isActive").notNull().default(true),
        isLimited: boolean("isLimited").notNull().default(false),
        expiresAt: timestamp("expiresAt"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_badge_category").on(table.category),
        index("idx_badge_rarity").on(table.rarity),
        index("idx_badge_isActive").on(table.isActive),
    ],
);

export const userBadges = pgTable(
    "UserBadge",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        badgeId: text("badgeId")
            .notNull()
            .references(() => badges.id, { onDelete: "cascade" }),
        status: achievementStatusEnum("status").notNull().default("LOCKED"),
        progress: jsonb("progress"),
        progressPercent: integer("progressPercent").notNull().default(0),
        unlockedAt: timestamp("unlockedAt"),
        completedAt: timestamp("completedAt"),
        claimedAt: timestamp("claimedAt"),
        sharedToTwitter: boolean("sharedToTwitter").notNull().default(false),
        sharedToLinkedIn: boolean("sharedToLinkedIn").notNull().default(false),
        shareCount: integer("shareCount").notNull().default(0),
        isPinned: boolean("isPinned").notNull().default(false),
        displayOrder: integer("displayOrder").notNull().default(0),
    },
    (table) => [
        uniqueIndex("uq_userBadge_userId_badgeId").on(table.userId, table.badgeId),
        index("idx_userBadge_userId").on(table.userId),
        index("idx_userBadge_badgeId").on(table.badgeId),
        index("idx_userBadge_status").on(table.status),
        index("idx_userBadge_claimedAt").on(table.claimedAt),
    ],
);

export const levels = pgTable(
    "Level",
    {
        id: serial("id").primaryKey(),
        level: integer("level").unique().notNull(),
        title: text("title").notNull(),
        description: text("description"),
        icon: text("icon"),
        color: text("color"),
        xpRequired: integer("xpRequired").notNull(),
        xpReward: integer("xpReward").notNull().default(0),
        creditsReward: integer("creditsReward").notNull().default(0),
        perks: jsonb("perks"),
        isActive: boolean("isActive").notNull().default(true),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_level_level").on(table.level),
    ],
);

export const userLevelProgress = pgTable(
    "UserLevelProgress",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        level: integer("level")
            .notNull()
            .references(() => levels.level, { onDelete: "cascade" }),
        xpEarned: integer("xpEarned").notNull().default(0),
        creditsEarned: integer("creditsEarned").notNull().default(0),
        achievedAt: timestamp("achievedAt").notNull().defaultNow(),
        sharedToSocial: boolean("sharedToSocial").notNull().default(false),
    },
    (table) => [
        uniqueIndex("uq_userLevelProgress_userId_level").on(table.userId, table.level),
        index("idx_userLevelProgress_userId").on(table.userId),
        index("idx_userLevelProgress_level").on(table.level),
    ],
);

export const xpTransactions = pgTable(
    "XpTransaction",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .references(() => users.id),
        amount: integer("amount").notNull(),
        description: text("description").notNull(),
        type: xpTransactionPropsEnum("type").notNull().default("REWARD"),
        source: text("source"),
        sourceId: text("sourceId"),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_xpTransaction_userId").on(table.userId),
        index("idx_xpTransaction_createdAt").on(table.createdAt),
        index("idx_xpTransaction_type").on(table.type),
    ],
);

export const socialConnections = pgTable(
    "SocialConnection",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        provider: socialProviderEnum("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        accessToken: text("accessToken").notNull(),
        refreshToken: text("refreshToken"),
        tokenExpiresAt: timestamp("tokenExpiresAt"),
        accountName: text("accountName"),
        accountHandle: text("accountHandle"),
        accountImage: text("accountImage"),
        isActive: boolean("isActive").notNull().default(true),
        lastUsedAt: timestamp("lastUsedAt"),
        connectedAt: timestamp("connectedAt").notNull().defaultNow(),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex("uq_socialConnection_userId_provider").on(table.userId, table.provider),
        index("idx_socialConnection_userId").on(table.userId),
        index("idx_socialConnection_provider").on(table.provider),
    ],
);

export const socialShares = pgTable(
    "SocialShare",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        provider: socialProviderEnum("provider").notNull(),
        shareType: text("shareType").notNull(),
        referenceId: text("referenceId"),
        content: text("content").notNull(),
        externalPostId: text("externalPostId"),
        externalUrl: text("externalUrl"),
        wasSuccessful: boolean("wasSuccessful").notNull().default(true),
        errorMessage: text("errorMessage"),
        sharedAt: timestamp("sharedAt").notNull().defaultNow(),
    },
    (table) => [
        index("idx_socialShare_userId").on(table.userId),
        index("idx_socialShare_provider").on(table.provider),
        index("idx_socialShare_shareType").on(table.shareType),
        index("idx_socialShare_sharedAt").on(table.sharedAt),
    ],
);

export const achievementNotifications = pgTable(
    "AchievementNotification",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").notNull(),
        title: text("title").notNull(),
        message: text("message").notNull(),
        referenceType: text("referenceType"),
        referenceId: text("referenceId"),
        icon: text("icon"),
        color: text("color"),
        isRead: boolean("isRead").notNull().default(false),
        isDismissed: boolean("isDismissed").notNull().default(false),
        createdAt: timestamp("createdAt").notNull().defaultNow(),
        readAt: timestamp("readAt"),
    },
    (table) => [
        index("idx_achievementNotification_userId").on(table.userId),
        index("idx_achievementNotification_isRead").on(table.isRead),
        index("idx_achievementNotification_createdAt").on(table.createdAt),
    ],
);

export const userAchievementStats = pgTable(
    "UserAchievementStats",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),
        userId: text("userId")
            .unique()
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        commonBadges: integer("commonBadges").notNull().default(0),
        rareBadges: integer("rareBadges").notNull().default(0),
        epicBadges: integer("epicBadges").notNull().default(0),
        legendaryBadges: integer("legendaryBadges").notNull().default(0),
        mythicBadges: integer("mythicBadges").notNull().default(0),
        totalBadges: integer("totalBadges").notNull().default(0),
        badgesInProgress: integer("badgesInProgress").notNull().default(0),
        badgesReadyToClaim: integer("badgesReadyToClaim").notNull().default(0),
        totalXpFromBadges: integer("totalXpFromBadges").notNull().default(0),
        totalCreditsFromBadges: integer("totalCreditsFromBadges").notNull().default(0),
        totalShares: integer("totalShares").notNull().default(0),
        updatedAt: timestamp("updatedAt")
            .notNull()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index("idx_userAchievementStats_userId").on(table.userId),
    ],
);

// ===========================
// Relations
// ===========================

export const badgesRelations = relations(badges, ({ many }) => ({
    userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
    user: one(users, {
        fields: [userBadges.userId],
        references: [users.id],
    }),
    badge: one(badges, {
        fields: [userBadges.badgeId],
        references: [badges.id],
    }),
}));

export const levelsRelations = relations(levels, ({ many }) => ({
    userProgress: many(userLevelProgress),
}));

export const userLevelProgressRelations = relations(userLevelProgress, ({ one }) => ({
    user: one(users, {
        fields: [userLevelProgress.userId],
        references: [users.id],
    }),
    levelInfo: one(levels, {
        fields: [userLevelProgress.level],
        references: [levels.level],
    }),
}));

export const xpTransactionsRelations = relations(xpTransactions, ({ one }) => ({
    user: one(users, {
        fields: [xpTransactions.userId],
        references: [users.id],
    }),
}));

export const socialConnectionsRelations = relations(socialConnections, ({ one }) => ({
    user: one(users, {
        fields: [socialConnections.userId],
        references: [users.id],
    }),
}));

export const socialSharesRelations = relations(socialShares, ({ one }) => ({
    user: one(users, {
        fields: [socialShares.userId],
        references: [users.id],
    }),
}));

export const achievementNotificationsRelations = relations(achievementNotifications, ({ one }) => ({
    user: one(users, {
        fields: [achievementNotifications.userId],
        references: [users.id],
    }),
}));

export const userAchievementStatsRelations = relations(userAchievementStats, ({ one }) => ({
    user: one(users, {
        fields: [userAchievementStats.userId],
        references: [users.id],
    }),
}));
